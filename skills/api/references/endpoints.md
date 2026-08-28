# OutboundSync API v1 map (api skill)

Base: `https://app.outboundsync.com/api/v1`

```http
Authorization: Bearer $OUTBOUNDSYNC_API_KEY
```

Never print, log, or commit the key. Docs: https://outboundsync.com/docs/api/v1/

## Discovery (auth-free)

| Method + path | Notes |
| --- | --- |
| `GET /openapi.json` | OpenAPI 3.1 JSON — may lag live controllers |
| `GET /openapi.yaml` | OpenAPI YAML source form |

Also: `GET /health/live`, `GET /health/ready` (host root, not under `/api/v1`).

## Introspection (read)

| Method + path | Notes |
| --- | --- |
| `GET /me` | Identity, key metadata, connections, `links` |
| `GET /account/status` | `ready`, blockers, warnings, per-connection components |
| `GET /account/metrics` | Request, sync, destination-delivery counts; `from`/`to` required (max 31 days); optional `connectionId`, `sourceId` (sourceId filters requests+syncs only) |
| `GET /connections` | OAuth status + `capabilities{sync,destinations,blocklists}` |
| `GET /sources` | Inbound Sources; config; forwarding destinations; bound reply relay |
| `GET /destinations` | Forwarding destination catalog |
| `GET /destinations/:id` | One forwarding destination |
| `GET /destinations/reply-relays` | Reply-relay catalog for accessible connections |
| `GET /contacts/outreach` | Prior-outreach summary by `email` and/or `profileUrl` (max 5, OR-unioned); neither / invalid / >5 → **400**; 600/60s bucket. Contract: [contacts-outreach.md](contacts-outreach.md) |
| `GET /blocklists` | CRM→SEP blocklist **sync configs**; optional `connectionId`; `{ "blocklists": [] }` (**not** 404) when that id is outside access. Zero API-enabled connections → auth **403** (not an empty list). Named wrapper, not a date-range page. Connection-scoped keys may call this (unlike `/webhooks*`). Distinct from `contacts/outreach` `blocklists.*`. |

Each list item: `id`, `connectionId`, `listName`, `crm` (string or null), `platform`, `blockType` (`ADDRESS`\|`DOMAIN`), `status` (`CREATED`\|`FETCHING`\|`SYNCING`\|`SYNCED`\|`SYNCING_NEW_CONTACTS`), `isEnabled`, `clientId`, `syncedCount`, `pendingCount`, `lastFetchedAt`, `lastError`, `lastAttemptedAt`, `createdAt`. Treat `lastError` like `/account/status` operational text — do not dump unless debugging that list.

## Pipeline observability (read; date range)

| Method + path | Notes |
| --- | --- |
| `GET /requests` | Inbound receipts; `from`/`to` required (max 31 days); sourceId?, cursor?, limit? |
| `GET /sources/:id/requests` | Same as `GET /requests` scoped to one source (nested equivalent of the `sourceId` filter) |
| `GET /requests/metrics` | `{ count }`; `from`/`to` required (max 31 days) |
| `GET /syncs` | CRM sync attempts; `from`/`to` required (max 31 days); status?, sourceId?, connectionId? |
| `GET /sources/:id/syncs` | Same as `GET /syncs` scoped to one source (nested equivalent of the `sourceId` filter) |
| `GET /syncs/metrics` | `{ success, warning, error }`; `from`/`to` required (max 31 days) |
| `GET /syncs/:id` | One sync (no date range) |
| `POST /syncs/:id/retry` | **write — not this skill** — Error HubSpot/Salesforce only |
| `GET /destinations/:id/deliveries` | Forwarding delivery attempts; `from`/`to` required (max 31 days); status `success`\|`error` |
| `GET /destinations/:id/deliveries/metrics` | `{ success, error, http2xx }`; `from`/`to` required (max 31 days) |
| `GET /deliveries` | Account-wide delivery export; `from`/`to` required (max 31 days); optional `destinationId` |
| `POST /destinations/:id/deliveries/:deliveryId/replay` | **write — not this skill** — enqueue; any delivery with payloadId (no Error-only gate) |

Parent-disambiguate destination deliveries from Sync Monitoring `/webhooks/:id/deliveries`.

## Blocklists (mutations — not this skill)

SEP push is **additive**. Pause/resync change OutboundSync's pipeline only — they do **not** clear Instantly / Smartlead / etc. Never imply `POST …/resync` wipes the sequencer. Verb is **resync**, never `rebuild`. Connection-scoped keys may call these (unlike `/webhooks*`).

| Method + path | Notes |
| --- | --- |
| `POST /blocklists/:id/pause` | **write — not this skill** — `isEnabled: false`; no body; already paused → **200**, not 409. `403` missing write only (check runs before the row is loaded). Pause does **not** check `canBlockList`. `404` `Blocklist {id} not found`. |
| `POST /blocklists/:id/resync` | **write — not this skill** — full CRM reload (enqueue only); no body. `200` `{ id, queued: true, isEnabled: true, status: "FETCHING" }`. `403` missing write **or** `!canBlockList` (`Block lists are not enabled for this connection`). `404` not found. `409` if already `FETCHING`/`SYNCING`, a fetch job is still **active** (including after pause), or no CRM source. |

Not shipped (do not invent): `GET /blocklists/:id/entries`, `DELETE /blocklists/:id/entries` (would clear **local OutboundSync entries only** — not the SEP).

## Sync Monitoring (see also `sync-monitoring` skill)

| Method + path | Scope | Notes |
| --- | --- | --- |
| `GET /webhooks` | read + **account-scoped** | List endpoints (no secrets) |
| `GET /webhooks/:id` | read + account-scoped | One endpoint |
| `POST /webhooks` | **write** + account-scoped | Returns `secret` once |
| `PATCH /webhooks/:id` | write + account-scoped | url / description / enabledEvents / isActive |
| `DELETE /webhooks/:id` | write + account-scoped | Soft-delete `204` |
| `POST /webhooks/:id/rotate-secret` | write + account-scoped | New `secret` once |
| `POST /webhooks/:id/test` | write + account-scoped | `test.ping` → `202` `{ eventId }` |
| `GET /webhooks/:id/deliveries` | read + account-scoped | Filters: status, cursor, limit |
| `POST /webhooks/:id/deliveries/:deliveryId/replay` | write + account-scoped | Replay |
| `GET /events` | read | Filters: type, delivered, cursor, limit |
| `GET /events/:id` | read | Event + delivery attempts |

Connection-scoped keys: **403** on all `/webhooks*`. They may list `/events` for their connection (+ account-level events).

## Sensitive fields

| Field | Print? |
| --- | --- |
| API key | Never |
| Webhook `secret` (`oswhsec_…`) | Only in the single create/rotate response; instruct user to store; never re-echo |
| `sources[].url` / `destinations[].url` | Only when the user needs a paste |

## Specialized skills

- Launch Ready/Not-ready → `preflight`
- Sync Monitoring wire/diagnose/mutate → `sync-monitoring`
- Prior-outreach skip / delay enrollment → this skill (`api`); see [contacts-outreach.md](contacts-outreach.md)
- CRM→SEP blocklist syncs → this skill (`api`) `GET /blocklists`; pause/resync are write — not this skill
- CRM engagement fields → `crm-analysis`
