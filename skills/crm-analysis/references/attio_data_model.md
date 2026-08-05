# Attio data model in OutboundSync (beta)

Source: OutboundSync Help Center — "Attio CRM beta" (one-way activity sync). Lighter-touch than HubSpot/Salesforce: the analysis surface is the **Notes timeline**, not custom fields.

> **Note:** Attio does **not** receive the `os_*` custom properties HubSpot and Salesforce get. OutboundSync writes engagement as plaintext **Notes**, so analysis reads a timeline of records rather than querying fields. Which events reach a given workspace is configured during onboarding — confirm coverage before drawing conclusions; treat a missing signal as "not synced here," not "did not happen."

## Objects OutboundSync writes

| Object | Attio record | What OutboundSync sets |
| --- | --- | --- |
| Person | `people` record | Matched/created on email address (social-only outreach falls back to LinkedIn / X). Identity only: name, email, linked company. |
| Company | `companies` record | Matched/created on domain (free/public email domains skipped). Name + domain only — **no engagement attaches to the company**. |
| Note | `notes` on the Person | One note per engagement event. This is the analysis surface. |

Owner is **not** written to Attio — its People object has no owner attribute, and note authorship (`created_by_actor`) always resolves to the OAuth installer. Do not read rep/owner attribution from Attio notes.

## The engagement note

Every synced event becomes one plaintext Note on the **Person** record:

- **Title:** `OutboundSync <EVENT_TYPE>` (e.g. `OutboundSync EMAIL_REPLY`). Key every analysis off this title.
- **Timestamp:** the note's `created_at` is the event time — use it for recency and latency.
- **Body — labeled lines:** always `Platform:` and (when present) `Campaign:`, `Sent at:` (or `Logged at:` for calls), `Company:`, `App URL:`. Email events add `From:` / `To:` / `CC:` / `Subject:`. Non-email events may add `Lead:`, `Subject:`, `Link clicked:` (link clicks), `Category:` (category updates), `Social profile:`, `Tags:`. Calls add `Direction:`, `Duration:`, `Outcome:`, `Disposition:`, `Started at:`, `Recording:`. The message body (when present) follows a blank line.

## Event types that can appear

`EMAIL_SENT`, `EMAIL_REPLY`, `EMAIL_OPEN`, `EMAIL_LINK_CLICK`, `EMAIL_BOUNCE`, `LEAD_UNSUBSCRIBED`, `LEAD_CATEGORY_UPDATED`, `CALL_LOGGED`, and social events (`MESSAGE_SENT`, `MESSAGE_REPLY_RECEIVED`, `CONNECTION_REQUEST_*`, `LIKED_POST`, `VIEWED_PROFILE`, `FOLLOW_SENT`). Actual coverage depends on the workspace's configured sync.

## What you can and can't derive

- **Counts** (opens, clicks, replies): count notes by title — there are no numeric counters like HubSpot's `os_number_of_email_opens`.
- **Recency / latency:** derive from note `created_at` / the `Sent at:` line — there is no "last reply time" field.
- **Campaign / platform attribution:** read the `Campaign:` and `Platform:` lines.
- **Not available:** owner/rep attribution, company-level engagement timelines (notes attach to the Person only), and any field-level filtering.

The six strict HubSpot/Salesforce field intents (`references/router_contract.yaml`) do **not** apply to Attio — run these in `exploratory` mode with explicit limitations.
