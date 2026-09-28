export default {
  id: 'frontmatter',
  docRef: 'CONVENTIONS.md#frontmatter--naming',
  description: 'Every skill folder has a SKILL.md whose YAML frontmatter parses, whose name equals the folder, and whose description is non-empty.',
  check(model) {
    const out = [];
    if (model.skills.length === 0) out.push({ file: 'skills', line: 0, msg: 'no skill folders found under skills/' });
    for (const skill of model.skills) {
      if (skill.raw === null) {
        const lower = skill.files.find((file) => file.toLowerCase() === `${skill.dir}/skill.md`);
        out.push({ file: skill.dir, line: 0, msg: lower ? `found ${lower}; the file must be named exactly SKILL.md` : 'missing SKILL.md' });
        continue;
      }
      if (skill.frontmatterError) {
        out.push({ file: skill.skillPath, line: skill.frontmatterError.line, msg: skill.frontmatterError.msg });
        continue;
      }
      const fm = skill.frontmatter;
      const lines = skill.frontmatterKeyLines;
      if (typeof fm.name !== 'string' || fm.name.trim() === '') {
        out.push({ file: skill.skillPath, line: lines.name ?? 2, msg: 'frontmatter `name:` is missing or empty' });
      } else if (fm.name !== skill.name) {
        out.push({ file: skill.skillPath, line: lines.name, msg: `frontmatter name '${fm.name}' does not match folder '${skill.name}'` });
      }
      if (typeof fm.description !== 'string' || fm.description.trim() === '') {
        out.push({ file: skill.skillPath, line: lines.description ?? 2, msg: 'frontmatter `description:` is missing or empty' });
      }
    }
    return out;
  },
};
