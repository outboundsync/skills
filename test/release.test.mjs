import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CHANGELOG_MARKER,
  RELEASE_COMMIT_PATTERN,
  classifyCommit,
  getNextTag,
  githubOutputLine,
  parseArgs,
  planRelease,
  promoteUnreleased,
  renderGroupedNotes,
  sortCalverTags,
  unreleasedEntries,
} from '../scripts/release-calver.mjs';

const NOW = new Date('2026-09-28T23:30:00Z');

test('tags sort numerically and ignore non-CalVer tags', () => {
  assert.deepEqual(sortCalverTags(['2026.09.02.10', 'v1.0.0', '2026.09.02.9', '2026.07.23.0']), ['2026.07.23.0', '2026.09.02.9', '2026.09.02.10']);
});

test('next tag increments the same UTC day, else starts at .0', () => {
  assert.equal(getNextTag(['2026.09.28.0', '2026.09.28.1'], NOW), '2026.09.28.2');
  assert.equal(getNextTag(['2026.09.02.1'], NOW), '2026.09.28.0');
  assert.equal(getNextTag([], new Date('2026-09-29T00:30:00+02:00')), '2026.09.28.0');
});

test('commits group by conventional type; breaking changes are marked', () => {
  assert.deepEqual(classifyCommit('feat(api)!: drop v0'), { typeKey: 'feat', breaking: true });
  assert.deepEqual(classifyCommit('Point MCP links at /docs'), { typeKey: 'other', breaking: false });
  const notes = renderGroupedNotes([
    { subject: 'fix: a', shortSha: 'aaaaaaa' },
    { subject: 'feat!: b', shortSha: 'bbbbbbb' },
    { subject: 'Plain c', shortSha: 'ccccccc' },
  ]);
  assert.equal(notes, '### Features\n- **Breaking:** feat!: b (bbbbbbb)\n\n### Fixes\n- fix: a (aaaaaaa)\n\n### Other\n- Plain c (ccccccc)');
});

test('release bookkeeping commits are excluded; no commits means no release', () => {
  const plan = planRelease({ tags: ['2026.09.02.1'], commitLog: 'abc1234def\tchore(release): 2026.09.02.1', now: NOW });
  assert.deepEqual(plan, { hasChanges: false, lastTag: '2026.09.02.1' });
});

test('the squash-merged CHANGELOG promotion commit never triggers a release', () => {
  for (const subject of ['chore(release): 2026.10.08.4', 'chore(release): CHANGELOG for 2026.10.08.4', 'chore(release): CHANGELOG for 2026.10.08.4 (#24)']) {
    assert.match(subject, RELEASE_COMMIT_PATTERN, subject);
  }
  assert.doesNotMatch('chore(release): CHANGELOG for 2026.10.08.2 plus docs (#22)', RELEASE_COMMIT_PATTERN);
  const plan = planRelease({ tags: ['2026.09.28.0'], commitLog: 'abc1234def\tchore(release): CHANGELOG for 2026.09.28.0 (#24)', now: NOW });
  assert.deepEqual(plan, { hasChanges: false, lastTag: '2026.09.28.0' });
});

test('unreleasedEntries reads only the curated Unreleased block', () => {
  assert.equal(unreleasedEntries(`# Changelog\n\n${CHANGELOG_MARKER}\n\n## Unreleased\n\n## [2026.09.02.1] - 2026-09-02\n\n- Old.\n`), '');
  assert.equal(unreleasedEntries(`# Changelog\n\n${CHANGELOG_MARKER}\n\n## Unreleased\n`), '');
  assert.equal(unreleasedEntries(`# Changelog\n\n${CHANGELOG_MARKER}\n\n## Unreleased\n\n### Fixed\n\n- A fix.\n\n## [2026.09.02.1] - 2026-09-02\n`), '### Fixed\n\n- A fix.');
  assert.equal(unreleasedEntries('# no marker'), '');
});

test('planRelease builds the tag and notes', () => {
  const plan = planRelease({ tags: ['2026.09.02.1'], commitLog: 'abc1234def\tfeat: x\n', now: NOW });
  assert.equal(plan.nextTag, '2026.09.28.0');
  assert.equal(plan.releaseNotes, '## [2026.09.28.0] - 2026-09-28\n\n### Features\n- feat: x (abc1234)');
});

test('promoteUnreleased moves curated notes under the new tag and reopens Unreleased', () => {
  const before = `# Changelog\n\n${CHANGELOG_MARKER}\n\n## Unreleased\n\n### Fixed\n\n- A fix.\n\n## [2026.09.02.1] - 2026-09-02\n\n- Old.\n`;
  const after = promoteUnreleased(before, '2026.09.28.0', '2026-09-28', 'generated');
  assert.equal(after, `# Changelog\n\n${CHANGELOG_MARKER}\n\n## Unreleased\n\n## [2026.09.28.0] - 2026-09-28\n\n### Fixed\n\n- A fix.\n\n## [2026.09.02.1] - 2026-09-02\n\n- Old.\n`);
});

test('promoteUnreleased falls back to generated notes when Unreleased is empty', () => {
  const before = `# Changelog\n\n${CHANGELOG_MARKER}\n\n## Unreleased\n`;
  assert.match(promoteUnreleased(before, 't', 'd', '- generated'), /## Unreleased\n\n## \[t\] - d\n\n- generated\n$/);
  assert.throws(() => promoteUnreleased('# no marker', 't', 'd', 'x'), /marker/);
});

test('args: --dry-run and --apply are exclusive; file flags need a value', () => {
  assert.throws(() => parseArgs(['--dry-run', '--apply']), /mutually exclusive/);
  assert.throws(() => parseArgs(['--notes-file', '--apply']), /needs a file path/);
  assert.throws(() => parseArgs(['--bogus']), /unknown argument/);
  assert.deepEqual(parseArgs(['--dry-run', '--notes-file', 'n.md']), { apply: false, notesFile: 'n.md', tagFile: '' });
});

test('GITHUB_OUTPUT uses a delimiter that cannot collide with the value', () => {
  const line = githubOutputLine('notes', 'EOF\nmore');
  const delimiter = line.split('\n')[0].split('<<')[1];
  assert.notEqual(delimiter, 'EOF');
  assert.ok(line.endsWith(`\n${delimiter}\n`));
});

test('--apply leaves CHANGELOG.md untouched when Unreleased is empty, and promotes when it has entries', async () => {
  const { execFileSync } = await import('node:child_process');
  const { mkdtempSync, readFileSync, rmSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const script = fileURLToPath(new URL('../scripts/release-calver.mjs', import.meta.url));
  const dir = mkdtempSync(path.join(tmpdir(), 'calver-'));
  try {
    const git = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: dir, stdio: 'pipe' });
    const run = () => {
      const out = path.join(dir, 'gh-output');
      writeFileSync(out, '');
      execFileSync(process.execPath, [script, '--apply'], { cwd: dir, env: { ...process.env, GITHUB_OUTPUT: out }, stdio: 'pipe' });
      return readFileSync(out, 'utf8');
    };
    const empty = `# Changelog\n\n${CHANGELOG_MARKER}\n\n## Unreleased\n\n## [2026.09.02.1] - 2026-09-02\n\n- Old.\n`;
    git('init', '-q');
    writeFileSync(path.join(dir, 'CHANGELOG.md'), empty);
    git('add', '.');
    git('commit', '-qm', 'init');
    git('tag', '2026.09.02.1');
    git('commit', '-q', '--allow-empty', '-m', 'fix: something');
    assert.match(run(), /changelog_updated<<\S+\nfalse\n/);
    assert.equal(readFileSync(path.join(dir, 'CHANGELOG.md'), 'utf8'), empty);

    writeFileSync(path.join(dir, 'CHANGELOG.md'), empty.replace('## Unreleased\n', '## Unreleased\n\n- A fix.\n'));
    assert.match(run(), /changelog_updated<<\S+\ntrue\n/);
    assert.match(readFileSync(path.join(dir, 'CHANGELOG.md'), 'utf8'), /## Unreleased\n\n## \[\d{4}\.\d{2}\.\d{2}\.\d+\] - \d{4}-\d{2}-\d{2}\n\n- A fix\.\n\n## \[2026\.09\.02\.1\]/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
