# Example 02: High Opens, Low Replies (SUPPORTED, strict)

- Intent ID: `high_opens_low_replies`
- Date window: `last 30 days`
- CRM scope: `Salesforce`
- Platform scope: `EmailBison`

## User question
"Which campaigns show high opens but low replies?"

## Available fields (sample)
- `OSLastCampaignName__c`
- `OSLastOpenTime__c`
- `OSLastReplyTime__c`
- `OSLastLinkClickTime__c`

## Rendered output

````markdown
## Supported — high opens, low replies

```text
Overall                ████████████████████  3/3 · supported

OSLastCampaignName__c  ████████████████████  ✓ present
OSLastOpenTime__c      ████████████████████  ✓ present
OSLastReplyTime__c     ████████████████████  ✓ present
```

### Field check
`high_opens_low_replies · strict · Salesforce · EmailBison · last 30 days`

- · Verdict: SUPPORTED · confidence medium
- ✓ No missing fields
- · Fallback plan: none

### Results
`open activity vs reply activity · last 30 days · Salesforce contacts`

- · `RevOps NA MidMarket` — strong open activity, low reply activity
- · `PLG Security Persona` — strong open activity, low reply activity
- · Salesforce has no open counts; open-time presence stands in for engagement
````
