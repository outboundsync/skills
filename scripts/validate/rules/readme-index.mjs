export default {
  id: 'readme-index',
  docRef: 'CONTRIBUTING.md#add-a-skill',
  description: 'README.md lists every skill (count, table row, install and try-without-installing commands) and nothing that no longer exists.',
  check(model) {
    const file = 'README.md';
    const readme = model.text(file);
    if (readme === null) return [{ file, line: 0, msg: 'README.md is missing' }];
    const lines = readme.split('\n');
    const out = [];
    const names = new Set(model.skills.map((s) => s.name));
    const lineOf = (pattern) => lines.findIndex((l) => pattern.test(l)) + 1;

    const count = readme.match(/The pack ships \*\*(\d+)\*\* skills/);
    if (!count) out.push({ file, line: 1, msg: 'README should state "The pack ships **N** skills."' });
    else if (Number(count[1]) !== names.size) {
      out.push({ file, line: lineOf(/The pack ships/), msg: `README says ${count[1]} skills; skills/ has ${names.size}` });
    }

    for (const name of names) {
      const esc = name.replace(/[-]/g, '\\-');
      if (!new RegExp(`^\\| \`${esc}\` \\|`, 'm').test(readme)) out.push({ file, line: 0, msg: `skill '${name}' has no row in the README skill tables` });
      if (!new RegExp(`npx skills add outboundsync/skills --skill ${esc}\\b`).test(readme)) out.push({ file, line: 0, msg: `skill '${name}' is missing from the README install commands` });
      if (!new RegExp(`npx skills use outboundsync/skills --skill ${esc}\\b`).test(readme)) out.push({ file, line: 0, msg: `skill '${name}' is missing from the README "try without installing" commands` });
    }

    lines.forEach((line, index) => {
      const row = line.match(/^\| `([a-z0-9-]+)` \|/);
      const cmd = line.match(/--skill ([a-z0-9-]+)/);
      const listed = row?.[1] ?? cmd?.[1];
      if (listed && !names.has(listed)) out.push({ file, line: index + 1, msg: `README lists '${listed}', which is not a folder under skills/` });
    });
    return out;
  },
};
