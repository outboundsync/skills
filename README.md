# OutboundSync Agent Skills

Public [Agent Skills](https://agentskills.io) for OutboundSync — installable with [`npx skills`](https://github.com/vercel-labs/skills).

### Existing

| Skill | Path | Needs API key? | What it does |
| --- | --- | --- | --- |
| `preflight` | [`skills/preflight/`](skills/preflight/) | Yes (`OUTBOUNDSYNC_API_KEY`) | Read-only launch readiness across CRM OAuth, sources/sync, and SEP webhooks/campaigns |
| `crm-analysis` | [`skills/crm-analysis/`](skills/crm-analysis/) | No | Read-only analysis of OutboundSync engagement signals already in HubSpot or Salesforce |

### Copy & identity

| Skill | Path | Needs API key? | What it does |
| --- | --- | --- | --- |
| `outbound-offer` | [`skills/outbound-offer/`](skills/outbound-offer/) | No | Draft and audit the offer/CTA inside cold outreach |
| `cold-email-subject-lines` | [`skills/cold-email-subject-lines/`](skills/cold-email-subject-lines/) | No | Draft and audit cold email subject lines |
| `cold-email-body` | [`skills/cold-email-body/`](skills/cold-email-body/) | No | Draft and audit cold email body copy |
| `connection-requests` | [`skills/connection-requests/`](skills/connection-requests/) | No | Draft and audit professional-social connection requests |
| `email-aliases` | [`skills/email-aliases/`](skills/email-aliases/) | No | Audit and set up sending mailbox identity / aliases |

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
# Launch preflight (global recommended)
npx skills add outboundsync/skills --skill preflight -g

# CRM engagement analysis
npx skills add outboundsync/skills --skill crm-analysis

# Copy & identity
npx skills add outboundsync/skills --skill outbound-offer
npx skills add outboundsync/skills --skill cold-email-subject-lines
npx skills add outboundsync/skills --skill cold-email-body
npx skills add outboundsync/skills --skill connection-requests
npx skills add outboundsync/skills --skill email-aliases

# Deliverability (free DNS/RDAP lookups by default)
npx skills add outboundsync/skills --skill email-authentication
npx skills add outboundsync/skills --skill sending-domain-quality

# Directory (OutboundSync agencies / integrations)
npx skills add outboundsync/skills --skill agencies
npx skills add outboundsync/skills --skill integrations

# OpenClaw global via Skills CLI
npx skills add outboundsync/skills --skill crm-analysis -a openclaw -g
```

Try without installing:

```bash
npx skills use outboundsync/skills --skill preflight
npx skills use outboundsync/skills --skill crm-analysis
npx skills use outboundsync/skills --skill outbound-offer
npx skills use outboundsync/skills --skill cold-email-subject-lines
npx skills use outboundsync/skills --skill cold-email-body
npx skills use outboundsync/skills --skill connection-requests
npx skills use outboundsync/skills --skill email-aliases
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

**`preflight` only** — set before running:

```bash
export OUTBOUNDSYNC_API_KEY=osapi_...
```

Or put the same variable in a gitignored `.env`. **Never print, log, or commit the API key.**

Create a key: [Creating API keys](https://outboundsync.com/docs/api/authentication/creating-api-keys/)  
API reference: [API v1](https://outboundsync.com/docs/api/v1/)  
Preflight docs: [Use the preflight Agent Skill](https://outboundsync.com/docs/api/skills-preflight/)

`crm-analysis` and the copy / directory skills do not use an OutboundSync API key.

**`email-authentication` / `sending-domain-quality`** — free read-only public DNS / RDAP / DNSBL lookups by default. Optional paid keys (e.g. `MXTOOLBOX_API_KEY`, `GOOGLE_WEB_RISK_KEY`, `VIRUSTOTAL_API_KEY`, `WHOISXML_API_KEY`) enhance checks when present; see each skill's `compatibility:` frontmatter.

## Security

- All skills are **read-only** by default — see [SECURITY.md](SECURITY.md).
- Prefer connection-scoped API keys for `preflight` when least privilege matters.
- Treat `sources[].url` / `destinations[].url` as sensitive in `preflight` (paste only under `Next` when needed).

## Maintainers

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
