import { sectionRange } from '../markdown.mjs';

export function outputContract(scan) {
  const heading = scan.headings.find((h) => h.level === 2 && /^Output contract\b/i.test(h.text));
  if (!heading) return null;
  const range = sectionRange(scan, heading);
  const shapes = scan.headings.filter((h) => h.level === 3 && h.line > range.start && h.line <= range.end && /^Shape\b/.test(h.text));
  return { heading, range, shapes, text: scan.lines.slice(range.start - 1, range.end).join('\n') };
}

export default {
  id: 'output-contract',
  docRef: 'CONVENTIONS.md#shared-visual-language',
  description: 'Every skill declares `## Output contract` containing at least one `### Shape` (or `### Shape — <variant>`) template.',
  check(model) {
    const out = [];
    for (const skill of model.skills) {
      if (!skill.frontmatter) continue; // frontmatter rule reports it
      const scan = model.scan(skill.skillPath);
      const contract = outputContract(scan);
      if (!contract) {
        out.push({ file: skill.skillPath, line: 1, msg: 'missing `## Output contract` section' });
      } else if (contract.shapes.length === 0) {
        out.push({ file: skill.skillPath, line: contract.heading.line, msg: '`## Output contract` has no `### Shape` heading (use `### Shape` or `### Shape — <variant>`)' });
      }
    }
    return out;
  },
};
