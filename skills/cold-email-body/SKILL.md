---
name: cold-email-body
description: >-
  Audit or draft cold email body copy for length, signal-led personalization,
  structure, soft CTA, and deliverability hygiene. Use when the user asks to
  write a cold email, audit this email, why no replies, make this
  shorter/better, cold email copy, or a complete cold email including offer,
  body, and subject. This is the primary coordinator for complete-email
  requests. No OutboundSync API key.
license: MIT
metadata:
  author: outboundsync
  version: "1.0.1"
---

# Cold email body

Audit and draft cold email bodies only. Read-only analysis and draft text — never send, schedule, or enable tracking. Prefer plain-text, single soft CTA, signal-led personalization.

Default to the **quick** shape when the user asks for copy, a short draft, or
"just the email." Use the full audit shape only for diagnosis, scoring, or
when the user asks why something underperforms. Render only the selected
shape. A single short caveat line is allowed when proof or a critical input
is missing.

For a full-email request, use `Complete` mode: establish the offer/CTA first,
draft the body, then finalize the subject. Apply adjacent offer/subject skills
when available, but assemble **one user-facing answer** from their results
rather than emitting three separate audit reports. Never block if they are not
installed.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](../../DISCLAIMER.md). Treat techniques as widely-taught industry patterns; do **not** paste copyrighted course modules or private playbooks.

## Core rules (encode verbatim)

### Length and readability

- **50–100 words** / **3–4 sentences**, 3rd–5th grade reading level, one phone screen.

### Personalization

- Signal-led personalization + **removal test** (delete personalized line; if email still stands it was decorative).
- Signal-led personalization tends to **materially outperform** generic copy — often several-fold on reply rate.

All performance figures in this skill are directional benchmarks, not promises
or universal causal effects. Use them as priors; the user's own campaign data,
ICP, list quality, offer, and sender reputation take precedence.

### Structure

- Default: **Signal → Problem+Solution → Proof → soft CTA**
- Alternates: PAS / BAB — see [references/frameworks.md](references/frameworks.md)
- **You/your**, not we/our/I-centered product tours
- Exactly **one** soft interest CTA — a single clear ask outperforms stacking multiple asks

### Deliverability hygiene

- Plain text, minimal signature
- Open-tracking pixel **OFF** and link tracking **off** on cold sends (tracking pixels/links tend to dent inbox placement)
- **Zero** links/images/attachments on touch 1
- Poke-the-bear question option
- Spintax = deliverability insurance, not reply booster

### Banned

- “I hope this finds you well” (filler opener — signals a template and depresses replies)
- synergy / leverage / best-in-class
- circle back / just checking in / just bumping this
- quick call
- calendar link on touch 1
- congrats-opener flattery

Lists: [references/banned-phrases.md](references/banned-phrases.md). Scoring: [references/body-scoring-rubric.md](references/body-scoring-rubric.md). Examples: [references/examples.md](references/examples.md).

## Workflow

1. Collect: ICP, signal, problem, offer, proof, draft (if any).
2. Mode: `Audit` | `Draft` | `Complete`.
3. For full responses, score /100 with the body rubric and run the
   personalization removal test.
4. Enforce one soft CTA; strip links/tracking advice into Findings.
5. In Complete mode, draft 2–3 subject options after the body; keep the body
   as the primary artifact and emit one assembled answer.
6. Emit output contract; draft rewrite when Mode is Draft or Audit finds < 70.

## Response depth

- **Quick is the default** for drafting and "just give me the copy" requests.
- Use the full scorecard only for audits and diagnosis.
- Never invent a case study, result, customer, signal, or metric. If proof is
  missing, write a mechanism-led proofless version and optionally one caveat
  line — never a fake peer claim.

Quick Draft shape:

````markdown
```text
<plain-text email>
```

· <optional one-line caveat for missing proof or input>
````

Quick Complete shape:

````markdown
### Subject options
1. `<subject>`
2. `<subject>`
3. `<subject>`

### Email
```text
<plain-text email>
```

· <optional one-line caveat for missing proof or input>
````

## Output contract

GitHub-flavored markdown only. Blank line between blocks. Marks: ✓ · ✗ · ·. Lead `### Score` with a fenced `text` meter: `Score  <bar>  <total>/100 · <band>`; bar = `█`×round(total/100×20) then `░` to width 20 (monospace glance; no colored emoji).

### Shape

````markdown
## Cold email body <Audit | Draft | Complete>

### Mode
- <Audit | Draft | Complete>

### Score

```text
Score  ███████████████░░░░░  78/100 · solid
```

- Total: </100>
- Length/readability: </20>
- Personalization (removal test): </20>
- Structure: </20>
- CTA: </15>
- Hygiene (links/tracking/plain text): </15>
- Language (banned/you-voice): </10>
- Band: <fail <50 | weak 50–69 | solid 70–84 | strong 85–100>

### Findings
- <✓/✗/· line>
- …

### Recommended body
```text
<plain-text email, 50–100 words, 3–4 sentences>
```

### CTA
- `<standalone soft CTA line>`

### Subject options
<!-- Complete mode only; omit in Audit/Draft unless requested -->
1. `<1–4 word subject>`
2. `<1–4 word subject>`

### Tracking note
- Open pixel: OFF · Link tracking: OFF · Touch-1 links/images/attachments: none
````

## Safety

- Never send or enable tracking.
- Never invent personalization signals; if missing, mark · and ask.
- Never add calendar links or multi-asks on touch 1.
