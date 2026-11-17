import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { parseArgs, validate } from '../scripts/validate/cli.mjs';
import { checkBarLine } from '../scripts/validate/rules/bar-geometry.mjs';
import { mapRoute, toolName, toSnake } from '../scripts/validate/rules/endpoint-map-openapi.mjs';
import { githubSlug, scanMarkdown } from '../scripts/validate/markdown.mjs';
import { defaultBody, makeRepo, readmeFor, skillMd } from './helpers/fixture.mjs';

// The API sync workflow sets API_SYNC_SPEC for its agent; tests use only the
// fixture's own snapshot.
delete process.env.API_SYNC_SPEC;

function diagnosticsFor(overrides, opts = {}) {
  const repo = makeRepo(overrides);
  try {
    return validate({ root: repo.root, ...opts }).diagnostics;
  } finally {
    repo.cleanup();
  }
}

/** Ids of the rules that report errors (warnings are asserted separately). */
function ruleIds(overrides, opts = {}) {
  return [...new Set(diagnosticsFor(overrides, opts).filter((d) => d.severity === 'error').map((d) => d.rule))].sort();
}

test('a minimal valid repo produces no diagnostics', () => {
  assert.deepEqual(ruleIds({}), []);
});

const cases = [
  ['frontmatter: name must match folder', { 'skills/demo/SKILL.md': skillMd({ name: 'other' }) }, ['frontmatter']],
  ['frontmatter: missing SKILL.md', { 'skills/demo/SKILL.md': null, 'skills/demo/skill.md': 'x' }, ['frontmatter']],
  ['frontmatter: invalid YAML', { 'skills/demo/SKILL.md': '---\nname: [unclosed\n---\n' }, ['frontmatter']],
  ['frontmatter: BOM', { 'skills/demo/SKILL.md': `﻿${skillMd()}` }, ['frontmatter']],
  ['metadata: unquoted float version and unknown key', { 'skills/demo/SKILL.md': skillMd({ version: '1.10', extraFrontmatter: 'tags: [x]\n' }) }, ['metadata']],
  ['description-style: not verb-led', { 'skills/demo/SKILL.md': skillMd({ description: 'The demo skill. Use when the user asks for a demo. No OutboundSync API key.' }) }, ['description-style']],
  ['description-style: account-free suffix', { 'skills/demo/SKILL.md': skillMd({ description: 'Draft demos. Use when the user asks for a demo.' }) }, ['description-style']],
  ['description-style: keyed skills skip the suffix', { 'skills/demo/SKILL.md': skillMd({ description: 'Draft demos. Use when the user asks for a demo.', extraFrontmatter: 'compatibility: Requires OUTBOUNDSYNC_API_KEY.\n' }) }, []],
  ['disclaimer: missing', { 'skills/demo/SKILL.md': skillMd().replace(/\*\*Note:\*\*.*\n/, '') }, ['disclaimer']],
  ['disclaimer: reworded', { 'skills/demo/SKILL.md': skillMd().replace('shared freely', 'shared') }, ['disclaimer']],
  ['output-contract: missing', { 'skills/demo/SKILL.md': skillMd({ body: '## Workflow\n\nDo it.\n' }) }, ['output-contract']],
  ['output-contract: no Shape heading', { 'skills/demo/SKILL.md': skillMd({ body: defaultBody().replace('### Shape', '### Template') }) }, ['output-contract']],
  ['output-contract: Shape variants count', { 'skills/demo/SKILL.md': skillMd({ body: defaultBody().replace('### Shape', '### Shape — Quick') }) }, []],
  ['score-meter: /100 with no bar', { 'skills/demo/SKILL.md': skillMd({ body: '## Output contract\n\n### Shape\n\n- Total: <n>/100\n' }) }, ['score-meter']],
  ['bar-geometry: wrong fill', { 'skills/demo/SKILL.md': skillMd({ body: defaultBody().replace('████████████████░░░░', '███████████████░░░░░') }) }, ['bar-geometry']],
  ['bar-geometry: glyphs in inline code are a legend, not a bar', { 'skills/demo/references/rubric.md': '# Rubric\n\n## Levels\n\nGlyphs: `█░▒` and `███░`.\n' }, []],
  ['links: broken relative link', { 'skills/demo/references/rubric.md': null }, ['links']],
  ['links: missing anchor', { 'skills/demo/SKILL.md': skillMd({ body: defaultBody().replace('references/rubric.md', 'references/rubric.md#nope') }) }, ['links']],
  ['links: valid anchor', { 'skills/demo/SKILL.md': skillMd({ body: defaultBody().replace('references/rubric.md', 'references/rubric.md#levels') }) }, []],
  ['links: links inside code fences are ignored', { 'skills/demo/SKILL.md': skillMd({ body: `${defaultBody()}\n\`\`\`markdown\n[x](missing.md)\n\`\`\`\n` }) }, []],
  ['links-escape-skill: ../../ link', { 'skills/demo/SKILL.md': skillMd().replace('https://github.com/outboundsync/skills/blob/main/DISCLAIMER.md', '../../DISCLAIMER.md') }, ['links-escape-skill']],
  ['write-tools-named: vague wildcard', { 'skills/demo/SKILL.md': skillMd({ body: `${defaultBody()}\nUse the matching write tools.\n` }) }, ['write-tools-named']],
  ['write-tools-named: Mutations must name MCP tools and the protocol', { 'skills/demo/SKILL.md': skillMd({ body: `${defaultBody()}\n## Mutations\n\n| POST /webhooks | creates |\n` }) }, ['write-tools-named']],
  ['write-tools-named: well-formed Mutations', { 'skills/demo/SKILL.md': skillMd({ body: `${defaultBody()}\n## Mutations\n\nFollow the write-on-confirm protocol.\n\n| POST /webhooks | create_webhook |\n` }) }, []],
  ['endpoint-map-consistent: trimmed copy disagrees', {
    'skills/api/SKILL.md': skillMd({ name: 'api' }).replace('references/rubric.md', 'references/endpoints.md'),
    'skills/api/references/endpoints.md': '| REST | MCP tool | Access | Notes |\n| --- | --- | --- | --- |\n| `GET /me` | `get_me` | R | x |\n',
    'skills/demo/references/endpoints.md': '| `GET /me` | `whoami` | R | y |\n| `GET /nope` | `nope` | R | z |\n',
    'README.md': readmeFor(['api', 'demo']),
  }, ['endpoint-map-consistent']],
  ['endpoint-map-consistent: SKILL.md tables are checked for tool name only', {
    'skills/api/SKILL.md': skillMd({ name: 'api' }).replace('references/rubric.md', 'references/endpoints.md'),
    'skills/api/references/endpoints.md': '| `POST /webhooks` | `create_webhook` | W · A | x |\n',
    'skills/demo/SKILL.md': skillMd({ body: defaultBody() + '\n| `POST /webhooks` | `create_webhook` | Register |\n' }),
    'README.md': readmeFor(['api', 'demo']),
  }, []],
  ['endpoint-map-consistent: malformed and duplicate rows are reported', {
    'skills/api/SKILL.md': skillMd({ name: 'api' }).replace('references/rubric.md', 'references/endpoints.md'),
    'skills/api/references/endpoints.md': '| `GET /me` | `get_me` | R | x |\n',
    'skills/demo/references/endpoints.md': '| `GET /me` | get_me | R | y |\n| `GET /me` | `get_me` | R | y |\n| `GET /me` | `get_me` | R | z |\n',
    'README.md': readmeFor(['api', 'demo']),
  }, ['endpoint-map-consistent']],
  ['stale-paths', { 'skills/demo/references/rubric.md': '# Rubric\n\n## Levels\n\nSee openclaw-skills/foo.\n' }, ['stale-paths']],
  ['stale-paths: retired admin click path', { 'skills/demo/references/rubric.md': '# Rubric\n\n## Levels\n\nCreate one under Connected Accounts → API keys.\n' }, ['stale-paths']],
  ['stale-paths: current admin click path allowed', { 'skills/demo/references/rubric.md': '# Rubric\n\n## Levels\n\nCreate one under Platform access → API keys.\n' }, []],
  ['secrets: committed key', { 'skills/demo/references/rubric.md': '# Rubric\n\n## Levels\n\nexport KEY=osapi_abcdefghijklmnop\n' }, ['secrets']],
  ['secrets: placeholder allowed', { 'skills/demo/references/rubric.md': '# Rubric\n\n## Levels\n\nexport KEY=osapi_...\n' }, []],
  ['skills-only-docs: script under skills/', { 'skills/demo/run.sh': 'echo hi\n' }, ['skills-only-docs']],
  ['readme-index: skill missing from README', { 'README.md': readmeFor([]) }, ['readme-index']],
  ['readme-index: README lists a removed skill', { 'README.md': readmeFor(['demo', 'gone']) }, ['links', 'readme-index']],
];

for (const [name, overrides, expected] of cases) {
  test(name, () => assert.deepEqual(ruleIds(overrides), expected));
}

test('version-bumped: flags a changed skill without a bump, passes after a bump', () => {
  const repo = makeRepo();
  const git = (...args) => execFileSync('git', args, { cwd: repo.root, stdio: 'pipe' });
  try {
    git('init', '-q', '-b', 'main');
    git('-c', 'user.email=t@example.com', '-c', 'user.name=t', 'add', '.');
    git('-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-qm', 'base');
    const rubric = path.join(repo.root, 'skills/demo/references/rubric.md');
    writeFileSync(rubric, '# Rubric\n\n## Levels\n\nChanged.\n');
    const ids = () => validate({ root: repo.root, base: 'main' }).diagnostics.map((d) => d.rule);
    assert.deepEqual(ids(), ['version-bumped']);
    writeFileSync(path.join(repo.root, 'skills/demo/SKILL.md'), skillMd({ version: '"1.0.1"' }));
    assert.deepEqual(ids(), []);
  } finally {
    repo.cleanup();
  }
});

test('crm-analysis rules run only when the skill exists and catch drift', () => {
  const router = `intents:\n  - id: a\n    required_fields:\n      hubspot: [os_known, os_unknown]\nexploratory_paths:\n  - id: explore\n`;
  const overrides = {
    'README.md': readmeFor(['crm-analysis', 'demo']),
    'skills/crm-analysis/SKILL.md': skillMd({ name: 'crm-analysis' }).replace('references/rubric.md', 'references/question_router.md'),
    'skills/crm-analysis/references/router_contract.yaml': router,
    'skills/crm-analysis/references/question_router.md': '# Router\n\n- `id`: `a`\n- `id`: `b`\n',
    'skills/crm-analysis/references/hubspot_properties.md': '`os_known`\n',
    'skills/crm-analysis/references/salesforce_fields.md': '`OSKnown__c` and `OSLast AppUrl__c`\n',
    'skills/crm-analysis/references/prompt_library.md': '| Prompt ID | Mode | Mapping Type | Mapping | Prompt |\n|---|---|---|---|---|\n| SP-01 | strict | intent_id | a | x |\n| SP-01 | strict | exploratory_path | explore | x |\n| SP-2 | strict | intent_id | a | x |\n',
  };
  assert.deepEqual(ruleIds(overrides), ['crm-field-whitespace', 'crm-prompt-registry', 'crm-router-fields', 'crm-router-ids']);
});

test('bar geometry: widths, fills, and unverified cells', () => {
  assert.deepEqual(checkBarLine('Dream   █████  5/5'), []);
  assert.deepEqual(checkBarLine('Rubric  ███████░░░  14/20'), []);
  assert.deepEqual(checkBarLine('Overall ████████████░░░░░░░░ 3/5 · not ready'), []);
  assert.deepEqual(checkBarLine('Smartlead ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ · manual'), []);
  assert.deepEqual(checkBarLine('CRM syncs ███████████████████░  ✗ 1,216/1,277 ok'), []);
  assert.match(checkBarLine('CRM syncs ████████████████████  ✗ 1,216/1,277 ok')[0], /expected 19/);
  assert.match(checkBarLine('Rubric  ██████░░░░  14/20')[0], /expected 7/);
  assert.match(checkBarLine('Levers  ██░░  2/4')[0], /4 cells wide/);
  assert.match(checkBarLine('Lever  ███░░  3/20')[0], /5-cell bar/);
  assert.match(checkBarLine('Lever  ██▒░░  2/5')[0], /▒/);
});

test('markdown scanner: headings and links outside fences only', () => {
  const scan = scanMarkdown('# A\n\n````markdown\n## Not a heading\n[x](y.md)\n````\n\n## B\n\nSee [c](c.md "title") and `[d](d.md)`.\n');
  assert.deepEqual(scan.headings.map((h) => h.text), ['A', 'B']);
  assert.deepEqual(scan.links.map((l) => l.target), ['c.md']);
  assert.equal(scan.fences[0].info, 'markdown');
  assert.equal(githubSlug('Write-on-confirm protocol'), 'write-on-confirm-protocol');
  assert.equal(githubSlug('Score meter — required for any skill'), 'score-meter--required-for-any-skill');
});

test('cli args: flags need values and unknown flags are rejected', () => {
  assert.throws(() => parseArgs(['--base', '--format']), /needs a value/);
  assert.throws(() => parseArgs(['--nope']), /unknown argument/);
  assert.equal(parseArgs(['--format', 'github']).format, 'github');
});

test('the real repo has no validation errors', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const { diagnostics } = validate({ root, severities: JSON.parse(readFileSync(path.join(root, 'scripts/validate/config.json'), 'utf8')).rules });
  assert.deepEqual(diagnostics.filter((d) => d.severity === 'error'), []);
});

test('templates/SKILL.template.md is a valid skill under every rule', () => {
  const template = readFileSync(path.resolve(import.meta.dirname, '../templates/SKILL.template.md'), 'utf8');
  assert.deepEqual(
    ruleIds({
      'README.md': readmeFor(['my-skill']),
      'skills/demo/SKILL.md': null,
      'skills/demo/references/rubric.md': null,
      'skills/my-skill/SKILL.md': template,
    }),
    [],
  );
});

// --- endpoint-map-openapi: the canonical map against api-sync/openapi.snapshot.json

function openapi(ops) {
  const paths = {
    '/health/live': { get: { operationId: 'getHealthLive' } },
    '/api/v1/openapi.json': { get: { operationId: 'getOpenApiJson' } },
  };
  for (const [method, specPath, operationId] of ops) {
    paths[specPath] = { ...paths[specPath], parameters: [], [method]: { operationId } };
  }
  return JSON.stringify({ openapi: '3.1.0', paths }, null, 2);
}

const SPEC_OPS = [
  ['get', '/api/v1/me', 'getMe'],
  ['get', '/api/v1/requests/metrics', 'getRequestMetrics'],
  ['post', '/api/v1/syncs/{id}/retry', 'retrySync'],
];
const MAP_ROWS = [
  '| `GET /me` | `get_me` | R | x |',
  '| `GET /requests/metrics` | `get_requests_metrics` | R | x |',
  '| `POST /syncs/:id/retry` | `retry_sync` | W | x |',
];

function apiRepo({ rows = MAP_ROWS, spec = openapi(SPEC_OPS), extra = {} } = {}) {
  return {
    'skills/api/SKILL.md': skillMd({ name: 'api' }).replace('references/rubric.md', 'references/endpoints.md'),
    'skills/api/references/endpoints.md': `| REST | MCP tool | Access | Notes |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`,
    'README.md': readmeFor(['api', 'demo']),
    'api-sync/openapi.snapshot.json': spec,
    ...extra,
  };
}

test('endpoint-map-openapi: no snapshot only warns that coverage is unchecked', () => {
  const diagnostics = diagnosticsFor(apiRepo({ spec: null, rows: ['| `GET /anything` | `whatever` | R | x |'] }));
  assert.deepEqual(diagnostics.map((d) => [d.rule, d.severity]), [['endpoint-map-openapi', 'warn']]);
  assert.match(diagnostics[0].msg, /no OpenAPI snapshot/);
});

const openapiCases = [
  ['map matches the spec (aliases, :params, discovery ops skipped)', apiRepo(), []],
  ['missing operation', apiRepo({ rows: MAP_ROWS.slice(0, 2) }), ['endpoint-map-openapi']],
  ['operation not in the spec', apiRepo({ rows: [...MAP_ROWS, '| `GET /setup` | `get_setup_status` | R | x |'] }), ['endpoint-map-openapi']],
  ['discovery op listed in the map', apiRepo({ rows: [...MAP_ROWS, '| `GET /openapi.json` | `get_open_api_json` | R | x |'] }), ['endpoint-map-openapi']],
  ['tool breaks the naming rule (alias ignored)', apiRepo({ rows: MAP_ROWS.map((r) => r.replace('get_requests_metrics', 'get_request_metrics')) }), ['endpoint-map-openapi']],
  ['snapshot is not JSON', apiRepo({ spec: '{nope' }), ['endpoint-map-openapi']],
  ['snapshot has no paths', apiRepo({ spec: '{"openapi":"3.1.0"}' }), ['endpoint-map-openapi']],
  ['write-tools-named takes write tools from the snapshot', apiRepo({
    spec: openapi([...SPEC_OPS, ['post', '/api/v1/widgets/{id}/archive', 'archiveWidget']]),
    rows: [...MAP_ROWS, '| `POST /widgets/:id/archive` | `archive_widget` | W | x |'],
    extra: { 'skills/demo/SKILL.md': skillMd({ body: `${defaultBody()}\n## Mutations\n\nFollow the write-on-confirm protocol.\n\n| \`POST /widgets/:id/archive\` | \`archive_widget\` | Archive |\n` }) },
  }), []],
  ['write-tools-named: a read tool is not a write tool', apiRepo({
    extra: { 'skills/demo/SKILL.md': skillMd({ body: `${defaultBody()}\n## Mutations\n\nFollow the write-on-confirm protocol.\n\n| POST /webhooks | create_webhook |\n` }) },
  }), ['write-tools-named']],
];

for (const [name, overrides, expected] of openapiCases) {
  test(`endpoint-map-openapi: ${name}`, () => assert.deepEqual(ruleIds(overrides), expected));
}

test('endpoint-map-openapi: missing-row message names the expected tool', () => {
  const msgs = diagnosticsFor(apiRepo({ rows: MAP_ROWS.slice(1) })).map((d) => d.msg);
  assert.deepEqual(msgs.filter((m) => /missing from the map/.test(m)).length, 1);
  assert.match(msgs.find((m) => /missing from the map/.test(m)), /`GET \/me`.*`get_me`/);
});

test('endpoint-map-openapi: API_SYNC_SPEC overrides the committed snapshot', () => {
  const repo = makeRepo(apiRepo());
  const live = path.join(repo.root, 'live.json');
  writeFileSync(live, openapi([...SPEC_OPS, ['get', '/api/v1/setup', 'getSetupStatus']]));
  process.env.API_SYNC_SPEC = live;
  try {
    const errors = validate({ root: repo.root }).diagnostics.filter((d) => d.severity === 'error');
    assert.deepEqual(errors.map((d) => d.rule), ['endpoint-map-openapi']);
    assert.match(errors[0].msg, /get_setup_status/);
  } finally {
    delete process.env.API_SYNC_SPEC;
    repo.cleanup();
  }
});

test('endpoint-map-openapi: naming rule and route spelling', () => {
  assert.equal(toSnake('getSetupStatus'), 'get_setup_status');
  assert.equal(toSnake('getDestinationDeliveryMetrics'), 'get_destination_delivery_metrics');
  assert.equal(toSnake('getURLInfo'), 'get_url_info');
  assert.equal(toolName('getSyncMetrics'), 'get_syncs_metrics');
  assert.equal(toolName('listDestinationReplyRelays'), 'list_reply_relays');
  assert.equal(mapRoute('post', '/api/v1/destinations/{id}/deliveries/{deliveryId}/replay'), 'POST /destinations/:id/deliveries/:deliveryId/replay');
});
