#!/usr/bin/env bash
set -euo pipefail

SYNC_REPOSITORY=${GITHUB_REPOSITORY:?}
SYNC_PR=${SYNC_PR_NUMBER:?}
SYNC_EXPECTED_HEAD=${SYNC_HEAD_SHA:?}

record_delivery() {
  echo "delivery=$1" >> "$GITHUB_OUTPUT"
  echo "delivery_detail=$2" >> "$GITHUB_OUTPUT"
}

fail_merge_unconfirmed() {
  record_delivery merge_unconfirmed "$1"
  exit 1
}

fail_delivery() {
  record_delivery delivery_failed "$1"
  exit 1
}

# CI normally takes minutes. A timeout fails visibly; the next real sync's recovery
# check will deploy any merge that happened later. No dispatch before observed merge.
for ((SYNC_ATTEMPT=0; SYNC_ATTEMPT<60; SYNC_ATTEMPT++)); do
  SYNC_STATE=$(gh pr view "$SYNC_PR" --repo "$SYNC_REPOSITORY" --json state,headRefOid --jq '[.state,.headRefOid] | @tsv')
  IFS=$'\t' read -r SYNC_STATUS SYNC_ACTUAL_HEAD <<< "$SYNC_STATE"
  if [ "$SYNC_ACTUAL_HEAD" != "$SYNC_EXPECTED_HEAD" ]; then
    fail_merge_unconfirmed "The sync PR head changed from $SYNC_EXPECTED_HEAD; the expected snapshot is unconfirmed."
  fi
  case "$SYNC_STATUS" in
    MERGED)
      bash scripts/ensure-pages.sh || fail_delivery "The snapshot is on main at ${SYNC_EXPECTED_HEAD}, but the Pages request failed; the live site may lag behind main."
      record_delivery merged "Published snapshot ${SYNC_EXPECTED_HEAD} and requested a Pages deployment for main."
      exit 0
      ;;
    CLOSED) fail_merge_unconfirmed 'The sync PR closed without merging.' ;;
    OPEN) sleep 10 ;;
    *) fail_merge_unconfirmed "Unrecognised sync PR state: ${SYNC_STATUS}." ;;
  esac
done

fail_merge_unconfirmed 'Sync merge was not observed within ten minutes. Check the PR; the next real sync retries Pages delivery for main.'
