// Loads the repo once into a plain model the rules read from. Rules never
// touch the filesystem for skill content — only through this model — so the
// same rules run unchanged against test fixtures.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { scanMarkdown } from './markdown.mjs';

const TOP_LEVEL_DOCS = ['README.md', 'CONVENTIONS.md', 'SECURITY.md', 'CONTRIBUTING.md', 'DISCLAIMER.md', 'CHANGELOG.md'];

export function loadModel(root, { base = '' } = {}) {
  const scans = new Map();
  const texts = new Map();

  const rel = (abs) => path.relative(root, abs).split(path.sep).join('/');
  const abs = (relPath) => path.join(root, relPath);

  function text(relPath) {
    if (!texts.has(relPath)) {
      texts.set(relPath, existsSync(abs(relPath)) ? readFileSync(abs(relPath), 'utf8') : null);
    }
    return texts.get(relPath);
  }

  function scan(relPath) {
    if (!scans.has(relPath)) {
      const content = text(relPath);
      scans.set(relPath, content === null ? null : scanMarkdown(content));
    }
    return scans.get(relPath);
  }

  const skillsDir = abs('skills');
  const skills = existsSync(skillsDir)
    ? readdirSync(skillsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
        .map((name) => loadSkill(name))
    : [];

  function loadSkill(name) {
    const dir = `skills/${name}`;
    const skillPath = `${dir}/SKILL.md`;
    const files = listFiles(abs(dir)).map(rel);
    // Exact-case check: macOS/Windows filesystems would otherwise accept skill.md.
    const raw = files.includes(skillPath) ? text(skillPath) : null;
    const skill = { name, dir, skillPath, files, raw, frontmatter: null, frontmatterError: null, frontmatterEnd: 0 };
    if (raw !== null) Object.assign(skill, parseFrontmatter(raw));
    return skill;
  }

  const docs = TOP_LEVEL_DOCS.filter((file) => existsSync(abs(file)));

  return {
    root,
    base,
    skills,
    docs,
    text,
    scan,
    exists: (relPath) => existsSync(abs(relPath)),
    isDirectory: (relPath) => existsSync(abs(relPath)) && statSync(abs(relPath)).isDirectory(),
    /** Every Markdown file the link / hygiene rules cover. */
    markdownFiles() {
      return [...docs, ...skills.flatMap((skill) => skill.files.filter((file) => file.endsWith('.md')))];
    },
  };
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out.sort();
}

/**
 * Parses the leading `---` YAML block. Line numbers in errors are file lines.
 */
export function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n?/g, '\n');
  if (raw.charCodeAt(0) === 0xfeff) {
    return { frontmatterError: { line: 1, msg: 'file starts with a UTF-8 BOM; remove it so the frontmatter `---` is recognized' } };
  }
  const lines = normalized.split('\n');
  if (lines[0] !== '---') {
    return { frontmatterError: { line: 1, msg: 'missing YAML frontmatter (first line must be `---`)' } };
  }
  const close = lines.indexOf('---', 1);
  if (close === -1) {
    return { frontmatterError: { line: 1, msg: 'unterminated YAML frontmatter (no closing `---`)' } };
  }

  const doc = parseDocument(lines.slice(1, close).join('\n'), { prettyErrors: false });
  if (doc.errors.length > 0) {
    const err = doc.errors[0];
    const line = (err.linePos?.[0]?.line ?? 0) + 1;
    return { frontmatterError: { line, msg: `invalid YAML frontmatter: ${err.message.split('\n')[0]}` }, frontmatterEnd: close + 1 };
  }
  const data = doc.toJS();
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { frontmatterError: { line: 2, msg: 'frontmatter must be a YAML mapping' }, frontmatterEnd: close + 1 };
  }

  // Remember which file line each top-level key starts on, for precise errors.
  const keyLines = {};
  for (const pair of doc.contents.items ?? []) {
    const offset = pair.key?.range?.[0];
    if (offset !== undefined) {
      const before = lines.slice(1, close).join('\n').slice(0, offset);
      keyLines[String(pair.key.value)] = before.split('\n').length + 1;
    }
  }

  return { frontmatter: data, frontmatterEnd: close + 1, frontmatterKeyLines: keyLines };
}
