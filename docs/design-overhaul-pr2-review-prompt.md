# PR #342 — the PM seat's briefs for the overhaul's PR 2, chrome and the motion control: Pass 1's cold review (archived Wed 18 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) in a fork of the Track A planning session, after
Cursor opened PR #342 from
[design-overhaul-pr2-implementation-prompt.md](design-overhaul-pr2-implementation-prompt.md).
Pass 0 of the 360 cycle in `/kickoff-pr-review`. The PM seat read the PR at about 10:15 AM EST:
- head `e820fd4`: nine Cursor commits, after one merge of `main` at `26bbc61` that came first;
- 65 files and +4141/−2259 against `overhaul/second-edition` at `34b5160`, of which 54 files and
  +1330/−240 are PR 2's own (`git diff 541b9a9 e820fd4`). The rest is #338's and #339's docs and
  the 17 Nov sync, byte-identical to `26bbc61`;
- `verify`, `studio`, the Vercel deployment and `vercel-smoke` green, mergeable, auto-merge off;
- no review yet.

It read the PR body and every non-test hunk of PR 2's own change except the three scan lists
(`web/app/globals.css`, `web/scripts/check-css.mjs` and `web/src-allowlist.mjs`). Of the tests, it
read the motion, hit-area, Moments-voice, offline, shared-header, Moments-host and contrast-helper
diffs, and searched every other test hunk for a removed assertion. It ran `git merge-tree` on the
two builds' heads, which merged cleanly, and no test, build or browser.

The builder relayed its report to Beni in chat. It names the model as Grok 4.7, from the session's
identity, and asks Beni for the effort in one word, because Cursor's logs do not record it.

The routing. Cursor built #342 under Beni's ruling of Tue 17 Nov 2026 at about 10:40 PM EST to
start PR 1b and PR 2 that night. At about 11:10 PM Beni approved the amendment in PR #328, "two
vendors, and no seat for Cursor or Grok", written in the other track without knowing the builds had
started. PR 1b's Pass 1 brief, written beside this one in the sibling session "Kickoff Planner:
PR 1b", puts that seat on Claude Code because both routings agree there. For PR 2 they do not. The
Sunday row gives Pass 1 to a fresh Claude Code session. The Tuesday table, approved later, names
Claude as PR 2's builder and Codex as its reviewer, with Pass 1 on `gpt-6.2-astra` and Pass 2.5 on
`gpt-6.2-sol`.

This brief was first written for Codex, from the later table, at about 10:15 AM EST. Minutes later
the sibling session said it had already put one recommendation for both PRs to Beni, with the box
"Keep both builds" or "Re-route per #328": keep both Cursor builds, because the Tuesday
amendment says a PR never switches builder mid-build, and review both by the Sunday row they were
built under. That means Pass 1 on a fresh Claude Code session (`claude-fable-5-2`, `xhigh`), Pass 2
in Cursor on `grok-4.7-xhigh` before the tier change, and Pass 2.5 in Codex. Its reasons hold:
- the Tuesday table gives Codex PR 2's review only because it has Claude building PR 2, and Cursor
  built it;
- the Sunday row keeps Pass 1 and Pass 2.5 on two vendors, where the Tuesday column puts two Codex
  models on both.
The only reason the PM seat had left, two Fable `xhigh` Pass 1s at once on one Claude plan, the
sibling had already weighed. So the brief was re-seated on Claude Code at about 10:20 AM, to give
Beni one recommendation. He had already answered, at about 10:18 AM EST: **"Keep both builds"**.
#341 and #342 are reviewed by the Sun 15 row they were started under, and from PR 3 on PR #328's
two-vendor amendment applies as approved (recorded in
[design-overhaul-pr1b-review-prompt.md](design-overhaul-pr1b-review-prompt.md)). The Codex seat
line at the end of this file is kept as a record and was not used.

Pass 1 is report-only, as PR 1b's is: the amendment gives every fix round to the builder, and a
pushed commit would move the branch under Pass 2. Beni's default output style is Learning, so the
brief turns it off for the pass.

Delivered in chat in a four-backtick fenced block, one line per paragraph. This copy is the
archive.

---

````text
Kickoff design overhaul — PR #342 (overhaul PR 2, chrome and the motion control): Pass 1, cold review

You are Pass 1 of the 360 cycle for PR #342 in github.com/BeniCheni/kickoff: a fresh Claude Code session that built none of this. Run /kickoff-pr-review on #342 with --no-merge. The skill outranks this brief on process, except where FIX SCOPE below says otherwise, and this brief adds the PR's particulars. Run on claude-fable-5-2 with --effort xhigh, and name the model and effort that actually ran at the top of your comment; Claude Code records both in its session file. The PM seat (Claude Code, Opus 5.5) wrote this on Wed 18 Nov 2026 at about 10:15 AM EST, and seated it at about 10:20 AM by Beni's routing ruling, from #342 at e820fd4, with verify, studio, the Vercel deployment and vercel-smoke green, mergeable, auto-merge off and no review yet. It read the PR body, every non-test hunk of PR 2's own change except the three scan lists, and seven of the test diffs, searched the rest for removed assertions, and ran no test, build or browser. Treat the repository as ground truth and this brief as a map of it. Run TZ=America/New_York date before writing any date.

OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment.

BEFORE YOU START. Any of these stops you, and you tell Beni.
- A Pass 1 comment already exists on #342, or another session is reviewing it.
- The head is not e820fd4. If commits landed since, review them too and list them.

WHO BUILT IT, AND THE ROUTING. Cursor built #342 on Grok 4.7 from docs/design-overhaul-pr2-implementation-prompt.md, after Beni ruled on Tue 17 Nov 2026 at about 10:40 PM EST to start the build that night. Its effort is not in Cursor's logs, and Beni's word on it is pending. At about 11:10 PM Beni approved a newer routing amendment in PR #328, which is not merged; read it with git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md, under "Amended Tue 17 Nov 2026: two vendors". It names Claude as PR 2's builder and Codex as its reviewer, and says no Cursor seat was open. That was written in another session without knowing this build had started, and the amendment's own rules say a PR never switches builder mid-build. Under the Sun 15 row this build started under, Pass 1 is a fresh Claude Code session, Pass 2 is Cursor and Pass 2.5 is Codex. Beni ruled on Wed 18 Nov 2026 at about 10:18 AM EST, "Keep both builds": #341 and #342 are reviewed by that row, and from PR 3 on the Tuesday amendment applies as approved. So you sit this Pass 1, Cursor answers it in Pass 2, and Codex synthesises in Pass 2.5. The routing is settled: do not stop on it, and do not report it as a finding. The PR body asks Beni which effort the build ran at. That is his to answer, not yours.

THE DEADLINE. Post today, Wed 18 Nov 2026, by about 6 PM EST, so that Cursor's Pass 2 can run before Beni's Cursor tier changes on Thu 19 Nov. Do not buy the date with depth: what you could not run goes in "Not verified". Write each finding so the builder can reproduce it cold: file and line, the command, expected and observed.

WHERE TO WORK.
- Run git -C /Users/benicheni/code/kickoff fetch origin. Then git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr2-review e820fd4, and git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr2-review-base 541b9a9. Run npm ci at the root and in web/ of each.
- The base is 541b9a9, the merge of main into the branch, not 34b5160. Its snapshot is the head's, so git diff 541b9a9 e820fd4 (54 files, +1330/−240) is PR 2's own change and nothing else. The PR's diff against overhaul/second-edition also shows #338's and #339's docs and the 17 Nov sync. main has since moved to 55fe6db, one more sync; do not merge it.
- Never use Beni's checkout at /Users/benicheni/code/kickoff, which holds untracked files of his. Never use the builders' worktrees (kickoff-pr1b, kickoff-pr1b-base, kickoff-pr2, kickoff-pr2-base) or PR 1b's review worktrees (kickoff-pr1b-review, kickoff-pr1b-review-base).
- Put the head's three servers on 6773, 6774 and 6775 and the base's on 6873, 6874 and 6875. Port 5173 is Beni's, 6073 to 6375 are the builders', and 6573 to 6675 are PR 1b's Pass 1, which may be running at the same time. Set KICKOFF_VITE_ORIGIN, KICKOFF_NEXT_ORIGIN and KICKOFF_HARNESS_ORIGIN explicitly, confirm each listener's cwd with lsof, and do not stop a process you did not start.
- Your gh is Beni's account, an Admin who can bypass the verify gate, so this brief is what stops you: do not approve, merge, enable auto-merge, bump or tag.

WHAT BENI RULED, named as his.
- Sat 14 Nov 2026, in docs/design-overhaul-plan-review.md: 1 Branch and 2 Ten (main and Pages do not change until the release); 3 Oswald (the wordmark stays Oswald, at a band size the builder sets and measures); 12 Six (no version, no tag and no CHANGELOG section); 17 Approve (plan section 10.4's words as listed, except string 9's Step 0 sentence, which does not ship; string 34, the theme button's spoken name, comes back for approval in this PR); 19 Repaint (Moments' ground and inks take the second edition's tokens under .moments-gallery, and its layout, motion and Inter are untouched).
- Mon 16 Nov 2026, in PR 1's review: stock nests (on a light page an element takes the voices of the nearest [data-stock]; on a dark page every surface takes the black voices; the rule is in src/shell.css, pinned by tests/stockCascade.test.ts); and no Caslon preload before text uses Caslon (ruling 5).
- Tue 17 Nov 2026 ("Yes, extend it"): from this PR the offline page renders Caslon 400 and Kickoff Mono 400. PR 1b (#341) inlines them, and until it lands the offline and single files show them as system fallbacks.
- From PR 0's cycle: R2 (--enforce fails on the 16 loss-pip samples until PR 4); R3 (the smoke's Previous-button contract belongs to PRs 3 and 5, so this PR leaves the week stepper alone).
- Standing, in CLAUDE.md: never render a kickoff time the league has not set; nothing invented; both clocks from one UTC instant; no data-honesty assertion is ever weakened.
- Beni's word merges every overhaul PR.

SPEC OF RECORD. The build brief: the fenced block in docs/design-overhaul-pr2-implementation-prompt.md. docs/design-overhaul-plan.md: sections 1.1 and 1.7; 3 (PR 2's row and evidence entry); 4.3; 5.1 and 5.2; 6.1 and 6.2; 7.1 to 7.4; 8.2; 8.3, row 2; 10.1, rows 1 and 5; 10.4; and 10.5. The handoff, docs/design/5-handoff/second-edition-handoff.md: sections 2 to 5 and 8. docs/design/5-handoff/gap-18-addendum.md is the later word on every section it names. Precedence: Beni's rulings, then the plan, then the handoff, then the build brief. The body's "Where the repository won" names six departures from the brief; judge each, and note every resolution.

FACTS FROM THE PM SEAT'S READ that are easy to miss.
- The band is sticky. .imprint-band is position: sticky, top: 0, z-index: 20 (src/shell.css, the band block). The Table's own column headers are sticky at top-0 with z-10 (src/components/TablePage.tsx:255 on phones, :390 at 1000), and its deep zone dividers stick at top-7 or top-[34px] with z-[1] (:124). No scrolling ancestor stands between them and the viewport. On main the header scrolled away. Here, while a reader scrolls a deep table, those headers and dividers very likely slide under the band. The handoff calls the band "Fixed chrome; never moves, shakes or sits under an effect" (second-edition-handoff.md:156), which allows a pinned band but does not ask for one. A pinned band holds 118 px of an 844 px phone screen, and 133 px at 360.
- The hit-area check measures H1 and H2 only. hitAreaFaults in web/scripts/evidence.mjs reads the buttons inside header[data-moments-background="header"], and fails a box under 43.5 px or two boxes that overlap. Nothing measures H3 (a 44 px pitch for controls that stack) or H4 (no hit area over a line of data), and the build brief asked for all four by script.
- The motion control's first frame has a browser receipt on Vite only. proveMotion runs against origins.vite. The Next server render prints both names and both glyphs, and lets [data-motion] pick one through CSS (.motion-when-on and .motion-when-off). jsdom applies no stylesheet, and no browser test loads Next. proveMotion also reads data-motion at DOMContentLoaded, after module scripts have run, so it cannot tell the pre-paint script from an early module write.
- The banner's node test reads text, not paint. tests/contrast.ts throws only if StalenessBanner.tsx lacks the strings data-plane={plane}, 'amber' and 'alarm', and it computes the pairs from fb-amber and fb-alarm on fb-pulp and fb-typescript, whatever .staleness paints. A change to .staleness's colour passes it. The handoff gives amber 5.85 and alarm 5.17 on pulp, 11.76 and 6.86 on the dark page, and 2 px corners (second-edition-handoff.md:230). .staleness sets no border-radius.
- Vite's Moments is not repainted. With no curated moments, the Vite app's Moments tab renders MomentsEmpty, which sits outside .moments-gallery, as the body says. So the remap does not reach the page Pages serves. The Next gallery sits under it.
- Two sources for the version. The band reads __APP_VERSION__ in the Vite shells and pkg.version in Next, and PageFoot imports the root package.json in every shell. They agree today. The body reports Vite's script grew by 46 bytes, so the manifest's other fields were probably not bundled; check.
- The Poster foot's "Times are Brooklyn unless marked local" is already true: today's rows print "<time> local" (src/components/FixtureRow.tsx:118). The body's caveat is more cautious than it needs to be. The old Fixtures footer, which the ruled words replace, explained "time not yet set" and the one stored UTC instant. Say where a reader still learns either.
- String 34, as proposed, is the first edition's visible label kept as the glyph's spoken name: "Dark mode" on a light page and "Light mode" on a dark one. It changes with the action and has no aria-pressed, like the motion control.
- PR 1b (#341, at ad728bd) touches two of this PR's files, tests/faces.test.ts and web/scripts/evidence.mjs, in different hunks, and git merge-tree of the two heads is clean. Do not review #341. Whichever of the two merges second reconciles RECORD.md's line on which pages load which files, and re-runs its evidence.
- The body claims the root and web checks green at e820fd4, not at every commit.

QUESTIONS THIS PASS SHOULD ANSWER, beyond redoing each receipt yourself.
- (a) The sticky band. On both trees, scroll the Table at 360, 390 and 1000, in both themes, on a deep table (the UCL league phase's 36 rows, and the Premier League), and say what a reader sees of the column header and the zone dividers. Does anything else on Fixtures or Table sit under the band while scrolling, a hit area included? Is a pinned band what the handoff and the plan ask for? Recommend; the call is Beni's.
- (b) The hit-area contract. Measure H1 to H4 for every control in the band, in both apps, in both lenses, on every tab and at every width, the offline page included. Say what the scripted check misses, and whether any hit area covers a line of data.
- (c) Motion. In a real browser, on both apps, for each stored value, a missing key with reduced motion on and with it off, a throwing read and a throwing write: what are the control's name, its glyph and data-motion on the first frame after a reload? Show that frame comes before any module runs, for example by observing the attribute from a script injected before the document parses, or by blocking the module script. Read the Next server HTML itself. Does a stored on outrank a later reduced-motion setting, and is that what plan 4.3 means? Does a press hold across a tab change and a lens change? Does StrictMode leave exactly one media listener for motion?
- (d) Contrast on the rendered page, in both themes: every voice in the band (the wordmark and strap, the tabs, the lens segments, both discs and the provenance), the banner's two planes on pulp and on typescript, the feet on pulp, on typescript and on the Table's black, and Moments' cells after the repaint. Compare each with the handoff's figure where it gives one. Do the node pairs measure what .staleness paints? --enforce should still exit 1 on the 16 loss-pip samples only.
- (e) The six departures under "Where the repository won": the 20 px content gutter against the brief's 16, with a 4 px step between the band's inset and the column's; the Ledger's paper stock on a typescript ground; the strap's tracking; the 12 px tab label; the motion control without aria-pressed; and public/faces.css's stale sentence, which is PR 1b's file. Judge each against the precedence above.
- (f) Ruling 19. Is Moments repainted on the page Pages serves (the Vite empty state), or only in Next? On both trees, do the element boxes of every Moments cell match, apart from the band's offset? Does the mapping table cover every first-edition token Moments reads in src/index.css and in web/app/moments/gallery.css?
- (g) Data honesty. The stamp, the count and the version in the band and in every foot come from src/lib/fixtures.ts and the manifest. The 24- and 72-hour rule stays on the request clock, and tests/dom/requestClock.test.tsx stays green. Read every assertion the PR changed, above all the five it narrowed or replaced: the offline header's outerHTML, the Moments shell's containment, the theme test's listener counts, the pre-paint reads, and the banner's tint guard. Place each in the build brief's four kinds. Redo the eight mutation receipts, and add one each for the stamp in a foot, the count in the provenance, and a throwing write of kickoff-motion.
- (h) Weight, size and pixels against 541b9a9. Give font bytes per cold load for each app, tab and lens, and the offline and single files' sizes. Do the first-edition bodies of Fixtures and Table render as they do at the base, apart from their offset under the shorter band? Opened from disk with the network off, does the offline page draw Caslon 400 and Kickoff Mono 400 from system faces, as the body expects until PR 1b lands?
- (i) Green at every commit. At e820fd4, run root typecheck, npm test, build, build:single, build:offline and the offline-bundle scan; web typecheck, test, build, check:client and check:css; the smoke checker; and scripts/n6b-proof.mjs on every route against a local Next production build. At each of the eight earlier commits, checked out by its SHA, run at least root typecheck and npm test, and web typecheck and test where web/ changed. No --font-* value in src/shell.css's @theme block should have moved; if one did, run studio/test/admin-tokens.test.ts and say so.
- (j) String 34. Is "Dark mode" or "Light mode" the right spoken name in the Vite render, in the Next server HTML and in the offline file, in both themes? Beni approves it; recommend.

FIX SCOPE. None. This pass is report-only, and on this point it overrides the skill, which would push fixes. Push no commit, and edit no file in the PR. The approved routing amendment gives every fix round to the builder (PR #328, "The rule"), and a commit of yours would move the branch under Pass 2. Put each fix in the comment as a finding, with the file and the change you would make.

THE COMMENT. Post it on #342 with gh. Follow the skill's pr-comment.md. The first line gives the verdict and the model and effort that ran. Say which checks and questions above you ran and which you could not. Add a short "For Beni" list: the sticky band; whether ruling 19 reaches the Vite page; string 34; the 20 px gutter; and the iPhone check on this PR's Vercel preview (plan 10.1, row 1), which needs his sign-in.

SEALED APPENDIX — claims to re-derive independently, never conclusions. Reach your own result for each, and say when one does not reproduce.
- B1 (builder): the band is 118 px at 390 and 1000, with two 44 px rows, and its width equals the viewport; at 360 it is 133 px, its provenance 45 px instead of 30, because "SYNCED 2026-11-17 19:57 UTC" drops as one unit with the sync glyph on the first line.
- B2 (builder): both discs are 26 px inside 44 × 44 hits; each lens segment's hit is 57 × 44; the +5 mark is 26 × 33 and aria-hidden; the tabs are 80.7, 59.8 and 80.9 × 44; no two hit areas overlap, on Vite and Next, Poster and Ledger, in the 390 light Fixtures cells.
- B3 (builder): the first frame on Vite reads Stop motion for a stored on, Start motion for a stored off, Start motion for a missing key under reduced motion, and Stop motion for a missing key with motion allowed; with motion stopped, two captures two seconds apart are byte-identical, 69,773 bytes each.
- B4 (builder): report mode exits 0 over 96 matrix cells, 72 week cells, 6 harness cells and 4 offline cells, with scrollWidth equal to innerWidth on every one; --enforce exits 1 with 16 of 1,882 measured samples below the floor and 0 unread, all of them the letter L, white on #D85A30, at 3.87.
- B5 (builder): font bytes per cold load rise by 56,316 on Vite and 56,240 on Next on every tab and lens, against 34b5160; Caslon 400 is 31,556 bytes and Kickoff Mono 400 24,120 on disk; style grows by 723 bytes on Vite and 122 on Next; script grows by 46 on Vite and shrinks by 181 on Next.
- B6 (builder): Fixtures and Table preload Oswald, Kickoff Mono Medium and Caslon 400, none unused; on Moments, Caslon 400 and Kickoff Mono Medium are preloaded and not applied, and the gate passes because Fixtures and Table apply them.
- B7 (builder): the offline file is 1,294,608 bytes at 34b5160 and 1,292,115 at e820fd4, and the single file 1,345,085 and 1,342,618; the scan passes 22 markers; the four offline cells, opened with the network off, have scrollWidth 390 and ask for no host.
- B8 (builder): every Moments element box matches the base at 360, 390 and 1000 in both themes, moved by the band's difference: 15 px at 390 and 1000 and 41.5 at 360 on Vite's empty state, and 15, 5 and 27.5 px at 390, 1000 and 360 on Next's gallery.
- B9 (builder): scripts/n6b-proof.mjs exits 0 against a local Next production build of e820fd4 on /, /?tab=table, /?tab=moments and /api/snapshot, with nav aria-label="Primary" on every tab.
- B10 (builder): the eight mutation receipts in the body's table each failed the named test and were restored, leaving the tree clean.
- B11 (builder): the root and web checks are green at e820fd4.
- B12 (builder): the integration branch's preview alias answers 302 to Vercel's sign-in.
- P1 (PM seat): the sticky band covers the Table's sticky column header and deep zone dividers while a reader scrolls.
- P2 (PM seat): nothing measures H3 or H4 by script.
- P3 (PM seat): the motion control's first frame is unproven in a browser on Next, and the Vite receipt cannot tell the pre-paint script from a module write.
- P4 (PM seat): the banner's node pairs and guard pass a change to what .staleness paints, and the banner lacks the handoff's 2 px corners.
- P5 (PM seat): ruling 19 does not reach the Moments page Pages serves.
- P6 (PM seat): the weight and size figures mix PR 2's change with the 17 Nov sync, because they were taken against 34b5160 rather than 541b9a9.
- P7 (PM seat): no commit before e820fd4 was shown green.
- P8 (PM seat): the Poster foot's "unless marked local" is true today, and the reader no longer learns what "time not yet set" means from any foot.
````

### Not used: the Codex seat line

The brief's first paragraph as first written, for Codex, at about 10:15 AM EST, before the PM seat
learned of Beni's "Keep both builds". It is kept as the record of the seat it would have taken
under PR #328's table.

````text
You are Pass 1 of the 360 cycle for PR #342 in github.com/BeniCheni/kickoff: a fresh Codex session that built none of this. Run on gpt-6.2-astra at xhigh, and name the model and effort that actually ran on the first line of your comment, read from your session file rather than from memory. The method is the repository's review skill: read .claude/skills/kickoff-pr-review/SKILL.md and the files it names for a Pass 1 run with --no-merge, and follow them. The skill outranks this brief on process, except where FIX SCOPE below says otherwise, and this brief adds the PR's particulars. Read CLAUDE.md and AGENTS.md first; they bind you. The PM seat (Claude Code, Opus 5.5) wrote this on Wed 18 Nov 2026 at about 10:15 AM EST, from #342 at e820fd4, with verify, studio, the Vercel deployment and vercel-smoke green, mergeable, auto-merge off and no review yet. It read the PR body, every non-test hunk of PR 2's own change except the three scan lists, and seven of the test diffs, searched the rest for removed assertions, and ran no test, build or browser. Treat the repository as ground truth and this brief as a map of it. Run TZ=America/New_York date before writing any date.
````
