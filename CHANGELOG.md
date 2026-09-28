# Changelog

Curated, human-written notes for the OutboundSync Agent Skills pack. The pack uses Calendar Versioning with tags `YYYY.MM.DD.N` (UTC date); each skill also carries its own `metadata.version`.

- Add entries under `## Unreleased` in the PR that makes the change.
- [GitHub Releases](https://github.com/outboundsync/skills/releases) are published automatically from commit subjects on every merge to `main`.
- To fold `## Unreleased` into a dated release section, run `npm run release:apply` and commit the result.

<!-- release entries -->

## Unreleased

### Added

- **Status layout** in `CONVENTIONS.md`, generalized from `preflight`. The `##` heading is the verdict, followed by a 20-cell `█░▒` gauge, then `###` cards with a context line and mark-first bullets, then `Next`. There is one UNVERIFIED vocabulary: a failed call is never an empty result.
- **sync-monitoring** is now a health dashboard. Its gauge covers Access, Endpoints, Deliveries, Events, and CRM syncs (7-day `get_syncs_metrics`). A `## Mutations` table names every webhook write tool, and `### Proposed change` / `### Applied` cards cover the write flow.
- **api**: new Access, Plan, Prior outreach, Blocklists, and Metrics cards. `references/endpoints.md` is now the pack's single REST ↔ MCP map (all 35 MCP v0.4.0 tools), with access rules, enums, pagination, rate-limit headers, and the MCP error envelope.
- **crm-analysis**: a formal output contract with a verdict heading, a field-coverage gauge, a Field check card (the router's compact fields), and ranked results with bars relative to the top row. All nine examples are re-rendered.
- Rendered `references/examples.md` for `api`, `sync-monitoring`, `email-authentication`, and `sending-domain-quality`, plus a new UNVERIFIED example for `preflight`.
- Validator rule `endpoint-map-consistent`. The PR 1 content rules are now errors.

### Fixed

- **API/MCP drift** against the live API and MCP v0.4.0:
  - `/sources` is not paginated.
  - `/events` also needs `canUseWebhooks`, for reads too.
  - `/account/status` `destinations.status` has no `error` value.
  - Unbound destinations (`sourceIds: []`) forward nothing.
  - The "OpenAPI lags" caveat is gone; OpenAPI now matches MCP one to one.
  - Loop on `hasMore` / `nextCursor`, never on page length.
  - A non-JSON `200` means the route is not shipped.
  - `/contacts/outreach` and `/account/metrics` timeouts are UNVERIFIED.
- **Output bugs:**
  - `cold-email-body`'s reference meter showed 15 of 20 cells for 78/100 (should be 16).
  - `connection-requests` scored /100 with no meter.
  - `preflight`'s Ready example had three checks on one line.
  - `sending-domain-quality` had five marks on one glance line.
  - Five skills had no `### Shape`.
- `crm-analysis` dropped a stale caveat claiming reply subject maps to `os_last_reply_message`. It is `os_last_reply_subject`, as fixed in `2026.09.02.1`.
- Every `../../` link in a skill (the disclaimer, SECURITY, LICENSE) is now an absolute URL. The old links broke once `npx skills add` installed a single skill folder.

### Changed

- **Tooling:** replace `scripts/validate_skill_integrity.sh` (bash + Ruby/Python) with a Node validator (`npm run validate`). It reports every problem in one run, emits GitHub annotations, and is covered by fixture tests (`npm test`). The existing checks are ported unchanged. New checks: output contract, score meter, bar geometry, description style, frontmatter spec limits, exact disclaimer text and position, fence-aware links and anchors across all Markdown, links that escape a skill folder, vague tool wildcards, committed secrets, non-doc files under `skills/`, the README skill index, and version bumps against a PR base (`--base`). Content rules start as warnings (`scripts/validate/config.json`).
- **Release tooling:** `release-calver.mjs` is importable and tested. `--dry-run` and `--apply` are mutually exclusive, and the preview prints the full notes. `--apply` promotes `## Unreleased` into the new release section instead of inserting above it. `GITHUB_OUTPUT` uses a random delimiter.
- **CI:** least-privilege `permissions`, SHA-pinned actions with Dependabot, concurrency and timeouts, actionlint, PR version-bump enforcement, a separate weekly external-link check (lychee), annotated release tags, and manual `workflow_dispatch` runs.
- **Docs:** add `CONTRIBUTING.md` and `templates/SKILL.template.md` (not named `SKILL.md`, so skill installers never pick it up); the README and CONVENTIONS point at the new commands. Cut the long-running `Unreleased` section below into `2026.09.02.1`.

## [2026.09.02.1] - 2026-09-02

Rolls up everything shipped from `2026.07.23.0` through `2026.09.02.1`.

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
