// crm-analysis ships a machine-readable router. These rules keep the router,
// its Markdown twin, the field dictionaries, and the prompt registry in step.
import { parse } from 'yaml';

const DIR = 'skills/crm-analysis';
const REFS = `${DIR}/references`;
const FILES = {
  routerMd: `${REFS}/question_router.md`,
  routerYaml: `${REFS}/router_contract.yaml`,
  hubspot: `${REFS}/hubspot_properties.md`,
  salesforce: `${REFS}/salesforce_fields.md`,
  prompts: `${REFS}/prompt_library.md`,
};

const present = (model) => model.isDirectory(DIR);

function loadRouter(model) {
  const text = model.text(FILES.routerYaml);
  if (text === null) return { error: `${FILES.routerYaml} is missing` };
  try {
    return { router: parse(text) ?? {} };
  } catch (err) {
    return { error: `router_contract.yaml does not parse: ${err.message.split('\n')[0]}`, line: err.linePos?.[0]?.line };
  }
}

const strictIds = (router) => new Set((router.intents ?? []).map((i) => String(i.id)));
const exploratoryIds = (router) => new Set((router.exploratory_paths ?? []).map((p) => String(p.id)));

const files = {
  id: 'crm-files',
  docRef: `${DIR}/SKILL.md`,
  description: 'crm-analysis router, field dictionaries, and prompt library exist and the router YAML parses.',
  check(model) {
    if (!present(model)) return [];
    const out = Object.values(FILES).filter((f) => !model.exists(f)).map((file) => ({ file, line: 0, msg: 'required crm-analysis reference is missing' }));
    const { error, line } = loadRouter(model);
    if (error && model.exists(FILES.routerYaml)) out.push({ file: FILES.routerYaml, line: line ?? 0, msg: error });
    return out;
  },
};

const routerIds = {
  id: 'crm-router-ids',
  docRef: `${REFS}/question_router.md`,
  description: 'Strict intent IDs in question_router.md match router_contract.yaml exactly.',
  check(model) {
    if (!present(model)) return [];
    const { router } = loadRouter(model);
    const md = model.text(FILES.routerMd);
    if (!router || md === null) return [];
    const mdIds = new Map();
    md.split('\n').forEach((line, index) => {
      const match = line.match(/^- `id`: `([^`]+)`/);
      if (match) mdIds.set(match[1], index + 1);
    });
    const yamlIds = strictIds(router);
    const out = [];
    for (const [id, line] of mdIds) if (!yamlIds.has(id)) out.push({ file: FILES.routerMd, line, msg: `intent '${id}' is not in router_contract.yaml` });
    for (const id of yamlIds) if (!mdIds.has(id)) out.push({ file: FILES.routerYaml, line: 0, msg: `intent '${id}' is not documented in question_router.md` });
    return out;
  },
};

const routerFields = {
  id: 'crm-router-fields',
  docRef: `${REFS}/router_contract.yaml`,
  description: 'Every HubSpot/Salesforce field the router references exists in the matching field dictionary.',
  check(model) {
    if (!present(model)) return [];
    const { router } = loadRouter(model);
    const hub = model.text(FILES.hubspot);
    const sf = model.text(FILES.salesforce);
    if (!router || hub === null || sf === null) return [];
    const known = {
      hubspot: new Set([...hub.matchAll(/`(os_[a-z0-9_]+)`/g)].map((m) => m[1])),
      salesforce: new Set([...sf.matchAll(/`([^`]*__c)`/g)].map((m) => m[1])),
    };
    const unknown = { hubspot: new Set(), salesforce: new Set() };
    const walk = (node, crm) => {
      if (Array.isArray(node)) node.forEach((item) => walk(item, crm));
      else if (node && typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) walk(value, key === 'hubspot' || key === 'salesforce' ? key : crm);
      } else if (typeof node === 'string' && crm && !known[crm].has(node)) unknown[crm].add(node);
    };
    for (const intent of router.intents ?? []) {
      for (const key of ['required_fields', 'fallback_requirements', 'unsupported_conditions', 'optional_fields']) walk(intent[key], null);
    }
    for (const p of router.exploratory_paths ?? []) {
      for (const key of ['required_signals', 'optional_signals', 'confidence_rules']) walk(p[key], null);
    }
    return Object.entries(unknown).flatMap(([crm, fields]) =>
      [...fields].sort().map((field) => ({ file: FILES.routerYaml, line: 0, msg: `${crm} field '${field}' is not in ${crm === 'hubspot' ? 'hubspot_properties.md' : 'salesforce_fields.md'}` })),
    );
  },
};

const promptRegistry = {
  id: 'crm-prompt-registry',
  docRef: `${REFS}/prompt_library.md`,
  description: 'Prompt registry rows have a unique XX-NN id, a valid mode and mapping type, and a mapping that resolves in the router.',
  check(model) {
    if (!present(model)) return [];
    const { router } = loadRouter(model);
    const text = model.text(FILES.prompts);
    if (!router || text === null) return [];
    const strict = strictIds(router);
    const exploratory = exploratoryIds(router);
    const out = [];
    const add = (line, msg) => out.push({ file: FILES.prompts, line, msg });
    const lines = text.split('\n');
    const header = lines.findIndex((l) => /^\|\s*Prompt ID\s*\|/.test(l));
    if (header === -1) return [{ file: FILES.prompts, line: 0, msg: 'no prompt registry table (header "| Prompt ID | Mode | Mapping Type | Mapping | Prompt |")' }];

    const seen = new Set();
    let rows = 0;
    for (let i = header + 2; i < lines.length && lines[i].startsWith('|'); i += 1) {
      const line = i + 1;
      const [id, mode, type, mapping] = lines[i].split('|').slice(1, 5).map((c) => c?.trim() ?? '');
      rows += 1;
      if (!/^[A-Z]{2}-\d{2}$/.test(id)) { add(line, `prompt id '${id}' must look like SP-01`); continue; }
      if (!mode || !type || !mapping) { add(line, `prompt '${id}' is missing mode, mapping type, or mapping`); continue; }
      if (seen.has(id)) add(line, `duplicate prompt id '${id}'`);
      seen.add(id);
      if (!['strict', 'exploratory'].includes(mode)) add(line, `prompt '${id}' has invalid mode '${mode}'`);
      if (!['intent_id', 'exploratory_path', 'category'].includes(type)) add(line, `prompt '${id}' has invalid mapping type '${type}'`);
      if (type === 'intent_id' && !strict.has(mapping)) add(line, `prompt '${id}' maps to unknown strict intent '${mapping}'`);
      if (type === 'exploratory_path' && !exploratory.has(mapping)) add(line, `prompt '${id}' maps to unknown exploratory path '${mapping}'`);
      if (mode === 'strict' && (type === 'exploratory_path' || exploratory.has(mapping))) add(line, `prompt '${id}' maps to an exploratory path but is marked strict`);
    }
    if (rows === 0) add(header + 1, 'prompt registry table has no rows');
    return out;
  },
};

const fieldWhitespace = {
  id: 'crm-field-whitespace',
  docRef: `${REFS}/salesforce_fields.md`,
  description: 'Salesforce API names (…__c) and HubSpot internal names (os_…) never contain spaces — a past find/replace shipped `OSLast AppUrl__c`.',
  check(model) {
    if (!present(model)) return [];
    const pattern = /OS[A-Za-z]+ [A-Za-z0-9]+__c|`os_[^`]* [^`]*`/;
    const skill = model.skills.find((s) => s.name === 'crm-analysis');
    const out = [];
    for (const file of skill?.files ?? []) {
      (model.text(file) ?? '').split('\n').forEach((line, index) => {
        const match = line.match(pattern);
        if (match) out.push({ file, line: index + 1, msg: `CRM field name with embedded whitespace: ${match[0]}` });
      });
    }
    return out;
  },
};

export default [files, routerIds, routerFields, promptRegistry, fieldWhitespace];
