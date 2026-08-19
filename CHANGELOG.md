# Changelog

All notable changes to this project are documented in this file.

This project uses Calendar Versioning with tags in the format `YYYY.MM.DD.N`.

<!-- release entries -->

## Unreleased

### Features

- Add `GET /contacts/outreach` prior-outreach lookup to the `api` skill (query rules, OR-union, DNC vs reserved blocklists, optional keep/skip only when the user gives a cadence).
- Catch up the `api` skill GET observability map: destination catalog, account metrics, requests/syncs/deliveries (write retry/replay stay listed as not this skill).
- Add `api` Agent Skill — OutboundSync API v1 umbrella (auth, vocabulary, discovery, routing).
- Add `sync-monitoring` Agent Skill — Sync Monitoring Webhooks/events diagnose; mutations only after explicit confirmation.
- Add `omnichannel-campaigns` Agent Skill — email + B2B social sequence planning.
- Add `list-building` Agent Skill — plan or audit prospect-list sourcing across signal, database, and waterfall-enrichment motions (account-free).
- Expand `crm-analysis` with Attio and Close support — note/activity-based, exploratory guidance; HubSpot/Salesforce strict routing unchanged.
- Update `preflight` for Sources vs Sync Monitoring disambiguation and reply-relays advisory.

### Changed

- Restore the full "Try without installing" list in the README so account-free skills stay discoverable without an OutboundSync account.
- Standardize the disclaimer note across skills; align the `api` description (verb-led) and output-contract wording with pack conventions.
- Remove named third-party practitioners/agencies from `omnichannel-campaigns` in favor of generic industry-pattern framing.
- Replace "LinkedIn" with generic "B2B social networking" terms in `omnichannel-campaigns` (docs surfaces use "social").
- Add a shared score-meter (monospace `█`/`░` bars) to the scorecard skills — `cold-email-body`, `outbound-offer`, `cold-email-subject-lines`, `omnichannel-campaigns`, `list-building` — matching the preflight gauge aesthetic.
- Document skill output conventions in `CONVENTIONS.md` (marks legend, the required score-meter for scoring skills, disclaimer note, frontmatter) so future skills adopt them by default.

### Security

- Add a reusable write-on-confirm protocol to `SECURITY.md` that any write-capable skill must follow; `sync-monitoring` references it.
- Document multi-skill `OUTBOUNDSYNC_API_KEY` usage and the write-on-confirm protocol for `sync-monitoring`.
