# Moments D6 — the Pass 1 cold-review prompt for Codex (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by the PM seat on Mon 12 Oct 2026 for Codex (GPT-6.1 Sol Extra High), after verifying the D6 export (fingerprint `c3812bf3…7478`), and delivered in chat.

---

````text
$kickoff-design-review

Moments D6 — Pass 1 cold design review of Claude Design's D6: the generated-only gallery with thumbnails, the watch page with autoplay-next, the rewritten privacy page, and the Studio's Publish and Unpublish (Codex, GPT-6.1 Sol Extra High)

You are the Pass 1 cold reviewer, in Codex on GPT-6.1 Sol at Extra High, of a design for github.com/BeniCheni/kickoff. The PM seat (Claude Code, Opus 5.5) wrote the brief, and Claude Design (Fable 5.1 Extra) drew D6 from it on Mon 12 Oct 2026, so the independent read is yours. Read the kickoff-design-review skill (.agents/skills/kickoff-design-review/SKILL.md and references/browser-evidence.md) by hand first. You review; you do not redesign, edit the artifact or write product code. Your report feeds a Pass 1.5 rebuttal brief to Claude Design and Beni's answers to D6's questions Q13–Q22. After that the design becomes the source for the Next.js migration's Moments slices and the Studio's Publish slice.

Context. Beni ruled a pivot on Mon 12 Oct 2026, first-hand to the PM seat. Treat these as settled:
- **Drop.** Moments drops curated YouTube highlights and shows Kickoff's own generated videos only.
- **Full Next.js.** The whole Kickoff app moves to Next.js on Vercel and reads published videos from the Studio's Supabase Postgres through Drizzle on the server; no browser talks to the database.
- **Thumbnails.** Videos and thumbnails live in Supabase Storage, with a copy of each thumbnail shipped with the site as a fail-safe.
- **Publication** is a Studio Publish action, no longer a pull request per edition. This reverses Studio ruling 15.1.
- **The watch page** gains autoplay-next and omits likes, comments and view counts.

The settled design base is D5: docs/design-cycle-moments-d5-spec.md on main, with your four earlier review rounds archived as docs/design-cycle-moments-*.md. Still standing from it: the Fergie Time design system and hard rules (no invented number, amber for data trust only, no new motion); the Generated badge from data (Q1); provenance (15.7); native controls (Q2); sound on at Play (Q5); no autoplay on entry or re-entry (autoplay-next is Beni's one exception); the A-06 Article 50 gate; A-07's link on every tab; and the `?only=` and `&date=` contract. A decision is not a finding. A false factual premise under a decision is one: report it as a Beni adjudication item.

The brief's own text is at ~/kickoff-s55-run/d6-design-brief.md; read it, because coverage is judged against it.

Your session may be bounded, so the work is six ordered blocks. Create the report first and append to it after every block; if you run low, stop at a block boundary and say what you did not reach. Inside each block, run your own probes first, then check the Appendix PM items tagged to it.

Hard limits. Nothing under ~/s4b or ~/kickoff-s4b. The design folder's _ds/ is the local-only Fergie Time mirror: read it, never copy it into the repo. No edits to the design folder or to any repository file; no commit, push, branch, PR, issue, release, setting change or GitHub comment. No request to fal, Supabase, Vercel, any video host or any Google API; reading public documentation pages is allowed. No spend, account, key or package install (no Playwright, no npm install). Run `TZ=America/New_York date` before writing any date.

Setup:

```bash
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff fetch origin
git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree add --detach /Users/benicheni/kickoff-d6-review-codex origin/main
git -C /Users/benicheni/kickoff-d6-review-codex log --oneline -3
mkdir -p /Users/benicheni/kickoff-d6-review/evidence /Users/benicheni/kickoff-d6-review/probes
cd "/Users/benicheni/Kickoff Moments gallery redesign D6" && shasum -a 256 -c "Kickoff Moments - D6 manifest.sha256"
shasum -a 256 "/Users/benicheni/Kickoff Moments gallery redesign D6/Kickoff Moments - D6 manifest.sha256"
cd "/Users/benicheni/Kickoff Moments gallery redesign D6" && find . -type f ! -name '.DS_Store' -print0 | LC_ALL=C sort -z | xargs -0 shasum -a 256 > /Users/benicheni/kickoff-d6-review/folder-manifest.sha256
diff /Users/benicheni/kickoff-s55-run/d6-folder-manifest.sha256 /Users/benicheni/kickoff-d6-review/folder-manifest.sha256
```

The target. /Users/benicheni/Kickoff Moments gallery redesign D6 is a new Claude Design project; D1–D5 are not in it. The D6 fingerprint, the SHA-256 of "Kickoff Moments - D6 manifest.sha256" itself, is c3812bf334aeb68832d9c3e1821a163440cda0446c8b92044a6142d7f2c77478, over 6 files: the canvas `Kickoff Moments - D6 design canvas.dc.html`, the spec (byte-identical to d6/spec.md), d6/data.js, d6/image-slot.js and d6/support.js. On Mon 12 Oct the PM seat checked:
- all 6 lines pass, and the fingerprint reproduces;
- the folder holds 30 files; its whole-folder manifest is ~/kickoff-s55-run/d6-folder-manifest.sha256, SHA-256 57192aa44739272b5482cb1fc9f776cb80e39b866952bb95c282475b21a2fda1;
- the four files under docs/ are byte-identical to main's at f523b52, copied there for reference, and not D6 outputs;
- the canvas loads a root `support.js`, which is outside the manifest and byte-identical to d6/support.js.

If any check differs, stop and report. Main is f523b52 or later; record the head you read.

Render. Serve the folder: `python3 -m http.server 8765 --bind 127.0.0.1 --directory "/Users/benicheni/Kickoff Moments gallery redesign D6"`. Open the canvas over 127.0.0.1 with the tab visible; it needs unpkg for React, so say if that fails. Use your browser surface, or the installed Chrome headless over CDP from scripts in ~/kickoff-d6-review/probes (your Pass 2.5 scripts in ~/kickoff-d2-review/probes are there to adapt). Measure with computed styles, rects and the accessibility tree, not with the canvas's own printed probes. Its "expected" values are computed by d6/data.js `geo()`, so they are the canvas agreeing with itself. Number evidence from P-01 in this new folder, and findings from D-46: D-01 to D-45 belong to earlier Moments design cycles and are never reused. Stop the server and close Chrome at the end.

The blocks, in order. Every claim needs a probe you ran or a page you read.

1. The record and coverage.
   - **Coverage.** Every brief item A–E, artboards 1–14 and handoff items 1–8 has an answer.
   - **The §0 changelog** classifies every D5 decision honestly: superseded by the pivot, kept, changed, or reopened.
   - **The copy deck** (§3) matches the rendered DOM verbatim, after substituting values.
   - **ILLUSTRATIVE labels.** Every invented value is labelled ILLUSTRATIVE, and the measured values trace to D5 Appendix S.
   - **No real people or places.** No real club, player, crest, competition or result appears. d6/image-slot.js can render Unsplash stock photos with credits, so confirm that no frame shows a stock or real photograph, and say what each thumbnail slot actually renders.
2. The gallery.
   - **Rendering.** The thumbnail card, the fallback chain (Supabase, then the site's copy, then the STUDIO cover) with its amber data-trust line, the unavailable state and its stated reason, the filters (Subject replacing Competition and Category; spoiler-light at Q18), the uniform grid, and Q22's record-framed box. Test each in the DOM at 360, 390 and 1000, across lenses and themes.
   - **Geometry.** Recompute §5's geometry table from src/index.css's rules and D6's stated grid (`repeat(auto-fill, minmax(280px, 1fr))` above 760). Where D6 keeps an existing box (the player box, the stage layout), compare it with your P-22 app measurements in ~/kickoff-d2-review/evidence/P-22-app-geometry.json, which still stand: the Moments CSS has not changed.
   - **Amber.** Judge whether the amber line meets hard rule 3 (data trust only).
3. The watch page and autoplay-next.
   - **States.** Every state in §1 is drawn, with copy matching §3.
   - **One element.** One player host and one video element throughout, with the thumbnail before Play and `poster` unset (Q3's changed premise). Nothing is drawn over the picture.
   - **Autoplay-next:** the switch's role and name; the countdown's live region (judge the once-a-second polite announcement against the "announce once" goal §8 itself names); Cancel; the end of the list; stopping on error; the browser-refused state; theater mode (Q14).
   - **Keyboard order and names** (§8), computed independently.
   - **The watch URL** `?tab=moments&watch=<id>` (Q20). Check §6's claim that `canonicalSearch` leaves it alone against src/lib/urlCodecs.ts at the head you read, and that `?only=`, `&date=`, `tab`, `lens` and `view` are unchanged. Note how a Next.js migration would carry that contract.
4. The privacy and terms page.
   - **Facts against the pivot's architecture.** Vercel serves every request; Supabase serves files directly and sees each thumbnail load and play; the gallery list reaches the browser through the server; Google Fonts loads unless cached; and the browser-storage keys (four if Q17 = Key).
   - **Every new claim.** Check each sentence that describes how the new app will behave is labelled or plainly true as a design statement, since that app is unbuilt.
   - **Terms (Q15).** Read the Terms of use for anything that now claims more than the site will do.
5. The Studio's Publish and Unpublish.
   - **The gate.** A-06 in both states, with the answer shown, never summarised.
   - **The steps.** The four publish steps and their honest partial outcomes; Unpublish and its withdrawn state (Q21); the fifteen job states.
   - **Q19, the fallback commit** (PM-2). Test it against the repository's process. Read CLAUDE.md on what may push to main, and main's ruleset (`gh api repos/BeniCheni/kickoff/rules/branches/main`; read only). Say whether a commit pushed straight to main from Beni's Mac would be accepted, and what each alternative (Build, a PR with auto-merge, or another host for the copies) costs, without choosing for Beni.
   - **The records.** Check that D6 §9's record names (`videos`, `published_at`, `position`) are consistent with what the Studio's ST1 brief asks for (~/kickoff-s55-run/st1-build-brief-v2.md and its addendum st1-v2-addendum-d6.md). A mismatch the builders would have to guess at is a finding.
6. **Tokens, contrast, motion and accessibility receipts.**
   - **Contrast.** Recompute every pair in §5 and H1 in both themes, and add any pair the canvas uses but §5 omits.
   - **Motion.** The inventory in no-preference and reduce, with Emulation.setEmulatedMedia: no new motion beyond the lens switcher's existing 180 ms token.
   - **Accessible names.** Compute them on the gallery, watch, privacy and Studio frames, independently of H3.

Output. One report at /Users/benicheni/kickoff-d6-review/d6-cold-review.md. Head it with your seat, the date, the D6 fingerprint, your folder-manifest hash, the worktree SHA and the browser and version. Then:
- an evidence index (P-01 onward);
- findings from D-46, each with severity (high when a builder or reader would ship or meet something false, non-compliant or inaccessible; medium for recoverable friction or a gap the builder must guess around; low for local polish), its location, expected and observed, the probe, the impact, and an acceptance or overturn test;
- verified facts; design interpretation; proposed improvements;
- Beni's adjudication items, one word each with your recommendation first. Fold in D6's Q13–Q22 with your own view where it differs from Claude Design's, plus any your findings raise;
- Not verified, each naming the missing test;
- the Appendix PM ledger;
- the blocks completed, and the verdict: ready for adjudication and the build plan, ready after named design fixes, or blocked.

Nothing goes to GitHub. Then, in chat, for Beni: the verdict in one line; one line per high or medium finding; the count of lows; and the adjudication list, one line per question. Remove the worktree with `git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree remove /Users/benicheni/kickoff-d6-review-codex`, stop the server, close Chrome, and stop.

Appendix PM: the PM seat's pre-read of D6, Mon 12 Oct 2026. Claims to verify, not findings.
- PM-1 (block 1). The canvas runs a root `support.js` outside the manifest; it is byte-identical to the manifested d6/support.js today, but the fingerprint would not notice if it changed. Decide whether that is a pin gap worth a finding.
- PM-2 (block 5). Q19 "Commit" has the Studio push `public/thumbs/<id>.jpg` to main with Beni's token on every Publish, and the same on Unpublish. The PM seat read main's rules as required status checks, no deletion and no force-push. Kickoff's sync never pushes straight to main; it opens a PR. If a direct push would be refused, or would bypass the checks, the recommended answer rests on a false premise.
- PM-3 (block 2). The fail-safe covers a narrow case. The site's thumbnail copy is used only when a Storage request fails while the list still loads. When a Free-plan project pauses, the database and Storage go together, so the gallery shows "The gallery is unavailable." and no cards (D6 §6, deliberately, so a withdrawn video can never reappear). Check that D6 says plainly which failures the fail-safe covers. Beni chose "Supabase first; site as a fail-safe" and may expect more.
- PM-4 (block 3). Autoplay-next's countdown replaces its text every second inside an `aria-live="polite"` region, five times per video. §8 itself flags that the announcement cadence is unverified. Judge whether the design's own goal (announce once) is met by the markup it specifies.
- PM-5 (block 5). D6 adds a fifteenth job state, `withdrawn` (Q21), and names the catalog `videos` with `published_at` and `position`. The ST1 brief was written before D6; the PM seat has written the addendum named in block 5 to align it. Check that the two agree.
- PM-6 (block 4). The privacy page says "Read from the code on 2026-10-12" about a Next.js app that does not exist yet. Check that every sentence describing the future app's behaviour is labelled or carried as a design statement, and that the stamp is marked ILLUSTRATIVE as §3 says.

Not authorised: everything under the hard limits; any change to the design folder, the repo, a branch, a PR, an issue, a release or a setting; any merge, tag or version; `npm run sync` or `npm audit fix`; answering Beni's questions. Report every outcome as it happened.
````
