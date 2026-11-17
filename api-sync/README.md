# API sync

`openapi.snapshot.json` is the OutboundSync API's public OpenAPI spec (`https://app.outboundsync.com/api/v1/openapi.json`) as of the last merged sync, canonicalised with `jq -S .`. Don't edit it by hand.

The `API sync` workflow (`.github/workflows/api-sync.yml`) fetches the live spec every 6 hours. When it differs from the snapshot, a Cursor CLI agent updates the skills (`.github/prompts/api-sync.md`), the workflow writes the new snapshot, and a `chore(api): sync skills with OutboundSync API OpenAPI (<hash>)` PR opens on branch `chore/api-sync`. A human reviews and merges it.

The validator rule `endpoint-map-openapi` checks `skills/api/references/endpoints.md` against the snapshot on every `npm run validate`. Until the first sync PR adds the snapshot, the rule only warns.
