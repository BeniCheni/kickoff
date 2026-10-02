# PR #138 — Pass 0: the cold-review brief for Moments slice 4, S2–S3 (archived by the PM seat, Thu 1 Oct 2026, TZ=America/New_York)

Pass 0 of the six-pass 360 for "Moments slice 4, S2–S3: permission-gated Play and an acceptance
build — inert until curated" (PR #138, built by Codex, GPT-6 Astra at High). The PM seat read the
PR fresh at about 13:00 EDT:
- open, a draft, MERGEABLE/CLEAN, `verify` green at the head (run `36889856761`);
- head `134f1e35706cdb319751d0650b3a9297490a052f`, three commits: `070a625` (Claude, the docs-only
  spec and build-prompt archive), `75dcb94` (Codex, application, build and tests) and `134f1e3`
  (Codex, probes, receipts and docs);
- 67 files, +2210/−34, on merge base `7636b0871c9a10db53e9a00ad3811cc7093efa6c`, with `main` two
  squashes ahead: `cd6d6ca` (#137, the same three docs paths as `070a625` with identical content)
  and `3b7bb65` (#139, files under `.agents/skills`). Neither touches `src/` or `src/data`;
- no comments and no reviews.

**What the PM seat checked, and what it did not.** It diffed the head against `main`:
`src/curated/moments.json` is `[]`; `package.json` gains one script (`build:acceptance`) and
`.gitignore` one line (`dist-acceptance/`); `src/main.tsx`, `vite.config.ts`, `index.html`,
`src/data` and `.github` are unchanged; among the lines the PR adds, the three historical video
ids appear only in the build prompt's archive and in a test asserting their absence. It read the
receipts' journey list against the spec's S3 list and found every journey present. The committed
log reports 53 files and 738 tests; CI's own log shows the 53 files. It re-ran no browser receipt.
The spec says the cold review re-runs them, so that is Pass 1's job.

**Beni's answers, 1 Oct 2026, first-hand to the PM seat.** The reviewer may push fix commits for
findings it reproduced, the default carried below. He answered ask 5 (a one-page first-edition
source policy, S5.5) yes and ask 6 (the S4 test ids stay separate from the edition ids) yes. He
authorised archiving this brief on a local docs branch, as with the #128 brief.

**The spec is not edited yet, on purpose.** `docs/moments-slice-4-spec.md` still lists asks 5 and 6
as open. PR #138 carries an identical copy of it, so an edit on `main` now would turn the squash
into an add/add conflict. The PM seat records both answers in the spec after #138 merges.

**One thing the PM seat got wrong, recorded at Pass 0.** PR #139 tracked a copy of this skill under
`.agents/skills/kickoff-pr-review/`. The #128 cycle had already recorded that an untracked copy of
that name, with vendor names swapped, is a machine-made artifact of unknown origin and not to be
committed (`docs/moments-player-pass-2-brief.md`, `docs/v0.2.6-ideas.md` Process notes). The copy
names Codex as the Pass 1 reviewer. Its removal or replacement is Beni's pending call and is not
this review's; the brief tells Pass 1 to use the tracked `.claude` skill and leave the copy alone.

The prompt below was delivered in chat for a fresh Claude Code session; this file is the archive.

## Plan status at Pass 0

| Slice | State |
|---|---|
| 1: contracts, queue, saved | Merged `ad9586b`, no release |
| 2: gallery, inert until curated | Merged `1045db0` (#118), no release |
| 3: player host, YouTube adapter, Cinema | Merged `9188cb6` (#128), no release |
| 4: S1 specification | Merged `cd6d6ca` (#137) |
| 4: S2–S3 permission gate, acceptance build, probes | Builder-complete at `134f1e3`, draft PR #138. **Awaiting Pass 1** (Claude Code, Fable 5.1 Extra) |
| 4: S4–S8 | Gated. S4 needs Beni's provider authority, ids named in writing and #138 merged. S5 is optional. S5.5 and S6 follow Beni's yes to ask 5. S7 is a separate publication authority. S8 and the tag are his |

No Moments release number is assigned and the app stays v0.5.2. The 27 Sep–1 Oct rulings stand.

---

/kickoff-pr-review 138 --no-merge

PR #138 — Pass 1 (cold review): Moments slice 4, S2–S3, permission-gated Play and an acceptance build — inert until curated

You are Pass 1 of the six-pass 360 for PR #138 in github.com/BeniCheni/kickoff, running in Claude Code on Fable 5.1 Extra. Codex (GPT-6 Astra, High) built it, and you built none of it. The method is /kickoff-pr-review, which this line invokes; follow its §1–§4 and stop at one PR comment. Pass 1.5 (the PM seat) writes Codex's rebuttal brief from your comment. Beni or his delegate adjudicates and clicks every merge.

STATE AT PASS 0, as the PM seat read it on Thu 1 Oct 2026 at about 13:00 EDT (re-check all of it)

- PR #138 is open, a draft, MERGEABLE and CLEAN. Head 134f1e35706cdb319751d0650b3a9297490a052f on codex/moments-slice-4-acceptance, merge base 7636b0871c9a10db53e9a00ad3811cc7093efa6c, 67 files, +2210/−34. It has no comments or reviews. Do not mark it ready.
- Three commits: 070a625 (Claude, docs only: the slice-4 spec, the build prompt's archive and a one-line pointer in docs/moments-player-plan.md §9), 75dcb94 (Codex, application, build and tests), 134f1e3 (Codex, probes, receipts and docs).
- origin/main is at 3b7bb659eb438625de3368e7470b1a0135f5f8c0, two squashes ahead of the merge base: #137, which landed the same three docs paths as 070a625 with identical content (cd6d6ca), and #139, which added files under .agents/skills. Neither touches src/ or src/data. Do not rebase the PR onto main: the receipts name base 7636b08 and head 134f1e3.
- `verify` is green at the head (run 36889856761). The committed receipts/final-tests.log reports 53 files and 738 tests; the PM seat read that figure from the log, not from CI.
- The PM seat diffed against main and found: src/curated/moments.json is [] at the head; package.json differs by one added script (build:acceptance); .gitignore by one added line (dist-acceptance/); src/main.tsx, vite.config.ts, index.html, src/data and .github are unchanged; among the lines the PR adds, the three historical video ids appear only in the build prompt's archive and in a test asserting their absence. Treat all of that as a claim to re-run.

WHAT BENI RULED, as the spec's Authority section holds it

28–29 Sep 2026: loadVideoById takes the object form with startSeconds; the stage and Cinema boxes are at least 200px tall; the iframe is built on youtube-nocookie.com with allow="autoplay; encrypted-media"; reload-and-seek is labelled last-known recovery, not continuity.

30 Sep 2026: referrerpolicy stays strict-origin-when-cross-origin; "Resuming from the last known position." is accepted, a provider sample of exactly zero must not show it, and a later sample above zero still may; ideas rows 65, 66 and 68 stay deferred.

1 Oct 2026: the first real provider request is loopback-only; a demo edition is in the plan behind its own publication yes; Beni names any video ids in writing; slice 4 stays a non-release until a reader can use Moments.

Asks 5 and 6, answered yes on 1 Oct 2026 after this brief's first draft: a one-page first-edition source policy (S5.5) will precede the edition ids, and the S4 test ids stay separate from the edition ids. They govern S4 to S6, not this PR. docs/moments-slice-4-spec.md still lists them as open; leave it so. The PR carries an identical copy of the spec, and an edit on main now would turn the squash into an add/add conflict, so the PM seat records the answers after the merge. Say in your comment if anything in the PR contradicts either answer. The spec authorises no provider request, no edition in src/curated/moments.json, no staging site, no workflow change, and no version, tag or release.

Judge the builder's code against these; do not re-open them. If you think a ruling produced a defect, say so as a question for Beni, not as a finding against Codex.

GROUND TRUTH — read it fresh

- Run `git fetch origin`, then `git rev-parse origin/codex/moments-slice-4-acceptance` and `git log --oneline 7636b0871c9a10db53e9a00ad3811cc7093efa6c..origin/codex/moments-slice-4-acceptance`. Expect the three commits above. If the head or the range differs, name each extra commit and file in your comment, review the head anyway, and treat the surprise as a finding candidate. Every number you report says which SHA it came from.
- Work in a fresh worktree of the PR branch under a different local branch name, for example `git worktree add <path> -b claude/pr138-review origin/codex/moments-slice-4-acceptance`, then start or restart the session there so the skill is watched. Never use /Users/benicheni/Documents/Claude/Projects/Kickoff, which is Beni's checkout, and never Codex's worktree. Never run npm run sync, and never hand-edit src/data/*.json or src/curated/moments.json.
- In zsh, `$VAR:src` is a history modifier: write "${B}:path" when you `git show` a ref and a path.
- #139 tracked a machine-made copy of this skill under .agents/skills/kickoff-pr-review with vendor names swapped. It names Codex as the Pass 1 reviewer and authors Codex commits as noreply@anthropic.com, and the 29 Sep record (docs/moments-player-pass-2-brief.md) says such a copy is not to be committed. Its fate is Beni's pending call and not yours. Use the tracked .claude/skills/kickoff-pr-review that your slash command loads, and do not read it, edit it or rely on the .agents copy. If an untracked copy appears in your worktree, leave it: `git add` by path, never -A.
- The spec lineage, in precedence order: docs/moments-slice-4-spec.md (controlling; it supersedes §9 of docs/moments-player-plan.md), then docs/moments-architecture.md (Decision 1, Decision 2, the Slice 3 decisions and review resolutions, and the new "Slice 4 implementation decisions (S2)"), then docs/moments-slice-4-build-prompt.md, which is the PM seat's own text. Beni's rulings outrank all three.
- Also read: docs/verification/moments-acceptance/README.md; docs/verification/moments-player/README.md and pass2.md; docs/v0.2.6-ideas.md rows 56–72 and its Process notes tail; and CHANGELOG.md [Unreleased].
- Provider hosts: you may read the IFrame Player API reference as documentation. Nothing you run may request youtube.com, youtu.be, youtube-nocookie.com, ytimg.com, googlevideo.com or ggpht.com; abort those in every browser context you drive, except the two URLs the acceptance stub fulfils locally, and count zero egress as a result.
- Runtime: the builder used Playwright 1.62.1 from /Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs, Google Chrome 154.0.8037.58 at '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', and Node 24.15.0. Record the versions you actually run. The PR body and the README under docs/verification/moments-acceptance carry the archive, build and server setup.
- The Process notes tail of docs/v0.2.6-ideas.md names the dev-server hazards (an IPv6-only localhost, and Vite's reload aborting a headless run); they bind you. Confirm which process owns a port with lsof, and never edit src/ while a run is in flight.

WHERE THE PM SEAT WANTS YOUR ATTENTION — questions, not findings

1. The clock under the permission rule. The PR says the visit owner reads the app's nowUtcIso through one added shared-clock subscription with minute-tick and focus catch-up granularity, and that a direct play() returns before retirement or the reducer. Which now does play() read when it is called: the last tick's value or the clock at that instant? Between an expiry and the next tick, can Play, Retry, Replay or a Next onto that item still start a playback attempt, and is that the spec's "from the next clock tick" or wider? Drive the rig's clock across an expiry by seconds, not only by whole ticks, and across a focus catch-up after a long sleep. Cover an expiry exactly equal to now, checkedAt after now, and the other cases the PR lists. Say what the spec requires and what the code does.

2. The lapse path. The builder chose the existing player-lost route: pause loading or playing, return Cinema to the stage, park the frame inert, keep position, history and queue, hide the player focus stop, and end the current attempt. After a lapse, what can a keyboard and a screen-reader user still reach on that item in the stage, in Cinema if it was open, in the queue and on the gallery card: any Play, Retry, Replay or "Retry player"? Is the source link the primary action, and what status copy shows? Then walk three variants: a lapse while the frame is parked, a lapse while the tab is away, and a permitted neighbour selected next (is the single iframe reused or destroyed, and never reparented?). A stub can show only that the real adapter's pause was called; say that sound and decoding stopping is not verifiable here.

3. Every playability decision. The spec requires one rule at every decision point: MomentsPlayback's identity (the primary control, the secondary source link, PlaybackRecovery), MomentsSessionProvider.play's videoId, and any other the builder finds. Read the whole src/ diff and grep every other consumer of source.identity, videoId, hasEmbedPermission and the adapter: Next and Previous, queue rows, Play again, saved references, the Cinema bar, gallery cards, fallbacks. Is there any path to the adapter, or to a player affordance, that skips the rule? Prove it by mutation: bypass the rule at one site at a time, show a test goes red, then restore.

4. The acceptance build's isolation and its validation. Re-run docs/verification/moments-acceptance/check-build-isolation.mjs, then try to break the claim your own way: another environment variable name, a leftover dist-acceptance, npm run build after npm run build:acceptance, vite build --mode acceptance, a relative or symlinked replacement path, .env files. Does build:acceptance touch anything tracked? Then the part the PM seat could not settle from the PR body: the script validates the edition with parseMoments against git show HEAD:src/data/fixtures.json, yet the six acceptance fixtures are copied from snapshot 1fad3427dfeeeae4a642b6996fe1a114f4640d63 and asserted absent from the current snapshot. What does parseMoments actually cross-check for an item whose fixture is not in the snapshot it validates against? Is acceptance validation weaker than the check that will guard a real edition, and does the PR say so? Does the script fail closed without git history?

5. The acceptance edition. Six selections: two permitted, one identity without permission, one denied, one expired, one legacy link-only; five fictional 11-character ids. Confirm that no historical id (pkEpLtePJm0, iBuTEywEQ6U, sXAkBsEcXSo) appears in the edition or in any permission record, and that every basis says the record is fictional. Then look for a time bomb: the permitted items need an expiry that stays ahead of whatever clock the journeys and tests use, and the expired item one that stays behind it. Move the system clock, or the rig's clock, a year ahead and see what turns red.

6. What a green stub proves. real-adapter.mjs fulfils the IFrame API from youtube-stub.js and the nocookie frame URLs with an empty document, blocks every other provider match and DNS, and runs a ready-time and a construction-time variant. The builder says the stub's states are synchronous and its seeks exact. Read the stub against the API reference: which parts of the adapter's reload-and-seek, onReady, state changes and error handling can this stub not exercise, so that S4 stays the first real test? Break the adapter two ways (drop startSeconds; apply the seek before ready) and show the receipt goes red for each, then restore. The receipt's README opens with "A green stub is not playback"; check that nothing else in the PR or the CHANGELOG claims more.

7. Re-run the receipts. S3 says the cold review re-runs them. From one data snapshot, at base 7636b08 and tip 134f1e3: the 1,260-cell player matrix, the six checker mutations, the 72-cell inert comparison, the 180-box layout comparison, the real-adapter runs (72 runs, 324 checkpoints), the permission red and green (16 fail and 1 pass at 070a625, 17 pass at 75dcb94) and the isolation check. Name every difference from the builder's counts. The PR says the old inert checker gained the full provider predicate and an initial viewport with no assertion weakened: diff it, and run main's unmodified version of each checker against the tip as well. Was one checker version run against both base and tip? What does the one passing test at 070a625 prove?

8. Production inertness, the claim that must hold. With src/curated/moments.json at [], the interface must equal main's: body text, element boxes, requests, timers. The PR adds a module and a clock subscription on the production path. Does an empty-edition production bundle behave any differently from main's, including at the shared wrapper from slice 3? Is the bundle diff against main explained by the rule module and nothing else? Scan dist and dist-single for acceptance ids and markers yourself. Compare Fixtures and Table, which are the betting pipeline's Step 0 source, at 390 and about 1000 across every lens and theme, with ?only= and &date= untouched. Say what the inert receipt cannot see.

9. Tests and data honesty. Confirm that no assertion in the test diff is removed or weakened (git diff 7636b08...HEAD -- tests, reading every minus line), that tests/moments.test.ts still pins the empty edition, and that the permissive rule the harness and DOM tests inject cannot reach production (src/main.tsx passes neither prop). Check that each test named for a claim can fail that claim.

10. Rows 71 and 72: reproduce and scope; do not fix them here. Row 71: after stage, Cinema, stage at 360, an immediate Next click dispatched no pointer or click event to the parent and left the first selection active, and the builder says UNSETTLED=1 reproduces that diagnostic. Row 72: at 360 Ledger light the phone stage wraps Pause as "Paus" and "e" beside the long source link and Save reference, with scrollWidth still equal to innerWidth. For each, reproduce at base and tip with the smallest reproduction, say whether it is a harness artifact or something a reader can hit, whether it is reachable while the edition is empty, and when it becomes reachable. Rank each against S7, the first populated edition. If you think a fix is owed before S7, say which seat should build it and what Beni must decide first; row 72's remedy is a layout decision at 360, the jury width.

11. Docs and claims. Read the CHANGELOG [Unreleased] entry and the PR body against the evidence, for example "without entering either production build". Does the new "Slice 4 implementation decisions (S2)" section state each call's cost, including the lapse choice the spec asked to be recorded and tested? Rows 65, 66 and 68 must be unchanged and still deferred; confirm the PR resolves none of them silently. Squashing rewrites every SHA the receipts and the PR body cite (070a625, 75dcb94, 134f1e3); say in one line what a reader of main will and will not be able to resolve. Anything real and out of scope goes into docs/v0.2.6-ideas.md as new rows after row 72, with a dated Process-notes entry; do not renumber.

BOUNDARIES

- Your first added commit is this brief's archive: docs/moments-slice-4-review-prompt.md and its three docs/README.md index rows. It is the tip of the local branch claude/moments-slice-4-review-brief, whose parent is origin/main at 3b7bb65 and which touches only docs, so `git cherry-pick claude/moments-slice-4-review-brief` applies to the PR branch without a conflict (the PR does not touch docs/README.md). If you cannot reach the branch, say so and skip it. The commit moves the PR head off 134f1e3; the receipts keep naming 134f1e3, and the builder's code at that SHA is what you review. Name the new head and say which numbers came from which SHA.
- Fix commits are allowed only for findings you reproduced, authored as Claude with `git -c user.name=Claude -c user.email=noreply@anthropic.com commit`, with typecheck and test green at each. After any change under src/, scripts/ or tests/, re-run the receipts that touch it and say which. List every fix commit in your comment, because the branch then moves under Codex's Pass 2. Push only fast-forwards, with `git push origin HEAD:codex/moments-slice-4-acceptance` after re-checking the remote tip. Never force.
- A finding about the spec is routed to Beni as a question; do not edit docs/moments-slice-4-spec.md.
- No merge, no ready-for-review, no label, no version bump, no CHANGELOG version section, no tag, no rebase, no workflow dispatch, no provider request. Leave PR #139 and every other branch alone.
- The diff touches src/, so run the skill's §4 matrix: 360, 375, 390 and about 1000, every lens by theme by tab, viewport set before every capture, and scrollWidth equal to innerWidth checked. 390 is the judge, 360 the jury.
- Name what you did not verify: real provider playback, rights, ads, readiness duration, nearest-keyframe seeking, one-press autoplay, real iframe attribute retention, parked decoding, the Pages Referer and error 153, physical devices, Safari and Firefox, screen-reader speech, browser zoom, Android and iOS Back, CloseWatcher. Name anything else you skipped.
- The comment follows pr-comment.md's table shape and ends with a verdict on mergeability at the tip, the questions only Beni can answer (one word each), the exact tip SHA and its verify run, and the list of your fix commits, if any.

SEALED APPENDIX — the builder's claims. Verify each independently; none of them is a conclusion.

- Typecheck and the full suite are green at each commit: base 720 tests in 51 files; application and final 738 in 53.
- Permission red and green: at 070a625, 16 fail and 1 passes; at 75dcb94, all 17 pass. Red tests ran in disposable archives, never as a red commit.
- Player matrix: base and tip each 1,260 cells, 404 journeys and 17 captures, with zero errors and zero provider attempts. All six mutations went red at their intended assertion at both.
- Inert comparison: 72 of 72 equal body text and advisory PNGs; 144 overflow-free loads; zero media, errors or provider attempts. Layout comparison: 180 of 180 equal element-box lists and URLs, no overflow.
- Real adapter against the local stub: 72 runs and 324 checkpoints, both variants at 360, 390 and 1000, 138 locally fulfilled provider-shaped requests, zero provider egress. Player loss comes from a one-shot browser layout fault at Cinema entry.
- Isolation: production and single-file scans are empty under poisoned edition variables; explicit acceptance mode cannot substitute under the production scripts; a replacement edition works; invalid schema or fixture input fails before bundling.
- Environment: Chrome 154.0.8037.58, Playwright 1.62.1, Node 24.15.0, headless, DPR 1, reduced motion; one npm ci; frozen base and tip archives; separate production, harness and acceptance ports.
- No change to the authority rulings, rows 65, 66 and 68, workflows, generated data, dependencies, the root README or the version. There was no provider request, merge, tag or workflow dispatch.
- Not verified, by the builder's own list: real provider playback, content and rights, ads, readiness duration, nearest-keyframe seeking, one-press autoplay, real iframe attribute retention, parked decoding, Pages Referer and error 153, physical devices, Safari and Firefox, screen-reader speech, browser zoom, Android and iOS Back, CloseWatcher, and exhaustive rapid-navigation timing.
