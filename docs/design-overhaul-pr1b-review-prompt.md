# PR #341 — the PM seat's briefs for the overhaul's PR 1b, the font split: Pass 1's cold review (archived Wed 18 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) in the Track A planning session, after Cursor
opened PR #341 from
[design-overhaul-pr1b-implementation-prompt.md](design-overhaul-pr1b-implementation-prompt.md).
Pass 0 of the 360 cycle in `/kickoff-pr-review`. The PM seat read the PR at about 10:10 AM EST:
- head `ad728bd`: five Cursor commits, in the order the brief set;
- 29 files and +857/−162 against `overhaul/second-edition` at `34b5160`, every one of them a
  file the brief gave PR 1b;
- `verify`, the Vercel deployment and `vercel-smoke` green, mergeable, auto-merge off;
- no review comment yet.

It read the new script, the inliner, the Next copy, the preload gate and its test, the hash test,
the head of `RECORD.md` and the PR body. It did not read the 149 lines added to
`public/faces.css`, the rest of `RECORD.md` or the `tests/faces.test.ts` diff, and it ran no
test, build or browser.

The routing. Cursor built #341 under Beni's ruling of Tue 17 Nov 2026 at about 10:40 PM EST to
start PR 1b and PR 2 that night, and #339 put that start on `main` at 10:52 PM. At about
11:10 PM Beni approved the amendment in PR #328, "two vendors, and no seat for Cursor or Grok",
which names Codex as 1b's builder and Claude as 2's and says "No Cursor seat was open". That
paragraph was written in the other track without knowing the two builds had started. When this
brief was written, PR 2's branch stood at `e820fd4`, nine Cursor commits and no PR. The PM seat
put the conflict to Beni beside this brief. Pass 1 is a fresh Claude Code session under both
routings, so the brief is written not to depend on his answer.

Pass 1 runs on `claude-fable-5-2` at `xhigh` and is report-only: the amendment gives every fix
round to the builder, and a pushed commit would move the branch under Pass 2. Beni's default
output style is Learning, so the brief turns it off for the pass.

Delivered in chat in a four-backtick fenced block, one line per paragraph. This copy is the
archive.

---

````text
Kickoff design overhaul — PR #341 (overhaul PR 1b, the font split): Pass 1, cold review

You are Pass 1 of the 360 cycle for PR #341 in github.com/BeniCheni/kickoff: a fresh Claude Code session that built none of this. Run /kickoff-pr-review on #341 with --no-merge. The skill outranks this brief on process, except where FIX SCOPE below says otherwise, and this brief adds the PR's particulars. Run on claude-fable-5-2 with --effort xhigh, and name the model and effort that actually ran at the top of your comment; Claude Code records both in its session file. The PM seat (Claude Code, Opus 5.5) wrote this on Wed 18 Nov 2026 at about 10:30 AM EST, from #341 at ad728bd, with verify, the Vercel deployment and vercel-smoke green and no review yet. It read the new script, the inliner, the Next copy, the preload gate and its test, the hash test, the head of RECORD.md and the PR body. It did not read the 149 lines added to public/faces.css, the rest of RECORD.md or the tests/faces.test.ts diff, and it ran no test, build or browser. Treat the repository as ground truth and this brief as a map of it. Run TZ=America/New_York date before writing any date.

OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment.

BEFORE YOU START. Any of these stops you, and you tell Beni.
- A Pass 1 comment already exists on #341, or another session is reviewing it.
- The head is not ad728bd. If commits landed since, review them too and list them.

WHO BUILT IT, AND THE ROUTING. Cursor built #341 on Grok 4.7 from docs/design-overhaul-pr1b-implementation-prompt.md, after Beni ruled on Tue 17 Nov 2026 at about 10:40 PM EST to start the build that night. At about 11:10 PM Beni approved a newer routing amendment in PR #328, which is not merged; read it with git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md, under "Amended Tue 17 Nov 2026: two vendors". It names Codex as 1b's builder and says no Cursor seat was open. That was written in another session without knowing this build had started, and the amendment's own rules say a PR never switches builder mid-build. Pass 1 is a fresh Claude Code session under both routings, so this pass is yours either way. Who holds Pass 2 and Pass 2.5 is Beni's ruling, and it does not change this pass: do not stop on it, and do not report it as a finding. The PR body asks Beni which effort the build ran at. That is his to answer, not yours.

THE DEADLINE. Post today, Wed 18 Nov 2026, by about 6 PM EST. If Pass 2 stays with Cursor, it has to run before Beni's Cursor tier changes on Thu 19 Nov. Do not buy the date with depth: what you could not run goes in "Not verified". Write each finding so the builder can reproduce it cold: file and line, the command, expected and observed.

WHERE TO WORK.
- Make your own two worktrees: git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr1b-review ad728bd, and git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr1b-review-base 34b5160. Run npm ci at the root and in web/ of each.
- Never use Beni's checkout at /Users/benicheni/code/kickoff, which holds untracked files of his, and never the builders' worktrees: kickoff-pr1b, kickoff-pr1b-base, kickoff-pr2 and kickoff-pr2-base.
- PR 2 is being built in Cursor at the same time, on cursor/overhaul-pr2-chrome, so its servers may be up. Put the head's three servers on 6573, 6574 and 6575 and the base's on 6673, 6674 and 6675. Port 5173 is Beni's, and 6073 to 6375 are the builders'.
- preview_start serves the main checkout, not a worktree. Start every server from your own worktree, set KICKOFF_VITE_ORIGIN, KICKOFF_NEXT_ORIGIN and KICKOFF_HARNESS_ORIGIN explicitly, confirm each listener's cwd with lsof, and do not stop a process you did not start.

WHAT BENI RULED, named as his.
- Mon 16 Nov 2026, the amendment in plan section 4.2: the split is a PR 1b of its own (1b); it covers all ten files (All); it is built beside PR 2 when two builder seats are free (Beside).
- Mon 16 Nov 2026, in PR 1's review: no local() face ships (ruling 3); the offline and single files carry Oswald, Inter, and Kickoff Mono 500 and 600 (ruling 4); no Caslon preload before text uses Caslon (ruling 5).
- Tue 17 Nov 2026 ("Yes, extend it"): the offline set grows by Caslon 400 and Kickoff Mono 400, to six faces, and this PR makes that change because it owns scripts/inline-faces.ts.
- Sat 14 Nov 2026, in docs/design-overhaul-plan-review.md: 1 Branch and 2 Ten (main and Pages do not change until the release); 9 Self (the fonts are self-hosted, each family with its OFL.txt, and no page contacts a font host); 12 Six (no version, no tag and no CHANGELOG section).
- From PR 0's cycle: R2, so --enforce fails on the 16 loss-pip samples until PR 4.
- Standing, in CLAUDE.md: no data-honesty assertion is ever weakened.
- Beni's word merges every overhaul PR. Do not approve, merge, enable auto-merge, bump or tag.

SPEC OF RECORD. The build brief, docs/design-overhaul-pr1b-implementation-prompt.md. docs/design-overhaul-plan.md: section 4.2 and its Mon 16 Nov amendment, section 3's PR 1b row and evidence entry, and section 8.3's row 1b. The end of docs/design-overhaul-pr1-review-prompt.md, which lists what PR 1's review handed this PR. public/fonts/RECORD.md as it stood at 34b5160. Precedence: Beni's rulings, then the plan, then the build brief. The body names two departures from the brief: brotli pinned beside fontTools, and Kickoff Mono 400 inlined under the family Kickoff Mono Text. Judge each, and every other you find, and note the resolution.

FACTS FROM THE PM SEAT'S READ that are easy to miss.
- Kickoff Mono Text is not new. PR 1 made it the second edition's mono: --fb-mono at src/shell.css:170 is 'Kickoff Mono Text', and public/faces.css at 34b5160 gives that family 400, 400 italic, 500 and 600, the last two on the same files as Kickoff Mono's 500 and 600. So the brief's "Kickoff Mono 400" is that family's 400. PR 2's unopened branch (e820fd4) sets its provenance line in var(--fb-mono) at 400, which the face this PR inlines serves. But scripts/inline-faces.ts keys its rules by file (bySrc), and selected() keeps Kickoff Mono Text to 400, so that the Medium and SemiBold files do not widen Kickoff Mono's weights. The offline and single files therefore carry no Kickoff Mono Text 500 or 600, and PR 2's branch also sets .staleness code in var(--fb-mono).
- Two measures of bytes. The body's cold-load figures, such as 108,868 for Vite's Fixtures, are bytes on the wire. RECORD.md's 107,588 for the same four files are file bytes, about 320 bytes a file apart. Say which one you measured.
- Kerning stops at a font boundary. On the UEFA week, the venue Şükrü Saracoğlu Stadium now draws Ş and ğ from Inter-ext.woff2 and its other letters from Inter.woff2. Kerning and contextual features do not act across two fonts, so pairs such as Şü, oğ and ğl lose what the base's single file gave them. The body's 182 captures may not include that row.
- The gate reads text nodes only. The new probe in web/scripts/evidence.mjs walks the text nodes under body and files each under the first family of its computed font-family. Generated content (::before and ::after), form-control values and the later families in a stack are not read.
- The local( refusal is now one regex over the whole stylesheet, so it also matches a CSS comment that names local(.
- A rename the brief did not list. scripts/split-font-ranges.py also renames "Inter Variable" to "Inter" in Inter's name table. The brief named only the Abril and Plex renames.
- The base disagreed with itself once: offline-fixtures-light-390 differed by 42 pixels between two base runs, and the head did not.
- PR 2 is building beside this PR. Do not review it. Whichever of the two merges second reconciles RECORD.md's line on which pages load which files, and the one tests/faces.test.ts case that pins the preload list.

QUESTIONS THIS PASS SHOULD ANSWER, beyond redoing each receipt yourself.
- (a) Reproducible from source. In a throwaway directory outside the repository (mktemp -d), make a venv with fonttools==4.60.2 and brotli==1.2.1, run the script with --out into an empty directory, and compare all twenty outputs byte for byte with the committed files. Give your Python version beside RECORD.md's 3.9.6. Never add fontTools to package.json. Does the script stop on a wrong hash? Show it with one changed character in a held hash, in a scratch copy of the script.
- (b) Names and licences, the body's one unchecked box. For all twenty files, list name IDs 1, 4, 6, 16 and 17, and confirm that none holds "Abril" or "Plex". Compare each latin half's name table with the file it replaces at 34b5160: does anything differ? Are IDs 0, 7, 8, 9, 11, 13 and 14 upstream's wording? Is each family's OFL.txt beside its files and unchanged, and does the hash test cover it?
- (c) The ranges. Fetch Google's css2 stylesheet for these families once with curl, from your shell; the pages still contact no font host. Are the latin and latin-ext strings exactly RECORD.md's, for every family, including those the old stylesheet did not request? Is latin together with latin-ext exactly the union at 34b5160? Name every code point the two halves share.
- (d) The data against the halves. Collect every character in src/data/fixtures.json and the standings snapshot. For each rendered face, which half serves each character, and does that half's cmap hold it? Is any character covered at 34b5160 and missing at the head?
- (e) The boundary. Capture the Şükrü Saracoğlu row on the UEFA week, on both trees, at 390 and 1000, in both lenses, and diff it. If the head differs, say whether it is kerning, and whether a reader would see it. Recommend; the call is Beni's.
- (f) The preload gate. Is its rule stated in a comment and in the PR, and is the signal it chose sound? Write these cases yourself: both halves preloaded with only latin text, which must fail the -ext; an -ext character only in ::before content; a stack whose first family has no face; a rule with no unicode-range; text set to null. Does any case pass a preload the browser never applied, or fail one it did? Does the new test fail on 34b5160's gate?
- (g) The local( refusal. Do both pinned forms fail at 34b5160 and pass at the head, on the inline path and in the Next copy? Is matching inside a comment acceptable, or should the scan skip comments?
- (h) The offline set. Do the offline and single files carry both halves of exactly six faces, each rule with its unicode-range? Opened from disk with the network off, does every character the snapshot holds draw from the same face as at 34b5160? Can the inliner as written give the offline files Kickoff Mono Text 500 and 600 when a later PR needs them, without carrying those files' bytes twice? If not, say what it would take.
- (i) The evidence. On both trees, re-run the runner in report mode and with --enforce; the font bytes per cold load for each app, tab and lens at the runner's three weeks; the -ext fetch on the UEFA week and its absence on the others; and the layout shift with Oswald held 1.5 s, ten runs a width at 360, 375 and 390, on the same machine within the same hour. Do you also get 0.180 at 375 on both trees?
- (j) Green at every commit. At ad728bd, run root typecheck, npm test, build, build:single, build:offline and the offline-bundle scan, then web typecheck, test, build, check:client and check:css. At each of the four earlier commits, checked out by its SHA, run at least root typecheck and npm test.

FIX SCOPE. None. This pass is report-only, and on this point it overrides the skill, which would push fixes. Push no commit, and edit no file in the PR. The approved routing amendment gives every fix round to the builder (PR #328, "The rule"), and a commit of yours would move the branch under Pass 2. Put each fix in the comment as a finding, with the file and the change you would make.

THE COMMENT. Follow pr-comment.md. The first line gives the verdict and the model and effort that ran. Say which checks and questions above you ran and which you could not. Add a short "For Beni" list: the kerning call, if (e) finds one; the layout shift at 375; and the offline files' growth of 148,593 bytes each.

SEALED APPENDIX — claims to re-derive independently, never conclusions. Reach your own result for each, and say when one does not reproduce.
- B1 (builder): two runs of the script into clean directories were byte-identical, with fontTools 4.60.2, brotli 1.2.1 and Python 3.9.6, and recalcTimestamp left false was the only timestamp pin needed.
- B2 (builder): name IDs 1, 4, 6, 16 and 17 hold no "Abril" or "Plex"; IDs 0, 7, 8, 9, 11, 13 and 14 keep the upstream wording; each OFL.txt is unchanged.
- B3 (builder): the two ranges are Google's css2 strings and are the same on every family in the set; the previous union is the two joined, with U+0304, U+0308 and U+0329 written once.
- B4 (builder): font bytes per cold load at 2026-11-21: Vite Fixtures and Table 108,868 against 205,174 at the base, Vite Moments 90,660 against 179,294, Next 108,716 against 205,022 and 90,546 against 179,180; Next is 152 bytes under Vite on both trees.
- B5 (builder): on the week of 2026-10-19, Fixtures fetches inter/Inter-ext.woff2 (83,988 bytes on the wire, 83,668 on disk); U+015E and U+011F are the only characters on that page outside U+0000–00FF and inside latin-ext; the week of 16 Nov fetches no -ext file; the Table does not print the venue.
- B6 (builder): 182 captures a tree; the head matched itself 182 of 182, the base itself 181 of 182 (offline-fixtures-light-390, 42 pixels), and head against base 182 of 182.
- B7 (builder): with Oswald held 1.5 s, 0.071, 0.180 and 0.041 at 360, 375 and 390, on both trees, every one of ten runs a width agreeing.
- B8 (builder): --enforce exits 1 on 1,224 samples, 16 below the floor, 0 unread, all 16 the loss pip at 3.87; report mode exits 0.
- B9 (builder): the offline file grew from 1,294,608 to 1,443,201 bytes and the single file from 1,345,085 to 1,493,678, by 148,593 each.
- B10 (builder): the hash test failed on one flipped byte of Oswald.woff2 and passed restored; today's gate returned [] for both halves preloaded with the text "Kickoff", and the new gate returns the -ext URL; a second src and a local() source with no semicolon passed the old refusal and fail the new one.
- B11 (builder): at the five SHAs in order, 1,114, 1,115, 1,115, 1,115 and 1,116 root tests, and 131 web tests at the last two; next build passed on its first try at every SHA.
- P1 (PM seat): the inliner keys rules by file, so as written it cannot give the offline files Kickoff Mono Text 500 or 600 without carrying the Medium and SemiBold bytes twice.
- P2 (PM seat): a word that mixes the two halves, such as Şükrü Saracoğlu, loses kerning across the boundary and renders differently from the base, and the 182 captures may not show it.
- P3 (PM seat): the gate's probe reads text nodes only and the first family of a stack only, so an -ext character in generated content would fail a preload the browser applied.
- P4 (PM seat): the whole-stylesheet local( scan also fails on a comment that names local(.
- P5 (PM seat): the "Inter Variable" to "Inter" rename is not in the brief, and may not reproduce the name table of the Inter file at 34b5160.
- P6 (PM seat): the base's one self-disagreement on offline-fixtures-light-390 points to an unstable offline cell, not to noise.
````

---

## Beni's routing ruling (Wed 18 Nov 2026, about 10:18 AM EST)

The PM seat put the conflict to Beni beside the brief above. Two Cursor builds had started under
his start-tonight ruling, and PR #328's two-vendor amendment, approved about half an hour later,
routes 1b to Codex and 2 to Claude. The PM seat recommended keeping both builds, since the
amendment's own rule says a PR never switches builder mid-build, and reviewing each by the
Sun 15 row it was started under. Beni answered **"Keep both builds"**.

So, for #341 and for PR 2:
- Pass 1: a fresh Claude Code session, `claude-fable-5-2` at `xhigh`, report-only. The brief
  above needs no change: it already left Pass 2 and Pass 2.5 to this ruling.
- Pass 1.5: the PM seat's brief for Cursor.
- Pass 2 and every fix round: Cursor, on `grok-4.7-xhigh`, before Beni's Cursor tier changes on
  Thu 19 Nov 2026. A seat the tier change stops pushes what is green, and the PR waits or Beni
  re-routes it.
- Pass 2.5: Codex, in a fresh session. Its opener names the model.
- Pass 3: Beni.

From PR 3 on, the Tue 17 amendment applies as approved. Before #328 merges, two parts of it need
correcting: its "Where the overhaul stood" paragraph, which says no Cursor seat was open, and its
builder rows for 1b and 2.

The PR 2 planning session had written PR 2's Pass 1 brief for Codex on `gpt-6.2-astra`. The
ruling moves that pass to a fresh Claude Code session, as for #341.
