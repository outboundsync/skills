---
name: api
description: >-
  Guide agents through the OutboundSync API v1 and hosted MCP: auth, scopes,
  Sources vs destinations vs Sync Monitoring Webhooks vocabulary, discovery,
  pipeline metrics, and which specialized skill to run. Use when the user asks
  how to use the OutboundSync API, what their API key can access, which
  endpoint or MCP tool to call, OpenAPI discovery, account vs connection keys,
  read vs write scopes, sync or delivery counts, how API work relates to the
  preflight and sync-monitoring skills, or about prior outreach, already
  contacted, skip contacts I already reached, GET /contacts/outreach,
  blocklist syncs, or GET /blocklists.
license: MIT
compatibility: Requires OUTBOUNDSYNC_API_KEY in the environment and HTTPS access to app.outboundsync.com for live calls, or OutboundSync MCP connected at https://mcp.outboundsync.com/mcp with the same Bearer key.
metadata:
  author: outboundsync
  version: "1.5.1"
---

# OutboundSync API v1

Teach and lightly exercise the public API. **Read-only.** Never print, log, or commit the API key. Never print webhook signing secrets. Treat `sources[].url` and `destinations[].url` as sensitive (full paste only when the user needs to copy them).

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](https://github.com/outboundsync/skills/blob/main/DISCLAIMER.md).

Render **only** the output shape below — no prose outside it.

## Credentials

**Prefer OutboundSync MCP when connected** (`https://mcp.outboundsync.com/mcp`, streamable HTTP, `Authorization: Bearer osapi_...`). Otherwise REST with `$OUTBOUNDSYNC_API_KEY` from the environment against `https://app.outboundsync.com/api/v1`.

- MCP setup: https://outboundsync.com/docs/mcp/setup/
- API reference: https://outboundsync.com/docs/api/v1/
- Keys: https://outboundsync.com/docs/api/authentication/creating-api-keys/

Every REST path, its MCP tool, access rules, response fields, and error handling: [references/endpoints.md](references/endpoints.md). Prior-outreach contract: [references/contacts-outreach.md](references/contacts-outreach.md). Rendered examples: [references/examples.md](references/examples.md).

## Auth and scopes

| Concern | Rule |
| --- | --- |
| Header | `Authorization: Bearer osapi_…` (REST and MCP) |
| `read` scope | Every GET |
| `write` scope | `retry_sync`, `replay_destination_delivery`, `pause_blocklist`, `resync_blocklist`, and the webhook mutations — **never from this skill** |
| Account-scoped key | Sees all connections; **required** for `/webhooks*` |
| Connection-scoped key | Sees exactly one connection everywhere — expected, not an error; `403` on `/webhooks*`; may read `/events` for its connection |
| No API-enabled connection | Every authenticated route returns `403` — enable API access for a connection in the dashboard |
| `canUseWebhooks` | Account flag for Sync Monitoring. Off → `403` "Platform webhooks are not enabled for this account" on `/webhooks*` **and** `/events` reads. `/me` does not expose it; only the `403` reveals it. |
| Rate limits | 120 / 60s per account; `/contacts/outreach` 600 / 60s. Read `X-RateLimit-Remaining` when present (not on `/contacts/outreach` or the per-IP `429`); on `429` wait `Retry-After`. |

On `401` / `403` / `429`, relay the response message and the shortest fix. Never invent admin flags or capabilities absent from the response.

## Vocabulary (keep distinct)

| Concept | API term | Path / field |
| --- | --- | --- |
| SEP inbound paste URL | **source** | `GET /sources` (`url`) |
| Forward raw events to customer HTTPS | **destination** (forwarding) | catalog `GET /destinations`; bindings on `sources[].destinations[]` |
| Reply-CC a sales rep | **destination** (reply relay) | `GET /destinations/reply-relays` (+ bound on sources) |
| Prior-outreach lookup | **contacts/outreach** | `GET /contacts/outreach` |
| CRM→SEP blocklist **sync configs** | **blocklists** | `GET /blocklists` — not the reserved `contacts/outreach` `blocklists.*` |
| OutboundSync-emitted Sync Monitoring | **webhooks** + **events** | `/webhooks`, `/events` → `sync-monitoring` |

Inbound `POST /webhooks/:code` is the Sources paste target — not Sync Monitoring. Forwarding `GET /destinations/:id/deliveries` is not Sync Monitoring `GET /webhooks/:id/deliveries`.

## Discovery

1. `get_me` / `GET /me` — its `links` name the main related paths (not blocklists, webhooks, events, or health).
2. Auth-free `GET /openapi.json` / `GET /openapi.yaml` — authoritative, one operation per MCP tool.
3. `/api/v1/*` responses carry `Link: rel="service-desc"` / `service-doc`.

A JSON `404` with `message: "Cannot GET /api/v1/…"` means the route is **not shipped** — do not retry it or invent a replacement. The not-shipped list is in [references/endpoints.md](references/endpoints.md).

## What this skill may call (read-only)

Bootstrap when the user asks what the key can see or how to start:

1. `get_me` / `GET /me`
2. `list_connections` / `GET /connections`
3. `get_account_status` / `GET /account/status`
4. `list_sources` / `GET /sources` (one call — not paginated; elide URLs unless pasting)
5. `list_destinations` + `list_reply_relays` / `GET /destinations` + `GET /destinations/reply-relays`
6. `list_blocklists` / `GET /blocklists`

When the user asks about volume, sync health, or forwarding (not on every bootstrap), with full ISO-8601 `from`/`to` at most 31 days apart:

- `get_account_metrics` / `GET /account/metrics` — one call for the whole Metrics card. It is the heaviest read: past the 20s query limit it returns a JSON `504`. On a `504` or timeout, retry once with a narrower `from`/`to` (or one `connectionId`), else fall back to `get_syncs_metrics` + `get_requests_metrics` and mark Deliveries `· UNVERIFIED — timed out`
- `get_syncs_metrics`, `get_requests_metrics`, `get_destination_delivery_metrics` — narrower counts
- `list_syncs`, `list_source_syncs`, `get_sync`, `list_requests`, `list_source_requests`, `list_deliveries`, `list_destination_deliveries`, `get_destination` — records; loop on `hasMore` / `nextCursor`

When the user asks about a contact, prior outreach, already contacted, or skip/delay enrollment:

- `get_contact_outreach` / `GET /contacts/outreach` — `email` and/or `profileUrl` (max 5, OR-unioned). Contract: [references/contacts-outreach.md](references/contacts-outreach.md)

When the user asks about blocklist syncs, suppression lists, pause, or resync:

- `list_blocklists` / `GET /blocklists` (optional `connectionId`). Map each list to one mark (see Output contract). Pause/resync are `write` — describe the recipe under `### Plan` Caution; never call them.

Do **not** render the preflight launch gauge here — "am I ready to launch?" belongs to `preflight`. Do **not** call any webhook tool — hand off to `sync-monitoring`.

## Route to specialized skills

| User intent | Skill |
| --- | --- |
| Ready to launch? Sources/SEP wired? CRM sync ready? | `preflight` |
| Sync Monitoring: diagnose or change **platform** webhooks, `sync.failed` / `sync.recovered`, webhook deliveries | `sync-monitoring` |
| What can my key access? Which call do I make? | this skill |
| Sync, request, or forwarding counts and records (GET) | this skill |
| Already outreached? Skip / delay enrollment? | this skill |
| CRM→SEP blocklist syncs (GET) | this skill |
| Campaign replies / attribution from CRM fields | `crm-analysis` (no API key) |

If the ask spans launch readiness and Sync Monitoring, say which skill runs first and why under `### Plan`.

## Writes that exist but are not this skill

List these under `### Plan` Caution only when relevant; never perform them:

- `retry_sync` (`POST /syncs/:id/retry`) and `replay_destination_delivery` (`POST /destinations/:id/deliveries/:deliveryId/replay`).
- `pause_blocklist` / `resync_blocklist` (`POST /blocklists/:id/pause|resync`). SEP push is additive — neither clears the sequencer. Scheduled-reload recipe: (1) `list_blocklists` → pick `id`; (2) optionally clear the list **in the sequencer**; (3) `resync_blocklist` (needs `write`); (4) on `409`, back off; (5) poll `list_blocklists` until `status` leaves `FETCHING`/`SYNCING`, or read `lastError`.
- Webhook mutations → `sync-monitoring`.

## Output contract

GitHub-flavored markdown only. Render only this shape; no prose outside it. It uses the pack's [status layout](https://github.com/outboundsync/skills/blob/main/CONVENTIONS.md#status-layout--required-for-readiness-health-and-audit-skills) card grammar: marks `✓` pass · `✗` blocker · `·` advisory or `UNVERIFIED — <reason>`; the mark leads every bullet; one check per line; blank line between blocks.

1. `##` states the key's access, or `## API access unverified` when `get_me` fails.
2. `### Access` always. `### Plan` always. `### Prior outreach`, `### Blocklists`, and `### Metrics` only when that lookup ran.
3. `### Next` only when the user has something to do (fix access, run a hand-off skill); each item maps to a `✗`, `UNVERIFIED`, or actionable `·` line above — a hand-off maps to the Plan card's `Hand off` line.
4. A failed call replaces that card's lines with one `· UNVERIFIED — <status or timeout>` line. Never render a failed lookup as "not found".

**Mark mapping:**

- Blocklists: `✓` `SYNCED` and enabled · `·` `CREATED` / `FETCHING` / `SYNCING` / `SYNCING_NEW_CONTACTS` (in progress) · `·` paused (`isEnabled: false`) · `✗` `lastError` present.
- Prior outreach, first line: `✗ Do not contact` when `doNotContact.value` is true; else `✓ Keep` or `✗ Skip` against the **user's** cadence; else `· No cadence given — not deciding`.
- Metrics meter: the bar is the **OK share**, not a score — syncs count `success` + `warning` (warnings are benign skips, as in `sync-monitoring`; a sync that never recorded a result counts as `error`), deliveries count `success`; 20 cells. A family with zero attempts shows no bar.

### Shape

````markdown
## API access — <account | connection>-scoped · <read | read+write>

### Access
`<key name> · <n> connection(s) · <crm @ domain, …>`

- ✓ Key valid
- <✓ Account-scoped — sees every connection | · Connection-scoped — connection <id> only>
- <✓ write scope | · read only — retry, replay, pause, and resync need write (not this skill)>
- · Sync Monitoring needs platform webhooks on (and an account-scoped key for `/webhooks`) — checked by sync-monitoring

### Plan
`<intent in a few words>`

- · Vocabulary: <sources | forwarding | reply relays | contacts/outreach | blocklists | observability | Sync Monitoring>
- · Calls: <tool / METHOD /path, in order — or "none — hand off">
- · Hand off: <skill — why>
- · Caution: <write exists but not this skill | secrets | not shipped>

### Prior outreach
`email <value | none> · profileUrl <value | none>`

- <✗ Do not contact — <reasons> | ✓ Keep — <why> | ✗ Skip — <why> | · No cadence given — not deciding>
- · Found: <yes — <n> events on <platforms> | no prior outreach on record>
- · Last touch: <<n> days ago · <lastEventType> · <lastPlatform> | never>
- · Outcomes: replied <yes | no> · bounced <yes | no> · unsubscribed <yes | no>
- · Blocklists not evaluated by this lookup

### Blocklists
`<n> sync config(s) · <connection id or "all connections">`

- <mark> <listName> · <platform> · <blockType> · <status> · <syncedCount> synced · <pendingCount> pending

### Metrics
`<from> → <to> · <all connections | connection <id> | source <id>>`

```text
Requests    <count> received
Syncs       <bar>  <pct>% ok · <warning> benign skips · <error> error
Deliveries  <bar>  <pct>% ok · <error> error
```

- · Share of attempts, not a quality score

### Next
1. <shortest action tied to a ✗, UNVERIFIED, or actionable · line>
   `<command or URL when the step needs one>`
````

Omit a bullet that does not apply (e.g. `Hand off: none`, `Caution` with nothing to say). Never print the API key or signing secrets.
