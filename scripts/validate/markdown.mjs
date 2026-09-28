// Minimal, fence-aware Markdown scanner — just enough structure for the
// validator rules (headings, fenced blocks, links, sections). Not a full
// CommonMark parser; it deliberately handles only what this repo uses.

const FENCE_OPEN = /^( {0,3})(`{3,}|~{3,})\s*([^`\s]*)?.*$/;
const ATX_HEADING = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;

/**
 * @param {string} text
 * @returns {{
 *   lines: string[],
 *   headings: {level:number,text:string,line:number}[],
 *   fences: {info:string,start:number,end:number,content:string[]}[],
 *   links: {target:string,line:number}[],
 * }}
 * Line numbers are 1-based.
 */
export function scanMarkdown(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const headings = [];
  const fences = [];
  const links = [];

  let fence = null;
  lines.forEach((line, index) => {
    const lineNo = index + 1;

    if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence.marker[0] && close[1].length >= fence.marker.length) {
        fence.end = lineNo;
        fences.push(fence);
        fence = null;
      } else {
        fence.content.push(line);
      }
      return;
    }

    const open = line.match(FENCE_OPEN);
    if (open) {
      fence = { marker: open[2], info: (open[3] ?? '').toLowerCase(), start: lineNo, end: -1, content: [] };
      return;
    }

    const heading = line.match(ATX_HEADING);
    if (heading) {
      headings.push({ level: heading[1].length, text: heading[2].trim(), line: lineNo });
    }

    for (const target of extractLinkTargets(stripInlineCode(line))) {
      links.push({ target, line: lineNo });
    }
  });

  if (fence) {
    // Unclosed fence: treat as running to EOF (CommonMark behavior).
    fence.end = lines.length;
    fences.push(fence);
  }

  return {
    lines,
    headings,
    fences: fences.map(({ marker, ...rest }) => rest),
    links,
  };
}

function stripInlineCode(line) {
  return line.replace(/(`+)(?:(?!\1).)+?\1/g, (match) => ' '.repeat(match.length));
}

/** Inline links `[text](target "title")` and `[text](<target>)`, balanced parens. */
function extractLinkTargets(line) {
  const targets = [];
  let index = 0;
  while ((index = line.indexOf('](', index)) !== -1) {
    // Skip images' alt text handling — images are links for our purposes.
    let cursor = index + 2;
    let target = '';
    if (line[cursor] === '<') {
      const close = line.indexOf('>', cursor);
      if (close === -1) break;
      target = line.slice(cursor + 1, close);
      cursor = close + 1;
    } else {
      let depth = 0;
      while (cursor < line.length) {
        const ch = line[cursor];
        if (ch === '(') depth += 1;
        else if (ch === ')') {
          if (depth === 0) break;
          depth -= 1;
        } else if (/\s/.test(ch)) break;
        target += ch;
        cursor += 1;
      }
    }
    if (target) targets.push(target);
    index = cursor;
  }
  return targets;
}

/**
 * Lines (1-based, inclusive) belonging to a heading's section: from the
 * heading to just before the next heading of the same or higher level.
 */
export function sectionRange(scan, heading) {
  const next = scan.headings.find((h) => h.line > heading.line && h.level <= heading.level);
  return { start: heading.line, end: next ? next.line - 1 : scan.lines.length };
}

export function sectionText(scan, heading) {
  const { start, end } = sectionRange(scan, heading);
  return scan.lines.slice(start - 1, end).join('\n');
}

/** GitHub-style heading anchor slug. */
export function githubSlug(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s/g, '-');
}
