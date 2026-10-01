// Paths and names from earlier layouts of this pack that must not reappear.
const STALE = /outboundsync_signals|outboundsync-signals|docs\/hubspot_fields\.md|docs\/salesforce_fields\.md|docs\/prompt_library\.md|SKILL-blue\.md|SKILL-red\.md|openclaw-skills|outboundsync-analysis\//;

// Admin-app click paths retired by the Platform access split (outboundsync#889, OS-1127).
// OutboundSync keys live under Platform access → API keys, Sync Monitoring under
// Platform access → Webhooks, and sequencer secrets under Connected accounts → External API keys.
const STALE_ADMIN_PATHS = /Connected [Aa]ccounts\s*(?:→|->|>)\s*API [Kk]eys|Settings\s*(?:→|->|>)\s*API [Kk]eys|Dashboard\s*(?:→|->|>)\s*Webhooks|Connected [Aa]ccounts\s*(?:→|->|>)\s*Webhooks|Tool credentials|dashboard\/tool-credentials/;

export default {
  id: 'stale-paths',
  docRef: 'CONTRIBUTING.md',
  description: 'No references to retired paths or package names from earlier layouts of the pack.',
  check(model) {
    const out = [];
    const files = [...model.docs.filter((f) => f !== 'CHANGELOG.md'), ...model.skills.flatMap((s) => s.files.filter((f) => /\.(md|ya?ml)$/.test(f)))];
    for (const file of files) {
      model.text(file).split('\n').forEach((line, index) => {
        const match = line.match(STALE);
        if (match) out.push({ file, line: index + 1, msg: `stale reference '${match[0]}'` });
        const adminPath = line.match(STALE_ADMIN_PATHS);
        if (adminPath) out.push({ file, line: index + 1, msg: `retired admin click path '${adminPath[0]}'; use Platform access → API keys / Webhooks or Connected accounts → External API keys` });
      });
    }
    return out;
  },
};
