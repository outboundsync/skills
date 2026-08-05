# Sync Monitoring API map

Base: `https://app.outboundsync.com/api/v1`

```http
Authorization: Bearer $OUTBOUNDSYNC_API_KEY
```

Account-scoped key required for every `/webhooks*` route. `write` scope required for mutations.

## Webhooks

| Method + path | Scope | Purpose |
| --- | --- | --- |
| `GET /webhooks` | read | List (`{ "webhooks": [...] }`, no secrets) |
| `GET /webhooks/:id` | read | Get one |
| `POST /webhooks` | write | Create; returns `secret` once |
| `PATCH /webhooks/:id` | write | Update url / description / enabledEvents / isActive |
| `DELETE /webhooks/:id` | write | Soft-delete `204` |
| `POST /webhooks/:id/rotate-secret` | write | New `secret` once |
| `POST /webhooks/:id/test` | write | `test.ping` → `202` `{ eventId }` |
| `GET /webhooks/:id/deliveries` | read | Delivery log |
| `POST /webhooks/:id/deliveries/:deliveryId/replay` | write | Replay |

## Events

| Method + path | Purpose |
| --- | --- |
| `GET /events` | Log; filters `type`, `delivered`, `cursor`, `limit` |
| `GET /events/:id` | Detail + delivery attempts |

## Ids

| Prefix | Meaning |
| --- | --- |
| `oswhk_` | Webhook endpoint |
| `osevt_` | Platform event |
| `oswhd_` | Delivery attempt |
| `oswhsec_` | Signing secret (shown once) |

## Docs

- https://outboundsync.com/docs/webhooks/
- https://outboundsync.com/docs/webhooks/payloads-and-signatures/
- https://outboundsync.com/docs/api/v1/#platform-webhooks-sync-monitoring
