# Example 04: Follow-Up Prioritization (PARTIAL, strict)

- Intent ID: `follow_up_prioritization`
- Date window: `last 14 days`
- CRM scope: `HubSpot`
- Platform scope: `Instantly`

## User question
"Who should we prioritize for follow-up this week?"

## Available fields (sample)
- `os_last_open_time`
- `os_last_reply_time`
- Missing: `os_last_link_click_time`

## Rendered output

````markdown
## Partial — follow-up prioritization

```text
Overall                  █████████████░░░░░░░  2/3 · partial

os_last_open_time        ████████████████████  ✓ present
os_last_link_click_time  ░░░░░░░░░░░░░░░░░░░░  ✗ missing
os_last_reply_time       ████████████████████  ✓ present
```

### Field check
`follow_up_prioritization · strict · HubSpot · Instantly · last 14 days`

- · Verdict: PARTIAL · confidence medium
- ✗ Missing: `os_last_link_click_time`
- · Fallback plan: prioritize by opens plus recency; exclude recent repliers

### Results
`follow-up segments · last 14 days · HubSpot contacts`

- · First: opened recently, no recent reply
- · Second: several recent opens, no click data available
- · Ranking uses opens and recency only — click behavior is unavailable
- · Clicks exist only when the sequencer tracks links; with tracking off by design, this ranking stands
````
