import { execFileSync } from 'node:child_process';
import { parseFrontmatter } from '../model.mjs';

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function compareVersions(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export default {
  id: 'version-bumped',
  docRef: 'CONTRIBUTING.md#versioning',
  description: 'With --base <ref>, every skill whose files changed since the merge-base bumps metadata.version.',
  check(model) {
    if (!model.base) return [];
    const root = model.root;
    let mergeBase;
    try {
      mergeBase = git(root, ['merge-base', model.base, 'HEAD']);
    } catch {
      return [{ file: '.', line: 0, msg: `cannot resolve --base '${model.base}' (fetch it first, e.g. git fetch origin main)` }];
    }
    const changed = new Set([
      ...git(root, ['diff', '--name-only', mergeBase]).split('\n'),
      ...git(root, ['ls-files', '--others', '--exclude-standard']).split('\n'),
    ].filter(Boolean));

    const out = [];
    for (const skill of model.skills) {
      if (![...changed].some((file) => file.startsWith(`${skill.dir}/`))) continue;
      let before;
      try {
        before = git(root, ['show', `${mergeBase}:${skill.skillPath}`]);
      } catch {
        continue; // New skill — nothing to bump from.
      }
      const oldVersion = parseFrontmatter(before).frontmatter?.metadata?.version;
      const newVersion = skill.frontmatter?.metadata?.version;
      if (oldVersion === undefined || newVersion === undefined) continue;
      if (compareVersions(newVersion, oldVersion) <= 0) {
        out.push({
          file: skill.skillPath,
          line: skill.frontmatterKeyLines?.metadata ?? 2,
          msg: `files under ${skill.dir}/ changed but metadata.version is still ${newVersion} (was ${oldVersion} at ${model.base}); bump it`,
        });
      }
    }
    return out;
  },
};
