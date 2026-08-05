---
name: omnichannel-campaigns
description: >-
  Structure omnichannel outbound campaigns across email and B2B social
  networking: channel roles, sequence timing, handoffs, and safe volume. Use
  when the user asks how to combine email and B2B social (professional
  networking sites), build a multi-channel sequence, omnichannel outbound plan,
  social plus email cadence, or coordinate cold email with connection requests.
  No OutboundSync API key.
license: MIT
metadata:
  author: outboundsync
  version: "1.0.0"
---

# Omnichannel campaigns (email + social)

Plan email + B2B social networking (professional social platforms) outbound as one system. Draft plans and scorecards only — never send, schedule, activate campaigns, or mutate CRM/SEP data.

Render **only** the selected output shape. No invented metrics, scarcity, or case-study numbers the user did not provide.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](../../DISCLAIMER.md). Treat techniques as widely-taught industry patterns; do **not** paste copyrighted course modules or private playbooks.

## When to use adjacent skills

| Need | Skill |
| --- | --- |
| Offer / CTA | `outbound-offer` |
| Email body | `cold-email-body` |
| Subject lines | `cold-email-subject-lines` |
| Connection note copy | `connection-requests` |
| Launch wiring / Sources | `preflight` |
| CRM reply performance | `crm-analysis` |

Never block if an adjacent skill is missing — return this skill’s plan and list remaining inputs.

## Modes

- `Audit` — score an existing multi-channel plan; name gaps.
- `Draft` — produce a channel map + sequence skeleton from ICP / offer / assets.

Infer from the ask. If both needed, Audit then Draft.

## Design principles (patterns, not prescriptions)

Encode these as checks. Treat them as widely-taught industry patterns, not proprietary playbooks — describe the technique itself, and never invent metrics or attribute claims to specific people or companies.

1. **One job per touch** — each step has a single job (open a loop, earn a connect, bump, break up).
2. **Channel fit** — email for async narrative + CTA; social for familiarity, soft bumps, and relationship context — not a second identical pitch dump.
3. **Familiarity before ask** — light social presence / connect intent before heavy asks when the motion is cold.
4. **Handoffs are explicit** — when a reply or accept happens, stop the parallel sequence; define who owns the thread.
5. **Volume is a constraint** — respect mailbox and social limits; prefer fewer high-signal touches over parallel spam.
6. **Same offer, different surface** — offer/CTA stays coherent; copy length and proof density change by channel.
7. **Breakup is a step** — plan an exit; do not infinite-nudge.

Rubric detail: [references/channel-rubric.md](references/channel-rubric.md).  
Sequence skeletons: [references/sequence-patterns.md](references/sequence-patterns.md).

## Required inputs

Collect or mark missing:

- ICP / persona
- Offer + soft CTA (or run `outbound-offer` first)
- Channels in scope (email, B2B social networking sites, other)
- Assets available (case study, resource, personalization signals)
- Constraints (daily send caps, seat count, compliance notes the user states)

## Output contract

GitHub-flavored markdown only. Blank line between blocks. Marks: ✓ pass · ✗ fail · · advisory. In `### Scorecard`, the Score cell leads with a bar: `<bar> <n>/5`; bar = `█`×n then `░` to width 5 (monospace glance; no colored emoji).

### Quick (default for “build me a sequence”)

```markdown
## Omnichannel plan

- Goal: <one line>
- Channels: <email · B2B social · …>
- Spine: <Day/step list — max 8 steps — channel · job · asset>
- Handoff: <what stops the sequence>
- Watchouts: <volume / compliance / missing inputs — one line each>
```

### Scorecard (Audit)

```markdown
## Omnichannel audit

| Lever | Score | Note |
| --- | --- | --- |
| Channel fit | <bar> n/5 | |
| One job per touch | <bar> n/5 | |
| Familiarity before ask | <bar> n/5 | |
| Handoff clarity | <bar> n/5 | |
| Volume safety | <bar> n/5 | |
| Offer coherence | <bar> n/5 | |
| Exit / breakup | <bar> n/5 | |

**Weakest lever:** <name>
**Rewrite focus:** <one paragraph>
```

Scores are judgment against the rubric — not industry benchmarks.

## Safety

- No sends, CRM writes, or SEP mutations.
- No fabricated proof or reply-rate claims.
- Respect platform terms the user mentions; this skill is not legal advice.
