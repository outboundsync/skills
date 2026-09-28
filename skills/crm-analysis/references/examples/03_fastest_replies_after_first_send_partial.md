# Example 03: Fastest Replies After First Send (PARTIAL, strict)

- Intent ID: `fastest_replies_after_first_send`
- Date window: `last 30 days`
- CRM scope: `HubSpot`
- Platform scope: `Smartlead`

## User question
"Which campaigns get replies fastest after first send?"

## Available fields (sample)
- `os_last_campaign_name`
- `os_last_reply_time`
- Missing: `os_last_sent_time`

## Rendered output

````markdown
## Partial — fastest replies after first send

```text
Overall                █████████████░░░░░░░  2/3 · partial

os_last_campaign_name  ████████████████████  ✓ present
os_last_sent_time      ░░░░░░░░░░░░░░░░░░░░  ✗ missing
os_last_reply_time     ████████████████████  ✓ present
```

### Field check
`fastest_replies_after_first_send · strict · HubSpot · Smartlead · last 30 days`

- · Verdict: PARTIAL · confidence medium
- ✗ Missing: `os_last_sent_time`
- · Fallback plan: replace latency with reply volume and reply recency

### Results
`reply volume and recency (latency unavailable) · last 30 days · HubSpot contacts`

- · `Security Buyers Q1` — highest reply volume in the window
- · `Operations Leaders` — most recent reply activity
- · Send-to-reply latency needs `os_last_sent_time`

### Next
1. Check why `os_last_sent_time` is empty in this portal (it is written on send events), then re-run for true latency
````
