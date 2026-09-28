import barGeometry from './bar-geometry.mjs';
import crmAnalysis from './crm-analysis.mjs';
import descriptionStyle from './description-style.mjs';
import disclaimer from './disclaimer.mjs';
import endpointMapConsistent from './endpoint-map-consistent.mjs';
import frontmatter from './frontmatter.mjs';
import links from './links.mjs';
import linksEscapeSkill from './links-escape-skill.mjs';
import metadata from './metadata.mjs';
import outputContract from './output-contract.mjs';
import readmeIndex from './readme-index.mjs';
import scoreMeter from './score-meter.mjs';
import secrets from './secrets.mjs';
import skillsOnlyDocs from './skills-only-docs.mjs';
import stalePaths from './stale-paths.mjs';
import versionBumped from './version-bumped.mjs';
import writeToolsNamed from './write-tools-named.mjs';

export const rules = [
  frontmatter,
  metadata,
  descriptionStyle,
  disclaimer,
  outputContract,
  scoreMeter,
  barGeometry,
  writeToolsNamed,
  endpointMapConsistent,
  links,
  linksEscapeSkill,
  stalePaths,
  secrets,
  skillsOnlyDocs,
  readmeIndex,
  versionBumped,
  ...crmAnalysis,
];
