# OutboundSync API v1 + MCP map (api skill)

The pack's single reference for OutboundSync API v1 and the hosted MCP (v0.4.0). `preflight` and `sync-monitoring` keep a trimmed copy of the rows they use; `npm run validate` (`endpoint-map-consistent`) keeps those copies matching this file.

- REST base: `https://app.outboundsync.com/api/v1` · `Authorization: Bearer $OUTBOUNDSYNC_API_KEY`
- MCP: `https://mcp.outboundsync.com/mcp` (streamable HTTP, same Bearer key) · setup https://outboundsync.com/docs/mcp/setup/
- Reference: https://outboundsync.com/docs/api/v1/ · OpenAPI 3.1 (auth-free): `GET /openapi.json`, `GET /openapi.yaml`

The served OpenAPI is authoritative and matches the MCP tools one to one. Never print, log, or commit the key.

## Calling conventions

| Concern | Rule |
| --- | --- |
| Date ranges | Observability lists and `*_metrics` require `from` and `to` as full ISO-8601 timestamps (`2026-09-01T00:00:00Z`), at most 31 days apart. Resolve "last 7 days" into timestamps yourself; split longer windows into ≤31-day chunks. |
| Pagination | Cursor pages `{ data, hasMore, nextCursor }`, newest first. Loop on `hasMore` / `nextCursor` — **never** on page length (status filters can return a short page with `hasMore: true`). Observability lists: default 100, max 500. `/events` and `/webhooks/:id/deliveries`: default 25, max 100. |
| Not paginated | `/sources`, `/connections`, `/destinations`, `/destinations/reply-relays`, `/blocklists`, `/webhooks` return the full list in a named wrapper (`{ sources: [...] }`). |
| Rate limits | 120 requests / 60s per account (plus a per-IP limit before auth); `/contacts/outreach` has its own 600 / 60s bucket. Every response carries `X-RateLimit-Limit` / `-Remaining` / `-Reset` — slow loops before `Remaining` hits 0. On `429`, wait `Retry-After` seconds. |
| Metrics | `*_metrics` return counts only and take no `cursor`, `limit`, or `status`. Use the matching list call for records. |
| Ids | Webhooks, events, and platform deliveries use string ids (`oswhk_…`, `osevt_…`, `oswhd_…`); everything else is an integer. |

## Errors — and when a result is UNVERIFIED

| Surface | Shape |
| --- | --- |
| REST | `{ statusCode, message, error }`. `message` is usually a string but can be an **array** of validation messages on `400` — join them. |
| MCP | `isError: true` with text `{ "error": { code, message, status?, retryAfterSeconds?, remediation? } }` and no `structuredContent`. Branch on `status` (the upstream HTTP status) when present; codes: `auth_required`, `unauthorized`, `forbidden`, `rate_limited`, `upstream_error`, `internal_error`, and on newer servers `bad_request` (400/422), `not_found` (404), `timeout`. Treat an unknown code by its `status`; `remediation`, when present, is the fix to relay. |

Render these as **`· UNVERIFIED — <reason>`** (include the status code), never as an empty result, `found: false`, or `0`:

- any `401` / `403` / `5xx`, a timeout, or MCP `isError`
- a `200` whose body is not JSON — unknown `/api/v1/*` paths currently return the dashboard's HTML with `200`, which means **the route is not shipped**; do not retry or invent it
- `/contacts/outreach` in particular can take up to 30s and time out — a timeout is UNVERIFIED, not "not contacted"

`403` messages to relay verbatim: missing `write` scope · "Webhook endpoint management requires an account-scoped API key" · "Platform webhooks are not enabled for this account" (`canUseWebhooks` off — also blocks **reads** of `/webhooks*` and `/events`) · "Block lists are not enabled for this connection".

## REST ↔ MCP tools

`R` = read (any key with `read`). `W` = needs the `write` scope — **never** from `api`; see the Owner column. `A` = needs an **account-scoped** key **and** `canUseWebhooks` on the account. `H` = needs `canUseWebhooks`, any key scope.

| REST | MCP tool | Access | Owner / notes |
| --- | --- | --- | --- |
| `GET /me` | `get_me` | R | Identity, `apiKey{name, scopes[], connectionScope: account\|connection, connectionId}`, `connections[]`, `links`. Call first. No capability flags. |
| `GET /account/status` | `get_account_status` | R | Readiness; see enums below. |
| `GET /account/metrics` | `get_account_metrics` | R | `{ from, to, requests{count}, syncs{success, warning, error}, destinationDeliveries{success, error, http2xx} }`; optional `connectionId`, `sourceId` (filters requests + syncs only). Can take ~10s. |
| `GET /connections` | `list_connections` | R | OAuth `status`, `organizationDomain`, `organizationId`, `capabilities{sync, destinations, blocklists}`. |
| `GET /sources` | `list_sources` | R | `{ sources: [{ id, url, platform, connectionId, crm, config, destinations[], replyRelay, createdAt }] }`. Not paginated. |
| `GET /contacts/outreach` | `get_contact_outreach` | R | See [contacts-outreach.md](contacts-outreach.md). |
| `GET /requests` | `list_requests` | R | Inbound receipts; `sourceId?`. |
| `GET /requests/metrics` | `get_requests_metrics` | R | `{ count }`; `sourceId?`. |
| `GET /sources/:sourceId/requests` | `list_source_requests` | R | `/requests` for one source. |
| `GET /syncs` | `list_syncs` | R | CRM sync attempts; `status?` (`success`\|`warning`\|`error`), `sourceId?`, `connectionId?`. |
| `GET /syncs/metrics` | `get_syncs_metrics` | R | `{ success, warning, error }`; `sourceId?`, `connectionId?`. An inaccessible `connectionId` returns zeros, not 404. |
| `GET /syncs/:id` | `get_sync` | R | One sync (no date range). |
| `GET /sources/:sourceId/syncs` | `list_source_syncs` | R | `/syncs` for one source. |
| `POST /syncs/:id/retry` | `retry_sync` | W | Not this skill. Error-status HubSpot/Salesforce syncs only; connection-scoped keys allowed. Returns `{ queued, syncId }`. |
| `GET /destinations` | `list_destinations` | R | Forwarding catalog. Entries with `sourceIds: []` are **unbound** — they forward nothing. |
| `GET /destinations/:id` | `get_destination` | R | One forwarding destination. |
| `GET /destinations/:id/deliveries` | `list_destination_deliveries` | R | Forwarding attempts; `status?` (`success`\|`error`). |
| `GET /destinations/:id/deliveries/metrics` | `get_destination_delivery_metrics` | R | `{ success, error, http2xx }`. |
| `POST /destinations/:id/deliveries/:deliveryId/replay` | `replay_destination_delivery` | W | Not this skill. Connection-scoped keys allowed. Returns `{ queued, destinationId, payloadId }`. |
| `GET /deliveries` | `list_deliveries` | R | Account-wide forwarding deliveries; `destinationId?`. |
| `GET /destinations/reply-relays` | `list_reply_relays` | R | `{ replyRelays: [{ id, connectionId, description, ccEmail, delayMinutes, sourceIds[], … }] }`. |
| `GET /blocklists` | `list_blocklists` | R | CRM→SEP blocklist sync configs; `connectionId?` (outside access → empty list, not 404). |
| `POST /blocklists/:id/pause` | `pause_blocklist` | W | Not this skill. Idempotent (already paused → 200). Returns `{ id, isEnabled, status }`. |
| `POST /blocklists/:id/resync` | `resync_blocklist` | W | Not this skill. Full CRM reload (enqueue). `409` while `FETCHING`/`SYNCING`. Returns `{ id, queued, isEnabled, status }`. |
| `GET /webhooks` | `list_webhooks` | R · A | Sync Monitoring endpoints → `sync-monitoring`. |
| `GET /webhooks/:id` | `get_webhook` | R · A | → `sync-monitoring`. |
| `POST /webhooks` | `create_webhook` | W · A | → `sync-monitoring`. Returns `secret` once. |
| `PATCH /webhooks/:id` | `update_webhook` | W · A | → `sync-monitoring`. |
| `DELETE /webhooks/:id` | `delete_webhook` | W · A | → `sync-monitoring`. Soft-delete; `204`. |
| `POST /webhooks/:id/rotate-secret` | `rotate_webhook_secret` | W · A | → `sync-monitoring`. New `secret` once; old one stops working. |
| `POST /webhooks/:id/test` | `test_webhook` | W · A | → `sync-monitoring`. `202 { eventId }`; `502` if it could not be queued. |
| `GET /webhooks/:id/deliveries` | `list_webhook_deliveries` | R · A | → `sync-monitoring`. `status?` (`PENDING`\|`SUCCEEDED`\|`FAILED`\|`DEAD`). |
| `POST /webhooks/:id/deliveries/:deliveryId/replay` | `replay_webhook_delivery` | W · A | → `sync-monitoring`. |
| `GET /events` | `list_events` | R · H | → `sync-monitoring`. `type?`, `delivered?`. Any key scope; a connection-scoped key sees its connection's events plus account-level events. |
| `GET /events/:id` | `get_event` | R · H | → `sync-monitoring`. Event plus `deliveries[]`. |

Also: `GET /health/live`, `GET /health/ready` (host root, not `/api/v1`) → `{ schema_version: 3, status, checks{…} }`.

Not shipped — do not call or invent: `GET`/`DELETE /blocklists/:id/entries`, `POST /sources`, `POST /connections/:id/test`, destination create/update, `GET /accounts/outreach`, usage/limits under `/account/*`.

## `/account/status` enums

| Field | Values |
| --- | --- |
| `blockers[].code` | `crm_disconnected` · `sync_not_enabled` · `no_sources` — gate `ready` |
| `warnings[].code` | `destinations_not_configured` · `blocklists_not_configured` · `blocklists_error` — never gate `ready` |
| `crmConnection.status` | `ready` · `disconnected` |
| `sources.status` | `ready` · `not_configured` · `disabled` (+ `count`, `platforms[]`) |
| `destinations.status` | `ready` · `not_configured` · `disabled` (+ `count`, `eventTypes[]`, `forwardingCount`, `replyRelayCount`) — **no `error` value** |
| `blocklists.status` | `ready` · `not_configured` · `disabled` · `error` (+ `enabledCount`, `lastError`, `lastFetchedAt`) |

`disabled` = the plan does not include the feature → say "disabled on plan", never suggest fixing it. `not_configured` = on the plan, nothing set up → advisory. Every blocker and warning carries `message`, `remediation`, and `docUrl` — relay them rather than inventing steps. `checkedAt` says how fresh the answer is.

## Blocklists

Each item: `id`, `connectionId`, `listName`, `crm`, `platform`, `blockType` (`ADDRESS`\|`DOMAIN`), `status` (`CREATED`\|`FETCHING`\|`SYNCING`\|`SYNCED`\|`SYNCING_NEW_CONTACTS`), `isEnabled`, `syncedCount`, `pendingCount`, `lastFetchedAt`, `lastError`, `lastAttemptedAt`, `createdAt`.

SEP push is **additive**: pause/resync change OutboundSync's pipeline only and never clear Instantly / Smartlead / etc. The verb is **resync**, never "rebuild". `lastError` may carry vendor text — summarize it; dump it only when debugging that list.

## Sensitive fields

| Field | Print? |
| --- | --- |
| API key / Bearer token | Never |
| Webhook `secret` (`oswhsec_…`) | Only in the single create/rotate response, with a store-now instruction; never re-echo |
| `sources[].url`, `destinations[].url`, delivery `destinationUrl` | Only as a full paste under a `Next` step that needs it |
| `replyRelays[].ccEmail`, `syncs[].toEmail` | Personal data — summarize or redact unless the user asked for that record |
| Capabilities, config booleans, CRM names, statuses, counts, blocker codes | Safe |
