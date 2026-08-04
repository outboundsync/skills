# Sync Monitoring event types

## Active (subscribable)

| Type | When |
| --- | --- |
| `sync.failed` | Source→CRM sync transitions healthy → failing (per incident, not per job) |
| `sync.recovered` | Previously failing sync starts succeeding again |

Empty / omitted `enabledEvents` on create = all **subscribable** active types (not `test.ping`, not reserved).

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
