# Preflight output examples

Use these as the fixed output contract. Each example includes a CRM gauge row and a CRM card.

## Not ready (Instantly blocked)

````markdown
## Not ready to launch

```text
Overall ████████░░░░░░░░░░░░ 2/5 · not ready

CRM                  ████████████████████ ✓ ready
OutboundSync         ████████████████████ ✓ ready
Instantly            ░░░░░░░░░░░░░░░░░░░░ ✗ 0/3
```

### CRM — HubSpot
`Connection 177 · outboundsync.com · org 123`

- ✓ Connected — HubSpot OAuth ready
- · Capabilities: sync on · destinations on · blocklists on
- · Integration config: instantly → company ✓ · task ✓ · owner ✓
- · Destinations (forwarding, not CRM writes): none — events still sync to CRM natively
- · Blocklists: not_configured

### OutboundSync
`HubSpot · outboundsync.com`

- ✓ Sources + sync enabled

### Instantly
`Connection 177 · …/webhooks/ac2346f2`

- ✗ No active sending mailboxes
- ✗ No exact-match campaign webhook
- ✗ No sendable campaign

### Next
1. Connect and activate a mailbox in Instantly
2. Add the exact Instantly source URL as an all-events webhook
   `https://app.outboundsync.com/webhooks/ac2346f2-e429-42fe-a6d4-70f56fca8f21`
3. Configure a sendable campaign (sequence, senders, leads, schedule)
````

## Partial Instantly + manual Smartlead

````markdown
## Not ready to launch

```text
Overall ████████████░░░░░░░░ 3/5 · not ready · 1 manual

CRM                  ████████████████████ ✓ ready
OutboundSync         ████████████████████ ✓ ready
Instantly            ███████░░░░░░░░░░░░░ ✗ 1/3
Smartlead            ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ · manual — verify in UI
```

### CRM — HubSpot
`Connection 177 · outboundsync.com · org 123`

- ✓ Connected — HubSpot OAuth ready
- · Capabilities: sync on · destinations on · blocklists on
- · Integration config: instantly → company ✓ · task ✓ · owner ✓; smartlead → company ✓ · task ✗ · owner ✓
- · Destinations (forwarding, not CRM writes): 1 endpoint — Clay → EMAIL_SENT, EMAIL_REPLY
- · Blocklists: not_configured

### OutboundSync
`HubSpot · outboundsync.com`

- ✓ Sources + sync enabled

### Instantly
`Connection 177 · …/webhooks/ac2346f2`

- ✓ 2 active mailboxes
- ✗ No exact-match campaign webhook
- ✗ No sendable campaign

### Smartlead
`Connection 177 · 2 sources`

- · Select the intended source and verify the campaign webhook in Smartlead

### Next
1. Wire the Instantly source URL as an all-events webhook and attach it to the campaign
   `https://app.outboundsync.com/webhooks/ac2346f2-e429-42fe-a6d4-70f56fca8f21`
2. Configure a sendable campaign (sequence, senders, leads, schedule)
3. Confirm the intended Smartlead source and its campaign webhook
````

## Ready

````markdown
## Ready to launch

```text
Overall ████████████████████ 5/5 · ready

CRM                  ████████████████████ ✓ ready
OutboundSync         ████████████████████ ✓ ready
Instantly            ████████████████████ ✓ 3/3
```

### CRM — HubSpot
`Connection 177 · outboundsync.com · org 123`

- ✓ Connected — HubSpot OAuth ready
- · Capabilities: sync on · destinations on · blocklists on
- · Integration config: instantly → company ✓ · task ✓ · owner ✓
- · Destinations (forwarding, not CRM writes): none — events still sync to CRM natively
- · Blocklists: ready (1 enabled)

### OutboundSync
`HubSpot · outboundsync.com`

- ✓ Sources + sync enabled

### Instantly
`Connection 177 · …/webhooks/ac2346f2`

- ✓ 3 active mailboxes · webhook wired · campaign sendable
````
