---
name: outbound-offer
description: >-
  Audit or draft cold-outreach offers and CTAs using a value-equation rubric,
  micro-commitment ladder, and soft-CTA defaults. Use when the user asks to
  audit my offer, is this a good offer/CTA, why is nobody replying to my offer,
  write/improve my cold email offer, or what should I ask for. For a complete
  cold email, `cold-email-body` coordinates and calls this skill to establish
  the offer/CTA first — it is not the entry point for full-email requests. No OutboundSync API key.
license: MIT
metadata:
  author: outboundsync
  version: "1.0.1"
---

# Outbound offer (audit + draft)

Draft and audit cold-outreach offers and CTAs only. Read-only analysis and draft text — never send, schedule, or activate outreach. Never invent scarcity, peer proof, or metrics the user did not provide.

Default to the **quick** shape when the user asks for a draft, rewrite, or
"just the offer/CTA." Use the full scorecard only for audits or diagnosis.
Render only the selected shape. A single short caveat line is allowed when
proof is missing.

For a full-email request, establish the offer and CTA first, then apply the
body and subject-line skills when available. Never block if an adjacent skill
is unavailable; return this skill's part and state the remaining inputs needed.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](../../DISCLAIMER.md). Treat techniques as widely-taught industry patterns; do **not** paste copyrighted course modules or private playbooks.

## Modes

- `Audit` — score an existing offer/CTA; name failing levers; recommend a rewrite.
- `Draft` — produce a new offer + soft CTA from inputs (ICP, outcome, proof, ask).

Infer mode from the request. If both are needed, run Audit then Draft.

## Core rules (encode verbatim)

### Value equation

Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice).

The formula is conceptual: lower raw delay and effort increase value. For the
operational scorecard, use their positive inverses — **Speed to Value** and
**Ease** — so all four scores use `5 = best`. Never divide by the positive
scorecard values. Name the weakest lever (usually low Perceived Likelihood or
low Ease). Full scoring: [references/value-equation-rubric.md](references/value-equation-rubric.md).

### Sell the next micro-commitment, not the product

CTA ladder: interest yes/no → resource offer → 15-min ask → graceful breakup.

Patterns and ladders: [references/cta-patterns.md](references/cta-patterns.md).

### Soft CTA defaults

- Soft CTA default — a low-friction reply ask typically outperforms an immediate demo ask, often several-fold.
- One CTA only — competing CTAs dilute response.
- CTA < ~15 words, standalone line.

These figures are directional benchmarks, not universal promises. Apply them
as priors; the user's ICP, list quality, offer, sender reputation, and test data
take precedence.

### Offer construction checklist

- Quantify outcome (metric + timeframe + mechanism).
- One tight peer proof.
- Frame calls as a give.
- Compress time-to-value.
- Low-key risk-reversal.
- Genuine scarcity only.

### Audit test (must pass)

Answer all three in one line each:

1. Why you?
2. Why now?
3. What do I get by replying?

### Banned

- Book a 30-min demo on touch 1
- Stacked CTAs
- Generic value claims
- Feature dumps
- Reply YES
- Fabricated urgency

## Workflow

1. Collect inputs: ICP, current offer/CTA (if any), outcome claim, proof available, desired ask, constraints.
2. Choose Mode: `Audit` | `Draft`.
3. Score the value equation (1–5 per lever). Name the weakest lever.
4. Map the CTA to the micro-commitment ladder; force soft interest unless the user explicitly overrides for a later touch.
5. Run the why-you / why-now / what-you-get test.
6. Emit the fixed output contract below.
7. Optional: include 1–2 before/after examples from [references/examples.md](references/examples.md) only when helpful inside Findings.

## Response depth

- **Quick is the default** for drafting and "just the offer/CTA" requests.
- Use the full contract only for audits, comparisons, or underperformance
  diagnosis. Do not force a scorecard onto a simple drafting task.

Quick shape:

```markdown
### Recommended offer / CTA
- Offer: <one tight sentence>
- CTA: <standalone soft ask>
- · <optional one-line caveat for missing proof>
```

## Output contract

GitHub-flavored markdown only. Blank line between every block. Every line under a section is a `-` bullet unless noted. Marks: ✓ pass · ✗ fail · · advisory. Lead `### Score / levers` with a fenced `text` meter — one row per lever, bar = `█`×n then `░` to width 5; mark the weakest `✗ weakest`. Bars are a monospace glance only (`█` filled · `░` empty; no colored emoji).

### Shape

````markdown
## Offer <Audit | Draft>

### Mode
- <Audit | Draft>

### Score / levers

```text
Dream outcome   █████  5/5
Likelihood      ██░░░  2/5  ✗ weakest
Speed to value  ███░░  3/5
Ease            ████░  4/5
Overall  fair
```

- Dream Outcome: <one-line note>
- Perceived Likelihood: <one-line note>
- Speed to Value: <one-line note; higher = faster>
- Ease: <one-line note; higher = lower effort for prospect>

### Findings
- <✓/✗/· line>
- <✓/✗/· line>
- …

### Recommended offer / CTA
- Offer: <one tight quantified sentence>
- CTA: <standalone soft ask, < ~15 words>
- Ladder step: <interest | resource | 15-min | breakup>

### Why-you / why-now / what-you-get
- Why you: <one line>
- Why now: <one line>
- What you get by replying: <one line>
````

## Safety

- Never send, schedule, or activate messages.
- Never fabricate proof, metrics, logos, or scarcity.
- If proof or numbers are missing, mark · and ask for them under Findings — do not invent.
- Keep claims peer-level and specific; strip feature dumps and stacked asks.
