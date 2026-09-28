# Examples

These examples show the rendered output contract (see `## Output contract` in `SKILL.md`):
1. choose mode,
2. map the question to a strict intent or exploratory path,
3. run the field check (the router contract's `preflight_schema`),
4. render the verdict heading, field gauge, and Field check card,
5. run analysis constrained by the verdict into Results.

Illustrative data only; the layout is the contract, not the values.

Files:
- `01_top_campaigns_by_replies_30d.md` (strict SUPPORTED)
- `02_high_opens_low_replies.md` (strict SUPPORTED)
- `03_fastest_replies_after_first_send_partial.md` (strict PARTIAL)
- `04_follow_up_prioritization_partial.md` (strict PARTIAL)
- `05_platform_engagement_attribution_unsupported.md` (strict UNSUPPORTED)
- `06_deliverability_unsubscribes_bounces_partial.md` (strict PARTIAL)
- `07_top_campaigns_heyreach_social_only_partial.md` (strict PARTIAL + exploratory handoff)
- `08_heyreach_social_summary_experimental_limited.md` (exploratory EXPERIMENTAL_LIMITED)
- `09_no_matching_intent_strict_with_handoff.md` (strict UNSUPPORTED + exploratory handoff)
