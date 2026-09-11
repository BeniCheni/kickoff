#!/usr/bin/env bash
set -euo pipefail

# Runs only from the trusted main publication path. Never deploy a PR branch.
SYNC_REPOSITORY=${GITHUB_REPOSITORY:?}
SYNC_MAIN_SHA=$(gh api "repos/$SYNC_REPOSITORY/commits/main" --jq .sha)
if [[ ! "$SYNC_MAIN_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo '::error::Could not resolve main to a commit; no deployment requested.'
  exit 1
fi
SYNC_PAGES_SHA=$(gh run list --repo "$SYNC_REPOSITORY" --workflow pages.yml --branch main --status success --limit 1 --json headSha --jq '.[0].headSha // empty')
if [ "$SYNC_MAIN_SHA" = "$SYNC_PAGES_SHA" ]; then
  echo "Pages already has main at $SYNC_MAIN_SHA."
else
  gh workflow run pages.yml --repo "$SYNC_REPOSITORY" --ref main
  echo "Pages deployment requested for main (observed $SYNC_MAIN_SHA); dispatch is not deployment confirmation."
fi
