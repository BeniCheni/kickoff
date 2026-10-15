# Moments D7 — Codex's Pass 2.5 synthesis, rebuilt (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by Codex (GPT-6.1 Sol High) on Tue 13 Oct 2026 against D7 and PR #187 at `0831550`. Verdict: ready after named fixes; eight of D6's findings closed, D-47, D-48, D-51 and D-57 still open, D-58 new, and D-59 to D-63, where D7 and the Studio build disagreed, put to Beni as Q23–Q27. **This text is a rebuild, not the original file.** The local folder that held the report was deleted on 13 Oct. On Beni's word the PM seat rebuilt it by replaying, in order, the nine literal writes, appends and replacements recorded in Codex's own session log; no logged code was run. The rebuild is 47,976 bytes, the original's size, SHA-256 `c519479f…a38e`. A second PM seat compared it with its earlier reads of the original: byte-identical where those reads were whole (the D-59 to D-63 section and the test list), and identical up to the column limit elsewhere. Codex accepted it, after checking its hash, as the basis of the D8 check. Its evidence (P-22 to P-38) and probe scripts were lost with the folder; nothing from them is committed.

---

# Moments D7 — Pass 2.5 synthesis

Seat: Codex, GPT-6.1 Sol High; independent synthesis reviewer.
Date: 2026-10-13 ET (TZ=America/New_York date run before writing).
D7 fingerprint expected: ae87dd042c7629dbf88c63ae8dfebdc487e2c1033c92a3304b25589bae85cb2c.
Folder-manifest SHA-256: 584a0e176e16fc8c3570bc92b745eaba5ae1324cdd06731383708e77f599e901.
Worktree SHA: f523b52eb2a18cfb8599aa9858b6f6a037ef465c (detached, clean).
PR #187: OPEN, cursor/studio-st1, 08315507335445cb33a964cd43a04492c5783f22.
Chrome: Chrome/155.0.8059.40, CDP 9227, visible dedicated window, Node 24.15.0.

Review-only: no target edits, publication, provider or account operations. Historical D6 report remains untouched. Prior outcomes and builder/PM claims are unproven until rerun.

## Evidence index

All evidence is under `/Users/benicheni/kickoff-d6-review/evidence`; reproducible probes under the sibling `probes`. These are new D7 receipts; the deleted historical app P-22 is not cited.

- **P-22** — setup/current Git and PR pins, D6/D5/upload preservation; `P-22-pins.json`, `P-22-preservation.json`, `P-22-D5-preservation.json`, plus the requested folder manifest.
- **P-23** — D6→D7 canvas/spec/data/runtime unified diffs; five `P-23-*.diff` files.
- **P-24** — visible Chrome/CDP environment, complete DOM, initial requests and launch/server logs; `P-24-environment.json`, `P-24-dom.json`, `P-24-processes.json`, `P-24-http.log`, `P-24-chrome.log`.
- **P-25** — each named frame’s copy/labels/status/links and response source locations; `P-25-frame-audit.json`, `P-25-response-locations.json`.
- **P-26** — seven isolated-frame screenshots, viewport1400×1000,DPR1/fonts-ready before captures; `P-26-*.png`; all seven visually inspected.
- **P-27** — state/drawing, ready text, hidden countdown and privacy acceptance checks; `P-27-acceptance-audit.json`.
- **P-28** — actual main canonicalSearch versus D7 helpers:75 cases,30 mismatches plus review-date drift; `P-28-url-contract.json`, `probes/d7-url-contract.mjs`. All ten displayed output addresses canonicalize as shown; the expanded input set reveals the default/normalization defects. History actions are source/spec claims, not an implemented browser-history test.
- **P-29** —118 Chrome AX subtrees and five real Tab traversals; `P-29-AX.json`, `P-29-AX-summary.json`, `P-29-Tabs.json`; `d7-independent.mjs`.
- **P-30** — read-only current rulesets list and both detail responses; `P-30-rulesets.json`.
- **P-31** — independent CSS/grid arithmetic against24 G rigs and18 mixed rows; actual outer viewport360/375/390/1000 remeasurement; `P-31-geometry.json`, `P-31-viewport-matrix.json`.
- **P-32** — CDP no-preference/reduce computed-style inventory including shadow roots; `P-32-motion.json`.
- **P-33** — independent rendered text contrast, opacity/shadows/theme/size and Python STUDIO arithmetic; `P-33-full-contrast.json`, `P-33-pair-arithmetic.json`; initial narrower scan retained as `P-33-contrast.json`.
- **P-34** — actual disabled/tabindex/opacity state of Undo and Publish controls; `P-34-control-state.json`.
- **P-35** — answer-specific theater/switch/help/footer/removed-control DOM query; `P-35-rulings.json`.
- **P-36** — ST1 exact git-show reads and PR file listing; `P-36-ST1-source.json`, `P-36-PR-files.json`.
- **P-37** — dependency-free ST1 Storage stub path/output execution; `P-37-ST1-stub-contract.json`; no network/file media operations.
- **P-38** — final target/report preservation, worktree removal and process/listener cleanup; appended below after teardown.


## Outcomes

Severities are retained for D-46–D-57. Closure is the design acceptance scope; implementation tests remain open.

| ID | Severity | Outcome | Evidence / remaining acceptance |
|---|---|---|---|
| D-46 | Medium | closed (fixed) | P-25–27/31: required drawings, mappings and matrix. |
| D-47 | Medium | open | P-25–27: locally label every invented field, including editorial values, billing and step times. |
| D-48 | Low | open | P-24: scripts pinned; optional sidecar/favicon outside requested log boundary. Declare/pin or eliminate. |
| D-49 | High | closed (fixed) | P-25/27: ready claim scoped to video; thumbnail disclosed. |
| D-50 | Medium | closed (fixed) | P-27: hidden once-written region and visual-only number; actual utterances pending. |
| D-51 | Medium | open | P-28: wrong lens default, incomplete normalization, fixed-today date loss. |
| D-52 | Medium | closed (fixed) | P-29: contextual names/state and real sequential focus match specified targets; native player unmounted. |
| D-53 | High | closed (fixed) | P-25–27: every privacy frame prospective/stamp slot; migration audit pending. |
| D-54 | Medium | closed (fixed) | P-25/27: readable-list prerequisite/no cards on read failure. |
| D-55 | High | closed (fixed) | P-25/30: D7 PR/check/deploy protocol and bypass scope; execution pending. |
| D-56 | Medium | closed (fixed) | P-32:261 lens transitions→0 under reduce;4 tool transitions labelled. |
| D-57 | Low | open | P-33: correct STUDIO figures and opacity/shadow/disabled/chrome receipt classification. |
| D-58 | Low | open | P-29/34: intended disabled Undo is reachable; actual semantics/receipts must agree. |
| D-59 | Medium | unresolved to Beni | P-36/37: Storage path/key agreement between D7 and ST1. |
| D-60 | Medium | unresolved to Beni | P-36/37: fallback destination/key agreement. |
| D-61 | Medium | unresolved to Beni | P-36: PM must place the bridging change for settled PR phases/decision records; do not re-answer Q19/Q21. |
| D-62 | Medium | unresolved to Beni | P-36: input K0 versus output-video first-frame thumbnail contract. |
| D-63 | High | unresolved to Beni | P-36: withdrawal/delete order, optional deletion and fallback removal semantics. |

8 original findings closed;4 original findings open.6 new findings:1 open,5 unresolved. This is not “all12 fixed.”


## Block progress

All six blocks completed in order; entries below were appended at each boundary. Final cleanup receipt follows block6.

## Block 1 — pin and delta map (completed)

P-22: pins/preservation JSON and d7-folder-manifest.sha256. All 14 manifest checks pass; expected fingerprint and 108-file whole-folder hash reproduce; diff against PM manifest is empty. Reviewed D6's 28 content files are byte-identical; only github.md and .thumbnail differ, as stated. The 68 D1–D5 files (including their four review uploads, excluding export metadata and DS) equal the D5 export. Both D6 report uploads equal the original report. Main and PR head above were read live.

P-23: five unified diffs under evidence/P-23-*.diff. Support and image-slot runtimes have zero byte changes. Delta map: gallery NoResults/saved/refused/unavailable/mixed rows and jobs coverage → D-46/Q22; local labels → D-47; manifested runtime URL → D-48; ready text → D-49; hidden status/visual counter → D-50; URL helpers/links/cases → D-51/Q20; labels/tabindex/order → D-52; privacy prospective/slot and narrowed browser-storage tail → D-53 (privacy-copy scope); fallback prerequisite → D-54/A-09; PR steps/partials/no direct push → D-55/Q19/A-11; lens CSS/reduce receipt → D-56; actual rendered-pair receipt/STUDIO ink → D-57. Native/keyboard/help → Q13; theater and shell-foot obligation → Q14; kept terms → Q15; default On and stored choice → Q16/Q17; spoiler-light removal → Q18; no relisting → Q21; hidden-tab return → A-10. Two-cat matching, upload address/Cancel exposure, committed/deploy/serving, and view-only reads are the four adopted improvements. New frame filtering and receipt computation are reviewer tooling supporting the named findings. No additional product capability found.

Pivot remains generated-only, fictional cats, no likes/comments/counts; admin-only Studio, public gallery/watch; thumbnails before reader Play, browser controls, sound, single-host/single-element contract, Article 50 gate and global privacy foot. D5 remains the inherited base; no visitor generation or real-person replicas introduced. D6 brief and both specs read directly.

P-24: independent full render: 118 frames, 24 rigs; Chrome 155.0.8059.40, 1400×1000, DPR1, fonts loaded. The request log reveals optional unmanifested .image-slots.state.json and favicon requests; this is reserved for D-48's block 3 acceptance check, not silently treated as a passing network boundary. DS bundle is listed but not requested; six DS stylesheets actually load.

Appendix PM: no items tagged to block 1. Blocks completed: 1/6.

## Block 2 — response locations and answer records (completed)

P-25-frame-audit.json reads each of the 118 named frames, text, labels, statuses, countdown markup, links, switches and 17 Jobs rows independently of H3. P-25-response-locations.json indexes the response’s target families and finding/answer source lines. Both spec copies are identical. Findings/answers each have one response row; response is a locator, not proof.

Location checks: D-46 2c(2), 2b(18), 3(18), 4-390-muted/aborted, 10-partial-record, 11-partial-delete/pr, 12-jobs all present; D-47 .ill at shell55/163, Studio340/353/361–362/372–415, provenance221–223, privacy320; D-48 d7 paths6/18 and module import; D-49 statusReady data140 and ready/aborted frames; D-50 countdown196–199 and 6-countdown/cancelled/returned; D-51 data76–99 and 8-url; D-52 Save132, radios66/174, switch229, title-labelled queues235/242; D-53 prospective300/stamp320 in all four9-* frames; D-54 data203 and all9-*; D-55 data214–255,10-* and11-*; D-56 style25–31/H4; D-57 ink121/H1a+b. Presence passes, with acceptance reruns reserved for block3.

Answer records: Q13 Native help and8-shortcuts; Q14 theater5-1000 and spec0/6; Q15 terms on9-*; Q16 spec0/6 expressly records Codex Off versus Beni On and A-10 guard; Q17 fourth key kickoff-moments-autoplay-v1 is in all privacy frames; Q18 no spoiler control; Q19 PR and A-11 Preserve are in Publish/Unpublish/spec and remove the direct Commit action; lower-case committed remains deliberately as a delivery state. Q20 query helpers; Q21 withdrawn Jobs/11-*; Q22 16:9 second card in every2b; A-09 readable-list prerequisite plus no-card unavailable matrix; A-10 returned frame/status/help. Answer fidelity is checked next in block4; this is a presence check. No response row is accepted merely because it says Accept.

Appendix PM: no items tagged to block2. Blocks completed: 2/6.

## Block 3 — Pass 1 acceptance tests rerun (completed)

Evidence added: P-26 seven frame PNGs (mixed desktop/phone, countdown, privacy, PR failure, removal failure, Jobs); P-27-acceptance-audit.json; P-28-url-contract.json with executable source harness; P-29-AX.json/summary and P-29-Tabs.json; P-30-rulesets.json (list and both details); P-31-geometry.json/viewport-matrix.json; P-32-motion.json; P-33-full-contrast.json and independent Python pair arithmetic; P-34-control-state.json. All probes run against the pinned export. No H1/H3/H4 conclusion is substituted for an independent probe.

**D-46 Medium — closed (fixed).** The 2c NoResults drawings have the new sentences and Clear filters; all18 2b frames have saved/refused, fallback, last-resort and mixed16:10/16:9; all18 unavailable frames have zero cards. Muted/aborted, record-write failure, both Unpublish partial recoveries, all15 Jobs states and two Completed substates exist (17 rows). Unchanged Compose/Review/banners explicitly map to D5 frames10–12; copy-failed maps the status slot and supplies its replacement sentence. This closes drawing coverage, not runtime transitions.

**D-47 Medium — open.** Original operational examples improved: balance/database, kept sizes/KB, gate, stamps/PR numbers/results are tagged. But the acceptance requires a local, unmistakably scoped label for each invented value. Gallery title/date/note, watch title/date/note and Up next title/date have no adjacent ILLUSTRATIVE tag. For example1-1000-ledger-L has only one .ill, the sync stamp; its thumbnail label scopes the placeholder, not its card’s editorial fields. Jobs’ Updated header and footer do not locally distinguish invented per-job billing from the measured $0.225 price; Unpublish step pills say done13:52:04/06/09 without local tags (the separate result says ILLUSTRATIVE times). P-25/P-26/P-27; canvas126–129,210–223,235–242,392,413–415. Required outcome: locally scope all invented fields; preserve separate measured facts, including price versus billed charge. Acceptance: enumerate every drawn invented value, identify its adjacent/scoped tag, and independently inspect full/filtered frames without relying on the atlas’s global banner. Severity unchanged: invented operational/editorial data remain a handoff-honesty gap.

**D-48 Low — open under the requested network acceptance.** All executed scripts now use manifested paths; the original root support.js issue is fixed. However P-24 request log includes /.image-slots.state.json (404) and /favicon.ico (404) outside the manifest/fonts exceptions. d7/image-slot.js94/174 fetches the optional state file; its contents can affect the rendered slots if present. React/ReactDOM18.3.1 and six local font files are the declared exceptions; all other successful local runtime requests are manifested. _ds_bundle.js is manifested but unused, contrary to the response’s “seven linked files” description. Required outcome: eliminate or explicitly pin/declare the sidecar input, and account for the browser favicon request when claiming the strict log boundary. Acceptance: fresh-profile request log contains only declared inputs, with statuses and any absent optional input documented. Low remains appropriate: no bytes outside the advertised package actually executed in this run, and the whole-folder hash still pins this review.

**D-49 High — closed (fixed).** Ready and aborted say the video file is not requested until Play and the thumbnail already loaded. No D7 live deck/spec/canvas sentence promises nothing is fetched before Play. Historical D1–D6 statements and D7’s descriptions of the withdrawn claim are records, not D7 behavior promises. Privacy separately discloses thumbnail loads. Actual preload/source gating remains an implementation test.

**D-50 Medium — closed (fixed, design construction).** Four countdown/cancel/return drawings show a .vh role=status aria-atomic=true region; the visible number is aria-hidden and not inside a live region. Spec0/3/8 requires one write at start, one on Cancel; no per-second live-region writes. This is a sufficient construction contract, not measured screen-reader utterances or a built timer. The returned3s frame’s static announcement starts with five seconds; implementation must retain the existing countdown announcement rather than announce a new five-second countdown on resume.

**D-51 Medium — open.** Current main src/lib/lens.ts defaults to Poster; D7 data.js75–81 DEFAULTS.lens is ledger, so entering from ?lens=ledger drops it and renders the current app’s Poster default. The D7 sample baseFor(ledger) also omits lens=ledger. A valid Poster address remains noncanonical; junk owned keys/invalid dates/all-competition selections are not normalized as canonicalSearch specifies. The hard-coded today2026-10-12 erases a valid prior-day pin on this review date2026-10-13. P-28 compares75 enter/move/leave operations with the actual codec, with30 mismatches at the common12-Oct test date, plus the independently tested date drift. Unknown keys and explicit only= survive; watch sets/replaces/clears correctly. Required outcome: use main’s actual defaults/normalization, merge preserved valid state, and supply the correct date context without removing an existing pin on later route changes. Acceptance: rerun all URL_CASES and valid Ledger/Poster/Broadcast, full/empty/partial only, junk keys, duplicates, today and prior-day pins against the pinned main codec; valid parameters and unknown keys survive, and Back/Forward/popstate are later runtime tests. No reversal of Q20 Query.

**D-52 Medium — closed for the requested names/order.** Independent Chrome AX:118 frame subtrees,22,664 nodes,1,420 exposed controls,zero empty names;152 Save buttons include their title;27 switches named Autoplay next carry checked state;261 radios form87 one-stop groups. Real Tab down/up events on five isolated frames give21 gallery stops,15 mixed-gallery,15 ready-watch,16 countdown,6 recorded-gate Publish. Cancel follows Theater/player slot and precedes Replay/Copy; queues are named by title alone. Native video is drawn, not mounted, so its own focus stops/controls and screen-reader operation remain not verified. A newly noticed disabled-atlas control is D-58 below; it does not undo the corrected contextual names/Cancel order.

**D-53 High — closed (fixed).** All four privacy drawings start PROSPECTIVE and carry the date/version template plus SLOT · filled by the audit. The deck intro no longer claims a completed audit. All future privacy assertions remain contingent on the migration audit, including the narrowed no-visit-storage statement; no audit or cookie/log/provider behavior has been verified here.

**D-54 Medium — closed (fixed).** All four privacy frames require that the gallery list has loaded for image fallback; unreadable database gives no cards/no thumbnails from either source. Matches all18 unavailable drawings and A-09 Scoped.

**D-55 High — closed (fixed, design protocol).** Publish and Unpublish now show a thumbnail-only PR, verify, auto-merge, deploy and serving, with upload/record/PR/delete failure outcomes and retry copy. No direct Commit action or “about a minute” claim remains; committed is deliberately retained as a state before serving. Live rulesets require verify with RepositoryRole5 always-bypass/current principal always; the separate history rule prohibits deletion/non-fast-forward and has no bypass. Thus “could push past verify, and Publish never does” is accurate specifically for a fast-forward CI bypass, not permission to force-push/delete main. Spec9 also names append-only. The absolute “nothing reaches main” is read in its Publish protocol context, as the same sentence expressly acknowledges the admin exception. No push/auto-merge/deploy test performed. Deploy failure/retry, token identity and concurrency are mandatory build-plan tests.

**D-56 Medium — closed (fixed).** Independent Emulation.setEmulatedMedia no-preference/reduce, with shadow roots:265 nonzero transitions →4;261 lens transitions →0, no named animations. Remaining4 are image-slot tool chrome explicitly labelled. Artifact’s temporary CSSOM receipt restoration leaves the original media rule intact.

**D-57 Low — open, receipt accuracy.** STUDIO now uses --text and passes comfortably, but spec5 prints13.33/14.11 while independent rendered colors and Python arithmetic give12.54/16.00. Actual pairs are not inferred from H1: the independent visible scan groups46 theme/size/color pairs (including shadow/tool text), whereas H1 counts hidden/closed-detail and chrome categories differently. Two image-slot captions are2.58/2.41 after effective opacity: tool chrome, not a Kickoff product-text failure. The keyboard-reachable Undo shuffle is3.77 in two visible light frames (D-58). H1’s “0 below” does not account for effective opacity. Required outcome: reconcile every printed pair with actual rendered foreground/background, opacity and enabled/disabled/chrome classifications; correct the STUDIO numbers and scope the tool exceptions honestly. Acceptance: independent visible text-node/shadow scan in both themes using4.5 normal/3 large (≥24px or≥18.67px bold), plus exact token arithmetic, reproduces the updated receipt/spec. Severity remains low because this is principally atlas/receipt fidelity; no shipped product contrast failure was demonstrated.

**Geometry — verified without the deleted P-22 receipt.** Current CSS204–206,299–304,327–331 provides gallery min(w−40,1120), shell max780/padding40, player200 floor and888 breakpoint with300+28 sidebar/gap. D7’s proposed grid is min280/gap16, single column≤760. Independent arithmetic on24 G rigs differs at most0.00521px from browser rects. Mixed rows’ actual inner-box ratios are768/480 and768/432, equal card columns/align-items:start;1000 gives307.33×192.08 and307.34×172.88. Actual outer viewports360/375/390/1000×1000,DPR1,fonts loaded preserve all64 gallery/state frame widths with zero frame overflow. Atlas document scrollWidth1120 at smaller viewports is intentional fixed-artboard presentation, not product overflow. No acceptance-app build was necessary: current-main geometry rules are unchanged at the reviewed head and the target is a design; no playback/app implementation claim is made.

### D-58 — Low — the atlas’s disabled Undo shuffle remains keyboard-reachable

Target: D7 canvas87; gallery1-1000-ledger-L/2c-390-ledger-L; runtime d7/support.js boolean-attribute conversion. Expected: the visibly dimmed, source-declared disabled Undo is exposed as disabled and skipped by Tab. Observed: P-34 shows disabled=false, no disabled attribute,tabIndex0; P-29 real Tab and AX reach/name it. Effective foreground opacity.55 gives3.77 contrast (P-33). Impact: a builder copying H3’s21-stop receipt may preserve a stop that should be unavailable, and H1’s exemption cannot be defended with the actual DOM. Required outcome: render actual disabled semantics and reconcile the sequential focus/contrast receipts. Reproduce with the named filtered gallery frame, real Tab and Chrome AX; acceptance/overturn: Undo has disabled=true, a disabled AX state, no Tab stop, and its intended unavailable treatment is reflected in the report. This is an atlas fidelity issue; no interactive Undo action or shipped-app failure is claimed.

### Appendix PM checked after independent probes

**PM-7:** The premise “no announcement when the next starts” is incomplete. Canvas192 already makes StatusLine role=status; playing is Sound on…, replacing Ended…, while the countdown region preannounces the next title. The spec expressly retains the status-line change on actual play. That provides a programmatic status mechanism at start with unchanged focus; the h1 alone is not relied on. [W3C’s status-message explanation](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) covers changed status text and says authors are not required to invent additional status messages. I find no demonstrated4.1.3 failure in this design contract. However no real transition or screen-reader announcement has occurred: the build must verify the playback-success event triggers the status change, the next identity is understood and resume does not repeat the countdown announcement. A title-bearing success announcement is a possible improvement, not a new adjudication imposed here.

**PM-10:** Confirmed, with scope: CI bypass always exists; append-only has none. The sentence only concerns verify, and the full spec supplies the history constraint. No blanket ability to bypass all rules is stated.

**PM-11:** H3 alone insufficient, confirmed. Independent AX and actual Tab evidence now substantiate the corrected contextual controls/order; D-58 records the additional fidelity issue.

Blocks completed:3/6.

## Block 4 — Beni’s answers folded (completed)

P-35-rulings.json is a fresh DOM query for theater, switch values, hidden-tab help, shell feet and spoiler controls. P-25 supplies the copy; source/spec reads below independently compare to the PM brief’s actual answer words.

| Answer | Canvas/copy/spec observation | Outcome |
|---|---|---|
| Q13 Native | Browser-owned controls contract; help on playing/paused/muted/theater;8-shortcuts records Native, withdraws Page; only Escape remains a theater-page exception. | Folded; native-key/browser proof unrun. |
| Q14 Theater |5-1000-theater player960×540,one column; no dialog/overlay; exactly one Privacy & terms shell link. Spec0/6 expressly says D-25 met by shell foot alone. | Folded; single-element theater transition still build test. |
| Q15 Keep |All four privacy drawings retain the two-sentence #terms section. | Folded; no legal adequacy decision supplied. |
| Q16 On |Watch constructor defaults true; ready/play/countdown/refused/theater On; explicitly named Off/end-off examples exercise the other state. Help states first Play is reader-pressed. Spec0/6 records Off recommendation versus Beni On with A-10. | Folded; no entry autoplay authorized. |
| Q17 Key |All9-* list four keys with kickoff-moments-autoplay-v1; spec says remembered Off survives the On default. | Folded; actual persistence/refusal/migration test unrun. |
| Q18 Remove |No spoiler control in current canvas; spec withdraws control/copy/state. Historical D5 retained as record. | Folded. |
| Q19 PR |Publish/Unpublish/where/spec use PR→verify→auto-merge→deploy, no direct Commit action. | Folded in D7; ST1 agreement reserved for block5. |
| Q20 Query |watch query route, merge helpers and8-url; entering/leaving moves watch as intended. | Choice folded; implementation of preservation is defective, D-51. |
| Q21 No |Withdrawn ledger/11-* never offered Publish again; regenerate with parent is prescribed. | Folded; DB/application once-only guard unrun. |
| Q22 Record |Mixed rows follow record ratios, contain/full-thumbnail contract, grid aligns starts. | Folded; actual16:9 media verification run absent. |
| A-09 Scoped |Privacy fallback requires readable list; all18 unavailable drawings carry no cards. | Folded; no broader outage survival claim. |
| A-10 Pause |Help says hidden countdown waits; returned frame says paused/resumed; spec6 resumes from remaining number and defers hidden ended’s five seconds until return; explicit pause/route leave stop it. | Folded; runtime race tests unrun. |
| A-11 Preserve |Publish protocol never uses acknowledged admin bypass, both operations require verify before merge. | Folded; live enforcement/token protocol unrun. |

No surviving recommendation overrides the settled answer. Historical “Off”/“Commit”/“Overlay” mentions explicitly identify the prior alternative/ruling rather than advocating it. No answer supplied for Beni; Article50 remains gated and the Supabase plan remains operational.

**PM-9 checked after the independent answer audit:** Consistent with the actual Pass1.5 wording “they resume or wait when the tab returns.” Pause meant stopping countdown/start while hidden; it did not mandate a new click on return. D7’s spec, frame and help agree at this level. No new adjudication needed. The five-second hidden announcement in the static returned3s frame is a build acceptance detail (preserve existing region; do not announce a fresh five seconds), already retained under D-50.

Blocks completed:4/6.

## Block 5 — read-only ST1 cross-check (completed)

P-36-ST1-source.json contains exact git show origin/cursor/studio-st1:<path> reads of README,storage port/stub,schema,public columns,migration,engine,CLI and tests; P-36-PR-files.json is gh pr view187 --json files. Remote ref exactly equals the pinned PR head08315507335445cb33a964cd43a04492c5783f22. P-37-ST1-stub-contract.json executes only the dependency-free storage stub copied into the review’s probes under new names: mock paths are not read, no media/API/provider/package operation occurs. It independently yields bucket moments, fen-0007/video-01234567, fen-0007/thumbnail-01234567 and public/moments/thumbnails/fen-0007.jpg. This is stub contract evidence only.

**Records/read boundary:** Names compatible. studio/db/schema.ts273–299 has studio.videos, published_at,unpublished_at,position and distinct public_id. Migration110–159 provides catalog.videos/catalog.video filtered to published/nonwithdrawn, with public_id AS id, and the application must order by position. Migration163–179 creates studio_reader NOLOGIN with usage/catalog SELECT grants; it does not grant Studio tables. D7 spec9 and Where-it-goes bind reads to ST1’s read-only views rather than private tables. The D7 spec does not spell out catalog.video or studio_reader; its explicit ST1 binding is compatible, not proof of a configured production role. No live database was queried.

**Watch identity:** ST1’s public view id is videos.public_id (public slug); table primary id and video_asset_id/thumbnail_asset_id are UUIDs. D7 VIDEOS[].id/URL_CASES carry fen-0007/fra-0004 strings, compatible with public slugs. D7 never explicitly maps id to public_id, and its assetId shorthand is not safe to extrapolate to the route. This is an integration gap: build-plan types/tests must bind watch to catalog.video.id/public_id and keep asset UUIDs private; no proved contradictory watch-id choice or new finding is inferred from an unspecified alias.

### D-59 — Medium — Storage object path and key contracts disagree

Target: D7 spec9/data.js222 versus ST1 storage/stub.ts14–16,port.ts4–5,engine628–645. Expected: one agreed storage-key contract across publish/read/delete. Observed: D7 says moments/videos/<assetId>.mp4 and moments/thumbs/<assetId>.jpg; ST1 actually returns bucket moments plus <publicId>/video-<sha8> and <publicId>/thumbnail-<sha8>, with no extension and publicId rather than an asset UUID. P-36/P-37. Reader impact: a later builder using D7 to construct addresses can miss files or target different deletion keys; current catalog reads the stored object paths and need not invent them. A design-following builder would implement asset-keyed extension paths; an ST1-following builder would consume public-slug/hash paths. Cost of changing D7: update contract/copy and examples/types, no evidenced existing-file migration. Cost of changing ST1: adjust ports/stub/tests and future adapter keys plus collision/reuse/delete rules; existing production migration cost is not known because no live storage was inspected. Outcome: unresolved to Beni/PM; this seat chooses neither side. Acceptance: one approved bucket/object-key/type contract with sample video+thumbnail paths, matching upload/read/delete and retry receipts.

### D-60 — Medium — fallback destination and identifier disagree (PM-8)

Target: D7 spec9/data.js224 and removal copy versus ST1 README39/storage/port.ts11–12. Expected: the same path/key delivered by Studio and requested/removed by the site. Observed: D7 public/thumbs/<assetId>.jpg (runtime site /thumbs/<id>.jpg); ST1 public/moments/thumbnails/<public id>.jpg. P-37 executes the destination, not merely a README claim. Impact: image-host failure reaches the cover despite an existing shipped copy, or withdrawal removes a different copy. D7-following builder uses the short path/assetId; ST1-following builder uses moments/thumbnails/publicId. Changing D7 costs spec/copy/fallback URL and ID mapping; changing ST1 costs destination function/tests and later PR add/remove protocol, plus any deployed compatibility/migration if such copies eventually exist (none verified). Outcome: unresolved to Beni/PM, not selected here. Acceptance: one agreed destination keyed to the published record, verified through upload→PR→serve→image error→remove.

### D-61 — Medium — ST1 still treats decided questions as open and cannot represent PR phases

Target: ST1 README37/39; storage/port.ts7; stub35–38; engine575–582/692–699, versus D7 spec0/3/9 and the current ST1-v2 addendum. Expected: Q19 PR/Q21 No are recorded as settled, with the authorized stub PR-open/check-running/merged/check-failed phases distinct. Observed: README calls both Q19 and Q21 open. The port returns only destination; engine immediately writes fallback_status=delivered on its return, with pending/delivered/missing and no PR-check/deploy distinction. No real GitHub operation is implied or requested; the authorized addendum specifically asked for stub outcomes. A D7-following builder draws and implements the PR phase contract; an ST1-following builder treats synchronous destination delivery as sufficient and may re-open an already decided protocol. Cost of changing D7 to reflect this limited slice: clearly defer/bridge the PR phases and delivery truth, without silently changing Beni’s PR/No rulings. Cost of changing ST1: correct decision records and extend stub/port/outcomes/tests; later serving/deploy verification remains a separate slice. Outcome: unresolved to Beni/PM on which artifact/plan gets the bridging change; the settled human answers themselves are not reopened. Acceptance: shared decision record plus non-production stub proofs for PR opened/checks running/checks failed/merged and explicit deploy/serving boundary.

### D-62 — Medium — thumbnail origin differs between the gallery handoff and ST1

Target: D7 canvas117/611 and kept-table thumb source at748, versus ST1 README39/engine594–618. Expected: the image’s described origin matches the bytes published. Observed: D7’s canvas labels the thumbnail “from the clip” and the Publish table says “first frame”; ST1 explicitly takes K0, the input keyframe already on disk, copies its SHA/MIME/dimensions/path, and extracts no output-video frame. P-36 establishes the engine’s source; actual media was not opened. Impact: two builders can implement different thumbnail generation pipelines and ratio assumptions. D7-following builder may extract the output video’s first frame; ST1-following builder reuses input K0. Changing D7 costs origin wording/geometry assumptions and an honest source definition; changing ST1 costs an extraction step/tooling and decoding/mime/dimensions/error handling tests (no dependency install authorized here). Outcome: unresolved to Beni/PM. Acceptance: one approved thumbnail-source contract and later byte/hash/frame/dimensions proof, including16:9 and whether K0 genuinely represents the clip. This does not assert that K0 is visually wrong; no image-content judgment was possible.

### D-63 — High — delete failure keeps the video published in ST1, contrary to D7 withdrawal

Target: D7 spec3/9,11-partial-delete versus ST1 engine703–725. Expected in D7: clear published_at first, then optional delete; delete failure leaves the record withdrawn/no card and files readable by address, with Retry delete. Observed ST1: both remove calls precede the withdrawal transaction; catch returns remove-failed,live:true, and the published record remains. It also makes deletion mandatory (unpublish has no delete option) and exposes no removal-fallback port/PR step. P-36 lines709–724 are a direct control-flow counterexample; existing test423–427 covers successful withdrawal, not this design failure branch. Impact: an operator following D7 expects an unwanted clip to be unlisted even if file deletion fails; ST1’s failed-delete path can keep it discoverable, or list a clip whose first file was already deleted. This is material withdrawal-contract divergence, hence High; no actual public clip or provider call was tested. D7-following builder withdraws first with optional deletion/removal PR; ST1-following builder requires successful file removal before withdrawal. Changing D7 costs a different failure/recovery/withdrawal contract and copy, to be explicitly considered by Beni; changing ST1 costs transaction order, optional-delete API, retry semantics and fallback-removal port/tests. Outcome: unresolved to Beni/PM; no code edited and no side chosen. Acceptance: an approved state sequence, plus source/stub tests for each delete failing independently, withdrawal write failing, optional preservation, retry/idempotency, public-view disappearance and fallback removal/PR partial outcomes.

**PM-8 checked after independent source/stub comparison:** Confirmed fallback path/key mismatch, D-60. The broader record/read-view names agree in source; the additional Storage key, PR-state, thumbnail-origin and withdrawal differences above were found independently. A green ST1 stub suite, if later rerun, would not prove D7 playback/publication acceptance.

Blocks completed:5/6.

## Block 6 — synthesis, verdict and build-plan tests (completed)

Outcomes above distinguish fixed drawings/contracts from implemented behavior. Findings retain their IDs/severities; D-58 onward are new. No previous report has been appended or edited. No builder claim of all12 fixed survives as a conclusion without its acceptance test.

### Verified facts

Package/folder/history pins match; origin/main and PR identity were read live. Required state drawings and mixed-ratio geometry exist. Prospective privacy and scoped fallback match the recorded answers. Current-main tokens/geometric boundaries, CDP motion, AX names/state and real focus order were measured. Main’s CI bypass is narrower than its nonbypassable history constraints. ST1 source and dependency-free stub prove the catalog alias/read-role declarations and current path/output differences; they prove neither production enforcement nor deployment. Beni’s13 recorded answers are unchanged; Q20’s chosen shape is respected but its helper is defective.

### Not verified

No real video or image asset was mounted; no Play pressed. No Safari/iOS/Firefox, screen reader, production database, Storage, provider, Vercel deployment or GitHub publication operation was exercised. No original measured media/billing receipt was reopened. No private account/key/media/finance records were read. Public W3C documentation supplies the PM-7 semantics; no legal or account decision was supplied. Future privacy assertions remain prospective, not independently audited facts.

D7’s no-visit-storage tail is narrower than D6’s old “nothing anywhere else” but still needs the actual host/dependency/network/log audit; no server-retention fact is inferred from it. Watch id→public_id is compatible but not explicitly bound in D7. Current-main real-app geometry was calculated from the source rules, not measured in a newly built app; exact browser native/movie-control/media contrast is unrun.

### Appendix PM ledger

| Item | Independent result | Disposition |
|---|---|---|
| PM-7 / block3 | Existing role=status playback line changes from Ended to Sound on; countdown already names next. H1 alone is not the mechanism. | Premise partly overturned; design acceptable, actual start/identity/utterance test remains. |
| PM-8 / block5 | Executed stub destination differs from D7; schema/views agree. | Confirmed, D-60; additional independent differences D-59/61/62/63. |
| PM-9 / block4 | Brief explicitly permits resume or wait; spec/help/returned frame agree on stopping while hidden. | Consistent; hidden/resume races and announcement reuse unrun. |
| PM-10 / block3 | verify always-bypass exists; append-only has no bypass. | Accurate for CI fast-forward bypass; full spec includes history limit. |
| PM-11 / block3 | H3 is a DOM claim; independent Chrome AX/Tab matches requested names and Cancel order. | Acceptance now evidenced; new disabled Undo gap D-58. |

### New Beni questions — recommendations first, not answers

Each option is one word. These are new contract choices for PM/Beni; Q19 PR, Q21 No and all earlier rulings stay settled. Recommendations do not choose which artifact or builder changes.

- **Q23 Stored / Fixed** — recommend Stored: use the published record’s bucket/object_path for media addresses, versus imposing D7’s fixed assetId directory scheme (D-59). Stored avoids readers guessing keys; the write/delete contract must still be explicit.
- **Q24 Nested / Short** — recommend Nested: keep ST1’s public/moments/thumbnails/ location, versus D7’s public/thumbs/ (D-60). The existing port/test contract makes Nested the smaller integration change; no production-copy migration is assumed.
- **Q25 Public / Asset** — recommend Public: key fallback copies and bind watch to the public_id slug, versus an asset UUID (D-59/60 and watch integration gap). Public keeps the reader identifier distinct from Studio’s physical assets.
- **Q26 Frame / Keyframe** — recommend Frame: use the output clip’s first frame, versus the existing input K0 keyframe (D-62). Frame matches D7’s promised thumbnail origin; it costs extraction/dimension/error-handling work, not a new generation. Keyframe is cheaper but needs honest revised origin/ratio language.
- **Q27 Withdraw / Delete** — recommend Withdraw: clear publication before optional deletion, versus requiring successful deletion before withdrawal (D-63). Withdraw matches D7’s recoverable unlisting contract when Storage removal fails. No withdrawal was performed and no choice answered for Beni.

### Blocks completed

1 pin/delta map;2 response locations;3 original acceptance tests and tagged PM items;4 Beni’s answer fidelity and PM-9;5 ST1 contracts and PM-8;6 outcomes/questions/verdict/tests. **6/6 complete.** No block omitted due to session bounds.

### Verdict

**Ready after named fixes.** Before D7 is used as the build-plan source: close D-47/48/51/57/58 and reconcile D-59–D-63 through the PM seat/Beni. D-63 is the highest-priority integration issue. The eight closed original findings are design-level closures only. This seat neither approves the build/deployment nor selects which side changes.

### Implementation-plan tests that stay open

1. **Playback and single element/host:** real media source/preload/poster/network gating; reader-first Play, sound/native controls, src swaps, queue/order preservation, replay/end/error2/3/4/abort, theater/Escape/fullscreen/PiP, focus return and route leave. Mount/count one actual video across transitions; no silent skip after errors.
2. **Autoplay policy:** Chrome/Firefox/Safari/macOS/iOS after a reader Play; refusal leaves loaded next with Play; no entry/re-entry autoplay. On default, remembered Off, storage refusal/private browsing and leaving/re-entering reset the interaction permission correctly.
3. **Hidden tab/races:** pause remaining time; no automatic start while hidden; resume from remaining time or defer ended’s full countdown until return; explicit pause/Cancel/route leave stop it; rapid hide/return and near-zero races.
4. **Assistive technology:** actual screen-reader utterance count at countdown start/Cancel, no per-second chatter, no new five-second announcement when resuming at3s; successful auto-start changes polite status and conveys the next identity with focus stable; real native focus/name/control paths.
5. **URL state:** actual canonicalSearch defaults/valid+junk normalization, stable prior-day pins, unknown keys, empty/full competition selection, all lens/theme/tab combinations, enter/move/leave/watch-notfound, Back/Forward/popstate and history entries for automatic moves; route id bound to public_id.
6. **Public read boundary/freshness:** server authenticates as studio_reader with SELECT only on catalog views, no Studio/private table grants or client DB calls; published_at/unpublished_at filtering, position ordering, immediate publication/withdrawal, cache invalidation/concurrent reads and unavailable/no-memory resurrection. Source SQL is not a live privilege receipt.
7. **Storage/media/thumbnail:** agreed bucket/keys/source, actual bytes/MIME/hash/dimensions and mixed16:10/16:9 containment; Range/seek/headers and correct delivery; storage→site-copy→cover error chain and readable-list prerequisite; optional deletion/reuse/idempotency/address exposure after upload/Cancel. Joint DB+Storage outage must not show stale cards.
8. **Fallback PR protocol:** non-production port phases PR open/check running/check failure/merge/deploy pending/deploy failure/serving; verify before main with correct token constraints, never bypass; thumbnails only, retry/conflict/concurrent Publish/Unpublish, idempotency, agreed path/public ID, removal and cache limits. Committed≠deployed≠observed-serving; no timing guarantee.
9. **Withdrawal failure matrix:** each delete failing independently, partial deletion before/after record write, withdrawal transaction failure, optional retained files, fallback-removal PR failure/deploy delay and retries; reconcile D-63 before tests encode either contract.
10. **Studio state machine:** all15 states+Completed substates, budget/gate/checklist/Keep constraints, upload/record failures, fallback pending/missing/delivered phases, never relist withdrawn, parent regeneration; actual ledger values and provider HTTP/result expiration are not proven by illustrative drawings.
11. **Privacy migration audit:** actual code/dependencies/cookies/font/network/storage and host logging/retention behavior; four keys/refusal/clearing semantics; fill date/version stamp and claims only from that audit. Article50 applicability/disclosure must be explicitly recorded through the authorized human process; no design reviewer answer is substituted.
12. **Visual acceptance:** future app lens×theme×tab at360/375/390/~1000, mixed ratios/loading/fallback/unavailable, focus/hover/zoom, CSS motion including shadow/tool separation, rendered text/background/opacity and real media/native-control contrast. Correct atlas’s local labels/disabled Undo/contrast receipt first; do not import _ds into the repo.

### Probe corrections and execution boundaries

Initial D5 preservation script counted DS/export metadata along with the68 D1–D5 content/review files; it failed that overly broad count. The corrected explicitly scoped68-file comparison passed with every byte equal. Chrome startup was polled before CDP listened twice, then succeeded. An initial AX query overlapped navigation and failed with stale node IDs; it was rerun sequentially against the stable full render. Initial focus capture showed a duplicate first theme stop during the atlas measurement rerender; a700ms settle followed by a complete real Tab rerun removed that transient. Initial screenshot selector construction failed; repaired script captured all seven successfully. Only successful final receipts support outcomes.

Chrome launch used a fresh task-only profile, disabled background networking/component updates/sync, blocked nonapproved artifact requests in CDP and blocked Google service hostname resolution. Nevertheless its launch log shows OS-level GoogleUpdater/crash-handler subprocesses and a clients2.google.com crash-handler URL. The CDP artifact log contains no fal/Supabase/Vercel/Google API request; **zero browser/OS-background network traffic is not verified** by a tab-level log. No explicit provider/account/Google API request was made, and no setting/install/spend action was taken. This limitation is reported rather than erased.

Cleanup is required before this review is complete; the observed receipt follows.

## Cleanup receipt — P-38

Completed: dedicated Chrome closed through Browser.close; dedicated HTTP process stopped;127.0.0.1:9227 and8765 no longer accept connections. Requested git worktree remove succeeded without --force; no acceptance app was built and review checkout was clean. The path is absent and no longer listed. Final108-file folder bytes/hash are unchanged (584a0e176e16fc8c3570bc92b745eaba5ae1324cdd06731383708e77f599e901); original D6 report is byte-identical to its pinned review upload. PR187 remains OPEN at08315507335445cb33a964cd43a04492c5783f22. Original checkout’s final status lists only two untracked directories: .agents/skills/kickoff-design-studio/kickoff-s4b-shelf-cursor/ and .agents/skills/kickoff-pr-review/. Their pre-turn status was not captured here; no command in this review wrote either directory. No tracked design/repository file was edited.

Only report/probe/evidence/profile files were written outside the review targets, plus the explicitly requested fetch/detached-worktree setup/removal. No _ds/upload copy went into a repo. No branch/commit/push/PR/issue/review/comment/release/tag/settings/API-provider/account/key/install/spend/sync/audit-fix action occurred. Review complete; stop here.
