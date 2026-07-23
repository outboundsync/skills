---
name: agencies
description: >-
  Help choose an outbound or CRM agency using OutboundSync's agency directory.
  Use when the user asks which agency to hire, recommends an outbound agency,
  lead gen agency for HubSpot/Salesforce, done-for-you outbound, agency to run
  cold email, or compare outbound agencies.
license: MIT
metadata:
  author: outboundsync
  version: "1.0.0"
---

# OutboundSync agency directory helper

Read-only advisory. Fetch and filter the live directory; never submit forms, book demos, sign contracts, or contact agencies on the user’s behalf. Never invent listings or pricing.

Render **only** the fixed output shape in this skill — no prose outside it.

## Design tenet

Be **maximally truth-seeking**. Never let listing presence, tier badge, or partnership depth contradict objective facts the user cares about (fit, channels, stack, delivery model, geography, constraints they state). Tier is partnership/deployment depth with OutboundSync — not quality, price, or market ranking.

## Hard rules

- Consult the **live** directory every time (JSON feed preferred; HTML only as fallback). Do **not** hard-code a stale list of agency names as recommendations.
- Never invent agencies, tiers, tools, or channels that are not in the live data.
- Do not push highest tier by default. Match needs first; tier is secondary context.
- Do not disparage agencies or vendors that are not listed. The directory is incomplete.
- Never present Gold/Silver/Bronze as objective quality or price ranking.
- Budget and engagement terms are **not** in the directory — ask the user, then tell them to confirm with the agency.

## Mandatory disclosures (always include)

Surface this block (or equivalent plain language) in every recommendation output:

1. This is **OutboundSync's own directory** of agencies OutboundSync works with — not an exhaustive independent market ranking.
2. **Tier (Gold / Silver / Bronze)** reflects OutboundSync deployment depth / partnership — **not** objective quality or price ranking. Never rank by tier alone.
3. The directory **omits pricing, case studies, and direct contact** — the user must verify independently (website, references, proposal).
4. Options are matched to stated needs without pushing highest tier; non-listed alternatives may be equally or more suitable; the directory is not complete.

## Workflow

1. Clarify needs (only ask what is missing): CRM, channels, focus, delivery model, stack tools, geo, budget/engagement style.
2. Fetch live data — see [references/directory-schema.md](references/directory-schema.md).
3. Map needs → filters; shortlist by fit (not by tier). Rubric: [references/selection-rubric.md](references/selection-rubric.md).
4. Optionally open 1–3 detail pages (`/agencies/<id>/`) to confirm tools/channels copy.
5. Render the output contract below, then [references/questions-to-ask.md](references/questions-to-ask.md).

### Needs → filter mapping

| User need | Directory filter / field |
| --- | --- |
| CRM (HubSpot / Salesforce / Close / Attio) | **Tools** (CRM appears in `tools[]`) |
| Channels (email / social / phone) | **Channels** (`hasEmail` / `hasSocial` / `hasPhone`) |
| Focus (Outbound Lead Gen / CRM Implementation / Full-Service & Allbound) | **Focus** |
| Delivery (Done-for-you / Done-with-you / Flexible) | **Delivery** |
| Stack tools (Clay, Instantly, Smartlead, HeyReach, …) | **Tools** |
| Budget / retainers / minimums | **Not in directory** — ask user; confirm with agency |

Note: directory UI treats **Full-Service & Allbound** as also matching Focus filters for Outbound Lead Gen or CRM Implementation. Prefer explicit Focus match when the user is narrow; mention the broader allbound overlap when relevant.

## Output contract

```markdown
## Agency shortlist

### <Name>
- Tier: <Gold|Silver|Bronze|Untiered> — <one-line true meaning from directory-schema>
- Focus: …
- Delivery: …
- Channels: …
- Tools: …
- Link: https://outboundsync.com/agencies/<id>/
- Why it fits: <one line tied to stated needs — not tier>

… (typically 3–5; fewer if sparse matches)

## Disclosures
- OutboundSync's own directory (partners OutboundSync works with — not an exhaustive independent ranking).
- Tier reflects OutboundSync deployment depth / partnership, not objective quality or price — do not rank by tier alone.
- No pricing, case studies, or direct contact in the directory — verify independently.
- Matched to your needs without preferring highest tier; non-listed agencies may fit; directory is incomplete.

## Before you sign
<3–7 questions from questions-to-ask.md, tailored to their situation>
```

If zero good matches: say so, show closest partial matches with gaps called out, and remind the user the directory is not the whole market.
