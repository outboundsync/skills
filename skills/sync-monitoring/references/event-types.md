# Sync Monitoring event types

## Active (subscribable)

| Type | When |
| --- | --- |
| `sync.failed` | Source→CRM sync transitions healthy → failing for a source × connection pair; one alert per incident, not per job. Fires on the **first** connection-breaking error (CRM auth, billing, app not installed) and after **3 consecutive** failures for anything else. Rate limits (429), CRM 5xx / network errors, update-only misses, and a missing sequencer API key never count. Exception: Salesforce record-lock errors still failing after their automatic retries count as failures. |
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
| `rate_limited` | CRM HTTP 429 | Check [automatic retries](#automatic-retries); a sync still `error` after them needs `retry_sync` or support |
| `network_transient` | Provider 5xx, network errors, token-refresh or record lock, Salesforce `INVALID_SESSION_ID` | Same as `rate_limited` |
| `unknown` | Unrecognized or internal error | Review recent syncs; contact support if it continues |

The live `remediation` text for `rate_limited` and `network_transient` says "No action needed — the sync will retry automatically." That is only true for the cases in the table below. Because these errors don't count toward `sync.failed`, `rate_limited` never appears in a payload. `network_transient` appears only after repeated Salesforce record-lock failures that ran out of retries.

Full catalog with example strings: https://outboundsync.com/docs/api/v1/#sync-failed-reasons

## Automatic retries

OutboundSync re-queues a failed CRM sync on its own only in these cases. Everything else (for example Salesforce rate limits, 5xx, or `INVALID_SESSION_ID`, and 5xx / network errors on Attio, Close, HighLevel, Pipedrive) is logged as an `error` sync and stays that way.

| CRM | Re-queued automatically | Budget |
| --- | --- | --- |
| HubSpot | 429, CRM 5xx, network errors | up to 7 retries, 1–6 min apart |
| Salesforce | Record lock (`UNABLE_TO_LOCK_ROW`) | up to 5 retries, 5–15 s apart |
| Attio, Close, HighLevel, Pipedrive | 429 only | up to 7 retries, seconds apart (CRM `Retry-After`, max 60 s) |

A sync whose retries run out stays `error`. When a retry succeeds, HubSpot, Salesforce, and Close update the original sync to `success`. Attio, HighLevel, and Pipedrive write a new `success` sync, and the original stays `error`, so don't count those leftover `error` rows as unresolved without checking for a later success. Manual `retry_sync` covers HubSpot and Salesforce only. Support can batch-requeue HubSpot, Salesforce, and Close.

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
