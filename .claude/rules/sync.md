---
paths:
  - ".github/workflows/sync.yml"
  - "scripts/*sync*"
  - "scripts/diff.ts"
  - "scripts/publish-gate.ts"
  - "scripts/ensure-pages.sh"
  - "scripts/validate.ts"
  - "scripts/window.ts"
  - "scripts/providers/**"
  - "src/data/**"
  - "docs/sync-digest.md"
---

# Scheduled sync (v0.2.0, amended v0.2.2)

Moved out of `CLAUDE.md` on 19 Nov 2026, unchanged, so only the sessions that need it load it.


**Since v0.2.5, fixtures + standings are one authoritative snapshot boundary.** A fetch or
validation failure in either aborts with exit 2 before snapshot writes. A standings outage
intentionally delays otherwise valid fixtures; the earlier soft-failure exception is retired.
Future ancillary datasets do not join this boundary automatically. `standings=failed` remains
a legacy report value understood by the merge policy below; current failures abort instead.
A fetch or validation failure produces a red `sync.yml` run and diagnostics in Actions, but
creates or updates no sync PR, label or commit; an existing PR is left as it was. (Since
v0.4.0 a run can also end red *after* publishing — see Pages delivery below.) Step 0's re-read of the same
committed app cannot discover a fixture change withheld during a standings outage. The header
stamp and the 24/72-hour banner report snapshot age, not failed checks; there is no failure
signal in the app or Step 0's PR queue. A later successful run, including a quiet verification, can propose an
update, and the app advances only when that update merges. PR #23's Pass 2 recommended
blocking release until failure runs have an explicit reader; see the proposal's review
resolutions.

Since v0.4.1, a red run says which half failed: **DATA FAILED** means nothing was published
(fetch, validation, verify, digest, commit or PR creation failed); **MERGE UNCONFIRMED** means
a snapshot PR exists but was not seen merged; **DELIVERY FAILED** means the snapshot is on main
but its Pages request failed, so the live site may lag.

**Adjudicated 5 Sep 2026 (Beni).** The boundary ships as built; the reader is a *procedure*, not
an app component, and it lives in `../Sportsbooks/CLAUDE.md` ("Check the sync run succeeded BEFORE
trusting the app") — that is the owning copy, do not restate the rule here. In short: before any
Step 0 that a position depends on, confirm the latest `sync.yml` run on `main` succeeded; a failed
run means every open position gets independent primary-source re-verification rather than a re-read
of this app. The basis for deferring the built reader: 30 sync runs since 1 Sep 2026, zero
failures — an in-product surface would be designed against an event with no observed base rate.
`docs/v0.2.6-ideas.md` row 15 holds that work until the rate justifies it.

`.github/workflows/sync.yml` runs `npm run sync` on two crons, both every day:
`23 1,7,13,19 * * *` and `23 11,12,14-18,20-23 * * *`. That is a four-slot backbone plus an
hourly window across the rest of the day, *as scheduled* — the day list that once narrowed
that window to "match days" was dropped in the PR #183 review, because the snapshot itself
holds hundreds of future Thursday kickoffs and dozens of Monday ones. GitHub's cron is UTC
and does not follow DST, so the window sits an hour earlier once EST starts. What is
scheduled is not what is delivered: GitHub's cron has run up to about four hours late here,
so runs may bunch or go missing, and no copy in this repo promises an interval. A run opens
or updates one rolling PR (`sync/scheduled` → `main`) only when the diff reports a change,
or when the snapshot committed on `main` is 20 hours old or older — measured on that commit,
never on the file the run has just written. A quiet check inside that window fetches and
stays green; it opens no PR. The workflow never pushes straight to `main`.

**Every sync PR this workflow opens, including a quiet refresh of a snapshot 20 hours old
or older, merges after `verify` is green.** The
`mergeVerdict` in `scripts/diff.ts` still reports `hold` when anything is urgent (inside
−6 h..+72 h, or a postponement, cancellation, suspension, abandonment, or result/team
correction at any horizon, a change from one final status to another included), or when any
`DISAPPEARED` or `HOME_AWAY_INVERTED` line appears at any horizon; it reports `auto` otherwise. This is a
reader-facing signal in the PR report, not a release gate. The legacy `standings=failed`
report remains visible for compatibility, although current standings failures exit 2 before
any report or PR update. The workflow uses `gh pr merge --squash --auto`, gated by the
rulesets' required `verify` check; it needs the repo's "Allow auto-merge" setting on, else
the PR is left open with a warning and the run ends red when `scripts/finish-sync.sh`'s
ten-minute wait for the merge expires. **This is not a pausable path.** `hold: human` is a dead
label the workflow no longer writes or reads — PR #27 merged carrying it — so re-adding it to
a sync PR does nothing. Closing the PR by hand stops *that* PR only: the next run re-runs the
sync against `main`, finds the same diff, force-pushes the rolling branch and opens a **new**
PR that merges itself, so a close buys one cron interval, not a hold. The only durable stops
are repo-level: turn off "Allow auto-merge" (the run warns, leaves the PR open and ends red
after the ten-minute merge wait — every run until it is turned back on, which the Sportsbooks
failed-run check reads as a failure; `docs/v0.2.6-ideas.md` row 48) or disable the `sync.yml`
workflow. Deciding a snapshot must not land is therefore a repo-settings act,
not a PR act; a per-PR pause that survives the next run is `docs/v0.2.6-ideas.md` row 24.

**The Step 0 contract with the betting pipeline:** a merged sync PR is not evidence that a
fixture change was read. Before relying on the app for an open position, re-read the app and
independently verify every DATE_MOVED / TIME_CHANGED / HOME_AWAY_INVERTED / STATUS_CHANGED /
DISAPPEARED / RESULT_CHANGED / TEAM_CHANGED / TEAM_RENAMED line relevant to that position.
The report remains the audit trail for urgent and structural changes, but CI-green generated
snapshots merge without a manual release action.

Mechanics that have not changed: `workflow_dispatch` (with a `dry_run` input mapped to
`npm run sync -- --check`) tests the workflow without waiting for the schedule, and its
summary now states the verdict the run would have obeyed. Needs the repo's "Allow GitHub
Actions to create and approve pull requests" setting on (enabled 2026-09-01) — no secret, no
PAT. A real run publishes the generated fixture, meta and standings snapshot through
`sync/scheduled` when the diff reports a change, or when the snapshot committed on `main` is
20 hours old or older (including `changed=false` with `standings=unchanged` on that refresh).
A quiet check inside 20 hours fetches, reports, and stops; the run is green and the header
stamp does not move. A legacy `standings=failed` report fails closed. Quiet commits, when
they do publish, say `sync: verified unchanged` and carry the full report line; all three
generated files move together to preserve the snapshot boundary and rolling-window counts.
A failed or dry run publishes nothing. The header stamp advances after a publishing PR
merges and Pages deploys, or a local checkout pulls. The schedule does not promise a
delivery interval. `STATUS_SUSPENDED`, `STATUS_ABANDONED`, `STATUS_FINAL_AET` and
`STATUS_FINAL_PEN` are stored statuses (`suspended`, `abandoned`, `after_extra_time`,
`after_penalties`). Every other unmapped ESPN status still aborts the snapshot with exit 2
before any write. `STATUS_SHOOTOUT`, and any in-progress extra-time or shootout name, stay
unmapped until a receipt shows them.

`docs/sync-digest.md` keeps the latest 30 change-bearing reports on main, with bounded
excerpts and full Actions-log links. It is generated in the snapshot PR, so proposed entries
are not published on main until their snapshot merges. Quiet checks add no entry. Older
entries remain in Git history; Actions log availability follows repository retention.
The digest records changes, never an acknowledgement that anyone read them.

GitHub suppresses push workflows for bot-token merges. `scripts/finish-sync.sh` waits up to
ten minutes for the expected PR head to merge, then `scripts/ensure-pages.sh` dispatches
`pages.yml` on main if the latest successful Pages run is behind. An unconfirmed merge or
failed dispatch fails the run visibly. The next real sync also attempts recovery before
fetching; recovery failure alone does not prevent the fresh fetch. Dispatch is not proof of
deployment: check the Pages run and live header. Real publication is restricted to main;
feature-branch dispatches use `dry_run=true`.

The bot's PR does trigger
`ci.yml`'s `pull_request` run, but GitHub holds it for approval (github-actions[bot] is not
a collaborator) and the merge box counts only that run — a `workflow_dispatch` check on the
same SHA never appears — so `sync.yml` approves the held run itself through the Actions API
right after opening or updating the PR (proved hands-off on PR #9, 2 Sep 2026; the fork-PR
approval policy setting made no difference).
