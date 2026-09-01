---
name: preflight
description: >-
  Run a read-only OutboundSync + SEP launch-readiness check across CRM OAuth,
  Sources/sync pipeline, and sales engagement platforms (SEP inbound paste URLs,
  mailboxes, campaigns). Use when the user asks if they are ready to launch,
  checks outbound/campaign readiness, pastes source URLs, asks about Sources or
  SEP inbound webhook wiring, or wants CRM sync / account-status readiness. For
  OutboundSync-emitted Sync Monitoring Webhooks (sync.failed / deliveries), use
  the sync-monitoring skill instead.
license: MIT
compatibility: Requires OUTBOUNDSYNC_API_KEY in the environment and HTTPS access to app.outboundsync.com, or OutboundSync MCP connected at https://mcp.outboundsync.com/mcp with the same Bearer key. Optional Instantly MCP/API for automated Instantly gates.
metadata:
  author: outboundsync
  version: "1.2.0"
---

# OutboundSync launch preflight

Run **read-only**. Never write, activate, pause, or re-point anything. Never print, log, or commit the API key. Never print `sources[].url` or `destinations[].url` except as a full paste URL under a `Next` step that needs it. Capabilities and config flags are safe to print.

Render **only** the fixed output shape in this skill — no prose outside it.

**Vocabulary:** “Webhook wiring” in this skill means the SEP → OutboundSync **Sources** paste URL (`sources[].url`). OutboundSync-emitted Sync Monitoring Webhooks (`/api/v1/webhooks`, `sync.failed`) are a different surface — hand off to `sync-monitoring`. API vocabulary bootstrap → `api`.

## Credentials

**Prefer OutboundSync MCP when connected** (`https://mcp.outboundsync.com/mcp`, streamable HTTP, `Authorization: Bearer osapi_...`). Otherwise use REST with `$OUTBOUNDSYNC_API_KEY` from the environment.

- REST base URL: `https://app.outboundsync.com/api/v1`
- MCP setup: https://outboundsync.com/docs/integrations/ai-and-agents/mcp/
- Docs: https://outboundsync.com/docs/api/v1/

See [references/endpoints.md](references/endpoints.md) for the REST ↔ MCP map. Output contract is identical either way.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](../../DISCLAIMER.md).

## Phase 1 — OutboundSync pipeline (always, in order)

Use MCP tools when OutboundSync MCP is connected; otherwise call the REST paths below. Same fields either way.

1. `get_me` / `GET /me` → `account.email`, `apiKey.connectionScope` / `connectionId`, `connections[]` (`id`, `crm`, `organizationDomain`).
2. `list_connections` / `GET /connections` → per connection: `id`, `crm`, `status`, `organizationDomain`, `organizationId`, `capabilities{sync, destinations, blocklists}`, `createdAt`.
3. `get_account_status` / `GET /account/status` → top-level `ready`, `blockers[]`, `warnings[]`, per-connection component statuses (`crmConnection`, `sources`, `destinations`, `blocklists`).
4. `list_sources` / `GET /sources` → per source: `platform`, `connectionId`, `url`, `config{createOrUpdateCompany, createOrUpdateTask, assignContactOwner, salesforceObjectType}`, `destinations[]{url, description, eventTypes, isDelayed}`, bound `replyRelay` when present. Paginate to exhaustion.
5. `list_reply_relays` / `GET /destinations/reply-relays` → reply-relay catalog for accessible connections (advisory on the CRM card; does **not** change gate math). Sources may already embed a bound `replyRelay`.

Join by `connectionId`. Render one CRM card + one OutboundSync (pipeline) card per connection. When >1 connection, disambiguate gauge labels by domain (e.g. `CRM (acme.com)`, `OutboundSync (acme.com)`).

### Gates (faithful split of per-connection ready = crmConnection.ready && sources.ready)

- **CRM BLOCKED** iff `crmConnection.status !== "ready"` (map to `crm_disconnected` when that blocker is present). Capabilities are context only — never fail the CRM gate for `capabilities.sync` off; that surfaces as `sync_not_enabled` on the pipeline card.
- **OutboundSync (pipeline) BLOCKED** iff `sources.status !== "ready"` (`sync_not_enabled` | `no_sources`). Warnings never block.

Card text: preserve each blocker's meaning in one short ✗ line. Convert remediation into the shortest Next action. Include a `docUrl` only when it helps resolve that action.

## Phase 2 — Detect platforms

Group `/sources` by `platform` + `connectionId`. The expected SEP→OutboundSync webhook target is that source's exact `url`.

Multiple sources for one platform: never pick the first. Show the count and short identifiers (`…/webhooks/<code>`). Ask which source pairs with the target campaign before campaign-specific webhook checks.

Run Phase 3 per detected platform only. If `no_sources` blocks the pipeline, invent no SEP rows — gauge is CRM + OutboundSync only (total 2).

## Phase 3 — SEP-specific readiness

If an MCP/API exists for the platform, run its checks. If not: confirm the source(s) exist, mark the SEP **MANUAL** (unverified — never a ✓ pass), and put verification in Next.

API/MCP/auth failures are **UNVERIFIED**, not empty results. Never invent empty mailboxes/campaigns/webhooks from a failed call.

Paginate accounts, campaigns, webhooks, and sources to exhaustion.

Never duplicate destination-forwarding recap in a SEP card — destinations live only on the CRM card.

### Instantly (MCP / Instantly API, all read-only)

When Instantly MCP or Instantly API access is available:

1. `workspace_get` → workspace + plan.
2. `list_accounts(limit 100)` + `get_account` → count ACTIVE senders vs paused/error; warmup + daily limit. Require ≥1 active sender with daily limit > 0.
3. `get_warmup_analytics` → health score. If Instantly docs give no numeric threshold, treat as advisory (·), not a hard block.
4. `accounts_ctd_status(host)` when link/open tracking is on → SSL + CNAME ok; otherwise advisory unless sending is impossible.
5. Target campaign: use the named one; if none named → sole launchable campaign if exactly one; if zero → ✗ no sendable campaign; if multiple → ask which. `get_campaign` → status ≠ completed, ≥1 sequence step, senders assigned, leads present, schedule set.
6. `campaigns_sending_status(id, with_ai_summary=true)` → authoritative sendability; quote the summary meaning in one line.
7. `webhooks_list` → webhook whose `target_hook_url` **exactly** equals the chosen Instantly source url (reject trailing whitespace/tabs), status enabled, `event_type` `all_events` or covers EMAIL_SENT/REPLY/OPEN, campaign filter (if any) includes the target campaign. Skip campaign-filter checks until a campaign is identified.
8. `webhook_events_summary` → prefer matching webhook/campaign scope; workspace-wide failure counts are advisory (·) only.

**Instantly BLOCKED** if any of: 0 active senders; not sendable; no exact-match webhook; matching webhook disabled or filtered away. Warmup/CTD/unscoped delivery noise are WARN (·) unless they make sending impossible.

### Other platforms (e.g. Smartlead)

Confirm source(s) exist, mark MANUAL, list short identifiers, instruct UI verification. Never mark MANUAL as ✓ Ready.

## Gates (count these exactly for the status gauge)

- **CRM (1):** CRM connected (`crmConnection.status === "ready"`).
- **OutboundSync / pipeline (1):** sources+sync enabled (`sources.status === "ready"`).
- **Each SEP (3):** ≥1 active mailbox · exact-match webhook wired+enabled · sendable campaign.
- A gate counts as passed only when verified true. Manual/unverified SEPs have zero passed gates and render as an unverified row.
- Gauge total is dynamic: sum of CRM + pipeline + 3 per automated SEP. SEP rows exist only for platforms detected in `/sources`. When `no_sources`, total = 2 (CRM + OutboundSync).

## CRM card (one per connection)

Counted gate is OAuth only; everything else is advisory recap of how the integration is configured in OutboundSync.

Header: `### CRM — <CRM>` with context `` `Connection <id> · <domain> · org <orgId>` ``.

- Gate: `✓ Connected — <CRM> OAuth ready` OR `✗ Disconnected — crm_disconnected` (→ Next: reconnect).
- `· Capabilities: sync <on/off> · destinations <on/off> · blocklists <on/off>` (from `GET /connections`; plan context, not a gate).
- `· Integration config` — per source under this connection: `<platform> → company <✓/✗> · task <✓/✗> · owner <✓/✗>` (+ `SF object: <type>` only when Salesforce; omit when null).
- `· Destinations (forwarding, not CRM writes): <n> endpoint(s)` listing `description → eventTypes` from `sources[].destinations[]`, OR `none — events still sync to CRM natively`. Use connection-level `destinations{status,count}` for the count/advisory. Honor ComponentStatus: ready / not_configured (advisory) / disabled on plan (no warning) / error.
- `· Reply relays: <n> in catalog` (from `/destinations/reply-relays`) and/or bound relays on sources — advisory only; never a launch gate.
- `· Blocklists: <status>` — map ComponentStatus: ready (`<n> enabled`) / not_configured / disabled on plan / error: `<lastError>`.

Distinguish disabled (feature off on plan → no warning, show "disabled on plan") from not_configured (feature on, nothing set up → advisory) for both destinations and blocklists.

## OutboundSync / pipeline card (one per connection)

Header: `### OutboundSync` with context `` `<CRM> · <domain>` `` (or domain-disambiguated label when multi-connection).

- Gate: `✓ Sources + sync enabled` OR ✗ lines for `sync_not_enabled` / `no_sources`.
- Do not re-list destinations/blocklists/config here — those live on the CRM card. Pipeline card is sources/sync gate only.

## Output contract

GitHub-flavored markdown only. Layout is the spec:

1. `##` for the verdict.
2. Immediately below it, one fenced ```text status gauge block.
3. Then `###` CRM card(s), then `###` OutboundSync card(s), then `###` per SEP, then `### Next`.
4. Blank line between every block. Every status line under a system is a `-` bullet. Never two checks on one line. Never rely on soft line breaks.
5. Marks: ✓ verified pass · ✗ blocker · · warning/manual/unverified. No colored emoji, no ASCII boxes.
6. Elide URLs in headers as `…/webhooks/<code>`. When a Next step needs a paste, put the FULL exact URL on the next line in inline code.
7. Show `### Next` only when overall is not ready; each item maps to a ✗ or unverified · above.

### Status gauge (inside the ```text block)

- Bars are 20 wide: █ passed gate · ░ failed/missing gate · ▒ unverified/manual.
- One `Overall` row, then one row per system in order: CRM, OutboundSync, then each SEP. Left-pad every label to the width of the longest label so all bars start in the same column.
- Row fill: filled = `round(passed / total * 20)` █ cells, remainder ░. A fully manual/unverified row is 20 ▒ cells (partial-verified manual rows fill █ for confirmed gates).
- After the bar + two spaces:
  - Overall → `<passed>/<total> · <ready|not ready>[ · <n> manual]`. Total = sum of automated gates across all systems; exclude manual systems from the fraction and append `· <n> manual` when any exist.
  - System → `<✓|✗|·> <ready | <passed>/<total> | manual — <hint>>`.
- The gauge is the glance layer; the `###` sections carry the specifics.

### Shape

````markdown
## <Ready to launch | Not ready to launch>

```text
Overall <bar> <p>/<t> · <verdict>[ · <n> manual]

CRM <bar> <mark> <ready | p/t>
OutboundSync <bar> <mark> <ready | p/t>
<SEP> <bar> <mark> <ready | p/t | manual — hint>
```

### CRM — <CRM>
`Connection <id> · <domain> · org <orgId>`

- <✓/✗ OAuth gate line>
- · Capabilities / Integration config / Destinations / Blocklists advisories

### OutboundSync
`<CRM> · <domain>`

- <✓/✗ sources+sync gate line>

### <SEP>
`Connection <id> · …/webhooks/<code>`

- <✓ pass line | ✗ blocker line | · advisory/manual line>

### Next
1. <shortest action tied to a ✗ or unverified · above>
   `<full exact URL when the step requires pasting>`
````

Worked examples: [references/examples.md](references/examples.md).

## Verdict logic (compute, never print as its own section)

- Overall **Ready** only if every CRM card is connected AND every OutboundSync pipeline card is ready AND every SEP is ✓ Ready (all gates passed) or the user has explicitly confirmed each MANUAL check in this conversation.
- Manual/unverified SEPs keep overall Not ready and appear in Next until confirmed.
- Keep mailbox addresses and source codes verbatim where shown; full paste URLs appear only under the Next step that needs them.
