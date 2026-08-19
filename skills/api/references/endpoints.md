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

## Pipeline observability (read; date range)

| Method + path | Notes |
| --- | --- |
| `GET /requests` | Inbound receipts; `from`/`to` required (max 31 days); sourceId?, cursor?, limit? |
| `GET /requests/metrics` | `{ count }`; `from`/`to` required (max 31 days) |
| `GET /syncs` | CRM sync attempts; `from`/`to` required (max 31 days); status?, sourceId?, connectionId? |
| `GET /syncs/metrics` | `{ success, warning, error }`; `from`/`to` required (max 31 days) |
| `GET /syncs/:id` | One sync (no date range) |
| `POST /syncs/:id/retry` | **write — not this skill** — Error HubSpot/Salesforce only |
| `GET /destinations/:id/deliveries` | Forwarding delivery attempts; `from`/`to` required (max 31 days); status `success`\|`error` |
| `GET /destinations/:id/deliveries/metrics` | `{ success, error, http2xx }`; `from`/`to` required (max 31 days) |
| `GET /deliveries` | Account-wide delivery export; `from`/`to` required (max 31 days); optional `destinationId` |
| `POST /destinations/:id/deliveries/:deliveryId/replay` | **write — not this skill** — enqueue; any delivery with payloadId (no Error-only gate) |

Parent-disambiguate destination deliveries from Sync Monitoring `/webhooks/:id/deliveries`.

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
- CRM engagement fields → `crm-analysis`
