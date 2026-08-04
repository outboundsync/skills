---
name: api
description: >-
  OutboundSync API v1 guide for agents: auth, scopes, Sources vs destinations vs
  Sync Monitoring Webhooks vocabulary, discovery, and which specialized skill to
  run. Use when the user asks how to use the OutboundSync API, what their API key
  can access, which endpoint to call, OpenAPI discovery, account vs connection
  keys, read vs write scopes, or how API work relates to preflight and
  sync-monitoring skills.
license: MIT
compatibility: Requires OUTBOUNDSYNC_API_KEY in the environment and HTTPS access to app.outboundsync.com for live calls.
metadata:
  author: outboundsync
  version: "1.0.0"
---

# OutboundSync API v1 (agent guide)

Teach and lightly exercise the public API. Default **read-only**. Never print, log, or commit the API key. Never print webhook signing secrets. Treat `sources[].url` and `destinations[].url` as sensitive (full paste only when the user needs to copy them).

Render **only** the fixed output shape below — no prose outside it.

**Note:** Best practices shared freely and without warranty — see [DISCLAIMER.md](../../DISCLAIMER.md).

## Credentials

- Load `$OUTBOUNDSYNC_API_KEY` from the environment (Bearer token).
- Base: `https://app.outboundsync.com/api/v1`
- Docs: https://outboundsync.com/docs/api/v1/
- Keys: https://outboundsync.com/docs/api/authentication/creating-api-keys/

Thin map: [references/endpoints.md](references/endpoints.md).

## Auth and scopes

| Concern | Rule |
| --- | --- |
| Header | `Authorization: Bearer osapi_…` |
| Default scope | `read` (GETs) |
| Mutations | Require `write` on the key (`POST`/`PATCH`/`DELETE`, rotate, test, replay) |
| Account-scoped key | Sees all connections; **required** for `/webhooks*` |
| Connection-scoped key | Sees one connection; fine for introspection + narrowed `/events`; **403** on `/webhooks*` |
| Rate limits | Honor `429` + `Retry-After`; see errors docs |

On `401` / `403` / `429`, summarize the error meaning and the shortest fix — do not invent admin flags beyond the response body.

## Vocabulary (keep distinct)

| Concept | API term | Path / field |
| --- | --- | --- |
| SEP inbound paste URL | **source** | `GET /sources` (`url`) |
| Forward raw events to customer HTTPS | **destination** (forwarding) | `sources[].destinations[]` |
| Reply-CC a sales rep | **destination** (reply relay) | `GET /destinations/reply-relays` (+ bound on sources) |
| OutboundSync-emitted Sync Monitoring | **webhooks** + **events** | `/webhooks`, `/events` |

Inbound `POST /webhooks/:code` is the Sources paste target — not Sync Monitoring.

## Discovery

1. Prefer `GET /me` → use `links` for related paths.
2. Auth-free: `GET /openapi.json` / `GET /openapi.yaml`.
3. Every `/api/v1/*` response may carry `Link: rel="service-desc"` / `service-doc`.

**OpenAPI gap:** live OpenAPI may omit `/destinations/reply-relays`, `/webhooks*`, and `/events*` even though they are implemented. Prefer [references/endpoints.md](references/endpoints.md) and https://outboundsync.com/docs/api/v1/ over an incomplete OpenAPI document.

## What this skill may call

Light introspection when the user asks what the key can see or how to start:

1. `GET /me`
2. `GET /connections`
3. `GET /account/status`
4. `GET /sources` (paginate; elide sensitive URLs unless pasting)
5. `GET /destinations/reply-relays`

Do **not** run the full preflight gauge here. Do **not** mutate webhooks here — hand off to `sync-monitoring`.

## Route to specialized skills

| User intent | Skill |
| --- | --- |
| Ready to launch? Sources/SEP wired? CRM sync ready? | `preflight` |
| Sync Monitoring: register/diagnose/replay platform webhooks, `sync.failed` / `sync.recovered`, deliveries | `sync-monitoring` |
| Campaign replies / attribution from CRM fields | `crm-analysis` (no API key) |
| How do I use the API / what can my key access? | this skill (`api`) |

If the ask spans launch readiness and Sync Monitoring, say which skill runs first and why.

## Deferred (do not invent)

Not callable yet (or reserved): standalone `/destinations`, `/blocklists`, `POST /connections/:id/test`, source create/logs, usage/limits under `/account/*` beyond `status`.

## Output contract

GitHub-flavored markdown only:

```markdown
## API plan

- Intent: <one line>
- Key: <account|connection-scoped> · scopes <read|read+write> · <safe summary from /me>
- Vocabulary: <which of sources / forwarding / reply-relays / sync-monitoring applies>
- Calls: <ordered method + path, or "none — hand off">
- Hand off: <skill name + why, or "none">
- Caution: <OpenAPI gap / secrets / write confirmation — only if relevant>
```

Blank line between bullets. Never print the API key or signing secrets.