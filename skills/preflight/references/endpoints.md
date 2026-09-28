# OutboundSync API map (preflight)

Base: `https://app.outboundsync.com/api/v1`

Auth header:

```http
Authorization: Bearer $OUTBOUNDSYNC_API_KEY
```

Never print, log, or commit the key. Prefer connection-scoped keys when least privilege matters.

## REST ↔ MCP tools (in call order)

Trimmed copy of the pack's full map (the `api` skill's `references/endpoints.md`); `npm run validate` keeps these rows matching it. Hosted MCP: `https://mcp.outboundsync.com/mcp` (streamable HTTP, same Bearer key). Setup: https://outboundsync.com/docs/mcp/setup/ — prefer MCP when connected; the output contract is unchanged either way.

| REST | MCP tool | Access | Owner / notes |
| --- | --- | --- | --- |
| `GET /me` | `get_me` | R | Validate the key; accessible connections; `apiKey.connectionScope` / `connectionId`. |
| `GET /connections` | `list_connections` | R | Per-connection OAuth `status`, `organizationId`, plan `capabilities{sync, destinations, blocklists}`. |
| `GET /account/status` | `get_account_status` | R | `ready`, `blockers[]`, `warnings[]`, per-connection components (enums below). |
| `GET /sources` | `list_sources` | R | Paste URLs, platform, config flags, forwarding bindings, bound reply relay. One call — not paginated. |
| `GET /destinations` | `list_destinations` | R | Forwarding catalog; `sourceIds: []` entries are unbound (CRM-card advisory only; not a gate). |

Docs: https://outboundsync.com/docs/api/v1/ · Creating API keys: https://outboundsync.com/docs/api/authentication/creating-api-keys/

## Failures are UNVERIFIED

Any `401`/`403`/`5xx`, timeout, non-JSON body (unknown `/api/v1/*` paths return HTML with `200`), or MCP `isError` (`{ error: { code, message, status? } }`) → render that card as `· UNVERIFIED — <status or message>` and its gauge row as 20 `▒`. Never read a failed call as "no sources" or "no blockers".

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

## `/account/status` enums

| Field | Values → CRM / pipeline card |
| --- | --- |
| `blockers[].code` | `crm_disconnected` (CRM ✗) · `sync_not_enabled` / `no_sources` (pipeline ✗) — gate `ready` |
| `warnings[].code` | `destinations_not_configured` · `blocklists_not_configured` · `blocklists_error` — advisory `·` only |
| `crmConnection.status` | `ready` · `disconnected` |
| `sources.status` | `ready` · `not_configured` · `disabled` |
| `destinations.status` | `ready` (`<forwardingCount> endpoint(s)`) · `not_configured` (advisory) · `disabled` (`disabled on plan`, no warning) — **no `error` value** |
| `blocklists.status` | `ready` (`<enabledCount> enabled`) · `not_configured` (advisory) · `disabled` (`disabled on plan`) · `error` (`error: <lastError>`) |

Every blocker and warning carries `message`, `remediation`, and `docUrl` — turn remediation into the shortest Next step.

## Optional Instantly surface

When Instantly MCP or Instantly API credentials are available, use them for Phase 3 Instantly gates (accounts, campaigns, Instantly-side webhooks pointing at the OutboundSync **Source** URL). If neither is available, treat Instantly as MANUAL/unverified after confirming the OutboundSync source(s) exist.

Instantly `webhooks_list` is the SEP’s webhook config — not OutboundSync Sync Monitoring (`sync-monitoring` skill).
