# Example 01: Top Campaigns By Replies (SUPPORTED, strict)

- Intent ID: `top_campaigns_by_replies_30d`
- Date window: `last 30 days`
- CRM scope: `HubSpot`
- Platform scope: `Instantly, Smartlead`

## User question
"Top campaigns by replies in the last 30 days."

## Available fields (sample)
- `os_last_email_campaign_name`
- `os_last_campaign_name`
- `os_last_reply_time`
- `os_last_sent_time`

## Rendered output

````markdown
## Supported — top campaigns by replies

```text
Overall                      ████████████████████  2/2 · supported

os_last_email_campaign_name  ████████████████████  ✓ present
os_last_reply_time           ████████████████████  ✓ present
```

### Field check
`top_campaigns_by_replies_30d · strict · HubSpot · Instantly, Smartlead · last 30 days`

- · Verdict: SUPPORTED · confidence high
- ✓ No missing fields
- · Fallback plan: none

### Results
`replies · last 30 days · HubSpot contacts`

| Rank | Campaign | Replies |
| --- | --- | --- |
| 1 | `Q1 Outbound - VP Sales` | ████████████████████ 42 |
| 2 | `Demand Gen Directors` | ███████████████░░░░░ 31 |
| 3 | `Ecom Founders` | █████████░░░░░░░░░░░ 19 |

- · Counts observed reply timestamps only; no inferred replies
````
