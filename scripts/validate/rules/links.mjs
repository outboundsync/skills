import path from 'node:path';
import { githubSlug } from '../markdown.mjs';

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function anchorsFor(scan) {
  const seen = new Map();
  const anchors = new Set();
  for (const heading of scan.headings) {
    const slug = githubSlug(heading.text);
    const count = seen.get(slug) ?? 0;
    anchors.add(count === 0 ? slug : `${slug}-${count}`);
    seen.set(slug, count + 1);
  }
  return anchors;
}

/** Relative links in a file, resolved to repo-relative paths. */
export function relativeLinks(model, file) {
  const scan = model.scan(file);
  return scan.links
    .filter(({ target }) => !EXTERNAL.test(target))
    .map(({ target, line }) => {
      const [rawPath, fragment = ''] = target.split('#');
      const decoded = decodeURI(rawPath);
      const resolved = rawPath ? path.posix.normalize(path.posix.join(path.posix.dirname(file), decoded)) : file;
      return { target, line, resolved, fragment };
    });
}

export default {
  id: 'links',
  docRef: 'CONTRIBUTING.md',
  description: 'Relative Markdown links (outside code fences) resolve to an existing file or folder, and #anchors match a heading.',
  check(model) {
    const out = [];
    for (const file of model.markdownFiles()) {
      for (const link of relativeLinks(model, file)) {
        if (link.resolved.startsWith('..')) {
          out.push({ file, line: link.line, msg: `link '${link.target}' points outside the repository` });
          continue;
        }
        if (!model.exists(link.resolved)) {
          out.push({ file, line: link.line, msg: `broken link '${link.target}' (no such file or folder)` });
          continue;
        }
        if (link.fragment && link.resolved.endsWith('.md')) {
          const anchors = anchorsFor(model.scan(link.resolved));
          if (!anchors.has(link.fragment.toLowerCase())) {
            out.push({ file, line: link.line, msg: `link '${link.target}' has no matching heading anchor '#${link.fragment}'` });
          }
        }
      }
    }
    return out;
  },
};
