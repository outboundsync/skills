// The api skill's references/endpoints.md is the pack's REST ↔ MCP map.
// Other skills keep trimmed copies (links between skill folders break after
// install), so their rows must agree with it: path, tool, and access for
// endpoint maps; path and tool for tables inside SKILL.md (e.g. ## Mutations).
const CANONICAL = 'skills/api/references/endpoints.md';
const ROUTE_START = /^\| `(?:GET|POST|PUT|PATCH|DELETE) /;
const ROW = /^\| `((?:GET|POST|PUT|PATCH|DELETE) [^`]+)` \| `([a-z][a-z0-9_]*)` \| ([^|]+?) \|/;

/** Parses route rows; reports malformed and duplicate rows instead of skipping them. */
export function endpointRows(text) {
  const rows = new Map();
  const problems = [];
  text.split('\n').forEach((line, index) => {
    if (!ROUTE_START.test(line)) return;
    const match = line.match(ROW);
    if (!match) {
      problems.push({ line: index + 1, msg: 'route row does not match `| `METHOD /path` | `mcp_tool` | … |` — fix the formatting so it can be checked' });
      return;
    }
    const [, route, tool, access] = match;
    if (rows.has(route)) problems.push({ line: index + 1, msg: `\`${route}\` appears twice (first on line ${rows.get(route).line})` });
    else rows.set(route, { tool, access: access.trim(), line: index + 1 });
  });
  return { rows, problems };
}

export default {
  id: 'endpoint-map-consistent',
  docRef: CANONICAL,
  description: "Route rows (`| `METHOD /path` | `tool` | … |`) in any skill's references/endpoints.md or SKILL.md match the api skill's canonical map.",
  check(model) {
    const out = [];
    const copies = model.skills.flatMap((skill) =>
      [`${skill.dir}/references/endpoints.md`, skill.skillPath].filter((file) => file !== CANONICAL && skill.files.includes(file)),
    );
    const canonicalText = model.text(CANONICAL);
    if (canonicalText === null) {
      const withRows = copies.filter((file) => endpointRows(model.text(file)).rows.size > 0);
      return withRows.map((file) => ({ file, line: 0, msg: `has REST ↔ MCP rows but the canonical map ${CANONICAL} is missing` }));
    }

    const canonical = endpointRows(canonicalText);
    for (const problem of canonical.problems) out.push({ file: CANONICAL, ...problem });

    for (const file of copies) {
      const isEndpointMap = file.endsWith('/references/endpoints.md');
      const { rows, problems } = endpointRows(model.text(file));
      for (const problem of problems) out.push({ file, ...problem });
      for (const [route, row] of rows) {
        const truth = canonical.rows.get(route);
        if (!truth) out.push({ file, line: row.line, msg: `\`${route}\` is not in ${CANONICAL}` });
        else if (truth.tool !== row.tool) out.push({ file, line: row.line, msg: `\`${route}\` maps to MCP tool \`${row.tool}\`; the api map says \`${truth.tool}\`` });
        else if (isEndpointMap && truth.access !== row.access) out.push({ file, line: row.line, msg: `\`${route}\` access '${row.access}'; the api map says '${truth.access}'` });
      }
    }
    return out;
  },
};
