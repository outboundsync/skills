# List-building play skeletons

Templates only — adapt to ICP, seed data, and constraints. Not universal best practice. Every play ends with dedupe/suppression before load.

## Play A — Signal-triggered

| Step | Input | Action | Output |
| --- | --- | --- | --- |
| 1 | ICP + a chosen trigger | Define the signal precisely (event, recency window, relevance) | Signal spec |
| 2 | Signal spec | Source accounts/people showing the live signal (signal/intent category) | Signal-matched accounts |
| 3 | Signal-matched accounts | Find the right role at each account | Target contacts |
| 4 | Target contacts | Verify + enrich only the fields you'll use | Verified rows |
| 5 | Verified rows | Dedupe vs CRM/SEP, apply suppression | Load-ready list |

## Play B — Database pull

| Step | Input | Action | Output |
| --- | --- | --- | --- |
| 1 | ICP | Translate ICP into firmographic + role filters | Filter set |
| 2 | Filter set | Pull from a contact database (database category) | Raw rows |
| 3 | Raw rows | Add a differentiator (a signal or niche filter) so the list isn't the same one everyone pulls | Narrowed rows |
| 4 | Narrowed rows | Verify freshness; drop stale/role-mismatched | Verified rows |
| 5 | Verified rows | Dedupe vs CRM/SEP, apply suppression | Load-ready list |

## Play C — Waterfall enrich

| Step | Input | Action | Output |
| --- | --- | --- | --- |
| 1 | Seed (accounts / domains / partial contacts) | Decide which fields you need (email, role, phone) + confidence bar | Enrichment spec |
| 2 | Seed + spec | Run providers in sequence, falling back when one lacks coverage (waterfall / aggregator category) | Enriched rows |
| 3 | Enriched rows | Keep only rows meeting the confidence bar; flag low-confidence for review | Qualified rows |
| 4 | Qualified rows | Dedupe vs CRM/SEP, apply suppression | Load-ready list |

## Blend guidance

- Time-sensitive trigger → **Play A**, then use B or C to get the people.
- Need breadth fast → **Play B**, differentiate so you don't reach the same list as everyone else.
- Have accounts/domains but no contacts → **Play C**.

## Cross-links

- Offer / CTA: `outbound-offer`
- Email body: `cold-email-body`
- Multi-channel plan: `omnichannel-campaigns`
- Is a specific tool live for your CRM: `integrations`
- Analyze results after sending: `crm-analysis`
