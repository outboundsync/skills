---
name: sync-monitoring
description: >-
  Diagnose and manage OutboundSync Sync Monitoring Webhooks and events via API
  v1 (sync.failed, sync.recovered, deliveries, replay). Use when the user asks
  about OutboundSync platform webhooks, registering a Sync Monitoring endpoint,
  webhook deliveries failing, replaying a delivery, rotating a signing secret,
  test.ping, GET /api/v1/webhooks, or GET /api/v1/events. Not for SEP Sources
  paste-URL wiring — that is the preflight skill.
license: MIT
compatibility: Requires OUTBOUNDSYNC_API_KEY (account-scoped for /webhooks*; write scope for mutations) and HTTPS access to app.outboundsync.com.
metadata:
  author: outboundsync
  version: "1.0.0"
---

# Sync Monitoring (OutboundSync Webhooks + events)

Manage **OutboundSync-emitted** Sync Monitoring webhooks — not SEP → OutboundSync **Sources** paste URLs (use `preflight` for those).

Default **read-only diagnose**. Mutations only after the **write confirmation protocol** below. Never print, log, or commit the API key. After create/rotate, show `secret` once and tell the user to store it — never re-echo into logs, commits, or later prompts.

Render **only** the fixed output shape — no prose outside it.

Product how-to: https://outboundsync.com/docs/webhooks/  
Signatures: https://outboundsync.com/docs/webhooks/payloads-and-signatures/  
API contract: https://outboundsync.com/docs/api/v1/#platform-webhooks-sync-monitoring

**Note:** Best practices shared freely — see [DISCLAIMER.md](../../DISCLAIMER.md).

## Credentials

- `$OUTBOUNDSYNC_API_KEY` Bearer → `https://app.outboundsync.com/api/v1`
- `/webhooks*` requires an **account-scoped** key (connection-scoped → hard fail with remediation).
- Mutations require **`write`** scope. Account must have Webhooks enabled (`canUseWebhooks`); otherwise `403`.
- `/events*` allows connection-scoped keys (narrowed visibility).

See [references/endpoints.md](references/endpoints.md) and [references/event-types.md](references/event-types.md).

## Write confirmation protocol

Mutations = `POST`/`PATCH`/`DELETE` on `/webhooks*`, plus `rotate-secret`, `test`, `replay`.

1. Default path is diagnose only (GETs).
2. Before any mutation, print a one-line plan: method, path, and effect (e.g. `Will POST /webhooks registering https://example.com/hook for sync.failed + sync.recovered`).
3. Proceed **only** if the user clearly confirms **that** plan. Vague asks (“set up webhooks”, “fix deliveries”) are **not** confirmation — diagnose and propose the plan.
4. After create/rotate: instruct immediate secret storage; do not retain the secret beyond that response.
5. On `403`: explain account-scoped + `write` + Webhooks enabled using the error body — do not invent UI probes.

Caps: max **20** webhooks per account. Auto-disable after **20** consecutive terminal delivery failures; re-enable with `PATCH` `isActive=true`.

## Phase 1 — Identity

1. `GET /me` → `apiKey.connectionScope`, `scopes`, `connections[]`.
2. If `connectionScope === "connection"` and the task needs `/webhooks*`: stop with ✗ and Next = issue an account-scoped key (events-only diagnose may continue with `/events`).

## Phase 2 — Read diagnose (default)

1. `GET /webhooks` (and `GET /webhooks/:id` if targeting one).
2. `GET /events` — filters: `type` (repeatable), `delivered` (`true`/`false`), `cursor`, `limit`. Paginate when needed.
3. For failing endpoints: `GET /webhooks/:id/deliveries` (`status`, cursor, limit).
4. Optional: `GET /events/:id` for one event + delivery attempts.

Summarize: registered URLs (safe to show), `enabledEvents`, `isActive` / auto-disable hints, undelivered or failed events, recent delivery failures.

## Phase 3 — Writes (confirm first)

Only after confirmation:

| Action | Call |
| --- | --- |
| Register | `POST /webhooks` `{ url, description?, enabledEvents? }` — empty events = all subscribable |
| Update | `PATCH /webhooks/:id` |
| Disable/delete | `PATCH isActive=false` or `DELETE /webhooks/:id` |
| Rotate secret | `POST /webhooks/:id/rotate-secret` |
| Test | `POST /webhooks/:id/test` → `test.ping` |
| Replay | `POST /webhooks/:id/deliveries/:deliveryId/replay` |

Do not subscribe to reserved event types (API returns `400`). Active: `sync.failed`, `sync.recovered`. `test.ping` is not subscribable.

## Hand off

- Launch readiness / Sources paste URLs / SEP wiring → `preflight`
- General API vocabulary / key bootstrap → `api`
- CRM reply analytics → `crm-analysis`

## Output contract

````markdown
## Sync Monitoring

```text
Mode <diagnose | mutate-proposed | mutate-done>
Key  <account|connection> · scopes <…>
```

### Endpoints
- <✓/✗/· lines per webhook: id · active · enabledEvents · url host>

### Events
- <summary of recent / filtered events; undelivered count if known>

### Deliveries
- <failures / last status — or "not queried">

### Next
1. <shortest action — or omit section if healthy and no ask remains>
````

Rules:

- Blank line between blocks; `-` bullets only under sections.
- Marks: ✓ ok · ✗ blocker · · advisory.
- If proposing a write: include the one-line plan under Next and **stop** until confirmed.
- Never print API keys or signing secrets (except the single create/rotate reveal with a store-now instruction).
- Remind once when relevant: this is **not** Sources / SEP inbound wiring.

Examples: [references/examples.md](references/examples.md).
