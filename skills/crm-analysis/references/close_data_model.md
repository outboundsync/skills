# Close data model in OutboundSync (beta)

Source: OutboundSync Help Center — "Close CRM beta" (one-way activity sync). Lighter-touch than HubSpot/Salesforce: the analysis surface is **Activities**, not custom fields.

> **Note:** Close does **not** receive the `os_*` custom properties HubSpot and Salesforce get. Email sends/replies become native **Email Activities**; every other synced event becomes a **Note Activity**. Which events reach a given org is configured during onboarding — confirm coverage before drawing conclusions; treat a missing signal as "not synced here," not "did not happen."

## Objects OutboundSync writes

| Object | Close endpoint | What OutboundSync sets |
| --- | --- | --- |
| Lead | `/lead/` | Matched by the configured lookup field (a Contact field, or a Lead custom field stored as `lead:cf_*`), then Contact email, then Lead domain / company name (that heuristic is skipped when a Lead field is configured); created on miss. Lead custom fields (`custom.cf_*`) can hold identity keys (email, social profile URL) — typical when selling to individuals or principal-led businesses where the person *is* the account and Contacts are secondary: written on create, backfilled on match only when empty. The analysis anchor — engagement hangs off the Lead. |
| Contact | `/contact/` | Embedded on the Lead: name + email (+ title / phone / url when present). Reused by email under the matched Lead; a new email adds a Contact to that Lead. With Lead-field lookup, email-less social events create **no** Contact. Custom fields (`custom.cf_*`) hold only record-matching keys, **never engagement**. |
| Email Activity | `/activity/email/` | For `EMAIL_SENT` and `EMAIL_REPLY`. |
| Note Activity | `/activity/note/` | For every other synced event. |

Owner **is** honored: OutboundSync passes the configured owner as `user_id` on both email and note activities (unlike Attio, where owner is not written).

## Email Activity (`EMAIL_SENT` / `EMAIL_REPLY`)

Native Close email object — analyze it with Close's own fields:

- `status`: `sent` (outbound send) or `inbox` (reply received).
- `direction`: `outgoing` (send) or `incoming` (reply).
- `subject`, `body_text`, `sender`, `to[]`, `cc[]`.
- `date_created`: the event time — use for recency and reply latency.

Reply-rate and open-to-reply style questions on email come from the `status` / `direction` split, not from counters.

## Note Activity (everything else)

Plaintext note whose first line is `OutboundSync <EVENT_TYPE>`, then labeled lines: `Platform:`, `Lead email:`, `Social profile:`, `Company:`, `Campaign:`, `App URL:`, `Category:` (category updates), then the message body after a blank line. This is where social events and other non-email signals land.

## Event types that can appear

- **Email Activity:** `EMAIL_SENT`, `EMAIL_REPLY`.
- **Note Activity:** social events (`MESSAGE_SENT`, `MESSAGE_REPLY_RECEIVED`, `CONNECTION_REQUEST_SENT`, …), `LEAD_CATEGORY_UPDATED`, and other non-email signals.

Per the beta docs, phone/call activity is not supported for Close. Actual coverage depends on the org's configured sync.

## What you can and can't derive

- **Email performance:** filter Email Activities by `status` / `direction`; derive counts and reply latency from `date_created`.
- **Social / other signals:** read Note Activities whose first line is `OutboundSync <EVENT_TYPE>`; read `Campaign:` / `Platform:` for attribution.
- **Owner attribution:** available via activity `user_id`.
- **Not available:** numeric counters, "last-value" fields, and field-level filtering. Engagement is Lead-anchored, so per-contact analysis means walking the Lead's contacts + activities.
- **Lead-only activities:** with Lead-field lookup, email-less social activities can attach to the Lead with no `contact_id`. Count them at the Lead level instead of dropping them from per-contact rollups.

The six strict HubSpot/Salesforce field intents (`references/router_contract.yaml`) do **not** apply to Close — run these in `exploratory` mode with explicit limitations.
