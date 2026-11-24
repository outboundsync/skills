# OutboundSync API v1 + MCP map (api skill)

The pack's single reference for OutboundSync API v1 and the hosted MCP. `preflight` and `sync-monitoring` keep a trimmed copy of the rows they use; `npm run validate` (`endpoint-map-consistent`) keeps those copies matching this file.

- REST base: `https://app.outboundsync.com/api/v1` · `Authorization: Bearer $OUTBOUNDSYNC_API_KEY`
- MCP: `https://mcp.outboundsync.com/mcp` (streamable HTTP, same Bearer key) · setup https://outboundsync.com/docs/mcp/setup/
- Reference: https://outboundsync.com/docs/api/v1/ · OpenAPI 3.1 (auth-free): `GET /openapi.json`, `GET /openapi.yaml`

The served OpenAPI is authoritative and matches the MCP tools one to one. Never print, log, or commit the key.

## Calling conventions

| Concern | Rule |
| --- | --- |
| Date ranges | Observability lists and `*_metrics` require `from` and `to` as full ISO-8601 timestamps (`2026-09-01T00:00:00Z`), at most 31 days apart. Resolve "last 7 days" into timestamps yourself; split longer windows into ≤31-day chunks. |
| Pagination | Cursor pages `{ data, hasMore, nextCursor }`, newest first. Loop on `hasMore` / `nextCursor` — **never** on page length (status filters can return a short page with `hasMore: true`). Observability lists: default 100, max 500. `/events` and `/webhooks/:id/deliveries`: default 25, max 100. |
| Not paginated | `/sources`, `/connections`, `/destinations`, `/destinations/reply-relays`, `/blocklists`, `/webhooks`, `/workspace/domains`, `/workspace/members`, and `/workspace/invitations` return the full list in a named wrapper (`{ sources: [...] }`, `{ domains: [...] }`, `{ members: [...] }`, `{ invitations: [...] }`). |
| Rate limits | 120 requests / 60s per account, sliding window (plus a per-IP limit before auth); `/contacts/outreach` has its own 600 / 60s fixed-window bucket. Authenticated responses on the general routes carry `X-RateLimit-Limit` / `-Remaining` / `-Reset` (`Reset` = seconds until the next slot frees up) — slow loops before `Remaining` hits 0. The headers are absent on `/contacts/outreach`, the per-IP `429`, and `401`/`403`, so treat them as optional. On `429`, wait `Retry-After` seconds; rejected calls still count toward the window. |
| Metrics | `*_metrics` return counts only and take no `cursor`, `limit`, or `status`. Use the matching list call for records. |
| Ids | Webhooks, events, and platform deliveries use string ids (`oswhk_…`, `osevt_…`, `oswhd_…`). Workspace ids are `ws_` plus 20 base62 characters; invitation ids are `wsi_…`. Connection, source, sync, destination, and blocklist ids are integers. |

## Errors — and when a result is UNVERIFIED

| Surface | Shape |
| --- | --- |
| REST | Every error is JSON. Outside `/workspace*`, the body is `{ statusCode, message, error }`. `message` is usually a string but can be an **array** of validation messages on `400` — join them. An unknown or unshipped path returns `404` `"Cannot GET /api/v1/…"`. `/workspace*` errors are `{ code, permission?, status? }` (`permission` with `FORBIDDEN`, `status` with `INVITATION_NOT_PENDING`). Some workspace `403`s and the invitation `429` are either that body or the standard one. A heavy read past the 20s query limit returns `504` (`error: "Gateway Timeout"`); the query is cancelled and nothing is written. |
| MCP | `isError: true` with text `{ "error": { code, message, status?, retryAfterSeconds?, remediation? } }` and no `structuredContent`. Branch on `status` (the upstream HTTP status) when present; codes: `auth_required`, `unauthorized`, `forbidden`, `rate_limited`, `upstream_error`, `internal_error`, and on newer servers `bad_request` (400/422), `not_found` (404), `timeout`. `timeout` means the MCP's own 30s client limit fired; an API `504` arrives as `upstream_error` with `status: 504` and is not retried by the MCP (it retries other `5xx` reads once) — narrow the window before calling again. Treat an unknown code by its `status`; `remediation`, when present, is the fix to relay. |

Render these as **`· UNVERIFIED — <reason>`** (include the status code), never as an empty result, `found: false`, or `0`:

- any `401` / `403` / `5xx`, a timeout, or MCP `isError` — except a workspace `403` `FORBIDDEN` or `409` `WORKSPACE_REQUIRED`, which is the workspace answer (see below), not an empty list
- a response whose body is not JSON — the hosting layer can answer before the API during a deploy or incident; retry with backoff, and report UNVERIFIED until it succeeds
- a `504` from the 20s query limit on `/contacts/outreach`, `/account/metrics`, `/syncs`, `/syncs/metrics`, `/sources/:sourceId/syncs`, `/requests/metrics`, or `/destinations/:id/deliveries/metrics` — narrow `from`/`to` or pass `connectionId`, or retry shortly. A `504` on `/contacts/outreach` is UNVERIFIED, not "not contacted"

A `404` `"Cannot GET …"` on a path you expected means **the route is not shipped** — do not retry or invent it. A `404` on a workspace route is `WorkspaceError` (`WORKSPACE_NOT_FOUND`, `DOMAIN_NOT_FOUND`, `INVITATION_NOT_FOUND`, or `MEMBER_NOT_FOUND`) — the route exists.

`403` messages to relay verbatim: missing `write` scope · "Webhook endpoint management requires an account-scoped API key" · "Platform webhooks are not enabled for this account" (`canUseWebhooks` off — also blocks **reads** of `/webhooks*` and `/events`) · "Block lists are not enabled for this connection". On `/workspace*`, relay `code` and `permission` instead of expecting those sentences. Missing API access on `GET /workspace` still uses the standard error body.

## REST ↔ MCP tools

`R` = read (any key with `read`). `W` = needs the `write` scope — **never** from `api`; see the Owner column. `A` = needs an **account-scoped** key **and** `canUseWebhooks` on the account. `H` = needs `canUseWebhooks`, any key scope.

| REST | MCP tool | Access | Owner / notes |
| --- | --- | --- | --- |
| `GET /me` | `get_me` | R | Identity, `apiKey{name, scopes[], connectionScope: account\|connection, connectionId}`, `connections[]`, `workspace` (`{ id, name, role }` or null; `links.workspace` only when it is not null), `links`. Call first. No capability flags; `permissions[]` are on `GET /workspace`. |
| `GET /account/status` | `get_account_status` | R | Readiness; see enums below. |
| `GET /setup` | `get_setup_status` | R | Wizard snapshot per connection and source: `test.status`, `sepInbound.lastReceivedAt` (first live SEP event; refreshed at most hourly, not a heartbeat), `steps[]`. `syncEntitled` is plan entitlement (`canSync`) only, not pause state — whether a connection can live-sync now is `/account/status`. |
| `GET /account/metrics` | `get_account_metrics` | R | `{ from, to, requests{count}, syncs{success, warning, error}, destinationDeliveries{success, error, http2xx} }`; optional `connectionId`, `sourceId` (filters requests + syncs only). Heaviest read; can return `504` (20s query limit). |
| `GET /connections` | `list_connections` | R | OAuth `status`, `organizationDomain`, `organizationId`, `capabilities{sync, destinations, blocklists}`. |
| `GET /sources` | `list_sources` | R | `{ sources: [{ id, url, platform, connectionId, crm, config, destinations[], replyRelay, createdAt }] }`. Not paginated. |
| `GET /contacts/outreach` | `get_contact_outreach` | R | See [contacts-outreach.md](contacts-outreach.md). |
| `GET /requests` | `list_requests` | R | Inbound receipts; `sourceId?`. |
| `GET /requests/metrics` | `get_requests_metrics` | R | `{ count }`; `sourceId?`. Can return `504` (20s query limit). |
| `GET /sources/:sourceId/requests` | `list_source_requests` | R | `/requests` for one source. |
| `GET /syncs` | `list_syncs` | R | CRM sync attempts; `status?` (`success`\|`warning`\|`error`), `sourceId?`, `connectionId?`. Each row has `notes[]` (`{ code, message }`, `[]` when none; informational, never changes `status`), e.g. `FREE_EMAIL_DOMAIN_COMPANY_SKIPPED`, `FREE_EMAIL_DOMAIN_MATCHED_BY_NAME`, `FREE_EMAIL_DOMAIN_MATCHED_BY_WEBSITE`. |
| `GET /syncs/metrics` | `get_syncs_metrics` | R | `{ success, warning, error }`; `sourceId?`, `connectionId?`. Exact counts classified like `list_syncs` `status`, so the three sum to the syncs listed for the same filters; a sync with no recorded result is `error`. An inaccessible `connectionId` returns zeros, not 404. |
| `GET /syncs/:id` | `get_sync` | R | One sync (no date range). |
| `GET /sources/:sourceId/syncs` | `list_source_syncs` | R | `/syncs` for one source. |
| `POST /syncs/:id/retry` | `retry_sync` | W | Not this skill. Error-status HubSpot/Salesforce syncs only; connection-scoped keys allowed. Returns `{ queued, syncId }`. |
| `POST /sources/:sourceId/syncs/retry` | `retry_source_syncs` | W | Not this skill. Enqueues recorded HubSpot/Salesforce errors from the last 30 days (warnings and syncs with no result row skipped — use `retry_sync` for those). One per source per 24h. `201 { queued, sourceId, retryAvailableAt, retryAfterSeconds }`; `queued: true` includes an empty batch. A `409` inside that window returns `retryAvailableAt` and `retryAfterSeconds`. A non-HubSpot/Salesforce source or a paused or unentitled connection/source is a plain `409` and does not start the window. Shares the window with the dashboard's **Retry failed**. |
| `GET /destinations` | `list_destinations` | R | Forwarding catalog. Entries with `sourceIds: []` are **unbound** — they forward nothing. |
| `GET /destinations/:id` | `get_destination` | R | One forwarding destination. |
| `GET /destinations/:id/deliveries` | `list_destination_deliveries` | R | Forwarding attempts; `status?` (`success`\|`error`). |
| `GET /destinations/:id/deliveries/metrics` | `get_destination_delivery_metrics` | R | `{ success, error, http2xx }`. Can return `504` (20s query limit). |
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
| `GET /workspace` | `get_workspace` | R | `{ id, name, role, permissions[] }`. Legacy key → 409 `WORKSPACE_REQUIRED`. A connection-scoped key can read this route and no other `/workspace*` route. |
| `PATCH /workspace` | `update_workspace` | W | Not this skill. Rename `{ name }` (max 80; blank and `Create new workspace` rejected). Needs `write` and `workspace.update`. |
| `GET /workspace/domains` | `list_workspace_domains` | R | `{ domains: [{ domain, verified, discoverable, autoJoinEnabled }] }`. Needs `workspace.read`. Not paginated. No domain row id. |
| `POST /workspace/domains` | `create_workspace_domain` | W | Not this skill. `{ domain }` → `201`. Needs `write` and `domains.manage`. The key owner's email must be on that domain. |
| `PATCH /workspace/domains/:domain` | `update_workspace_domain` | W | Not this skill. `discoverable` and/or `autoJoinEnabled`. Needs `write` and `domains.manage`. |
| `DELETE /workspace/domains/:domain` | `remove_workspace_domain` | W | Not this skill. `200` the removed domain; members stay. Needs `write` and `domains.manage`. |
| `GET /workspace/invitations` | `list_workspace_invitations` | R | `{ invitations[] }`, newest first. `status?` (`open` default = pending and expired). Needs `members.invite`. Accept token is never returned. |
| `POST /workspace/invitations` | `create_workspace_invitation` | W | Not this skill. `{ email, role? }` (`MEMBER` default) → `201`. Needs `write` and `members.invite`. Accept token is not returned. |
| `DELETE /workspace/invitations/:invitationId` | `revoke_workspace_invitation` | W | Not this skill. Cancel a pending or expired invitation (`200`). Needs `write` and `members.invite`. |
| `GET /workspace/members` | `list_workspace_members` | R | `{ members: [{ email, role }] }`. Needs `workspace.read`. Not paginated. Login ids are not returned. |
| `PATCH /workspace/members/:email` | `update_workspace_member` | W | Not this skill. `{ role }`. Email is percent-encoded (`@` as `%40`). Needs `write` and `members.update_role`. |
| `DELETE /workspace/members/:email` | `remove_workspace_member` | W | Not this skill. `200` the removed member. Needs `write` and `members.remove`. Does not remove a domain. |

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

## Workspace

`GET /me` `workspace` is `{ id, name, role }` for a workspace key and `null` for a legacy key. `id` is the public workspace id (`ws_` plus 20 base62 characters). `links.workspace` is present exactly when `workspace` is not null. A legacy key gets `409` `WORKSPACE_REQUIRED` on every `/workspace*` route — that is the answer, not an empty workspace. Do not call those routes when `workspace` is null.

A connection-scoped key may call `GET /workspace` only. Every other `/workspace*` route returns `403` `FORBIDDEN`.

`GET /workspace` returns `{ id, name, role, permissions[] }`. The key's creator must have `api_keys.manage`, and the workspace must have at least one API-enabled connection. `404` `WORKSPACE_NOT_FOUND` means the workspace was deleted. `403` with the standard error body means API access is missing; `403` `FORBIDDEN` means the role cannot read (`permission` names the missing permission when one is present).

Roles: `OWNER` · `ADMIN` · `MEMBER` · `VIEWER`. `permissions[]` is this key's role, not a map of every role. Relay the array; do not guess another role's permissions. The permission values are `workspace.read`, `workspace.update`, `workspace.delete`, `members.invite`, `members.update_role`, `members.remove`, `domains.manage`, `ownership.transfer`, `connections.create`, `connections.manage`, `sources.write`, `sources.delete`, `blocklists.write`, `reply_relays.write`, `destinations.write`, `blocklists.delete`, `reply_relays.delete`, `destinations.delete`, `external_api_keys.read`, `external_api_keys.create`, `external_api_keys.manage`, `api_keys.manage`, `platform_webhooks.manage`, `billing.read`, `billing.manage`, `setup.write`.

Reads (this skill). Writes below are not this skill; each also needs the `write` scope.

- `list_workspace_members` needs `workspace.read`. `{ members: [{ email, role }] }`. `email` may be null. Integer login ids are not returned.
- `list_workspace_domains` needs `workspace.read`. `{ domains: [{ domain, verified, discoverable, autoJoinEnabled }] }`. The domain row id is not returned. `autoJoinEnabled` lets people on that domain join as Members; otherwise they email an owner.
- `list_workspace_invitations` needs `members.invite`. `{ invitations[] }`, newest first. No `status` (or `open`) returns `pending` and `expired`. `all` also includes `accepted` and `revoked`. The accept token is never returned.

Invitation fields: `id` (`wsi_…`), `email`, `role`, `status` (`pending` · `expired` · `accepted` · `revoked`), `invitedBy`, `createdAt`, `lastSentAt`, `expiresAt`, `sendCount`, `acceptedAt`, `revokedAt`. `pending` can be accepted. `expired` can be sent again by inviting the same address. `accepted` and `revoked` are final. Query `status`: `open` · `pending` · `expired` · `accepted` · `revoked` · `all`. Anything else is `400` `STATUS_INVALID`.

`code` on `WorkspaceError` is one of: `ALREADY_MEMBER` · `DOMAIN_NOT_ELIGIBLE` · `DOMAIN_NOT_FOUND` · `DOMAIN_PATCH_EMPTY` · `DOMAIN_TAKEN` · `DOMAIN_UNVERIFIED` · `EMAIL_REQUIRED` · `EMAIL_SEND_FAILED` · `EMAIL_UNAVAILABLE` · `FORBIDDEN` · `INVITATION_CHANGED` · `INVITATION_NOT_FOUND` · `INVITATION_NOT_PENDING` · `LAST_OWNER` · `MEMBER_AMBIGUOUS` · `MEMBER_NOT_FOUND` · `NAME_REQUIRED` · `NAME_RESERVED` · `NAME_TOO_LONG` · `RATE_LIMITED` · `RESEND_LIMIT` · `ROLE_CEILING` · `ROLE_INVALID` · `STATUS_INVALID` · `WORKSPACES_NOT_ENABLED` · `WORKSPACE_NOT_FOUND` · `WORKSPACE_REQUIRED`. The list is complete. No operation says when `WORKSPACES_NOT_ENABLED` is returned.

Writes — not this skill:

- `update_workspace` also needs `workspace.update`. Body `{ name }`. Blank → `NAME_REQUIRED`. The name `Create new workspace` → `NAME_RESERVED`. More than 80 characters → `NAME_TOO_LONG`.
- `create_workspace_domain` also needs `domains.manage`. Body `{ domain }`. Stored only when the key owner's own email is on that domain. Anything else, including a free or consumer domain, is `400` `DOMAIN_NOT_ELIGIBLE`. Claimed by another workspace → `409` `DOMAIN_TAKEN`. `201` is the domain resource.
- `update_workspace_domain` also needs `domains.manage`. Send `discoverable`, `autoJoinEnabled`, or both. Neither boolean → `400` `DOMAIN_PATCH_EMPTY`. `discoverable: false` also turns auto-join off. An unverified domain cannot turn either flag on (`409` `DOMAIN_UNVERIFIED`). Does not remove members. `404` `DOMAIN_NOT_FOUND`.
- `remove_workspace_domain` also needs `domains.manage`. `200` the domain that was removed. People who already belong stay members. `404` `DOMAIN_NOT_FOUND`.
- `create_workspace_invitation` also needs `members.invite`. Body `{ email, role? }`. `role` defaults to `MEMBER`. The invitation email is sent; the accept token is not returned. An invitation is recorded only when that email was sent. An address that already has an open invitation is sent again (`resent: true`) with the role in this call. `201` is `{ id, email, role, resent, expiresAt }`. `400` `EMAIL_REQUIRED` or `ROLE_INVALID`. `403` `ROLE_CEILING`. `409` `ALREADY_MEMBER` or `INVITATION_CHANGED` (another call changed the same invitation; try again). `429` `RESEND_LIMIT`, `RATE_LIMITED`, or the API key rate limit. `502` `EMAIL_SEND_FAILED` — nothing was recorded. `503` `EMAIL_UNAVAILABLE` — this server cannot send email.
- `revoke_workspace_invitation` also needs `members.invite`. Cancels a pending or expired invitation; its link stops working. `200` is the invitation that was cancelled. `404` `INVITATION_NOT_FOUND`. `409` `INVITATION_NOT_PENDING` (`status` says which).
- `update_workspace_member` also needs `members.update_role`. Body `{ role }`. The email is percent-encoded (`@` as `%40`). `400` `ROLE_INVALID`. `403` `ROLE_CEILING` when the role outranks the caller or an admin changes an owner; `FORBIDDEN` when the role cannot change roles at all. `404` `MEMBER_NOT_FOUND`. `409` `LAST_OWNER` (the change would leave no owner) or `MEMBER_AMBIGUOUS`.
- `remove_workspace_member` also needs `members.remove`. `200` the member who was removed. Connection ids are not included. Does not remove a domain. `404` `MEMBER_NOT_FOUND`. `409` `LAST_OWNER`.

## Sensitive fields

| Field | Print? |
| --- | --- |
| API key / Bearer token | Never |
| Webhook `secret` (`oswhsec_…`) | Only in the single create/rotate response, with a store-now instruction; never re-echo |
| `sources[].url`, `destinations[].url`, delivery `destinationUrl` | Only as a full paste under a `Next` step that needs it |
| `replyRelays[].ccEmail`, `syncs[].toEmail` | Personal data — summarize or redact unless the user asked for that record |
| Workspace member `email`, invitation `email` / `invitedBy` | Personal data — show when the user asked for members or invitations; otherwise counts and roles |
| Capabilities, config booleans, CRM names, statuses, counts, blocker codes | Safe |
