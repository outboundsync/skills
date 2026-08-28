---
name: cold-email-subject-lines
description: >-
  Audit, rewrite, and A/B-test cold email subject lines for length, clarity,
  spam risk, and reply-rate measurement. Use when the user asks about subject
  lines, improve my subject, why low open rate, audit these subjects, or A/B
  test subjects. For a complete cold email, `cold-email-body` coordinates and
  calls this skill for the subject once the offer and body are set — it is not
  the entry point for full-email requests. No OutboundSync API key.
license: MIT
metadata:
  author: outboundsync
  version: "1.0.1"
---

# Cold email subject lines

Audit and draft subject lines only. Read-only analysis and draft text — never send, schedule, or mutate campaigns. Prefer **reply rate** over opens when advising success.

Default to the **quick** shape when the user asks for subjects, options, or
"just the subjects." Use the full scorecard only for audits or A/B plans.
Render only the selected shape.

For a full-email request, establish the offer and body before finalizing the
subject. Use adjacent offer/body skills when available, but never block if they
are not installed.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](../../DISCLAIMER.md). Treat techniques as widely-taught industry patterns; do **not** paste copyrighted course modules or private playbooks.

## Core rules (encode verbatim)

### Length and shape

- Length **1–4 words** / **< ~40 chars**, front-loaded (mobile truncates ~35–38).
- **All-lowercase** (internal-note look — tends to lift opens).
- Segment/trigger-specific token — not just `{{first_name}}`.
- Clarity over manufactured curiosity.

### Strip spam and sales tells

- Strip sales/spam words — they depress opens, and stacking several sharply cuts inbox placement.
- Ban **ALL CAPS**, **!!!**, **emoji** (tends to lower opens), fake `Re:`/`Fwd:`, empty subject.

Treat these figures as directional benchmarks, not causal guarantees. The
message, audience, sender reputation, and list quality can dominate; never
reject a clear, relevant subject solely because of a benchmark.

Word list: [references/spam-word-list.md](references/spam-word-list.md). Rubric: [references/subject-rubric.md](references/subject-rubric.md).

### Measure correctly

- Measure on **REPLY rate** not opens (Apple MPP inflates opens +15–20 pts; ~49% of tracked opens are MPP).
- A/B **one variable**. As rough minimum exposure, target **250+ delivered
  recipients/variant** for an open-rate read and **500+ delivered
  recipients/variant** for a reply-rate read; calculate power from the
  baseline rate and minimum detectable effect when making a consequential
  decision. Do not wait for 500 actual replies.

Protocol: [references/ab-test-protocol.md](references/ab-test-protocol.md). Examples: [references/examples.md](references/examples.md).

## Workflow

1. Collect subjects (or draft from ICP + trigger + offer).
2. Mode: `Audit` | `Draft` | `A/B plan`.
3. Score each subject against the rubric; flag spam tokens and mobile truncation.
4. For Draft / A/B: propose 2–4 variants changing one variable only.
5. Remind: judge winners on replies, not opens.
6. Emit the output contract.

## Response depth

- **Quick is the default** for drafting and "just the subjects" requests.
- Use the full scorecard only for audits and test plans.

Quick shape:

```markdown
1. `<subject>` — <short rationale>
2. `<subject>` — <short rationale>
```

## Output contract

GitHub-flavored markdown only. Blank line between blocks. Marks: ✓ · ✗ · ·. In `### Scorecard`, the Rubric cell leads with a bar: `<bar> <n>/20`; bar = `█`×round(n/20×10) then `░` to width 10 (monospace glance; no colored emoji).

### Shape

````markdown
## Subject lines <Audit | Draft | A/B plan>

### Mode
- <Audit | Draft | A/B plan>

### Scorecard
| Subject | Chars | Words | Lowercase | Spam hits | Rubric | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `<subject>` | <n> | <n> | ✓/✗ | <n or list> | <bar> <n>/20 | keep / rewrite / kill |

### Findings
- <✓/✗/· line>
- …

### Recommended subjects
1. `<subject>` — <why; trigger/segment token>
2. `<subject>` — <why>
3. `<subject>` — <why>  <!-- optional -->

### Measurement note
- Primary metric: reply rate (not opens)
- MPP caveat: opens inflated; ~49% of tracked opens may be MPP
- A/B: one variable · rough exposure floor ≥250 delivered/variant for opens or
  ≥500 delivered/variant for replies · use a power calculation for decisions
````

## Safety

- Never send or edit live campaigns.
- Never suggest fake `Re:`/`Fwd:`, empty subjects, or emoji spam.
- Do not treat open-rate lifts as proof of subject quality under MPP.
