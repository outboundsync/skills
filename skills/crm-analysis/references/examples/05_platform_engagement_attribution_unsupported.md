# Example 05: Platform Engagement Attribution (UNSUPPORTED, strict)

- Intent ID: `platform_engagement_attribution`
- Date window: `last 30 days`
- CRM scope: `Salesforce`
- Platform scope: `Instantly, Smartlead`

## User question
"Is Instantly or Smartlead driving better engagement?"

## Available fields (sample)
- `OSLastOpenTime__c`
- `OSLastReplyTime__c`
- Missing: `OSLastUpdateSource__c`

## Rendered output

````markdown
## Unsupported — platform engagement attribution

```text
Overall                ██████████░░░░░░░░░░  1/2 · unsupported

OSLastUpdateSource__c  ░░░░░░░░░░░░░░░░░░░░  ✗ missing
OSLastReplyTime__c     ████████████████████  ✓ present
```

### Field check
`platform_engagement_attribution · strict · Salesforce · Instantly, Smartlead · last 30 days`

- · Verdict: UNSUPPORTED · confidence high · reason missing_update_source
- ✗ Missing: `OSLastUpdateSource__c`
- · Fallback plan: none — no platform ranking is produced without the update source

### Next
1. Check why `OSLastUpdateSource__c` is empty in this org (it records which platform wrote each engagement), then re-run
````
