# Moments D8 — the delta-check prompt for Codex, and the resume note (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by the PM seat on Tue 13 Oct 2026 and delivered in chat: the delta-check prompt for Codex (GPT-6.1 Sol High), after verifying the D8 export (fingerprint `305e9907…1c1784`), and the note sent to the same Codex chat after the first run stopped, because the review folder it depended on had been deleted.

---

## 1 · The D8 delta-check prompt, PM seat → Codex (Tue 13 Oct 2026)

````text
$kickoff-design-review

Moments D8 — delta check: Claude Design's last design revision (five open fixes, and Beni's Q23–Q27 answers that reconcile the design with the Studio build), against D7 and your Pass 2.5 (Codex, GPT-6.1 Sol High)

You are the independent check seat for one design revision in github.com/BeniCheni/kickoff, in Codex on GPT-6.1 Sol at High. A Codex session ran Pass 2.5 on D7 earlier today (/Users/benicheni/kickoff-d6-review/d7-synthesis.md). Its verdict was "ready after named fixes": eight findings closed; D-47, D-48, D-51 and D-57 still open; D-58 new against the canvas; and D-59 to D-63, where D7 and the Studio build in PR #187 disagreed, sent to Beni. On Tue 13 Oct Beni answered, first-hand to the PM seat, all as recommended except Q26, where you had recommended Frame and the PM seat recommended Keyframe:
- Q23 Stored
- Q24 Nested
- Q25 Public
- Q26 Keyframe
- Q27 Withdraw

The PM seat (Claude Code) then sent two hand-offs:
- a D8 brief to Claude Design (Fable 5.1 Extra, the builder): /Users/benicheni/kickoff-s55-run/d8-design-brief.md;
- the same answers to Cursor for #187's Pass 2: /Users/benicheni/kickoff-s55-run/pr187-design-contract-addendum.md, folded into /Users/benicheni/kickoff-s55-run/pr187-pass2-cursor-brief.md.

Both came back today. Claude Design returned D8, and Cursor's Pass 2 (Grok 4.7) moved #187 to 6609df9, "mergeable, and left unmerged". **Your report was not attached to Claude Design's chat**, and D8's response says so: D8 answers the brief's one-line statement of each finding, not your block-3 acceptance tests. Judge it by your tests.

Read the kickoff-design-review skill (.agents/skills/kickoff-design-review/SKILL.md and references/browser-evidence.md) by hand first. This is a delta check:
- confirm the five fixes against your own acceptance tests;
- confirm that D8 and ST1 at 6609df9 now state one contract for D-59 to D-63;
- make sure nothing closed has reopened.

You do not redesign, edit the artifact or write product code, and you answer nothing for Beni. D8's response is the builder describing its own work: use it to find the changes, and check each one yourself.

Your session may be bounded, so the work is four ordered blocks. Create the report first and append to it after every block; if you run low, stop at a block boundary and say what you did not reach. Inside each block, run your own probes first, then check the Appendix PM items tagged to it.

Hard limits, as in Pass 2.5. Nothing under ~/s4b or ~/kickoff-s4b. The folder's _ds/ is the local-only Fergie Time mirror and uploads/ holds review copies: read them, copy neither into the repo. No edits to any design folder or repository file; no commit, push, branch, PR, issue, review, comment, release or setting change, and that includes PR #187: read it only. No request to fal, Supabase, Vercel or any Google API; public documentation pages may be read. No spend, account, key or package install beyond `npm ci --no-audit --no-fund` in your review worktree if a harness needs it; no `npm audit fix`, no `npm run sync`. Run `TZ=America/New_York date` before writing any date.

Setup:

```bash
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff fetch origin
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree add --detach /Users/benicheni/kickoff-d8-check-codex origin/main
git -C /Users/benicheni/kickoff-d8-check-codex log --oneline -3
git -C /Users/benicheni/kickoff-d8-check-codex diff --stat f523b52 HEAD -- src public index.html package.json
cd "/Users/benicheni/Kickoff Moments gallery redesign D8" && shasum -a 256 -c "Kickoff Moments - D8 manifest.sha256"
shasum -a 256 "/Users/benicheni/Kickoff Moments gallery redesign D8/Kickoff Moments - D8 manifest.sha256"
cd "/Users/benicheni/Kickoff Moments gallery redesign D8" && find . -type f ! -name '.DS_Store' -print0 | LC_ALL=C sort -z | xargs -0 shasum -a 256 > /Users/benicheni/kickoff-d6-review/d8-folder-manifest.sha256
diff /Users/benicheni/kickoff-s55-run/d8-folder-manifest.sha256 /Users/benicheni/kickoff-d6-review/d8-folder-manifest.sha256
gh pr view 187 --repo BeniCheni/kickoff --json state,isDraft,headRefOid,headRefName
```

The target. /Users/benicheni/Kickoff Moments gallery redesign D8. Its fingerprint is the SHA-256 of "Kickoff Moments - D8 manifest.sha256" itself: 305e99072a6c9307ce3be080b98e777db7d81b668a35ce2013bbf981b41c1784. The manifest has 18 files:
- the D8 canvas, spec and response;
- d8/data.js, d8/spec.md and d8/support.js;
- the six _ds stylesheets the canvas links;
- the six font files they reference.

d7/image-slot.js and _ds_bundle.js are no longer listed (D-48). On Tue 13 Oct at 14:08 ET the PM seat checked:
- all 18 lines pass, and the fingerprint reproduces;
- the folder holds 115 files; its whole-folder manifest is ~/kickoff-s55-run/d8-folder-manifest.sha256 (SHA-256 d91c28be1029bccc3794cbc4f49e6aa3a5a9e46d711aeda918e722095ab855f4);
- every file of the D7 folder is byte-identical in the D8 folder except .thumbnail and github.md (export metadata), so D7's 14-line manifest still passes there;
- the 7 new files are the D8 set;
- uploads/ is unchanged from D7 and has no d7-synthesis.md.

One housekeeping note: the D7 folder itself picked up "Kickoff Moments gallery redesign D8.zip" (the export download, byte-identical to the D8 folder's contents). Beni may have moved it out by the time you run. D7's own 14-line manifest is unaffected either way; do not treat the zip as a D7 change. If any other check differs, stop and report.

Render as in Pass 2.5:
- Serve the D8 folder on 127.0.0.1:8765 and open "Kickoff Moments - D8 design canvas.dc.html" with the tab visible. It needs unpkg for React; use `?frames=<id>,<id>` to render a few frames at a time.
- Drive Chrome over CDP from scripts in ~/kickoff-d6-review/probes; adapt your D7 scripts under new names.
- Compute app geometry from src/index.css's rules, as before.
- Continue the evidence index from P-39 in ~/kickoff-d6-review/evidence, and number any new finding from D-64.
- Stop all servers and close Chrome at the end.

The blocks, in order. Every claim needs a probe you ran or a page you read.

1. **Pin and delta map.** Diff the D7 set against the D8 set: the canvas, spec, data and runtime. Every change must map to one of these:
   - D-47, D-48, D-51, D-57 or D-58;
   - Beni's Q23 to Q27, which are the design side of D-59 to D-63;
   - the optional "Now playing" status line (PM-7), which D8 took.

   Anything else is a new finding. The eight findings you closed on D7 (D-46, D-49, D-50, D-52, D-53, D-54, D-55, D-56) must be untouched, and every ruling settled before 13 Oct must be unchanged.
2. **The five fixes, by your acceptance tests:**
   - **D-47.** An adjacent ILLUSTRATIVE tag beside every invented value where it is drawn:
     - card and watch titles, dates and notes;
     - Up next and Earlier rows;
     - the jobs list's billed column, separate from the measured $0.225;
     - Unpublish step times and paths.

     D8 makes the tags `aria-hidden`; confirm that keeps D-52's accessible names clean.
   - **D-48.** From the request log: loopback requests only to manifested paths, plus unpkg's React. Check that `/.image-slots.state.json` is gone, no `<image-slot>` remains, and that the empty icon stops the `/favicon.ico` request. Also check whether the canvas can still request the Babel URL in d8/support.js.
   - **D-51.** Run D8's `urlCases(todayIso())`, `canonicalSearch`, `mergeWatch`, `enterWatch`, `leaveWatch` and `leaveTab` (d8/data.js) against the real `canonicalSearch` in src/lib/urlCodecs.ts at the worktree head, as your P-09 harness did. Cover:
     - Ledger, Poster and Broadcast;
     - full, empty, partial and junk `only`;
     - junk keys;
     - today versus prior-day pins, including the row that skips the load step by design.
   - **D-57.** Contrast for every rendered text pair in both themes with effective opacity:
     - the STUDIO lettering (SVG `--media` ground);
     - the disabled class's exemption and printed ratios;
     - whether "canvas chrome" is classified honestly.
   - **D-58.** Undo shuffle from the accessibility tree and real Tab presses: disabled, out of the tab order, and in agreement with H1a and H3.

   Give each fix one outcome: closed, open (with what is missing) or not verified.
3. **One contract with the Studio build** (PR #187 at 6609df9, read-only, via `git show origin/cursor/studio-st1:<path>`). For each of D-59 to D-63, put D8's words (spec §3 and §9, d8/data.js `studio.*`, frames `10-*` and `11-*`) beside ST1's (studio/README.md, studio/storage/port.ts and stub.ts, studio/engine.ts and its tests). Then say whether one contract now holds:
   - **D-59, Stored.** The site reads the bucket and object path from the record and never builds one. See PM-13 on file extensions.
   - **D-60, Nested and Public.** The fallback copy is at `public/moments/thumbnails/<public id>.jpg`, and the watch id and the views' `id` are the public id; no asset or job UUID appears publicly.
   - **D-61.** Read PM-12 first. Q19 and Q21 are recorded as decided in both artifacts, and the fallback PR phases match. D8's drawn phases (PR open · verify running · failed · merged · deploying · serving) should line up with ST1's four outcomes (`pr-opened`, `checks-running`, `merged`, `checks-failed`) and its `pending` / `failed` / `merged` status. Deploying and serving are the explicit boundary of a later slice.
   - **D-62, Keyframe.** Both say "the keyframe the clip starts from (K0)".
   - **D-63, Withdraw.** The state sequence matches: withdraw in one transaction; optional delete with its own retry; the removal PR always runs. Check against ST1's tests (each delete failing, the withdrawal write failing, retry-delete, retry-removal). Your earlier P-36 counterexample (engine 703–725) should no longer reproduce.

   ST1's own correctness is #187's review, not yours: judge only whether the two artifacts now describe one contract.
4. **No regression, then verdict.**
   - Re-run the Pass 2.5 checks D8 could have disturbed: names and focus order, motion in both modes (the image slot's removal should leave no shadow roots), overflow, and the copy deck against the DOM.
   - Check the "Now playing" line (frame `6-390-nowplaying`). It is a single change to the existing polite status, spoken only on an automatic advance, with no new live region. It must not double the countdown's one-start and one-Cancel announcements (D-50).
   - Give the outcome table: D-47, D-48, D-51, D-57, D-58, D-59 to D-63, any D-64 onward, and one regression line for the eight already closed.
   - Give the verdict: ready as the design source for the Next.js build plan; ready after named fixes; or blocked.
   - Finish with your block-7 implementation-plan test list from d7-synthesis.md, updated for D8 and ST1 at 6609df9.

Output. One report at /Users/benicheni/kickoff-d6-review/d8-delta-check.md; leave the earlier reports untouched. Head it with:
- your seat and the date;
- the D8 fingerprint and your folder-manifest hash;
- the worktree SHA and #187's head SHA;
- the Chrome version.

Evidence goes in evidence/ under P-numbered names. Nothing goes to GitHub. Then, in chat, for Beni:
- one line with the verdict;
- one line per open or new finding;
- any one-word question a new D8 choice created, with the recommendation first.

Then:
- remove the worktree with `git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree remove --force /Users/benicheni/kickoff-d8-check-codex`;
- stop the servers and close Chrome;
- stop.

Appendix PM: the PM seat's pre-read of D8, Tue 13 Oct 2026, 14:08 ET. The PM seat read the response, spot-read d8/data.js and the spec, rendered selected frames on a loopback server, and read #187's Pass 2 comment. These are claims to verify, not findings.
- **PM-9 (block 2, D-48).** The PM seat rendered four frames. The server log showed loopback requests for the canvas, d8/support.js, d8/data.js, the six stylesheets and five of the six fonts (IBMPlexMono-Italic was not requested by those frames). The only off-host requests were unpkg's React and ReactDOM 18.3.1. There was no Babel request, no `/.image-slots.state.json` and no `/favicon.ico`. A full-page run is yours.
- **PM-10 (block 2, D-51).** The PM seat ran D8's codec block and `urlCases` against main's real `canonicalSearch` at f523b52 under tsx (today = 2026-10-13):
  - all 23 computed rows matched;
  - 20,000 random queries over owned keys, junk keys and `watch` gave 0 mismatches;
  - one row (Back × 3) is hand-written.

  Row 18 skips the load step on purpose: a pin taken yesterday has become today mid-session. Check that against App.tsx's once-per-load `useRef` guard.
- **PM-11 (block 2, D-57).** STUDIO measured 12.54 light and 16.00 dark: computed `--text` against the SVG rect's computed fill `--media`, effective opacity 1, frames `2-last-L` and `2-last-D`. The PM seat did not measure the disabled or chrome classes.
- **PM-12 (block 3, D-61).** D8's response labels D-61 "covered by D-60: the watch id and the fallback key are one public id". That is not what your D-61 is. Without your report, Claude Design guessed. In substance:
  - **Design side:** D8 draws the PR phases in frames `10-pr-pending`, `10-pr-failed`, `10-deploy-pending` and `11-partial-pr`.
  - **Build side:** the README and port fix went to ST1 through the PM's addendum, and Cursor's Pass 2 reports it done in 8064741.

  Judge whether D-61 closes on the two together. The response's mislabel is a paperwork error.
- **PM-13 (block 3, D-59).** ST1 at 6609df9 writes keys **with** extensions: `<public id>/video-<sha8>.mp4` and `<public id>/thumbnail-<sha8>.jpg` (studio/storage/stub.ts:22–24), and `putVideo` and `putThumbnail` take the MIME type. #187's Pass 2 brief asked for this (/Users/benicheni/kickoff-s55-run/pr187-pass2-cursor-brief.md:222–224). That brief was written after the D8 brief went out, and the D8 brief described ST1 at 0831550, so D8 draws the shape **without** extensions.
  - Under Q23 Stored the site never builds a path, so readers are unaffected. The drift is in D8's stated shape and its ILLUSTRATIVE examples.
  - The PM seat's position: keep ST1's extensions, and carry D8's shape as a one-line erratum into the Next.js plan rather than re-exporting the design.

  Test whether anything beyond the examples depends on the shape.
- **PM-14 (block 3).** The withdrawn clip fra-0005's ILLUSTRATIVE stored paths (d8/data.js:328) reuse fra-0004's video and thumbnail hashes (5b20e7aa, e94a3d10): two clips with one content hash. The illustrative PR number "#181" in frames 10 and 11 is also a real PR in the repo. Both are labelled ILLUSTRATIVE. Say whether either misleads a builder.
- **PM-15 (block 3).** The Publish confirmation says that after Cancel post-upload, the files stay "until the next Publish reuses them or Unpublish and delete removes them". A clip that was never listed has nothing to unpublish. Check whether D8 or ST1 gives a path to delete the files of a clip that never reached the record, or whether that is a plan item.
- **PM-16 (block 4).** D8's receipt totals are canvas self-reports: 119 frames, 6,310 text nodes, 56 pairs, 0 unnamed. So is `geo()`'s expected column, which is self-referential and unchanged from D7. Main has not changed under src since f523b52 as of the PM's check. If your diff in setup shows drift, separate it from a design defect.

Not authorised: everything under the hard limits; any change to a design folder, the repo, a branch, a PR, an issue, a release or a setting; any merge, tag or version; `npm run sync` or `npm audit fix`; any other seat's work; answering Beni's questions. Report every outcome as it happened.
````

## 2 · The resume note, PM seat → the same Codex chat (Tue 13 Oct 2026)

````text
Resume the D8 delta check. Your preflight stop was right: the prerequisite was missing. It has been restored, with the provenance below. Run blocks 1–4 of the original prompt, with these changes. Hard limits, scope and the not-authorised list are unchanged.

1. **d7-synthesis.md is back**, at /Users/benicheni/kickoff-d6-review/d7-synthesis.md: 47,976 bytes, 261 lines, SHA-256 c519479f2b71dd2dd3dd84c30d9a7f6c31021b4590458774adecc85c054aa38e. It is a rebuild, not the original file; read d7-synthesis.RESTORED.txt beside it. On Beni's word "Recover", a PM seat rebuilt it by replaying, in order, the nine literal writes, appends and replacements recorded in your own D7 session log (~/.codex/sessions/2026/10/13/rollout-2026-10-13T12-37-40-01a13620-7b26-7492-a182-34edb9bfd15d.jsonl). No logged code was run.

   A second PM seat compared the rebuild with what it had read from the original at 13:02 and 14:06 ET:
   - **Byte-identical:** lines 168–187 and 236–250, which hold D-59 to D-63 and your block-7 test list.
   - **Same at every point it had read:** the heading index, and lines 94–132 and 160–256. It had read those only up to a column limit, so only the text before each cut was compared.
   - **Size:** matches the original.

   Lines 1–93 and 133–159 were checked only by the heading index. If you want more certainty, check the rebuild against your own log yourself. Then use it as your Pass 2.5 report, saying in your header that it is a rebuild.
2. **Gone for good:** evidence P-22 to P-38 and your probes/ scripts. The folder was deleted between 14:08 and 14:20 ET today; it is not in the Trash, and no Claude Code, Codex or Cursor log shows the deletion. Write fresh probes in ~/kickoff-d6-review/probes. Cite no lost P-number as evidence you can reopen; where the D7 report relies on one (P-36's engine 703–725 counterexample, P-09's URL harness), re-run the check at today's heads. The D6 cold review survives as uploads/d6-cold-review.md in the D8 folder.
3. **Numbering and output.** Your preflight used P-39, so continue from P-40, with new findings from D-64. Write the new report to /Users/benicheni/kickoff-d6-review/d8-delta-check-run2.md, and leave the stopped report d8-delta-check.md as the record of the first run. When the report is final, also copy it, unchanged, to /Users/benicheni/kickoff-s55-run/backups/d8-delta-check-run2.md, so one deletion cannot lose it again.
4. **Main has moved since f523b52**, to d3190a3:
   - e97b696 is `npm run sync`, which changed src/data/ only;
   - d3190a3 is #188, which changed docs only.

   src/lib, src/index.css and src/App.tsx are unchanged. Run your URL harness at the worktree head anyway, and treat data drift as not a design defect.
5. **#187 has a Pass 2b in progress.** Pass 2.5 asked for six fixes plus PM-8 before merge (brief ~/kickoff-s55-run/pr187-pass2b-cursor-brief.md). Block 3 still compares D8 with ST1 at **6609df9**; record #187's live head in your header. If Pass 2b commits have landed by the time you run, say whether any of them touch the D-59 to D-63 contract (storage keys, fallback outcomes, the unpublish order, thumbnail source). Judge nothing else in them.

Everything else in the original prompt stands, including Appendix PM-9 to PM-16. In chat, as before: the verdict, one line per open or new finding, and any one-word question with the recommendation first.
````
