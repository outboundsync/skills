import { relativeLinks } from './links.mjs';

export default {
  id: 'links-escape-skill',
  docRef: 'CONVENTIONS.md#disclaimer-note',
  description: 'Files inside skills/<name>/ only link within that folder — `npx skills add` installs a single skill folder, so ../../ links break after install. Use an absolute URL instead.',
  check(model) {
    const out = [];
    for (const skill of model.skills) {
      for (const file of skill.files.filter((f) => f.endsWith('.md'))) {
        for (const link of relativeLinks(model, file)) {
          if (!link.resolved.startsWith(`${skill.dir}/`) && link.resolved !== skill.dir) {
            out.push({ file, line: link.line, msg: `link '${link.target}' leaves the skill folder and breaks after install; use an absolute https://github.com/outboundsync/skills/blob/main/… URL` });
          }
        }
      }
    }
    return out;
  },
};
