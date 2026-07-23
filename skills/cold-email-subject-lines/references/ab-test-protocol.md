# A/B test protocol (subject lines)

## Primary metric

**Reply rate**, not open rate.

Why opens mislead:

- Apple Mail Privacy Protection (MPP) inflates opens **+15–20 pts**.
- ~**49%** of tracked opens may be MPP (directional).
- Subjects optimized for opens can lose on replies.

Secondary (diagnostic only): bounce, unsubscribe, spam complaint, positive-reply rate.

## Test design

1. **One variable only** — subject text. Keep from-name, preview/preheader, body, send time, list, and tracking settings constant.
2. **Random split** — equal traffic; no cherry-picking segments mid-test.
3. **Rough exposure floors**
   - ≥ **250 delivered recipients / variant** for an exploratory open-rate read
     (still not the winner metric).
   - ≥ **500 delivered recipients / variant** for an exploratory reply-rate
     read.
   - These are screening heuristics, not universal statistical guarantees. For
     consequential decisions, calculate sample size from baseline reply rate,
     minimum detectable effect, confidence level, and desired power.
4. If volume is low, run longer — do not call winners early on open lifts.

## Variant rules

- 2 variants default; max 3–4 if volume supports sample floors.
- Each variant must pass the subject rubric (≥10/20) and spam list (0–1 soft hits max; 0 hard hits).
- Change only: wording **or** trigger token **or** length band — not all at once.
- All-lowercase preferred on both sides so case is not a confounder unless case is the variable under test.

## Calling a winner

| Condition | Action |
| --- | --- |
| Reply rate lift is statistically credible after the full reply window | Promote winner |
| Open lift only, replies flat/down | Do **not** promote; note MPP |
| Complaints/unsubs up on “winner” | Kill despite reply lift |
| Both below baseline | New draft cycle; do not average mediocre subjects |

## Reporting template

```text
Test: <name>
Variable: subject only
A: "<subject a>"
B: "<subject b>"
Sends/variant: <n>
Opens/variant: <n> (informational; MPP caveat)
Replies/variant: <n>
Reply rate A/B: <x%> / <y%>
Winner: <A|B|none> — reason
```

## Anti-patterns

- Testing subject + body together
- Stopping at 50 opens because “opens look good”
- Using fake `Re:` as a “variant”
- Declaring winners from open rate under MPP
