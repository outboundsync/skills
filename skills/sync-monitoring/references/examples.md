# Sync Monitoring examples

## Diagnose (default)

User: “Are my OutboundSync Sync Monitoring webhooks delivering?”

Agent: `GET /me` → `GET /webhooks` → `GET /events?delivered=false` → optional deliveries. Output Mode `diagnose` with Endpoints / Events / Deliveries / Next.

## Propose register (stop for confirm)

User: “Wire Sync Monitoring to https://hooks.example.com/os”

Agent: diagnose, then Next includes:

`Will POST /webhooks registering https://hooks.example.com/os for sync.failed + sync.recovered`

Do not POST until the user confirms that plan.

## After confirm

User: “Yes, create it”

Agent: `POST /webhooks`, show `secret` once with store-now instruction, Mode `mutate-done`.

## Wrong skill

User: “Is my Instantly webhook pointed at OutboundSync?”

That is **Sources** / SEP inbound → hand off to `preflight`, not this skill.
