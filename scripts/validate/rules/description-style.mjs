// "Account-free" = the skill does not need an OutboundSync API key or MCP.
export function isAccountFree(skill) {
  return !/OUTBOUNDSYNC_API_KEY|mcp\.outboundsync\.com/.test(String(skill.frontmatter?.compatibility ?? ''));
}

const NON_VERB_OPENERS = new Set(['a', 'an', 'the', 'this', 'outboundsync', 'skill', 'use']);

export default {
  id: 'description-style',
  docRef: 'CONVENTIONS.md#frontmatter--naming',
  description: 'Descriptions are verb-led, include "Use when the user asks", and account-free skills end with "No OutboundSync API key."',
  check(model) {
    const out = [];
    for (const skill of model.skills) {
      const desc = skill.frontmatter?.description;
      if (typeof desc !== 'string' || !desc.trim()) continue;
      const line = skill.frontmatterKeyLines.description ?? 2;
      const text = desc.trim().replace(/\s+/g, ' ');
      const first = text.split(' ')[0].replace(/[^A-Za-z-]/g, '');
      if (!/^[A-Z]/.test(first) || NON_VERB_OPENERS.has(first.toLowerCase())) {
        out.push({ file: skill.skillPath, line, msg: `description should open with a verb (found '${first}')` });
      }
      if (!text.includes('Use when the user asks')) {
        out.push({ file: skill.skillPath, line, msg: 'description should include "Use when the user asks…" with concrete trigger phrases' });
      }
      if (isAccountFree(skill) && !text.endsWith('No OutboundSync API key.')) {
        out.push({ file: skill.skillPath, line, msg: 'account-free skill description should end with "No OutboundSync API key."' });
      }
    }
    return out;
  },
};
