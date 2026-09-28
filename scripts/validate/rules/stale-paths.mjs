// Paths and names from earlier layouts of this pack that must not reappear.
const STALE = /outboundsync_signals|outboundsync-signals|docs\/hubspot_fields\.md|docs\/salesforce_fields\.md|docs\/prompt_library\.md|SKILL-blue\.md|SKILL-red\.md|openclaw-skills|outboundsync-analysis\//;

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
      });
    }
    return out;
  },
};
