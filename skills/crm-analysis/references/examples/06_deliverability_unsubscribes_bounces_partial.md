# Example 06: Deliverability Issues (PARTIAL, strict)

- Intent ID: `deliverability_unsubscribes_bounces`
- Date window: `last 30 days`
- CRM scope: `HubSpot`
- Platform scope: `Smartlead`

## User question
"What are our unsubscribe and bounce issues?"

## Available fields (sample)
- `os_last_bounce_time`
- `os_last_unsubscribe_time`
- `os_last_sent_time`
- Missing: `os_last_sent_address`

## Rendered output

````markdown
## Partial — deliverability (unsubscribes and bounces)

```text
Overall                   ███████████████░░░░░  3/4 · partial

os_last_bounce_time       ████████████████████  ✓ present
os_last_unsubscribe_time  ████████████████████  ✓ present
os_last_sent_time         ████████████████████  ✓ present
os_last_sent_address      ░░░░░░░░░░░░░░░░░░░░  ✗ missing
```

### Field check
`deliverability_unsubscribes_bounces · strict · HubSpot · Smartlead · last 30 days`

- · Verdict: PARTIAL · confidence medium
- ✗ Missing: `os_last_sent_address`
- · Fallback plan: campaign-level and aggregate deliverability only

### Results
`bounces and unsubscribes · last 30 days · HubSpot contacts`

- · Bounce and unsubscribe trends by campaign and week
- · No sender-address breakdown — `os_last_sent_address` is missing

### Next
1. Check why `os_last_sent_address` is empty in this portal to diagnose deliverability per mailbox
````
