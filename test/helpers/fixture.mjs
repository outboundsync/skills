// Builds a minimal, fully valid skills repo in a temp dir. Each test applies
// one targeted change and asserts which rule ids fire.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export const DISCLAIMER_LINE =
  '**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](https://github.com/outboundsync/skills/blob/main/DISCLAIMER.md).';

export function skillMd({
  name = 'demo',
  description = 'Draft and audit demo copy. Use when the user asks to "write a demo" or "audit this demo". No OutboundSync API key.',
  extraFrontmatter = '',
  version = '"1.0.0"',
  body = defaultBody(),
} = {}) {
  return `---
name: ${name}
description: >-
  ${description}
license: MIT
${extraFrontmatter}metadata:
  author: outboundsync
  version: ${version}
---

# ${name}

${DISCLAIMER_LINE}

${body}`;
}

export function defaultBody() {
  return `## Workflow

1. Read [the rubric](references/rubric.md).

## Output contract

Render only this shape; no prose outside it.

### Shape

\`\`\`\`markdown
## Demo <Audit | Draft>

\`\`\`text
Score  ████████████████░░░░  78/100 · solid
\`\`\`

- <✓/✗/· finding>
\`\`\`\`
`;
}

export function readmeFor(names) {
  return `# Skills

The pack ships **${names.length}** skills.

| Skill | Path | Needs API key? | What it does |
| --- | --- | --- | --- |
${names.map((n) => `| \`${n}\` | [\`skills/${n}/\`](skills/${n}/) | No | Demo |`).join('\n')}

\`\`\`bash
${names.map((n) => `npx skills add outboundsync/skills --skill ${n}`).join('\n')}
${names.map((n) => `npx skills use outboundsync/skills --skill ${n}`).join('\n')}
\`\`\`
`;
}

/**
 * @param {Record<string,string|null>} overrides repo-relative path → content (null deletes)
 */
export function makeRepo(overrides = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'skills-fixture-'));
  const files = {
    'README.md': readmeFor(['demo']),
    'DISCLAIMER.md': '# Disclaimer\n',
    'SECURITY.md': '# Security\n\n## Write-on-confirm protocol\n',
    'skills/demo/SKILL.md': skillMd(),
    'skills/demo/references/rubric.md': '# Rubric\n\n## Levels\n',
    ...overrides,
  };
  for (const [rel, content] of Object.entries(files)) {
    if (content === null) continue;
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}
