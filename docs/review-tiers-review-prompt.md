# PR #369 — Pass 1 of the 360 for the review tiers: the cold-review brief (archived Mon 23 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) at about 6:45 PM EST on Mon 23 Nov 2026. Codex
opened draft #369 at 12:02 PM from `docs/review-tiers-implementation-prompt.md` and its addendum.
This is Pass 0 of the 360 cycle in `/kickoff-pr-review`. The afternoon planner seat (Fable 5.2,
until 4 PM, per `claude/studio-planner-handoff-archive` at `bd50fb8`) was given this Pass 0 and
left no archive branch and no comment on #369, so the PM seat writes it now.

The PR is **tier 3** under Beni's R1 of 22 Nov, because it edits `CLAUDE.md`, `AGENTS.md` and
`.claude/rules/releases.md`. Codex built it, so the review takes the "When Codex builds" column of
#328's two-vendor amendment, which this PR copies into the README:
- Passes 0 and 1.5: the PM seat.
- Pass 1: a fresh Claude Code session on `claude-fable-5-2` at `xhigh`, report-only. Beni starts it.
- Pass 2 and every fix round: Codex on `gpt-6.2-sol` at `xhigh`, the builder.
- Pass 2.5: a fresh Claude Code session on `claude-opus-5-5` at `xhigh`, writing nothing.
- Pass 3: Beni, whose word merges.

What the PM seat found, read between 12:05 and 6:40 PM EST:
- Three commits on `ffc5cac`: `d1f25c4` and `9a12ab1` (author Claude, committer Codex: the brief
  and its addendum, byte-identical to `claude/review-tiers-archive`) and `b5aba31` (Codex).
- Six files, +191/−31: `.claude/rules/releases.md`, `AGENTS.md`, `CLAUDE.md`, `README.md`,
  `docs/README.md` and the brief.
- `verify`, Vercel, Vercel Preview Comments and `vercel-smoke` green at `b5aba31`; still a draft.
- `main` moved to `dc68c1d` at 5:45 PM, a bot sync commit that touches none of #369's files.

It read the PR body and the full diffs of the five edited files. It ran no test, no smoke pass and
no GitHub render check.

The worktree already exists: `git worktree add --detach /Users/benicheni/code/kickoff-pr369-review
b5aba31` ran at 12:14 PM EST. Delivered in chat in a four-backtick fenced block, one line per
paragraph. This copy is the archive.

```bash
cd /Users/benicheni/code/kickoff-pr369-review && claude --model claude-fable-5-2 --effort xhigh
```

---

````text
/kickoff-pr-review 369 --no-merge
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/review-tiers-review-archive:docs/review-tiers-review-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so. If the command above did not load the skill, read `.claude/skills/kickoff-pr-review/SKILL.md`, `pr-comment.md` and `browser-matrix.md` and follow them as written.
Kickoff PR #369 (the review tiers, and Codex as the default builder): Pass 1, cold review
You are Pass 1 of the 360 cycle for PR #369 in github.com/BeniCheni/kickoff, branch `codex/review-tiers` into `main`. You are a fresh Claude Code session that wrote none of this PR's implementation, started by Beni in `/Users/benicheni/code/kickoff-pr369-review`, a detached worktree at the PR's head `b5aba31`. Run `/kickoff-pr-review` on #369 with `--no-merge`. The skill outranks this brief on process, except where FIX SCOPE below says otherwise; this brief adds the PR's particulars. Run on `claude-fable-5-2` with `--effort xhigh`, and name the model and effort that actually ran at the top of your comment. Read `CLAUDE.md` and `AGENTS.md` first. The PM seat (Claude Code, Opus 5.5) wrote this at about 6:45 PM EST on Mon 23 Nov 2026 from #369 at `b5aba31`, with its checks green and no review yet. It read the PR body and the diffs; it ran no test, smoke pass or render check. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment.
WHO BUILT IT, AND THE ROUTING. Codex built #369 on `gpt-6.2-sol` at xhigh. Its first two commits, `d1f25c4` and `9a12ab1`, are the PM seat's brief and addendum, cherry-picked from the local branch `claude/review-tiers-archive`; they are Claude's, they are the spec, and they are not yours to review beyond confirming they match that archive. Your subject is `b5aba31`, measured against that spec: `docs/review-tiers-implementation-prompt.md`, the brief, then the addendum headed "Handed over again (Mon 23 Nov 2026)". Beni's rulings of Sun 22 Nov 2026 that it writes down are R1 (four risk tiers), R4 (Codex is the default builder) and R6 (the Claude Code Action on same-repo PRs only); your user-level `~/.claude/CLAUDE.md` records them in one paragraph. The PR is tier 3 because it edits `CLAUDE.md`, `AGENTS.md` and `.claude/**`. The review follows the "When Codex builds" column of #328's two-vendor amendment, approved by Beni and not on `main`; read it with `git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md` (the table starts near line 302). Pass 1 is yours, and it is report-only. Pass 2 and every fix round are Codex's. Pass 2.5 is a fresh Claude Code session on `claude-opus-5-5` that writes nothing, and Beni's word merges. Beside this PR, #365 (B5, Claude-built, tier 2) is in its own review loop. Do not review it.
WHAT TO CHECK. Reproduce each item before you report it, and say how.
1. The house is green. Run `npm ci` first, because a sibling worktree does not share the main checkout's `node_modules`. Then run `npm run typecheck` and `npm test` at the head with the real counts, and read `verify` at the tip. The diff is docs only, so `CLAUDE.md`'s browser rule asks for a smoke pass, not the full matrix: one lens, theme and tab at 390 px and one at about 1,000 px, with `document.documentElement.scrollWidth === window.innerWidth`. Set the viewport before any screenshot.
2. The tiers match the rulings. Read the README's tier table, `AGENTS.md` "Review tiers" and `CLAUDE.md`'s new lines against R1, R4 and R6 as the brief states them. Check each tier's row: what puts a PR in it, who reviews, who merges, and that a release never merges below Beni. Tier 1's planned automated read must say same-repo PRs only, per R6. Say whether every file that states the tiers states them the same way.
3. Tier 2 is the PM seat's resolution, not a ruling. The addendum's item 3 asks for tier 2 as report-only on code, fixes back to the builder, and a merge only on "Mergeable now", named in the PR body for Beni to confirm at Pass 3. Check that the README, `AGENTS.md` and the PR body all say that, and that none of them presents it as Beni's ruling. Read `.claude/skills/kickoff-pr-review/SKILL.md` §7 and list every place it contradicts the new tier 2 or the report-only Pass 1. Report those as findings for the pending skill audit, which owns `.claude/skills/`; they are not fixes for this PR.
4. Tier 0's exception. `src/data/**` and `docs/sync-digest.md` are on the tier 3 list, and the bot's sync PRs take tier 0 by exception. Read the exception's wording against `.github/workflows/sync.yml`, `.claude/rules/sync.md` and the bot's recent commits on `main` (`git log --format='%h %an %s' -8 origin/main`). Say whether the wording covers exactly what the bot changes and how its work reaches `main`, and whether a human PR that touched the same files could read it as tier 0.
5. The tier 3 path list. B2's labeler will read this list, so its exactness is the deliverable. (a) Every entry matches at least one tracked file: test each with `git ls-files` and name any that match nothing. (b) Nothing tier 3 is missing: walk the categories in R1 (data honesty, the sync, the workflows, the schema and the clocks, the instructions every agent reads, releases and numbering) against `git ls-files`, `.claude/rules/sync.md`'s `paths:`, `.claude/rules/releases.md` and `docs/HONESTY.md`. For the data-honesty tests, read assertions, not file names, and sample at least five test files the list leaves out. Say whether config that decides what runs, such as `vite.config.ts`'s `test.projects`, `web/vercel.json`, `web/next.config.ts` and the `tsconfig*.json` files, belongs, and give the reason either way; a path you would add is a finding with Beni's call named, not a ruling. (c) The globs use one dialect a labeler can apply; name the dialect. (d) Say whether `docs/v*-ideas.md` and `docs/v*-proposal.md` are release files under `.claude/rules/releases.md`, and whether the three README version locations are named so a labeler can find them.
6. The seats table. Compare the README's two-column table, cell by cell, with #328's table and with the brief's THE SEATS. Check the model families named for each seat, that Passes 0 and 1.5 move to Codex when Claude builds, and that no vendor gives the only cold read of its own work in either column. Read the six-pass table's Pass 1 row against the seats table's Pass 1 row and the sentence after it, and say whether a reader gets one story about who commits fixes.
7. Every other statement of the routing agrees. Run the brief's edit 4 grep yourself (`Cursor`, `builder`, `per task shape`, `six passes`) over `CLAUDE.md`, `AGENTS.md`, `.claude/rules/`, `README.md` and `docs/README.md`. Each hit agrees, points at the README, or is listed under "deliberately not done" with a reason. Judge each listed reason.
8. The docs constraints. `CLAUDE.md` may grow by at most four lines from its 99. The README's H2 "🤖 How it gets built" and its anchor are unchanged, and so are the six-pass table, the rebuttal story and the 14 Nov figures. Every README code block fits 30 columns, because a 390 px GitHub code block shows about 30. Check rendered links and anchors at the head on GitHub, for example with `gh api 'repos/BeniCheni/kickoff/contents/README.md?ref=b5aba31' -H 'Accept: application/vnd.github.html'`, and the same for `AGENTS.md`, `CLAUDE.md`, `docs/README.md` and `.claude/rules/releases.md`. Wrapped prose stays wrapped, because the one-line-per-paragraph rule is for prompts delivered in chat, not repo files.
9. Scope. Nothing on the brief's do-not-touch list changed: `.claude/skills/`, `CHANGELOG.md`, `src/`, `web/`, `studio/`, `.github/`, `src/data/`. Confirm with `git diff --stat ffc5cac b5aba31`.
FIX SCOPE. None. This pass is report-only, and on this point it overrides the skill, which would push fixes. Push no commit, and edit no file in the PR or its body. #328 gives every fix round to the builder, and a commit of yours would move the branch under Pass 2. Write each fix as a finding: the file and line, the command that shows it, what you expected and what you observed, and the smallest change you would make. Keep any probe you write in `$TMPDIR`, outside the repo.
THE COMMENT. Leave one PR comment on #369 in `pr-comment.md`'s shape. At the top, give the model and effort that actually ran and the head you read. Include the test counts, the smoke pass, the tier 3 path results from item 5 with counts, and a "Not verified" list. Then stop and reply in this chat with the comment's link and the verdict. Do not mark the PR ready, and do not merge it.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is the builder's, from the PR body and its report to Beni. The second is the PM seat's own reading, with the command and the time it ran.
- Builder: `npm run typecheck` and `npm test` passed on both archive commits and on the implementation tree under Node 24.15.0, each with 82 files and 1,058 tests.
- Builder: the final head `b5aba31` is based on `ffc5cac`, and the final fetch found `main` at that SHA.
- Builder: a docs smoke pass in headless Chrome loaded Poster, light, Fixtures at 390 px and Ledger, dark, Table at 1,000 px, both with snapshot provenance, `scrollWidth === innerWidth` and zero console or runtime errors.
- Builder: GitHub's rendered content at the head resolves the touched links, the README and `AGENTS.md` heading anchors and the review skill directory.
- Builder: all 75 tier 3 entries match tracked paths, and the list names 44 test files with data-honesty assertions.
- Builder: all seven README fences fit within 30 columns; the six-pass table, the rebuttal story and the H2 text match `main`; the 14 Nov figures stay 316 PRs and 981 tests.
- Builder: no data-honesty assertion was weakened, nothing under `src/data/` was hand-edited, and `CLAUDE.md` grew by three lines, from 99 to 102.
- PM seat, 6:38 PM EST: `git diff --stat claude/review-tiers-archive b5aba31 -- docs/review-tiers-implementation-prompt.md` printed nothing, so the spec in the PR matches the archive.
- PM seat, 6:38 PM EST: `git show ffc5cac:CLAUDE.md | wc -l` gives 99 and `git show b5aba31:CLAUDE.md | wc -l` gives 102.
- PM seat, 6:34 PM EST: `gh pr view 369` showed `verify`, Vercel, Vercel Preview Comments and `vercel-smoke` all SUCCESS at `b5aba31`, merge state UNKNOWN, still a draft.
- PM seat, 6:36 PM EST: `origin/main` is `dc68c1d`, a github-actions[bot] sync commit at 5:45 PM that changed only `docs/sync-digest.md` and three files under `src/data/`. Per Kickoff's base-moves practice, refreshing the branch waits for Beni's word.
````

---

# Pass 1.5: the rebuttal brief for Codex (archived Mon 23 Nov 2026, about 10:30 PM EST)

Written by the PM seat (Claude Code, Opus 5.5). Pass 1 (Claude Code, `claude-fable-5-2` at
`xhigh`) posted its cold review at 7:06 PM EST as
`https://github.com/BeniCheni/kickoff/pull/369#issuecomment-7117712502`. The verdict was
"mergeable after fixes", with 0 high, 8 medium and 6 low findings. Pass 1 asked six questions,
and the PM seat added a seventh for the loose ends Pass 1 left as Beni's call. At about 10:20 PM
EST Beni answered "Yes to all seven". Those rulings are his and travel below as his.

What the PM seat checked at 10:20 PM EST:
- #369 is still a draft at `b5aba31`, with `verify`, Vercel, Vercel Preview Comments and
  `vercel-smoke` all SUCCESS. Merge state reads UNKNOWN while GitHub recomputes it against the
  new `main`.
- `main` moved to `2b624a1`, the #365 squash. It added `scripts/pm/**`, `tests/pm*.test.ts`,
  `tests/fixtures/pm/**` and `docs/pm-chores-implementation-prompt.md`. It touched none of
  #369's six files, so no refresh is needed, and a refresh still waits for Beni's word.
- All 18 paths the rulings name are tracked at `b5aba31` (`git ls-tree --name-only b5aba31 --
  <path>`). `src/curated/` holds the one file `moments.json`.

Codex works in `~/code/kickoff-review-tiers` on `codex/review-tiers`, which is level with
`origin`. The brief is delivered in chat in a four-backtick fenced block, one line per
paragraph. This copy is the archive.

```bash
codex -m gpt-6.2-sol -c model_reasoning_effort=xhigh -s workspace-write -a on-request -C /Users/benicheni/code/kickoff-review-tiers
```

````text
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/review-tiers-review-archive:docs/review-tiers-review-prompt.md`, the section headed "Pass 1.5". A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so.
Kickoff PR #369 (the review tiers, and Codex as the default builder): Pass 2, the builder's rebuttal and fix round
You are Codex on `gpt-6.2-sol` at xhigh, the builder of #369 in github.com/BeniCheni/kickoff, branch `codex/review-tiers` into `main`, working in `/Users/benicheni/code/kickoff-review-tiers`. This is Pass 2 of the six-pass 360: you answer Pass 1's cold review, finding by finding, and make the fixes. Follow `.agents/skills/kickoff-pr-review/SKILL.md` for the comment's shape (`pr-comment.md`). Where the skill and this brief differ, this brief and the tiers your own PR writes are newer. Read `CLAUDE.md` and `AGENTS.md` first. The PM seat (Claude Code, Opus 5.5) wrote this at about 10:30 PM EST on Mon 23 Nov 2026, with the head at `b5aba31`. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
READ PASS 1 FIRST. Fetch the comment with `gh api repos/BeniCheni/kickoff/issues/comments/7117712502 --jq .body` and read all of it before you change anything. It was written by Claude Code on `claude-fable-5-2` at xhigh in a fresh session, report-only. Its verdict was "mergeable after fixes": no high finding, eight medium findings and six low. Its findings table numbers them 1 to 14, and this brief uses those numbers.
BENI'S RULINGS, Mon 23 Nov 2026, about 10:20 PM EST, in his words "Yes to all seven". These are his and are not yours to contest. Make each change, and in your comment mark findings 1 to 7 "fixed per Beni's Qn" with the commit.
Q1 (finding 1). Drop `docs/v*-ideas.md` from the Tier 3 release list in `AGENTS.md`. Leave `.claude/rules/releases.md`'s `paths:` alone: it says when that rule loads, not what a release file is.
Q2 (finding 2). An `[Unreleased]` line in `CHANGELOG.md` keeps its PR's own tier. Only a new released section makes a PR Tier 3. Name it so B2's labeler can test it from the diff: a PR that adds a `## [X.Y.Z]` heading to `CHANGELOG.md` (the shape at `CHANGELOG.md:23`, `## [0.5.5] — 2026-11-14`). The outcome is ruled and the mechanism is yours. If you judge it cleaner to drop the `CHANGELOG.md` entry and let the `package.json` version bump carry every release, you may do that instead. Say which you chose and why.
Q3 (finding 3). Add `docs/roadmap-pointers.md` to Tier 3. The ruling names only that file. Do not add `docs/extra-time-proposal.md` or `docs/design-overhaul-plan.md`; say in your comment whether you think either belongs.
Q4 (findings 4 and 5). Add the Moments curation files and the `?only=` and `&date=` contract to Tier 3. The Moments files are `src/curated/**`, `src/lib/moments.ts`, `scripts/validate-moments.ts` and `tests/momentsGallery.test.ts`. The contract files are `src/lib/urlCodecs.ts`, `src/lib/useUrlState.ts`, `tests/urlCodecs.test.ts`, `tests/dom/urlState.test.tsx` and `tests/dom/clearing.test.tsx`. Pass 1 called `tests/dom/momentsGallery.test.tsx` borderline and Beni did not rule on it. Read its assertions at lines 113 to 143 and decide; give the reason either way.
Q5 (finding 6). Add `vite.config.ts` and `web/vitest.config.ts` to Tier 3.
Q6 (finding 7). The implementation brief told you to keep the README's six-pass table unchanged. Beni lifts that for three rows only. They are the Pass 0, 1 and 1.5 rows at `README.md:352-354`, which must agree with the seats table and the sentence at `:365`. Pass 1's smallest change was to cut "fix commits, " from the Pass 1 row and to give Passes 0 and 1.5 to "The seat that briefs the review". Use that or something equally short. Every other row, the H2 "🤖 How it gets built" and its anchor, the rebuttal story and the 14 Nov figures (316 PRs, 981 tests) stay byte-identical to `ffc5cac`.
Q7 (Pass 1's loose ends, raised by the PM seat). Add the CI gate scripts the workflows run: `scripts/scan-offline-bundle.ts` (`ci.yml:34`), `scripts/vercel-smoke.mjs` (`preview-smoke.yml:45`, `:54`), `web/scripts/check-client.mjs` and `web/scripts/check-css.mjs` (`ci.yml:44`, `:47`). Also add `tests/sessionStartHook.test.ts`, which tests the Tier 3 hook `.claude/hooks/session-start.mjs`, and `tests/harnessSpecimen.test.ts`, which keeps synthetic rows serve-only and pins `vite.config.ts:21`. The reason is the same as Q5's: a Tier 2 PR must not be able to switch off a check that guards a Tier 3 path. Pass 1's own reason for leaving `web/vercel.json` off the list depends on `vercel-smoke` being protected.
Before you add a path, confirm with `git ls-files <path>` that it matches at least one tracked file. All 18 matched at `b5aba31` when the PM seat checked.
FINDINGS 8 TO 14 ARE YOURS TO ANSWER. For each one, say accept, contest, or accept but contest the characterisation, and give the evidence: the command and what it printed. Fix what you accept. Beni has not ruled on any of them, so a contest you can support is a fine answer, and Pass 2.5 will carry it to him.
8. No default tier. Pass 1 proposed one sentence in `AGENTS.md`: "Anything no tier names is Tier 2." Make it agree with the README's tier table.
9. Report-only for a Tier 3 Pass 1 is stated only in the README's seats table. Pass 1 proposed adding to `AGENTS.md:47`: "Pass 1 is report-only and the builder commits every fix."
10. The `README.md` release entry (`AGENTS.md:85-86`) is scoped by content and uses words the README does not. Pass 1 proposed naming what a labeler can grep: the `badge/version-` line, the `What it does today (vX.Y.Z)` heading, and the list under `Lineage`. Say whether `README.md:47` and `:388`, which also state the version, belong.
11. Tier 0 is worded two ways. Pass 1 proposed: "A PR the scheduled sync workflow opens from `sync/scheduled`, containing only `src/data/**` and `docs/sync-digest.md`." Use the same wording in the README and `AGENTS.md`.
12. The glob dialect is unnamed. Pass 1 proposed: "Globs are gitignore-style, as in `.claude/rules/*.md`: `**` crosses folders and `*` does not."
13. The README's voice: "Beni" appears on 7 lines of a README written in the first person, and `:31-33` reads as if only sensitive changes get the other vendor's cold read. This is Beni's voice, so change nothing. In your comment, say whether `:31-33` is accurate against the tier table, so Pass 2.5 can put a one-word question to him.
14. At 390 px on GitHub the tier table is 1,458 px tall. Pass 1 proposed shortening the Tier 2 cell, or moving its procedure to a sentence under the table. If you change it, re-measure.
OUT OF SCOPE. Pass 1's list "For the skill audit" (every place `.claude/skills/kickoff-pr-review/` contradicts the new Tier 2 or a report-only Pass 1) belongs to the pending skill audit, not this PR. Do not touch `.claude/skills/` or `.agents/skills/`. The do-not-touch list from the implementation brief still holds: `.claude/skills/`, `CHANGELOG.md`, `src/`, `web/`, `studio/`, `.github/` and `src/data/`. Adding a path to the Tier 3 list edits `AGENTS.md` and the README, not the files the path names. Pass 1's other Beni's-call items do not join the list unless a ruling above names them. Those are the `tsconfig*.json` files, `web/vercel.json` and `web/next.config.ts`.
THE BASE MOVED. `main` is now `2b624a1`, the squash of #365 (B5, the PM chores). It added `scripts/pm/**`, `tests/pm*.test.ts`, `tests/fixtures/pm/**` and `docs/pm-chores-implementation-prompt.md`, and it touches none of #369's six files. Do not rebase onto `main` or merge it in; a refresh waits for Beni's word. If GitHub reports a conflict, stop and report it. Read those new paths with `git ls-tree -r --name-only origin/main -- scripts/pm tests` and say in your comment whether any belongs in Tier 3 or falls to the default from finding 8. Do not add them.
HOUSE RULES. `npm run typecheck` and `npm test` green at every commit, with the real counts. `CLAUDE.md` may end at most four lines above its 99 at `ffc5cac`; it is 102 now. Every README code block fits 30 columns. Repo prose stays wrapped in its existing style. Check the touched links and anchors render on GitHub at the new head with `gh api 'repos/BeniCheni/kickoff/contents/README.md?ref=<sha>' -H 'Accept: application/vnd.github.html'`, and the same for `AGENTS.md`. Run the docs smoke pass from `CLAUDE.md`: one lens, theme and tab at 390 px and one at about 1,000 px, with `scrollWidth === innerWidth` and the viewport set before load. After your edits, re-run Pass 1's item 5(a): every Tier 3 entry matches at least one tracked file, and give the new counts of entries, files reached and test files named. Commit as yourself on every commit: `git -c user.name=Codex -c user.email=noreply@openai.com commit`, never as Beni and never through `git config`. Write commit messages that say what changed and why. Push to `codex/review-tiers`.
THE PR BODY. Update it to match the head: the new Tier 3 list, Beni's seven rulings named as his with their date, and Tier 2 still named as the PM seat's resolution waiting for his word at Pass 3. Keep the "deliberately not done" list honest, and add the skill-audit items there with a pointer to Pass 1's comment.
THE COMMENT. Leave one PR comment on #369 in `pr-comment.md`'s shape, with one row for each of the 14 findings: accept or contest, the evidence, and the fix commit. Give the head you read at the start (`b5aba31`) and the head after your fixes. Include the test counts, the smoke pass, the 5(a) re-run, your answers to the Q2, Q3, Q4 and base-move questions above, and a "Not verified" list. Then stop and reply in this chat with the comment's link, the new head SHA and your verdict. Do not mark the PR ready, and do not merge it. Pass 2.5 is a fresh Claude Code session on `claude-opus-5-5` that re-runs everything at your head and writes nothing, and Beni's word merges.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is Pass 1's, from its comment. The second is the PM seat's, with the command and the time it ran.
- Pass 1: the Tier 3 list has 75 entries, 8 globs and 67 literal paths; each matches a tracked file; together they reach 109 of 1,061 tracked files, 44 of them test files.
- Pass 1: replaying the 30 human PRs merged 1 to 23 Nov against the list, 19 reach Tier 3, and 5 reach it only through `docs/v0.2.6-ideas.md` (#314, #315, #325, #329, #344).
- Pass 1: all 244 bot commits on `origin/main` changed only `src/data/**` and `docs/sync-digest.md`.
- Pass 1: 0 of the 8 globs match differently as a gitignore-style glob than as a git pathspec on today's tree.
- PM seat, about 7:10 PM EST: `.claude/rules/releases.md:33` says the ideas file is "a ranked candidate list, not a release scope"; `.github/PULL_REQUEST_TEMPLATE.md:15` asks for an `[Unreleased]` line when behaviour changes; `git ls-files 'docs/v*-proposal.md'` lists six files, the newest for v0.4.0; `git log -1 -- docs/roadmap-pointers.md` is `15ac9b6` (#350).
- PM seat, about 7:10 PM EST: `tests/momentsGallery.test.ts:13-17` asserts that a postponed, cancelled, suspended or abandoned fixture has no known kickoff; `vite.config.ts` holds `test.projects` from line 79; #314's only file is `docs/v0.2.6-ideas.md`.
- PM seat, 10:20 PM EST: `gh pr view 369` shows head `b5aba31`, still a draft, `verify` and the three Vercel checks SUCCESS, and merge state UNKNOWN; `git diff --name-only dc68c1d 2b624a1` lists 17 files, none of them among #369's six.
````

---

# Pass 2.5: the synthesis opener (archived Tue 24 Nov 2026, about 10:35 AM EST)

Written by the PM seat (Claude Code, Opus 5.5). Codex posted Pass 2 at 11:15 PM EST on Mon 23
Nov as `https://github.com/BeniCheni/kickoff/pull/369#issuecomment-7121851248`, with one fix
commit, `57c1531` ("Clarify review tiers after the cold review"). That commit changes
`AGENTS.md` and `README.md`, +40/−21. Codex marked findings 1–7 fixed per Beni's Q1–Q7. It
accepted 8–12 and 14, and accepted 13 but contested how Pass 1 characterised it. Its verdict was
"mergeable after fixes", pending Pass 2.5 and Pass 3.

What the PM seat checked between 10:25 and 10:30 AM EST:
- `gh pr view 369`: head `57c1531`, still a draft, with `verify`, Vercel and Vercel Preview
  Comments SUCCESS. Merge state reads UNKNOWN.
- `main` is `cfff1c2`, past `2b624a1` (#365), `425abcf` (#376, which also touches
  `docs/README.md`) and one bot sync. `git merge-tree --write-tree origin/main 57c1531` exits
  clean.
- The diff `b5aba31..57c1531` matches Pass 2's description. One added line is 103 characters
  (`AGENTS.md:91`). No code fence changed.

The worktree exists: `git worktree add --detach /Users/benicheni/code/kickoff-pr369-synthesis
57c1531…` ran at 10:26 AM EST. Pass 2.5 is a fresh session that wrote neither the build nor the
fixes. Delivered in chat in a four-backtick fenced block, one line per paragraph. This copy is
the archive.

```bash
cd /Users/benicheni/code/kickoff-pr369-synthesis && claude --model claude-opus-5-5 --effort xhigh
```

````text
/kickoff-pr-review 369 --pass 2.5 --no-merge
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/review-tiers-review-archive:docs/review-tiers-review-prompt.md`, the section headed "Pass 2.5". A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so. If the command above did not load the skill, read `.claude/skills/kickoff-pr-review/SKILL.md`, `executive-brief.md`, `pr-comment.md` and `browser-matrix.md` and follow them as written.
Kickoff PR #369 (the review tiers, and Codex as the default builder): Pass 2.5, the synthesis
You are Pass 2.5 of the 360 cycle for PR #369 in github.com/BeniCheni/kickoff, branch `codex/review-tiers` into `main`. You are a fresh Claude Code session on `claude-opus-5-5` at `--effort xhigh`, and you wrote none of this PR: not the build, the fixes, Pass 1 or the briefs. Beni started you in `/Users/benicheni/code/kickoff-pr369-synthesis`, a detached worktree at the Pass 2 head `57c15316559124a5509612fa5a639f4048b58563`. Name the model and effort that actually ran at the top of your comment. Read `CLAUDE.md` and `AGENTS.md` first; at this head they state the tiers this PR writes. The PM seat (Claude Code, Opus 5.5) wrote this at about 10:35 AM EST on Tue 24 Nov 2026. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverables: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment or the Executive Summary Brief.
WHAT YOU MAY WRITE. One short PR comment on #369, and the Executive Summary Brief delivered in chat. Nothing else. Push no commit, edit no file, and do not touch the PR body, labels or draft state. The skill's §9 retro and §6 ideas rows are writes to the branch, so put any retro point in your comment instead. `.claude/skills/` belongs to the pending skill audit.
THE MERGE IS BENI'S. #369 is Tier 3 because it edits `CLAUDE.md`, `AGENTS.md` and `.claude/rules/releases.md`. Under the tiers at this head, a Tier 3 merge takes Beni's word. The skill's Pass 2.5 gate would auto-merge a non-release, and on this point the tiers outrank it. Do not merge, do not arm auto-merge, and do not mark the PR ready. Score every gate clause anyway, so Beni can see which ones hold. Then escalate, with the handoff block from §7 step 8: the squash title and body ready to paste, with both trailers.
THE CYCLE SO FAR. Read all three in full before you re-run anything:
- Pass 1 (Claude Code, `claude-fable-5-2` at xhigh, report-only): `gh api repos/BeniCheni/kickoff/issues/comments/7117712502 --jq .body`.
- The Pass 1.5 brief, with Beni's seven rulings: the section headed "Pass 1.5" in the archive above.
- Pass 2 (Codex, `gpt-6.2-sol` at xhigh): `gh api repos/BeniCheni/kickoff/issues/comments/7121851248 --jq .body`.
Then read the PR body, `git diff b5aba31 57c1531` (the fix round) and `git diff ffc5cac 57c1531` (the whole PR against its merge base).
WHAT TO RE-RUN. Every number in your brief comes from a command you ran. A number you could not re-run goes under "not verified".
1. The house. Run `npm ci` first, because a sibling worktree does not share `node_modules`. Then run `npm run typecheck` and `npm test` with the real counts, and read `verify` at the tip. GitHub shows the Vercel check as SUCCESS, but Pass 2 says Vercel reported "Canceled by Ignored Build Step", so there is no `vercel-smoke` result at this head. Find the ignore command in the repo, say why it skipped this head when `b5aba31` got a `vercel-smoke` result, and say whether a docs-only head without one weakens anything. Run the docs smoke pass from `CLAUDE.md`: one lens, theme and tab at 390 px and one at about 1,000 px, with `scrollWidth === innerWidth` and the viewport set before load.
2. Beni's rulings, exactly. For each of Q1 to Q7, check that the head does what the Pass 1.5 brief says Beni ruled: no less, and no more. In particular, Q3 adds only `docs/roadmap-pointers.md`. Q6 changes only the Pass 0, 1 and 1.5 rows of the six-pass table, and everything else the implementation brief froze stays byte-identical to `ffc5cac`: the H2 "🤖 How it gets built" and its anchor, the other rows, the rebuttal story and the 14 Nov figures (316 PRs, 981 tests).
3. Findings 8 to 14. Re-check each "fixed" row at the head. For finding 13 Codex accepted but contested the characterisation; state both positions and the evidence each has, and turn it into a one-word question for Beni.
4. The builder's judgments, which Beni confirms at Pass 3. Judge each on the merits: Q2's mechanism (an added `## [X.Y.Z]` heading rather than relying on `package.json`); Q3's view that `docs/extra-time-proposal.md` and `docs/design-overhaul-plan.md` stay Tier 1; Q4's inclusion of `tests/dom/momentsGallery.test.tsx`, which Beni did not rule on; and the call that #365's `scripts/pm/**` and `tests/pm*` paths fall to the Tier 2 default.
5. The Tier 3 list, re-derived. Pass 2 says 93 entries (8 globs and 85 literals), reaching 125 of 1,061 tracked files, with 51 test files named (31 node, 17 DOM, 3 web). Re-run Pass 1's item 5(a) yourself with `git ls-files`: every entry matches at least one tracked file. Also check that the globs give the same result read gitignore-style as the new `AGENTS.md:58-59` says. Say whether a labeler could apply the `CHANGELOG.md` and `README.md` rules from a diff alone.
6. One story everywhere. The README tier table and `AGENTS.md` "Review tiers" must agree on every tier: Tier 0's wording, Tier 1, Tier 2 including "Anything no tier names is Tier 2", and Tier 3 with its report-only Pass 1. The six-pass table must agree with the seats table and the sentence after it. Tier 2 must still be presented as the PM seat's resolution waiting for Beni's word at Pass 3, not as his ruling, in the README, `AGENTS.md` and the PR body.
7. The docs constraints. `CLAUDE.md` may end at most four lines above its 99 at `ffc5cac`; it is 102. Every README code block fits 30 columns. Count columns, not bytes, because the banner's box-drawing characters are three bytes each. Check rendered links and anchors at the head, for example with `gh api 'repos/BeniCheni/kickoff/contents/README.md?ref=57c1531' -H 'Accept: application/vnd.github.html'`, and the same for `AGENTS.md`. Repo prose stays wrapped; judge the one added line that runs to 103 characters. Re-measure the tier table on GitHub at 390 px, where Pass 2 reports 1,146 px tall with 2 px of sideways overflow, and say whether the 2 px matters.
8. The base. `main` is now `cfff1c2`. Since `ffc5cac` it took #365 (`2b624a1`), #376 (`425abcf`, which also touches `docs/README.md`) and bot sync commits. Run `git merge-tree --write-tree origin/main 57c1531` and read GitHub's merge state. A refresh waits for Beni's word. If one is needed before he merges, make it a one-word question.
9. Scope. Nothing changed under `.claude/skills/`, `.agents/skills/`, `CHANGELOG.md`, `src/`, `web/`, `studio/`, `.github/` or `src/data/`. Confirm with `git diff --stat ffc5cac 57c1531`.
THE DELIVERABLES. First, one short PR comment: the model and effort that ran, the head, the decision (escalated, with the reason), the gate clauses scored, anything still contested, and a "not verified" list. Then the Executive Summary Brief in chat, in `executive-brief.md`'s shape, written for Beni, decision first. It is not a release, so "What ships" is the routing change in plain words. "Where it sits" says what this unblocks: B2 (the labeler) and B4 wait for #369 to merge, and the skill audit owns Pass 1's list. End with the questions for Beni, each answerable in one word. Include at least these: confirm Tier 2 as the PM seat resolved it; confirm the builder's Q4 inclusion and Q2 mechanism; finding 13's README sentence; and the merge. Then stop. Do not merge.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is Codex's, from Pass 2. The second is the PM seat's, with the command and the time it ran.
- Codex: `npm run typecheck` clean and `npm test` 1,058 tests in 82 files on Node 24.15.0, at both `b5aba31` and `57c1531`.
- Codex: CI run 45324592007 passed `verify` at `57c1531`; Vercel Preview Comments passed; Vercel reported "Canceled by Ignored Build Step".
- Codex: 93 Tier 3 entries, all matching, covering 125 of 1,061 tracked files and naming 51 test files.
- Codex: all eight globs agree between `git ls-files` and `git check-ignore --no-index` at both heads.
- Codex: the GitHub tier table at 390 px went from 1,458 px tall with 8 px of overflow to 1,146 px with 2 px.
- Codex: 244 bot commits on `origin/main` touched only the three `src/data/` snapshot files, 152 of them also the digest.
- Codex: a smoke pass of Poster, light, Fixtures at 390 px and Ledger, dark, Table at 1,000 px, both with `scrollWidth === innerWidth`, 1,401 fixtures and no console errors.
- Codex: the six-pass table differs from `ffc5cac` only in rows 0, 1 and 1.5.
- PM seat, 10:25 AM EST: `gh pr view 369` showed head `57c1531`, a draft, `verify`, Vercel and Vercel Preview Comments SUCCESS, and merge state UNKNOWN. `git diff --stat b5aba31 origin/codex/review-tiers` showed `AGENTS.md` and `README.md`, +40/−21.
- PM seat, 10:26 AM EST: `git merge-tree --write-tree origin/main origin/codex/review-tiers` exited clean with `origin/main` at `cfff1c2`. `git diff --name-only 2b624a1 origin/main` listed `docs/README.md`, `docs/pm-chores-review-prompt.md`, `docs/sync-digest.md` and the three `src/data/` files.
- PM seat, 10:28 AM EST: of the lines `57c1531` adds outside tables, only `AGENTS.md:91` runs past 101 characters, at 103. `git show 57c1531:CLAUDE.md | wc -l` gives 102. `git diff -U0 ffc5cac 57c1531 -- README.md` adds no code fence.
````

---

# Pass 3 and the merge (recorded Tue 24 Nov 2026, about 11:20 AM EST)

Pass 2.5 (Claude Code, `claude-opus-5-5`, a fresh session in `~/code/kickoff-pr369-synthesis`)
posted at 11:07 AM EST as
`https://github.com/BeniCheni/kickoff/pull/369#issuecomment-7137149600`. It found every "fixed"
row holding at `57c1531` and Q1–Q7 landed exactly as ruled. It raised five new low items, none
blocking, and escalated, because a Tier 3 merge takes Beni's word. Its Executive Summary Brief
went to Beni in chat with eight questions.

The PM seat re-checked at 11:11 AM EST. The head was still `57c1531`, with `verify` and both
Vercel checks green. GitHub read CLEAN and MERGEABLE, and `git merge-tree` was clean against
`main` at `b399001` (#370). `main`'s own CI was green there. The PM seat agreed with Pass 2.5 on
six calls and differed on two:
- On 5, Pass 2.5's own replay showed that 20 of 33 November PRs get the cross-vendor read
  without being sensitive changes.
- On 7, Beni's user-level instructions make Opus 5.5 the default Claude model, keeping Fable
  5.2 for sensitive-path Pass 1 and hard design.

Beni answered "Yes, as you recommend" at about 11:12 AM EST:
1. Tier 2 as the PM seat resolved it: **confirmed**.
2. `tests/dom/momentsGallery.test.tsx` in Tier 3: **kept**.
3. An added `## [X.Y.Z]` heading in `CHANGELOG.md` sets Tier 3: **kept**.
4. The two planning docs stay Tier 1 and #365's PM paths stay Tier 2: **kept**.
5. `README.md:31-33`: **Rewrite**, to Pass 2.5's sentence, in a follow-up docs PR.
6. Non-Markdown files under `docs/`: **Two**, as written.
7. Claude's build model in the seats table: **Opus 5.5**, in the same follow-up.
8. Merge at `57c1531` with no refresh: **Yes**.

The PM seat ran Pass 2.5's handoff block. `gh pr merge 369 --squash --match-head-commit
57c1531…` merged at 11:12 AM EST as `605ef5d`, with the squash body recording all eight calls.
Its tree equals `git merge-tree --write-tree b399001 57c1531`. On `main` after the pull,
`npm run typecheck` was clean, `npm test` passed 1,167 tests in 88 files, and `npm run build`
was green. No tag, because this is not a release. B2 (the labeler) and B4 are unblocked.

Owed: the Tier 1 docs PR for calls 5 and 7, which Beni gave to Codex to build. It also lands
this record in `docs/`. After the merge, Beni's user-level paragraph saying the 22 Nov rulings
are "not yet in those tables" is out of date; that file is his.
