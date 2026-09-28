const ALLOWED = /\.(md|ya?ml)$/;

export default {
  id: 'skills-only-docs',
  docRef: 'SECURITY.md',
  description: 'skills/ ships instructions only — Markdown and YAML, no scripts or binaries.',
  check(model) {
    return model.skills
      .flatMap((skill) => skill.files)
      .filter((file) => !ALLOWED.test(file) && !file.endsWith('/.DS_Store'))
      .map((file) => ({ file, line: 0, msg: 'only .md and .yaml files may ship under skills/ (SECURITY.md: no executables)' }));
  },
};
