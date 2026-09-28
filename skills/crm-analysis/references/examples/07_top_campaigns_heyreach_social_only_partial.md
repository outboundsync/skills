# Example 07: Top Campaigns By Replies — HeyReach Social Only (PARTIAL, strict)

- Intent ID: `top_campaigns_by_replies_30d`
- Date window: `last 30 days`
- CRM scope: `HubSpot`
- Platform scope: `HeyReach`

## User question
"Top campaigns by replies in the last 30 days."

## Available fields (sample)
- `os_last_campaign_name`
- `os_last_social_campaign_name`
- `os_last_reply_social_time`
- Missing: `os_last_email_campaign_name`, `os_last_reply_time`

## Rendered output

````markdown
## Partial — top campaigns by replies (social-only data)

```text
Overall                ██████████░░░░░░░░░░  1/2 · partial

os_last_campaign_name  ████████████████████  ✓ present
os_last_reply_time     ░░░░░░░░░░░░░░░░░░░░  ✗ missing
```

### Field check
`top_campaigns_by_replies_30d · strict · HubSpot · HeyReach · last 30 days`

- · Verdict: PARTIAL · confidence low
- ✗ Missing: `os_last_reply_time`
- · Fallback plan: rank campaigns by contact volume only; state the missing reply-time limitation

### Results
`contacts (reply data unavailable) · last 30 days · HubSpot contacts`

| Rank | Campaign | Contacts |
| --- | --- | --- |
| 1 | `Social Outreach Q1` | ████████████████████ 87 |
| 2 | `VP Eng Social Touch` | ████████████░░░░░░░░ 54 |

- · HeyReach does not sync email reply timestamps, so this strict email-reply intent can only rank by volume

### Next
1. Re-run with `Mode: exploratory` for the social summary (`heyreach_social_summary`) if social replies are the goal
````
