# PR #330 — the PM seat's Pass 1 brief for the overhaul's PR 1, tokens and type (archived Mon 16 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) in the Track A planning session, after Cursor
opened PR #330 from
[design-overhaul-pr1-implementation-prompt.md](design-overhaul-pr1-implementation-prompt.md).
Pass 0 of the 360 cycle in `/kickoff-pr-review`. The PM seat read the PR at about 2:10 PM EST:
- head `e34e032`: eight Cursor commits and one merge of `main` at `e6fe22f`;
- 52 files and +1742/−56 against `overhaul/second-edition` (still `2fd2466`), of which 42 files
  and +1369/−55 are PR 1's own (`git diff e6fe22f e34e032`);
- `verify`, the Vercel deployment and `vercel-smoke` green;
- no review comment yet.

It read every hunk outside the font binaries and licence texts, read the PR body, and ran no
test, build or browser. Before writing, it checked that no other session was reviewing #330 or
writing its brief.

Beni first relayed the PR as "Cursor reviewed the PR 1". The commits, the body and the empty
review list show Cursor *built* it, as the build brief asked. The relayed text was the build
session's note on its evidence jobs. It carries one fact the body leaves out: an
`evidenceWeeks.test.ts` timeout under load. The brief puts that note in the sealed appendix as
B11.

Routing and timing. Pass 1 runs in a fresh Claude Code session on `claude-fable-5-2` at
`xhigh`. Beni approved the routing amendment to the plan's section 3 on Sun 15 Nov 2026. It is
in PR #328, not yet merged, and puts Cursor's Pass 2 on `grok-4.7-xhigh` by Wed 18 Nov, before
the tier change on Thu 19 Nov. So this pass is asked to post by Tue 17 Nov in the evening.

Beni's default output style is Learning, so the brief turns it off for the pass.

Delivered in chat in a four-backtick fenced block, one line per paragraph. This copy is the
archive.

---

````text
Kickoff design overhaul — PR #330 (overhaul PR 1, tokens and type): Pass 1, cold review

You are Pass 1 of the 360 cycle for PR #330 in github.com/BeniCheni/kickoff: a fresh Claude Code session that built none of this. Run /kickoff-pr-review on #330 with --no-merge; the skill outranks this brief on process, and this brief adds the PR's particulars. Run on claude-fable-5-2 at xhigh, and name the model and effort that actually ran at the top of your comment. The PM seat (Claude Code, Opus 5.5) wrote this on Mon 16 Nov 2026 at about 2:10 PM EST, from #330 at e34e032, with verify, the Vercel deployment and vercel-smoke green and no review yet. It read every hunk outside the font binaries and licence texts and ran no test, build or browser. Treat the repository as ground truth and this brief as a map of it. Run TZ=America/New_York date before writing any date.

OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment or in any commit.

BEFORE YOU START. Any of these stops you, and you tell Beni.
- A Pass 1 comment already exists on #330, or another session is reviewing it.
- The head is not e34e032. If commits landed since, review them too and list them.

WHERE TO WORK. Make your own worktrees: one at the PR's head and one at e6fe22f. Never use Beni's main checkout. preview_start serves the main checkout, not a worktree, so start every server from your own worktree, set every origin the runner reads (KICKOFF_VITE_ORIGIN, KICKOFF_NEXT_ORIGIN and KICKOFF_HARNESS_ORIGIN) explicitly, and confirm each listener's working directory with lsof. PR 1's own change is git diff e6fe22f e34e032 (42 files, +1369/−55). The PR's diff against overhaul/second-edition also shows #329's docs, because that branch is still at 2fd2466 and Cursor merged main at e6fe22f. e6fe22f and 2fd2466 have the same src/.

THE DEADLINE. Beni's Cursor tier changes on Thu 19 Nov 2026. Under the routing he approved on Sun 15 Nov (plan section 3, "Amended Sun 15 Nov 2026"; it is in PR #328, not yet merged, so read it with git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md), Cursor's Pass 2 on grok-4.7-xhigh lands by Wed 18 Nov, after your comment and a Pass 1.5 brief built from it. Post by Tue 17 Nov in the evening, EST. Do not buy the date with depth: what you could not run goes in "Not verified". Write each finding so Cursor can reproduce it cold: file and line, the command, expected and observed.

WHAT BENI RULED, named as his. In docs/design-overhaul-plan-review.md: 1 Branch and 2 Ten (PR 1 goes into the integration branch, and main and Pages do not change until the release); 3 Oswald (the wordmark stays Oswald, and Abril Fatface is not fetched for one word); 9 Self (fonts self-hosted under public/fonts/, each family with its OFL.txt, Inter included, and no page contacts a font host); 12 Six (v0.6.0 is numbered at the release, so this PR has no version, no tag and no CHANGELOG release section); 19 Repaint (Moments takes the second edition's tokens in PR 2). From PR 0's cycle (git show claude/track-a-archive:docs/design-overhaul-pr0-review-prompt.md, a local branch in this repository): R1 (unsettled rows' clocks are PR 3's), R2 (the loss pip is PR 4's, so --enforce fails on its 16 samples until then), R3 (the smoke's Previous contract: a button whose accessible name is exactly "Previous", in the server HTML of "/" only). Standing, in CLAUDE.md: never render a kickoff time the league has not set, never invent, both clocks from one instant, and never weaken a data-honesty assertion. Plan section 3: Beni's word merges every overhaul PR, after Cursor's Pass 2 and Codex's Pass 2.5. So do not approve, merge, enable auto-merge, bump or tag. Not ruled: a ruleset for overhaul/second-edition, which is Beni's.

SPEC OF RECORD. The build brief (git show claude/track-a-archive:docs/design-overhaul-pr1-implementation-prompt.md). docs/design-overhaul-plan.md: sections 2(a), 3 (PR 1's row, its evidence line and the amendment), 4.2, 7.4, 8.2, 8.3 row 1 and 10.1. The handoff, docs/design/5-handoff/second-edition-handoff.md, sections 2 and 4, for every token value and every measured pair. Precedence: Beni's rulings, then the plan, then the handoff's values, then the build brief. The PR's "Where the repository won" list names ten departures from the brief; judge each, and note every resolution.

FACTS FROM THE PM SEAT'S READ that are easy to miss.
- A failure the body leaves out. The build session told Beni in chat that tests/evidenceWeeks.test.ts timed out at 5 seconds under load, and that a later full run passed. The node vitest project sets no testTimeout (vite.config.ts, the 'node' project; only 'dom' has 20_000), so vitest's 5-second default applies. It is PR 0's test, and verify runs it on every PR, sync PRs included. Reproduce it under load, time it, and say whether it can turn verify red.
- The web half was not re-run at the head. Per the body, web typecheck, web test and check:client last ran on the commit before e34e032, and CLAUDE.md wants every commit green. Run both halves at every commit of the PR.
- The stock rule. In src/shell.css, the black-voice block matches [data-stock='black'] and dark-page selectors. Nothing restores the paper voices for a [data-stock='paper'] element on a light page, and custom properties inherit. So on a light page, a paper element nested inside a black one inherits black voices. The CSS comment covers only the dark case. No test exercises the stock axis's cascade.
- Layout shift. With Oswald delayed 1.5 s, this head scores 0.051, 0.198 and 0.049 at 360, 375 and 390. Ideas row 125 measured 0.108, 0.047 and 0.046 on ddd9a37. So 375 is four times worse and over 0.1, while 360 improved. The size-adjusted Arial fallback brought 375 to 0.051, but it was withdrawn: Oswald's subset has no U+2192, so the fallback's Arial drew the arrow in the Table's "Form →" header. The build brief said to ship a fallback only if it lowers the score and changes nothing once the real face has loaded.
- The offline and single files each grew by 273,371 bytes (1,001,779 to 1,275,150, and 1,052,317 to 1,325,688). They inline Oswald, Inter and Kickoff Mono 500 and 600. Plan 7.4 recommended inlining only Oswald, Plex 500 and Caslon 400. The brief allowed either inlining or a system fallback for each rendered face, provided the PR said which.
- Code left without a caller. After the fallback's withdrawal, public/faces.css has no local() face, yet scripts/inline-faces.ts still copies local() faces and their overrides. web/scripts/evidence.mjs keeps a network array that nothing writes now.
- Two copies of the fonts. web/scripts/copy-faces.mjs runs inside web/scripts/write-shell-css.mjs, so in both web dev and web build. It copies public/fonts into the gitignored web/public/fonts and rewrites url("./fonts/ to url("/fonts/. The Vercel preview answers 302 without the bypass secret, and that secret is not yours to seek, so check the Next app's /faces.css and one font file on a local production build instead, and say so.
- tests/vercelIgnore.test.ts pins public/faces.css as a shared build input but no file under public/fonts/, although web/scripts/vercel-build-inputs.mjs lists both.
- overhaul/second-edition has no ruleset or branch protection (the branches API reports protected: false). verify is green on this PR, but nothing requires it. Put it in the comment for Beni, and change nothing.
- In the handoff's table, fb-alarm and fb-blood are both #B3121B on paper (second-edition-handoff.md:46-47), so the PR's equal values are not a typo. The table gives hairlines as ranges ("18 to 20%", "50 to 55%"), and the PR chose 19% and 52%.

QUESTIONS THIS PASS SHOULD ANSWER, beyond redoing each receipt yourself.
- (a) The pairs. Count the handoff's measured pairs yourself: the brief counted 34, and the PR has 34 allowed and 5 refused. Is every pair computed from the tokens as written in src/shell.css, in both voices, rather than from literals? Break a dark-voice token and the scrim's alpha, neither of which the receipts touched, and watch a test fail.
- (b) The stock axis. Does the handoff nest paper inside black anywhere: sections 2 and 5, the cover, its band, the plates, the closed book? Whatever the answer, what pins the cascade before PR 2 first renders an fb- token?
- (c) Layout shift. Re-measure main (e6fe22f) and the head the same way, on the same machine, and give the method. Why is 375 alone worse, for example a line that wraps? Would a fallback whose unicode-range matches Oswald's subset keep the arrow on the system face and keep the gain? Does shipping 0.198 meet the plan's PR 1 evidence line? Recommend; the call is Beni's.
- (d) Glyph coverage against the data. Collect every character in src/data/fixtures.json and the standings snapshot: team names, venues and competition labels. Check that each rendered face's cmap covers it, and name any character that falls to a system face. Google served its subsets by unicode-range. These files are the union of latin and latin-ext (public/fonts/RECORD.md).
- (e) The files and their licences. For each of the ten files, re-derive the source and command from RECORD.md. If fontTools is available outside the repository, re-run one subset and compare the cmap and name tables. Never add fontTools to package.json. Do the renamed families (Kickoff Display, Kickoff Mono) keep "Abril" or "Plex" in any name the OFL reserves: name IDs 1, 4, 6, 16 and 17? Does Inter's OFL really reserve no name?
- (f) Glyphs and metrics. Inter is the v4.1 release, which the body says "does not match the face Google serves". Is "antialiasing" the true cause of the 175 small diffs, and of vite-week-quiet-ledger-light-1000's 1,045 strong pixels and next-poster-dark-moments-1000's 4,358, or did glyphs or advances change? The plan says nothing renders differently in PR 1. Diff the cmap and advance widths of both Inters, and look at those two captures yourself.
- (g) The first edition's mono. --font-mono is now Kickoff Mono at 500 and 600 roman only, and --fb-mono is Kickoff Mono Text, which adds 400 and 400 italic on the same files. Does every mono span on Fixtures, Table and Moments render as it did on main, with unweighted code at 500 and italics synthetic?
- (h) Preload and loading. In both apps, does each preload href equal the resolved @font-face src? Does Chrome log an unused-preload warning on any tab at any width, and would the runner's console gate catch it? Does anything in web/, tests/harness or the built files still name a Google font host? Studio is out of scope.
- (i) The smoke hardening. Is a tag name ended correctly by a tab, a newline and "/>"? Are template and noscript skipped in both head and body? Do the three new rejection cases fail on the old parser and pass on the new one, and does a real Previous beside a template's still pass?
- (j) The host gate. FONT_HOSTS is gone, and an offline console error now fails a cell outright. Is anything weakened? Is the new expectation in tests/coldLoad.test.ts a strengthening for every case it replaced?

FIX SCOPE. Only PR 1's own files:
- src/shell.css, the fb- block and the --font-mono line only;
- public/faces.css and public/fonts/RECORD.md;
- scripts/inline-faces.ts and web/scripts/copy-faces.mjs;
- the font links in index.html, offline.html, web/app/layout.tsx and the two harness pages;
- scripts/rendered-contrast.mjs, web/scripts/evidence.mjs, scripts/vercel-smoke.mjs, scripts/scan-offline-bundle.ts, vite.config.ts's inline plugin and web/scripts/vercel-build-inputs.mjs;
- the tests this PR adds or touches;
- tests/evidenceWeeks.test.ts, only to make it cheaper or to give it a timeout you can justify, with no assertion changed.
Never touch any component or other file under src/, src/data/, .github/, studio/, package.json or the lockfile. No version, no tag, no CHANGELOG section. Never replace a font binary: re-subsetting is a contested choice, so it goes in the comment, not a commit. Never weaken an assertion. Commit as Claude <noreply@anthropic.com>, each commit green on typecheck and npm test. If you push, list your SHAs at the top of the comment, because the branch then moves under Cursor's Pass 2. Contested choices go in the comment for Pass 2 and Beni: the stock cascade's design, the fallback, the offline inlining set and the ruleset.

THE COMMENT. Follow pr-comment.md, and state the verdict on the first line. Say which of the checks and questions above you ran and which you could not. Add a short "For Beni" list: the integration branch's ruleset, the layout-shift call and the offline file's size.

SEALED APPENDIX — claims to re-derive independently, never conclusions. Reach your own result for each, and say when one does not reproduce.
- B1 (builder): 34 allowed pairs and 5 refused, each allowed pair at its floor and matching the handoff to two decimals; the scrim at 92% over white is #1E1E1F after 8-bit rounding.
- B2 (builder): --fb-pulp-ink set to #EBDDBE fails a test, and --fb-blood set to #F2EBDD fails a test.
- B3 (builder): ten WOFF2 files, 364,316 bytes in all, sized as the body's table says; fontTools 4.60.2; the latin and latin-ext ranges; Inter from the v4.1 zip; the Abril subset from google/fonts at 90abd17.
- B4 (builder): a cold load asks only the page's own host. Fixtures and Table fetch Oswald, Inter, Kickoff Mono 500 and 600 (203,892 bytes on disk); Moments fetches three files (178,332); no second-edition face is requested; there is no console warning.
- B5 (builder): with Oswald delayed 1.5 s, 0.051, 0.198 and 0.049 at 360, 375 and 390; with the size-adjusted Arial, 0.007, 0.051 and 0.007; with the font immediate, 0.002; the fallback was withdrawn for U+2192.
- B6 (builder): the offline and single files grew by 273,371 bytes each, and the scan passes 22 markers.
- B7 (builder): 182 captures, 175 differing by antialiased edges only (channel-sum at most 12), and each exception explained in the body.
- B8 (builder): the contrast summary is the same on both sides, 1,224 measured, 16 below the floor and 0 unread, and --enforce exits 1 on the 16 loss-pip samples only.
- B9 (builder): the JavaScript is the same 1,017,280 bytes as main's, and the parity listing differs only in index.html, the CSS, faces.css and the fonts.
- B10 (builder): on e34e032, 82 files and 1,084 tests green; the three root builds, the scan and the web checks green, some of them only on the commit before.
- B11 (builder, in chat, not in the body): evidenceWeeks.test.ts timed out at 5 seconds under load, and a later full run passed.
- P1 (PM seat): on a light page, a [data-stock='paper'] element inside a [data-stock='black'] one renders black voices.
- P2 (PM seat): the 375 layout shift regressed and ships, and a fallback limited by unicode-range might keep the gain without touching the arrow.
- P3 (PM seat): the local() branch of inline-faces.ts and evidence.mjs's network array have no caller after the fallback's withdrawal.
- P4 (PM seat): evidenceWeeks.test.ts can time out on a loaded CI runner and turn verify red on an unrelated PR.
- P5 (PM seat): some of the small pixel diffs are Inter v4.1's glyphs or metrics, not antialiasing.
````
