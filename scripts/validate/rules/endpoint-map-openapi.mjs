// The api skill's references/endpoints.md must list exactly the operations of
// the OutboundSync API's OpenAPI spec, each with its MCP tool name. The spec is
// the committed snapshot api-sync/openapi.snapshot.json, refreshed by the
// `API sync` workflow (.github/workflows/api-sync.yml). Until the first sync
// run commits a snapshot, this rule only warns that coverage is unchecked.
//
// API_SYNC_SPEC=<path> checks against another spec file instead; the API sync
// workflow points it at the live spec while its agent edits the skills.
import { readFileSync } from 'node:fs';
import { endpointRows } from './endpoint-map-consistent.mjs';

export const CANONICAL = 'skills/api/references/endpoints.md';
export const SNAPSHOT = 'api-sync/openapi.snapshot.json';
export const SPEC_ENV = 'API_SYNC_SPEC';

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'];
const API_PREFIX = '/api/v1';

// Discovery operations are not API surface: no map row, no MCP tool.
export const DISCOVERY = new Set([
  'GET /health/live',
  'GET /health/ready',
  'GET /api/v1/openapi.json',
  'GET /api/v1/openapi.yaml',
]);

// MCP tool naming rule: snake_case(operationId). These grandfathered names
// predate the rule; keep them exactly. New tools must follow the rule.
export const TOOL_ALIASES = {
  getRequestMetrics: 'get_requests_metrics',
  getSyncMetrics: 'get_syncs_metrics',
  listDestinationReplyRelays: 'list_reply_relays',
};

/**
 * camelCase → snake_case (`getSetupStatus` → `get_setup_status`, `getURLInfo` →
 * `get_url_info`). Same function as the OutboundSync MCP server and website:
 * keep the three identical.
 */
export function toSnake(operationId) {
  return String(operationId)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

/** The MCP tool name an operationId must have. */
export function toolName(operationId) {
  return TOOL_ALIASES[operationId] ?? toSnake(operationId);
}

/** Spec path → the map's spelling: no `/api/v1` prefix, `{id}` → `:id`. */
export function mapRoute(method, specPath) {
  const trimmed = specPath.startsWith(`${API_PREFIX}/`) ? specPath.slice(API_PREFIX.length) : specPath;
  return `${method.toUpperCase()} ${trimmed.replace(/\{([^}]+)\}/g, ':$1')}`;
}

/** Every non-discovery operation in an OpenAPI document. */
export function specOperations(spec) {
  const out = [];
  for (const [specPath, item] of Object.entries(spec?.paths ?? {})) {
    if (!item || typeof item !== 'object') continue;
    for (const method of METHODS) {
      const op = item[method];
      if (!op || typeof op !== 'object') continue;
      const specRoute = `${method.toUpperCase()} ${specPath}`;
      if (DISCOVERY.has(specRoute)) continue;
      const operationId = typeof op.operationId === 'string' && op.operationId.trim() ? op.operationId.trim() : null;
      out.push({
        route: mapRoute(method, specPath),
        specRoute,
        method: method.toUpperCase(),
        operationId,
        tool: operationId ? toolName(operationId) : null,
      });
    }
  }
  return out;
}

const loaded = new WeakMap();

/**
 * Loads the spec once per model: { spec, source } when present, { spec: null }
 * when there is no snapshot, { error, source } when it can't be read.
 */
export function loadSpec(model, env = process.env) {
  if (loaded.has(model)) return loaded.get(model);
  let result;
  const override = env[SPEC_ENV];
  const source = override || SNAPSHOT;
  try {
    const text = override ? readFileSync(override, 'utf8') : model.text(SNAPSHOT);
    if (text === null) result = { spec: null, source: null };
    else {
      const spec = JSON.parse(text);
      if (!spec || typeof spec !== 'object' || typeof spec.paths !== 'object' || spec.paths === null) {
        result = { error: 'not an OpenAPI document (no `paths` object)', source };
      } else result = { spec, source };
    }
  } catch (err) {
    result = { error: err.message.split('\n')[0], source };
  }
  loaded.set(model, result);
  return result;
}

/** MCP write tools (every non-GET operation) from the spec, or null without one. */
export function writeToolsFromSpec(model) {
  const { spec } = loadSpec(model);
  if (!spec) return null;
  return specOperations(spec).filter((op) => op.method !== 'GET' && op.tool).map((op) => op.tool);
}

export default {
  id: 'endpoint-map-openapi',
  docRef: 'CONTRIBUTING.md#api-sync',
  description: `The api skill's REST ↔ MCP map lists exactly the non-discovery operations in ${SNAPSHOT}, each named snake_case(operationId) (plus the grandfathered aliases). Warns and skips while no snapshot exists.`,
  check(model) {
    const canonicalText = model.text(CANONICAL);
    const { spec, source, error } = loadSpec(model);

    if (error) {
      const file = source === SNAPSHOT ? SNAPSHOT : CANONICAL;
      return [{ file, line: 0, msg: `cannot read the OpenAPI spec ${source}: ${error}` }];
    }
    if (!spec) {
      if (canonicalText === null) return [];
      return [{
        file: CANONICAL,
        line: 0,
        severity: 'warn',
        msg: `no OpenAPI snapshot (${SNAPSHOT}) yet, so the map is not checked against the API; the first API sync run adds it`,
      }];
    }
    if (canonicalText === null) {
      return [{ file: SNAPSHOT, line: 0, msg: `the OpenAPI snapshot exists but the canonical map ${CANONICAL} is missing` }];
    }

    // Malformed or duplicate rows are reported by endpoint-map-consistent.
    const { rows } = endpointRows(canonicalText);
    const ops = specOperations(spec);
    const byRoute = new Map(ops.map((op) => [op.route, op]));
    const out = [];

    for (const op of ops) {
      if (op.operationId) continue;
      out.push({ file: CANONICAL, line: 0, severity: 'warn', msg: `\`${op.specRoute}\` has no operationId in ${source}, so its MCP tool name can't be checked` });
    }

    for (const [route, row] of rows) {
      const op = byRoute.get(route);
      if (!op) {
        out.push({ file: CANONICAL, line: row.line, msg: `\`${route}\` is not an operation in ${source}; remove the row or check the path spelling (no /api/v1 prefix, :param)` });
      } else if (op.tool && op.tool !== row.tool) {
        out.push({ file: CANONICAL, line: row.line, msg: `\`${route}\` maps to \`${row.tool}\`; the naming rule gives \`${op.tool}\` (operationId \`${op.operationId}\`)` });
      }
    }

    for (const op of ops) {
      if (rows.has(op.route)) continue;
      out.push({
        file: CANONICAL,
        line: 0,
        msg: `\`${op.route}\` (${op.specRoute}) is in ${source} but missing from the map${op.tool ? `; add a row with MCP tool \`${op.tool}\`` : ''}`,
      });
    }
    return out;
  },
};
