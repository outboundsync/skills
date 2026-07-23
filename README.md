# OutboundSync Agent Skills

Public [Agent Skills](https://agentskills.io) for OutboundSync — installable with [`npx skills`](https://github.com/vercel-labs/skills).

| Skill | Path | Needs API key? | What it does |
| --- | --- | --- | --- |
| `preflight` | [`skills/preflight/`](skills/preflight/) | Yes (`OUTBOUNDSYNC_API_KEY`) | Read-only launch readiness across CRM OAuth, sources/sync, and SEP webhooks/campaigns |
| `crm-analysis` | [`skills/crm-analysis/`](skills/crm-analysis/) | No | Read-only analysis of OutboundSync engagement signals already in HubSpot or Salesforce |

`crm-analysis` domain files (router, field dictionaries, examples) live under `skills/crm-analysis/references/` — shared skill knowledge for any harness, not OpenClaw-only. OpenClaw-specific pieces are install/distribution (ClawHub marketplace), not a second file tree.

## Install (primary — all supported harnesses)

```bash
# Launch preflight (global recommended)
npx skills add outboundsync/skills --skill preflight -g

# CRM engagement analysis
npx skills add outboundsync/skills --skill crm-analysis

# OpenClaw global via Skills CLI
npx skills add outboundsync/skills --skill crm-analysis -a openclaw -g
```

Try without installing:

```bash
npx skills use outboundsync/skills --skill preflight
npx skills use outboundsync/skills --skill crm-analysis
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

`crm-analysis` does not use an OutboundSync API key (local CRM field analysis only).

## Security

- Both skills are **read-only** by default — see [SECURITY.md](SECURITY.md).
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
