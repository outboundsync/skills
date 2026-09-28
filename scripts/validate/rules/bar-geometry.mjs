// Every rendered bar must use a legal width and a fill that matches the
// number printed after it, so a glance at the meter never disagrees with
// the score. Widths: /5 → 5 cells, /20 → 10 cells, status gauges and /100 → 20.

const RUN = /[█░▒]{3,}/g;
const WIDTH_FOR_MAX = { 5: 5, 20: 10 };

export function checkBarLine(line) {
  const problems = [];
  for (const match of line.matchAll(RUN)) {
    const bar = match[0];
    const width = [...bar].length;
    const filled = [...bar].filter((ch) => ch === '█').length;
    const manual = bar.includes('▒');
    if (![5, 10, 20].includes(width)) {
      problems.push(`bar is ${width} cells wide; use 5 (/5), 10 (/20), or 20 (/100 and status gauges)`);
      continue;
    }
    if (manual) {
      if (width !== 20) problems.push('▒ (unverified/manual) cells only appear in 20-cell status gauges');
      continue;
    }
    const after = line.slice(match.index + bar.length);
    const score = after.match(/^[^0-9█░▒]*?(\d+)\s*\/\s*(\d+)/);
    if (!score) continue;
    const [n, max] = [Number(score[1]), Number(score[2])];
    if (max === 0 || n > max) continue;
    if (width !== 20 && WIDTH_FOR_MAX[max] !== width) {
      problems.push(`a ${width}-cell bar is for /${width === 5 ? 5 : 20} scores, but this row prints ${n}/${max}`);
      continue;
    }
    const expected = Math.round((n / max) * width);
    if (filled !== expected) {
      problems.push(`bar shows ${filled}/${width} filled for ${n}/${max}; expected ${expected} (round(${n}/${max}×${width}))`);
    }
  }
  return problems;
}

export default {
  id: 'bar-geometry',
  docRef: 'CONVENTIONS.md#score-meter--required-for-any-skill-that-scores-or-rates',
  description: 'Meter and gauge bars use a legal width and a fill that matches the score printed after them.',
  check(model) {
    const out = [];
    for (const file of model.markdownFiles()) {
      const scan = model.scan(file);
      scan.lines.forEach((line, index) => {
        for (const msg of checkBarLine(line)) out.push({ file, line: index + 1, msg });
      });
    }
    return out;
  },
};
