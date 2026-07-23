# Agency selection rubric

Score fit from live directory fields. Tier is context only.

## Priority order (high → low)

1. **Must-haves the user stated** — CRM in `tools[]`, required channels (`hasEmail` / `hasSocial` / `hasPhone`), delivery model, focus.
2. **Stack overlap** — shared SEP/enrichment/automation tools the user already runs (or plans to run).
3. **Focus alignment** — Outbound Lead Gen vs CRM Implementation vs Full-Service & Allbound.
4. **Geography / HQ** — only if the user cares (`headquarters`).
5. **Tier** — partnership/deployment depth with OutboundSync. Use as a tie-breaker among otherwise equal fits, or as a signal of OutboundSync implementation familiarity — **never** as quality or price rank.

## Matching guidance

- Prefer exact Focus match. If only Full-Service & Allbound matches a narrow lead-gen request (via UI overlap rules), say so.
- Delivery: “Done for you” ≠ “Done with you” ≠ “Flexible.” Do not stretch labels.
- Tools: require the user’s CRM in `tools[]` when they named one. Extra tools are optional upside, not a reason to upsell tier.
- Channels: if they need phone, require `hasPhone: true` — do not assume email agencies “can probably dial.”
- Untiered listings can be shortlisted when fields fit. Absence of a badge is not a defect.
- If several fit, diversify delivery models or geographies when useful — do not return only Gold.

## Anti-patterns

- Sorting the shortlist Gold → Silver → Bronze by default.
- Filling the shortlist from memory or a past conversation without re-fetching JSON.
- Claiming “best agency” or market #1 from directory data alone.
- Inventing pricing, case studies, or contact paths.
- Dismissing non-listed agencies as inferior.
