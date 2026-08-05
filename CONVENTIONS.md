# Skill output conventions

How OutboundSync Agent Skills render their output. **New skills follow these by default** so the pack reads as one system. Security and write behavior live in [SECURITY.md](SECURITY.md) (see the Write-on-confirm protocol); this file covers presentation.

## Shared visual language

Every output-producing skill renders **GitHub-flavored markdown only**, terminal-friendly:

- **Marks:** `✓` pass · `✗` fail/blocker · `·` advisory/warning. Readiness and deliverability skills also use `UNVERIFIED` for checks that could not be confirmed — never a silent pass.
- **No colored emoji, no ASCII boxes.** The only "graphics" are monospace **block glyphs** (`█` `░` `▒`) inside fenced `text` blocks or table cells.
- **Blank line between blocks;** one status line per `-` bullet; never two marks on one line.
- Output-producing skills declare an **`## Output contract`** with a fenced **`### Shape`** template, and render only that shape — no prose outside it.

## Score meter — required for any skill that scores or rates

Any skill that produces a numeric score, rating, or lever breakdown **must lead that section with a compact meter** so the result is legible at a glance — the same visual family as the `preflight` status gauge.

**Glyphs:** `█` filled · `░` empty (monospace only).

**Bar width by scale:**

| Scale | Width | Fill |
| --- | --- | --- |
| `/5` (levers) | 5 | `█`×n, then `░` to 5 |
| `/20` | 10 | `█`×round(n/20×10), then `░` to 10 |
| `/100` | 20 | `█`×round(n/100×20), then `░` to 20 |

**Placement:**

- **List / single-score outputs** → a leading fenced `text` meter block, one row per item: `<label>  <bar>  <n>/<max>  <note>`. Flag the weakest lever with `✗ weakest`.

  ```text
  Dream outcome   █████  5/5
  Likelihood      ██░░░  2/5  ✗ weakest
  Speed to value  ███░░  3/5
  Ease            ████░  4/5
  ```

- **Table outputs** → put the bar in the score cell: `<bar> <n>/<max>`.

**Principles:**

- The meter is the **glance layer only** — the detailed breakdown (bullets / table / findings) stays below it, unchanged.
- Scores are judgment against the skill's own rubric, **not** industry benchmarks — say so.
- Never fabricate a score. If inputs are missing, mark the item `·` advisory or `UNVERIFIED` rather than inventing a number.

**Reference implementations:** `cold-email-body` (/100), `outbound-offer` (/5 levers), `cold-email-subject-lines` (/20), `omnichannel-campaigns` (/5), `list-building` (/5). `preflight`, `email-authentication`, and `sending-domain-quality` use the same glyph language for their readiness/audit gauges.

## Disclaimer note

Skills that encode OutboundSync best practices carry this note near the top (path is relative to `skills/<name>/SKILL.md`):

```markdown
**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](../../DISCLAIMER.md).
```

Skills that reference third-party techniques append: *"Treat techniques as widely-taught industry patterns; do not paste copyrighted course modules or private playbooks."* — and **never name specific people or companies**; describe the technique and name tool **categories**, not vendors.

## Frontmatter & naming

Enforced by [`scripts/validate_skill_integrity.sh`](scripts/validate_skill_integrity.sh):

- `name:` must equal the folder name; `description:` present and non-empty.
- `description` style: **verb-led** first word, then a sentence beginning "Use when the user asks…" listing concrete trigger phrases. Account-free skills end the description with "No OutboundSync API key."
- Include `license: MIT` and `metadata:` (`author: outboundsync`, `version`). Add `compatibility:` only when the skill needs a key or external tooling.
