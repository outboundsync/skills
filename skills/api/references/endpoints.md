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
| `GET /connections` | OAuth status + `capabilities{sync,destinations,blocklists}` |
| `GET /sources` | Inbound Sources; config; forwarding destinations; bound reply relay |
| `GET /destinations/reply-relays` | Reply-relay catalog for accessible connections |
| `GET /contacts/outreach` | Prior-outreach summary by `email` and/or social `profileUrl` (max 5, OR-unioned); 600/60s bucket |

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
- CRM engagement fields → `crm-analysis`
