# Contributing

This repo is the source of truth for the OutboundSync Agent Skills. Each skill is a folder `skills/<name>/` holding a `SKILL.md` and optional `references/`. The skills ship only Markdown and YAML; `scripts/`, `test/`, and `package.json` are maintainer tooling and are never installed.

## Prerequisites

- Node.js 22 or newer
- `npm ci` once after cloning

## Check your change

```bash
npm run validate                          # every rule, all problems in one run
npm run validate -- --base origin/main    # also require version bumps (what CI runs on PRs)
npm test                                  # validator + release tooling tests
```

Run `npm run validate -- --list` to see every rule with its severity. Rules and their rationale live in `scripts/validate/rules/`, one file each; severities are in `scripts/validate/config.json`. A rule at `warn` is new and is being rolled out; it becomes an error once every skill complies.

## Add a skill

1. Copy [`templates/SKILL.template.md`](templates/SKILL.template.md) to `skills/<name>/SKILL.md`. The folder name and the `name:` field must match (lowercase kebab-case).
2. Write the description: open with a verb, include "Use when the user asks…" with concrete trigger phrases, and end account-free skills with "No OutboundSync API key."
3. Follow [CONVENTIONS.md](CONVENTIONS.md) for output: an `## Output contract` with a `### Shape`, the marks legend, the score meter for anything that scores, and the status layout for readiness or health checks.
4. Keep every link inside the skill folder or absolute. `npx skills add` installs one folder, so `../../` links break.
5. If the skill writes to OutboundSync or a CRM, add a `## Mutations` section naming each call and MCP tool, and follow the [write-on-confirm protocol](SECURITY.md#write-on-confirm-protocol).
6. Add the skill to every README list: the count, its category table, the install commands, and the "try without installing" commands.
7. Add a line under `## Unreleased` in [CHANGELOG.md](CHANGELOG.md).

## Versioning

- **Skills:** bump `metadata.version` in a skill's frontmatter whenever any file in its folder changes. Minor for new behavior or output changes, patch for fixes and wording. CI enforces a bump on PRs.
- **Pack:** releases are CalVer tags `YYYY.MM.DD.N`, created automatically after Validate passes on `main`. Preview the next release with `npm run release:preview`.
- **Distribution:** `npx skills add outboundsync/skills` installs from `main`, so a merge is live for new installs immediately. There is no npm package; don't add one.

## Changelog promotion

Automatic. On each release, `release-calver.yml` runs `release-calver.mjs --apply`, which moves the curated `## Unreleased` lines under `## [YYYY.MM.DD.N] - YYYY-MM-DD`, then publishes the tag and GitHub release. The CHANGELOG change lands on `main` through a short-lived PR (`chore(release): CHANGELOG for <tag>`, `scripts/release-changelog-pr.sh`). `main` has no required checks, so the workflow squash-merges that PR with `GITHUB_TOKEN` as soon as GitHub reports it mergeable. That merge starts no workflow, and its subject never counts toward a release, so it can't loop. If `main` ever requires checks, add the repository secret `RELEASE_PR_TOKEN` (a fine-grained token limited to this repo with Contents and Pull requests read/write) so the PR can run CI before it merges. Without it, the PR stays open for a maintainer. An empty `## Unreleased` changes nothing. Contributors only add lines under `## Unreleased`; do not hand-edit release sections. If the bot PR fails (for example, it conflicts with a newer commit on `main`), move that tag's lines by hand in a normal PR.

## API sync

The api skill's [`references/endpoints.md`](skills/api/references/endpoints.md) must match the OutboundSync API's public OpenAPI spec. `api-sync/openapi.snapshot.json` is that spec as of the last sync. The `API sync` workflow (`.github/workflows/api-sync.yml`) checks the live spec every 6 hours. When it changes, a Cursor CLI agent (Grok) updates the skills ([`.github/prompts/api-sync.md`](.github/prompts/api-sync.md)), bumps their versions and adds `## Unreleased` lines. The workflow then writes the new snapshot and opens a `chore(api): …` PR on branch `chore/api-sync`. The agent and the checks run in a job with a read-only token; a second job with the write token runs no repo code, it only applies their patch (allowed paths only) and opens the PR. A human reviews and merges it; close and reopen the PR first so Validate runs on it.

The validator rule `endpoint-map-openapi` fails when the map is missing an operation from the snapshot, lists one the snapshot doesn't have, or names a tool that breaks the rule `snake_case(operationId)` (three grandfathered aliases are allowed). Health and OpenAPI discovery routes are excluded. `write-tools-named` takes its write tools (every non-GET operation) from the snapshot. Until the first sync PR adds the snapshot, `endpoint-map-openapi` only warns. Don't edit the snapshot by hand; run the workflow from the Actions tab instead.

## After merging

Nothing to do by hand. A merge to `main` is live right away for `npx skills add outboundsync/skills`. Within 6 hours, the `Skills mirror sync` workflow in `outboundsync/website` copies the pack into `https://outboundsync.com/.well-known/skills/`, has a Cursor CLI agent (Grok) update the matching docs (`src/content/docs/docs/skills/<name>.mdx`, the catalog and the sample dialogs), and opens a `chore(skills): sync mirror and docs` PR. Review that PR and merge it. To sync sooner, run that workflow from the website repo's Actions tab.
