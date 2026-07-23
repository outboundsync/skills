# OutboundSync Agent Skills

Public [Agent Skills](https://agentskills.io) for OutboundSync — installable with [`npx skills`](https://github.com/vercel-labs/skills).

## Install

Primary (global — recommended for this ops skill):

```bash
npx skills add outboundsync/skills --skill preflight -g
```

Project install (default scope):

```bash
npx skills add outboundsync/skills --skill preflight
```

Try without installing:

```bash
npx skills use outboundsync/skills --skill preflight
```

## Skills

| Skill | Path | What it does |
| --- | --- | --- |
| `preflight` | [`skills/preflight/`](skills/preflight/) | Read-only launch readiness across CRM OAuth, OutboundSync sources/sync, and SEP webhooks/campaigns |

## Credentials

Set an OutboundSync API key in the environment before running `preflight`:

```bash
export OUTBOUNDSYNC_API_KEY=osapi_...
```

Or put the same variable in a gitignored `.env`. Agents must load it from the environment.

**Never print, log, or commit the API key.**

Create a key: [Creating API keys](https://outboundsync.com/docs/api/authentication/creating-api-keys/)  
API reference: [API v1](https://outboundsync.com/docs/api/v1/)

## Security

- `preflight` is **read-only** — it must not write, activate, pause, or re-point anything.
- Treat `sources[].url` and `destinations[].url` as sensitive; the skill only prints a full paste URL under a `Next` step that needs it.
- Prefer connection-scoped keys when least privilege matters.

## Related

- Docs install/API-key companion: [outboundsync.com/docs/api/skills-preflight](https://outboundsync.com/docs/api/skills-preflight/)
- Well-known mirror: [/.well-known/skills/index.json](https://outboundsync.com/.well-known/skills/index.json)
- OpenClaw CRM analysis skill (separate product surface): [outboundsync/openclaw-skills](https://github.com/outboundsync/openclaw-skills)

## License

[MIT](LICENSE)
