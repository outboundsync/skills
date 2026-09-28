# api — rendered examples

Illustrative data (`example.com` domains, made-up counts). The layout is the contract; the values are not.

## Connection-scoped, read-only key — "what can my key see?"

Calls: `get_me` → `list_connections` → `get_account_status` → `list_sources`.

````markdown
## API access — connection-scoped · read

### Access
`Clay enrichment · 1 connection · HubSpot @ acme.example.com`

- ✓ Key valid
- · Connection-scoped — connection 177 only
- · read only — retry, replay, pause, and resync need write (not this skill)
- · Sync Monitoring needs platform webhooks on (and an account-scoped key for `/webhooks`) — checked by sync-monitoring

### Plan
`Map what this key can reach`

- · Vocabulary: sources · forwarding · observability
- · Calls: get_me → list_connections → get_account_status → list_sources (2 sources: instantly, smartlead)
- · Hand off: preflight — you asked about launching next week
````

## Prior outreach with a cadence — "skip anyone we touched in the last 60 days"

Calls: `get_contact_outreach` with `email` and `profileUrl`.

````markdown
## API access — account-scoped · read

### Access
`Enrichment · 2 connections · HubSpot @ acme.example.com, Salesforce @ acme-eu.example.com`

- ✓ Key valid
- ✓ Account-scoped — sees every connection
- · read only — retry, replay, pause, and resync need write (not this skill)

### Plan
`Prior-outreach filter, 60-day cadence`

- · Vocabulary: contacts/outreach
- · Calls: get_contact_outreach (email + profileUrl, one contact)

### Prior outreach
`email dana@prospect.example.com · profileUrl linkedin.com/in/dana-example`

- ✗ Skip — last touched 23 days ago, inside your 60-day cadence
- · Found: yes — 7 events on instantly, heyreach
- · Last touch: 23 days ago · EMAIL_SENT · instantly
- · Outcomes: replied no · bounced no · unsubscribed no
- · Blocklists not evaluated by this lookup
````

## Prior outreach lookup timed out

A timeout is not "never contacted". Nothing is decided.

````markdown
## API access — account-scoped · read

### Access
`Enrichment · 2 connections · HubSpot @ acme.example.com, Salesforce @ acme-eu.example.com`

- ✓ Key valid
- ✓ Account-scoped — sees every connection

### Plan
`Prior-outreach filter, 60-day cadence`

- · Calls: get_contact_outreach (email)

### Prior outreach
`email sam@prospect.example.com · profileUrl none`

- · UNVERIFIED — lookup timed out after 30s (503); keep this contact out of the send until it resolves

### Next
1. Retry the lookup in a minute; if it keeps timing out, check https://outboundsync.com/docs/api/v1/ status notes
````

## Metrics and blocklists — "how is sync doing this week?"

Calls: `get_account_metrics` (`2026-09-21T00:00:00Z` → `2026-09-28T00:00:00Z`) → `list_blocklists`.

````markdown
## API access — account-scoped · read+write

### Access
`Ops · 1 connection · HubSpot @ acme.example.com`

- ✓ Key valid
- ✓ Account-scoped — sees every connection
- ✓ write scope

### Plan
`Weekly pipeline volume and blocklist state`

- · Vocabulary: observability · blocklists
- · Calls: get_account_metrics → list_blocklists
- · Caution: 61 sync errors — retry_sync exists (write) but is not this skill; list them with list_syncs status=error

### Blocklists
`2 sync configs · connection 177`

- ✓ Do-not-contact · instantly · ADDRESS · SYNCED · 4,812 synced · 0 pending
- ✗ Competitor domains · smartlead · DOMAIN · SYNCED · 310 synced · 12 pending — lastError: vendor rejected 12 rows

### Metrics
`2026-09-21 → 2026-09-28 · all connections`

```text
Requests    1,318 received
Syncs       ███████████████████░  95% ok · 12 benign skips · 61 error
Deliveries  ████████████████████  100% ok · 0 error
```

- · Share of attempts, not a quality score

### Next
1. Inspect the failed syncs: `list_syncs` with `status=error` for the same window
2. Fix the rejected Competitor domains rows in Smartlead, then resync from the dashboard or with a write-scoped tool
````
