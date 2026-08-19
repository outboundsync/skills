# GET /contacts/outreach (api skill)

Prior-outreach summary for one contact across every CRM connection the API key can access. How-to: https://outboundsync.com/docs/api/prior-outreach/ — contract: https://outboundsync.com/docs/api/v1/#get-apiv1contactsoutreach

Any Bearer `GET` works. ZoomInfo, Clay, Databar, and Freckle are examples of the same call — not separate routes.

## Query

At least one required:

- `email` — contact email (normalized to lowercase)
- `profileUrl` — LinkedIn (`/in/…` or `/pub/…`) or X/Twitter URL. Scheme optional. Repeat the param or comma-separate (**max 5**)

Neither identity, an invalid `email`/`profileUrl`, or more than 5 `profileUrl` values → **400**.

All supplied identities are **OR-unioned into one aggregate**. Pass identities for a **single** contact only — mixing people merges their engagement.

Rate limit: **600 requests / 60s** per account (separate from the general 120/60s bucket). Honor `Retry-After` on `429`.

## Recipe

1. Pass `email` and social `profileUrl` when available
2. Drop contacts where `doNotContact.value` is true (bounce + unsubscribe only)
3. Keep contacts where `found` is false, **or** `summary.daysSinceLastTouch` is null, **or** it is ≥ the **user's** cadence
4. If the user did not give a cadence, report `found` / DNC / `daysSinceLastTouch` and **omit keep/skip** — do not default to 90 days

Prefer `query.email` for field mapping. Top-level `email` is a deprecated alias of `query.email`.

## Do not

- Filter on `blocklists.*` — `evaluated` is always false, `matched` always false, `matches` always `[]`. That is **not** “not on a blocklist.”
- Treat `found: true` + `daysSinceLastTouch: null` as recently contacted — category-only matches stay cadence-eligible
- Pass a bare company domain as `email` or `profileUrl`. `GET /accounts/outreach` is reserved (not implemented)
- Rely on `profileUrl` alone for Attio, Close, HighLevel, or Pipedrive social-only events — those CRMs leave `to_email` empty; pass `email` when you have it. HubSpot and Salesforce backfill `to_email` with the profile URL
- Treat `firstTouchAt` / `lastTouchAt` as sequencer event time — they are processing time (`webhook_logs.created_at`)
- Treat open/click-only or passive views/likes as `everContacted`
