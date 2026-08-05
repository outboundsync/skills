---
name: list-building
description: >-
  Build a prospect list from scratch across three sourcing motions —
  signal/trigger-based sourcing, contact databases, and waterfall enrichment /
  data aggregation. Use when the user asks how to build a lead list, where to
  get prospects, has no list yet, how to source or find contacts for an ICP,
  intent- or trigger-based outbound, or how to enrich or waterfall a list. No
  OutboundSync API key.
license: MIT
metadata:
  author: outboundsync
  version: "1.0.0"
---

# List building (source + enrich)

Plan how to build a prospect list when the user has none — or score a list-build plan they already have. Choose and sequence sourcing motions; do not do the sourcing itself. Plan and score only — never scrape, purchase data, call vendor APIs, or write to a CRM/SEP.

Render **only** the selected output shape. No invented coverage %, match rates, contact counts, or vendor capability claims the user did not provide.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](../../DISCLAIMER.md). Treat techniques as widely-taught industry patterns; do **not** paste copyrighted course modules or private playbooks.

## When to use adjacent skills

| Need | Skill |
| --- | --- |
| Offer / CTA once the list exists | `outbound-offer` |
| Email body for the list | `cold-email-body` |
| Multi-channel plan for the list | `omnichannel-campaigns` |
| Whether a data/enrichment tool is live for your CRM | `integrations` |
| Analyze results after sending | `crm-analysis` |

Never block if an adjacent skill is missing — return this skill's plan and list remaining inputs.

## Modes

- `Audit` — score an existing list or sourcing plan; name gaps (ICP fit, data freshness, coverage, compliance).
- `Draft` — produce a sourcing plan (motion + steps + tool category) from ICP / trigger / constraints.

Infer from the ask. If both are needed, Audit then Draft.

## Sourcing motions (patterns, not prescriptions)

Encode these as checks. Treat them as widely-taught industry patterns, not proprietary playbooks — describe the technique itself, and never invent metrics or attribute claims to specific people or companies. Pick the motion that fits the ICP, the trigger, and what seed data already exists; strong lists usually **combine** motions.

1. **Signal / trigger-based** — start from a buying signal (job change, hiring, funding, tech adoption, recent engagement) and source the accounts/people showing it. Fits when timing beats volume. Risk: signal noise and thin volume — confirm the signal is real, recent, and relevant before sourcing on it.
2. **Contact-database** — pull from a contact/company database by firmographic + role filters. Fits when you need breadth quickly. Risk: stale records and list overlap (everyone pulls the same rows) — layer a differentiator (a signal, a niche filter) and verify freshness.
3. **Waterfall enrichment / data aggregation** — take a seed (accounts, domains, partial contacts) and run it through several data providers in sequence, falling back when one lacks coverage, to maximize match rate on the fields you actually need (verified email, role, phone). Fits when you have accounts but not people/contact data. Risk: cost and over-enrichment — enrich only fields you will use, and keep a confidence bar.

Common blend: a **signal** picks the accounts, a **database** or **waterfall** gets the verified people. Always dedupe against what is already in the CRM/SEP and honor suppression/consent.

Rubric: [references/sourcing-rubric.md](references/sourcing-rubric.md) · Plays: [references/method-patterns.md](references/method-patterns.md) · Tool categories: [references/tool-categories.md](references/tool-categories.md).

## Required inputs

Collect or mark missing:

- ICP / persona (firmographic filters + target role/seniority)
- Trigger / signal in scope (if signal-led) — and how fresh it must be
- Seed data on hand (account list, domains, partial contacts, or none)
- Destination + volume target (which SEP / CRM, how many contacts)
- Constraints (budget, tools already owned, compliance / consent regime)

## Output contract

GitHub-flavored markdown only. Blank line between blocks. Marks: ✓ pass · ✗ gap · · advisory.

### Quick (default for “help me build a list”)

```markdown
## List-building plan

- Goal: <one line — who + how many + destination>
- ICP: <firmographic + role, or missing inputs>
- Motion: <signal | database | waterfall | blend — and why>
- Steps: <ordered — source → verify → enrich → dedupe/suppress → load; tool category per step, not a vendor>
- Data bar: <fields required + freshness/confidence threshold>
- Watchouts: <coverage / cost / compliance / overlap — one line each>
```

### Scorecard (Audit)

```markdown
## List-building audit

| Lever | Score /5 | Note |
| --- | --- | --- |
| ICP fit | | |
| Motion fit | | |
| Data freshness | | |
| Coverage vs precision | | |
| Dedupe / suppression | | |
| Compliance / consent | | |

**Weakest lever:** <name>
**Fix focus:** <one paragraph>
```

Scores are judgment against the rubric — not industry benchmarks.

## Safety

- No scraping, data purchase, vendor API calls, or CRM/SEP writes — plans and scorecards only.
- No fabricated coverage %, match rates, contact counts, or vendor capability claims.
- Name tool **categories**, not vendors; route "is tool X live with my CRM?" to `integrations`.
- Respect platform terms and data-privacy / consent law the user mentions; this skill is not legal advice.
