# Agency directory schema (live)

Observed from the public OutboundSync site (Astro). Prefer the JSON feed; HTML is a fallback. Re-check the feed if fields change — do not cache a hard-coded agency roster in the skill or in long-lived agent memory as “the list.”

## Preferred data source

| Resource | URL |
| --- | --- |
| Index JSON | `https://outboundsync.com/data/agencies-index.json` |
| HTML directory | `https://outboundsync.com/agencies/` |
| Detail page | `https://outboundsync.com/agencies/<id>/` |

The directory page sets `data-data-endpoint="/data/agencies-index.json"`. Common alternate paths (`/agencies.json`, `/api/agencies`, etc.) were **404** when checked — use `/data/agencies-index.json`.

### Index JSON shape

```json
{
  "items": [
    {
      "id": "string-slug",
      "name": "Display Name",
      "logo": "/images/logos/agencies/...",
      "description": "Short blurb",
      "focus": "Outbound Lead Gen | CRM Implementation | Full-Service & Allbound",
      "delivery": "Done for you | Done with you | Flexible",
      "tools": ["HubSpot", "Clay", "..."],
      "tier": "Gold | Silver | Bronze | Untiered",
      "headquarters": "Country",
      "headquartersFlag": "…",
      "hasEmail": true,
      "hasSocial": true,
      "hasPhone": false
    }
  ]
}
```

- Detail URL: `https://outboundsync.com/agencies/{id}/`
- Channels are booleans, not a string array: map Email ← `hasEmail`, Social ← `hasSocial`, Phone ← `hasPhone`.
- CRM and SEP stack membership is via **`tools[]`** (there is no separate CRM field).

## Filter / shareable query params

Client-side filtering (directory JS). Useful for humans and for documenting intent; **agents should filter the JSON in memory** rather than relying on SSR of query strings.

| Filter key (UI) | Query param | Matches |
| --- | --- | --- |
| Focus | `focus` | Exact `focus` value |
| Delivery | `delivery` | Exact `delivery` value |
| Tools | `tool` | Agency `tools[]` contains value |
| Tier | `tier` | Exact `tier` (`Gold` / `Silver` / `Bronze`; Untiered exists in data) |
| Channels | `channel` | `Email` / `Social` / `Phone` → corresponding `has*` |
| Search | `q` | Substring on name/description |
| Page | `page` | Client pagination |

Examples:

- `https://outboundsync.com/agencies/?focus=Outbound+Lead+Gen`
- `https://outboundsync.com/agencies/?tool=HubSpot&channel=Email&delivery=Done+for+you`

### Focus filter quirk

UI filter logic: if Focus filter includes Outbound Lead Gen or CRM Implementation, agencies with Focus **Full-Service & Allbound** also pass. When recommending, prefer an exact Focus match for narrow requests; disclose when an allbound listing matched via this overlap.

## Per-listing fields (detail pages)

Detail pages typically add narrative “More about…”, the same focus/delivery/channels/tools, headquarters, website CTA, and an **Agency tier** explanation. Use detail pages to confirm tools/channels — not to invent pricing or case studies (those are still omitted).

## Tier semantics (partnership depth — not quality/price)

Copy aligned with directory detail pages. Always restate the true meaning when showing a tier:

| Tier | Meaning (OutboundSync partnership / deployment depth) |
| --- | --- |
| **Gold** | Highest tier. Deep OutboundSync expertise, proven campaign track record, most client deployments. |
| **Silver** | Second tier. Strong OutboundSync experience, consistent campaign results, growing deployments. |
| **Bronze** | Third tier. Trained on OutboundSync, actively running campaigns, building client portfolio. |
| **Untiered** | Present in the JSON; no Gold/Silver/Bronze badge in the UI shuffle order after Bronze. Still a listed partner — **not** “worse than Bronze.” Do not invent a quality rank. |

**Never** sort or recommend solely by Gold → Silver → Bronze. Fit to needs first.

## UI presentation notes (truth-seeking)

- Index HTML may show a first page of cards and “Showing N of M”; the **JSON feed includes the full `items` array** — prefer JSON so you do not miss later pages.
- Cards may be shuffled within tier groups in the UI; do not treat on-page order as a ranking.
- Directory about-copy may nudge “browse Gold-tier partners” — **ignore that bias** when advising; match needs.

## What the directory does not include

Pricing, retainers, SLAs, case studies, calendars, email/phone for sales, independent reviews, win rates, or exhaustive market coverage.
