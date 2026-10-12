# Moments D3 — Codex's Pass 2.5 synthesis (archived Mon 12 Oct 2026, TZ=America/New_York)

Written by Codex (GPT-6.1 Sol High) on Sun 11 Oct 2026 at `2199649`. Verdict: ready after named fixes; 20 findings closed, D-24 to Beni, D-42 to D-44 opened; the Pass 3 list A-01 to A-08. Beni answered all eight the same day. Its evidence (probe scripts, captures, JSON) stays local at `~/kickoff-d2-review/`; nothing from it is committed.

---

# Moments D3 — Pass 2.5 synthesis

Seat: Codex, GPT-6.1 Sol High (requested seat; model configuration not independently observable).
Date: Sun 11 Oct 2026, America/New_York (verified with TZ=America/New_York date).
Target: /Users/benicheni/Moments Studio admin surface design D3
D3 fingerprint: `c255a2db44b4757cc4140ff6d39385d4f36068eb794617eaecbb3ed825b3977b` (12/12 manifest entries OK).
Folder-manifest hash: `540e340153330170d1e3d71fc15a580057b1217dac842465f6fd950b365036f6` (57 files; byte-identical to PM manifest).
Worktree SHA: `21996495160a8d1e409c3f93e802924548415523`.
Chrome version: `155.0.8059.40`, CDP pipe, headless, DPR 1.

Review completed through all seven blocks. Historical and builder claims were independently re-checked within the recorded static/runtime/source scope. No product/artifact changes or publication authority.

## Block 1 — Pin and refresh (completed)

### Evidence index

- **P-19** — Independent setup and fact refresh. Commands: supplied fetch/worktree-add, git log -3, git diff --stat 54f7804 HEAD over the named CSS/component/lib/public/index/script/package paths (empty); npm ci --no-audit --no-fund (134 packages); supplied stub generator and build:acceptance (both exit 0; two fictional IDs, snapshot 2199649; Vite chunk-size warning only). D3 shasum -c: all 12 OK; manifest fingerprint and whole-folder manifest reproduce exactly; diff against PM manifest empty. Original checkout has two pre-existing untracked skill directories; no source edits made. Release API `gh api repos/BeniCheni/kickoff/immutable-releases`: enabled=false, enforced_by_owner=false; `gh release list --repo BeniCheni/kickoff`: empty. Outputs: evidence/P-19-release-setting.json, P-19-release-list.txt, d3-run/folder-manifest.sha256.
- **P-19 transport** — Same public tarball as Pass 1, canonical https://github.com/cli/cli/releases/download/v2.102.0/gh_2.102.0_linux_amd64.tar.gz. curl -sIL and curl -sL -r 0-1 with 30s ceilings: 302 to release-assets.githubusercontent.com, HEAD 200 application/octet-stream, range 206 bytes 0-1/15319960, Content-Length 2 (two-byte file retained). Outputs: evidence/P-19-head-headers.txt, P-19-range-headers.txt, P-19-range.bin. Signed redirect is transient and is not a record address. Tarball transport does not establish MP4/WebKit playback.
- **P-19 policy** — Read [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies) III.A and III.C at source, saved policy HTML and A–C text in evidence/P-19-youtube-policy.html and P-19-youtube-AC.txt. III.A.1 has both the YouTube-terms link and own-terms agreement statement; III.A.2 addresses agreement timing and persistent privacy access. III.C.2 explicitly includes video playback among user-initiated YouTube actions. Policy applicability/adequacy is not decided by this review.
- **P-19 prices** — Read docs/moments-studio-architecture-review.md §8.1, §8.4:648–685 and Appendix S's measured 5/15-second H3 rows. Date command returned Sun 11 Oct 2026 EDT: before 15 Oct. D3's “Now · to 14 Oct” applies today: $0.075/5s and $0.225/15s at 480P; “From 15 Oct” $0.125/$0.375 is the documented later estimate. No fal call made; current provider pricing beyond the permitted committed record is not verified.

Main now contains PR175's docs; D3 §12's open-PR statement is a dated 10 Oct snapshot, not an app defect. No folder drift or application-path drift found. Appendix PM: none tagged to block 1. Blocks completed: 1. Remaining: 2–7.

## Block 2 — Nothing else moved (completed)

- **P-20** — Read full D2→D3 file/spec diffs, saved evidence/P-20-d2-d3.diff (1168 lines) and P-20-spec.diff (344 lines). The duplicated top-level/d3 specs are byte-identical; capture PNGs are byte-identical, used only through the canvas. Q1–Q12 question/decision cells are identical; Folded-where references update to the added sections/frames. Host remains GitHub Releases; the 768×432 crop, one 5s 480P run and pass/fail default rule remain specified and unrun.

Delta map: canvas frame/probe/G changes and reader cascade/outdent/count line → D-28; contain picture and ratio captions → D-29; illustrative banner/tags/composite caption → D-22; source separator and quoted credit → D-23; terms → D-24; foot line/empty gallery → D-25; YouTube labels and validation scope → D-26/A-08; static-page delivery → D-27; export mechanism/confirmation → D-30–D-35/D-38; timeout/substates → D-36–D-37; field/group labels and H3 → D-39; billing/duration separation → D-40; contrast/H1 → D-41 and withdrawn PM14; dated fonts/pre-Play attribution → explicit PM corrections; invariant for YouTube notice → PM15 in the Pass 1.5 brief; outside-Moments access → A-07. H4/static-boundary text implements the Pass 1.5 receipt/boundary instruction.

One extra substantive change does not map to §0's D-ID changelog: frame 12 replaces the promised comma/period frame scrubbing with “frame-stepping is whatever those controls offer, not promised here” (d3/studio.jsx:124; §3 Review player help). Pass 1 had explicitly left this capability unverified; correcting an unproved claim is reasonable, but the delta must be recorded rather than concealed within “nothing settled moves”. Candidate D-44 (Low, traceability); to be checked with the frame in block 3/4. No Q-row or host/ruling reversal established. Appendix PM: none tagged to block 2. Blocks completed: 1–2. Remaining: 3–7.

## Block 3 — Answers complete and where claimed (completed)

- **P-21** — Rendered the unchanged D3 canvas at http://127.0.0.1:8765/Kickoff%20Moments%20-%20D3%20design%20canvas.html, served from the pinned folder, Chrome155/CDP pipe, 1000×900/DPR1, visible. Awaited fonts.ready, called __placeRows and dispatched d3:remeasure. 62 named frames; every frame's scrollWidth equals its assigned width; no video or iframe. No unpkg failures; Google Fonts was allowed but no Google Font request occurred (canvas loads its local DS font mirror); font status loaded. All continued requests were loopback/unpkg. Script probes/d3-canvas-observe.mjs; complete DOM/geometry/link/probe dump evidence/P-21-canvas.json. Screenshots P-21-frame-3a/5b/9a/10/12/13.png, inspected 3a/5b/9a/13 visually. Static atlas does not establish playback or provider/persistence behavior.

Pass 2 table has exactly 21 unique rows, D-21–D-41; every row supplies a disposition (D-22's mixed acceptance/characterization contest is one disposition). All named frame groups and source locations were opened/read. Actual line references occasionally point to a neighboring line (e.g. frame-step help is studio.jsx:125; row's terms text is data.js:106); no absent target was found.

| ID | Located change and observed result; final acceptance follows in blocks 4–5 |
| --- | --- |
| D-21 | §6 A1 note; frame7 section note leaves applicability A-06. Four primary citations to check. |
| D-22 | canvas.jsx:19 ILLUSTRATIVE banner on1a–c; reader.jsx:140–146 tags on7a–b; 2a caption. Contest fixture/source pointers need independent tracing. |
| D-23 | reader.jsx:53 source separator present; data.js:118 credit quotation marks appear on11. |
| D-24 | reader.jsx:254 #terms, data.js:106 statement, 9a–d; proposed under A-02 in §3/canvas note. |
| D-25 | reader.jsx:289 foot; all19 requested frames contain a focusable link; empty gallery1d present. |
| D-26 | data.js:22 fictional channel/YouTube label and watch link visible on1a–c/8a–d; scope question A-08 in §6. |
| D-27 | §9 specifies standalone CSS, source tokens, fonts, stored/default theme, stamp. Drawn9a–d; actual standalone file unbuilt. |
| D-28 | CSS29/44/102/115 repairs, G24 rigs and2e/3a now side by side; independently measure app in block4. |
| D-29 | reader.jsx:84 ClipPicture rects and ratio captions; pictures have aspect-preserving dimensions and visible bars. |
| D-30 | data.js:128 conditional immutability/detection copy on13; setting not claimed enabled. |
| D-31 | data.js:130/13 confirm public upload before edition merge, Cancel before upload and partial upload outcomes; button matches. |
| D-32 | data.js:110/9a–d provider/redirect copy; studio.jsx:175 canonical address never signed redirect. |
| D-33 | data.js:131/13 retry-safe hashed identity, not Latest, non-v tags; explicitly proposed under A-03. |
| D-34 | data.js:129/13 schema offline, verify-media on export PR, fetched bytes for SHA; §10 proposal heading. |
| D-35 | §10 distinguishes published-site limit from repository recommendations and links docs. |
| D-36 | data.js:122/11 timed-out row marks10min proposed A-05, unknown charge, not cancellation. |
| D-37 | data.js:124–125/studio.jsx:84–85/11 both Completed substates and free download retry vs charged regeneration drawn/written. |
| D-38 | data.js:127/13 scoped PR/release photo sentence; composer10 retained stripped-copy disclosure. |
| D-39 | studio.jsx:25/40/143 named controls/groups; independently computed AX names68/0 unnamed, actual keyboard25/21/9. |
| D-40 | studio.jsx:129/12 separates measured billed dollars/output duration from unknown/illustrative billable units. |
| D-41 | §5/H1 pending-on-bg11.21 dark; withdrawn PM14 described as wrong, not a current defect. Independent arithmetic follows. |

Appendix PM: none tagged to block3. Blocks completed: 1–3. Remaining: 4–7.

## Block 4 — Independent acceptance reruns (completed)

### Evidence index, continued

- **P-22** — Real application: probes/d3-app-geometry.mjs, evidence/P-22-app-geometry.json. Loopback acceptance build at http://127.0.0.1:4318, 48 cells: 360/375/390/760/761/887/888/1000 × Ledger/Poster/Broadcast × light/dark. CDP Emulation.setDeviceMetricsOverride, 900px height, DPR1; each cell records innerWidth, active lens/theme and document scrollWidth. Open selection, enter Cinema through its own control, measure, exit; never Play. Blocked every non-loopback request (Google Fonts blocked intentionally); zero video/iframe/player requests. Independent comparison against measured G DOM, not G expected/✓, saved P-22-comparison.json: 432 comparisons, zero mismatches at 0.02px tolerance. G draws 24 rigs, one stated theme per lens; both app themes agree with those measurements. Initial CDP serialization error was a probe error, corrected before this completed run, not an acceptance-build failure.
- **P-23** — probes/d3-copy-probe.mjs; evidence/P-23-copy.json: normalized textContent, paragraphs, illustration tags, source labels, picture natural/rendered dimensions, and notice/player rectangles. Full 360px notice (8d) is now drawn; all four notice boxes are outside their player rectangles and Play is described by the notice. No playback.
- **P-24** — CDP Accessibility.getFullAXTree independently resolved backend DOM IDs for frames10/12/13; P-24-accessibility.json contains all68 control/group names and actual Tab traversal25/21/9. Nineteen requested reader states have present, tabIndex0, successfully focused Privacy & terms links. This is a static-atlas receipt, not a built Studio or standalone-page walkthrough.
- **P-25** — Resolved light/dark tokens P-25-tokens.json; independent Python WCAG sRGB/alpha arithmetic in probes/d3-static-audit.py, P-25-contrast.json. Fifteen H1 pairs checked. P-25-motion.json inventories computed transitions/animations on elements and before/after pseudos across every frame (15,045 records per media state), no-preference and reduce; zero nonzero transitions, named animations or running Web Animations in either state.
- **P-26** — Fixture chain independently traced with git show 1fad342:src/data/fixtures.json, the committed acceptance JSON, observation edition.ts and generate.mjs:22–24. P-26-fixture-source.json. No private visit receipt read. Original snapshot contains supercup:401873624 and exactly the clubs, competition, kickoff and status used in the acceptance fixture; the acceptance fixture has no result field. First introduction of acceptance JSON is 11845cb (#138).
- **P-27** — P-27-copy-AX-comparison.json: all77 §3 backtick deck strings of at least25 characters appear in independently observed normalized DOM, substituting dynamic placeholders and allowing CSS case transformation. Short strings, separators, quotation marks and action labels checked directly in P-23. All68 H3 names match independent AX names after case folding;12 are capitalized by CSS in Chrome's AX tree. Source rg over d3/ and the top-level spec: no “Nothing is published”, “none leave this Mac” or objects.githubusercontent.com; all immutability promises are conditional. This catches deck fidelity, not the truth of its evidence attribution (D-42/D-43).
- **P-28** — Primary GitHub docs read: [immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases), [create-release API](https://docs.github.com/en/rest/releases/releases#create-a-release), [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [large-files guidance](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github), [release limits](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases). Canonical URLs and API fields support the hosting checks below; settings/public transport were rerun in P-19. No release mutation or remote media body beyond two bytes.
- **P-29** — Read the four cited articles in [Regulation (EU) 2024/1689, original OJ text](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng). Tool retrieval intermittently returned an empty page; curl --fail --location of the same English OJ URL succeeded, saved evidence/P-29-eurlex.html. Source lines9324 (2(10)),10258 (3(60)),13839 (50(4)),18191–18240 (113), not the recitals. No legal applicability ruling.

### Geometry — D-28, D-29

Real app stage anchor and Cinema slot are identical in every cell, including the committed base-cinema.json checkpoints (360/390/1000). Gallery is viewport minus40px. Both columns and padding follow the shipped cascade; all 144 gallery/stage/Cinema checkpoints have scrollWidth=innerWidth. Application source/receipt: src/index.css:201–203,324–326,369–370 and docs/verification/moments-observation/receipts/base-cinema.json; P-22 captures actual runtime values.

| innerWidth | Gallery | Stage/Cinema tracks | Anchor and slot | Cards | Body padding |
| --- | --- | --- | --- | --- | --- |
| 360 | 320 | 320 | 320 × 200 | 1 | 14 |
| 375 | 335 | 335 | 335 × 200 | 1 | 14 |
| 390 | 350 | 350 | 350 × 200 | 1 | 14 |
| 760 | 720 | 720 | 720 × 405 | 1 | 14 |
| 761 | 721 | 721 | 721 × 405.5625 | 2 | Ledger18; Poster/Broadcast24 |
| 887 | 847 | 847 | 847 × 476.4375 | 2 | Ledger18; Poster/Broadcast24 |
| 888 | 848 | 520 + 300, gap28 | 520 × 292.5 | 2 | Ledger18; Poster/Broadcast24 |
| 1000 | 960 | 632 + 300, gap28 | 632 × 355.5 | 2 | Ledger18; Poster/Broadcast24 |

H1 font-size: at≤760 Ledger32, Poster/Broadcast39; above760 Ledger38, Poster48, Broadcast60. Edition count paragraph is display:none through760, block above. G's actual measured values match these; its self-computed expected column and check marks are not acceptance evidence. D3 Cinema at1000 is632×355.5, not D2's960×540. No requested app widths are missing.

P-21/P-23 picture rects: 2b at390 has320×200 centered with15px side bars; 2e and3a at1000 have568.796875×355.5 with31.59375px bars;3b at360 has320×200 with no bars. Option A on5a–c independently measures320×200,320×200,568.796875×355.5; option C measures320×180,350×196.875,632×355.5 with10,1.5625,0px top/bottom bars. Option B is the separately captioned larger16:10 box. The atlas sizes the picture wrapper to a contain result; the PNG inside uses cover against an almost-identical aspect ratio (568×356), causing only subpixel edge crop rather than the old stretching. A real hosted video's object-fit:contain remains an implementation test. D-29's selected-bars illustration now satisfies its geometry acceptance test.

### Copy, privacy and terms — D-23 to D-27; copy halves of D-30/31/32/36/37/38/40

P-23/P-27 deck fidelity passes, including Generated source separator, quoted fal message, public-upload/Cancel/partial-failure confirmation, scoped photo copy, both Completed outcomes and billed/duration/units separation. Negative checks pass. A faithful deck can still contain an inaccurate statement: the public privacy sentence mislocates the 7 Oct receipts (new D-42 below).

#terms appears on9a–d with the YouTube terms link and explicit agreement statement, satisfying presence of III.A.1's two distinct elements. Own wording/location is labelled PROPOSED under A-02 in §3 and the canvas privacy note. The personal/non-commercial/no-warranty sentence is proposed product wording, not a YouTube requirement. Its suitability remains Beni's/counsel's choice. D-24 remains unresolved to Beni until A-02 designates the statement/access path; this review establishes presence, not legal adequacy.

Privacy & terms is present/focusable on all19 requested states:1a–d,2a–e,3a–b,4a–b,7a–b,8a–d, including generated, empty-gallery and Cinema states. D-25's reader-access acceptance passes; A-07 separately governs access outside this client surface. It does not leave the repaired Moments link absent.

§9 specifies an independent CSS file, app-owned token block/equality test, stable relative links/fonts, static stamp maintenance, safe existing-key read and JavaScript-off system-scheme fallback. Compared with src/lib/theme.ts:15–30,48–53 and index.html:11–16. Lensless privacy uses the shared kickoff-theme, intentionally ignores kickoff-theme-broadcast, and adds no key. This is a reasonable stated page choice, not a promise to preserve a Broadcast-only theme. A stored Broadcast-only selection can therefore differ on privacy; implementation acceptance must include that case. React drawings9a–d do not prove an exported JavaScript-off page.

PM15's invariant is explicit in §3: all future wording identifies YouTube as the action Play starts, before first Play and in the short form, in the described-by slot; neither an abbreviation nor a mark/colour alone can replace it. This addresses the identification point in [III.C.2](https://developers.google.com/youtube/terms/developer-policies), whose example is video playback; it does not settle A-01 agreement timing. Notice rectangles8a/b/c/d do not overlap player controls in this static drawing. No click on any policy/player link was used.

### Illustration/source labels — D-22, D-26

ILLUSTRATIVE banners on1a–c and field tags on7a–b visibly separate invented provenance from measured file facts. Channel label and watch link identify Illustrative Channel / YouTube on card, stage and Cinema. No live identifier is substituted or visited. D-26's display acceptance passes; the new validator remains unbuilt as expected, with A-08's scope undecided.

D-22's characterization contest stands. Exact trace: d3/data.js:24–26 → docs/verification/moments-acceptance/edition.json acceptance-1 fixture → source fixture in git show 1fad342:src/data/fixtures.json. The old snapshot really does contain the PSG/Aston Villa fixture, contrary to PM18's implied doubt about the first commit. The acceptance fixture copies its facts but omits the result; the canvas shows no result. observation/edition.ts resolves supplied templates/fixtures rather than carrying literal club names; generate.mjs:22–24 loads the template and HEAD fixtures. The Pass1.5 authoritative mock-content clarification permits copied acceptance fixture facts while excluding real people/clubs depicted in generated media. The synthetic channel is now marked invented. This overturns Pass1's excluded-content characterization; invented-record labels were also fixed. It does not validate a YouTube selection for curation or turn a generator into a visit receipt (D-43).

### Accessibility, contrast and motion — D-39, D-41

Independent AX names match all68 H3 entries after CSS case normalization, zero unnamed. Named groups supply each checklist question, pressed states identify chosen answers, model/seed/keyframe/motion inputs have independent names. Actual Tab traversal agrees with §8's25/21/9 stops, and disabled Keep is excluded. This closes the static markup/context defect; an actual screen-reader walkthrough of the built Studio and all-Clear/enabled Keep remain not verified.

All resolved-token contrast pairs agree with §5/H1 to two decimals. Light/dark: generated15.19/14.99; ink/surface16.57/12.98; secondary/bg6.00/8.55; secondary/surface6.54/7.40; muted/bg4.99/6.04; pitch/bg4.82/7.75; database4.95/8.22; pending billed5.18/**11.21**; kept5.26/7.75; failed5.58/8.98; ink/alt13.76/11.61; secondary/media4.95/9.13; muted/surface5.44/5.23; media/bg1.21/1.07 (non-text); foot6.00/8.55. The pending ratio is corrected. PM14 survives only as a clearly marked withdrawn quotation in §5/H1, not an active failure claim: the shipped dark text classes use background/on-accent text. Pass1.5 explicitly permitted remove **or correct**, so this is an adequate withdrawal rather than a new defect. Both normal/reduced computed-motion inventories are zero; no media control or running-player motion was exercised.

### Hosting/operations — D-30 to D-38, D-40

Conditional immutability matches setting-off observation and [GitHub's published-release protections](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases). §10 calls non-overwrite, hashed identity, Latest policy and verify-media lifecycle proposals under A-03. P-19 confirms release-assets.githubusercontent.com redirect/range; canonical release URL never contains a signed redirect. Pages1GB is a hard published-site limit, repository1/5GB values are recommendations, and release2GiB/1000-asset bounds are documented separately. [Create-release API](https://docs.github.com/en/rest/releases/releases#create-a-release) makes make_latest a string enum true/false/legacy, default true for newly published releases; implementation must serialize the proposed false explicitly and test the actual latest-release result. None of those proposal mechanisms was exercised here.

Frame13 accurately separates public clips on upload from edition publication on Beni's merge. Cancel is expressly before upload; partial failure leaves arrived public assets and no PR. Confirmation names both facts, token use and the upload-first action. Frame10 says stripped copies go to fal;13 excludes photographs/stripped copies from PR/release only. No unqualified local-only export reassurance remains. A-04 accepts the consequence; it is not export/spend authority now.

Frame11 and deck draw both recoverable completed/download-failed and completed/expired results; free download retry and charged regeneration are distinct, expiry is unknown. Ten minutes is expressly a proposal under A-05 and never cancellation. Frame12 separates $0.225 billed, output15.084s measured, and billable units unknown/illustrative. No billable header or result-expiry documentation was read because no such provider access is authorized. Frame-step capability is now withdrawn from the help but unlogged (D-44).

### Legal note — D-21

The four original-OJ citations support the note:50(4) addresses deployer disclosure for qualifying deep fakes and the artistic/fictional lighter form;3(60) supplies resemblance plus false-authenticity criteria;2(10) excludes **deployer obligations** for natural persons' purely personal non-professional use;113's default date is2 August2026, with ChapterIV/Article50 outside its listed exceptions. The note's2(10) shorthand must be read within that deployer-duty context, not as a universal exemption. D3 names the persistent badge/provenance already drawn and explicitly reserves applicability to A-06. This supplies the missing source-backed answer/caveat. It establishes neither that Kickoff qualifies for an exemption nor that a particular clip/disclosure is legally adequate. [Primary OJ text](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng).

### Appendix PM ledger (checked after own probes)

| Item/block | Outcome | Independent evidence and consequence |
| --- | --- | --- |
| PM15 /4 privacy | Confirmed invariant supplied | §3 and P-19 III.C.2; YouTube identification survives full/short notice and future wording. A-01 still pending. |
| PM16 /4 privacy | Confirmed → D-42 | P-23 DOM9a–d, data.js:103/spec:155 versus merged slice-4-spec:432–435. Private live receipts are not committed. |
| PM17 /4 terms | Concern overturned as an unlabelled requirement | data.js:105–108, §3 PROPOSED A-02 and privacy canvas note. Non-commercial/no-warranty wording remains editable by Beni/counsel; policy does not require it. |
| PM18 /4 illustration | Partly confirmed, partly overturned | P-26: edition.ts has no literal names, acceptance JSON is the template; but 1fad342 really contains the exact fixture. No result shown; D-22 contest upheld. Separate generator/visit-evidence misclassification → D-43. |
| PM19 /4 geometry | Confirmed methodological warning; D-28 acceptance passes independently | G expected/✓ ignored; real app48 cells and base-cinema checkpoints match actual canvas measurements, P-22. |
| PM20 /4 privacy | Stated, reasonable choice; no defect | §9 and theme.ts:15–30. Lensless shared/system theme deliberately differs from Broadcast-only storage; add that case to the built-page tests. |

Blocks completed: 1–4. Remaining: 5–7. No forbidden receipt/provider/account location was opened; no Play action occurred.

## Block 5 — Outcome per stable ID (completed)

Outcomes concern this design's corrected markup, drawings, copy and handoff contracts. “Closed” is not a claim that a future implementation, provider run, legal ruling or release mechanism passed. Tests requiring those artifacts remain in block7. No Pass1 severity is changed; resolved severity is retained as historical impact. D-24 is a defined proposal awaiting its explicit adjudication, not a missing drawing. A-07/A-08 are additional scope questions rather than reasons to withhold closure of the original reader-link/source-label repairs.

| ID | Pass1 severity | One outcome | Acceptance evidence / remaining boundary |
| --- | --- | --- | --- |
| D-21 | Medium | **closed (fixed)** | §6 A1 now answers disclosure/caveat with four source citations, independently read P-29. Applicability stays A-06. |
| D-22 | Medium | **closed (contest upheld)** | P-21/P-23 illustrative fields repaired; P-26 exact fixture/template/source chain and Pass1.5 clarification overturn the excluded-fixture characterization. No curation/playback proof claimed. |
| D-23 | Low | **closed (fixed)** | P-23/P-27 source separator and fal-message quotation marks match deck after dynamic substitution. |
| D-24 | High | **unresolved, to Beni** | Proposed #terms statement and both III.A.1 elements present9a–d; A-02 must designate own wording/access path and adequacy basis. Acceptance: explicit A-02 ruling translated into S7 terms/access contract; no legal approval inferred here. |
| D-25 | Medium | **closed (fixed)** | P-24 all19 required reader-state links present/focusable, including empty/gallery/generated/Cinema. Outside Moments remains A-07. |
| D-26 | Medium | **closed (fixed)** | P-21/P-23 labels/watch links demonstrate fictional channel / YouTube on card/stage/Cinema. Future Q12 validator scope A-08 and implementation test remain. |
| D-27 | Medium | **closed (fixed)** | §9 specifies static asset/token/font/theme/stamp ownership, compared to theme.ts/index.html. Actual built page/JS-off test remains unperformed. |
| D-28 | Medium | **closed (fixed)** | P-22 real app48 cells and actual G measurements agree; committed base-cinema checkpoints reproduced. All requested widths reached. |
| D-29 | Medium | **closed (fixed)** | P-21/P-23 selected aspect-preserving picture rects/bars and200px-floor consequences agree independently. Future video contain integration unbuilt. |
| D-30 | High | **closed (fixed)** | P-19 setting off; conditional setting/detection copy, §10 proposal boundary and P-28 docs replace absolute immutability premise. Authorized replace/delete test remains future. |
| D-31 | High | **closed (fixed)** | P-23/P-27 frame13 distinguishes public upload/edition merge, before-upload Cancel and partial-public-assets failure. Consequence stays A-04; behavior unbuilt. |
| D-32 | Medium | **closed (fixed)** | P-19 rerun redirect matches conditional provider/domain/canonical-address copy; no signed URL used as record identity. |
| D-33 | Medium | **closed (fixed)** | §10/frame13 explicitly propose distinct hashed identities, retry handling, not Latest and non-v tags. API enum verified P-28; same-day/retry tests unrun. |
| D-34 | Medium | **closed (fixed)** | §10/frame13 explicitly propose offline schema builds and bounded export-PR byte-hash checking. Full lifecycle offline/changed-file tests unbuilt. |
| D-35 | Medium | **closed (fixed)** | P-28 primary Pages/repository/release docs agree with corrected hard-limit versus recommendation rationale. A-03 retains host authority. |
| D-36 | Medium | **closed (fixed)** |10min explicitly proposed in11/deck; unknown charge and no-cancellation distinction retained. A-05 owns Set versus Propose. |
| D-37 | Medium | **closed (fixed)** | P-23/P-27 both Completed substates drawn/written with unknown expiry/free retry versus charged regenerate; actual expiry semantics unverified. |
| D-38 | High | **closed (fixed)** | P-23/P-27 PR/release-only photo exclusion and composer stripped-upload disclosure agree. No photo/provider transaction done. |
| D-39 | High | **closed (fixed)** | P-24 independent AX68 named controls/groups, pressed choices and Tab25/21/9; built Studio screen-reader/enabled-Keep tests remain. |
| D-40 | Medium | **closed (fixed)** | P-23/P-27 dollar cost, measured output duration, unknown billable units separate. No invented response-header proof remains. |
| D-41 | Low | **closed (fixed)** | P-25 independently recomputed dark pending11.21 and all H1/§5 pairs. |
| D-42 | Medium (new) | **open** | Privacy copy falsely says private7 Oct visit receipts are committed. Correct evidence attribution; acceptance below. |
| D-43 | Medium (new) | **open** | Generator/template misclassified as a pinned observed-visit edition in §6/A-08. Correct source identity and rationale; acceptance below. |
| D-44 | Low (new) | **open** | Frame-step promise withdrawal has no §0 delta mapping. Record the scope correction; acceptance below. |

Counts across24 outcomes: **20 closed** (19 fixed,1 contest upheld), **3 open**, **1 unresolved to Beni**, **0 not-verified outcomes**. Separately, implementation/live evidence gaps are not verified and listed in block7; zero in the outcome column does not mean zero outstanding tests. Of the original21:20 closed,1 unresolved.

### New findings (unchanged D3 fingerprint)

**D-42 · Medium · Design · Public privacy copy misstates where its evidence lives.** Location: d3/data.js:103; top-level/d3 spec §3:155; rendered privacy frames9a–d (P-23 paragraphs/text). Expected: a dated pre-Play observation accurately identifies its public summary without claiming private live receipts are in the repository. Observed: “whose receipts are kept in the repository” contradicts the merged docs/moments-slice-4-spec.md:432–435, which explicitly says those receipts stay on Beni's Mac and none is committed. Committed observation receipts are stub-mode experiments, not that visit. Probe: P-23/P-27 DOM/deck, primary merged spec lines above; private directories never opened. Impact: readers/builders are directed to evidence that does not substantiate the stated visit; a future audit can wrongly treat stub proof as live proof. Acceptance: corrected dated wording across deck, data and9a–d distinguishes the public visit summary from local-only receipts, without copying a private ID/request URL; DOM/deck comparison passes and the repository pointer resolves to the named public summary. This does not demand rerunning the live visit or reopening its recorded ruling.

**D-43 · Medium · Design · A-08 is justified using the wrong evidence category.** Location: §0 D-26 row:16, §6 B3:243, §11 A-08:318 (both spec copies; also Pass2 D-26 row); H2 renders the same spec. Expected: distinguish the committed acceptance template, code that generates an authorized test edition, committed stub receipts, and a particular observed visit's external edition/receipts. Observed: observation/edition.ts is called a committed S4 acceptance edition and “pinned evidence of an observed visit”. It is a function that combines supplied templates/fixtures/authority; generate.mjs:19–25 writes the edition outside the repository. The actual committed template is moments-acceptance/edition.json; P-26 proves the first-commit fixture pointer is valid, so that is not the defect. Probe: P-26 exact git/source chain and §6/A-08, plus merged slice-4-spec:432–435. Impact: Beni is asked to choose validator scope on a false preserve-historical-evidence premise; a builder can confuse generated test inputs with preserved live proof. Acceptance: name the template/generator accurately, remove the observed-visit claim from these sources, state which future validation inputs Curated/All covers, and preserve actual historical receipts. Re-test the cross-reference and A-08 rationale. Fixture facts/no-result demonstration and D-22 contest remain upheld.

**D-44 · Low · Design · Unmapped withdrawal of frame-step capability.** Location: D2 studio.jsx's comma/period promise versus d3/studio.jsx:125, D3 §3:177; no corresponding entry in §0 or the three named PM corrections/two new questions (P-20 diff and P-23 frame12). Expected: every substantive delta is traceable under the stipulated change ledger, especially withdrawal of a capability previously listed as not verified. Observed: native-controls frame stepping is now expressly unpromised, a sensible fact correction, but absent from the change ledger. Impact: implementation planners can lose the old unverified shortcut test without an explicit disposition. Acceptance: log this capability correction and identify whether any specific shortcut is required in the future plan; preserve Q2 native controls. No new keyboard shortcut or redesign is requested, and no universal shortcut is proved by the drawing.

Appendix PM: no further items tagged to block5; block4 ledger above applies. Blocks completed: 1–5. Remaining: 6–7.

## Block 6 — Beni's Pass 3 list (completed)

Recommendations appear first; these are unanswered choices, not decisions made by this seat. Corrected facts do not reverse settled Q1–Q12, ST4 host or the specified/unrun16:9 run. A-07 asks for a new navigation scope ruling; A-08 asks for a future validation-input boundary. Neither can silently change an old ruling or historical evidence.

| Item | One-word choices | Question, independent evidence and consequence |
| --- | --- | --- |
| **A-01** | **Review / Accept** | Obtain an explicit policy reading of whether Play-as-agreement meets III.A.2's before-access requirement? P-19 primary clause, §3/§6B1 notice/full→short in-memory contract. Review recommended; builder also Review. Preserve Q8 memory meanwhile; no agreement-timing ruling by this seat. |
| **A-02** | **Define / Defer** | Designate Kickoff's proposed #terms wording and S7 access path? P-23 shows agreement statement plus YouTube link on9a–d; terms proposal includes personal/non-commercial/no-warranty wording that Beni or counsel may change. Define recommended; builder also Define. D-24 remains unresolved until this designation/adequacy basis is recorded. |
| **A-03** | **Retain / Reopen** | Retain GitHub Releases with corrected setting/limit facts and explicitly proposed non-overwrite, identity, Latest and verification obligations? P-19 setting/redirect; P-28 primary docs; §10. Retain recommended; builder also Retain. Host is already settled; this question exposes corrected premises, not permission for the reviewer to select another host or change settings. The plan must resolve and test its chosen proposal mechanism. |
| **A-04** | **Disclose / Defer** | Accept that an authorized export makes clips public before edition-PR merge, as stated in confirmation? P-23 frame13/deck distinguishes those two events, before-upload Cancel and partial public assets. Disclose recommended; builder also Disclose. No current export or blanket spend authority is conveyed. |
| **A-05** | **Propose / Set** | Keep10minutes a proposal until the operations plan decides the ceiling? P-23 frame11 marks proposal, unknown charge and no cancellation. Propose recommended; builder also Propose. Set would be a new timing ruling. |
| **A-06** | **Clarify / Defer** | Require an explicit applicability/disclosure answer for Article50 rather than treating the badge alone as that answer? P-29 four OJ citations support §6A1's note; actual legal scope/adequacy remains undecided. Clarify recommended; builder also Clarify. |
| **A-07** | **Global / Moments** | Extend prominent Privacy & terms access beyond the Moments tab, or keep it in every Moments state only? P-24 proves all19 reader states; III.A.2.a's persistent-access wording is broader than a Play-only path. Global recommended as a navigation choice that keeps access when a reader changes tabs and avoids a client-boundary ambiguity; this is an inference/recommendation, not a legal ruling. **Builder recommends Moments**, reasoning that the YouTube client is the Moments reader. Global would require an explicit scoped follow-up for settled Fixtures/Table chrome; it is not an unannounced D3 defect or a reopening of Q11 static home. |
| **A-08** | **Curated / All** | Apply Q12's / YouTube source-name validation to the production curated edition only, or also future S4 acceptance/test inputs? P-26 generator deliberately names synthetic sources unverified; All would require an honest synthetic label that still satisfies the suffix, without upgrading rights/content claims. Curated recommended; builder also Curated, **but its pinned-observed-visit rationale is rejected in D-43**. The defensible rationale is separating editorial validation from an explicitly synthetic verification harness. All is a real future-input scope choice; old live/stub receipts remain unchanged whichever answer is chosen. Q12 stays Yes. |

A-07 and A-08 are genuine open choices because neither outside-tab access nor the harness-input reach was expressly decided by Q11/Q12. Their answers can add a narrow implementation scope; they cannot retroactively pretend that D3 already draws global navigation, change Q12 to No, replace settled privacy home, or rewrite earlier visit receipts. All eight answers remain Beni's.

Appendix PM: no further items tagged to block6; PM17/PM20 implications are included above. Blocks completed: 1–6. Remaining: 7.

## Block 7 — Verdict and implementation-plan handoff (completed)

**Ready after named fixes:** correct D-42's public evidence attribution, D-43's generator/template/visit classification and A-08 rationale, and D-44's missing delta entry. Record Beni's Pass3 answers A-01–A-08, including unresolved D-24, before the implementation plan treats proposed publication/policy/operational choices as settled. This seat makes no approval or applicability decision. The pinned D3 remains unchanged; a corrected successor must identify its own revision and rerun the affected copy/source/delta checks.

### Verified facts

Target fingerprint/57-file manifest reproduce; historical42-file comparison changes only export metadata; D2 captures/report and settled question/decision cells remain intact. Main's named application paths have no drift from54f7804. Stub generation and acceptance build succeeded. Chrome155 app geometry matches measured canvas geometry at all requested widths/lenses and both app themes, including360/390/1000 receipt checkpoints. Nineteen privacy links are reachable in the static atlas. AX names68/0 unnamed, keyboard25/21/9, deck77 checked strings, picture bars, token contrast and both motion states reproduce independently. GitHub immutable releases are off, release list empty; sampled public tarball redirect/range semantics reproduce. Current permitted price column is before15 Oct; that is a committed price record, not a fresh provider quote. Primary policy, hosting and original-OJ citations were read; their application is not adjudicated. No Play, paid/provider/API transaction, private receipt access or publication occurred.

### Not verified — tests the implementation plan must own

These merge Pass1 §Not verified, Pass2's gaps and this pass's additional cases. Future tests need the actual built feature and, where specified, separate authority; this review does not authorize them. P-22 closes the old reader-breakpoint measurement gap for current-main ready views; it does not verify future generated-media/native-control integration or the complete app lens × theme × tab matrix.

1. **K3 host lifetime/local-media integration.** With a valid loopback clip, record one video's identity, parent, src, poster/preload and network across ready/play/pause/ended, Cinema entry/exit, theme/lens/tab changes, next/previous and Retry. No fetch before Play, remount/reparent or second active player; real video object-fit:contain and stable queue/item. Static PNG containment is not this proof.
2. **Native controls and focus.** Actual Play focus to video, Pause focus retained, Retry destination, Cinema Escape returning to surviving opener, native-fullscreen Escape precedence, play rejection, play/pause/ended/error/volumechange state synchronization and audible Replay. Verify shortcuts only if explicitly required after D-44's disposition; comma/period stepping is currently unpromised. Test the target browser matrix and native-controls footprint.
3. **Recovery beyond historical code4.** Induce real abort/code1, mid-stream network/code2, supported-container decode/code3 and load timeout on scratch loopback. Assert each state/sentence and one new attempt on Retry. Pass1's code4 experiments are historical and were not replayed here; no Play was permitted.
4. **WebKit release MP4.** Separately authorized actual public MP4, current octet-stream MIME/range behavior, desktop Safari/WebKit and iOS playback/seeking. Tarball206 and canonical-host identity do not prove codec/MIME compatibility.
5. **Built standalone privacy page.** JavaScript off, both system schemes,390/1000 widths; no hashed-bundle dependency; relative links work under /kickoff/; own CSS tokens equal committed app blocks; fonts/disclosure/stamp correct. JavaScript-on valid/invalid shared theme, storage access throwing, shared-versus-Broadcast-only choices and no new storage keys. Implement A-07's chosen access scope and A-02's designated terms; verify keyboard access from every relevant state/tab.
6. **Built Studio assistive walkthrough.** Screen reader announces labels/groups/questions/pressed answers and budget/billing/recovery context; actual Tab routes25/21/9 plus all-Clear/enabled Keep before Discard, visible focus, disabled controls, error announcements and context preservation. Atlas CDP names do not prove spoken usability.
7. **Specified16:9 run.** Preserve the existing locally cropped768×432 K0 → one5s480P run → ffprobe dimensions/cost receipt → ruled pass/fail default. Still unrun; fresh explicit paid GO required. Refresh applicable estimate on/after15 Oct rather than treating the earlier $0.075 as a current quote.
8. **Release setting and replacement.** Separately authorized suitable test repository: enabled/disabled setting, publication/immutability timing, attempted replace/delete and detection failure under a stable canonical URL. Test partial-public-upload recovery together with the selected immutable-release workflow; immutable publication can prevent adding later missing assets. The plan must reconcile those semantics rather than inherit a proved state machine from frame13.
9. **Export identity/idempotency/lifecycle.** Two same-day kept sets, same-set retry, retry on a later day, partial asset failure, PR-open failure/crash, Cancel before upload, draft-without-upload, exported-once ledger transition and historical PR association. Persist identity inputs; address shortened-hash collision/asset naming and latest-release behavior. Explicit API string make_latest=false; media tags kept separate from product v-tags. No release/tag/PR created here.
10. **Offline build and bounded verify-media.** Build with all external network refused; schema/Q12 scope applied according to A-08. Publication check only for bounded new/changed records; HTTP/size/fetched-byte SHA assertions, outage/expiry failure and unchanged canonical URL with replaced bytes. State how same-URL replacements are tested/detected outside a changed-address-only trigger. A green offline schema build is not remote-media proof.
11. **Runtime filtering/save/spoiler/queue.** Every filter, generated no-fixture Newest placement, saved-only, history/Undo/shuffle, next/previous/gallery/Cinema return; Generated survives spoiler-light and fixture facts never gain fabricated results/times. Future complete lens × theme × relevant-tab/browser matrix and generated reader states remain unverified.
12. **Studio operations/persistence.** Unanswered/part-answered/all-Clear/kept/discarded; disabled budget/db states; registry selection; estimate replaced by billed dollars without treating measured duration as units; attestation write/persistence; free download retry versus charged regeneration; result-expiry window from authorized current documentation and actual billable header from authorized evidence. No automatic paid/moderation retry; no live provider/DB behavior proved here.
13. **Evidence and publication-day refresh.** Resolve D-42/D-43 without copying private IDs/URLs or editing historical receipts. Public merged S4b summary concerns named loopback test visits, not all curated edition IDs or Pages; any future S7 live before/after-Play/curated-ID proof needs separate authority. Refresh manifest/head, setting, redirects, source references, privacy date/version and applicable prices at publication. Cookies/subprocessors/provider hosting rules beyond the permitted sources and EU applicability/adequacy are not verified by this pass.

No standalone npm test or additional typecheck command was run: no tracked source was changed, and the authorized acceptance build already ran its TypeScript build. Nothing here claims a general app regression suite or CI/Pages rerun. Report/probe/evidence files are local review output only.

### Completion

Blocks **1–7 completed**; none not reached. Appendix PM15–PM20 all checked after the block4 independent probes; PM18's snapshot doubt was independently overturned, PM16 confirmed. No other seat was messaged. Final integrity/cleanup is recorded below after stopping the servers and removing the detached review worktree.

### Final integrity and cleanup — P-30

D3 manifest rechecked12/12 OK; evidence/P-30-folder-manifest.sha256 is byte-identical to the initial manifest and retains hash540e340153330170d1e3d71fc15a580057b1217dac842465f6fd950b365036f6. Original d2-cold-review.md still matches its attached sealed copy, SHA-256 dea43233e41a37fe49e6ad03cbc5ef1912051a96bee38307b8d2b7c8cf276aa0. Detached review worktree status/diff were empty before removal; original checkout still had only its two pre-existing untracked skill directories.

Verified Python PIDs23633/23634 served exactly the named folders on8765/4318; stopped both. Every probe closed its owned Chrome in finally; final process check found none of the review's Chrome profiles running. Supplied git worktree remove --force command succeeded; worktree path no longer exists. Both port listener checks are empty. Evidence/P-30-cleanup.json records these results. Report, probes, captures and stub output remain solely in the local review folder; no design/repository source file changed and nothing was posted to GitHub. Cleanup complete; work stopped.
