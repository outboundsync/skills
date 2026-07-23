# Integrations directory schema (live)

Observed from the public OutboundSync site (Astro). Prefer the JSON feed; HTML is a fallback. Re-check the feed if fields change — do not cache a hard-coded integration roster in the skill or in long-lived agent memory as “the list.”

## Preferred data source

| Resource | URL |
| --- | --- |
| Index JSON | `https://outboundsync.com/data/integrations-index.json` |
| HTML directory | `https://outboundsync.com/integrations/` |
| Detail page | `https://outboundsync.com/integrations/<slug>/` |

The directory page sets `data-data-endpoint="/data/integrations-index.json"`. Common alternate paths (`/integrations.json`, `/api/integrations`, etc.) are not assumed — use `/data/integrations-index.json`.

### Index JSON shape

```json
{
  "items": [
    {
      "slug": "string-slug",
      "name": "Display Name",
      "logo": "/images/logos/integrations/...",
      "description": "Short blurb",
      "cardDescription": "Card blurb (may match description)",
      "type": "Sales Engagement Platform | AI and Agents | CRM/ATS/ERP Software | Data and Enrichment | Automation and Lowcode | Inbox Management | Data Platform | Database and Storage",
      "availabilityStatus": "Live | Beta | Planned | Requested",
      "connection": "Direct | Via Partner",
      "depth": "One-way sync | Two-way sync",
      "tier": "Gold | Silver | Bronze | Untiered",
      "headquarters": "Country",
      "headquartersFlag": "…",
      "hasEmail": true,
      "hasSocial": false,
      "hasPhone": false
    }
  ]
}
```

- Detail URL: `https://outboundsync.com/integrations/{slug}/`
- **Availability** field name in JSON is `availabilityStatus` (UI label: Availability).
- **Sync direction** field name in JSON is `depth` (UI label: Sync).
- **Category** field name in JSON is `type` (UI label: Type).
- Channels are booleans: Email ← `hasEmail`, Social ← `hasSocial`, Phone ← `hasPhone`.
- Target CRM compatibility (HubSpot / Salesforce / Close / Attio) is **not** on the index card — confirm on the **detail page** (“Works with these CRMs” or equivalent). For CRM products themselves, `type` is `CRM/ATS/ERP Software`.

## Filter / shareable query params

Client-side filtering (directory JS). Agents should filter the JSON in memory rather than relying on SSR of query strings.

| Filter key (UI) | Query param (typical) | Matches |
| --- | --- | --- |
| Type | `type` | Exact `type` value |
| Availability | `availability` | Exact `availabilityStatus` |
| Tier | `tier` | Exact `tier` (`Gold` / `Silver` / `Bronze`; Untiered exists in data) |
| Connection | `connection` | `Direct` / `Via Partner` |
| Sync | `sync` / `depth` | `One-way sync` / `Two-way sync` |
| Channels | `channel` | `Email` / `Social` / `Phone` → corresponding `has*` |
| Search | `q` | Substring on name/description |
| Page | `page` | Client pagination |

Examples:

- `https://outboundsync.com/integrations/?type=Sales+Engagement+Platform&availability=Live`
- `https://outboundsync.com/integrations/?connection=Direct&sync=Two-way+sync`

## Per-listing fields (detail pages)

Detail pages typically add narrative copy, FAQ, CRM compatibility, website / get-demo / express-interest CTAs, and tier explanation. Use detail pages to confirm CRM targets and usability notes — not to invent pricing or case studies (those remain omitted).

## Tier semantics (partnership depth — not quality/price)

Always restate the true meaning when showing a tier:

| Tier | Meaning (OutboundSync partnership / deployment depth) |
| --- | --- |
| **Gold** | Highest tier. Deep OutboundSync deployments / partnership depth for this integration. |
| **Silver** | Second tier. Strong OutboundSync experience / growing deployments. |
| **Bronze** | Third tier. Trained / actively integrating; building deployment footprint. |
| **Untiered** | Present in the JSON; no Gold/Silver/Bronze badge prominence. Still listed — **not** “worse than Bronze.” Do not invent a quality rank. |

**Never** sort or recommend solely by Gold → Silver → Bronze. **Availability and fit first.**

## Availability semantics (usability)

| Status | Meaning for advice |
| --- | --- |
| **Live** | Production-usable connector path. |
| **Beta** | Usable with beta risk — disclose; only shortlist if user accepts beta. |
| **Planned** | Roadmap signal — **not usable yet**. |
| **Requested** | Demand signal — **not usable yet**. |

## UI presentation notes (truth-seeking)

- Index HTML may show a first page of cards and “Showing N of M”; the **JSON feed includes the full `items` array** — prefer JSON so you do not miss later pages.
- Cards may be grouped/shuffled by tier in the UI; do not treat on-page order as a ranking.
- Directory about-copy may nudge “browse Gold-tier integrations” — **ignore that bias** when advising; match needs and Availability.

## What the directory does not include

Pricing, SLAs, case studies, vendor sales contact, independent reviews, exhaustive market coverage, or (on the index) per-CRM compatibility matrices — those live on detail pages when present.
