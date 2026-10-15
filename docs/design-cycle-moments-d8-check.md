# Moments D8 — Codex's delta check, both runs (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by Codex (GPT-6.1 Sol High) on Tue 13 Oct 2026. Run 2, first below, is the check. Verdict: ready after named fixes. Closed on the design: D-48, D-51, D-57 and D-58. Closed against #187 at `6609df9`: D-60, D-61, D-62 and D-63 (D-63's withdrawal rollback re-proved). Open: D-47 and D-59. New: D-64. Run 1, kept after it, stopped at preflight because the D7 report and its evidence had been deleted. Its evidence (probe scripts, captures, JSON) stays local at `~/kickoff-d6-review/`; nothing from it is committed.

---

# Moments D8 — independent delta check, run 2

Seat: Codex, requested GPT-6.1 Sol High, independent check.
Date: 2026-10-13 ET; TZ=America/New_York date run before writing.
Predecessor: d7-synthesis.md is a **rebuild from logged literal writes**, not the original. Restoration note read; 47,976 bytes / 261 lines and SHA-256 c519479f2b71dd2dd3dd84c30d9a7f6c31021b4590458774adecc85c054aa38e reproduced. Lost P-22–P-38/probes are unavailable; no lost receipt is cited as current evidence.
D8 fingerprint: 305e99072a6c9307ce3be080b98e777db7d81b668a35ce2013bbf981b41c1784.
Whole-folder manifest hash: d91c28be1029bccc3794cbc4f49e6aa3a5a9e46d711aeda918e722095ab855f4; byte-identical to PM manifest.
Review worktree SHA: d3190a3effbdefd17dae42d284a5c39f0da3c8d8, detached and clean.
PR #187 live head at setup: 9d6a1896a47e3e8db4836ac2a1e7ab19e502f52d (OPEN, draft=True); contract target remains 6609df96d7e5b6ea19a595ef067a90b1bed662e2.
Chrome: Chrome/155.0.8059.40; visible dedicated window/profile, CDP 9227, viewport 1400 × 1000, DPR 1, fonts loaded.

Review only. No design or tracked source changes, GitHub writes, provider/Google API calls, package installs or spend. An unintended ignored Vitest dependency-cache write is disclosed in the P-57 execution-deviation receipt. Historical reports remain untouched. All four blocks completed. Evidence begins P-40 after the first run’s P-39. Final preservation and cleanup are recorded under P-57.

## Block 1 — pin and delta map (complete)

**P-40** independently pins the restored report, current main, live PR and preservation. All 18 D8 manifest entries and all 14 D7 entries pass. Fingerprint and 115-file whole-folder hash reproduce exactly; PM whole-folder diff is empty. Every D7 content file is byte-identical in D8; only `.thumbnail` and `github.md` differ. Exactly seven D8 files are new; uploads are unchanged. No export zip is present in D7 at this run. The predecessor report is accepted as the human-authorized rebuild after hash/size/line verification and reading its restoration note; its nine-write recovery was not independently replayed. Lost receipts remain unavailable.

Main is d3190a3. `git diff f523b52 HEAD` lists generated src/data and docs only; src/lib, src/index.css and src/App.tsx have zero changes. Data snapshot drift is not a design finding. Original checkout's two existing untracked skill directories were recorded before fetch and not touched. Review worktree is detached and clean.

**P-41** stores five complete unified diffs plus a semantic copy-object comparison. Delta map:

- Canvas head/runtime paths, removal of image-slot and its branch, `2-slot`→`2-loaded`, favicon declaration, font/manifest input documentation → D-48. d8/support.js is byte-identical to d7/support.js; no new runtime behavior.
- Adjacent tags and aria-hidden additions at shell/card/watch/queue/Studio fields; Billed header/note and Unpublish time/path/id tags → D-47, with D-52 name preservation to recheck.
- Poster default, real codecs, Brooklyn today, load/action separation, sample-base links and 24-row URL table → D-51, preserving Q20 Query.
- Contrast ancestor-opacity computation, receipt classification/output, corrected STUDIO table and chrome/disabled descriptions → D-57.
- Bound disabled Undo, aria-disabled/tabindex, 20-stop list and H3 counter → D-58.
- Record object-path fields, stored-path examples/provenance/Publish copy → Q23 Stored / D-59.
- Nested public-id fallback paths and explicit watch/public-view binding → Q24 Nested and Q25 Public / D-60.
- Existing PR-open/check/failed/merged/deploy/serving drawings and retry contract retained → D-61 (the response's D-61 label needs block-3 assessment).
- K0 labels, source row, Publish thumbnail cell and mixed-ratio explanatory note → Q26 Keyframe / D-62; dimensions and layout rules unchanged.
- Withdraw-first transaction semantics, optional separate delete/retry, Unpublish partial copy and withdrawn jobs note → Q27 Withdraw / D-63.
- One new `6-390-nowplaying` frame/status function and success-status selection → optional PM-7.
- Revision headings, handoff/changelog/references, supporting receipts, comment-only removals of “D7” and contrast-table annotation cleanup support those deltas. `geo()` differs only in its Q22 comment; TOKENS, SHORTCUTS, actual contrast token pairs and other JOBS rows are unchanged. Privacy COPY is byte-for-byte semantically unchanged.

No additional product capability or reversal of pre-13-Oct rulings was found in the source delta. The eight closed findings have no incompatible source change; actual regression checks remain block 4. D-58's D8 changelog mistakenly calls it M; this report retains D7's Low severity. This is a bookkeeping note, not a new design finding.

**P-42** establishes a successful full render: 119 frames, all within their drawn widths, zero image-slot elements/shadow roots/runtime errors; full DOM and fresh-profile request log retained. Block 2 will judge acceptance rather than promote this initial inventory into closures.

Blocks completed: 1/4.

## Block 2 — five fixes against D7 acceptance (complete)

Own probes precede the PM comparison below. Fresh scripts are preserved in probes; no lost P-09/P-28 receipt was reopened.

### D-47 — Medium — open, repeated watch-state titles still need local scoping

**P-44** inventories every frame’s local tags and scopes. All 152 card title/date/note groups, all watch h1/date/note groups, all 84 Up next/Earlier rows, the Billed column header (explicitly separate from measured $0.225), and every Unpublish step time/path/id now have adjacent or unmistakably row/column-scoped tags. All frame .ill tags are aria-hidden. Seven isolated screenshots **P-45** were inspected: gallery, mixed dark phone, jobs, delete failure, both STUDIO covers and nowplaying; fields remain readable within their frames. These named original missing fields are fixed.

But the literal acceptance was **every invented value where it is drawn**. `6-390-nowplaying` adds an invented title inside the visible status sentence `Now playing “Frankenstein at the far post” …` without a local tag. The later h1’s `ILLUSTRATIVE title` scopes that heading, not the separated status above the action row. P-44 live-region inventory, P-45-nowplaying.png, canvas:191 / d8/data.js:watch.statusAutoplayed are the reproduction. Reader impact: the builder’s new receipt again presents an unmarked illustrative identity. Required outcome: make this repeated invented identity locally and unmistakably illustrative while preserving the status/name contract. Acceptance/overturn: render the filtered nowplaying frame, enumerate its visible title occurrences and their locally scoped tags; confirm tags are hidden from AX/live utterances. No new Beni decision is required. No production label is requested.

D-52 remains intact: **P-44** queries Chrome AX subtrees of all 119 frames, yielding 1,437 exposed controls, zero unnamed and zero control names containing ILLUSTRATIVE; 152 contextual Save buttons and 28 named Autoplay next switches. Real Tab sequences are 20 / 15 / 15 / 16 / 6 for gallery / mixed / ready / countdown / gate-recorded Publish. Visual text from queue links in the Tab receipt includes tags; their actual AX names use aria-labelledby and remain titles alone.

### D-48 — Low — closed

**P-42/P-47**: fresh-profile full-page log has 18 requests (17 unique URLs, canvas requested twice by the runtime), all HTTP 200: canvas, support/data, six stylesheets, all six fonts, and only the two pinned unpkg React/ReactDOM URLs off-host. Every loopback path is manifested. No sidecar, favicon, image-slot script or DS bundle request; DOM contains zero image-slot and zero shadow roots. The icon is data:,.

The byte-identical generic support.js still contains a pinned Babel 7.29.0 URL and can request it for a `kind === "jsx"` external import (support.js:1176–1213). The reviewed canvas has no x-import declaration and uses native dynamic import for d8/data.js; that JSX branch is not reached by this pinned artifact. Babel was not requested in the full run. Thus the actual requested-input acceptance closes; an assertion that support.js lacks a Babel capability would be false. No altered canvas/JSX input was tested or needed.

### D-51 — Medium — closed

**P-43** imports the actual src/lib/urlCodecs.ts, lens.ts, competitions.ts and time.ts at worktree d3190a3 through an existing tsx loader (no install). All 23 computed urlCases rows reproduce; row 23 / Back × 3 is explicitly hand-written and is not history proof. Row 18 deliberately skips canonicalSearch: a nondefault pin became today without reloading. Current App.tsx:56–65 has the once-per-load useRef guard even though the effect depends on today; applying the load step again would contradict the source.

112 explicit cases cover Ledger/Poster/Broadcast/junk lens × empty/full/partial/junk/prototype/duplicate only × current/prior/impossible/malformed date, plus unknown keys and watch actions. 20,000 deterministic random queries cover duplicates, owned/junk keys, watch, raw and normalized action inputs, enterWatch, mergeWatch, leaveWatch and leaveTab. Zero mismatches. Brooklyn midnight and winter-midnight boundary dates also equal the real todayIso. Actual Back/Forward/popstate/history and a running midnight rollover remain implementation tests; the codec contract is verified.

### D-57 — Low — closed within the stated frame receipt scope

**P-46** independently inventories actual visible text ranges, backgrounds, alpha, ancestor opacity, theme, size/weight and disabled state; it does not call D8’s contrast helpers. Across drawn frames the pair union is exactly 56: 42 product, 3 disabled, 11 canvas chrome. Product minimum 4.8216; zero below 4.5 normal / 3 large. No text shadows/background-image uncertainty. STUDIO is computed from --text against the SVG rect's actual --media fill: 12.53798 light and 16.00283 dark at opacity 1, reproducing 12.54 / 16.00.

Disabled opacity is 0.55. Continuous-RGB arithmetic gives Undo 3.8586 light / 4.9360 dark and Publish 3.6771; independent 8-bit foreground/background rounding reproduces the receipt’s 3.88 / 4.92 / 3.69 (P-46-rounded-opacity.json). This minor quantization difference is accounted for rather than mistaken for a semantic mismatch. Actual :disabled semantics substantiate the inactive-control exemption, including Undo; there are no aria-disabled-only exemptions. Printed ratios and classifications agree.

Chrome labels are genuinely review annotations: ILLUSTRATIVE tags, PROSPECTIVE/stamp slot, thumbnail/picture placeholders, measured-data annotations and the explicitly drawn native-controls band. They do not conceal failing product copy. Native media/control contrast remains an implementation probe because no actual video is mounted. Outside the 119 frame roots, separate atlas chrome has two sub-4.5 normal pairs (4.27 amber annotations and 3.98 green spec/response links). H1 expressly measures frame text; its “11 chrome pairs all meet” is correct for that scope, not a claim about the whole wrapper. The review records the wrapper limitation without converting it into a product defect.

The independent final-DOM scan includes receipt-generated table text that did not exist during D8’s first measurement; it counts 7,974 frame text nodes, versus H1’s live first-scan 6,822 and the builder response’s 6,310. Pair union and relevant outcomes reproduce; these self-report node totals are not acceptance evidence or a product defect (PM-16 assessed fully in block 4).

### D-58 — Low — closed

**P-44** finds 38 drawn Undo buttons, all disabled=true / :disabled / aria-disabled=true / tabindex=-1. The three exposed Undo AX nodes (others are in collapsed details) are disabled; all disabled nodes present in the DOM are unavailable to Tab. Five actual Tab traversals never reach Undo; gallery has 20 stops, exactly H3/spec, while Cancel remains after Theater and before Replay/Copy. H1a's exemption/opacity agrees with H3's disabled/order claim.

### Appendix PM after own probes

- **PM-9:** confirmed and expanded: full page requests all six fonts, only React/ReactDOM off-host, no Babel/sidecar/favicon. Runtime Babel capability is explicitly retained but unreachable from this canvas.
- **PM-10:** independently reproduced 23 computed rows and 20,000 random-query zero mismatch at today's worktree head; deliberate mid-session skip matches App.tsx. The handwritten history row is not runtime proof.
- **PM-11:** 12.54 / 16.00 reproduced; disabled/chrome classes independently covered as above.

Blocks completed: 2/4. Remaining: ST1 contract and final regression/verdict/test list.

## Block 3 — one contract with ST1 at 6609df9 (complete)

PM-12 was read before assessing D-61: its warning correctly distinguishes the builder response's guessed D-61 label from the actual finding. Own source/stub probes below precede the remaining PM items.

**P-48** preserves exact git-show reads at `6609df96d7e5b6ea19a595ef067a90b1bed662e2`: README, Storage port/stub, engine, tests and migration. `origin/cursor/studio-st1` now resolves to 9d6a189, so reading that moving alias as if it were 6609df9 would be wrong. All primary comparison reads use the immutable commit. **P-49** records the byte-pinned 49-file Studio snapshot outside the repo/design, the three focused upstream contract tests (3 passed, 0 failed, 20 unrelated tests skipped), and eight fresh independent offline cases. Existing dependencies were reused via a node_modules symlink; no install. That symlink also allowed the unintended Vitest cache write disclosed under P-57. Global fetch throws; fal/Storage stubs and in-memory PGlite only. Synthetic gate/checklist answers are isolated fixtures, not human rulings or real records. This is contract evidence, not #187's correctness review.

| ID | D8 words / locations | ST1 words / source and fresh probe | One contract / outcome |
|---|---|---|---|
| D-59 Stored | Spec §3/§9, studio.where[0], studio.confirm, watch.prov: “the site takes every video and thumbnail address from the record and never builds or guesses one”; examples show `<public id>/video-<sha8>` / `thumbnail-<sha8>`. | README: “The site reads each file's bucket and object path from the record. It does not build a path.” Storage stub:22–26 appends .mp4 / .jpg; engine:825–853 persists port results and MIME; fresh P-49 view contains the actual stored addresses. | **Open, residual documentation shape drift.** The approved reader/write/delete semantics agree; D8's claimed ST1 shape and examples omit the extensions. Carry a one-line plan erratum `.mp4` / `.jpg`; keep ST1 keys. No reader behavior depends on reconstructing the example stems. |
| D-60 Nested and Public | Spec §3/§9, fallbackRepoPath/fallbackPath, studio.where[1–2], 11-* step 3: `public/moments/thumbnails/<public id>.jpg`; public id is watch id; no asset UUID in public address. | port fallbackDestination, README, migration catalog aliases; P-49 executes destination for all outcomes and reads a view with id=fixture-public and no job/asset UUID columns. | **Closed.** Nested repo/served path and public route identifier agree. No real fallback file or Next route was deployed. |
| D-61 PR phases / settled questions | Q19 PR and Q21 No recorded decided 12 Oct in spec §0/§3/§9. 10-pr-pending: PR open + verify running; 10-pr-failed: failed checks; 10-deploy-pending: merged, committed, not serving; 10-published: serving; 11-partial-pr: withdrawn, removal checks failed. | README explicitly dates Q19/Q21 decisions. port:3–13 has four outcomes and maps pr-opened/checks-running→pending, checks-failed→failed, merged→merged. Engine finishFallback/runRemoval persist statuses. P-49 executes all four delivery/removal stub outcomes; focused status test passes. README explicitly says a merged copy is not yet deployed. | **Closed.** The combined D8 open-and-running drawing spans two build outcomes that share pending; it does not conflate failed/merged. Deploying/serving is the explicit later-slice boundary, not a fifth ST1 outcome. D8 response's “covered by D-60” is a paperwork error, not the acceptance result. |
| D-62 Keyframe | Spec §3/§6, gallery.keyframe, studio.thumbCell, provenance: “the keyframe the clip starts from (K0)” (punctuation varies); box follows K0 frame matching clip. | README says the thumbnail is the keyframe the clip starts from (K0); engine:796–821 copies K0 SHA/MIME/bytes/dimensions/localPath rather than extracting output media. P-49 records thumbnail upload with the fixture K0 digest/MIME. | **Closed.** Q26 Keyframe is applied; the earlier Frame recommendation is not revived. Real byte/frame/ratio/media verification remains a build test. |
| D-63 Withdraw | Spec §3/§9, studio.unpublish/steps/delete-failed, 11-* and jobs: one withdrawal write clears publication, sets unpublished time and withdrawn state; separate optional delete with retry; removal PR follows even on delete failure. | README, engine:899–957; transaction:910–915 precedes deleteRemaining and unconditional runRemoval:920–923. P-49 independently tests video/thumbnail/both delete failures, optional preservation, actual transaction failure at the event insert, retry-delete/idempotency and removal failure/retry. Both catalog views are empty before every remove/removal call after a successful withdrawal. | **Closed.** The old engine703–725 counterexample no longer reproduces at 6609df9. A failed withdrawal transaction leaves all row snapshots unchanged, both views listing, and Storage untouched. A failed delete leaves withdrawn/no views; removal still runs. |

The exact D7 counterexample was rerun as fresh behavior, not accepted from lost P-36. The upstream withdrawal test at 6609df9 checks a pre-transaction breakWithdrawWrite flag; that alone would not prove rollback. The independent P-49 trigger rejects the transaction's last event insert, and proves the actual rollback without that flag. No live database or media was used.

### Live Pass 2b contract-only delta — P-50

Live #187 remains OPEN and draft at `9d6a1896a47e3e8db4836ac2a1e7ab19e502f52d` during block 3. Exact later diffs are retained. Storage port/stub are unchanged: extensions/MIME, fallback outcomes and public-id destination are identical. K0 selection/copy and withdrawal-before-delete/removal order are unchanged. The fallback retry now loads the thumbnail asset's actual digest instead of the literal 'retry' (touches the D-59/61 retry payload but preserves the approved address/outcome contract). The withdrawal test now uses a late failing trigger and the pre-transaction failure flag is removed (touches D-63 proof, strengthens it without changing order). Other later changes were not adjudicated. No claim that Pass 2b is merge-ready is made.

### Appendix PM after own comparison

- **PM-12:** confirmed in substance: README decisions plus port/stub/engine outcomes close actual D-61 together with D8. The response's mislabel needs a plan/editorial correction, not a reopened Q19/Q21.
- **PM-13:** extensions confirmed. D8's example records construct illustrative stems, and storedPath prefixes bucket to the supplied object; neither is a production path-building instruction. All normative reader passages explicitly forbid construction. Thus the drift is limited to stated shape/examples. Recommend PM's one-line Next.js-plan erratum rather than a design re-export; D-59 remains open until that correction is incorporated in the handoff.
- **PM-14:** the fra-0005 illustrative paths reuse fra-0004's video/thumbnail hashes. Distinct public-id prefixes keep keys distinct, and two records may intentionally share content; no uniqueness contract says otherwise. PR #181 is indeed a real merged sync PR (read live; P-51). The canvas #181 is locally marked ILLUSTRATIVE and is not an actual receipt/link proving this Studio operation. Neither misleads a builder under the explicit illustrative-fixture rule; do not copy these examples as provenance or live identifiers. No finding.
- **PM-15:** confirmed missing cleanup path; recorded as D-64 below. A retrying Publish can reuse uploaded files, but a never-published clip cannot use the documented Unpublish/Delete path. This needs a truthful plan contract, not a speculative provider action.

### D-64 — Medium — inherited pre-record cleanup promise has no reachable command

Target: D8 studio.confirm / spec §3 and 10-* Confirm, inherited verbatim in substance from D7, versus ST1 engine:899–905 /935–938. Expected: the promised cleanup of uploaded-but-unlisted files is reachable, or is explicitly deferred rather than attributed to Unpublish. Observed: the confirmation says post-upload Cancel leaves files until the next Publish reuses them “or Unpublish and delete removes them.” But unpublish requires both a published job and a videos row; retryDelete requires a withdrawn job and that row. Neither D8 nor ST1 defines an orphan-file cleanup path.

**Fresh reproduction P-49:** isolated record-write-failure fixture uploads two objects and publishes no row; unpublish(deleteFiles=true) returns not-published, retryDelete returns not-withdrawn, both objects remain, both catalog views empty. This models the pre-record storage state; ST1 has no implemented upload-Cancel transition to exercise. The source restrictions prove the missing route independently of that scenario.

Impact: a future builder/operator could believe unused public files have a documented deletion action when they do not. This is an inherited handoff gap discovered now, not a new D8 product capability or a reopened D-46 drawing-coverage failure. Required outcome: correct the plan/Confirm promise and explicitly define or defer cleanup for uploaded files that never acquired a published record, using stored keys and without forcing publication just to delete. Acceptance/overturn: a contract/stub probe reaches the documented cleanup from upload-cancel and record-write failure with no catalog row, or the copy accurately names retained files and the explicit cleanup deferral; both views stay empty and no provider generation runs. No edit, cleanup action, or answer for Beni was performed.

Blocks completed: 3/4. Remaining: regression probes, final outcomes/verdict, updated implementation tests and teardown.

## Block 4 — regression, verdict and updated implementation tests (complete)

### Own regression probes

**P-44 / P-52** substantiate D-52 names and real focus order as detailed in block 2. All current four privacy frames are PROSPECTIVE and carry the audit stamp slot; both terms sentences and four storage keys remain. The theater frame has exactly one shell Privacy & terms link; no dialog/overlay or page shortcut replacement is introduced. On/default, named Off examples, remembered choice, hidden-tab pause, native-shortcut help, Query watch route, PR/verify/auto-merge sequence, no relisting, record-ratio boxes and readable-list fallback remain the settled answers. 18 list-unavailable frames have zero cards. Both NoResults frames retain “No video is active” and Clear filters. Muted, aborted, record-write failure, delete failure and removal-PR failure drawings remain; jobs table has 17 rows (15 states plus two Completed substates). Compose/Review and copy-failed remain explicit inherited-state mappings rather than new runtime implementations.

**P-53** uses actual CDP media emulation, no CSS injection: 119 frames; 264 nonzero transitions under no-preference, all lens segments; zero under reduce. Named animations zero in both modes. Shadow-root inventory zero in both. This independently closes the regression scope of D-56 after the image-slot removal. The runtime's transient CSSOM self-measurement restores its media text; the independent actual media setting provides the evidence.

**P-54** sets actual viewport 360, 375, 390 and 1000 × 1000, DPR 1, fonts loaded. All 119 frame roots have scrollWidth no greater than their drawn widths at every viewport; zero frame overflow. The atlas wrapper intentionally has document scrollWidth 1120 at these smaller outer viewports; that fixed artboard presentation is not a responsive application. The report does not claim document scrollWidth=innerWidth or an app implementation pass.

Independent geometry equations derive from current src/index.css: gallery min(viewport−40,1120), shell min(viewport,780)−40, player 200px minimum, sidebar300/gap28 from 888px; D8's proposed card grid280/gap16, single column≤760 and 1px card borders. No use of D8 geo() or its printed expected values. Across 24 G rigs at each of four actual outer viewports (96 comparisons), maximum dimensional delta is 0.005208px. All 18 mixed rows have equal columns, align-items:start, 768/480 and 768/432 thumbnail boxes; representative 1000px inner boxes are 307.328×192.078 and 307.336×172.875. This is measured static geometry plus source-derived app arithmetic, not a newly built app/native-media measurement.

**P-55** compares copy against the actual final DOM and tag-free cloned text (no live DOM alteration). 195/196 scalar COPY leaves are present; the remaining Copy failed sentence is deliberately mapped to the existing copy-status slot in spec §3, as on D7. Every instantiated dynamic countdown/refusal/announcement/K0 thumbnail/nowplaying variant matches the deck. Fenway warm-up's watch meta/provenance is not instantiated by the chosen static watch-state examples; those definitions do not constitute a claimed rendered receipt. Spec copy deck and DOM agree on the rendered states. No silent wording regression was found; the known D-59/D-64 contract text issues are recorded separately.

**P-56** extends D-47’s literal title-occurrence acceptance. Besides the new Now playing title, nine inherited visible watch repetitions remain locally untagged: four error-panel “Next opens” titles, three visible countdown/returned titles, and two autoplay-refusal status titles. Their heading/queue tags elsewhere do not locally scope those separate values. There are 10 such watch-state occurrences total, all the same remaining D-47 category. The title-occurrence script intentionally also inventories receipt tables and Studio cells; its naïve nearest-element scope yields tool-table/adjacent-cell false positives. Those are not findings: URL/H1/H3 are labelled test/receipt material, and the Studio title-cell tags were inspected directly. Required D-47 correction covers these 10 watch-state repeats and preserves aria-hidden tags/clean names. This is continuation of the original every-drawn-value acceptance, not a new ID.

### Now playing / D-50 and PM-7

Source/spec §0/§1/§3 and P-52/P-55 agree: autoplayed is the one new state using watch.statusAutoplayed; ordinary playing retains Sound on. The same existing role=status paragraph renders the new sentence. `6-390-nowplaying` has one status region and no countdown region. Countdown/returned have the existing playback status plus one visually hidden atomic countdown status, with the visible number outside it and aria-hidden. Cancel has one hidden cancellation statement and a hidden-to-AT visual duplicate. No new live region or per-second live write was introduced by D8.

Thus the **design construction** still satisfies D-50 and optional PM-7: a single success-status replacement only after automatic advance, with identity, not an extra announcement channel. Actual event-trigger timing, one-start/one-Cancel utterance count, no duplicate success utterance, and focus stability cannot be measured on this static canvas; zero actual video elements are mounted. The returned3s drawing retains the prior five-second announcement text as the existing region. The implementation must keep that existing region when resuming, not announce a fresh five seconds. Screen-reader/autoplay/timer proof remains explicitly **Not verified**.

### Appendix PM-16 after independent probes

Confirmed: response totals and geo() expected values are canvas self-reports, not primary evidence. Full Chrome renders 119 frames; independent pair union reproduces 56 frame pairs and zero exposed unnamed controls. Text-node counts differ with receipt population/sampling (response 6,310; H1 full first scan 6,822; independent final visible frame ranges 7,974), so no acceptance relies on that count. Main has only src/data snapshot and docs drift, with no lib/CSS/App change; no design defect follows from the new fixture snapshot. The explicit independent CSS arithmetic and P-54 actual rectangles resolve geometry without a lost app P-22 or a self-referential expected column.

### Outcome table

Closure means design/declared-contract acceptance only, never playback/provider/deployment acceptance.

| ID | Severity | Outcome | Evidence / remaining requirement |
|---|---|---|---|
| D-47 | Medium | **Open** | Named missing fields are tagged; 10 repeated watch titles in status/countdown/error/refusal text still need local illustrative scoping (P-44/45/56). |
| D-48 | Low | **Closed** | Full requested-input log is manifested plus pinned React; no sidecar/favicon/slots; dormant Babel capability explicitly bounded (P-42/47). |
| D-51 | Medium | **Closed** | Actual worktree codecs, 23 rows/112 explicit/20,000 random queries, zero mismatch; midnight pin preserved (P-43). |
| D-57 | Low | **Closed** | 42 product pairs pass; opacity/disabled/chrome classification and quantized figures reproduce; STUDIO12.54/16.00 (P-46). |
| D-58 | Low | **Closed** | 38 DOM Undo buttons disabled, exposed AX disabled, no real Tab stop; H1/H3 agree (P-44/46). |
| D-59 | Medium, residual now documentation only | **Open** | Stored contract agrees; D8 stated shape/examples need .mp4/.jpg plan erratum to match 6609df9 (P-48/49). |
| D-60 | Medium | **Closed** | Nested fallback keyed by public id; watch/view id mapping explicit (P-48/49). |
| D-61 | Medium | **Closed** | Q19/Q21 settled in both; four outcomes/pending-failed-merged align; deploying/serving later slice (P-44/48/49). |
| D-62 | Medium | **Closed** | Both specify K0, the keyframe the clip starts from; engine copies K0 attributes (P-48/49). |
| D-63 | High | **Closed** | Withdrawal transaction before optional deletion; removal always follows successful withdrawal; fresh failure/retry/rollback proofs (P-49). |
| D-64 | Medium | **Open, newly observed inherited gap** | Uploaded-without-record files cannot reach promised Unpublish/delete cleanup; correct/defer/define the handoff path (P-49). |
| D-46/49/50/52/53/54/55/56 | Prior severities retained | **Closed; no regression found** | Drawings, video-vs-thumbnail honesty, countdown construction, names/order, prospective privacy, scoped fallback, PR protocol and reduced motion remain intact (P-41/44/52–55). Runtime boundaries stay open. |

No D-65 or later finding. Eight prior closures retained; eight of ten requested delta IDs close, D-47 and D-59 remain open, and D-64 is new. No settled answer was reversed or supplied for Beni.

### Verdict

**Ready after named fixes.** Before D8 is treated as the final design source for the Next.js build plan: finish D-47's local illustrative scoping; incorporate D-59's extension erratum and D-61's bookkeeping correction; resolve D-64's inaccurate cleanup promise with a truthful defined/deferred plan contract. D-59 needs a small written erratum, not a re-export or key change. No new product choice in D8 requires a one-word question from this seat; Q23–Q27 remain Stored, Nested, Public, Keyframe, Withdraw. This is not build, live publication, PR merge or release approval.

### Updated D7 implementation-plan test list — D8 + ST1 at 6609df9

The 12 predecessor test groups (restored report lines 237–249) remain, updated below. These are future build requirements, not claims that this design check exercised them.

1. **Playback and single element/host.** Mount/count one real video across reader-first Play, route/watch changes, queue/order preservation, src swaps, pause/mute/replay/end/errors2/3/4/abort, theater/Escape/fullscreen/PiP and return/leave. Assert source/preload/network gating: thumbnail before Play, video file only after Play, poster unset under the declared image chain. Do not silently skip errors. Verify native-control reachability and focus return.
2. **Autoplay policy.** Chrome/Firefox/Safari/macOS/iOS after reader Play; refusal loads next but requires Play. No entry/re-entry autoplay. Default On, remembered Off, refused storage/private browsing and permission resets on leave/re-enter are separate assertions. Successful automatic play changes the one existing status to the title-bearing Now playing sentence; manual playing uses the normal sentence.
3. **Hidden tab/races.** Pause remaining countdown, stop automatic start while hidden; resume the remaining time on return or defer hidden ended's full countdown until return. Explicit pause/Cancel/route leave stop it. Test near-zero/hide-return races and stable queue position; never invent a second five-second start on resume.
4. **Assistive technology.** Actual screen-reader utterance count: one start, one Cancel, no per-second chatter, no repeated start when resuming at3s. Now playing occurs once only on successful automatic advance in the existing polite status, conveys next identity and keeps focus. Test real native controls and contextual Save, title-only links, switch name/state, one-stop lens groups and disabled Undo. Canvas illustrative tags must not become application labels or utterances.
5. **URL state.** Use actual shared codecs with Poster default, only full/empty/partial/junk/duplicates, invalid/current/prior dates, unknown keys, all lens/theme/tab combinations. Canonicalize once per load, preserve a date pin becoming today during the session. Test enter/move/leave/notfound, same-current Earlier no-op, Back/Forward/popstate, automatic moves as history entries, and public-id watch binding.
6. **Public read boundary/freshness.** Next server uses studio_reader with SELECT only on catalog views, never Studio tables or client DB calls. Check published/unpublished filtering, position order, immediate publication/withdrawal and invalidation/concurrent reads; unavailable list renders no cards and never resurrects memory. Public view id is public_id; no asset/job UUID escapes into public address/view. Live grants and cache proof are separate from the stub SQL.
7. **Storage/media/K0 thumbnail.** Consume exact bucket/object_path from the record, including ST1's .mp4/.jpg examples; never reconstruct keys from public/asset id or hashes. Upload MIME must be video/mp4/image/jpeg independently of extensions. Verify actual bytes/SHA/dimensions, K0 input source and first-frame recipe assumption, mixed16:10/16:9 contain behavior, Range/seek/headers/delivery, address exposure after upload, retry reuse and idempotency. Test Storage→nested site copy→cover only with readable list; joint read/storage outage yields no stale cards. **D-64:** explicitly test/correct the uploaded-without-record cleanup/deferred-retention path after Cancel or record failure without forcing publication.
8. **Fallback PR protocol.** Stub and later real adapter must distinguish pr-opened/checks-running→pending, checks-failed→failed, merged→merged. Merged means committed, not deployed/serving: later deploy-pending/failure/retry/observed-serving has its own proof. Thumbnail-only PRs at public/moments/thumbnails/public_id.jpg for add/remove; verify before main, proper token scope, never admin bypass, conflicts/concurrency/idempotency. Retry uses the actual thumbnail digest (Pass2b source fixes the placeholder). No invented timing guarantee; no atlas #181 as provenance.
9. **Withdrawal failure matrix.** Encode Q27's sequence: one atomic record/job/generation withdrawal transaction, then optional separate deletion, then removal PR regardless of delete outcome. Reject the last transaction statement to prove full rollback/views still listed/Storage untouched. Each/both deletes can fail; clip remains withdrawn and failed objects readable; retries touch only remaining objects and never relist. Test optional retention, failed removal/retry, deploy delay and cache limits. P-49 proves this on 6609df9 stubs, not the production database/Storage/PR adapter.
10. **Studio state machine.** Cover 15 states plus Completed substates, gates/checklist/Keep, budget limits from authorized source, uploads/record failures, fallback pending/failed/merged, once-only publication/no relisting, parent regeneration and cleanup scope. Live ledger/billing/provider results/expiration require actual receipts; illustrated costs/times/state lines are not operational facts. #187's broader correctness stays with its review seat.
11. **Privacy migration audit.** Actual code/dependency/cookie/font/network/storage and host log/retention audit before filling date/version stamp or asserting prospective copy as fact. Four keys, refusal/clearing semantics and fallback prerequisite must match implementation. Article50 applicability/disclosure follows the authorized human process; synthetic test fixtures and this review answer nothing for Beni.
12. **Visual acceptance.** Future app lens×theme×tab at360/375/390/~1000, mixed/loading/fallback/unavailable states, zoom/focus/hover, current-app CSS geometry, full motion/pseudo/shadow inventory, rendered text/background/opacity and real media/native-control contrast. Independently reproduce the receipt rather than trust frame counts or geo() expected values. Close remaining local illustrative-title scoping; keep disabled semantics, H1/H3 agreement and corrected STUDIO ratios. Never import _ds or uploads into the repo.

### Evidence index and reproduction

All paths are under /Users/benicheni/kickoff-d6-review; fresh runnable scripts are in probes. Prior lost evidence numbers are historical references only.

- **P-40** pins/provenance metadata, main/live PR and D7/D8 preservation: evidence/P-40-pins.json; d8-folder-manifest-run2.sha256. Manifests checked with shasum -c; whole-folder diff against PM empty.
- **P-41** complete canvas/spec/data/runtime/deck diffs and semantic COPY comparison. Runtime diff empty; semantic geo difference comment only. Git main code-drift check empty.
- **P-42** dedicated process/server/Chrome launch logs, full request log, full DOM and environment/version. `node probes/d8-network.mjs`.
- **P-43** real-codec harness output; `node --import /Users/benicheni/Documents/Claude/Projects/Kickoff/node_modules/tsx/dist/loader.mjs probes/d8-url-contract.mjs`.
- **P-44** all-frame label/control/live-region inventory, Chrome AX trees/summary and real Tab sequences; `node probes/d8-a11y-labels.mjs`.
- **P-45** seven isolated-frame screenshots, all viewed; viewport1400×1000/DPR1/fonts-ready. Produced by the P-44 script.
- **P-46** independent visible text contrast, background/opacity/classification and quantized-ratio arithmetic; `node probes/d8-contrast.mjs`; P-46-rounded-opacity.json.
- **P-47** request-to-manifest comparison and explicit dormant Babel branch analysis, runtime1176–1213; no external JSX import in canvas.
- **P-48** exact ST1 source reads at6609df9; evidence/P-48-ST1-source.json.
- **P-49** immutable source snapshot/hash index, focused upstream test JSON and independent eight-case contract output. From probes/ST1-6609/studio: existing vitest binary run test/engine.test.ts with -t 'publishes through the four steps|maps each site-copy outcome|withdraws before deleting files'. Fresh independent harness: `node --import /Users/benicheni/kickoff-st1-cursor/studio/node_modules/tsx/dist/loader.mjs probes/d8-studio-contract.mjs` from the review root (or its probes directory). No network/install.
- **P-50** live PR head and exact later contract-file diffs, read only; no other Pass2b issue assessed.
- **P-51** illustrative hash/PR example check and live PR181 identity; no external write.
- **P-52** full regression state/copy/live-slot inventory; `node probes/d8-regression.mjs`.
- **P-53** true no-preference/reduce CDP scan; produced by P-52 script, no temporary stylesheet injection.
- **P-54** actual four-viewport matrices/24-rig rectangles and independent current-CSS/D8-grid arithmetic; produced by P-52 script plus source-derived equations retained in P-54-independent-geometry.json.
- **P-55** scalar/dynamic copy and status-slot comparison; explicit unrendered-state limits retained.
- **P-56** visible title occurrences by local scope; `node probes/d8-title-occurrences.mjs`; watch-state counterexamples distinguished from receipt/table scope false positives.
- **P-57** final preservation/process/worktree/backup receipt, appended after teardown.

### Not verified and execution corrections

No actual video/image, provider play, Safari/iOS/Firefox, screen reader, production database/role/Storage, real PR delivery, Vercel deployment or host privacy audit was run. Static state drawings establish declarations and rendered construction, not event transitions or utterance counts. Browser artifact requests were only loopback/unpkg; zero OS/Chrome-updater background networking is not proven by CDP. No explicit provider/Google API operation was performed. No real accounts, credentials or private media were read.

The first attempt to execute snapshot setup used a working directory that had not yet been created and failed before any command ran. It was corrected by creating the source snapshot first, then running the focused test there. Initial copy matching missed the Billed tag because CSS uppercased its visible text and the clean clone removes .ill; matching its actual tag text resolves that omission. The title-occurrence probe's nearest-element heuristic also flags tool receipts and Studio table cells with adjacent scoped tags; only the independently inspected 10 watch repetitions support D-47. These probe corrections are retained, not treated as artifact defects.

Blocks completed: **4/4**. No block omitted. Teardown/backup verification follows.

## Final preservation, cleanup and execution deviation — P-57

All 18 D8 manifest entries pass again. The final whole-folder manifest is byte-identical to the initial/PM manifest, SHA-256 d91c28be1029bccc3794cbc4f49e6aa3a5a9e46d711aeda918e722095ab855f4. Restored D7 still hashes to c519479f2b71dd2dd3dd84c30d9a7f6c31021b4590458774adecc85c054aa38e. The stopped first-run report and all earlier reports were left untouched.

The review worktree was clean before the requested `git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree remove --force /Users/benicheni/kickoff-d8-check-codex`; removal succeeded, path is absent and no longer listed. Original checkout status equals the pre-fetch status: only the same two existing untracked skill directories, no tracked changes. Live #187 still OPEN/draft at 9d6a1896a47e3e8db4836ac2a1e7ab19e502f52d.

At final teardown, the recorded server/Chrome PIDs were already absent; this run does not infer who or what ended them. Both dedicated ports 8765 and 9227 reject connections, and the dedicated Chrome profile has zero processes. No unrelated process or existing worktree was terminated/removed. Independent PGlite clients were closed and that harness's own temporary media directories removed. Review scripts, source snapshots and evidence remain locally for reproduction.

**Execution deviation, not authorized by the read-only scope:** the focused upstream Vitest run wrote an ignored results cache through the dependency symlink to `/Users/benicheni/kickoff-st1-cursor/studio/node_modules/.vite/vitest/da39a3ee5e6b4b0d3255bfef95601890afd80709/results.json`. The cache mtime follows this run's focused engine-test end by about 1 ms and its engine duration exactly matches this run (7465.421208 ms), establishing attribution. P-57-dependency-cache-observation.json records the evidence. This should have been redirected into the isolated review directory; calling the dependency symlink “read-only” was inaccurate. The file contains pre-existing result entries plus this run's engine result; its prior bytes were not captured, so it was left untouched after discovery rather than deleting other-seat results. No tracked Studio/design/source file was edited. The independent custom P-49 harness and browser/codec evidence are separate from this cache. This deviation does not change the design findings, but it means the strict no-repository-file-write boundary was not perfectly met.

No commit/push/branch/PR/issue/review/comment/release/tag/settings/provider/Google API/account/key/spend/sync/audit-fix operation occurred. No dependency package was installed. _ds and uploads were never copied into a repository. No other seat was messaged or adjudicated. Fresh artifacts and the requested backup are local only.

The completed report is copied **unchanged** to `/Users/benicheni/kickoff-s55-run/backups/d8-delta-check-run2.md`; byte equality and final report SHA-256 are recorded separately in evidence/P-57-backup.json so the report does not need a self-referential hash. All work for this delta check is complete; stop.

# Moments D8 independent delta check — stopped at preflight

Seat: independent design check, Codex; requested GPT-6.1 Sol High.
Date: 2026-10-13 14:31:43 EDT. `TZ=America/New_York date` was run before writing this date.

- D8 manifest fingerprint: supplied `305e99072a6c9307ce3be080b98e777db7d81b668a35ce2013bbf981b41c1784`; **Not verified** in this run.
- Reviewer whole-folder manifest hash: **Not verified**; manifest not generated before stop.
- Review worktree SHA: **Not verified**; review worktree not created.
- PR #187 head SHA: supplied `6609df9`; **Not verified** in this run.
- Chrome version: **Not verified**; Chrome not launched.

This report records an unavailable review prerequisite, not a design defect. No D-64 finding is assigned.

## Preflight evidence — P-39

Before report creation, `cat /Users/benicheni/kickoff-d6-review/d7-synthesis.md` returned `No such file or directory`. Reads of `probes/` and `evidence/` failed identically. An explicit `ls -ld /Users/benicheni/kickoff-d6-review` confirmed the entire directory was absent. These checks occurred before this run created the report directory.

A bounded filename search of the D7 and D8 exports, `kickoff-s55-run`, existing `.codex/worktrees`, and the selected Kickoff repository found no `d7-synthesis.md`. The only synthesis-named match was the PM's `d7-codex-synthesis-prompt.md`; a prompt is not the missing report. No files under `~/s4b` or `~/kickoff-s4b` were accessed.

The requested repository-local `kickoff-design-review/SKILL.md` and `references/browser-evidence.md`, repository `AGENTS.md` and `CLAUDE.md`, and the D8 design brief were read. The brief explicitly delegates the acceptance tests to block 3 of the absent D7 report. Its one-line descriptions cannot substitute for those tests; the D7 report's block-7 implementation-plan list is also unavailable.

Reproduction and scope are recorded in [P-39-preflight-missing.json](evidence/P-39-preflight-missing.json).

## Block boundary: no review block completed

The user instructed: “If any other check differs, stop and report.” The required prior review inputs are missing, so the review stops at preflight. The report, browser probes, and predecessor evidence index must be located or restored before proceeding against the original acceptance tests.

1. **Pin and delta map:** not reached. Artifact manifests, whole-folder equality, D7 preservation, current main drift, and live PR head remain unverified.
2. **Five acceptance tests:** not reached. D-47, D-48, D-51, D-57 and D-58 are each **Not verified**.
3. **One Studio contract:** not reached. D-59, D-60, D-61, D-62 and D-63 are each **Not verified**; PM-12 through PM-15 were not adjudicated.
4. **Regression and verdict:** not reached. D-46, D-49, D-50, D-52, D-53, D-54, D-55 and D-56 remain **Not verified** in this run. Now playing, names, focus, motion, contrast, overflow and DOM copy remain unverified. No new design finding or Beni choice is established.

PM-9 through PM-16 remain supplied claims, not independently verified outcomes. No finding is closed or reopened by this run.

## Verdict and remaining handoff

**Blocked — review prerequisites unavailable.** This is not a conclusion that D8's design is defective. Restore or locate the actual D7 synthesis, its probes, and evidence before resuming block 1. The requested updated implementation-plan test list cannot be produced faithfully without D7's block 7; it has not been reconstructed from memory or the PM brief.

## Cleanup and authority

No review worktree, server, or Chrome instance was created or started; there is nothing from this run to remove or stop. Existing worktrees and browser sessions were left untouched. No fetch, dependency install, design/repository edit, branch change, GitHub write, provider request, Google API request, or spend occurred. Only this new report and P-39 preflight receipt were written outside the repository and design folders. Earlier reports were not modified.
