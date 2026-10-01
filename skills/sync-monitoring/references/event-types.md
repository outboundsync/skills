# Sync Monitoring event types

## Active (subscribable)

| Type | When |
| --- | --- |
| `sync.failed` | Source→CRM sync transitions healthy → failing for a source × connection pair; one alert per incident, not per job. Fires on the **first** connection-breaking error (CRM auth, billing, app not installed) and after **3 consecutive** failures for anything else. Transient errors (429, 5xx, timeouts), update-only misses, and a missing sequencer API key never count. |
| `sync.recovered` | Previously failing sync starts succeeding again (the next successful sync, not the reconnect itself) |

Empty / omitted `enabledEvents` on create = all **subscribable** active types (not `test.ping`, not reserved).

## `sync.failed` payload

`summary` reads `Sync <sourcePlatform> → <CRM> is failing: <reason>` (friendly CRM name, e.g. `HubSpot`). `data` carries `connectionId`, `crm` (enum, e.g. `HUBSPOT`), `sourceId`, `sourcePlatform`, `consecutiveFailures`, and:

- `reason` — one readable line: emails redacted to `[email]`, at most 240 characters, never raw JSON. Unknown Salesforce errors may show a sanitized `errorCode: message`.
- `remediation` — the fix to relay, with a dashboard and/or docs deep link. Pick the action from its category:

| Category | Cause | Action |
| --- | --- | --- |
| `reconnect` | Auth expired, invalid or revoked tokens, app not installed | Reconnect the CRM in the dashboard |
| `billing` | CRM HTTP 402 / plan or storage limit | Upgrade the CRM plan or free capacity |
| `config` | Missing sequencer API key, required field mapping, unsupported event | Fix the source or field mapping |
| `not_found` | Update-only mode and no record matched | Create the CRM record or turn off update-only |
| `rate_limited` | CRM HTTP 429 | None — the sync retries |
| `network_transient` | Provider 5xx, timeouts, token-refresh or row lock, Salesforce `INVALID_SESSION_ID` | None — the sync retries |
| `unknown` | Unrecognized or internal error | Review recent syncs; contact support if it continues |

Full catalog with example strings: https://outboundsync.com/docs/api/v1/#sync-failed-reasons

## Paused syncs

A `reconnect` or `billing` failure pauses CRM sync for that source × connection. Events that arrive while paused are not sent to the CRM: they appear as `error` syncs with message `sync_circuit_open`. Reconnecting the CRM (also after fixing a billing limit) resumes syncing for every source on that connection. Paused events are **not** replayed automatically — after the reconnect, propose `retry_sync` per sync (HubSpot/Salesforce, `write` scope; via the `api` skill's caution list) or point the user to OutboundSync support for a batch requeue.

## Test-only (not subscribable)

| Type | When |
| --- | --- |
| `test.ping` | Only via `POST /webhooks/:id/test` |

## Reserved (subscribe → 400)

Namespace held; not delivered yet:

- `connection.created` / `degraded` / `restored` / `removed`
- `blocklist.*` (including health variants)
- `destination.*` (forward failed/recovered)
- Provisional record-write names (`contact.created` / `company.created` — may become `sync.*`)

Always prefer the API error’s list of available types over guessing.
