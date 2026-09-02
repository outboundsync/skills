---
name: api
description: >-
  Guide agents through the OutboundSync API v1: auth, scopes, Sources vs
  destinations vs Sync Monitoring Webhooks vocabulary, discovery, and which
  specialized skill to run. Use when the user asks how to use the OutboundSync
  API, what their API key can access, which endpoint to call, OpenAPI discovery,
  account vs connection keys, read vs write scopes, how API work relates to
  the preflight and sync-monitoring skills, or about prior outreach, already
  contacted, skip contacts I already reached, GET /contacts/outreach, blocklist
  syncs, or GET /blocklists.
license: MIT
compatibility: Requires OUTBOUNDSYNC_API_KEY in the environment and HTTPS access to app.outboundsync.com for live calls, or OutboundSync MCP connected at https://mcp.outboundsync.com/mcp with the same Bearer key.
metadata:
  author: outboundsync
  version: "1.3.0"
---

# OutboundSync API v1

Teach and lightly exercise the public API. Default **read-only**. Never print, log, or commit the API key. Never print webhook signing secrets. Treat `sources[].url` and `destinations[].url` as sensitive (full paste only when the user needs to copy them).

Render **only** the fixed output shape below — no prose outside it.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](../../DISCLAIMER.md).

## Credentials

**Prefer OutboundSync MCP when connected** (`https://mcp.outboundsync.com/mcp`, streamable HTTP, `Authorization: Bearer osapi_...`). Otherwise REST:

- Load `$OUTBOUNDSYNC_API_KEY` from the environment (Bearer token).
- Base: `https://app.outboundsync.com/api/v1`
- MCP setup: https://outboundsync.com/docs/integrations/ai-and-agents/mcp/
- Docs: https://outboundsync.com/docs/api/v1/
- Keys: https://outboundsync.com/docs/api/authentication/creating-api-keys/

Thin map: [references/endpoints.md](references/endpoints.md). Prior-outreach contract: [references/contacts-outreach.md](references/contacts-outreach.md).

### MCP when connected (read-only bootstrap)

| REST | MCP tool |
| --- | --- |
| `GET /me` | `get_me` |
| `GET /connections` | `list_connections` |
| `GET /account/status` | `get_account_status` |
| `GET /sources` | `list_sources` |
| `GET /destinations` / `GET /destinations/reply-relays` | `list_destinations` / `list_reply_relays` |
| `GET /blocklists` | `list_blocklists` |
| `GET /contacts/outreach` | `get_contact_outreach` |
| `GET /account/metrics`, `GET /requests`, `GET /syncs`, `GET /deliveries` | matching `get_*` / `list_*` tools |

Write tools exist on MCP (`retry_sync`, replays, blocklist pause/resync, webhook CRUD) — **not this skill**. `/webhooks*` still requires an **account-scoped** key on MCP too.

## Auth and scopes

| Concern | Rule |
| --- | --- |
| Header | `Authorization: Bearer osapi_…` |
| Default scope | `read` (GETs) |
| Mutations | Require `write` on the key (`POST`/`PATCH`/`DELETE`, rotate, test, replay, blocklist pause/resync) — **not this skill** |
| Account-scoped key | Sees all connections; **required** for `/webhooks*` |
| Connection-scoped key | Sees one connection; fine for introspection + narrowed `/events`; **403** on `/webhooks*` |
| Rate limits | Honor `429` + `Retry-After`; `GET /contacts/outreach` has a dedicated 600/60s bucket |

On `401` / `403` / `429`, summarize the error meaning and the shortest fix — do not invent admin flags beyond the response body.

## Vocabulary (keep distinct)

| Concept | API term | Path / field |
| --- | --- | --- |
| SEP inbound paste URL | **source** | `GET /sources` (`url`) |
| Forward raw events to customer HTTPS | **destination** (forwarding) | catalog `GET /destinations`; bindings still nested on `GET /sources` (`sources[].destinations[]`) |
| Reply-CC a sales rep | **destination** (reply relay) | `GET /destinations/reply-relays` (+ bound on sources) |
| Prior-outreach lookup | **contacts/outreach** | `GET /contacts/outreach` |
| CRM→SEP blocklist **sync configs** | **blocklists** | `GET /blocklists` — not `contacts/outreach` `blocklists.*` (reserved; `evaluated` always false) |
| OutboundSync-emitted Sync Monitoring | **webhooks** + **events** | `/webhooks`, `/events` |

Inbound `POST /webhooks/:code` is the Sources paste target — not Sync Monitoring. Parent-disambiguate forwarding `GET /destinations/:id/deliveries` from Sync Monitoring `GET /webhooks/:id/deliveries`.

## Discovery

1. Prefer `GET /me` → use `links` for related paths.
2. Auth-free: `GET /openapi.json` / `GET /openapi.yaml`.
3. Every `/api/v1/*` response may carry `Link: rel="service-desc"` / `service-doc`.

**OpenAPI gap:** served OpenAPI covers discovery, platform health, introspection, destinations, deliveries, metrics, requests, syncs, webhooks, events, `GET /blocklists`, and pause/resync. It can still lag newly shipped routes. Prefer [references/endpoints.md](references/endpoints.md) and https://outboundsync.com/docs/api/v1/ over an incomplete OpenAPI document. Do **not** call `GET`/`DELETE /blocklists/:id/entries` — those are not shipped.

## What this skill may call

This skill is **read-only**. Do not mutate.

Bootstrap when the user asks what the key can see or how to start:

1. `GET /me`
2. `GET /connections`
3. `GET /account/status`
4. `GET /sources` (paginate; elide sensitive URLs unless pasting)
5. `GET /destinations` / `GET /destinations/reply-relays`
6. `GET /blocklists` (CRM→SEP blocklist syncs; optional `connectionId`)

When the user asks about forwarding, sync, or inbound-request history (not on every bootstrap):

- `GET /account/metrics` (`from`/`to` required, max 31 days)
- `GET /requests`, `GET /syncs`, `GET /deliveries`, or nested destination deliveries/metrics — `from`/`to` required (max 31 days); see [references/endpoints.md](references/endpoints.md)

When the user asks about a contact, prior outreach, already contacted, or skip/delay enrollment:

- `GET /contacts/outreach` — `email` and/or `profileUrl` (max 5, OR-unioned); 600/60s bucket. Contract: [references/contacts-outreach.md](references/contacts-outreach.md)

When the user asks about blocklist syncs, suppression lists, pause, or resync:

- `GET /blocklists` (optional `connectionId`). Named `{ "blocklists": [...] }` — not a date-range page. Connection id outside access → empty list, **not** 404. Zero API-enabled connections → auth **403** (same as other authenticated `/api/v1` routes). Resource fields and status enums: [references/endpoints.md](references/endpoints.md). `lastError` may contain vendor text — do not dump unless debugging that list.
- Do **not** `POST` pause or resync from this skill.

Do **not** run the full preflight gauge here. Do **not** mutate `/webhooks*` here — hand off to `sync-monitoring`.

## Route to specialized skills

| User intent | Skill |
| --- | --- |
| Ready to launch? Sources/SEP wired? CRM sync ready? | `preflight` |
| Sync Monitoring: register/diagnose/replay **platform** webhooks, `sync.failed` / `sync.recovered`, webhook deliveries | `sync-monitoring` |
| Forwarding destination delivery history (GET) | this skill (`api`) |
| Already outreached? Skip / delay enrollment? | this skill (`api`) |
| CRM→SEP blocklist syncs / pause / resync | this skill (`api`) — GET list only |
| Campaign replies / attribution from CRM fields | `crm-analysis` (no API key) |
| How do I use the API / what can my key access? | this skill (`api`) |

If the ask spans launch readiness and Sync Monitoring, say which skill runs first and why.

## Deferred (do not invent)

Not callable yet (or reserved): `GET /blocklists/:id/entries`, `DELETE /blocklists/:id/entries` (clear local OutboundSync entries only — not shipped; do not invent), `POST /connections/:id/test`, source create/logs, usage/limits under `/account/*` beyond `status` and `metrics`. Destination create/update is Later. Do not invent `GET /accounts/outreach`.

`POST /syncs/:id/retry` and `POST /destinations/:id/deliveries/:deliveryId/replay` exist (write) — list them in Caution if relevant; **do not perform them from this skill**.

`POST /blocklists/:id/pause` and `POST /blocklists/:id/resync` exist (write) — list them in Caution if relevant; **do not perform them from this skill**. Verb is **resync**, never `rebuild`. SEP push is additive: pause/resync change OutboundSync's pipeline only — they do not clear Instantly / Smartlead / etc. If the user asks how to run a scheduled reload, put this recipe in Caution and still do not execute: (1) `GET /blocklists` — pick `id`; (2) optionally clear the matching list **in the sequencer**; (3) `POST …/resync` (needs `write`; not this skill); (4) on `409`, skip / back off; (5) poll `GET /blocklists` until `status` leaves `FETCHING`/`SYNCING`, or inspect `lastError`.

## Output contract

GitHub-flavored markdown only. Render **only** this shape.

### Shape

```markdown
## API plan

- Intent: <one line>
- Key: <account|connection-scoped> · scopes <read|read+write> · <safe summary from /me>
- Vocabulary: <which of sources / forwarding / reply-relays / contacts-outreach / blocklists / observability / sync-monitoring applies>
- Calls: <ordered method + path, or "none — hand off">
- Hand off: <skill name + why, or "none">
- Caution: <OpenAPI gap / secrets / write exists but not this skill (retry / replay / pause / resync) — only if relevant>

## Prior outreach

- Query: email <value or none> · profileUrl <value or none>
- Found: <true | false>
- DNC: <false | true — reasons>
- Last touch: <daysSinceLastTouch / lastEventType / lastPlatform, or none>
- Filter: <✓ keep | ✗ skip> · <why>
- Caution: <blocklists not evaluated / social-only CRM gap — only if relevant>
```

Blank line between blocks. Omit `## Prior outreach` unless a lookup ran. Omit `Filter` unless the user gave a cadence (do not default to 90 days). Omit Caution lines that do not apply. Never print the API key or signing secrets.
