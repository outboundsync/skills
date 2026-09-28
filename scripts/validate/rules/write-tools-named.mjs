import { sectionText } from '../markdown.mjs';

// OutboundSync MCP write tools (v0.4.0). Keep in sync with the api skill's endpoint map.
export const MCP_WRITE_TOOLS = [
  'retry_sync', 'replay_destination_delivery', 'pause_blocklist', 'resync_blocklist',
  'create_webhook', 'update_webhook', 'delete_webhook', 'rotate_webhook_secret', 'test_webhook', 'replay_webhook_delivery',
];
const VAGUE = /matching write tools|matching `?get_\*`? *\/ *`?list_\*`?|matching `?(?:get|list)_\*`? tools/i;

export default {
  id: 'write-tools-named',
  docRef: 'SECURITY.md#write-on-confirm-protocol',
  description: 'Tools and mutations are named exactly — no "matching write tools". A write-capable skill has a `## Mutations` section naming each MCP write tool and REST call, and follows the write-on-confirm protocol.',
  check(model) {
    const out = [];
    for (const skill of model.skills) {
      if (!skill.frontmatter) continue;
      const scan = model.scan(skill.skillPath);
      scan.lines.forEach((line, index) => {
        if (VAGUE.test(line)) out.push({ file: skill.skillPath, line: index + 1, msg: 'name the exact MCP tools instead of "matching …" wildcards' });
      });
      const mutations = scan.headings.find((h) => h.level === 2 && /^Mutations\b/.test(h.text));
      if (!mutations) continue;
      const text = sectionText(scan, mutations);
      if (!/write-on-confirm/i.test(skill.raw)) {
        out.push({ file: skill.skillPath, line: mutations.line, msg: 'write-capable skill must reference the SECURITY.md write-on-confirm protocol' });
      }
      const rows = text.split('\n').filter((l) => /^\s*(?:[-*]|\|)\s*/.test(l) && /\b(POST|PATCH|PUT|DELETE)\b/.test(l));
      if (rows.length === 0) out.push({ file: skill.skillPath, line: mutations.line, msg: '`## Mutations` lists no calls (one row per METHOD /path + MCP tool)' });
      for (const row of rows) {
        if (!MCP_WRITE_TOOLS.some((tool) => row.includes(tool))) {
          out.push({ file: skill.skillPath, line: scan.lines.indexOf(row) + 1, msg: 'mutation row names no MCP write tool' });
        }
      }
    }
    return out;
  },
};
