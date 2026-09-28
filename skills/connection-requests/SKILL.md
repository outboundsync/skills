---
name: connection-requests
description: >-
  Audit or draft professional social network connection notes and invite
  strategy (note vs blank, personalization, warmup, safe volume). Use when the
  user asks about connection requests, connection notes, should I add a note,
  why low acceptance, social outreach messages, or invite copy. No OutboundSync API key.
license: MIT
metadata:
  author: outboundsync
  version: "1.1.0"
---

# Connection requests (social outreach)

Platform-agnostic. Say **professional social network** / **social outreach** — never name a specific network. Audit and draft invite notes only. Never send invites, scrape profiles, or automate clicks.

Default to the **quick** shape when the user asks for a note or "just the
copy." Use the full contract only for audits or volume/health checks. Render
only the selected shape.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](https://github.com/outboundsync/skills/blob/main/DISCLAIMER.md). Treat techniques as widely-taught industry patterns; do **not** paste copyrighted course modules or private playbooks.

## Core rules (encode verbatim)

### Note vs blank

- Note-vs-blank is a **tested variable**, not a default.
- Generic note is worst.
- Specific note lifts acceptance markedly and roughly doubles post-accept reply.
- Blank can beat generic.

### Note constraints

- Never pitch / no meeting ask / no link.
- Note **120–180 chars** (hard cap **300** — never max it).
- Personalize on **verifiable signal** (recent post/comment < 2 weeks, mutual, shared group) — not name/title.

### Sequence and profile

- Profile optimization prerequisite (problem + audience headline).
- Warm up **3–4 touches** before requesting.
- connect → wait **~24h** → open with **one easy question** → never immediate pitch.

### Safe volume

- ~**100 invites/week**, ~**20/day** (ramp new accounts from **10–20/day**).
- Acceptance **> 40%** (< **20%** red-flag), pending **< ~500**, withdraw stale.
- Benchmark by seniority (senior / C-level accept at markedly lower rates than individual contributors).

These are directional operating heuristics, not platform limits or guarantees.
Current account restrictions, geography, seniority mix, account age, and the
network's published rules take precedence. If the user provides observed data,
compare against their own baseline before generic benchmarks.

Details: [references/connection-scoring-rubric.md](references/connection-scoring-rubric.md), [references/warmup-and-ladder.md](references/warmup-and-ladder.md), [references/safe-volume.md](references/safe-volume.md), [references/examples.md](references/examples.md).

## Workflow

1. Collect: draft note (if any), signal available, seniority mix, current volume/acceptance/pending.
2. Mode: `Audit` | `Draft` | `Volume check`.
3. Decide note vs blank recommendation (specific signal → note; none → blank over generic).
4. Score note /100; enforce 120–180 chars and no pitch/link.
5. Emit output contract.

## Response depth

- **Quick is the default** for drafting and "just the note" requests.
- Use the full contract only for audits and account-health checks.

Quick shape:

````markdown
```text
<120–180 chars, or `(blank — no note)`>
```

- Char count: <n>/300
- Note vs blank: <specific note | blank> — <one line>
````

## Output contract

GitHub-flavored markdown only. Render only the selected shape; no prose outside it. Blank line between blocks. Marks: `✓` pass · `✗` blocker · `·` advisory; the mark leads every bullet.

- **Score** leads with the pack's 20-cell `/100` [score meter](https://github.com/outboundsync/skills/blob/main/CONVENTIONS.md#score-meter--required-for-any-skill-that-scores-or-rates): `█` × round(n / 100 × 20), then `░`. Scores are judgment against this skill's rubric, not industry benchmarks.
- **Volume / health** uses the [status layout](https://github.com/outboundsync/skills/blob/main/CONVENTIONS.md#status-layout--required-for-readiness-health-and-audit-skills) gauge: one gate per row — Invites (within the safe band), Acceptance (vs the seniority benchmark), Pending (under ~500), Restrictions (none). A gate passes on `✓` or `·` caution and fails on `✗` red flag; a metric the user didn't give is `▒` `· UNVERIFIED — not provided`. Omit the section outside Audit and Volume check.

### Shape

````markdown
## Connection request <Audit | Draft | Volume check>

### Mode
- <Audit | Draft | Volume check>

### Note vs blank
- Recommendation: <specific note | blank | test both>
- Reason: <one line>

### Score

```text
Score  <bar>  <n>/100 · <fail | weak | solid | strong>
```

- <✓ | · | ✗> <category> <n>/<max> — <one-line reason>
- …

### Findings
- <✓/✗/· line>
- …

### Recommended note
```text
<120–180 chars, or `(blank — no note)`>
```
- Char count: <n>/300

### Post-accept ladder
- Wait ~24h → one easy question → no immediate pitch

### Volume / health

```text
Overall       <bar>  <p>/<t> · <healthy | at risk>[ · <n> unverified]

Invites       <bar>  <mark> <n>/day · <n>/week vs <band>
Acceptance    <bar>  <mark> <n>% vs <IC | manager | C-level> benchmark
Pending       <bar>  <mark> <n> pending
Restrictions  <bar>  <mark> <none | recent warning | active limit>
```

- <✓ | · | ✗> <shortest fix or confirmation per failing row>
````

## Safety

- Never send invites or messages.
- Never recommend scraping, automation abuse, or fake mutual context.
- Never name a specific professional network brand.
- If signal isn’t verifiable, prefer blank over invented personalization.
