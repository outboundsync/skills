// Agent Skills spec limits (agentskills.io) plus this pack's required keys.
const ALLOWED_KEYS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VERSION_PATTERN = /^\d+\.\d+(\.\d+)?$/;

export default {
  id: 'metadata',
  docRef: 'CONVENTIONS.md#frontmatter--naming',
  description: 'Frontmatter uses only spec keys within spec limits, with license: MIT, metadata.author: outboundsync, and a numeric metadata.version.',
  check(model) {
    const out = [];
    for (const skill of model.skills) {
      const fm = skill.frontmatter;
      if (!fm) continue;
      const at = (key) => skill.frontmatterKeyLines[key] ?? 2;
      const add = (key, msg) => out.push({ file: skill.skillPath, line: at(key), msg });

      for (const key of Object.keys(fm)) {
        if (!ALLOWED_KEYS.has(key)) add(key, `unknown frontmatter key '${key}' (allowed: ${[...ALLOWED_KEYS].join(', ')})`);
      }
      if (typeof fm.name === 'string') {
        if (!NAME_PATTERN.test(fm.name)) add('name', `name '${fm.name}' must be lowercase kebab-case`);
        if (fm.name.length > 64) add('name', `name is ${fm.name.length} chars (max 64)`);
      }
      if (typeof fm.description === 'string' && fm.description.length > 1024) {
        add('description', `description is ${fm.description.length} chars (max 1024)`);
      }
      if (fm.compatibility !== undefined && String(fm.compatibility).length > 500) {
        add('compatibility', `compatibility is ${String(fm.compatibility).length} chars (max 500)`);
      }
      if (fm.license !== 'MIT') add('license', "license must be 'MIT'");
      const meta = fm.metadata;
      if (!meta || typeof meta !== 'object') {
        add('metadata', 'metadata: mapping with author and version is required');
      } else {
        if (meta.author !== 'outboundsync') add('metadata', "metadata.author must be 'outboundsync'");
        if (!VERSION_PATTERN.test(String(meta.version ?? ''))) {
          add('metadata', `metadata.version '${meta.version ?? ''}' must look like 1.2 or 1.2.3 (quote it so YAML keeps it a string)`);
        }
      }
    }
    return out;
  },
};
