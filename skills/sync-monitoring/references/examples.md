# Sync Monitoring — rendered examples

Illustrative data (`example.com` hosts, made-up ids and counts). The layout is the contract; the values are not.

## Healthy

User: "Are my Sync Monitoring webhooks delivering?"

Calls: `get_me` → `list_webhooks` → `list_webhook_deliveries` (each active endpoint, limit 25) → `list_events` (limit 25) → `get_syncs_metrics` (last 7 days).

````markdown
## Sync Monitoring healthy

```text
Overall     ████████████████████  5/5 · healthy

Access      ████████████████████  ✓ ready
Endpoints   ████████████████████  ✓ 2/2 healthy
Deliveries  ████████████████████  ✓ 50/50 ok
Events      ████████████████████  ✓ 25/25 delivered
CRM syncs   ████████████████████  ✓ 1,289/1,289 ok · 7 days
```

### Access
`account-scoped · read`

- ✓ Account-scoped key with platform webhooks on

### Endpoints
`2 of 20 registered`

- ✓ oswhk_7Qm2… · hooks.example.com · sync.failed, sync.recovered · active
- ✓ oswhk_Lp90… · alerts.example.org · all events · active

### Deliveries
`last 25 attempts per active endpoint`

- ✓ oswhk_7Qm2… · 25/25 ok · last SUCCEEDED 200 2h ago
- ✓ oswhk_Lp90… · 25/25 ok · last SUCCEEDED 204 2h ago

### Events
`last 25 events`

- ✓ All delivered

### CRM syncs
`2026-09-21 → 2026-09-28`

- ✓ No sync errors · 12 benign skips
````

## Auto-disabled endpoint and sync errors

The endpoint that carried `sync.failed` hit 20 consecutive failures and auto-disabled. The other endpoint only takes `sync.recovered`, so no healthy endpoint receives failure alerts while CRM sync errors pile up.

````markdown
## Sync Monitoring needs attention

```text
Overall     ████████░░░░░░░░░░░░  2/5 · needs attention

Access      ████████████████████  ✓ ready
Endpoints   ░░░░░░░░░░░░░░░░░░░░  ✗ none healthy cover sync.failed
Deliveries  ████████████████████  ✓ 25/25 ok
Events      ██████████████░░░░░░  ✗ 18/25 delivered
CRM syncs   ███████████████████░  ✗ 1,216/1,277 ok · 7 days
```

### Access
`account-scoped · read+write`

- ✓ Account-scoped key with platform webhooks on

### Endpoints
`2 of 20 registered`

- ✗ oswhk_7Qm2… · hooks.example.com · sync.failed, sync.recovered · auto-disabled 2026-09-24
- ✓ oswhk_Lp90… · alerts.example.org · sync.recovered · active

### Deliveries
`last 25 attempts per active endpoint`

- ✓ oswhk_Lp90… · 25/25 ok · last SUCCEEDED 204 3h ago

### Events
`last 25 events`

- ✗ 7 undelivered — newest osevt_c81f… sync.failed 40m ago

### CRM syncs
`2026-09-21 → 2026-09-28`

- ✗ 61 errors — sync.failed fires on the first auth/billing error, else after 3 in a row per source × connection · 12 benign skips

### Next
1. Fix the receiver at hooks.example.com (it returned 5xx before auto-disabling), then re-enable it
   `update_webhook oswhk_7Qm2… isActive=true`
2. Replay the 7 undelivered sync.failed events once it is back (7 `replay_webhook_delivery` calls, proposed one by one)
3. Inspect the failing CRM syncs with the api skill: `list_syncs status=error` for the same window
````

Steps 1–2 are writes: on "do it", render `### Proposed change` listing each call as its own bullet and stop for confirmation.

## Connection-scoped key

`/webhooks*` is unreadable with this key, so those rows are UNVERIFIED — not "none registered". `/events` still works for this connection because platform webhooks are on.

````markdown
## Sync Monitoring needs attention

```text
Overall     █████████████░░░░░░░  2/3 · needs attention · 2 unverified

Access      ░░░░░░░░░░░░░░░░░░░░  ✗ connection-scoped key
Endpoints   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  · UNVERIFIED — 403
Deliveries  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  · UNVERIFIED — 403
Events      ████████████████████  ✓ 25/25 delivered
CRM syncs   ████████████████████  ✓ 312/312 ok · 7 days
```

### Access
`connection-scoped · read`

- ✗ Connection-scoped key — /webhooks needs an account-scoped key

### Endpoints
`not readable with this key`

- · UNVERIFIED — 403 "Webhook endpoint management requires an account-scoped API key"

### Deliveries
`not readable with this key`

- · UNVERIFIED — 403, same cause

### Events
`last 25 events · connection 177 + account-level`

- ✓ All delivered

### CRM syncs
`2026-09-21 → 2026-09-28 · connection 177`

- ✓ No sync errors · 4 benign skips

### Next
1. Create an account-scoped key and rerun: https://outboundsync.com/docs/api/authentication/creating-api-keys/
````

## Register an endpoint — propose, then apply

User: "Wire Sync Monitoring to https://hooks.example.com/os"

Nothing is registered yet, so there is nothing to deliver to and nothing to sample.

````markdown
## Sync Monitoring needs attention

```text
Overall     ██████████░░░░░░░░░░  1/2 · needs attention · 2 unverified

Access      ████████████████████  ✓ ready
Endpoints   ░░░░░░░░░░░░░░░░░░░░  ✗ none healthy cover sync.failed
Deliveries  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  · UNVERIFIED — no endpoints
Events      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  · UNVERIFIED — no endpoints
```

### Access
`account-scoped · read+write`

- ✓ Account-scoped key with platform webhooks on

### Endpoints
`0 of 20 registered`

- ✗ No Sync Monitoring endpoint — sync.failed alerts go nowhere

### Proposed change
`write-on-confirm — reply "yes" to run exactly this`

- · Will POST /webhooks registering https://hooks.example.com/os for sync.failed + sync.recovered
````

The CRM syncs row is left out because the user asked only to register; a full diagnose includes it.

User: "Yes, create it"

After the write, the read-only diagnose re-runs to draw the updated gauge.

````markdown
## Sync Monitoring unverified

```text
Overall     ████████████████████  2/2 · unverified

Access      ████████████████████  ✓ ready
Endpoints   ████████████████████  ✓ 1/1 healthy
Deliveries  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  · UNVERIFIED — no attempts yet
Events      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  · UNVERIFIED — no events yet
```

### Applied
`POST /webhooks · 201`

- ✓ Registered oswhk_Rt41… · hooks.example.com · sync.failed, sync.recovered · active
- · Signing secret (shown once — store it now): `oswhsec_…`

### Next
1. Send a test event so Deliveries and Events have something to verify: `test_webhook oswhk_Rt41…` (a write — confirm first)
````

## Wrong skill

User: "Is my Instantly webhook pointed at OutboundSync?"

That is the SEP → OutboundSync **Sources** paste URL → hand off to `preflight`. This skill covers webhooks that OutboundSync sends.
