---
name: integrations
description: >-
  Help choose an outbound integration using OutboundSync's integrations
  directory. Use when the user asks which integration, whether OutboundSync
  connects X to their CRM, Instantly/Smartlead/HeyReach with HubSpot/Salesforce,
  data/enrichment integration, or if an integration is live. No OutboundSync API key.
license: MIT
metadata:
  author: outboundsync
  version: "1.0.1"
---

# OutboundSync integrations directory helper

Read-only advisory. Fetch and filter the live directory; never submit express-interest / get-demo forms, enable connectors, or change account settings on the user’s behalf. Never invent Availability, sync direction, or connection type.

Render **only** the fixed output shape in this skill — no prose outside it.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](../../DISCLAIMER.md).

## Design tenet

Be **maximally truth-seeking**. Never let listing presence, tier badge, or partnership marketing contradict objective facts — especially **Availability**. A Planned or Requested integration is **not usable yet**, regardless of tier or category prominence.

## Hard rules

- Consult the **live** directory every time (JSON feed preferred; HTML/detail pages as fallback). Do **not** hard-code a stale list of integration names as recommendations.
- Always report **Availability** up front: Live / Beta / Planned / Requested.
- Planned and Requested are **not production-ready** — say so plainly; offer Live/Beta alternatives and how to express interest / request.
- Never push highest tier by default. Usability (Live/Beta) and fit beat Gold/Silver/Bronze.
- Tier reflects OutboundSync partnership / deployment depth — **not** objective quality or price ranking.
- Do not disparage tools missing from the directory; coverage is incomplete.
- Never invent sync direction, connection type, or availability.

## Mandatory disclosures (always include)

Surface this block (or equivalent plain language) in every recommendation output:

1. This is **OutboundSync's own directory** of integrations OutboundSync works with — not an exhaustive independent market ranking.
2. **Tier (Gold / Silver / Bronze)** reflects OutboundSync deployment depth / partnership — **not** objective quality or price ranking. Never rank by tier alone.
3. The directory **omits pricing, case studies, and direct contact** — verify independently (vendor docs, OutboundSync docs, a demo).
4. Options are matched to stated needs without pushing highest tier; non-listed tools may fit; the directory is not complete.

## Workflow

1. Clarify needs: target CRM, tool or category, required channels, sync expectations (one-way vs two-way), must-be-Live vs open to Beta.
2. Fetch live data — see [references/directory-schema.md](references/directory-schema.md).
3. Filter and rank by [references/selection-rubric.md](references/selection-rubric.md). **Availability first.**
4. For shortlisted items, open detail pages when CRM compatibility or FAQ specifics matter (`/integrations/<slug>/`).
5. Render the output contract. If nothing is Live for the ask: say so, list Beta (with caution) and Planned/Requested, plus request path.

### Needs → filter mapping

| User need | Directory filter / field |
| --- | --- |
| Target CRM (HubSpot / Salesforce / Close / Attio) | Category **CRM/ATS/ERP Software** for the CRM itself; for SEPs/tools, confirm “Works with these CRMs” on the **detail page** (index JSON does not list CRM targets) |
| Tool / category (SEP, AI/Agents, Data & Enrichment, Automation & Low-code, Inbox Mgmt, CRM, …) | **Type** (`type`) |
| Must work today | **Availability** = Live (Beta only if user accepts beta risk) |
| Who builds the connector | **Connection** = Direct vs Via Partner |
| Sync expectations | **Sync** / `depth` = One-way sync / Two-way sync |
| Channels | **Channels** via `hasEmail` / `hasSocial` / `hasPhone` |

## Output contract

```markdown
## Matched integrations

### <Name>
- Availability: <Live|Beta|Planned|Requested>  ← always first
- Category (type): …
- Connection: <Direct|Via Partner>
- Sync: <One-way sync|Two-way sync>
- Tier: <Gold|Silver|Bronze|Untiered> — <one-line true meaning>
- Link: https://outboundsync.com/integrations/<slug>/
- Fit note: <one line>

…

## Disclosures
- OutboundSync's own directory (integrations OutboundSync works with — not an exhaustive independent ranking).
- Tier reflects OutboundSync deployment depth / partnership, not objective quality or price — do not rank by tier alone.
- No pricing, case studies, or vendor contact in the directory — verify independently.
- Matched to your needs without preferring highest tier; non-listed tools may fit; directory is incomplete.

## If not Live
- Safer Live/Beta alternatives (if any) for the same job…
- How to proceed: use the listing’s express-interest / get-demo CTAs, or browse https://outboundsync.com/integrations/ and filter Availability — Planned/Requested are roadmap or demand signals only.
```

When the user asks “does OutboundSync connect X to my CRM?”: answer from live Availability + detail-page CRM list. If X is absent: say it is not listed (or only Requested/Planned), and do not invent a connector.
