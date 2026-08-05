# Tool categories for list building

Name the **category**, not a vendor. Categories are the load-bearing structure; specific products change and vary by region, plan, and CRM. For whether a specific tool is live with the user's CRM, use the `integrations` skill.

## The three categories

| Category | What it does | Best for | Watch for |
| --- | --- | --- | --- |
| Signal / intent tools | Surface accounts/people showing a buying signal (job change, hiring, funding, tech adoption, engagement) | Timing-led outbound where relevance beats volume | Signal noise; low volume; stale or loosely-relevant signals |
| Contact databases | Search a standing database of companies/people by firmographic + role filters | Breadth quickly against a clear ICP | Staleness; heavy overlap (everyone pulls the same rows); role mismatch |
| Waterfall enrichment / data aggregators | Take a seed and run it through multiple providers to fill/verify fields, plus research/validation | Turning accounts/domains into verified contacts; raising match rate | Cost; over-enrichment; trusting unverified fields |

## The waterfall concept

A waterfall chains data providers **in order of precision**: try the first; if it can't return the field at the required confidence, fall back to the next; continue until a provider returns it or the chain ends. This raises match rate on the fields you need (verified email, role, phone) beyond what any single provider gives.

Keep it disciplined:

- Enrich only fields you will actually use.
- Set a confidence bar; flag or drop rows below it rather than sending on guesses.
- Prefer verified over inferred data for anything that gates a send.

## Choosing / combining

- Start from the **goal + seed data**: a live trigger → signal tools; a clear ICP and need for breadth → databases; accounts/domains but no people → waterfall.
- Blends are normal: a signal picks accounts, a database or waterfall gets the people.
- Whatever the category, finish with dedupe against the CRM/SEP and suppression/consent checks (see [sourcing-rubric.md](sourcing-rubric.md)).
