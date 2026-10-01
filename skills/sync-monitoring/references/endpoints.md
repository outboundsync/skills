# Sync Monitoring API + MCP map

Trimmed copy of the pack's full map (the `api` skill's `references/endpoints.md`); `npm run validate` keeps the rows below matching it.

- REST base: `https://app.outboundsync.com/api/v1` · `Authorization: Bearer $OUTBOUNDSYNC_API_KEY`
- MCP: `https://mcp.outboundsync.com/mcp` (same Bearer key)

`R` = read. `W` = needs the `write` scope. `A` = needs an **account-scoped** key **and** platform webhooks enabled (`canUseWebhooks`). `H` = needs `canUseWebhooks`, any key scope — a connection-scoped key reads its connection's events plus account-level events.

## REST ↔ MCP tools

| REST | MCP tool | Access | Owner / notes |
| --- | --- | --- | --- |
| `GET /me` | `get_me` | R | Identity, `apiKey{name, scopes[], connectionScope: account\|connection, connectionId}`, `connections[]`, `links`. Call first. No capability flags. |
| `GET /syncs/metrics` | `get_syncs_metrics` | R | `{ success, warning, error }`; `sourceId?`, `connectionId?`. Exact counts classified like `list_syncs` `status`, so the three sum to the syncs listed for the same filters; a sync with no recorded result is `error`. An inaccessible `connectionId` returns zeros, not 404. |
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

## Resources

| Resource | Fields |
| --- | --- |
| Webhook endpoint | `id` (`oswhk_…`), `url` (https only), `description`, `enabledEvents[]` (empty = all subscribable), `isActive`, `autoDisabledAt`, `createdAt`, `updatedAt` — never a secret |
| Delivery attempt | `id` (`oswhd_…`), `endpointId`, `status` (`PENDING`\|`SUCCEEDED`\|`FAILED`\|`DEAD`), `attemptCount`, `lastAttemptAt`, `lastHttpStatus`, `lastError`, `replayOfDeliveryId`, `createdAt` |
| Event | `id` (`osevt_…`), `type`, `summary`, `data`, `connectionId`, `sourceId`, `delivered` (≥1 delivery `SUCCEEDED`), `createdAt`; `get_event` adds `deliveries[]` |
| Signing secret | `oswhsec_…` — only in the create/rotate response |

There is no events or webhook-delivery metrics endpoint: count undelivered events by paging `list_events` with `delivered=false`.

## Paging and errors

- `/events` and `/webhooks/:id/deliveries`: cursor pages `{ data, hasMore, nextCursor }`, default 25, max 100. Loop on `hasMore` / `nextCursor`, never on page length. `/webhooks` returns the whole list.
- `get_syncs_metrics` needs full ISO-8601 `from`/`to`, at most 31 days apart. Past the 20s query limit it returns a JSON `504` — narrow the window or pass `connectionId`, or retry shortly.
- `403` messages: "Webhook endpoint management requires an account-scoped API key" · "Platform webhooks are not enabled for this account" · missing `write`. Relay them verbatim.
- Any `401`/`403`/`5xx` (including `504`), timeout, non-JSON body, or MCP `isError` → that row is **UNVERIFIED**, never "no endpoints" or "no events".

## Docs

- https://outboundsync.com/docs/webhooks/
- https://outboundsync.com/docs/webhooks/payloads-and-signatures/
- https://outboundsync.com/docs/api/v1/#platform-webhooks-sync-monitoring
