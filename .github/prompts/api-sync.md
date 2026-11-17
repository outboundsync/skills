# Update the OutboundSync skills after an API change

You run inside the `API sync` workflow. The OutboundSync API's public OpenAPI spec changed (or this repo has no snapshot of it yet). Your job is to bring the skills that call the API in line with the new spec. A later step writes the new snapshot, runs the repo checks, commits the result and opens a pull request that a human reviews and merges.

## What changed

The workflow message gives you the mode, the paths, and the operations that were added or removed.

- **New spec:** the live spec, canonicalised with `jq -S .`, at the path given as "Live spec" (also in `$API_SYNC_SPEC`).
- **Old spec:** `api-sync/openapi.snapshot.json`, or "none" in **bootstrap** mode.
- **Update mode:** compare the two, for example `jq '.paths | keys' <file>`, `jq '.paths["/api/v1/syncs"]' <file>` or `jq '.components.schemas.<Name>' <file>` on each. Operations can also change their parameters, response fields, enums, security or descriptions without being added or removed. Update only what the change affects.
- **Bootstrap mode:** there is no old spec. Audit every skill that calls the API (see below) against the whole live spec and fix whatever disagrees with it.

## The surface you keep in sync

- `skills/api/references/endpoints.md` is the pack's canonical REST ↔ MCP map. Its route rows look like ``| `GET /syncs/:id` | `get_sync` | R | notes |``. It must list **every** operation in the spec except the discovery operations `GET /health/live`, `GET /health/ready`, `GET /api/v1/openapi.json` and `GET /api/v1/openapi.yaml`, and nothing else.
  - Paths drop the `/api/v1` prefix and write `{param}` as `:param` (`/api/v1/syncs/{id}/retry` → `POST /syncs/:id/retry`).
  - The MCP tool is `snake_case(operationId)` (`getSetupStatus` → `get_setup_status`). Three grandfathered names stay exactly as they are: `getRequestMetrics` → `get_requests_metrics`, `getSyncMetrics` → `get_syncs_metrics`, `listDestinationReplyRelays` → `list_reply_relays`.
  - Access: `R` for reads; `W` for any non-GET operation (needs the `write` scope). Add `· A` or `· H` only when the spec (security, description or `403` responses) says the route needs an account-scoped key and platform webhooks, or platform webhooks alone, like the existing `/webhooks*` and `/events` rows. Keep the notes column short and factual, from the spec.
  - Keep the rest of the file accurate too: the header, calling conventions, error rules and enums. Don't state an MCP server version; the spec doesn't give one.
- **Trimmed copies:** `skills/preflight/references/endpoints.md`, `skills/sync-monitoring/references/endpoints.md` and the `## Mutations` table in `skills/sync-monitoring/SKILL.md` repeat rows from the canonical map. Every row they keep must match it exactly (path, tool and, in `endpoints.md` files, access). Add a row to a copy only when that skill uses the operation; remove rows for operations that no longer exist.
- **Skills that call the API:** `api`, `preflight` and `sync-monitoring` (`SKILL.md` and `references/`). Update workflows, field names, enums, filters and output contracts that the change makes wrong. A new write operation is never called by a read-only skill; list it in the canonical map with `W` and "Not this skill" like the existing write rows, unless a skill already owns that kind of write.
- `skills/*/references/examples.md`: change only when an output shape changed. Use illustrative data (`example.com`), never real customer data.
- `grep -rn` other skills for a removed or renamed endpoint, tool or field, and fix those mentions.

## Versions and changelog

- Bump `metadata.version` in the frontmatter of **every** skill whose folder you change: minor for new behavior or output changes, patch for fixes and wording.
- Add one line per change under `## Unreleased` in `CHANGELOG.md`, in the style of the existing entries (`- **api** (1.6.0): …`). Edit nothing else in that file.

## Do not edit

Anything outside `skills/` and `CHANGELOG.md`: not `api-sync/` (the workflow writes the snapshot), `.github/`, `scripts/`, `test/`, `templates/`, `README.md`, `package.json` or `package-lock.json`. If something there also looks out of date (for example a skill count or tool list in `README.md`), don't change it. Mention it in your final message instead.

## Rules

- **The spec can be wrong.** Never delete a specific fact from the docs (a number, limit, threshold, status code, version or retry schedule) just because the spec does not mention it. When the docs and the spec disagree on a fact that the spec diff did not change (in bootstrap mode, every fact), keep the docs as they are and list the conflict in your summary under `Spec conflicts to check:` (what the docs say, what the spec says, and where). Change such a fact only when the snapshot diff itself changed it.
- Read `CONTRIBUTING.md`, `CONVENTIONS.md` and `SECURITY.md` first and follow them. Every write-capable skill keeps its `## Mutations` section and the write-on-confirm protocol.
- Describe only what the spec says. Never invent endpoints, fields, enums, MCP tools, limits or behavior. If the spec is ambiguous, leave the text as it is and say so in your summary.
- If the change only touches wording that doesn't change what a skill does or tells the user, change nothing.
- Don't commit, push, create branches or open pull requests.
- When you're done, run `npm run validate -- --base origin/main` and `npm test`, and fix anything they report in the files you're allowed to edit. `API_SYNC_SPEC` is set, so the `endpoint-map-openapi` rule checks the map against the live spec.
- End your last message with a line that starts `Summary:`, followed by a short plain-text summary: which files and sections you changed and why, the version bumps, any `Spec conflicts to check:`, and anything a human should check. The workflow puts it in the pull request.
