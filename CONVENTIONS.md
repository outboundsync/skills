# Skill output conventions

How OutboundSync Agent Skills render their output. **New skills follow these by default** so the pack reads as one system. Security and write behavior live in [SECURITY.md](SECURITY.md) (see the Write-on-confirm protocol); this file covers presentation.

## Shared visual language

Every output-producing skill renders **GitHub-flavored markdown only**, terminal-friendly:

- **Marks:** `✓` pass · `✗` fail/blocker · `·` advisory/warning. A check that could not be confirmed is a `·` line that says `UNVERIFIED — <reason>` (the lookup failed) or `manual — <hint>` (no API exists for it). Never a silent pass, and never an empty result.
- **Mark first.** Every status bullet starts with its mark: `- ✓ Connected`, not `- Connected: ✓`. Sub-marks inside a `·` advisory are fine (`· Integration config: company ✓ · task ✗`).
- **No colored emoji, no ASCII boxes.** The only "graphics" are monospace **block glyphs** (`█` `░` `▒`) inside fenced `text` blocks or table cells.
- **Blank line between blocks;** one status line per `-` bullet; never two marks on one line.
- Output-producing skills declare an **`## Output contract`** with a fenced **`### Shape`** template, and render only that shape — no prose outside it.

## Status layout — required for readiness, health, and audit skills

Any skill that answers "is this ready / healthy / set up correctly?" renders the **status layout**. `preflight` is the reference implementation; `sync-monitoring`, `email-authentication`, and `sending-domain-quality` use it too, and `api` and `crm-analysis` use its card grammar.

1. **The `##` heading is the verdict**, not the skill name: `## Ready to launch`, `## Sync Monitoring needs attention`, `## Authentication unverified`. Compute the verdict; never print the verdict logic.
2. **A fenced `text` gauge follows immediately** — the glance layer:
   - One `Overall` row, then one row per system or item. Pad labels so every bar starts in the same column.
   - Bars are **20 cells**: `█` passed gate · `░` failed gate · `▒` unverified or manual. Filled = `round(passed / total × 20)`. A wholly unverified row is 20 `▒`.
   - A row made of several gates (a domain, an SEP) fills `█` for passed gates, `▒` for unverified ones, and `░` for the rest.
   - Each row ends with `<✓|✗|·> <ready | p/t | UNVERIFIED — reason | manual — hint>`.
   - Overall ends with `<p>/<t> · <verdict>[ · <n> manual][ · <n> unverified]`. `<p>/<t>` sums the gates of every row that has at least one verified gate. Wholly manual or unverified rows are left out of `<t>`. `<n>` counts **rows** (systems, domains) that are manual or have any unverified gate. Drop the `unverified` suffix when the verdict itself is unverified.
3. **`###` cards carry the detail**, one per system, in the gauge's order. Under each heading, one backtick **context line** identifies what was checked (`` `Connection 177 · acme.com` ``, `` `oswhk_… · hooks.example.com` ``). Then mark-first bullets, one check per line.
4. **`### Next`** — numbered, shortest actions first, present only when something needs action. Every item maps to a `✗`, an `UNVERIFIED`, or an actionable `·` line above it. Caveats are bullets, not numbered steps. A full URL or command goes on its own line in inline code under the step that needs it.
5. **Failures are data.** An auth error, 4xx/5xx, timeout, or a non-JSON body renders as `· UNVERIFIED — <reason>` with the status code when there is one — never as "none found", `false`, or `0`.

```text
Overall       ████████████░░░░░░░░  3/5 · not ready · 1 manual

CRM           ████████████████████  ✓ ready
OutboundSync  ████████████████████  ✓ ready
Instantly     ███████░░░░░░░░░░░░░  ✗ 1/3
Smartlead     ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  · manual — verify in UI
```

`npm run validate` checks every bar's width and fill (`bar-geometry`).

**Examples are part of the contract.** Every status-layout skill ships a `references/examples.md` with rendered outputs covering at least a passing state, a failing state, and an UNVERIFIED state. Use illustrative data (`example.com`), never a real customer's.

**API facts live in one place.** The `api` skill's [`references/endpoints.md`](skills/api/references/endpoints.md) is the pack's REST ↔ MCP map, enums, and error rules. Skills that call the API keep a trimmed copy in their own `references/endpoints.md` (links between skill folders break after install); `endpoint-map-consistent` keeps the copies in step.

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

**Reference implementations:** `cold-email-body` (/100), `connection-requests` (/100), `outbound-offer` (/5 levers), `cold-email-subject-lines` (/20), `omnichannel-campaigns` (/5), `list-building` (/5). Readiness and audit gauges follow the [status layout](#status-layout--required-for-readiness-health-and-audit-skills) instead.

## Disclaimer note

Every skill carries this note directly after its opening paragraph. The link is absolute because `npx skills add` installs a single skill folder, so relative `../../` links break after install:

```markdown
**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](https://github.com/outboundsync/skills/blob/main/DISCLAIMER.md).
```

Skills that reference third-party techniques append the sentence *"Treat techniques as widely-taught industry patterns; do **not** paste copyrighted course modules or private playbooks."* on the same line — and **never name specific people or companies**; describe the technique and name tool **categories**, not vendors.

## Frontmatter & naming

Checked by `npm run validate` (rules `frontmatter`, `metadata`, `description-style`; see [CONTRIBUTING.md](CONTRIBUTING.md)):

- `name:` must equal the folder name; `description:` present and non-empty.
- `description` style: **verb-led** first word, then a sentence beginning "Use when the user asks…" listing concrete trigger phrases. Account-free skills end the description with "No OutboundSync API key."
- Include `license: MIT` and `metadata:` (`author: outboundsync`, `version`). Add `compatibility:` only when the skill needs a key or external tooling.
