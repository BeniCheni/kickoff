# Moments D9 — the narrow check prompt for Codex (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by the PM seat on Tue 13 Oct 2026 for Codex (GPT-6.1 Sol High), after verifying the D9 export (fingerprint `0286a20b…78c0`), and delivered in chat.

---

````text
$kickoff-design-review

Moments D9 — a narrow check of a text-only touch-up: Claude Design's answer to your D8 delta check, run 2 (Codex, GPT-6.1 Sol High)

You are the independent check seat for one small design revision in github.com/BeniCheni/kickoff. Your D8 delta check, run 2 (/Users/benicheni/kickoff-d6-review/d8-delta-check-run2.md, backup at ~/kickoff-s55-run/backups/), returned "ready after named fixes": D-47 and D-59 open, D-64 new. On Tue 13 Oct Beni decided:
- **D-64 · Defer.** Uploaded files that never reached a record stay in Storage until the next Publish reuses them. Deleting them without publishing comes with the real Storage upload, a later slice.
- **Touch-up.** A text-only D9 round, not an errata note.

The PM seat (Claude Code) briefed Claude Design (/Users/benicheni/kickoff-s55-run/d9-design-brief.md), and Claude Design returned D9 with your report attached. Read the kickoff-design-review skill (.agents/skills/kickoff-design-review/SKILL.md and references/browser-evidence.md) by hand first.

This is the narrowest check in the cycle:
- confirm the five changes against your own acceptance tests;
- confirm that nothing else changed.

You do not redesign, edit the artifact or write product code, and you answer nothing for Beni.

Hard limits, as before. Nothing under ~/s4b or ~/kickoff-s4b. No edits to any design folder or repository file; no commit, push, branch, PR, issue, review, comment, release or setting change. No request to fal, Supabase, Vercel or any Google API. No spend, account, key or package install. **No test runner in any other seat's worktree:** this check needs none. If you run anything, run it inside ~/kickoff-d6-review. Run `TZ=America/New_York date` before writing any date.

The target. /Users/benicheni/Kickoff Moments gallery redesign D9. Its fingerprint is the SHA-256 of "Kickoff Moments - D9 manifest.sha256" itself: 0286a20b5732fd50fa16062c5d264f21c7e9dee5af4731bbe403ce1497ac78c0. The manifest has 18 entries, the same set as D8's with d9/ for d8/. On Tue 13 Oct at 21:19 ET the PM seat checked:
- all 18 lines pass, and the fingerprint reproduces;
- the folder holds 123 files; its whole-folder manifest is ~/kickoff-s55-run/d9-folder-manifest.sha256 (SHA-256 af9b29f18465933d835b1b26eb5434e904f749361489e4edac0c1ff37d7fed81);
- every D8 file is byte-identical in the D9 folder except .thumbnail;
- the D8 folder itself is unchanged from ~/kickoff-s55-run/d8-folder-manifest.sha256;
- the 8 new files are the D9 set plus uploads/d8-delta-check-run2.md, which is byte-identical to your report;
- d9/support.js is byte-identical to d8/support.js.

If any check differs, stop and report.

The work, in three short blocks. Write the report first and append to it after each block. Evidence continues from P-58 in ~/kickoff-d6-review/evidence, and any new finding takes the next number from D-65. Serve the folder on loopback, use `?frames=`, and stop servers and close Chrome at the end.

1. **Pin and delta map.** Diff D8 against D9: canvas, spec, d9/data.js and the runtime. Every change must map to one of:
   - D-64 Defer;
   - D-47 (the ten watch-state titles);
   - D-59 (the `.mp4` and `.jpg` extensions and the content type);
   - D-61 (the response label and one spec §9 sentence);
   - the D-58 severity bookkeeping;
   - D8-to-D9 file references and headings.

   Anything else is a new finding. The PM seat's reading of the diff:
   - `COPY` differs in four strings (`studio.confirm`, `studio.where[0]`, `studio.unpublishSteps[1]`, `watch.prov[7]`), and the records in `videoObj` and `thumbObj`;
   - the canvas adds three conditional aria-hidden tags (`statusTag`, `countdownTag`, `error.nextTag`), the same tag on the countdown frames' amber annotation, and two H3 checks.
2. **The fixes, by your acceptance tests:**
   - **D-47.** Run your P-56 title-occurrence probe again. The ten watch-state repeats should now be locally tagged:
     - four error panels;
     - three visible countdowns;
     - the "Now playing" line;
     - two refusal lines.

     Check every tag is aria-hidden, and that no accessible name or live-region text carries tag text, from the Chrome accessibility tree. The countdown's visually hidden status sentence stays untagged by design.
   - **D-59.** No extension-less object shape or example remains in the canvas, data or spec, and the Stored rule still forbids building a path.
   - **D-64.** Defer's text replaces the old "Unpublish and delete removes them" everywhere it appeared. No frame offers Unpublish or Retry delete for files that never reached a record. The partial-upload and record-failure lines still say "reusing" truthfully.
   - **D-61.** The response row and spec §9 name the four build outcomes beside the drawn phases.
3. **No regression, then verdict.**
   - The request log stays the manifest plus unpkg React.
   - Names and real Tab order are unchanged on the five frames you traversed for D8.
   - The copy deck matches the DOM.
   - Then give the outcome table (D-47, D-59, D-61, D-64, and one regression line for the sixteen already closed) and the verdict: ready as the design source for the Next.js build plan; ready after named fixes; or blocked.

Output. One report at /Users/benicheni/kickoff-d6-review/d9-check.md, with an unchanged copy at /Users/benicheni/kickoff-s55-run/backups/d9-check.md. Head it with your seat, the date, the D9 fingerprint, your folder-manifest hash and the Chrome version. Nothing goes to GitHub. In chat, for Beni: one line with the verdict, one line per open or new finding, and any one-word question with the recommendation first. Then stop servers, close Chrome and stop.

Not authorised: everything under the hard limits; any change to a design folder, the repo, a branch, a PR, an issue, a release or a setting; any merge, tag or version; `npm run sync` or `npm audit fix`; any other seat's work; answering Beni's questions. Report every outcome as it happened.
````
