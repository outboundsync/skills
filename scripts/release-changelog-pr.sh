#!/usr/bin/env bash
# Lands the CHANGELOG.md promotion (written by `release-calver.mjs --apply`) on
# main after the CalVer Release workflow has published the tag.
#
# The promotion never pushes to main directly (that would break the day main
# gets branch protection). It goes through a short-lived PR:
#   1. commit CHANGELOG.md on release/changelog-<tag> (rebased onto main if
#      main moved; a conflict fails loudly instead of mis-filing notes);
#   2. push the branch and open the PR;
#   3. squash-merge it (pinned with --match-head-commit) as soon as GitHub
#      reports it mergeable.
#
# GitHub does not start `pull_request` workflows for PRs opened with
# GITHUB_TOKEN, and `validate` checks from workflow_dispatch runs do not count
# toward required checks. So:
#   - With RELEASE_PR_TOKEN set (a long-lived token limited to this repo with
#     contents + pull requests write, e.g. a fine-grained PAT; GitHub App
#     installation tokens expire after an hour, so they can't be stored here),
#     the push and PR use that token and Validate runs as a normal
#     pull_request check before the merge.
#   - Without it, the PR is opened with GITHUB_TOKEN. If main has no required
#     checks, GitHub reports it mergeable and it merges right away. If main
#     requires checks, the PR stays BLOCKED and is left open with a warning: a
#     maintainer closes and reopens it (which runs Validate) and merges it.
#
# No loop: the merge subject `chore(release): CHANGELOG for <tag> (#N)` matches
# RELEASE_COMMIT_PATTERN, so the release run that follows a human merge finds
# no releasable commits; a merge by GITHUB_TOKEN starts no workflow at all.
#
# Env: TAG, RELEASE_SHA, REPO, GH_TOKEN (GITHUB_TOKEN), optional
# RELEASE_PR_TOKEN. Run from the release checkout with CHANGELOG.md modified
# and git user.name / user.email set.
set -euo pipefail

: "${TAG:?TAG is required}"
: "${RELEASE_SHA:?RELEASE_SHA is required}"
: "${REPO:?REPO is required}"
: "${GH_TOKEN:?GH_TOKEN is required}"

branch="release/changelog-${TAG}"
subject="chore(release): CHANGELOG for ${TAG}"
wait_seconds="${VALIDATE_WAIT_SECONDS:-900}"
pr_token="${RELEASE_PR_TOKEN:-}"

git switch --quiet -c "$branch"
git add CHANGELOG.md
git commit --quiet -m "$subject"

git fetch --quiet origin main
if [ "$(git rev-parse origin/main)" != "$RELEASE_SHA" ]; then
  echo "main moved past ${RELEASE_SHA}; rebasing the CHANGELOG commit onto origin/main."
  if ! git rebase --quiet origin/main; then
    git rebase --abort
    echo "::error::CHANGELOG promotion for ${TAG} conflicts with newer commits on main. Move the ${TAG} notes by hand in a PR."
    exit 1
  fi
fi
head_sha="$(git rev-parse HEAD)"

body="Automated by the CalVer Release workflow: move the \`## Unreleased\` notes into \`## [${TAG}]\`."
if [ -n "$pr_token" ]; then
  # Push and open the PR as the release token so the pull_request Validate run starts.
  auth="$(printf 'x-access-token:%s' "$pr_token" | base64 | tr -d '\n')"
  echo "::add-mask::${auth}"
  # An empty value resets the checkout's GITHUB_TOKEN header before adding ours.
  git -c "http.https://github.com/.extraheader=" -c "http.https://github.com/.extraheader=AUTHORIZATION: basic ${auth}" \
    push --quiet origin "HEAD:refs/heads/${branch}"
  pr_url="$(GH_TOKEN="$pr_token" gh pr create --repo "$REPO" --base main --head "$branch" \
    --title "$subject" --body "${body} It merges itself once \`validate\` passes.")"
else
  git push --quiet origin "HEAD:refs/heads/${branch}"
  pr_url="$(gh pr create --repo "$REPO" --base main --head "$branch" --title "$subject" \
    --body "${body} It merges itself if main has no required checks; otherwise close and reopen it to run \`validate\`, then squash-merge it with the default title.")"
fi
pr_number="${pr_url##*/}"
echo "Opened ${pr_url}"

deadline=$((SECONDS + wait_seconds))
state=""
while [ "$SECONDS" -lt "$deadline" ]; do
  sleep 15
  state="$(gh pr view "$pr_number" --repo "$REPO" --json mergeStateStatus,headRefOid \
    --jq 'if .headRefOid == "'"$head_sha"'" then .mergeStateStatus else "HEAD_MOVED" end')"
  case "$state" in
    CLEAN|HAS_HOOKS|UNSTABLE) break ;;
    BEHIND|DIRTY|HEAD_MOVED) break ;;
    # Without the release token no check will ever start, so BLOCKED is final.
    BLOCKED) [ -z "$pr_token" ] && break ;;
  esac
done

case "$state" in
  CLEAN|HAS_HOOKS|UNSTABLE) ;;
  BLOCKED)
    if [ -z "$pr_token" ]; then
      msg="main requires checks and RELEASE_PR_TOKEN is not set, so CI cannot start on ${pr_url}. Close and reopen it to run validate, then squash-merge it."
      echo "::warning::${msg}"
      if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
        echo "${msg}" >> "$GITHUB_STEP_SUMMARY"
      fi
      exit 0
    fi
    echo "::error::PR #${pr_number} is not mergeable (state 'BLOCKED'). Left open for a maintainer."
    exit 1
    ;;
  *)
    echo "::error::PR #${pr_number} is not mergeable (state '${state:-timeout}'). Left open for a maintainer."
    exit 1
    ;;
esac

gh pr merge "$pr_number" --repo "$REPO" --squash --match-head-commit "$head_sha" \
  --subject "${subject} (#${pr_number})" \
  --body "Move the Unreleased notes into the ${TAG} section."
echo "Merged PR #${pr_number}."

# The bot's own short-lived branch; ignore failure (e.g. already deleted).
gh api -X DELETE "repos/${REPO}/git/refs/heads/${branch}" >/dev/null 2>&1 || true
