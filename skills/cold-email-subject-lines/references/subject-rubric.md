# Subject-line rubric (/20)

Score each subject out of **20**. Verdict bands: **16–20 keep** · **10–15 rewrite** · **≤9 kill**.

## Criteria

| Points | Criterion | Pass rule |
| --- | --- | --- |
| 4 | Length | 1–4 words **and** < ~40 characters |
| 4 | Front-load | Meaningful token in first ~35–38 chars (survives mobile truncate) |
| 3 | Lowercase | Entirely lowercase (internal-note look; +~21% opens directional) |
| 3 | Specificity | Segment or trigger token (role, event, metric, tool) — not only `{{first_name}}` |
| 3 | Clarity | Clear topic; no manufactured curiosity / clickbait |
| 3 | Clean | No spam/sales words, ALL CAPS, !!!, emoji, fake Re:/Fwd:, empty |

## Deductions (apply after base score; floor at 0)

| Hit | Deduction |
| --- | --- |
| Each spam/sales trigger word | −2 (see spam-word-list) |
| 2+ high-risk spam/sales trigger words | −4 and manual review (≈73% lower inbox placement in a directional benchmark); do not auto-kill clear, relevant language without context |
| Emoji | −3 (opens ~42%→37% directional) |
| ALL CAPS (any word ≥3 letters) | −3 |
| `!` or `!!!` | −2 |
| Fake `Re:` / `Fwd:` | −5 + kill |
| Empty / whitespace-only | kill |
| > 40 characters | −2 |
| > 4 words | −2 |
| Title Case / Sentence case when lowercase possible | −1 |

## Prefer

- Internal-note tone: `quick question`, `{{company}} outbound`, `reply lag`
- Trigger-led: `post-funding outbound`, `hiring sdrs`, `crm sync gap`
- Peer-context: `{{peer role}} note`

## Avoid

- Hype: `game changer`, `exclusive offer`, `act now`
- Empty personalization: `{{first_name}}` alone
- Curiosity bait with no topic: `quick thought`, `you free?` without context when paired with weak body

## Mobile check

Paste the subject and mentally cut at character **35**. If the unique meaning is lost, front-load or shorten.
