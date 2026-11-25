# PR #382 — Pass 1 of the 360 for B2, the tier labeler: the cold-review brief (archived Tue 24 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) at about 1:05 PM EST on Tue 24 Nov 2026. Codex
opened draft #382 at `ac7e05e` from `docs/tier-labeler-implementation-prompt.md`, the brief
archived at `8491dd4` on `claude/tier-labeler-archive`. This is Pass 0 of the 360 cycle in
`/kickoff-pr-review`.

The PR is **Tier 3**, because it adds `.github/workflows/tier.yml` and edits `AGENTS.md`. Codex
built it, so the review follows the README's "When Codex builds" column:
- Passes 0 and 1.5: the PM seat.
- Pass 1: a fresh Claude Code session on `claude-fable-5-2` at `xhigh`, report-only. Beni starts
  it.
- Pass 2 and the fix rounds: Codex on `gpt-6.2-sol` at `xhigh`.
- Pass 2.5: a fresh Claude Code session on `claude-opus-5-5` at `xhigh`, writing nothing.
- Pass 3: Beni.

What the PM seat found at 12:55 PM EST:
- Two commits on `86155da`. `907b208` (author Claude) is the brief, and `git diff --quiet
  8491dd4 907b208` holds. `ac7e05e` (Codex) is the build.
- 13 files, +1,018/−4.
- `verify`, `tier`, Vercel, Vercel Preview Comments and `vercel-smoke` are SUCCESS. The PR is
  CLEAN and MERGEABLE, still a draft, with no label.
- `main` has not moved from `86155da`.

The PM seat read the workflow, `scripts/tier.ts`, the `AGENTS.md` and `README.md` diffs, the PR
body and the labeler run's log. It ran no test and no smoke pass.

The worktree exists: `git worktree add --detach /Users/benicheni/code/kickoff-pr382-review
ac7e05e…` ran at 12:55 PM EST. Delivered in chat in a four-backtick fenced block, one line per
paragraph. This copy is the archive.

```bash
cd /Users/benicheni/code/kickoff-pr382-review && claude --model claude-fable-5-2 --effort xhigh
```

````text
/kickoff-pr-review 382 --no-merge
You are Pass 1, the cold reviewer of Kickoff PR #382. If you are not, stop and say so.
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/tier-labeler-review-archive:docs/tier-labeler-review-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so. If the command above did not load the skill, read `.claude/skills/kickoff-pr-review/SKILL.md`, `pr-comment.md` and `browser-matrix.md` and follow them where this brief does not override them.
Kickoff PR #382 (B2, the tier labeler): Pass 1, cold review
You are Pass 1 of the 360 cycle for PR #382 in github.com/BeniCheni/kickoff, branch `codex/tier-labeler` into `main`. You are a fresh Claude Code session on `claude-fable-5-2` at `--effort xhigh`, and you wrote none of this PR. Beni started you in `/Users/benicheni/code/kickoff-pr382-review`, a detached worktree at the head `ac7e05e47f30807186b277b62ae209cac977899b`. Name the model and effort that actually ran at the top of your comment. Read `CLAUDE.md`, `AGENTS.md` ("Review tiers" and "Tier 3 paths"), `.claude/rules/sync.md` and `.github/workflows/sync.yml` first. The PM seat (Claude Code, Opus 5.5) wrote this at about 1:05 PM EST on Tue 24 Nov 2026. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment.
WHO BUILT IT, AND THE ROUTING. Codex built #382 on `gpt-6.2-sol` at xhigh. Its first commit, `907b208`, is the PM seat's brief, cherry-picked from the local branch `claude/tier-labeler-archive`. It is Claude's and it is the spec, not your subject; confirm only that `git diff 8491dd4 907b208` prints nothing. Your subject is `ac7e05e`, measured against that brief and against `AGENTS.md`, which the brief says wins wherever they disagree. Beni ruled "Kickoff first" at 12:05 PM EST on Tue 24 Nov 2026: build the labeler in Kickoff, not in elenchus. The PR is Tier 3. Pass 1 is yours and it is report-only. Codex holds Pass 2 and every fix. Pass 2.5 is a fresh Claude Code session on `claude-opus-5-5` that writes nothing, and Beni's word merges.
WHAT TO CHECK. Reproduce each item before you report it, and say how.
1. The house. Run `npm ci`, then `npm run typecheck` and `npm test` with the real counts; `main` passed 1,167 tests in 88 files. Read `verify` and `tier` at the tip. The diff touches no app code, so `CLAUDE.md` asks for a smoke pass: one lens, theme and tab at 390 px and one at about 1,000 px, with `scrollWidth === innerWidth` and the viewport set before load. If the sandbox blocks the dev server, say so, and compare `npm run build` output at base and head instead.
2. The rules match `AGENTS.md`. Walk each rule in the brief's "THE RULES THE LABELER APPLIES" through `scripts/tier.ts`: Tier 3 by path with gitignore-style globs, renames on both paths, the four content rules from the patch, "patch unavailable", Tier 0's four conditions, Tier 1 Markdown only, the Tier 2 default, and highest-wins. Write a case the tests do not cover for each rule, and run it against `classifyTier` from a probe kept in `$TMPDIR`. Pay attention to the `[Unreleased]` path. `AGENTS.md` says such an edit "keeps the PR's own tier". The code gives a lone `CHANGELOG.md` edit Tier 2 and otherwise lets it inherit. Say whether that matches.
3. The parser. `parseTier3Rules` reads backticked tokens from the `### Tier 3 paths` bullets and filters some out: the `?only=` and `&date=` labels, the content markers, and `[Unreleased]`. Check that it yields every entry the list holds and nothing it does not. Count them against your own reading of the section, and say which tokens it drops and why. Try a plausible future edit to the section that would silently drop an entry, such as a new bullet style or a backticked word in prose, and say whether the guard test catches it.
4. Which code runs. The brief required the list to be read from the base. Check where the code that applies it comes from. Read `.github/workflows/tier.yml`'s checkout step and the labeler run's log (`gh run view 45449107884 --log`). Say which commit's `scripts/tier.ts` ran, and whether a same-repo PR that edits `scripts/tier.ts` could compute and apply its own lower tier. If you think it can, give the smallest fix and what it costs, for example checking out the base for the script. The brief did not say where the code should come from. Treat that as a gap in the spec, not a builder error, and say so.
5. The token and the trust boundary. The workflow has `contents: read` and `pull-requests: write`, and it runs on `pull_request`, not `pull_request_target`. Say what a fork PR's token can do, what a same-repo PR's token can do, and whether anything the PR author controls reaches a shell or `gh` argument unquoted: the body, the labels, the head ref, the file names. The brief told Codex not to grant label-creation permission. Codex reports that GitHub bundles label creation into `pull-requests: write`. Verify that against GitHub's docs, and confirm that the code only reads `/labels` and never creates one.
6. The label rules. One `tier-N` label at most. It raises and never lowers. When the label is missing, the job says so and does not fail. Check the order of add and delete if an API call fails halfway, and what happens to a lower label Beni sets by hand when the next push arrives. Say whether that honours "Only Beni can lower it", and turn any gap into a one-word question for Beni.
7. Sync PRs. The workflow is named "Review tier", not "CI". Confirm that `sync.yml:323-324` cannot pick its held run. Say what a held, unapproved `tier` run shows on a sync PR, and confirm that it cannot block the merge, because only `verify` is required. Read the ruleset if you can (`gh api repos/BeniCheni/kickoff/rulesets`).
8. The tests and fixtures. Read `tests/tier.test.ts` against the brief's TESTS list, case by case. Check that the seven replay fixtures under `tests/fixtures/tier/` are real `gh api` responses for those PRs, that no test fetches over the network, and that the tiers they assert are right on the merits. The fixtures are not on the Tier 3 list, while `tests/tier.test.ts` is. Say whether a Tier 2 PR could weaken the labeler's tests through them, and whether they belong on the list.
9. The November replay. The PR body reports 14 Tier 1, 6 Tier 2 and 15 Tier 3 across 35 human PRs, with comparisons to #369's two passes. Re-run it, or as much of it as you can, and say whether the counts and the explanations hold.
10. The docs. The `AGENTS.md` and `README.md` edits replace the "until a labeler exists" sentence and add `scripts/tier.ts` and `tests/tier.test.ts` under "Verification gates", and nothing else. Check that rendered links and anchors resolve on GitHub at the head, including the new `AGENTS.md#tier-3-paths` link from the README. Repo prose stays wrapped.
11. Scope. Nothing changed under the brief's do-not-touch list: `src/`, `web/`, `studio/`, `src/data/`, `.claude/`, `.agents/`, `CLAUDE.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`, `ci.yml`, `sync.yml` and the other workflows. Confirm with `git diff --stat 86155da ac7e05e`.
FIX SCOPE. None. This pass is report-only, and on this point it overrides the skill, which would push fixes. Push no commit, and edit no file in the PR or its body. Do not create the labels: that is Beni's step. Write each fix as a finding: the file and line, the command that shows it, what you expected and what you observed, and the smallest change you would make. Keep any probe in `$TMPDIR`, outside the repo.
THE COMMENT. Leave one PR comment on #382 in `pr-comment.md`'s shape. At the top, give the model and effort that ran and the head you read. Include the test counts, the smoke pass (or why it could not run), your rule probes with their results, and a "Not verified" list. End with any calls for Beni, each answerable in one word. Then stop, and reply in this chat with the comment's link and the verdict. Do not mark the PR ready, and do not merge it.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is the builder's, from the PR body and its report to Beni. The second is the PM seat's, with the command and the time it ran.
- Builder: typecheck clean and 1,207 tests in 89 files passed locally; the Chrome smoke pass passed at 390 and 1,000 px with no horizontal overflow.
- Builder: all five checks passed at `ac7e05e`. The labeler computed Tier 3 from `.github/workflows/tier.yml` and `AGENTS.md`, matched the body's declaration, and reported that `tier-3` is missing.
- Builder: the November replay found 14 Tier 1, 6 Tier 2 and 15 Tier 3 across 35 human PRs. On Pass 1's 30-PR sample the older list gives 19 Tier 3 and the current list 13. The seven recorded replays match their expected tiers.
- Builder: GitHub bundles label creation into `pull-requests: write`, so the workflow uses existing labels only.
- PM seat, 12:55 PM EST: `gh pr view 382` showed head `ac7e05e`, a draft, CLEAN and MERGEABLE, no labels, and `verify`, `tier`, Vercel, Vercel Preview Comments and `vercel-smoke` SUCCESS. `git diff --stat 86155da origin/codex/tier-labeler` lists 13 files, +1,018/−4.
- PM seat, 12:56 PM EST: `git diff --quiet 8491dd4 907b208` exits 0.
- PM seat, 12:58 PM EST: `gh run view 45449107884 --log` shows the checkout step ending at "HEAD is now at d265e5a Merge ac7e05e… into 86155da…". `tier.yml`'s checkout sets no `ref:`, and its last step runs `node scripts/tier.ts`.
- PM seat, 12:58 PM EST: `scripts/tier.ts` reads `AGENTS.md` with `gh api … contents/AGENTS.md?ref=${pr.base.sha}`.
````

# Pass 1.5: the rebuttal brief for Codex (archived Tue 24 Nov 2026, about 1:45 PM EST)

Written by the PM seat (Claude Code, Opus 5.5). Pass 1 (Claude Code, `claude-fable-5-2` at
`xhigh`) posted its cold review at 1:26 PM EST as
`https://github.com/BeniCheni/kickoff/pull/382#issuecomment-7140639619`. The verdict was
"mergeable after fixes", with 0 high, 4 medium and 12 low findings, numbered 1 to 16, and five
calls for Beni. At about 1:40 PM EST Beni answered "Yes, as you recommend" to the PM seat's
recommendations: Yes, Yes, No, Yes, Leave. Those rulings are his and travel below as his.

What the PM seat checked at 1:36 to 1:41 PM EST:
- #382 is still a draft at `ac7e05e`, CLEAN, with no labels.
- `main` moved to `ae983ad` (#381). It changed five files, all under `docs/`, none of them
  #382's, and `git merge-tree --write-tree origin/main ac7e05e` is clean. A refresh still waits
  for Beni's word.
- The open PRs #379, #358 and #328 record bases (`b399001`, `b2206cf`, `ad4c5f3`) whose
  `AGENTS.md` has no `### Tier 3 paths` heading. #377 targets `overhaul/second-edition`, which
  has no `tier.yml`.
- `tests/fixtures/tier/` holds 7 tracked files at `ac7e05e`.

Codex works in `~/code/kickoff-tier-labeler` on `codex/tier-labeler`, level with `origin`.
Delivered in chat in a four-backtick fenced block, one line per paragraph. This copy is the
archive.

```bash
codex -m gpt-6.2-sol -c model_reasoning_effort=xhigh -s workspace-write -a on-request -C /Users/benicheni/code/kickoff-tier-labeler
```

````text
You are Codex, the builder of Kickoff PR #382, on `gpt-6.2-sol` at xhigh. If you are not, stop and say so.
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/tier-labeler-review-archive:docs/tier-labeler-review-prompt.md`, the section headed "Pass 1.5". A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so.
Kickoff PR #382 (B2, the tier labeler): Pass 2, the builder's rebuttal and fix round
You are the builder of #382 in github.com/BeniCheni/kickoff, branch `codex/tier-labeler` into `main`, working in `/Users/benicheni/code/kickoff-tier-labeler`. This is Pass 2 of the six-pass 360: you answer Pass 1's cold review finding by finding, and you make the fixes. Follow `.agents/skills/kickoff-pr-review/SKILL.md` and `pr-comment.md` for the comment's shape; where they differ from this brief or from `AGENTS.md`'s "Review tiers", this brief and `AGENTS.md` are newer. Read `CLAUDE.md`, `AGENTS.md`, `.claude/rules/sync.md` and your own implementation brief (`docs/tier-labeler-implementation-prompt.md`) first. The PM seat (Claude Code, Opus 5.5) wrote this at about 1:45 PM EST on Tue 24 Nov 2026, with the head at `ac7e05e`. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
READ PASS 1 FIRST. Fetch it with `gh api repos/BeniCheni/kickoff/issues/comments/7140639619 --jq .body` and read all of it, the collapsed sections included, before you change anything. It was written by Claude Code on `claude-fable-5-2` at xhigh in a fresh session, report-only. Its verdict was "mergeable after fixes": no high finding, findings 1 to 4 medium and 5 to 16 low. This brief uses its numbers.
BENI'S RULINGS, Tue 24 Nov 2026, about 1:40 PM EST, in his words "Yes, as you recommend". These are his and are not yours to contest. Make each change, and in your comment mark the findings they settle "fixed per Beni's Qn" with the commit. Where a ruling leaves the mechanism to you, choose it, and say what you chose and why.
Q1, Yes (findings 1 and 2, and 13's wording). Run `main`'s copy of the labeler with `main`'s list on every PR: trigger `tier.yml` on `pull_request_target` with the same event types, and read `AGENTS.md` from the workflow's own checkout instead of the contents API at `pr.base.sha`. The safety of that trigger rests on one rule, which the workflow and the script must both keep and a test must pin where it can: nothing from the PR is checked out, installed, built, executed or written where it could run. The checkout takes no `ref:` and keeps `persist-credentials: false`; there is no `npm ci`; the script uses Node built-ins only; PR data (body, labels, refs, file names, patches) reaches `gh` only as `execFileSync` array arguments and is otherwise only parsed and matched. Fork PRs stay summary-only, as today. Put the commit the list was read from in the job summary. Check against GitHub's current docs which commit `actions/checkout` takes under `pull_request_target` for a PR into `main` and for a PR into another branch such as `overhaul/second-edition`, and say which list each gets. Pass 1 could not verify how GitHub treats the sync bot's PRs under this trigger (held, run, or not triggered at all); find out from the docs, say what you found, and confirm that none of the outcomes can block a sync PR, since only `verify` is required. Name the cost plainly in the PR body: once this lands, a PR that edits the labeler is labelled by `main`'s copy, and #382 itself gets no `tier` run under the new trigger because `main` has no `tier.yml` yet, so your evidence for this PR is the stubbed-`gh` runs and the tests.
Q2, Yes (finding 4). A tier label that a person lowered by hand stays lowered on the next push, reopen or ready-for-review. Read the PR's label events (the issue events or timeline API, paginated), find the latest `labeled` or `unlabeled` event on a `tier-N` label, and when its actor is not `github-actions[bot]`, change no label and say in the summary which label was kept, who set it and when, and what the labeler computed. Any non-bot actor counts as "a person": agents also act through Beni's account, and that is accepted. Decide what happens when a person removed every tier label, and say why.
Q3, No (finding 8). `package.json`, `package-lock.json` and `vite.config.ts` under `web/`, `studio/` and `packages/` stay Tier 2; only the root files are release numbering. Make `AGENTS.md` say what the matcher does: every path entry is anchored at the repo root, so a bare name names the root file only. Keep "`**` crosses folders and `*` does not". Do not add the nested files to the list.
Q4, Yes (finding 15). Add `tests/fixtures/tier/**` to the Tier 3 list, next to `scripts/tier.ts` and `tests/tier.test.ts`, by the same reasoning as #369's Q7: a Tier 2 PR must not be able to hollow out a check that guards Tier 3. Confirm it matches tracked files with `git ls-files 'tests/fixtures/tier/**'`, and give the new entry count (93 today).
Q5, Leave (half of finding 5). A lone `[Unreleased]` edit stays Tier 2 under "Anything no tier names is Tier 2", and the same edit beside a docs file stays Tier 1. Do not change that. The other half of finding 5, a rewritten released section or a removed release heading inheriting like an `[Unreleased]` edit, is not covered by this ruling and is yours to answer below.
FINDINGS 3, 5 TO 7, 9 TO 14 ARE YOURS TO ANSWER. For each one, say accept, contest, or accept but contest the characterisation, and give the evidence: the command and what it printed. Fix what you accept. Beni has not ruled on any of these, so a contest you can support is a fine answer, and Pass 2.5 will carry it to him. Finding 3 matters most: once Q1 and Q2 land, the entry point carries more logic than the classifier, so pass `gh` (or a small client) in and test raise, keep-higher, two labels, a missing repository label, a fork, a failed add, a failed delete, a hand-lowered label kept, and the list read from the checkout. Re-run a mutation pass of your own on `main()` and `applyTierLabel()` and give the caught and surviving counts. Finding 13 is wording: rewrite "labels each same-repo PR" in `AGENTS.md` and `README.md` to match what the workflow does after Q1 and Q2.
NOT YOURS. Finding 16 (the brief is not indexed in `docs/README.md`) is the PM seat's, and lands in the record PR. Pass 1's note that Tier 0 trusts the PR's author and branch rather than its commits is a question about `AGENTS.md:39-41` that the PM seat holds for Beni; do not change Tier 0, though you may say in your comment whether you agree. Pass 1's notes on the skill's smoke pass go to the skill audit. Do not create the four `tier-N` labels: that is Beni's step before the merge.
SCOPE. The implementation brief's do-not-touch list still holds: `src/`, `web/`, `studio/`, `src/data/`, `.claude/`, `.agents/`, `CLAUDE.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`, `ci.yml`, `sync.yml` and every workflow other than `tier.yml`. No new dependency.
THE BASE MOVED. `main` is now `ae983ad`, the squash of #381. It changed `docs/README.md` and four new `docs/roadmap-checkpoint*` files, none of yours, and `git merge-tree --write-tree origin/main HEAD` is clean. Do not rebase onto `main` or merge it in; a refresh waits for Beni's word. If GitHub reports a conflict, stop and report it.
HOUSE RULES. `npm run typecheck` and `npm test` green at every commit, with the real counts. Repo prose stays wrapped in its existing style. Check the touched links and anchors render on GitHub at the new head with `gh api 'repos/BeniCheni/kickoff/contents/AGENTS.md?ref=<sha>' -H 'Accept: application/vnd.github.html'`, and the same for `README.md`. The diff touches no app code, so `CLAUDE.md` asks for a smoke pass; if the sandbox refuses the dev server, compare `npm run build` output at base and head, as Pass 1 did, and say so. Re-run Pass 1's guard probes from its "The list and the parser" table against your new guard test, and say which silent drops it now catches. Commit as yourself on every commit: `git -c user.name=Codex -c user.email=noreply@openai.com commit`, never as Beni and never through `git config`. Write commit messages that say what changed and why. Push to `codex/tier-labeler`.
THE PR BODY. Update it to match the head: the new trigger and its cost, Beni's five rulings named as his with their date, the entry count, the replay counts if they moved, and the label commands Beni runs before the merge. Keep the "deliberately not done" list honest.
THE COMMENT. Leave one PR comment on #382 in `pr-comment.md`'s shape, with one row for each of the 16 findings: fixed per Beni's Qn, accept, or contest, the evidence, and the fix commit (finding 16: "PM seat"). Give the head you read at the start (`ac7e05e`) and the head after your fixes. Include the test counts, the smoke pass or the build comparison, your mutation counts, your answers on the checkout commit under `pull_request_target`, the sync-PR behaviour and the all-labels-removed case, and a "Not verified" list. Then stop and reply in this chat with the comment's link, the new head SHA and your verdict. Do not mark the PR ready, and do not merge it. Pass 2.5 is a fresh Claude Code session on `claude-opus-5-5` that re-runs everything at your head and writes nothing, and Beni's word merges.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is Pass 1's, from its comment. The second is the PM seat's, with the command and the time it ran.
- Pass 1: `npm test` passed 1,207 tests in 89 files at `ac7e05e`; 40 of them are `tests/tier.test.ts`.
- Pass 1: of 34 one-line mutants of `scripts/tier.ts`, the tests caught 25; all four entry-point mutants survived (never-lower inverted at `:149`, forks labelled at `:199`, list read from the head at `:182`, inventory check removed at `:150`).
- Pass 1: a differential against `git check-ignore --no-index` over 1,095 tracked paths differs on 7, all nested `package.json`, `package-lock.json` or `studio/ui/vite.config.ts`.
- Pass 1: an entry that loses its backticks, a path named in the sentence above the bullets, a `studio/` entry and a `/SECURITY.md` entry each leave all 40 tests passing.
- Pass 1: a file named `docs/[click here](https://example.com/x).md` renders as a link inside the summary's `<code>`.
- Pass 1: `node /tmp/…/scripts/tier.ts` on macOS exits 0 silently, because the run guard compares a symlink-resolved URL with the raw `argv[1]`.
- Pass 1: the November replay gives 14 Tier 1, 6 Tier 2 and 15 Tier 3 across the builder's 35 PRs.
- PM seat, 1:36 PM EST: `git show <base>:AGENTS.md | grep -c '^### Tier 3 paths'` prints 0 for `b399001` (#379), `b2206cf` (#358) and `ad4c5f3` (#328).
- PM seat, 1:40 PM EST: `gh pr view 382` shows head `ac7e05e`, a draft, CLEAN, no labels; `git rev-parse origin/main` is `ae983ad`.
- PM seat, 1:41 PM EST: `git merge-tree --write-tree origin/main ac7e05e` exits 0; `git diff --name-only 86155da origin/main` lists `docs/README.md` and four `docs/roadmap-checkpoint*` files; `git ls-tree -r --name-only ac7e05e -- tests/fixtures/tier | wc -l` prints 7.
- PM seat, 1:41 PM EST: at `ac7e05e`, `tier.yml` triggers on `pull_request`, checks out with `persist-credentials: false` and no `ref:`, and runs `node scripts/tier.ts`; `scripts/tier.ts` reads `contents/AGENTS.md?ref=${pr.base.sha}`.
````

# Pass 2.5: the synthesis opener (archived Tue 24 Nov 2026, about 5:05 PM EST)

Written by the PM seat (Claude Code, Opus 5.5). Codex posted Pass 2 at 1:58 PM EST as
`https://github.com/BeniCheni/kickoff/pull/382#issuecomment-7141423872`, with one fix commit,
`eeaf014` ("Use the default-branch tier policy and preserve manual label decisions"), which
changes five files, +390/−49. Codex marked findings 1, 2, 4, 8, 13 and 15 fixed per Beni's
rulings, accepted 3, 5–7, 9–12 and 14, and left 16 to the PM seat. Its verdict was "mergeable
after Pass 2.5 and confirmation that Kickoff's Actions policy permits `pull_request_target`
after GitHub's December 2 enforcement change".

What the PM seat checked between 4:56 and 5:00 PM EST:
- `gh pr view 382`: head `eeaf014`, a draft, CLEAN, no labels; `verify`, Vercel and Vercel
  Preview Comments SUCCESS; no `tier` and no `vercel-smoke` result.
- `main` is `7c8ecb4`, one bot sync past `ae983ad`. `git merge-tree --write-tree 7c8ecb4
  eeaf014` exits clean. The whole PR is 13 files, +1,362/−7 against `86155da`.
- `gh api 'repos/BeniCheni/kickoff/actions/policies?includes_parents=true'` returns
  `{"total_count":0,"policies":[]}`.
- GitHub's docs, read through a fetch agent at about 4:57 PM, not by the PM seat directly:
  "about-actions-policies" says a default policy "will block the `pull_request_target` event
  in public repositories" and "will be enforced on December 2, 2026". "securely-using
  pull_request_target" says the default is in evaluate mode now, applies to public repositories
  "that do not already have an applicable Actions event policy", and is lifted by an event
  policy "that explicitly allows `pull_request_target`", made under the repository's Settings,
  Actions, Policies. Neither page separates fork from same-repo PRs, or personal from
  organisation repositories.

The worktree exists: `git worktree add --detach /Users/benicheni/code/kickoff-pr382-synthesis
eeaf014…` ran at 4:56 PM EST. Pass 2.5 is a fresh session that wrote neither the build, the
fixes, Pass 1 nor the briefs. Delivered in chat in a four-backtick fenced block, one line per
paragraph. This copy is the archive.

```bash
cd /Users/benicheni/code/kickoff-pr382-synthesis && claude --model claude-opus-5-5 --effort xhigh
```

````text
/kickoff-pr-review 382 --pass 2.5 --no-merge
You are Pass 2.5, the synthesis seat for Kickoff PR #382, a fresh Claude Code session on `claude-opus-5-5` at xhigh that writes nothing. If you are not, stop and say so.
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/tier-labeler-review-archive:docs/tier-labeler-review-prompt.md`, the section headed "Pass 2.5". A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so. If the command above did not load the skill, read `.claude/skills/kickoff-pr-review/SKILL.md`, `executive-brief.md`, `pr-comment.md` and `browser-matrix.md` and follow them as written.
Kickoff PR #382 (B2, the tier labeler): Pass 2.5, the synthesis
You are Pass 2.5 of the 360 cycle for PR #382 in github.com/BeniCheni/kickoff, branch `codex/tier-labeler` into `main`. You wrote none of this PR: not the build, the fixes, Pass 1 or the briefs. Beni started you in `/Users/benicheni/code/kickoff-pr382-synthesis`, a detached worktree at the Pass 2 head `eeaf014ced68d3919864fa1220101b0f96b092b1`. Name the model and effort that actually ran at the top of your comment. Read `CLAUDE.md`, `AGENTS.md` ("Review tiers" and "Tier 3 paths"), `.claude/rules/sync.md` and `.github/workflows/sync.yml` first. The PM seat (Claude Code, Opus 5.5) wrote this at about 5:05 PM EST on Tue 24 Nov 2026. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverables: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment or the Executive Summary Brief.
WHAT YOU MAY WRITE. One short PR comment on #382, and the Executive Summary Brief delivered in chat. Nothing else. Push no commit, edit no file, and do not touch the PR body, labels, draft state, repository labels or Actions settings. The skill's §9 retro and §6 ideas rows are writes to the branch, so put any retro point in your comment instead. `.claude/skills/` belongs to the pending skill audit.
THE MERGE IS BENI'S. #382 is Tier 3: it adds `.github/workflows/tier.yml` and edits `AGENTS.md`. A Tier 3 merge takes Beni's word, and the tiers outrank the skill's auto-merge gate. Do not merge, do not arm auto-merge, and do not mark the PR ready. Score every gate clause anyway, so Beni can see which ones hold. Then escalate, with the handoff block from §7 step 8: the squash title and body ready to paste, with both trailers.
THE CYCLE SO FAR. Read all of these in full before you re-run anything:
- The implementation brief: `docs/tier-labeler-implementation-prompt.md` at the head (equal to the archive `8491dd4`).
- Pass 1 (Claude Code, `claude-fable-5-2` at xhigh, report-only): `gh api repos/BeniCheni/kickoff/issues/comments/7140639619 --jq .body`, the collapsed sections included.
- The Pass 1.5 brief, with Beni's five rulings of about 1:40 PM EST, "Yes, as you recommend" (Q1 Yes, Q2 Yes, Q3 No, Q4 Yes, Q5 Leave): the section headed "Pass 1.5" in the archive above.
- Pass 2 (Codex, `gpt-6.2-sol` at xhigh): `gh api repos/BeniCheni/kickoff/issues/comments/7141423872 --jq .body`.
Then read the PR body, `git diff ac7e05e eeaf014` (the fix round) and `git diff 86155da eeaf014` (the whole PR against its merge base).
WHAT TO RE-RUN. Every number in your brief comes from a command you ran. A number you could not re-run goes under "not verified". Keep any probe in `$TMPDIR`, outside the repo; `gh` and `tsx` need the sandbox off, where `$TMPDIR` is a different folder, so use absolute probe paths.
1. The house. Run `npm ci` first, because a sibling worktree does not share `node_modules`. Then `npm run typecheck` and `npm test` with the real counts, and read `verify` at the tip. The head has no `vercel-smoke` result although `ac7e05e` had one: find out why from the repo and the check runs, and say whether that weakens anything for a tooling-and-docs head. Run the smoke pass from `CLAUDE.md` (one lens, theme and tab at 390 px and one at about 1,000 px, `scrollWidth === innerWidth`, viewport set before load); if the sandbox refuses the dev server, compare `npm run build` output at base and head instead, and say so.
2. The trust boundary under `pull_request_target`. This is the part of the fix round that most needs a cold eye. The job now runs `main`'s workflow and script with a token that can write labels, edit PR bodies and submit reviews, on every PR, forks included. Read `tier.yml` and `scripts/tier.ts` at the head line by line and confirm that nothing from the PR is checked out, installed, built, executed, imported or written to disk: no `ref:`, `persist-credentials: false`, no install, the setup-node cache off, Node built-ins only, and PR data (body, labels, refs, file names, patches, the blob Codex now reads for finding 5) reaching `gh` only as `execFileSync` array arguments and otherwise only parsed and matched. Name any input the PR author controls that reaches a URL path, a shell, `GITHUB_STEP_SUMMARY`, `GITHUB_OUTPUT` or `GITHUB_ENV`, and how it is escaped. Check that the "default-branch script" test would fail if someone later added a `ref:`, an `npm ci` or a non-built-in import. Say whether a fork PR's run can write anything.
3. GitHub's 2 December enforcement. Codex reports, and the PM seat's fetch agent read on docs.github.com, that GitHub's default Actions policy will block `pull_request_target` in public repositories without an applicable event policy from 2 December 2026, and that the repository has no Actions policy today. Read the two pages yourself ("About Actions policies" and "Securely using pull_request_target") and the REST reference for Actions policies, and answer: does the block apply to this repository; what a blocked `tier` run looks like on a PR and whether it can block anything (only `verify` is required); what the smallest policy is that permits this one workflow, and whether it can be scoped to `tier.yml` alone rather than every workflow; and what the fallback is if Beni declines to add one, for example `pull_request` with the script and list read from `main` through the API. Read the policy insights view if `gh` can reach it. Turn the result into a one-word question for Beni. Creating the policy is his step, not yours.
4. Beni's rulings, exactly. For each of Q1 to Q5, check that the head does what the Pass 1.5 brief says Beni ruled: no less and no more. Q1: both PRs into `main` and into another base (`overhaul/second-edition`) get `main`'s script and list, and the summary names the commit. Q2: the latest `labeled` or `unlabeled` event on a `tier-N` label by an actor other than `github-actions[bot]` freezes the labels. Q3: the nested package files stay Tier 2 and `AGENTS.md` says entries are anchored at the repo root. Q4: `tests/fixtures/tier/**` is on the list and matches seven files. Q5: a lone `[Unreleased]` edit is Tier 2 and beside docs Tier 1.
5. The builder's judgments, which Beni confirms at Pass 3. Judge each on the merits: under Q2, Codex chose to leave a PR unlabelled when a person's last tier event removed every label; the finding 5 mechanism, which reads the postimage blob to place a `CHANGELOG.md` edit inside or outside `[Unreleased]`; the finding 6 heading pattern; the finding 10 change to case-sensitive matching on every platform; and the finding 11 code-span escaping. For the Q2 event order, say whether ordering by timestamp and event ID is enough when a person and the bot act within the same second.
6. Findings 3, 5–7 and 9–14. Re-check each "accept" row at the head. For finding 3, re-run a mutation pass of your own on `main()` and `applyTierLabel()`, even a small one, and give caught and surviving counts beside Codex's 18 of 18. Re-run Pass 1's guard probes against the new guard test.
7. The replay and the list. Re-derive the Tier 3 list at the head: Codex reports 94 path entries and 4 content rules, every entry matching a tracked file. Re-run as much of the November replay as you can (Codex: 0/14/6/15 for the builder's 35, unchanged by the fix round), and confirm the seven recorded fixtures still give their tiers.
8. One story everywhere. `AGENTS.md`'s "Review tiers" and "Tier 3 paths", the README's tier section and the PR body must describe the same labeler: the trigger, where the list and the code come from, forks summary-only, labels never lowered by the bot, a person's last tier event standing, and the labels Beni creates first. Check rendered links and anchors at the head with `gh api 'repos/BeniCheni/kickoff/contents/<file>?ref=eeaf014ced68d3919864fa1220101b0f96b092b1' -H 'Accept: application/vnd.github.html'` for `AGENTS.md` and `README.md`. Repo prose stays wrapped.
9. The labels and the first run. The PR body lists four `gh label create tier-N` commands. Check them against what the script looks up. After the merge, no PR has had a real `tier` run under the new trigger, because `main` has no `tier.yml` yet. Propose the smallest live check after the merge, for example a push to one open PR, and make it a one-word question.
10. The base and scope. `main` is `7c8ecb4`, one bot sync past `ae983ad`. Run `git merge-tree --write-tree origin/main eeaf014` and read GitHub's merge state; a refresh waits for Beni's word. Confirm with `git diff --stat 86155da eeaf014` that nothing changed under `src/`, `web/`, `studio/`, `src/data/`, `.claude/`, `.agents/`, `CLAUDE.md`, `CHANGELOG.md`, `package.json`, `package-lock.json` or any workflow but `tier.yml`.
THE DELIVERABLES. First, one short PR comment: the model and effort that ran, the head, the decision (escalated, with the reason), the gate clauses scored, anything still contested, and a "not verified" list. Then the Executive Summary Brief in chat, in `executive-brief.md`'s shape, written for Beni, decision first. It is not a release, so "What ships" is the labeler in plain words. "Where it sits": B2 of the studio tune-up; B4, the automated Tier 1 read, builds on it; finding 16 (indexing the brief in `docs/README.md`) and Pass 1's Tier 0 "author, not commits" note stay with the PM seat. End with the questions for Beni, each answerable in one word. Include at least these: the Actions event policy before 2 December; Codex's choice to leave a PR unlabelled after a person removes every tier label; creating the four labels before the merge; the live check after it; and the merge. Then stop. Do not merge.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is Codex's, from Pass 2. The second is the PM seat's, with the command and the time it ran.
- Codex: `npm run typecheck` clean and `npm test` 1,244 tests in 89 files at `eeaf014`, 77 of them in `tests/tier.test.ts`; CI run 45464564119 passed `verify`.
- Codex: 18 of 18 entry-path mutations caught at `eeaf014`; Pass 1's five surviving classifier mutants now caught.
- Codex: the four guard edits that escaped Pass 1 (lost backticks, a path in the intro, `studio/`, `/SECURITY.md`) each now fail the guard; a Markdown link around an entry still passes, harmlessly.
- Codex: the root-anchored differential against `git check-ignore --no-index` agrees on all 1,095 tracked paths.
- Codex: 94 path entries and four content rules; all seven fixtures classify Tier 3 by path.
- Codex: GitHub's docs list `pull_request`, `workflow_dispatch` and `repository_dispatch` as the exceptions to the rule that `GITHUB_TOKEN` events start no workflow, so a bot-opened sync PR gets no `tier` run under `pull_request_target`.
- Codex: a smoke pass of Poster, light, Fixtures at 390 px and Ledger, dark, Table at 1,000 px, both `scrollWidth === innerWidth`, no console errors.
- PM seat, 4:56 PM EST: `gh pr view 382` shows head `eeaf014`, a draft, CLEAN, no labels, with `verify`, Vercel and Vercel Preview Comments SUCCESS and no `tier` or `vercel-smoke` result. `git rev-parse origin/main` is `7c8ecb4`.
- PM seat, 4:56 PM EST: `git merge-tree --write-tree 7c8ecb4 eeaf014` exits 0; `git diff --stat 86155da eeaf014` gives 13 files, +1,362/−7; `git log ac7e05e..eeaf014` is the one Codex commit `eeaf014`.
- PM seat, 4:56 PM EST: at `eeaf014`, `tier.yml` triggers on `pull_request_target` with the four event types, checks out with `persist-credentials: false` and no `ref:`, sets `package-manager-cache: false`, and runs `node scripts/tier.ts`.
- PM seat, 4:56 PM EST: `gh api 'repos/BeniCheni/kickoff/actions/policies?includes_parents=true'` returns `{"total_count":0,"policies":[]}`.
- PM seat, about 4:57 PM EST, through a fetch agent: "About Actions policies" says the default policy "will be enforced on December 2, 2026"; "Securely using pull_request_target" says it is in evaluate mode now and applies to public repositories "that do not already have an applicable Actions event policy".
````

# Pass 3 and the merge (recorded Tue 24 Nov 2026, about 9:40 PM EST)

Pass 2.5 (Claude Code, `claude-opus-5-5` at `xhigh`, a fresh session in
`~/code/kickoff-pr382-synthesis`) posted at 5:22 PM EST as
`https://github.com/BeniCheni/kickoff/pull/382#issuecomment-7146149046`. It found every fixed
finding holding at `eeaf014` and Beni's five rulings landed as ruled. Its own mutation pass
caught 27 of 35 mutants, and Pass 1's five classifier survivors were now caught. It raised four
new low items, none blocking, and a skill-audit note already reported on #380, and escalated:
every clause of the skill's merge gate held, but a Tier 3 merge takes Beni's word. It also
confirmed, from GitHub's docs, that GitHub's default Actions policy blocks `pull_request_target`
in public repositories without an event policy from 2 December 2026, and that Kickoff had none.

The PM seat re-checked at 9:02 PM EST. The head was still `eeaf014`, a draft, CLEAN, with no
labels. `main` was `2e46532`, two bot syncs past `ae983ad`, and `git merge-tree` was clean. A
fetch agent read GitHub's REST reference for Actions policies: Pass 2.5's request body matched
the documented schema field for field, and the page did not say whether personal-account
repositories can use the endpoint. The PM seat agreed with all six of Pass 2.5's
recommendations.

Beni answered "Yes, run it" at about 9:05 PM EST:
1. A repository Actions policy, scoped to `tier.yml`, allowing `pull_request_target`:
   **Yes**.
2. A PR stays unlabelled after a person removes its last tier label: **Yes**, as Codex built it.
3. B4 reads the computed tier, not the label, because a person's tier-label change freezes the
   bot's labels on that PR: **Yes**.
4. Create the four `tier-N` labels before the merge: **Yes**.
5. Merge at `eeaf014` with no refresh: **Yes**.
6. After the merge, close and reopen #377 once as the live check: **Yes**.

The PM seat ran Pass 2.5's handoff block, in order:
- 9:08 PM EST: `gh label create` made `tier-0` to `tier-3` with the PR body's colours and
  descriptions; `gh api repos/BeniCheni/kickoff/labels/tier-N` returned each one.
- 9:09 PM EST: `POST repos/BeniCheni/kickoff/actions/policies` created policy 17532, active,
  `workflow_path` include `.github/workflows/tier.yml`, rule `restrict_action_events` with
  `allowed_events` `["pull_request_target"]`. The listing then showed one policy. The endpoint
  does work for a personal-account repository.
- 9:09 PM EST: `gh pr ready 382`, then `gh pr merge 382 --squash --match-head-commit eeaf014…`
  merged as `a2ff30b`. Its tree, `a0cab85`, equals `git merge-tree --write-tree 2e46532
  eeaf014`. On `main` after the pull, `npm run typecheck` was clean, `npm test` passed 1,244
  tests in 89 files, and `npm run build` was green. No tag, because this is not a release.
- 9:10 PM EST: `gh pr close 377` and `gh pr reopen 377`. Run 45531073426 ("Review tier", on
  `pull_request_target`) succeeded in 11 s. Its summary read "Tier 3 list from commit
  `a2ff30b`", "Computed **Tier 3**" and "PR label: `tier-3`", and #377 carries `tier-3`. That is
  a PR into `overhaul/second-edition`, a branch with no `tier.yml`, labelled by `main`'s copy.
  #377 has no auto-merge armed.

Handed on, none of them blocking:
- Pass 2.5's four new low items. (1) The workflow test misses four import forms
  (double-quoted, side-effect, multi-line and dynamic) and does not pin `permissions:` or a
  job-level `env:`. (2) Seven defensive checks have no test that can fail them, though each
  works today. (3) Finding 6's pattern leaves `## [v0.6.0]`, `## [0.6]` and `## 0.6.0` at Tier
  2. (4) `AGENTS.md` and the README say the list comes from `main` but not that the script
  does, and do not describe the freeze that Pass 1.5's Q2 set up and Pass 3's answer 3 relies
  on.
- Pass 2.5's retro for the skill audit, already reported on #380: `SKILL.md`'s seat table
  still names Fable 5.1.
- Pass 1's question for Beni: Tier 0 trusts a PR's author and branch, not its commits, so a
  person's commit pushed onto `sync/scheduled` that touches only `src/data/**` still reads Tier
  0 (`AGENTS.md:39-41` has the same gap).
- Pass 1's notes for the skill audit: its smoke pass cannot run where the sandbox refuses
  `listen`, and the build-comparison fallback this cycle used could move into the skill.
- Two probe notes for the skill audit. Pass 1: `gh` and `tsx` need the sandbox off, where
  `$TMPDIR` is a different folder, so probe paths must be absolute. Pass 2.5: in zsh, a probe
  loop variable named `path` rewrites `PATH`, so name it something else.
- B4 builds on the labeler and reads the computed tier from the job summary.
