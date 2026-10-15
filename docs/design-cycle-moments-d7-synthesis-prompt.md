# Moments D7 — the Pass 2.5 synthesis prompt for Codex (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by the PM seat on Tue 13 Oct 2026 for Codex (GPT-6.1 Sol High), after verifying the D7 export (fingerprint `ae87dd04…85cb2c`), and delivered in chat. Its block 5 cross-checked D7 against the Studio build in PR #187, read-only.

---

````text
$kickoff-design-review

Moments D7 — Pass 2.5 synthesis: re-check Claude Design's D7 and its answers against your own D6 findings D-46 to D-57, and against Beni's answers to Q13–Q22 and A-09–A-11 (Codex, GPT-6.1 Sol High)

You are the Pass 2.5 synthesis seat for a design in github.com/BeniCheni/kickoff, in Codex on GPT-6.1 Sol at High. On Mon 12 Oct a Codex session gave D6 its Pass 1 cold review (/Users/benicheni/kickoff-d6-review/d6-cold-review.md): 12 findings, D-46 to D-57 (3 high, 7 medium, 2 low), and adjudication items. That chat is closed. Beni then answered every open question, all as recommended: Q13 Native, Q14 Theater, Q15 Keep, Q16 On (you had recommended Off), Q17 Key, Q18 Remove, Q19 PR, Q20 Query, Q21 No, Q22 Record, A-09 Scoped, A-10 Pause, A-11 Preserve. The PM seat (Claude Code) sent Claude Design a Pass 1.5 brief carrying your findings and his answers (/Users/benicheni/kickoff-s55-run/d6-rebuttal-brief.md). Claude Design (Fable 5.1 Extra, the builder) answered with D7: all 12 accepted, every answer folded in.

Read the kickoff-design-review skill (.agents/skills/kickoff-design-review/SKILL.md and references/browser-evidence.md) by hand first. This is its "2.5 synthesis": re-run every fixed claim against the new revision, keep the IDs, and surface what is unresolved to Beni. Earlier conclusions stay unproven until you check them here. You do not redesign, edit the artifact or write product code, and you answer nothing for Beni. D7's response file is the builder describing its own work: use it to find the changes, then judge each by your own Pass 1 acceptance test.

Your session may be bounded, so the work is six ordered blocks. Write the report first and append to it after every block; if you run low, stop at a block boundary and say what you did not reach. Inside each block, run your own probes first, then check the Appendix PM items tagged to it.

Hard limits, as in Pass 1. Nothing under ~/s4b or ~/kickoff-s4b. The folder's _ds/ is the local-only Fergie Time mirror and uploads/ holds review copies: read them, copy neither into the repo. No edits to any design folder or repository file; no commit, push, branch, PR, issue, review, comment, release or setting change, and that includes PR #187: read it only. No request to fal, Supabase, Vercel or any Google API; public documentation pages may be read. No spend, account, key or package install. Run `TZ=America/New_York date` before writing any date.

Setup:

```bash
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff fetch origin
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree add --detach /Users/benicheni/kickoff-d7-review-codex origin/main
git -C /Users/benicheni/kickoff-d7-review-codex log --oneline -3
cd "/Users/benicheni/Kickoff Moments gallery redesign D7" && shasum -a 256 -c "Kickoff Moments - D7 manifest.sha256"
shasum -a 256 "/Users/benicheni/Kickoff Moments gallery redesign D7/Kickoff Moments - D7 manifest.sha256"
cd "/Users/benicheni/Kickoff Moments gallery redesign D7" && find . -type f ! -name '.DS_Store' -print0 | LC_ALL=C sort -z | xargs -0 shasum -a 256 > /Users/benicheni/kickoff-d6-review/d7-folder-manifest.sha256
diff /Users/benicheni/kickoff-s55-run/d7-folder-manifest.sha256 /Users/benicheni/kickoff-d6-review/d7-folder-manifest.sha256
gh pr view 187 --repo BeniCheni/kickoff --json state,headRefOid,headRefName
```

The target. /Users/benicheni/Kickoff Moments gallery redesign D7. Its fingerprint is the SHA-256 of "Kickoff Moments - D7 manifest.sha256" itself: ae87dd042c7629dbf88c63ae8dfebdc487e2c1033c92a3304b25589bae85cb2c. The manifest's 14 files are the D7 canvas, spec and response, d7/data.js, d7/image-slot.js, d7/spec.md, d7/support.js, and the seven _ds files the canvas links. On Tue 13 Oct at 01:14 ET the PM seat checked:
- all 14 lines pass, and the fingerprint reproduces;
- the folder holds 108 files; its whole-folder manifest is ~/kickoff-s55-run/d7-folder-manifest.sha256, SHA-256 584a0e176e16fc8c3570bc92b745eaba5ae1324cdd06731383708e77f599e901;
- every D6 file is byte-identical to the reviewed D6 folder, except .thumbnail and github.md;
- the 68 D1–D5 files are byte-identical to the D5 export;
- uploads/d6-cold-review.md and uploads/d6-cold-review-04d1be81.md are both byte-identical to your Pass 1 report;
- the 10 new files are the D7 set plus those two uploads.

If any check differs, stop and report.

Render. Serve the folder on 127.0.0.1:8765 and open "Kickoff Moments - D7 design canvas.dc.html" with the tab visible; it needs unpkg for React. D7 adds `?frames=<id>,<id>` to the canvas URL, rendering only the named frames, which helps you capture or probe one at a time. Drive Chrome over CDP from scripts in ~/kickoff-d6-review/probes; your D6 scripts are there to adapt under new names. Your older evidence folder, ~/kickoff-d2-review, no longer exists, so P-22 is gone; do not cite it. Where you need app geometry, compute it from src/index.css's rules as you did in D6 block 2. If you judge a real-app measurement necessary, build the stub acceptance app as in Pass 2.5 of D3 (`npm ci`, the stub generator, `npm run build:acceptance`, served on 127.0.0.1:4318 with every non-loopback request blocked, never pressing Play) and say why. Continue the evidence index from P-22 in ~/kickoff-d6-review/evidence, and number any new finding from D-58. Stop all servers and close Chrome at the end.

The blocks, in order. Every claim needs a probe you ran or a page you read.

1. **Pin and delta map.** Diff the D6 set against the D7 set: the canvas, spec, data and runtime. Every change must map to one of D-46 to D-57, one of Beni's answers (Q13–Q22, A-09 to A-11), or one of the four improvements D7 adopted from your report: the two-cat Subject note, public-by-address exposure and Cancel after upload, committed versus deployed versus serving, and reads bound to the read-only views. Anything else is a new finding. Check that the pivot's settled rulings are unchanged.
2. **The answers are where they say.** D7's response has one row per finding and one per answer. Open each named frame and file:line and record whether the change is there. Then check the record of each answer: Q16 records that you recommended Off and Beni chose On, with A-10 as its guard; Q17 lists the fourth key `kickoff-moments-autoplay-v1`; Q19 and A-11 remove every "Commit" path and keep `verify` before main; A-09 matches the privacy copy and the unavailable state.
3. **Your acceptance tests, re-run:**
   - **D-46.** The new drawings: NoResults; the saved and save-refused cards; muted; aborted; the record-write failure; Unpublish's partial failures; all fifteen job states plus the two Completed substates; the fallback and unavailable matrix across lens, theme and width; and the mixed 16:10 and 16:9 row.
   - **D-47.** An ILLUSTRATIVE label beside every invented value where it is drawn.
   - **D-48.** The canvas executes only manifested files. Show it from the request log: loopback requests only to manifested paths, plus unpkg's React and the font files, which D7 names as unpinnable.
   - **D-49.** No sentence anywhere promises that nothing is fetched before Play.
   - **D-50.** One announcement per countdown by construction: the visible countdown is `aria-hidden`; a hidden status region is written once at start and once at Cancel.
   - **D-51.** Run D7's URL cases (d7/data.js `URL_CASES`, `mergeSearch`, `enterWatch`, `leaveWatch`, `leaveTab`) against the real `canonicalSearch` in src/lib/urlCodecs.ts at the worktree head, as your P-09 harness did. Show that valid keys survive entering, moving and leaving, `watch` is set or cleared, and unknown keys stay.
   - **D-52.** Accessible names and the sequential focus order, from the accessibility tree and real Tab presses, independent of H3, which computes from the DOM: Save named with its title; the lens group one stop, as in LensSwitcher.tsx; the switch named "Autoplay next" with its state in `aria-checked`; Up next named by title; Cancel's position matching §8.
   - **D-53.** Every privacy frame carries a prospective label, the stamp is a slot, and no audit is claimed.
   - **D-54.** The fallback sentence states the readable-list prerequisite.
   - **D-55.** Publish and Unpublish deliver the fallback copy through a PR (`verify`, auto-merge, deploy), with honest partial outcomes. No "Commit" wording or unmeasured timing remains. The bypass sentence is accurate against main's ruleset: re-read it read-only with `gh api repos/BeniCheni/kickoff/rulesets` and each ruleset's detail.
   - **D-56.** Motion under no-preference and reduce with Emulation.setEmulatedMedia, shadow roots included: the lens segments' transition is gone under reduce, and the image-slot's is labelled tool chrome.
   - **D-57.** Contrast for every rendered text pair in both themes, with the large-text threshold where it applies; the STUDIO lettering now in `--text`.
   - **Geometry.** The G rigs against your own arithmetic.
4. **Beni's answers, folded.** For each of Q13–Q22 and A-09 to A-11, confirm that the canvas, copy and spec do what the answer says, and that nothing still argues the other way. Theater (Q14) has replaced the overlay, and D-25 is met by the shell foot alone. Autoplay On (Q16) applies only after a reader-pressed Play. Pause (A-10) holds while the tab is hidden.
5. **Cross-check with the ST1 build** (PM-8), PR #187 on branch cursor/studio-st1, read-only. Use `git show origin/cursor/studio-st1:<path>` and `gh pr view 187 --repo BeniCheni/kickoff --json files`. Compare D7's names with the ST1 build's:
   - **Records:** the `videos` table, `published_at`, `unpublished_at`, `position`, `public_id`, the `catalog.videos` read view, and the `studio_reader` role.
   - **Storage paths:** `moments/videos/<assetId>.mp4` and `moments/thumbs/<assetId>.jpg`.
   - **The fallback path:** D7 has `public/thumbs/<assetId>.jpg`; the ST1 build's README and stub have `public/moments/thumbnails/<public id>.jpg`.
   - **The watch id:** what `?tab=moments&watch=<id>` carries.
   - **The fallback step:** whether the ST1 build still calls Q19 open, now that Beni has decided PR.

   Report each mismatch as one finding, saying which side a builder would follow and what each change would cost. Do not decide which side changes; that goes to the PM seat and Beni.
6. **Outcome per ID, and the verdict.**
   - **Outcomes.** For each of D-46 to D-57 and any D-58 onward, one of: closed (fixed), open (what is missing, with its acceptance test), unresolved to Beni, or not verified (the missing test). Keep Pass 1's severities unless your evidence changes one, and say why.
   - **New questions.** Any Beni question your findings raise, one word each, recommendation first.
   - **The verdict:** ready for the build plan, ready after named fixes, or blocked.
   - **The test list.** The implementation-plan tests that stay open, merged from Pass 1's Not verified and this pass: playback and the single element, the autoplay policy in Safari and iOS, the screen-reader announcement count, the server's read-only views, Storage Range and delete, the fallback PR protocol, the privacy audit at migration, and any you add.

Output. One report at /Users/benicheni/kickoff-d6-review/d7-synthesis.md; leave d6-cold-review.md untouched. Head it with your seat, the date, the D7 fingerprint, the folder-manifest hash you computed, the worktree SHA, PR #187's head, and the Chrome version. Then:
- the evidence index (P-22 onward);
- an outcome table;
- new findings in the Pass 1 shape;
- verified facts; not verified;
- the Appendix PM ledger;
- new Beni questions;
- the blocks completed;
- the verdict and the test list.

Nothing goes to GitHub. Then, in chat, for Beni: the verdict in one line; one line per open or new finding; any new question, one per line. Remove the worktree with `git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree remove /Users/benicheni/kickoff-d7-review-codex` (add `--force` only if you built the acceptance app inside it), stop the servers, close Chrome, and stop.

Appendix PM: the PM seat's pre-read of D7, Tue 13 Oct 2026, from the response file and spot reads of d7/data.js. Claims to verify, not findings.
- PM-7 (block 3, D-50). The hidden status region announces when a countdown starts and when it is cancelled. The PM seat found no announcement for the moment the next video actually starts by itself: the h1 changes and focus stays put. Judge whether a screen-reader user is told that playback moved to the next video (WCAG 4.1.3, status messages), and whether that is a gap in D7 or acceptable as designed.
- PM-8 (block 5). The fallback path and its key differ: D7 has `public/thumbs/<assetId>.jpg` (data.js, the Studio's "Where it goes" rows); the ST1 build in PR #187 at 0831550 has `public/moments/thumbnails/<public id>.jpg` (studio/README.md). The PM seat saw the table and view names agree (`studio.videos` with `published_at`, `unpublished_at` and `position`; `catalog.videos`), but checked nothing further.
- PM-9 (block 4, A-10). D7's status line reads "The countdown paused while this tab was hidden and resumed when you came back." Beni's answer was Pause: stop the countdown and the automatic start while hidden. Check that resuming the countdown on return, rather than requiring a fresh click, is consistent with what the brief carried ("they resume or wait when the tab returns") and is stated the same way in the spec, the switch help and the frames.
- PM-10 (block 3, D-55). The Studio's fallback row now says Beni's account "could push past verify, and Publish never does". The PM seat read main's two rulesets on 13 Oct: "main — CI gate" requires status checks with the RepositoryRole bypass set to `always`, and "main — history is append-only" forbids deletion and non-fast-forward pushes with no bypass. Check that the sentence is accurate and complete.
- PM-11 (block 3, D-52). H3 now reports zero unnamed controls and four passing checks, but it computes from the DOM, not from Tab presses or a screen reader. Only your CDP traversal can close D-52.

Not authorised: everything under the hard limits; any change to a design folder, the repo, a branch, a PR (including #187), an issue, a release or a setting; any merge, tag or version; `npm run sync` or `npm audit fix`; answering Beni's questions. Report every outcome as it happened.
````
