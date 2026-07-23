#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRM_ANALYSIS_DIR="$ROOT_DIR/skills/crm-analysis"
ROUTER_MD="$CRM_ANALYSIS_DIR/references/question_router.md"
ROUTER_YAML="$CRM_ANALYSIS_DIR/references/router_contract.yaml"
HUBSPOT_DICT="$CRM_ANALYSIS_DIR/references/hubspot_properties.md"
SALESFORCE_DICT="$CRM_ANALYSIS_DIR/references/salesforce_fields.md"
PROMPT_LIBRARY="$CRM_ANALYSIS_DIR/references/prompt_library.md"

for required in "$ROUTER_MD" "$ROUTER_YAML" "$HUBSPOT_DICT" "$SALESFORCE_DICT" "$PROMPT_LIBRARY"; do
  if [[ ! -f "$required" ]]; then
    echo "ERROR: Missing required file: $required" >&2
    exit 1
  fi
done

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

PARSER_BACKEND=""

echo "1) Validating router YAML syntax..."
if command -v python3 >/dev/null 2>&1 && python3 -c "import yaml" 2>/dev/null; then
  python3 -c "import yaml, sys; yaml.safe_load(open(sys.argv[1]))" "$ROUTER_YAML" >/dev/null
  PARSER_BACKEND="python"
elif command -v ruby >/dev/null 2>&1; then
  ruby -ryaml -e 'YAML.load_file(ARGV[0])' "$ROUTER_YAML" >/dev/null
  PARSER_BACKEND="ruby"
else
  echo "ERROR: YAML validation requires python3 (with PyYAML) or ruby." >&2
  exit 1
fi

echo "2) Comparing strict intent IDs between markdown and YAML..."
awk -F'`' '/^- `id`: `/{print $4}' "$ROUTER_MD" | sort -u > "$TMP_DIR/md_ids.txt"
awk '
/^intents:/ {in_intents=1; next}
/^exploratory_paths:/ {in_intents=0}
in_intents && /^  - id: / {print $3}
' "$ROUTER_YAML" | sort -u > "$TMP_DIR/yaml_ids.txt"

if ! diff -u "$TMP_DIR/md_ids.txt" "$TMP_DIR/yaml_ids.txt" >/dev/null; then
  echo "ERROR: Strict intent IDs do not match between question_router.md and router_contract.yaml." >&2
  echo "--- Only in question_router.md ---" >&2
  comm -23 "$TMP_DIR/md_ids.txt" "$TMP_DIR/yaml_ids.txt" >&2 || true
  echo "--- Only in router_contract.yaml ---" >&2
  comm -13 "$TMP_DIR/md_ids.txt" "$TMP_DIR/yaml_ids.txt" >&2 || true
  exit 1
fi

echo "3) Checking for stale path references in canonical files..."
STALE_PATTERN='outboundsync_signals|outboundsync-signals|docs/hubspot_fields\.md|docs/salesforce_fields\.md|docs/prompt_library\.md|SKILL-blue\.md|SKILL-red\.md|openclaw-skills|outboundsync-analysis/'
CANONICAL_FILES=(
  "$ROOT_DIR/README.md"
  "$ROOT_DIR/SECURITY.md"
  "$ROOT_DIR/skills/preflight/SKILL.md"
  "$CRM_ANALYSIS_DIR/SKILL.md"
  "$ROUTER_MD"
  "$ROUTER_YAML"
  "$HUBSPOT_DICT"
  "$SALESFORCE_DICT"
  "$PROMPT_LIBRARY"
)

# Include every skill pack SKILL.md so stale-path hygiene covers new skills.
while IFS= read -r skill_md; do
  already=0
  for existing in "${CANONICAL_FILES[@]}"; do
    if [[ "$existing" == "$skill_md" ]]; then
      already=1
      break
    fi
  done
  if [[ "$already" -eq 0 ]]; then
    CANONICAL_FILES+=("$skill_md")
  fi
done < <(find "$ROOT_DIR/skills" -type f -name 'SKILL.md' -not -path '*/.git/*' | sort)

if grep -n -H -E "$STALE_PATTERN" "${CANONICAL_FILES[@]}" >/dev/null 2>&1; then
  echo "ERROR: Found stale references in canonical files:" >&2
  grep -n -H -E "$STALE_PATTERN" "${CANONICAL_FILES[@]}" >&2
  exit 1
fi

echo "4) Validating every skills/*/SKILL.md (frontmatter, name==folder, description)..."
SKILL_COUNT=0
while IFS= read -r skill_md; do
  SKILL_COUNT=$((SKILL_COUNT + 1))
  skill_dir="$(dirname "$skill_md")"
  folder_name="$(basename "$skill_dir")"

  if [[ ! -f "$skill_md" ]]; then
    echo "ERROR: Missing required skill file: $skill_md" >&2
    exit 1
  fi

  # Require YAML frontmatter delimited by ---
  if ! awk '
    BEGIN { ok=0 }
    NR==1 && $0 == "---" { open=1; next }
    open && $0 == "---" { ok=1; exit }
    END { exit ok ? 0 : 1 }
  ' "$skill_md"; then
    echo "ERROR: $skill_md is missing YAML frontmatter (--- ... ---)." >&2
    exit 1
  fi

  frontmatter_yaml="$TMP_DIR/skill-frontmatter-$SKILL_COUNT.yaml"
  awk '
    NR == 1 && $0 == "---" { in_fm=1; next }
    in_fm && $0 == "---" { exit }
    in_fm { print }
  ' "$skill_md" > "$frontmatter_yaml"

  if [[ "$PARSER_BACKEND" == "python" ]]; then
    if ! python3 -c 'import sys, yaml; data=yaml.safe_load(open(sys.argv[1])); assert isinstance(data, dict)' "$frontmatter_yaml" >/dev/null 2>&1; then
      echo "ERROR: $skill_md has invalid YAML frontmatter." >&2
      exit 1
    fi
  elif ! ruby -ryaml -e 'data=YAML.load_file(ARGV[0]); exit(data.is_a?(Hash) ? 0 : 1)' "$frontmatter_yaml" >/dev/null 2>&1; then
    echo "ERROR: $skill_md has invalid YAML frontmatter." >&2
    exit 1
  fi

  # Extract name: and description: from frontmatter only
  name_val="$(awk '
    BEGIN { in_fm=0 }
    NR==1 && $0 == "---" { in_fm=1; next }
    in_fm && $0 == "---" { exit }
    in_fm && /^name:[[:space:]]*/ {
      sub(/^name:[[:space:]]*/, "")
      gsub(/^[[:space:]]+|[[:space:]]+$/, "")
      gsub(/^["'\'']|["'\'']$/, "")
      print
      exit
    }
  ' "$skill_md")"

  if [[ -z "$name_val" ]]; then
    echo "ERROR: $skill_md is missing a non-empty name: in frontmatter." >&2
    exit 1
  fi
  if [[ "$name_val" != "$folder_name" ]]; then
    echo "ERROR: $skill_md frontmatter name: '$name_val' does not match folder '$folder_name'." >&2
    exit 1
  fi

  # description: must be present and non-empty (plain or block scalar)
  desc_ok="$(awk '
    BEGIN { in_fm=0; found=0; folded=0 }
    NR==1 && $0 == "---" { in_fm=1; next }
    in_fm && $0 == "---" { exit }
    in_fm && /^description:[[:space:]]*[>|][-+]?[[:space:]]*$/ {
      folded=1
      next
    }
    in_fm && /^description:[[:space:]]*.+/ {
      line=$0
      sub(/^description:[[:space:]]*/, "", line)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", line)
      gsub(/^["'\'']|["'\'']$/, "", line)
      if (length(line) > 0) found=1
      next
    }
    folded && in_fm && /^[[:space:]]+/ {
      line=$0
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", line)
      if (length(line) > 0) found=1
      next
    }
    folded && in_fm && /^[^[:space:]]/ { folded=0 }
    END { print (found ? "yes" : "no") }
  ' "$skill_md")"

  if [[ "$desc_ok" != "yes" ]]; then
    echo "ERROR: $skill_md is missing a non-empty description: in frontmatter." >&2
    exit 1
  fi
done < <(find "$ROOT_DIR/skills" -type f -name 'SKILL.md' -not -path '*/.git/*' | sort)

if [[ "$SKILL_COUNT" -lt 1 ]]; then
  echo "ERROR: No skills/*/SKILL.md files found." >&2
  exit 1
fi
echo "   Validated $SKILL_COUNT skill pack(s)."

echo "5) Validating router field references against CRM dictionaries..."
if [[ "$PARSER_BACKEND" == "python" ]]; then
  python3 - "$ROUTER_YAML" "$HUBSPOT_DICT" "$SALESFORCE_DICT" <<'PY'
import re
import sys
import yaml

router_path, hub_path, sf_path = sys.argv[1:4]
router = yaml.safe_load(open(router_path))
hub_text = open(hub_path).read()
sf_text = open(sf_path).read()

hub_fields = set(re.findall(r'`(os_[a-z0-9_]+)`', hub_text))
sf_fields = set(re.findall(r'`([^`]*__c)`', sf_text))

unknown = {'hubspot': set(), 'salesforce': set()}

def walk(obj, crm=None):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ('hubspot', 'salesforce'):
                walk(v, k)
            else:
                walk(v, crm)
    elif isinstance(obj, list):
        for item in obj:
            walk(item, crm)
    elif isinstance(obj, str) and crm:
        if crm == 'hubspot' and obj not in hub_fields:
            unknown['hubspot'].add(obj)
        if crm == 'salesforce' and obj not in sf_fields:
            unknown['salesforce'].add(obj)

for intent in router.get('intents', []):
    for key in ('required_fields', 'fallback_requirements', 'unsupported_conditions', 'optional_fields'):
        walk(intent.get(key), None)

for path in router.get('exploratory_paths', []):
    for key in ('required_signals', 'optional_signals', 'confidence_rules'):
        walk(path.get(key), None)

if unknown['hubspot'] or unknown['salesforce']:
    if unknown['hubspot']:
        print('Unknown HubSpot fields in router contract:')
        for f in sorted(unknown['hubspot']):
            print(f'- {f}')
    if unknown['salesforce']:
        print('Unknown Salesforce fields in router contract:')
        for f in sorted(unknown['salesforce']):
            print(f'- {f}')
    sys.exit(1)
PY
else
  ruby - "$ROUTER_YAML" "$HUBSPOT_DICT" "$SALESFORCE_DICT" <<'RUBY'
require 'yaml'
require 'set'

router_path, hub_path, sf_path = ARGV
router = YAML.load_file(router_path)
hub_text = File.read(hub_path)
sf_text = File.read(sf_path)

hub_fields = hub_text.scan(/`(os_[a-z0-9_]+)`/).flatten.to_set
sf_fields = sf_text.scan(/`([^`]*__c)`/).flatten.to_set
unknown = { 'hubspot' => Set.new, 'salesforce' => Set.new }

walk = nil
walk = lambda do |obj, crm|
  case obj
  when Hash
    obj.each do |k, v|
      if k == 'hubspot' || k == 'salesforce'
        walk.call(v, k)
      else
        walk.call(v, crm)
      end
    end
  when Array
    obj.each { |item| walk.call(item, crm) }
  when String
    next unless crm
    if crm == 'hubspot' && !hub_fields.include?(obj)
      unknown['hubspot'] << obj
    elsif crm == 'salesforce' && !sf_fields.include?(obj)
      unknown['salesforce'] << obj
    end
  end
end

(router['intents'] || []).each do |intent|
  %w[required_fields fallback_requirements unsupported_conditions optional_fields].each do |key|
    walk.call(intent[key], nil)
  end
end

(router['exploratory_paths'] || []).each do |path|
  %w[required_signals optional_signals confidence_rules].each do |key|
    walk.call(path[key], nil)
  end
end

if !unknown['hubspot'].empty? || !unknown['salesforce'].empty?
  unless unknown['hubspot'].empty?
    warn 'Unknown HubSpot fields in router contract:'
    unknown['hubspot'].to_a.sort.each { |f| warn "- #{f}" }
  end
  unless unknown['salesforce'].empty?
    warn 'Unknown Salesforce fields in router contract:'
    unknown['salesforce'].to_a.sort.each { |f| warn "- #{f}" }
  end
  exit 1
end
RUBY
fi

echo "6) Validating prompt registry mode and mapping contract..."
awk -F'|' '
/^[|] [A-Z]{2}-[0-9]{2} [|]/ {
  id=$2; mode=$3; mtype=$4; mapping=$5;
  gsub(/^[ \t]+|[ \t]+$/, "", id);
  gsub(/^[ \t]+|[ \t]+$/, "", mode);
  gsub(/^[ \t]+|[ \t]+$/, "", mtype);
  gsub(/^[ \t]+|[ \t]+$/, "", mapping);
  print id "\t" mode "\t" mtype "\t" mapping;
}' "$PROMPT_LIBRARY" > "$TMP_DIR/prompt_rows.tsv"

if [[ ! -s "$TMP_DIR/prompt_rows.tsv" ]]; then
  echo "ERROR: No prompt registry rows found in prompt_library.md." >&2
  exit 1
fi

awk '
/^exploratory_paths:/ {in_paths=1; next}
in_paths && /^[^ ]/ {in_paths=0}
in_paths && /^  - id: / {print $3}
' "$ROUTER_YAML" | sort -u > "$TMP_DIR/exploratory_ids.txt"

SEEN_PROMPT_IDS="$TMP_DIR/seen_prompt_ids.txt"
: > "$SEEN_PROMPT_IDS"
while IFS=$'\t' read -r prompt_id mode mapping_type mapping; do
  if [[ -z "$prompt_id" || -z "$mode" || -z "$mapping_type" || -z "$mapping" ]]; then
    echo "ERROR: Prompt registry row is missing required metadata: $prompt_id|$mode|$mapping_type|$mapping" >&2
    exit 1
  fi

  if grep -Fxq "$prompt_id" "$SEEN_PROMPT_IDS"; then
    echo "ERROR: Duplicate prompt id in prompt library: $prompt_id" >&2
    exit 1
  fi
  echo "$prompt_id" >> "$SEEN_PROMPT_IDS"

  case "$mode" in
    strict|exploratory) ;;
    *)
      echo "ERROR: Invalid mode '$mode' for prompt '$prompt_id'." >&2
      exit 1
      ;;
  esac

  case "$mapping_type" in
    intent_id|exploratory_path|category) ;;
    *)
      echo "ERROR: Invalid mapping type '$mapping_type' for prompt '$prompt_id'." >&2
      exit 1
      ;;
  esac

  if [[ "$mapping_type" == "intent_id" ]] && ! grep -Fxq "$mapping" "$TMP_DIR/yaml_ids.txt"; then
    echo "ERROR: Prompt '$prompt_id' references unknown strict intent '$mapping'." >&2
    exit 1
  fi

  if [[ "$mapping_type" == "exploratory_path" ]] && ! grep -Fxq "$mapping" "$TMP_DIR/exploratory_ids.txt"; then
    echo "ERROR: Prompt '$prompt_id' references unknown exploratory path '$mapping'." >&2
    exit 1
  fi

  if [[ "$mode" == "strict" ]] && [[ "$mapping_type" == "exploratory_path" ]]; then
    echo "ERROR: Exploratory-only prompt '$prompt_id' cannot be marked strict." >&2
    exit 1
  fi

  if [[ "$mode" == "strict" ]] && grep -Fxq "$mapping" "$TMP_DIR/exploratory_ids.txt"; then
    echo "ERROR: Prompt '$prompt_id' maps to exploratory path '$mapping' but is marked strict." >&2
    exit 1
  fi
done < "$TMP_DIR/prompt_rows.tsv"

echo "PASS: Router contract, semantic field checks, and prompt registry checks succeeded."
