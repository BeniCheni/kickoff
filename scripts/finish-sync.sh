#!/usr/bin/env bash
set -euo pipefail

SYNC_REPOSITORY=${GITHUB_REPOSITORY:?}
SYNC_PR=${SYNC_PR_NUMBER:?}
SYNC_EXPECTED_HEAD=${SYNC_HEAD_SHA:?}
# CI normally takes minutes. A timeout fails visibly; the next real sync's recovery
# check will deploy any merge that happened later. No dispatch before observed merge.
for ((SYNC_ATTEMPT=0; SYNC_ATTEMPT<60; SYNC_ATTEMPT++)); do
  SYNC_STATE=$(gh pr view "$SYNC_PR" --repo "$SYNC_REPOSITORY" --json state,headRefOid --jq '[.state,.headRefOid] | @tsv')
  IFS=$'\t' read -r SYNC_STATUS SYNC_ACTUAL_HEAD <<< "$SYNC_STATE"
  if [ "$SYNC_ACTUAL_HEAD" != "$SYNC_EXPECTED_HEAD" ]; then
    echo '::error::The sync PR head changed; refusing to claim this snapshot merged.'
    exit 1
  fi
  case "$SYNC_STATUS" in
    MERGED) bash scripts/ensure-pages.sh; exit 0 ;;
    CLOSED) echo '::error::The sync PR closed without merging.'; exit 1 ;;
    OPEN) sleep 10 ;;
    *) echo '::error::Unrecognised sync PR state.'; exit 1 ;;
  esac
done
echo '::error::Sync merge was not observed within ten minutes. Check the PR; the next real sync retries Pages delivery for main.'
exit 1
