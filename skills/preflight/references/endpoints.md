# OutboundSync API map (preflight)

Base: `https://app.outboundsync.com/api/v1`

Auth header:

```http
Authorization: Bearer $OUTBOUNDSYNC_API_KEY
```

Never print, log, or commit the key. Prefer connection-scoped keys when least privilege matters.

## MCP when connected

Hosted OutboundSync MCP: `https://mcp.outboundsync.com/mcp` (streamable HTTP, same Bearer key). Setup: https://outboundsync.com/docs/integrations/ai-and-agents/mcp/

| Order | REST | MCP tool |
| --- | --- | --- |
| 1 | `GET /me` | `get_me` |
| 2 | `GET /connections` | `list_connections` |
| 3 | `GET /account/status` | `get_account_status` |
| 4 | `GET /sources` | `list_sources` |
| 5 | `GET /destinations/reply-relays` | `list_reply_relays` |

Prefer MCP tools when the client has OutboundSync MCP connected; otherwise use REST. Output contract is unchanged.

## Endpoints used by this skill

| Order | Method + path | Why preflight calls it |
| --- | --- | --- |
| 1 | `GET /me` | Validate key; list accessible connections (`id`, `crm`, `organizationDomain`); note `apiKey.connectionScope` / `connectionId`. |
| 2 | `GET /connections` | Per-connection OAuth `status`, `organizationId`, and plan `capabilities{sync, destinations, blocklists}`. |
| 3 | `GET /account/status` | Top-level `ready`, `blockers[]`, `warnings[]`; per-connection `crmConnection`, `sources`, `destinations`, `blocklists` component statuses. |
| 4 | `GET /sources` | Inbound Sources paste URLs, platform, config flags, forwarding destinations, bound reply relay. Paginate until exhausted. |
| 5 | `GET /destinations/reply-relays` | Reply-relay catalog (CRM-card advisory only; not a gate). |

Docs: https://outboundsync.com/docs/api/v1/

Creating API keys: https://outboundsync.com/docs/api/authentication/creating-api-keys/

## Related skills (not called here)

| Skill | When |
| --- | --- |
| `api` | General API vocabulary, scopes, discovery |
| `sync-monitoring` | OutboundSync-emitted Sync Monitoring Webhooks (`/webhooks`, `/events`, `sync.failed`) — **not** Sources paste URLs |

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

When Instantly MCP or Instantly API credentials are available, use them for Phase 3 Instantly gates (accounts, campaigns, Instantly-side webhooks pointing at the OutboundSync **Source** URL). If neither is available, treat Instantly as MANUAL/unverified after confirming the OutboundSync source(s) exist.

Instantly `webhooks_list` is the SEP’s webhook config — not OutboundSync Sync Monitoring (`sync-monitoring` skill).
