import { outputContract } from './output-contract.mjs';

const SCORE_SCALE = /(?:\d|<[a-z]*>?|\bn)\s*\/\s*(100|20|5)\b/;

export default {
  id: 'score-meter',
  docRef: 'CONVENTIONS.md#score-meter--required-for-any-skill-that-scores-or-rates',
  description: 'A skill whose output contract prints a /5, /20, or /100 score must render a █/░ meter bar for it.',
  check(model) {
    const out = [];
    for (const skill of model.skills) {
      if (!skill.frontmatter) continue;
      const contract = outputContract(model.scan(skill.skillPath));
      if (!contract) continue;
      const match = contract.text.match(SCORE_SCALE);
      if (match && !/[█░]|<bar>/.test(contract.text)) {
        out.push({ file: skill.skillPath, line: contract.heading.line, msg: `output contract scores /${match[1]} but renders no █/░ meter bar` });
      }
    }
    return out;
  },
};
