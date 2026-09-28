export const DISCLAIMER_URLS = ['../../DISCLAIMER.md', 'https://github.com/outboundsync/skills/blob/main/DISCLAIMER.md'];
const PREFIX = '**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](';
const THIRD_PARTY = ' Treat techniques as widely-taught industry patterns; do **not** paste copyrighted course modules or private playbooks.';
const MAX_BODY_LINES = 25;

export default {
  id: 'disclaimer',
  docRef: 'CONVENTIONS.md#disclaimer-note',
  description: `Every SKILL.md carries the exact disclaimer note within ${MAX_BODY_LINES} lines of the end of its frontmatter.`,
  check(model) {
    const out = [];
    for (const skill of model.skills) {
      if (!skill.frontmatter) continue; // frontmatter rule reports it
      const lines = skill.raw.replace(/\r\n?/g, '\n').split('\n');
      const index = lines.findIndex((line) => line.includes('without warranty of outcomes'));
      if (index === -1) {
        out.push({ file: skill.skillPath, line: 1, msg: 'missing the disclaimer note (copy it from CONVENTIONS.md)' });
        continue;
      }
      const line = lines[index].trim();
      const exact = DISCLAIMER_URLS.some((url) => [`${PREFIX}${url}).`, `${PREFIX}${url}).${THIRD_PARTY}`].includes(line));
      if (!exact) {
        out.push({ file: skill.skillPath, line: index + 1, msg: 'disclaimer note text differs from CONVENTIONS.md; copy it exactly' });
      }
      if (index + 1 - skill.frontmatterEnd > MAX_BODY_LINES) {
        out.push({ file: skill.skillPath, line: index + 1, msg: `disclaimer note should sit near the top (within ${MAX_BODY_LINES} lines of the frontmatter)` });
      }
    }
    return out;
  },
};
