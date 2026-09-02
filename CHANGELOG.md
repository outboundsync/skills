# Changelog

All notable changes to this project are documented in this file.

This project uses Calendar Versioning with tags in the format `YYYY.MM.DD.N`.

<!-- release entries -->

## Unreleased

### Features

- **preflight / api / sync-monitoring:** prefer OutboundSync MCP (`https://mcp.outboundsync.com/mcp`) when connected; REST + `OUTBOUNDSYNC_API_KEY` remains the fallback. Preflight output contract unchanged.
- Document `GET /blocklists` on the `api` skill (CRM→SEP sync configs). Pause/resync exist as `write` and are listed as not this skill (same as retry/replay).
- Add `GET /contacts/outreach` prior-outreach lookup to the `api` skill (query rules, OR-union, DNC vs reserved blocklists, optional keep/skip only when the user gives a cadence).
- Catch up the `api` skill GET observability map: destination catalog, account metrics, requests/syncs/deliveries (write retry/replay stay listed as not this skill).
- Add `api` Agent Skill — OutboundSync API v1 umbrella (auth, vocabulary, discovery, routing).
- Add `sync-monitoring` Agent Skill — Sync Monitoring Webhooks/events diagnose; mutations only after explicit confirmation.
- Add `omnichannel-campaigns` Agent Skill — email + B2B social sequence planning.
- Add `list-building` Agent Skill — plan or audit prospect-list sourcing across signal, database, and waterfall-enrichment motions (account-free).
- Expand `crm-analysis` with Attio and Close support — note/activity-based, exploratory guidance; HubSpot/Salesforce strict routing unchanged.
- Update `preflight` for Sources vs Sync Monitoring disambiguation and reply-relays advisory.

### Fixed

- **crm-analysis (Salesforce):** remove the embedded space from every Salesforce API name (`OSLast AppUrl__c` → `OSLastAppUrl__c`) across the field dictionary, router contract, question router, and examples — spaced names are invalid, so every Salesforce query built from them would fail.
- **crm-analysis (Salesforce):** regenerate `salesforce_fields.md` from the canonical field set (59 fields across common/email/social) and correct the false "email-only" note — social, sequence-step, and campaign fields are synced to Salesforce.
- **crm-analysis (HubSpot):** map "Last email reply subject" to `os_last_reply_subject` (previously duplicated to `os_last_reply_message`).
- **crm-analysis (Attio):** document the optional structured `outboundsync` engagement object (queryable; `createEngagementEvents`-gated) alongside the default Notes timeline; the prior "no queryable fields" note was absolute.
- **README:** note Attio & Close (beta) in the `crm-analysis` row.
- **sending-domain-quality:** resolve the parked/404 verdict contradiction (now `·` advisory across all three references) and rewrite the DNSBL section so public/open-resolver error codes (`127.255.255.x`) are not misread as blocklist listings.
- **validate_skill_integrity.sh:** force UTF-8 on the Ruby/Python file reads so the documented pre-push command no longer false-fails under a non-UTF-8 (e.g. macOS default) locale.
- **Disclaimer note:** add it to the remaining skills — all 15 now carry it.

### Changed

- Restore the full "Try without installing" list in the README so account-free skills stay discoverable without an OutboundSync account.
- Standardize the disclaimer note across skills; align the `api` description (verb-led) and output-contract wording with pack conventions.
- Remove named third-party practitioners/agencies from `omnichannel-campaigns` in favor of generic industry-pattern framing.
- Replace "LinkedIn" with generic "B2B social networking" terms in `omnichannel-campaigns` (docs surfaces use "social").
- Add a shared score-meter (monospace `█`/`░` bars) to the scorecard skills — `cold-email-body`, `outbound-offer`, `cold-email-subject-lines`, `omnichannel-campaigns`, `list-building` — matching the preflight gauge aesthetic.
- Document skill output conventions in `CONVENTIONS.md` (marks legend, the required score-meter for scoring skills, disclaimer note, frontmatter) so future skills adopt them by default.
- Soften unverified / false-precision performance figures in the copy skills (`cold-email-body`, `cold-email-subject-lines`, `outbound-offer`, `connection-requests`, `sending-domain-quality`) to qualitative/ranges behind the existing directional hedge.
- Add the `No OutboundSync API key.` suffix to every account-free skill's description (pack convention).
- Make `cold-email-body` the sole entry point for complete-email requests; `outbound-offer` and `cold-email-subject-lines` defer to it (removes the three-way trigger overlap).
- `email-authentication`: add a scoped note on the 2024 Google/Yahoo bulk-sender rules (DMARC, one-click List-Unsubscribe / RFC 8058, 0.3% complaint ceiling).
- `sending-domain-quality`: add per-mailbox send-volume and warmup-ramp guidance.
- `api`: document the nested `GET /sources/:id/requests` and `GET /sources/:id/syncs` routes.
- Extend `validate_skill_integrity.sh` with guards: no whitespace in CRM field tokens, disclaimer-note presence on every skill, and SKILL.md relative-link resolution.
- Add `.gitignore`; align the CI checkout pin (`validate.yml` → `actions/checkout@v7`) with the release workflow.
- Bump per-skill versions for all changed skills.

### Security

- Add a reusable write-on-confirm protocol to `SECURITY.md` that any write-capable skill must follow; `sync-monitoring` references it.
- Document multi-skill `OUTBOUNDSYNC_API_KEY` usage and the write-on-confirm protocol for `sync-monitoring`.
