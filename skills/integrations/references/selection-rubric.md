# Integrations selection rubric

Score fit from live directory fields. **Availability first.** Tier is context only.

## Priority order (high → low)

1. **Availability** — Live preferred; Beta only if the user accepts beta risk; Planned/Requested are never “ready” recommendations.
2. **Must-haves the user stated** — category/`type`, connection (Direct vs Via Partner), sync/`depth` (one-way vs two-way), required channels (`hasEmail` / `hasSocial` / `hasPhone`).
3. **CRM compatibility** — confirm on the detail page when the user named HubSpot / Salesforce / Close / Attio (index JSON does not list CRM targets for SEPs/tools).
4. **Stack / category fit** — SEP vs enrichment vs automation vs inbox vs AI/Agents vs CRM product itself.
5. **Tier** — partnership/deployment depth with OutboundSync. Tie-breaker among otherwise equal Live fits — **never** quality or price rank.

## Matching guidance

- Always put `availabilityStatus` first in the output card.
- If the user needs “works today,” require Live (or Beta with explicit caution).
- Connection: Direct ≠ Via Partner — do not blur.
- Sync: One-way sync ≠ Two-way sync — do not stretch.
- Channels: if they need phone, require `hasPhone: true`.
- Untiered Live listings can outrank Gold Planned — usability beats badge.
- If nothing is Live for the ask: say so; list Beta (caution) and Planned/Requested; point to express-interest / get-demo / request paths on the listing — do not invent a Live connector.

## Anti-patterns

- Sorting Gold → Silver → Bronze by default.
- Treating Planned/Requested as usable.
- Filling the shortlist from memory without re-fetching JSON.
- Claiming “best integration” from directory data alone.
- Inventing sync direction, connection type, availability, pricing, or case studies.
- Dismissing non-listed tools as inferior.
- Preferring Gold Beta over Bronze Live when the user needs production readiness.
