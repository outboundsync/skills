# GET /contacts/outreach (api skill)

Prior-outreach summary for one contact across every CRM connection the API key can access. How-to: https://outboundsync.com/docs/api/prior-outreach/ — contract: https://outboundsync.com/docs/api/v1/#get-apiv1contactsoutreach

Any Bearer `GET` works. ZoomInfo, Clay, Databar, and Freckle are examples of the same call — not separate routes.

## Query

At least one required:

- `email` — contact email (normalized to lowercase)
- `profileUrl` — LinkedIn (`/in/…` or `/pub/…`) or X/Twitter URL. Scheme optional. Repeat the param or comma-separate (**max 5**)

Neither identity, an invalid `email`/`profileUrl`, or more than 5 `profileUrl` values → **400**.

All supplied identities are **OR-unioned into one aggregate**. Pass identities for a **single** contact only — mixing people merges their engagement.

Rate limit: **600 requests / 60s** per account (separate from the general 120/60s bucket). Honor `Retry-After` on `429`; this bucket sends no `X-RateLimit-*` headers.

## Recipe

1. Pass `email` and social `profileUrl` when available
2. Drop contacts where `doNotContact.value` is true (bounce + unsubscribe only)
3. Keep contacts where `found` is false, **or** `summary.daysSinceLastTouch` is null, **or** it is ≥ the **user's** cadence
4. If the user did not give a cadence, report `found` / DNC / `daysSinceLastTouch` and **omit keep/skip** — do not default to 90 days

Prefer `query.email` for field mapping. Top-level `email` is a deprecated alias of `query.email`. The response echoes social identities as the plural `query.profileUrls[]`.

## Response fields used by the Prior outreach card

| Field | Use |
| --- | --- |
| `found` | Any matching event on record |
| `summary{totalEvents, daysSinceLastTouch, lastEventType, lastPlatform, everContacted, everEmailed, everOpened, everCalled, everSocialTouched, firstTouchAt, lastTouchAt}` | Found / Last touch lines |
| `platforms[]`, `eventTypes[]` | Per-platform and per-type counts |
| `outcomes{replied, lastReplyAt, bounced, unsubscribed, lastCategoryName, lastCategoryAt}` | Outcomes line |
| `doNotContact{value, reasons[]}` | Leads the card when true |

## Failures

A slow lookup stops at the 20s query limit and returns a JSON `504` (`error: "Gateway Timeout"`; MCP `upstream_error` with `status: 504`, or `timeout` if the MCP's own 30s limit fires first). A `504`, other `5xx`, timeout, `401`/`403`, or non-JSON body is **UNVERIFIED** — never `found: false`. Keep the contact out of the send until a retry succeeds.

## Do not

- Filter on `blocklists.*` — `evaluated` is always false, `matched` always false, `matches` always `[]`. That is **not** “not on a blocklist.”
- Treat `found: true` + `daysSinceLastTouch: null` as recently contacted — category-only matches stay cadence-eligible
- Pass a bare company domain as `email` or `profileUrl`. `GET /accounts/outreach` is reserved (not implemented)
- Rely on `profileUrl` alone for Attio, Close, HighLevel, or Pipedrive social-only events — those CRMs leave `to_email` empty; pass `email` when you have it. HubSpot and Salesforce backfill `to_email` with the profile URL
- Treat `firstTouchAt` / `lastTouchAt` as sequencer event time — they are processing time (`webhook_logs.created_at`)
- Treat open/click-only or passive views/likes as `everContacted`
