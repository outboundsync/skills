#!/usr/bin/env node
// Validates the skills pack. Collects every diagnostic in one pass.
//
//   npm run validate                       # human-readable report
//   npm run validate -- --format github    # GitHub Actions annotations
//   npm run validate -- --base origin/main # also require version bumps
//   npm run validate -- --only links,disclaimer
//   npm run validate -- --list             # print every rule and its severity

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadModel } from './model.mjs';
import { rules } from './rules/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(HERE, '../..');
const SEVERITIES = new Set(['error', 'warn', 'off']);

export function parseArgs(argv) {
  const opts = { root: DEFAULT_ROOT, format: 'text', only: null, base: '', list: false, config: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) throw new Error(`${arg} needs a value`);
      i += 1;
      return next;
    };
    if (arg === '--root') opts.root = path.resolve(value());
    else if (arg === '--format') opts.format = value();
    else if (arg === '--only') opts.only = new Set(value().split(','));
    else if (arg === '--base') opts.base = value();
    else if (arg === '--config') opts.config = path.resolve(value());
    else if (arg === '--list') opts.list = true;
    else throw new Error(`unknown argument '${arg}'`);
  }
  if (!['text', 'github'].includes(opts.format)) throw new Error(`--format must be text or github`);
  return opts;
}

export function loadSeverities(configPath) {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  for (const [id, severity] of Object.entries(config.rules ?? {})) {
    if (!rules.some((rule) => rule.id === id)) throw new Error(`${configPath}: unknown rule '${id}'`);
    if (!SEVERITIES.has(severity)) throw new Error(`${configPath}: rule '${id}' has invalid severity '${severity}'`);
  }
  return config.rules ?? {};
}

/** Runs the rules against a repo root; returns diagnostics with severity. */
export function validate({ root, base = '', only = null, severities = {} }) {
  const model = loadModel(root, { base });
  const diagnostics = [];
  for (const rule of rules) {
    if (only && !only.has(rule.id)) continue;
    const severity = severities[rule.id] ?? 'error';
    if (severity === 'off') continue;
    for (const d of rule.check(model)) diagnostics.push({ ...d, rule: rule.id, severity, docRef: rule.docRef });
  }
  diagnostics.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
  return { diagnostics, skillCount: model.skills.length };
}

function formatText({ diagnostics, skillCount }) {
  const lines = [];
  let current = '';
  for (const d of diagnostics) {
    if (d.file !== current) {
      lines.push('', d.file);
      current = d.file;
    }
    const where = d.line > 0 ? `:${d.line}` : '';
    lines.push(`  ${d.severity === 'error' ? '✗' : '·'} ${where.padEnd(6)} ${d.msg}  [${d.rule}]`);
  }
  const errors = diagnostics.filter((d) => d.severity === 'error').length;
  const warnings = diagnostics.length - errors;
  lines.push('', errors === 0
    ? `✓ ${skillCount} skills pass${warnings ? ` · ${warnings} warning${warnings === 1 ? '' : 's'}` : ''}`
    : `✗ ${errors} error${errors === 1 ? '' : 's'}${warnings ? ` · ${warnings} warning${warnings === 1 ? '' : 's'}` : ''} across ${skillCount} skills`);
  return lines.join('\n').replace(/^\n/, '');
}

function formatGithub({ diagnostics }) {
  const escape = (s) => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  return diagnostics
    .map((d) => {
      const level = d.severity === 'error' ? 'error' : 'warning';
      const line = d.line > 0 ? `,line=${d.line}` : '';
      return `::${level} file=${d.file}${line},title=${d.rule}::${escape(`${d.msg} (see ${d.docRef})`)}`;
    })
    .join('\n');
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`validate: ${err.message}`);
    process.exit(2);
  }
  const severities = loadSeverities(opts.config ?? path.join(HERE, 'config.json'));

  if (opts.list) {
    for (const rule of rules) console.log(`${rule.id.padEnd(22)} ${(severities[rule.id] ?? 'error').padEnd(6)} ${rule.description}`);
    return;
  }

  const result = validate({ root: opts.root, base: opts.base, only: opts.only, severities });
  if (opts.format === 'github') {
    const annotations = formatGithub(result);
    if (annotations) console.log(annotations);
  }
  console.log(formatText(result));
  process.exitCode = result.diagnostics.some((d) => d.severity === 'error') ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
