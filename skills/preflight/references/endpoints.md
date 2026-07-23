# OutboundSync API map (preflight)

Base: `https://app.outboundsync.com/api/v1`

Auth header:

```http
Authorization: Bearer $OUTBOUNDSYNC_API_KEY
```

Never print, log, or commit the key. Prefer connection-scoped keys when least privilege matters.

## Endpoints used by this skill

| Order | Method + path | Why preflight calls it |
| --- | --- | --- |
| 1 | `GET /me` | Validate key; list accessible connections (`id`, `crm`, `organizationDomain`); note `apiKey.connectionScope` / `connectionId`. |
| 2 | `GET /connections` | Per-connection OAuth `status`, `organizationId`, and plan `capabilities{sync, destinations, blocklists}`. |
| 3 | `GET /account/status` | Top-level `ready`, `blockers[]`, `warnings[]`; per-connection `crmConnection`, `sources`, `destinations`, `blocklists` component statuses. |
| 4 | `GET /sources` | Inbound paste URLs, platform, config flags, and destination bindings. Paginate until exhausted. |

Docs: https://outboundsync.com/docs/api/v1/

Creating API keys: https://outboundsync.com/docs/api/authentication/creating-api-keys/

## Sensitive fields

| Field | Print? |
| --- | --- |
| API key / Bearer token | Never |
| `sources[].url` | Only as a full paste under a `Next` step that needs it |
| `destinations[].url` | Only as a full paste under a `Next` step that needs it |
| Capabilities, config booleans, CRM names, blocker codes | Safe |

## ComponentStatus mapping (destinations / blocklists)

| Status | How to render on the CRM card |
| --- | --- |
| `ready` | Ready — include count when available (`<n> enabled` / `<n> endpoint(s)`) |
| `not_configured` | Advisory — feature on plan, nothing set up |
| `disabled` | `disabled on plan` — no warning |
| `error` | `error: <lastError>` |

## Optional Instantly surface

When Instantly MCP or Instantly API credentials are available, use them for Phase 3 Instantly gates (accounts, campaigns, webhooks). If neither is available, treat Instantly as MANUAL/unverified after confirming the OutboundSync source(s) exist.

This skill does **not** assume an OutboundSync-hosted MCP exists.
