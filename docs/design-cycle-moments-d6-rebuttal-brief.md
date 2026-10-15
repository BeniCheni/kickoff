# Moments D6 — the Pass 1.5 rebuttal brief for Claude Design, with Beni's answers (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by the PM seat on Mon 12 Oct 2026 and delivered in chat with Codex's review attached. It carries D-46 to D-57 and records Beni's answers as given that day: Q13 Native, Q14 Theater, Q15 Keep, Q16 On (Codex had recommended Off), Q17 Key, Q18 Remove, Q19 PR, Q20 Query, Q21 No, Q22 Record, A-09 Scoped, A-10 Pause, A-11 Preserve. [moments-pivot-record.md](moments-pivot-record.md) §2 tabulates them.

---

````text
Moments D6, Pass 1.5 — rebuttal brief for Claude Design, with Beni's answers to Q13–Q22 and A-09–A-11 (from the PM seat, Claude Code)

Written Mon 12 Oct 2026 (TZ=America/New_York) by Kickoff's PM seat, to Claude Design, the builder of D6. Codex (GPT-6.1 Sol Extra High) gave D6 its independent Pass 1 cold review the same evening. Beni has attached the report, d6-cold-review.md. Its verdict: ready after named design fixes, with 12 findings, D-46 to D-57 (3 high, 7 medium, 2 low). Beni then answered all twelve open questions, so this round does both: answer the findings, and fold in his answers. Write D7 beside D6 (`Kickoff Moments - D7 design canvas.dc.html`, `Kickoff Moments - D7 spec.md`, a short `Kickoff Moments - D7 response.md`, a `d7/` folder). Leave every D6 file as it is: D6 is the reviewed record, fingerprint c3812bf3…7478. No implementation plan, product code or release action; nothing named with a release number.

The manifest (D-48). D7's manifest must cover every file the canvas executes, so that the fingerprint pins what actually runs. Either list the root runtime files, or have the canvas load only manifested `d7/` files. The fingerprint is the manifest file's own SHA-256, as before.

BENI'S ANSWERS, Mon 12 Oct 2026, first-hand to the PM seat. Record each as "decided 12 Oct" and fold it into the spec, the copy and the canvas.

| # | Answer | What D7 does |
|---|---|---|
| Q13 | **Native** | Keyboard shortcuts are the browser's own, once the video has focus. Keep the one help sentence; no page-level handlers |
| Q14 | **Theater** | Floodlights Cinema becomes the watch page's theater mode: one page, one element, one column at the gallery's outdent; Escape exits. The overlay, its fixed dialog and its own privacy line are withdrawn. D-25 is now met by the shell foot alone; say so |
| Q15 | **Keep** | The two-sentence Terms of use stays |
| Q16 | **On** | Autoplay-next is on by default. Codex had recommended Off, to avoid sound continuing by default; Beni chose On, with A-10 below as the guard |
| Q17 | **Key** | The choice is remembered under `kickoff-moments-autoplay-v1`, and the privacy page lists four keys. Codex notes that default and memory are independent; with On plus Key, the reader's Off sticks |
| Q18 | **Remove** | Spoiler-light goes |
| Q19 | **PR** | The fallback thumbnail reaches the repo as a small thumbnail-only pull request. It runs the normal `verify` check and auto-merges when green, as the sync bot's PRs do. "Commit" is withdrawn (see D-55 and A-11) |
| Q20 | **Query** | `?tab=moments&watch=<id>`, preserving every existing parameter on the way in and out (see D-51) |
| Q21 | **No** | A withdrawn clip is never relisted; regenerate with it as parent |
| Q22 | **Record** | Each card's thumbnail box follows the record's own frame. Draw a mixed 16:10 and 16:9 row so "uniform grid" is unambiguous |
| A-09 | **Scoped** | The fail-safe covers a thumbnail that fails while the published list still loads, and only that. When the database is unavailable (a paused Free project takes the database and Storage down together) the gallery shows its unavailable state and no cards, as D6 §6 already says. The privacy copy must say the same (D-54). Supabase's Pro plan, not this copy, is the protection against a pause; that is Beni's decision before going public |
| A-10 | **Pause** | While the tab is hidden, the countdown and the automatic start stop; they resume or wait when the tab returns. Replace D6 §6's "the countdown still runs" |
| A-11 | **Preserve** | Nothing reaches main without the required checks. That follows from Q19 PR |

THE FINDINGS. For each, give one disposition in the response:
- **Accept**, naming what changed in D7 (frame, file and line).
- **Contest**, with a probe someone else can run, or a primary source.
- **Accept the observation, contest the characterization or severity**, with evidence.

A contest without evidence goes to Beni unresolved. Do not describe untested behaviour as verified. "PM re-checked" below means the PM seat confirmed it in the files or the repo on 12 Oct.

High:

**D-49 · "Nothing is fetched until Play." is now false.** PM re-checked: §3 keeps the D5 status line, while §6 and §9 load the thumbnail before Play from Storage, then the site's copy. PM suggests: accept. Correction: scope the sentence to the video file (for example, that the video itself is not requested until Play), and make it agree with the privacy page's thumbnail disclosure. Acceptance: no sentence anywhere promises that nothing is fetched before Play.

**D-53 · The privacy page claims a code audit of an app that does not exist.** PM re-checked: §3's intro and stamp both say "Read from the code on 2026-10-12", and main is still the Vite app. PM suggests: accept. Correction: mark the page as prospective copy for the migration, make the stamp's ILLUSTRATIVE status unmistakable on the frames themselves, and state that the migration's real audit of code, dependencies, cookies and network sets the final date and claims. Acceptance: no frame or deck line asserts an audit that has not happened.

**D-55 · Q19's "Commit" would bypass the required check.** Codex read main's ruleset and the PM seat re-checked it. "main — CI gate" requires `verify`, but its bypass list gives the repository-admin role `always`, and Beni's account can bypass. So a direct push from his Mac would be accepted without `verify`; it is not refused. The PM seat's own pre-read said it would "likely be refused". That was wrong, and Codex corrected it. Beni has now answered PR (Q19) and Preserve (A-11), so this is a redraw, not a contest. Correction:
- **Publish's last step** becomes "open the fallback PR": it opens, `verify` runs, it auto-merges, and Vercel deploys. Draw each step's words, and the partial outcomes: the clip is live while the fallback PR is pending; the PR fails its checks; the merge happens but the deploy is pending.
- **Unpublish** removes its copy the same way.
- **Delete the "Commit" wording** everywhere. The "about a minute" figure is ILLUSTRATIVE unless measured.

Medium:

**D-46 · States missing from the drawings.** Missing: NoResults with its new copy, the saved and save-refused card, muted on the watch page, aborted, the record-write failure drawn (not only in prose), Unpublish's partial failures with their recovery, a jobs list showing all fifteen states, and the fallback and unavailable states across the lens, theme and width matrix. PM suggests: accept. Correction: draw them, or map each unchanged state explicitly to its D5 frame and say why nothing new is needed.

**D-47 · Invented operational values are unlabelled.** For example: the 10.1 / 10.2 MB and 48 / 51 KB in the Publish table, the balance and caps line, the database state, the privacy stamps, and the gate-none frame. PM suggests: accept. Correction: put an ILLUSTRATIVE label on each invented field where it is drawn, not only in a global banner; keep the measured values' sources.

**D-50 · The countdown cannot promise "announce once".** Five text replacements inside a polite live region do not guarantee one announcement. PM suggests: accept. Correction: specify a mechanism that does, then keep the visible countdown as visual-only text. For example, announce once when the countdown starts and once if it is cancelled, with the per-second number out of the live region. Acceptance: the markup in the spec makes one announcement per countdown by construction.

**D-51 · Watch and Back links drop the other parameters.** PM re-checked: the canvas's links are literal `?tab=moments&watch=<id>` and `?tab=moments`. `canonicalSearch` itself keeps unknown keys (Codex confirmed), so this is the links' fault, not the codec's. PM suggests: accept. Correction: define query merging for entering a watch page, Up next and Earlier, Back, and leaving the tab. Every valid existing key is kept (`only`, `date`, `lens`, `view`, unknown keys); `watch` is set or cleared; Back and Forward behave as history. Draw or state each case.

**D-52 · Accessible names and keyboard order disagree with §8.** Codex measured:
- every Save button is named "Save reference" without the title;
- the theme button comes first in tab order, and the three lens radios are three stops;
- Cancel comes before Replay and Copy link;
- the switch's name includes On or Off;
- Up next link names include the duration and date.

PM re-checked the source: the shipped `LensSwitcher.tsx` is a radiogroup with a roving tabindex, one stop. PM suggests: accept. Correction: match the source's one-stop lens group; name each Save button with its title; give the switch a stable name ("Autoplay next") with its state carried by `aria-checked`; name Up next links by title alone. Settle Cancel's position and write §8's order to match what the markup does.

**D-54 · The privacy page's fail-safe sentence overstates it.** "served by Vercel when Supabase does not answer" omits that the list must still load. PM suggests: accept, folded with A-09 Scoped. Correction: say the site's copy is used when a thumbnail fails to load while the gallery's list still loads, and that when the database is unavailable the gallery shows no cards.

**D-56 · The reduced-motion receipt keeps transitions the app suppresses.** PM re-checked: the shipped `LensSwitcher.tsx` has `motion-reduce:transition-none`, while the canvas's lens segments keep 180 ms under reduce. Codex also found 120 ms transitions inside the image-slot's shadow DOM that the motion receipt H4 does not scan. PM suggests: accept. Correction: apply the source's reduced-motion rule to the lens segments, scan shadow roots in H4, and label design-tool chrome as such.

Low:

**D-48 · The manifest leaves out the runtime the canvas executes.** Fixed by the manifest rule above.

**D-57 · The contrast receipt omits pairs in use.** It describes the light step pills as cream while they render white, and omits pairs the canvas uses: secondary on surface-alt and on media; muted on bg; Broadcast's selected ink on floodlight; white on pitch; white on accent-strong; and the STUDIO lettering in pitch on media, at 3.98 light and 3.57 dark, which passes only as large text. PM suggests: accept. Correction: make the receipt list every pair actually rendered, in the colours actually rendered, with the large-text threshold stated where it applies.

Also from Codex, as proposed improvements rather than findings; take them if they help:
- Name how the Subject filter treats a video with both cats.
- Say that a file uploaded to a public bucket is readable by its address even before the record is written, and what Cancel after upload leaves.
- Distinguish a committed fallback copy from one that is deployed and serving.
- Bind the watch and gallery reads to ST1's read-only public views, not to the Studio's tables.

YOUR RESPONSE

1. "Kickoff Moments - D7 response.md": one row per finding, D-46 to D-57, giving the disposition and where D7 changed (frame, file and line) or your evidence. Then one row per answer, Q13–Q22 and A-09 to A-11, giving where it is folded.
2. D7, with its manifest covering the executed runtime and its fingerprint stated in chat.
3. Receipts, re-run at D7:
   - copy, read from the DOM against the deck;
   - names and keyboard order, from the accessibility tree and actual Tab presses;
   - contrast, for every rendered pair;
   - motion, under both no-preference and reduce, shadow roots included;
   - geometry.

   A drawing is a static receipt; claim nothing behavioural.
4. Anything you cannot do without reversing one of Beni's rulings: stop, and raise it as a one-word question, recommendation first, rather than drawing it.

FACTS TO REFRESH (D6 was dated 12 Oct)

- Main was f523b52 when D6 was drawn. The Moments CSS has not changed since; the Next.js migration has not started.
- main's ruleset: `verify` is required, the admin role may always bypass it, and history is append-only.
- Codex's earlier evidence folder (~/kickoff-d2-review) no longer exists on Beni's Mac. Its reports are archived in the repo as docs/design-cycle-moments-*.md, but its app geometry measurements (P-22) are gone. The next check re-measures the app rather than citing P-22.
- Supabase's pause and Storage behaviour come from documentation only, read by Codex on 12 Oct. No live test has been run.
````
