---
name: connection-requests
description: >-
  Audit or draft professional social network connection notes and invite
  strategy (note vs blank, personalization, warmup, safe volume). Use when the
  user asks about connection requests, connection notes, should I add a note,
  why low acceptance, social outreach messages, or invite copy.
license: MIT
metadata:
  author: outboundsync
  version: "1.0.0"
---

# Connection requests (social outreach)

Platform-agnostic. Say **professional social network** / **social outreach** — never name a specific network. Audit and draft invite notes only. Never send invites, scrape profiles, or automate clicks.

Default to the **quick** shape when the user asks for a note or "just the
copy." Use the full contract only for audits or volume/health checks. Render
only the selected shape.

## Core rules (encode verbatim)

### Note vs blank

- Note-vs-blank is a **tested variable**, not a default.
- Generic note is worst.
- Specific note lifts acceptance **~45–72%** and ~**2×** post-accept reply.
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
- Benchmark by seniority (C-level **18–25%** vs IC **40–55%**).

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

GitHub-flavored markdown only. Blank line between blocks. Marks: ✓ · ✗ · ·

### Shape

````markdown
## Connection request <Audit | Draft | Volume check>

### Mode
- <Audit | Draft | Volume check>

### Note vs blank
- Recommendation: <specific note | blank | test both>
- Reason: <one line>

### Score
- Total: </100>
- Band: <fail | weak | solid | strong>
- Category lines: <bullets with scores>

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
- Invites: <n/day · n/week> vs safe band
- Acceptance: <n%> · benchmark <IC|manager|C-level>
- Pending: <n> · <ok | withdraw stale>
````

## Safety

- Never send invites or messages.
- Never recommend scraping, automation abuse, or fake mutual context.
- Never name a specific professional network brand.
- If signal isn’t verifiable, prefer blank over invented personalization.
