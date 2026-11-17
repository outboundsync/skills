import { sectionText } from '../markdown.mjs';
import { writeToolsFromSpec } from './endpoint-map-openapi.mjs';

// OutboundSync MCP write tools. When api-sync/openapi.snapshot.json exists the
// list comes from it (every non-GET operation); this hard-coded copy is only
// the fallback until the first API sync run commits the snapshot.
export const MCP_WRITE_TOOLS = [
  'retry_sync', 'retry_source_syncs', 'replay_destination_delivery', 'pause_blocklist', 'resync_blocklist',
  'create_webhook', 'update_webhook', 'delete_webhook', 'rotate_webhook_secret', 'test_webhook', 'replay_webhook_delivery',
];
const VAGUE = /matching write tools|matching `?get_\*`? *\/ *`?list_\*`?|matching `?(?:get|list)_\*`? tools/i;

export default {
  id: 'write-tools-named',
  docRef: 'SECURITY.md#write-on-confirm-protocol',
  description: 'Tools and mutations are named exactly — no "matching write tools". A write-capable skill has a `## Mutations` section naming each MCP write tool and REST call, and follows the write-on-confirm protocol.',
  check(model) {
    const out = [];
    const writeTools = writeToolsFromSpec(model) ?? MCP_WRITE_TOOLS;
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
        if (!writeTools.some((tool) => row.includes(tool))) {
          out.push({ file: skill.skillPath, line: scan.lines.indexOf(row) + 1, msg: 'mutation row names no MCP write tool' });
        }
      }
    }
    return out;
  },
};
