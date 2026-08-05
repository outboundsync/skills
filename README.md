# OutboundSync Agent Skills

Public [Agent Skills](https://agentskills.io) for OutboundSync — installable with [`npx skills`](https://github.com/vercel-labs/skills).

The pack ships **15** skills.

### API & launch

| Skill | Path | Needs API key? | What it does |
| --- | --- | --- | --- |
| `api` | [`skills/api/`](skills/api/) | Yes (`OUTBOUNDSYNC_API_KEY`) | OutboundSync API v1 guide: auth, vocabulary, discovery, routing to specialized skills |
| `preflight` | [`skills/preflight/`](skills/preflight/) | Yes (`OUTBOUNDSYNC_API_KEY`) | Read-only launch readiness across CRM OAuth, Sources/sync, and SEP inbound wiring |
| `sync-monitoring` | [`skills/sync-monitoring/`](skills/sync-monitoring/) | Yes (`OUTBOUNDSYNC_API_KEY`) | Diagnose Sync Monitoring Webhooks/events; mutations only after explicit confirmation |
| `crm-analysis` | [`skills/crm-analysis/`](skills/crm-analysis/) | No | Read-only analysis of OutboundSync engagement signals already in HubSpot or Salesforce |

### Targeting & lists

| Skill | Path | Needs API key? | What it does |
| --- | --- | --- | --- |
| `list-building` | [`skills/list-building/`](skills/list-building/) | No | Plan or audit list building — signal, database, and waterfall-enrichment sourcing motions |

### Copy & identity

| Skill | Path | Needs API key? | What it does |
| --- | --- | --- | --- |
| `outbound-offer` | [`skills/outbound-offer/`](skills/outbound-offer/) | No | Draft and audit the offer/CTA inside cold outreach |
| `cold-email-subject-lines` | [`skills/cold-email-subject-lines/`](skills/cold-email-subject-lines/) | No | Draft and audit cold email subject lines |
| `cold-email-body` | [`skills/cold-email-body/`](skills/cold-email-body/) | No | Draft and audit cold email body copy |
| `connection-requests` | [`skills/connection-requests/`](skills/connection-requests/) | No | Draft and audit professional-social connection requests |
| `email-aliases` | [`skills/email-aliases/`](skills/email-aliases/) | No | Audit and set up sending mailbox identity / aliases |
| `omnichannel-campaigns` | [`skills/omnichannel-campaigns/`](skills/omnichannel-campaigns/) | No | Structure email + B2B social outbound sequences |

### Deliverability

| Skill | Path | Needs API key? | What it does |
| --- | --- | --- | --- |
| `email-authentication` | [`skills/email-authentication/`](skills/email-authentication/) | Optional (free by default; paid API keys enhance) | Audit SPF / DKIM / DMARC (+ MX, PTR, BIMI, MTA-STS, TLS-RPT) |
| `sending-domain-quality` | [`skills/sending-domain-quality/`](skills/sending-domain-quality/) | Optional (free by default; paid API keys enhance) | Score sending domain name / TLD / age / reputation |

### Directory

| Skill | Path | Needs API key? | What it does |
| --- | --- | --- | --- |
| `agencies` | [`skills/agencies/`](skills/agencies/) | No | Help choose an outbound/CRM agency from OutboundSync's directory |
| `integrations` | [`skills/integrations/`](skills/integrations/) | No | Help choose an outbound integration from OutboundSync's directory |

`crm-analysis` domain files (router, field dictionaries, examples) live under `skills/crm-analysis/references/` — shared skill knowledge for any harness, not OpenClaw-only. OpenClaw-specific pieces are install/distribution (ClawHub marketplace), not a second file tree.

## Install (primary — all supported harnesses)

```bash
# API & launch
npx skills add outboundsync/skills --skill api -g
npx skills add outboundsync/skills --skill preflight -g
npx skills add outboundsync/skills --skill sync-monitoring -g
npx skills add outboundsync/skills --skill crm-analysis

# Targeting & lists
npx skills add outboundsync/skills --skill list-building

# Copy & identity
npx skills add outboundsync/skills --skill outbound-offer
npx skills add outboundsync/skills --skill cold-email-subject-lines
npx skills add outboundsync/skills --skill cold-email-body
npx skills add outboundsync/skills --skill connection-requests
npx skills add outboundsync/skills --skill email-aliases
npx skills add outboundsync/skills --skill omnichannel-campaigns

# Deliverability (free DNS/RDAP lookups by default)
npx skills add outboundsync/skills --skill email-authentication
npx skills add outboundsync/skills --skill sending-domain-quality

# Directory (OutboundSync agencies / integrations)
npx skills add outboundsync/skills --skill agencies
npx skills add outboundsync/skills --skill integrations

# OpenClaw global via Skills CLI
npx skills add outboundsync/skills --skill crm-analysis -a openclaw -g
```

Try without installing — every skill runs this way; only the API & launch group needs an OutboundSync account:

```bash
# API & launch (need OUTBOUNDSYNC_API_KEY)
npx skills use outboundsync/skills --skill api
npx skills use outboundsync/skills --skill preflight
npx skills use outboundsync/skills --skill sync-monitoring

# Account-free — no OutboundSync API key required
npx skills use outboundsync/skills --skill crm-analysis
npx skills use outboundsync/skills --skill list-building
npx skills use outboundsync/skills --skill outbound-offer
npx skills use outboundsync/skills --skill cold-email-subject-lines
npx skills use outboundsync/skills --skill cold-email-body
npx skills use outboundsync/skills --skill connection-requests
npx skills use outboundsync/skills --skill email-aliases
npx skills use outboundsync/skills --skill omnichannel-campaigns
npx skills use outboundsync/skills --skill email-authentication
npx skills use outboundsync/skills --skill sending-domain-quality
npx skills use outboundsync/skills --skill agencies
npx skills use outboundsync/skills --skill integrations
```

## OpenClaw marketplace (optional)

ClawHub is discovery/update for OpenClaw users. **Not required** — `npx skills … -a openclaw -g` already installs into OpenClaw.

- Publisher: `@osiharris` (ClawHub individual accounts only)
- Slug: `crm-analysis`
- Canonical source: this org repo (`outboundsync/skills`)

```bash
openclaw skills install @osiharris/crm-analysis
```

## Credentials

**`preflight`, `api`, and `sync-monitoring`** — set before running:

```bash
export OUTBOUNDSYNC_API_KEY=osapi_...
```

Or put the same variable in a gitignored `.env`. **Never print, log, or commit the API key.**

- Prefer a **connection-scoped** key for `preflight` when least privilege matters.
- Sync Monitoring `/webhooks*` needs an **account-scoped** key; mutations also need the **`write`** scope and explicit user confirmation (see [SECURITY.md](SECURITY.md)).

Create a key: [Creating API keys](https://outboundsync.com/docs/api/authentication/creating-api-keys/)  
API reference: [API v1](https://outboundsync.com/docs/api/v1/)  
Skills docs: [Agent Skills](https://outboundsync.com/docs/skills/)

`crm-analysis`, copy, omnichannel, and directory skills do not use an OutboundSync API key.

**`email-authentication` / `sending-domain-quality`** — free read-only public DNS / RDAP / DNSBL lookups by default. Optional paid keys (e.g. `MXTOOLBOX_API_KEY`, `GOOGLE_WEB_RISK_KEY`, `VIRUSTOTAL_API_KEY`, `WHOISXML_API_KEY`) enhance checks when present; see each skill's `compatibility:` frontmatter.

## Security

- Skills are **read-only by default** — see [SECURITY.md](SECURITY.md).
- `sync-monitoring` may mutate Sync Monitoring webhooks **only after explicit confirmation**.
- Treat `sources[].url` / `destinations[].url` as sensitive (paste only under `Next` when needed).
- Never re-echo webhook signing secrets after create/rotate.

## Disclaimer

These skills reflect OutboundSync best practices, shared freely and without warranty of outcomes. Guidance may change; results vary. See [DISCLAIMER.md](DISCLAIMER.md).

## Maintainers

New skills follow [CONVENTIONS.md](CONVENTIONS.md) — output styling, the required score-meter, marks legend, and disclaimer note. Validate before pushing:

```bash
./scripts/validate_skill_integrity.sh
```

## Releases & Changelog

Releases are created automatically after Validate skill integrity passes on `main` via `.github/workflows/release-calver.yml`.

- Versioning format: `YYYY.MM.DD.N` (CalVer).
- Changelog: [GitHub Releases page](https://github.com/outboundsync/skills/releases).

To preview the next release locally:

```bash
node scripts/release-calver.mjs --dry-run
```

## Related

- Well-known mirror: https://outboundsync.com/.well-known/skills/index.json
- ClawHub listing: published by `@osiharris` as `crm-analysis`; maintained here

## License

[MIT](LICENSE)
