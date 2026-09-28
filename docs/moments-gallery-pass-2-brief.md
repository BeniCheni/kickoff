# PR #118 — Pass 1.5: the rebuttal brief for Codex (archived by the PM seat, Mon 28 Sep 2026, TZ=America/New_York)

This is Pass 1.5 of the six-pass 360 for "Moments slice 2: the gallery, inert until curated"
(PR #118). It was written from a fresh read at 17:54 EDT:
- the Pass 1 comment (issuecomment-5877812127) and its commits;
- the fix diff `34e0b82`;
- the new regression test (`tests/dom/momentsGallery.test.tsx:187`);
- ideas rows 59–61;
- `verify` green at `0e462ae` (run `36477675539`).

At that read the PR was MERGEABLE/CLEAN with 0 reviews. Codex's own worktree
(`~/.codex/worktrees/moments-gallery/Kickoff`) was on `704581c`, three commits behind the remote.
The target seat is Codex on **GPT-6 Astra at Extra High**, the Pass 2 row of `/kickoff-pr-review`'s
table.

The prompt below was delivered in chat; this file is the archive.

---

PR #118 — Pass 2 (rebuttal): Moments slice 2, the gallery, inert until curated

You are Pass 2 of the six-pass 360 for PR #118 in github.com/BeniCheni/kickoff, running in Codex on GPT-6 Astra · Extra High. You built this PR, in slice 2's build session (commits 4e8d2ad, 52f8e51, 721fb31, 704581c). Claude Code, Fable 5.1 Extra, cold-reviewed it in Pass 1 and pushed three commits to your branch. Your job is to answer every Pass 1 position with accept, contest, or accept-but-contest-the-characterisation, and to reproduce or disprove each one in code. A rebuttal that agrees with everything has not been run. A contest you cannot back with a command is not a contest either. Pass 2.5 (the PM seat) re-runs your evidence at the tip, and Beni adjudicates and clicks the merge.

THE BRANCH MOVED UNDER YOU — do this first

- Pass 1 pushed three commits, all authored Claude <noreply@anthropic.com>:
  - fcc62f0 archives the Pass 0 brief as docs/moments-gallery-review-prompt.md;
  - 34e0b82 fix(moments): keep the visit owner around the Moments route only;
  - 0e462ae docs(moments): ideas rows 59–61 and process notes.
- The remote tip is 0e462ae17d8940ef7f883c8345d1e0a3a65384cc. Your worktree at ~/.codex/worktrees/moments-gallery/Kickoff was still on 704581c, three behind. Run `git fetch origin` and `git merge --ff-only origin/codex/moments-gallery`, then confirm HEAD is 0e462ae before anything else.
- If you are on a different local branch, your pushes must still fast-forward origin/codex/moments-gallery. Never force-push.
- Your first commit is the archive of this brief, docs/moments-gallery-pass-2-brief.md. It is the tip of the local branch claude/moments-gallery-pass-2-brief, whose parent is 0e462ae, so `git cherry-pick claude/moments-gallery-pass-2-brief` applies cleanly. If you cannot reach it, say so and skip it.
- Never work in /Users/benicheni/Documents/Claude/Projects/Kickoff itself. Never check out, commit to or push the local branch wip/main-checkout-2026-09-27. If you need the design inputs, extract them read-only with `git archive` into a scratch directory outside your worktree, as in slice 2's build.

BENI'S RULINGS (first-hand to the PM seat)

- 27 Sep 2026, for this PR:
  1. Inert until curated: while src/curated/moments.json is [], the live Moments tab renders what main renders; this is a non-release, with no version bump, CHANGELOG version section or tag.
  2. The header stays 780px on every tab, and the gallery may widen to 1160px.
  3. D-16 remedy (a): stack through 887px, side by side from 888px.
  4. Codex builds, and Claude reviews.
- No release number is in play, so this pass prepares no release.
- 28 Sep 2026, context only: slice 3 (the player host, the YouTube adapter and Cinema) will be built on #118 as merged, by a third vendor. Anything you change about where the visit owner sits must keep Decision 2 buildable: one player host, an unkeyed sibling of the Moments route boundary under the owner, with its own error boundary, never reparented.

WHAT PASS 1 FOUND — answer each

1. Finding 1, medium, fixed by Pass 1 in 34e0b82. At 704581c, MomentsSessionBoundary and MomentsSessionProvider wrapped the whole App shell. An owner throw therefore replaced the header, tabs, Fixtures and Table on every tab with "This visit couldn't be restored. Your Moments visit may be lost." Fixtures is the betting pipeline's Step 0 source. Any throw elsewhere in the shell was also caught there and attributed to the Moments visit, where main empties #root.
   - Reproduction: render `<App momentsEdition={null as unknown as []} />` on ?tab=fixtures. At 704581c no "Kickoff" header and no Fixtures tab remain. At 0e462ae, `npx vitest run --project dom tests/dom/momentsGallery.test.tsx` passes "an owner failure never takes the shell or another tab down; only the Moments tab shows the fallback". Run it red at 704581c and green at 0e462ae yourself.
   - Characterisation you may contest: Pass 1 calls it medium rather than high because it was latent. The initializer is guarded and the reducer is pure, so production cannot throw there with [] or valid curation. Pass 1 says it was the PR's structure, not luck. Take a position on the severity and the reasoning.
   - Judge the fix, not only the finding. The owner still mounts once, unkeyed and whatever the tab, but it now sits inside the 780px shell and wraps only the Moments route. MomentsSessionBoundary takes `active` and renders null for a failed owner off the Moments tab. Answer each of these with evidence:
     - (a) Does this still satisfy Decision 1 as you wrote it?
     - (b) Does it keep Decision 2 buildable? Say where slice 3's player host would mount, and what "the rest of the application becomes inert" now means for Cinema with the owner inside the shell. Record it in docs/moments-architecture.md if the doc does not already say it.
     - (c) Is there any path on which the owner fallback appears on a non-Moments tab, or on which "Retry visit" claims state it no longer holds?
     - (d) Are the Fixtures and Table DOM and error paths exactly main's, as Pass 1 says it proved by rendering main's components and diffing innerHTML and outerHTML?
2. Finding 2, low, fixed in 34e0b82. editorial.cover was documented only in the slice-2 section of the architecture doc; Pass 1 added one bullet to the authored-data contract list. Accept or contest.
3. Contestable omission: Pass 1 added no CHANGELOG line for finding 1. It argues the fixed path is unreachable with [], and that an entry would claim a reader-visible change that doesn't exist, so the spec of record carries it instead. The repo's usual rule puts a behavioural fix under [Unreleased]. The existing [Unreleased] line says "the interface readers see is unchanged". Decide whether a line is owed. If it is, write it so it makes no reader-visible claim.
4. Items Pass 1 killed or judged not defects. Contest any you can reproduce:
   - .moments-gallery's 100vw width under a classic, non-overlay scrollbar: computed rather than measured, since every run was on overlay-scrollbar macOS;
   - first-capture PNG identity of 70/72 at 0e462ae, with the two non-Moments cells settling on re-capture;
   - the App seams momentsEdition, momentsStorage and momentsRoute shipping in the bundle, left as your harness design.
5. Informational: ideas rows 59–61, all XS. Accept the wording or contest it; none is required for the merge.
   - Row 59: a postponed or cancelled archived fixture still prints the dead kickoff's Brooklyn date; inherited from main's MomentCard.
   - Row 60: the constant 'matchnight' shuffle seed; deterministic under D-05, but the affordance reads as random.
   - Row 61: a read refusal followed by a successful write replaces the unreadable stored set; slice-3 copy.
6. Pass 1's three commits are changes to your branch. Review them as you would anyone's: code, test and doc. The fix commit's own verification says 621 tests in 47 files.

VERIFY, AND SAY WHICH SHA EACH NUMBER CAME FROM

- npm run typecheck and npm test at 0e462ae first; Pass 1 reports 621 tests in 47 files. Then run them at every commit you add.
- npm run build and npm run build:single at your final tip.
- If your changes touch src/ or index.css:
  - re-run the inert receipt (docs/verification/moments-foundation/check-browser.mjs, base origin/main vs your tip, 72 cells, identical body text);
  - re-run the gallery receipt (docs/verification/moments-gallery/check-gallery.mjs);
  - update docs/verification/moments-gallery/ if its recorded tip changes.
- Pass 1's method notes apply to both receipts:
  - the dev server binds localhost (::1) only, so pass http://localhost:<port>, not 127.0.0.1;
  - never edit src/ while a headless matrix runs against the dev server, because Vite's reload aborts the run;
  - prove an inert path by rendering main's component from git show and diffing outerHTML.
- verify must be green at your final tip. Name the run.
- Pass 1's receipts are local and readable at ~/kickoff-pr118-review/ if you want to compare, but your numbers must come from your own runs.

BOUNDARIES

- Fix commits only for what you reproduced, authored as Codex (`git -c user.name="Codex" -c user.email="noreply@openai.com" commit`), with typecheck and test green at each. If you revert or reshape any of Pass 1's changes, say so in your comment and give the evidence.
- No merge, no version bump, no CHANGELOG version section, no tag, no force-push, no workflow change.
- Leave PR #114, every other PR and branch, Beni's main checkout and the wip branch alone.
- Do not edit Pass 1's comment.

YOUR PR COMMENT — one comment, the same table shape as Pass 1

- A decision line: your overall position, whether you recommend any merge blocker and why, and the exact final head SHA.
- A findings table with one row per Pass 1 position (finding 1, finding 2, the CHANGELOG omission, each killed item, rows 59–61). Columns: # · Pass 1 position · your position (accept / contest / accept-but-contest-the-characterisation) · evidence (command and SHA) · fix commit, if any.
- Anything new you found, with severity and evidence.
- Answers to 1(a)–(d) above.
- Verification as run, with SHAs, and a Not verified list: physical devices, Safari and Firefox, screen-reader speech, and provider behaviour, plus anything else you skipped.

Then stop. Pass 2.5 re-runs your evidence at the tip and writes Beni's brief; the merge is his.

SEALED APPENDIX — Pass 1's numbers. Re-derive any you rely on or contest; none is a conclusion.

- Tests: 620 tests in 47 files at 704581c, 621 in 47 at 0e462ae. Typecheck clean. git diff --check clean. The diff at 704581c was 46 files, +1797 / −80, with no change under src/data, src/curated, .github, package.json or the URL codecs.
- Inert receipt: 72/72 identical text for base 9a91a45 against each of 721fb31, 704581c and 0e462ae. PNG matched 72/72, 72/72 and 70/72; the two differing cells (360-ledger-light-fixtures and 360-ledger-dark-table) settled on two re-captures. Zero provider requests, 634 Google Fonts requests and zero page errors per run.
- Bundles: the 721fb31 and 704581c bundles are byte-identical, and the builder's build-sha256.json matched 12/12. At 0e462ae the entry is dist/assets/index-BF-5Zxl7.js, starting b985d089.
- Harness exclusion: zero hits in both bundles for the harness, fixture titles, archival IDs, "simulated", youtube-nocookie or <iframe.
- Geometry:
  - D-04: the 360 Broadcast action bottom is at 779.109, a margin of 64.891.
  - D-16: stacked through 887 and beside from 888; the smallest side-by-side anchor is 520 × 292.5.
  - D-17: 0px rect movement over 240 presses.
  - D-19: one non-empty live region after each press.
  - D-20: zero text under 10px in 108 cells.
  - H-B: the header rect is identical across tabs at 1160, 1200 and 1250.
  - Contrast: 2,724 elements over 60 cells, zero AA failures.
- Gallery checker at 0e462ae: 720/720 cells, 115 interactions and 16,830 hit-tests, zero errors, zero provider requests.
- Row 58: main's momentsSaved.ts and momentsQueue.ts under the head's tests fail 2 of 11 with "Saved references must be nonempty, trimmed IDs", and pass 11/11 at the head.
- Data honesty: two tests in tests/dom/moments.test.tsx changed. Neither was weakened, and the clock assertions (8:00 PM local, 3:00 PM EDT) are unchanged.
