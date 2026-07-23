#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const CALVER_TAG_PATTERN = /^\d{4}\.\d{2}\.\d{2}\.\d+$/;
const RELEASE_COMMIT_PATTERN = /^chore\(release\):\s+\d{4}\.\d{2}\.\d{2}\.\d+$/i;
const CHANGELOG_PATH = 'CHANGELOG.md';
const CHANGELOG_MARKER = '<!-- release entries -->';

const TYPE_TITLES = new Map([
  ['feat', 'Features'],
  ['fix', 'Fixes'],
  ['perf', 'Performance'],
  ['refactor', 'Refactors'],
  ['docs', 'Documentation'],
  ['build', 'Build'],
  ['chore', 'Chores'],
  ['test', 'Tests'],
  ['ci', 'CI'],
  ['revert', 'Reverts'],
]);

function runGit(command) {
  return execSync(`git ${command}`, { encoding: 'utf8' }).trim();
}

function parseArgs(argv) {
  const args = new Set(argv);
  return {
    dryRun: args.has('--dry-run') || !args.has('--apply'),
    apply: args.has('--apply'),
    notesFile: readArgValue(argv, '--notes-file'),
    tagFile: readArgValue(argv, '--tag-file'),
  };
}

function readArgValue(argv, flag) {
  const index = argv.indexOf(flag);
  if (index === -1) {
    return '';
  }

  return argv[index + 1] ?? '';
}

function listCalverTags() {
  const raw = runGit('tag --list');
  if (!raw) {
    return [];
  }

  return raw
    .split('\n')
    .map((tag) => tag.trim())
    .filter((tag) => CALVER_TAG_PATTERN.test(tag))
    .sort(compareCalverTags);
}

function compareCalverTags(a, b) {
  const aParts = a.split('.').map((value) => Number(value));
  const bParts = b.split('.').map((value) => Number(value));

  for (let index = 0; index < 4; index += 1) {
    if (aParts[index] !== bParts[index]) {
      return aParts[index] - bParts[index];
    }
  }

  return 0;
}

function formatTodayPrefixUtc(now) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function getNextTag(tags, now) {
  const prefix = formatTodayPrefixUtc(now);
  const todayTags = tags.filter((tag) => tag.startsWith(`${prefix}.`));

  if (todayTags.length === 0) {
    return `${prefix}.0`;
  }

  const maxSuffix = todayTags.reduce((max, tag) => {
    const suffix = Number(tag.split('.')[3]);
    return Number.isNaN(suffix) ? max : Math.max(max, suffix);
  }, -1);

  return `${prefix}.${maxSuffix + 1}`;
}

function getLastTag(tags) {
  if (tags.length === 0) {
    return '';
  }

  return tags[tags.length - 1];
}

function readCommitsSince(lastTag) {
  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
  const raw = runGit(`log --pretty=format:%H%x09%s ${range}`);

  if (!raw) {
    return [];
  }

  const commits = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sha, ...subjectParts] = line.split('\t');
      return {
        sha,
        shortSha: sha.slice(0, 7),
        subject: subjectParts.join('\t').trim(),
      };
    });

  // Exclude automated release bookkeeping commits from release notes.
  return commits.filter((commit) => !RELEASE_COMMIT_PATTERN.test(commit.subject));
}

function classifyCommit(subject) {
  const match = subject.match(/^([a-z]+)(\([^)]*\))?!?:\s+(.+)$/i);
  if (!match) {
    return { typeKey: 'other', subject };
  }

  const rawType = match[1].toLowerCase();
  const normalizedType = TYPE_TITLES.has(rawType) ? rawType : 'other';

  return { typeKey: normalizedType, subject };
}

function groupCommits(commits) {
  const groups = new Map();

  for (const commit of commits) {
    const { typeKey, subject } = classifyCommit(commit.subject);
    if (!groups.has(typeKey)) {
      groups.set(typeKey, []);
    }

    groups.get(typeKey).push({
      ...commit,
      subject,
    });
  }

  return groups;
}

function renderGroupedNotes(groups) {
  const orderedTypes = ['feat', 'fix', 'perf', 'refactor', 'docs', 'build', 'chore', 'test', 'ci', 'revert', 'other'];

  const sections = [];
  for (const typeKey of orderedTypes) {
    const entries = groups.get(typeKey);
    if (!entries || entries.length === 0) {
      continue;
    }

    const title = TYPE_TITLES.get(typeKey) ?? 'Other';
    const lines = [`### ${title}`];
    for (const entry of entries) {
      lines.push(`- ${entry.subject} (${entry.shortSha})`);
    }
    sections.push(lines.join('\n'));
  }

  if (sections.length === 0) {
    return '- No changes in this release.';
  }

  return sections.join('\n\n');
}

function renderReleaseSection(tag, date, notesBody) {
  return `## [${tag}] - ${date}\n\n${notesBody}`;
}

function getOrCreateChangelogContent() {
  if (existsSync(CHANGELOG_PATH)) {
    const existingContent = readFileSync(CHANGELOG_PATH, 'utf8');
    if (!existingContent.includes(CHANGELOG_MARKER)) {
      throw new Error(`Expected ${CHANGELOG_PATH} to contain marker "${CHANGELOG_MARKER}".`);
    }

    return existingContent;
  }

  return [
    '# Changelog',
    '',
    'All notable changes to this project are documented in this file.',
    '',
    'This project uses Calendar Versioning with tags in the format `YYYY.MM.DD.N`.',
    '',
    CHANGELOG_MARKER,
    '',
  ].join('\n');
}

function prependReleaseSection(changelogContent, releaseSection) {
  return changelogContent.replace(CHANGELOG_MARKER, `${CHANGELOG_MARKER}\n\n${releaseSection}`);
}

function setGithubOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }

  appendFileSync(outputPath, `${name}<<EOF\n${value}\nEOF\n`, 'utf8');
}

function writeOptionalFile(path, content) {
  if (!path) {
    return;
  }

  writeFileSync(path, content, 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const now = new Date();
  const releaseDate = now.toISOString().slice(0, 10);

  const tags = listCalverTags();
  const lastTag = getLastTag(tags);
  const commits = readCommitsSince(lastTag);

  if (commits.length === 0) {
    console.log('No commits since the last CalVer tag. Skipping release.');
    setGithubOutput('has_changes', 'false');
    setGithubOutput('previous_tag', lastTag);
    return;
  }

  const nextTag = getNextTag(tags, now);
  const groupedNotes = renderGroupedNotes(groupCommits(commits));
  const releaseNotes = renderReleaseSection(nextTag, releaseDate, groupedNotes);

  let changelogUpdated = false;
  if (args.apply) {
    const changelogContent = getOrCreateChangelogContent();
    const updatedChangelog = prependReleaseSection(changelogContent, releaseNotes);
    writeFileSync(CHANGELOG_PATH, updatedChangelog, 'utf8');
    changelogUpdated = true;
  }

  writeOptionalFile(args.notesFile, releaseNotes);
  writeOptionalFile(args.tagFile, `${nextTag}\n`);

  setGithubOutput('has_changes', 'true');
  setGithubOutput('next_tag', nextTag);
  setGithubOutput('previous_tag', lastTag || 'none');
  setGithubOutput('release_date', releaseDate);
  setGithubOutput('release_notes', releaseNotes);
  setGithubOutput('changelog_updated', String(changelogUpdated));

  console.log(`Next release tag: ${nextTag}`);
  console.log(`Previous release tag: ${lastTag || 'none'}`);
  console.log(`Commits included: ${commits.length}`);
  console.log(args.dryRun ? 'Mode: dry-run (no files written).' : 'Mode: apply');
}

main();
