---
name: sync-monitoring
description: >-
  Diagnose and manage OutboundSync Sync Monitoring Webhooks and events via API
  v1 or the hosted MCP (sync.failed, sync.recovered, deliveries, replay), with
  a health gauge across endpoints, deliveries, events, and CRM sync errors. Use
  when the user asks about OutboundSync platform webhooks, whether Sync
  Monitoring alerts are working, registering a Sync Monitoring endpoint,
  webhook deliveries failing, replaying a delivery, rotating a signing secret,
  test.ping, GET /api/v1/webhooks, or GET /api/v1/events. Not for SEP Sources
  paste-URL wiring — that is the preflight skill.
license: MIT
compatibility: Requires OUTBOUNDSYNC_API_KEY (account-scoped for /webhooks*; write scope for mutations) and HTTPS access to app.outboundsync.com, or OutboundSync MCP connected at https://mcp.outboundsync.com/mcp with the same Bearer key. The account needs platform webhooks enabled.
metadata:
  author: outboundsync
  version: "1.3.1"
---

# Sync Monitoring (OutboundSync Webhooks + events)

Diagnose and manage **OutboundSync-emitted** Sync Monitoring webhooks — not SEP → OutboundSync **Sources** paste URLs (use `preflight` for those).

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](https://github.com/outboundsync/skills/blob/main/DISCLAIMER.md).

Default **read-only diagnose**. Mutations only under the [write-on-confirm protocol](https://github.com/outboundsync/skills/blob/main/SECURITY.md#write-on-confirm-protocol) (see `## Mutations`). Never print, log, or commit the API key. After create/rotate, show `secret` once and tell the user to store it — never re-echo it.

Render **only** the output shape below — no prose outside it.

- Product how-to: https://outboundsync.com/docs/webhooks/
- Signatures: https://outboundsync.com/docs/webhooks/payloads-and-signatures/
- API contract: https://outboundsync.com/docs/api/v1/#platform-webhooks-sync-monitoring

## Credentials and access

**Prefer OutboundSync MCP when connected** (`https://mcp.outboundsync.com/mcp`, streamable HTTP, `Authorization: Bearer osapi_...`). Otherwise REST with `$OUTBOUNDSYNC_API_KEY` against `https://app.outboundsync.com/api/v1`. Setup: https://outboundsync.com/docs/mcp/setup/

Two independent requirements gate everything under `/webhooks*` and `/events` — reads included:

1. An **account-scoped** key. A connection-scoped key gets `403` "Webhook endpoint management requires an account-scoped API key" on `/webhooks*`; it can still read `/events` for its own connection when (2) holds.
2. **Platform webhooks enabled** on the account (`canUseWebhooks`). Off → `403` "Platform webhooks are not enabled for this account" on `/webhooks*` **and** `/events`. `/me` does not expose this flag; only the `403` reveals it.

Mutations also need the **`write`** scope. Map, errors, pagination, and limits: [references/endpoints.md](references/endpoints.md). Event types: [references/event-types.md](references/event-types.md). Rendered examples: [references/examples.md](references/examples.md).

## Diagnose (default, read-only)

Run in order; one failed call makes only its own row UNVERIFIED.

1. **Identity** — `get_me` → `apiKey.connectionScope`, `scopes`.
2. **Endpoints** — `list_webhooks` (and `get_webhook` when targeting one). Classify each endpoint:
   - **healthy** — `isActive` and `autoDisabledAt` null
   - **auto-disabled** — `autoDisabledAt` set (it failed 20 times in a row)
   - **paused** — `isActive` false and `autoDisabledAt` null (a deliberate pause; advisory only)
   - **covers alerts** — `enabledEvents` empty (all subscribable) or includes `sync.failed`
3. **Deliveries** — for each healthy endpoint, `list_webhook_deliveries` (`limit` 25, newest first) → sample of recent attempts. OK = `SUCCEEDED` or `PENDING`; failed = `FAILED` or `DEAD`.
4. **Events** — `list_events` (`limit` 25) → sample of recent events. An event **counts** only if some non-paused endpoint subscribes to its type and it is older than 15 minutes (newer ones may still be `PENDING`). `delivered` = at least one delivery `SUCCEEDED`. For an undelivered backlog, page `list_events` with `delivered=false` on `hasMore` / `nextCursor`. Optional `get_event` for one event's delivery attempts.
5. **CRM syncs** — `get_syncs_metrics` over the last 7 days (full ISO-8601 `from`/`to`). This is what `sync.failed` alerts on: it fires on the **first** connection-breaking error (CRM auth, billing, app not installed), which also pauses that source × connection until the CRM is reconnected, and after **3 consecutive** failures for anything else. Rate limits (429) and CRM 5xx / network errors never count; only some are retried automatically (see [references/event-types.md](references/event-types.md#automatic-retries)). `error` includes syncs that never recorded a result and syncs skipped while paused (`sync_circuit_open`). On a `504` (20s query limit), narrow `from`/`to` or pass `connectionId`. Works with any key.

Caps: max **20** webhooks per account. An endpoint auto-disables after **20** consecutive terminal delivery failures (`autoDisabledAt` set); re-enable with `update_webhook` `isActive: true` after fixing the receiver.

### Gates (one per gauge row)

| Row | Passes when | Bar = |
| --- | --- | --- |
| Access | `list_webhooks` succeeds. ✗ only for the two documented `403`s (connection-scoped key; platform webhooks off); any other failure is `· UNVERIFIED — <status>` | 1/1 or 0/1 |
| Endpoints | every non-paused endpoint is healthy, and ≥1 healthy endpoint covers `sync.failed` | healthy / non-paused. If no healthy endpoint covers `sync.failed` — including zero endpoints or all paused — the row is 0/1 (20 `░`) with `✗ none healthy cover sync.failed` |
| Deliveries | no `FAILED` or `DEAD` in the sample | OK / sampled |
| Events | every counted event delivered | delivered / counted; none counted → `▒` `· no events to check` |
| CRM syncs | no `error` syncs in 7 days (`warning` = benign skip, counts as OK) | (success + warning) / total; zero syncs → `▒` `· no CRM syncs in 7 days` (nothing to verify — say so if traffic was expected) |

When Access fails on `canUseWebhooks`, Endpoints, Deliveries, and Events are all unreadable. A row whose call failed, or that the key cannot read, is **UNVERIFIED** (20 `▒`) and is excluded from Overall's fraction. With no healthy endpoint, Deliveries and Events are UNVERIFIED — "nothing is listening" is the Endpoints finding. Paused endpoints show on the Endpoints card as `·` and never fail the gate.

Verdict: **healthy** when every row passes · **needs attention** when any row fails · **unverified** when nothing fails but a row is UNVERIFIED. Append `· <n> unverified` to Overall only alongside a healthy-or-failing verdict, not when the verdict is already unverified.

## Mutations

Only after the user confirms the exact one-line plan (write-on-confirm protocol). Vague asks ("set up webhooks", "fix deliveries") are not confirmation — diagnose and propose the plan.

| REST | MCP tool | Effect |
| --- | --- | --- |
| `POST /webhooks` | `create_webhook` | Register `{ url (https), description?, enabledEvents? }`; empty events = all subscribable. Returns `secret` once. |
| `PATCH /webhooks/:id` | `update_webhook` | Change url / description / enabledEvents / `isActive` (re-enable after auto-disable). |
| `DELETE /webhooks/:id` | `delete_webhook` | Soft-delete (`204`); the endpoint stops receiving deliveries and cannot be restored through the API. Prefer `isActive: false` to pause. |
| `POST /webhooks/:id/rotate-secret` | `rotate_webhook_secret` | New `secret` once; the old secret stops verifying immediately. |
| `POST /webhooks/:id/test` | `test_webhook` | Queue `test.ping` → `202 { eventId }`; `502` means it could not be queued — retry. |
| `POST /webhooks/:id/deliveries/:deliveryId/replay` | `replay_webhook_delivery` | Re-send one delivery attempt. |

1. Print the plan as `### Proposed change` — one `·` bullet per call (method, path, effect), so seven replays are seven bullets — and **stop**.
2. A "yes" confirms exactly that set of calls. Run them and render `### Applied`. Anything beyond the set needs a new proposal.
3. After the writes, re-run the read-only diagnose to render the updated gauge (reads need no confirmation). A request that only asked for a change may leave out the CRM syncs row.
4. Secrets from create/rotate appear once, in `### Applied`, with a store-now instruction.
5. On `403`, relay the message (account-scoped, `write`, or webhooks not enabled) — never invent UI probes.

Do not subscribe to reserved event types (`400`). Subscribable today: `sync.failed`, `sync.recovered`. `test.ping` comes only from `test_webhook`.

## Hand off

- Launch readiness / Sources paste URLs / SEP wiring → `preflight`
- API vocabulary, key bootstrap, sync records (`list_syncs`) → `api`
- CRM reply analytics → `crm-analysis`

## Output contract

GitHub-flavored markdown only. Render only this shape; no prose outside it. This is the pack's [status layout](https://github.com/outboundsync/skills/blob/main/CONVENTIONS.md#status-layout--required-for-readiness-health-and-audit-skills):

1. `##` is the verdict.
2. A fenced `text` gauge follows immediately: `Overall`, then Access, Endpoints, Deliveries, Events, CRM syncs. Pad labels so bars align. Bars are 20 cells — `█` OK · `░` failed · `▒` UNVERIFIED — filled `round(p / t × 20)`.
3. Cards in gauge order; each opens with a backtick context line; every bullet starts with its mark; one check per line.
4. `### Proposed change` / `### Applied` only in a write flow. `### Next` only when something needs action; each item maps to a `✗` or `UNVERIFIED` line.
5. Failed calls render as `· UNVERIFIED — <status or message>`, never as "none".
6. Remind once when relevant: this is **not** Sources / SEP inbound wiring.

### Shape

````markdown
## Sync Monitoring <healthy | needs attention | unverified>

```text
Overall     <bar>  <p>/<t> · <healthy | needs attention | unverified>[ · <n> unverified]

Access      <bar>  <✓ ready | ✗ <reason> | · UNVERIFIED — <status>>
Endpoints   <bar>  <mark> <healthy>/<non-paused> healthy | ✗ none healthy cover sync.failed
Deliveries  <bar>  <mark> <ok>/<sampled> ok
Events      <bar>  <mark> <delivered>/<counted> delivered
CRM syncs   <bar>  <mark> <ok>/<total> ok · 7 days
```

### Access
`<account | connection>-scoped · <read | read+write>`

- <✓ Account-scoped key with platform webhooks on | ✗ Connection-scoped key — /webhooks needs an account-scoped key | ✗ Platform webhooks are not enabled for this account>

### Endpoints
`<n> of 20 registered`

- <✓ | ✗ | ·> <oswhk_…> · <url host> · <enabledEvents or "all events"> · <active | auto-disabled <date> | paused>

### Deliveries
`last <n> attempts per active endpoint`

- <✓ | ✗> <oswhk_…> · <ok>/<sampled> ok · last <status> <lastHttpStatus> <when>

### Events
`last <n> events`

- <✓ All delivered | ✗ <n> undelivered — newest <osevt_…> <type> <when>>

### CRM syncs
`<from> → <to>`

- <✓ No sync errors | ✗ <n> errors — sync.failed fires on the first auth/billing error, else after 3 in a row per source × connection> · <warning> benign skips

### Proposed change
`write-on-confirm — reply "yes" to run exactly this`

- · Will <METHOD /path> — <effect>
- · <one bullet per additional call>

### Applied
`<METHOD /path> · <status code>`

- ✓ <what changed>
- · Signing secret (shown once — store it now): `<oswhsec_…>`

### Next
1. <shortest action tied to a ✗ or UNVERIFIED line>
````

Never print API keys, and never print a signing secret outside the single `### Applied` reveal.
