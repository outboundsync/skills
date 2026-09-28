# Example 08: HeyReach Social Summary (EXPERIMENTAL_LIMITED, exploratory)

- Exploratory Path ID: `heyreach_social_summary`
- Date window: `last 30 days`
- CRM scope: `HubSpot`
- Platform scope: `HeyReach`

## User question
"Summarize HeyReach social campaign performance and recent social replies."

## Available fields (sample)
- `os_last_social_campaign_name`
- `os_last_reply_social_time`
- `os_last_sent_social_time`
- `os_last_campaign_name`

## Rendered output

````markdown
## Experimental — limited — HeyReach social summary

```text
Overall                       ████████████████████  2/2 · experimental

os_last_social_campaign_name  ████████████████████  ✓ present
os_last_reply_social_time     ████████████████████  ✓ present
```

### Field check
`heyreach_social_summary · exploratory · HubSpot · HeyReach · last 30 days`

- · Verdict: EXPERIMENTAL_LIMITED · confidence high
- ✓ No missing fields
- · Fallback plan: none

### Results
`social contacts and replies · last 30 days · HubSpot contacts`

| Rank | Campaign | Contacts |
| --- | --- | --- |
| 1 | `Social Outreach Q1` | ████████████████████ 87 |
| 2 | `VP Eng Social Touch` | ████████████░░░░░░░░ 54 |

- · Reply recency: latest social replies are concentrated in `Social Outreach Q1`
- · Trend: up — last 14 days vs the prior 14

### Signals
- ✓ Observed signals used: `os_last_social_campaign_name`, `os_last_reply_social_time`, `os_last_sent_social_time`
- ✓ None missing
- · Non-causal: best-effort exploratory analysis; it does not prove causality or strict email-reply performance
````
