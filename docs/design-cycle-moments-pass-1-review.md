# Moments D2 — Codex's Pass 1 cold review (archived Mon 12 Oct 2026, TZ=America/New_York)

Written by Codex (GPT-6.1 Sol Extra High) on Thu 8 Oct 2026 against the D2 export (manifest `9e5663a3…3748`). Verdict: ready after named design fixes; 5 high, 14 medium and 2 low findings, D-21 to D-41, and adjudication items A-01 to A-06. Its evidence (probe scripts, captures, JSON) stays local at `~/kickoff-d2-review/`; nothing from it is committed.

---

# Moments D2 — Pass 1 cold design review

Seat: Codex, GPT-6.1 Sol Extra High (requested seat; model configuration not independently observable).
Date: Thu Oct  8 19:39:31 EDT 2026
Target: /Users/benicheni/Moments Studio admin surface design/
Manifest SHA-256: `9e5663a3ff4f879aba354f01e951757feb45d02ceb1c73b57ff6d59b5dc83748` (42 files, identical to PM manifest; no changed files).
Worktree SHA: `0e66bad69314aba5e6b4bdc0266732aa3fe9bfa5`.
Browser: Codex in-app browser, viewport 1000 × 900, DPR 1; engine version not exposed by its read-only DOM API. Supplementary disposable headless Chrome155.0.8059.40 (CDP pipe) for scratch media and reduced-motion confirmation.
Runtime: D2 rendered with unpkg React/ReactDOM/Babel and local font mirror; `document.fonts.status=loaded`. Google Fonts is an app disclosure fact, not proof the canvas requests those fonts.
Snapshot drift: only generated src/data JSON changed since 54f7804; no CSS/component/script/public/package drift. PR #175 OPEN, mergeCommit null. Content policy read from origin/claude/moments-slice-4-record.

Review complete: all seven blocks appended. Target integrity rechecked; artifact and repository files unchanged.

## Block 1 — the record (completed)

### Evidence index

- **P-01** — Target manifest and repository identity. Environment: local macOS, detached origin/main. Commands: fetch; worktree add --detach; git log -4; git status --short; git diff --stat 54f7804 HEAD -- src public index.html scripts package.json; gh pr view 175 --json state,mergeCommit; SHA-256 manifest generated in byte-sorted relative-path order. Expected: target identifiable and drift separated. Observed: hash matches; clean worktree; three generated data files differ; #175 open. Capture: `manifest.sha256`; limits: no deployed-app test.
- **P-02** — D1/D2 record. Commands: diff -r d1 d2 and diff top-level specs. Expected: decisions-log changes only. Observed: canvas/reader/data/studio/spec change for Q1–Q12, host and ratio probe decisions; CSS and PNG bytes identical; image-reference d1→d2 and H2 spec-reference are mechanical revision changes. No unlogged substantive change established. Capture: `evidence/P-02-d1-d2.diff`, `evidence/P-02-spec.diff`.
- **P-03** — D2 DOM text and frame sizes. Environment: IAB, 1000 × 900, DPR 1, fonts loaded. Steps: evaluate every `.frame[data-screen-label]` box and scrollWidth, then read status/recovery/notice/privacy/provenance/Studio paragraphs. Expected: verbatim copy and honest captions. Observed: all 34 named frames have scrollWidth equal to their stated 360/390/1000/1280 width; no actual video elements; text results below. Capture: `evidence/P-03-dom-notes.md`. Limits: canvas-wide page intentionally lays several fixed-width frames side by side; page-level overflow is not application overflow. Native-media state transitions cannot be inferred from screenshots.

### Findings

**D-21 · Medium · Design · A1 unanswered disclosure requirement.** Brief A1 explicitly asks whether the Generated badge also serves the lighter fictional-work disclosure if Article 50(4) applies. D2 spec §§1–7 and canvas have no answer or applicability caveat (search for Article, EU, 50(4), disclosure; none). The badge is present as text; that alone does not answer the brief. Probe P-02/P-03. Builder impact: must guess the intended disclosure obligation. Acceptance/overturn: provide a source-backed applicability/disclosure note or trace an existing answer to the unchanged target. No legal-adequacy ruling is made here.

**D-22 · Medium · Design · Illustration honesty is incomplete.** Frames 1a–c and 7a–b show invented record hashes, kept/attested dates and a published prompt with no ILLUSTRATIVE caption; `d2/data.js:6–15` is sample data. The brief explicitly says §7.3 record values are illustrative. Frames 1a–c also display real clubs and a real competition (`data.js:24`), contrary to the brief's mock-content restriction, although the source is labelled synthetic. P-03 finds no ILLUSTRATIVE in 1a/7a/7b. Impact: a builder may copy a synthetic attestation or permission as verified provenance; the illustration teaches an excluded content pattern. Acceptance: visibly caption invented record fields and use permitted mock content, or supply the exact evidence and a Beni exception for those fields/content. A global statement that everything labelled ILLUSTRATIVE is invented does not label these values.

**D-23 · Low · Design · Small copy-deck discrepancies.** Generated source line DOM reads `Kickoff Studio · Generatedfictional players · no fixture`, missing the separator after Generated (spec §3; reader.jsx:53). Credit banner DOM omits the quotation marks around the fal message (spec:118; data.js:108 and studio.jsx:97). Export addresses substitute concrete values for placeholders as expected. P-03. Impact: verbatim builder handoff is ambiguous. Acceptance: normalize rendered DOM strings and spec strings after substituting dynamic values; preserve punctuation. Recovery, status, full/short notice, privacy, checklist-rule, photo, attestation-preview and export-upload sentences otherwise match the deck.

### Coverage and interpretation

| Brief obligation | Answer in D2 | Boundary/gap |
| --- | --- | --- |
| A1 | KindBadge from record.kind, ink inverse | Disclosure question D-21; honesty D-22 |
| A2 | Native controls plus Kickoff actions, no poster, focus to video | Dynamic behavior unproved; block 3 |
| A3 | Sound on, native mute | Q5 preserved |
| A4 | Reader bars, conditional 16:9 Studio default | Run specified and unrun |
| A5 | Three hosted recoveries plus aborted/timeout mapping | Local browser probe block 3 |
| A6 | Prompt/model/pin/parent/attestation/file/sound provenance | Illustrative caption missing |
| A7 | Studio category and authored-last Newest copy | Filters static; behavior unproved |
| B1–B3 | Notice, privacy page, source-line/validation intent | Publication/source gaps block 2 |
| C | All 14 job labels and both banners; composer/review/export | Recoverable-download case block 5; several alternate states only inventoried |
| D | Twelve motion candidates declined | Runtime check block 7 |
| Artboards 1–14 | All present, H1/H2 also present | Exact notice matrix uses 360 short rather than full |
| Handoff 1–7 | Inventory/mapping, tokens, deck, motion, artboards/contrast, recommendations, Q1–Q12 decisions log | Some declared states are not drawn or interactive; list in Not verified |

Verified facts: the two D2 spec files are byte-identical; all requested artboard groups exist; D1→D2 CSS and image bytes unchanged. Design interpretation: this is a static state atlas, not a playable prototype. Proposed improvement: make that evidence boundary explicit wherever behavior is claimed. PM1 confirmed as D-21. Block 1 complete; blocks 2–7 pending.

## Block 2 — S7 publication duties (completed)

### Evidence index

- **P-04** — Primary policy read. Read all III.A and III.F.2.a at [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies), and the embed-size/overlay portions of [Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality). Expected: compare every applicable requirement, not only the brief's two elements. Observed: matrix below. Capture: this matrix and source URLs; limit: textual design review, not a legal-adequacy determination.
- **P-05** — Code disclosure audit at 0e66bad. `rg -n 'localStorage|sessionStorage|document\.cookie|cookieStore|indexedDB|caches\.|sendBeacon|analytics|gtag|google-analytics|fetch\(|XMLHttpRequest|https?://' src index.html public`; read theme.ts, momentsSaved.ts, index.html. Expected: three app keys, no app cookie/analytics/beacon access. Observed: only theme's two keys and momentsSaved's one; no app cookie/analytics/beacon access found. Fonts stylesheet is unconditional in index.html:11–17. Capture: `evidence/P-05-storage-network.txt`. Limits: static audit cannot establish third-party cookie behavior or guarantee a fresh network request on every cached visit.
- **P-06** — Supplied public receipt reference. `gh api repos/BeniCheni/kickoff/issues/comments/6043493399 --jq '{html_url,body}'`. Expected: before-Play network evidence. Observed: comment is a base64url ruling, references visit/version, and contains no before-Play network result. Capture: `evidence/P-06-public-comment.json`. No private receipt sought. Beni's stated 7 Oct observation is testimony, not a reproduced network trace.
- **P-07** — Notice geometry/DOM. IAB 1000 × 900/DPR1. Read player and notice getBoundingClientRect and the Play aria-describedby. 8a/390: player 350 × 200, notice 350 × 55.195, gap 179.5px. 8b/360: 320 × 200, notice 320 × 18.398, gap 179.5px. 8c/1000: 960 × 540, notice 449.797 × 36.797, gap 58px. Expected: ≥200 × 200, no intersection. Observed: all pass. Notice exists only in 8a–c; three duplicate `yt-notice` ids resolve to the same first description in this atlas. Capture: `evidence/P-07-geometry.md`. Limits: ready-state drawings, no live iframe; 360 full notice not drawn. Duplicate ids are an atlas accessibility limitation, not proof the one-player app duplicates ids.

### Policy matrix (design evidence; applicability inferred for an embed-only client)

| Clause | D2 result |
| --- | --- |
| III.A.1 | YouTube terms link exists on 9a–d; own terms statement/home absent: D-24 |
| III.A.2 opening | Play-agreement mechanism specified; scope and timing need Beni adjudication A-01 |
| III.A.2.a | Privacy access present at Play, absent gallery/global chrome: D-25 |
| III.A.2.b–c | API Services statement and Google privacy link present |
| III.A.2.d–e | Local preference/reference purposes and host/font/player recipients stated; blanket storage wording needs care |
| III.A.2.f–g | Third-party ads/cookies and local storage disclosed; no extra omission established |
| III.A.2.h–i | Authorized Data conditions not triggered by this no-OAuth client; no revocation/contact duty inferred here |
| III.F.2.a | Source naming promise not demonstrated in mocked card/stage/Cinema: D-26 |

The agreement clause says “before users can access”; the design gates Play but exposes browsing first. The own-terms clause says “own terms of use”; a privacy paragraph is not identified as that surface. These word/mechanism mismatches go to Beni, without a legal ruling.

### Findings

**D-24 · High · Design · S7 has no defined own-terms statement.** Spec:110 and 9a–d link YouTube's terms and describe agreement from Play; there is no Kickoff terms-of-use surface or designated terms statement. III.A.1 separately requires the client's own-terms statement. P-04/P-03. Impact: the builder would ship the public design without an answer to a publication requirement. Acceptance/overturn: identify the intended own-terms statement and access path, and obtain the primary-source/adjudication basis that its location satisfies the clause. This does not demand a new route or reopen the settled privacy-page choice. Adjudication A-02.

**D-25 · Medium · Design · Privacy link is not available throughout the reader.** P-07 finds privacy.html links only in 8a–c; cards 1a–c and ready generated stage/Cinema have none. III.A.2.a is broader than a Play-only link. Expected: a builder can preserve prominent access in every reader state. Observed: global access is unspecified. Impact: readers must navigate to a YouTube action to find the policy. Acceptance: DOM access test from gallery, empty/filtered state, generated and YouTube stage, Cinema, with keyboard; or source-backed adjudication overturning applicability.

**D-26 · Medium · Design · B3 source attribution claim does not match the canvas.** Spec:181 says cards and stage name `<Channel> / YouTube`; `data.js:22` instead names `S4 test source; content unverified`. DOM in 1a/8a/8c contains that source name and no `/ YouTube`; the card's visible link text also omits YouTube. P-03/P-04/P-07. A notice naming YouTube in 8 does not repair the card illustration. Impact: builder cannot validate the promised treatment from this target. Acceptance: permitted fictional source labels visibly identify YouTube on card, stage and Cinema, alongside watch links; verify Q12's chosen validation rule in the future implementation. Current validate-moments does not yet contain that rule; that absence is expected before implementation, not a second app defect.

**D-27 · Medium · Design · Static privacy styling/theme contract is missing.** Spec:180 chooses `public/privacy.html`, both themes, readable without JavaScript; canvas:154 claims static readability but `reader.jsx:232–248` renders React inside the atlas. App CSS is Tailwind/Vite input and the local-only DS cannot be published. Neither spec defines a stable public stylesheet/token source, font links nor theme selection/fallback. P-05/P-02. Impact: S7 builder must guess how this page matches the app without a hashed stylesheet and whether to read `kickoff-theme` versus the Broadcast key. Acceptance: handoff specifies static asset/token ownership and theme/default/storage behavior; verify exported privacy.html with JS disabled, both themes and no hashed-bundle dependency. Existing three-key list remains accurate if existing keys are reused; a new key must be listed. The dated v0.5.2 stamp is currently accurate as an audit snapshot, but must be refreshed or clearly retained as historical at S7; no release number is assigned here.

Verified facts: extra III.A.2.f–g elements are already covered, so PM3's suspected additional omissions are overturned for ads/cookies. PM2 confirmed as D-24 (legal adequacy unresolved). Policy wording on fonts overstates network frequency: cache can satisfy a font request; source establishes Google dependency/contact opportunity, not a fresh contact on every load. “No cookies” means Kickoff's own code, not YouTube's behavior after Play. App source audit supports three keys and no app analytics. Before-Play live proof is Not verified because the supplied public comment is not that receipt. Blocks 1–2 complete.

## Block 3 — reader R1/R2 (completed)

### Evidence index

- **P-08** — Layout translation, media markup and keyboard. IAB 1000 × 900/DPR1, unchanged D2. Steps: read computed grid columns, bounding boxes, image object-fit, card padding; click 2a Play; press Escape on 3a Exit Cinema. Expected: match app layout and distinguish simulation from behavior. Observed: 2a stays ready, focus remains Play, zero videos; Escape does not exit atlas Cinema. Cards at 390 are 350px wide and unclipped, but Poster/Broadcast body padding resolves 24px versus app mobile 14px. 2e layout width740 but tracks480+300+28=808; player480×270. 3a layout960px single column/player960×540. Ratio boards 5a/5b/5c correctly measure 320×200, 350×200, 632×355.5. Pictures at data-ratio=16/10 resolve object-fit:fill. Capture: `evidence/P-08-reader-geometry.md`. Limits: no event-bound media; synthetic/mock drawings are not K3 or player continuity proof.
- **P-09** — Browser-reported MediaError. Command: `node probes/media-errors.mjs`; Node24.15, installed headless Chrome155.0.8059.40, CDP pipe, disposable profile, scratch HTTP bound only to 127.0.0.1. Fetch guard permits only scratch origin; DNS denies other hosts. Test a real 404 and eight non-video bytes served video/mp4. Expected: record error codes without prescribing them. Observed: both code4, networkState3/readyState0; 404 “Format error”, bytes DEMUXER_ERROR_COULD_NOT_OPEN. No external page request observed. Capture: `evidence/P-09-media-errors.json`; script: `probes/media-errors.mjs`. Limits: tests initial load failures, not interrupted transfer/code2, corrupted valid stream/code3, Safari or Firefox. No provider or embed contacted.

### Findings

**D-28 · Medium · Design · Desktop/mobile CSS translation does not reproduce the app.** `d2/moments.css:18,29,96,104–110` loses app `src/index.css:201–203`'s gallery outdent, and places the Cinema 888px container rule before a later equal-specificity single-column base rule. P-08: 2e uses a 740px layout with 808px tracks; 3a/8c remain one column at1000. App's separate media rules at324–326 and369–370 put both views side by side. Lens-qualified card rules at44 also outrank the mobile padding rule at101; Poster/Broadcast cards retain24px instead of app14px. Expected: the 887/888 and760 translations and persistent780px header reproduce shipped geometry. Observed: numeric breakpoint values match, cascade/outdent do not. Impact: builder accepts/rejects layouts the application will never render. Acceptance: compare app and canvas box/grid/padding measurements at360/375/390/760/761/887/888/1000, all lenses/themes. Preserve the settled breakpoints. Studio-only1040 query is new admin styling, not reader drift.

**D-29 · Medium · Design · Selected-bars illustration stretches the subject.** Spec:153 correctly derives the bars, and §6 requires contain. However `d2/moments.css:121` forces fill for every16/10 image, so 2b–e/3a–b/5A stretch to the entire anchor; 5bA has no15px side bars and5cA no31.6px bars. P-08 computed fit=fill. For optionC, a16/9 clip also cannot fill a320×200 box without distortion: at360 the200px minimum leaves10px top/bottom bars. Impact: the picture contradicts the decided outcome and makes the ratio tradeoff unreviewable. Acceptance: at320×200,350×200,632×355.5 verify aspect-preserving image geometry, bars0/15/31.6; atC360 verify the200px-floor consequence. A screenshot mock can illustrate this without playing a file; no replacement layout is provided here.

### Verified facts and boundaries

Box arithmetic from app rules: available width at1000 is1000−40−300−28=632; height632×9/16=355.5;16/10 picture width355.5×1.6=568.8; side bars(632−568.8)/2=31.6. At390:350×9/16=196.875, floor200; picture320, bars15. At360:320×9/16=180, floor200; picture320, bars0. Ratio board measurements agree; actual desktop stage/Cinema boards do not.

KindBadge is conditional on `moment.kind` (reader.jsx:39), appears as DOM text on card/stage/Cinema, and generated spoiler-light keeps STUDIO/provenance/badge (20–35,127–143). Newest/Studio filter copy is present. Filters, Save and queue controls are static; changing a select does not prove filtering/order persistence. Spec gives play/pause/ended/error events plus volumechange in the motion table, but no live event integration. Ready drawings contain no src/poster/preload video because they contain no video at all; CSS video contain at118 is an intent, not running K3 proof. Each frame renders its own PlayerBox; one lifetime host across state and Cinema cannot be measured here.

Focus contract: spec176 chooses video on Play, button on Kickoff Pause, existing Escape behavior. Current app host/session code supplies a surviving opener/fallback on Cinema exit (`MomentsPlayerHost.tsx:368–374`) and sentinel handling. D2 cannot exercise those paths, Retry destination, native-fullscreen Escape ordering, play-rejection feedback or native-control synchronization. Exact implementation tests are listed below.

PM4: code4 observations confirmed, but the suggested wrong-copy defect **overturned**: spec74–76 explicitly groups not-supported/not-found, and its generic code4 sentence fits both observed failures. Do not relabel HTTP404 as code2 or arbitrary undecodable bytes as code3. Blocks1–3 complete.

## Block 4 — ST4 GitHub Releases premises (completed)

### Evidence index

- **P-10** — Public release transport, no upload. `gh release view --repo cli/cli --json assets`; select gh_2.102.0_linux_amd64.tar.gz (15,319,960 bytes). `curl -sIL <canonical release URL>` and `curl -sL -r 0-1 -D - -o /dev/null <URL>` (30s ceilings). Expected: observe actual redirect/MIME/range/expiry. Observed: github.com302→release-assets.githubusercontent.com; final application/octet-stream; range206 with Content-Range bytes0-1/15319960 and length2. Signed se=2026-10-09T00:25:38Z; response Date23:46:05Z: 39m33s remaining. skt23:25:33Z→se is60m05s, not a permanent asset address. Capture: `evidence/P-10-public-release-assets.json`, `P-10-head-headers.txt`, `P-10-range-headers.txt`. Limit: tarball, not MP4; no WebKit playback; signed lifetime is this response only.
- **P-11** — Repository release state. `gh release list --repo BeniCheni/kickoff --json tagName,isLatest,isDraft,isPrerelease` gives[]; git tag gives14 v-tags v0.2.0–v0.5.2. `gh api repos/BeniCheni/kickoff/immutable-releases -i` gives200 with enabled:false/enforced_by_owner:false. Expected: verify setting instead of assuming. Capture: `evidence/P-11-release-list.json`, `P-11-tags.txt`, `P-11-immutable-setting.txt`. Limits: read only; no setting changed.
- **P-12** — Host docs/build source. Read [release management](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository), [about releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases), [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [large files](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github), [repository limits](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits), and [release API](https://docs.github.com/en/rest/releases/releases). Read package.json build, scripts/validate-moments.ts:1–3, ci.yml:25/pages.yml:53 and CLAUDE.md release-management rules. Expected: separate documented guarantees from chosen policy. Observed below. Capture: source URLs/report; limits: no upload, publish, tag or build network test.

### Findings

**D-30 · High · Design · Immutability premise is false for this repository.** Spec:126,205; frame13/studio.jsx:169 call assets immutable and promise re-export never overwrites. P-11 confirms immutable releases disabled. GitHub's immutable behavior depends on enabling it and publishing the release; ordinary assets can be replaced/deleted. Expected: enforce the decided non-overwrite guarantee, or label it as an application policy with a proof. Observed: a guarantee based on a setting that is off. Impact: published clip identity and hash can change under a supposedly stable URL. Acceptance/overturn: separately authorized setting verification plus negative replace/delete evidence in an appropriate test repository, or enforce/prove application identity policy and correct claims. Leave the host decision to Beni: A-03.

**D-31 · High · Design · Export confirmation falsely promises no publication.** Frame13/studio.jsx:169 uploads public release assets to obtain anonymously playable addresses;180 says “Nothing is published by this action.” Draft PR status does not make a published release asset private. Keeping the release itself draft would also defeat public playback/validation until it is published. P-12 public-release/draft access semantics. Impact: operator can disclose clips before the edition PR is accepted under a false reassurance. Acceptance: confirmation accurately distinguishes public-media publication from edition merge, with per-export authorization and observable cancellation/failure behavior. Preserve settled draft PR and host decisions; adjudicate the consequence A-04.

**D-32 · Medium · Design · Privacy host list misses the observed release redirect.** Spec:111,205/data.js:100 name objects.githubusercontent.com; P-10 resolves release-assets.githubusercontent.com today. GitHub remains the named provider; “no new third party” is not disproved merely by another GitHub-controlled domain, and subprocessors were not examined. Impact: the promised exhaustive request-host description is false and may mislead future host allowlists. Acceptance: source-backed canonical/provider wording covers actual redirects without pinning a transient signed URL; re-run headers before publication. Do not put a signed redirect into source.identity.url.

**D-33 · Medium · Design · Date-only export identity and Latest behavior are unspecified.** Spec:205 chooses one release per export with media-<date>; studio.jsx:173 also uses a date-only branch. Two exports the same day have the same tag/branch; with immutable releases they cannot add new assets after the first publication. P-11 confirms no releases; P-12 says newly published releases default make_latest=true. Non-v media tags also enter the tag inventory CLAUDE.md uses as release truth, though that does not itself change semver. Impact: second export can fail/collide, and repository Latest can label a media delivery as the product release. Acceptance: dry-run two same-day exports and retry a partial export; distinct identities/idempotency, explicit Latest policy, and documented separation of media tags from v-tags. No branch/release was created to probe this.

**D-34 · Medium · Design · Full clip validation is placed in every build without a boundary.** Spec:126,205/studio.jsx:169,175 put HTTP200, size and SHA-256 checking in validate-moments. package.json invokes it before every build/build:single; CI and Pages both build. Verifying a remote SHA requires body bytes or a separately trusted checksum; a HEAD alone cannot establish it. Expected: handoff defines bounded publication verification versus deterministic schema validation. Observed: no caching/offline/failure rules or separate command, implying every build fetches all clips. P-12. Impact: outage/expiry/large editions block unrelated builds or create network cost/latency. Acceptance: prove chosen verification lifecycle with an external-offline build, a changed remote file, and a bounded publication check. This is a design consequence; current validator is local-only and has no such fetch.

**D-35 · Medium · Design · Host rationale conflates recommended and hard size limits.** Spec:205 says Pages and repo “both carry a 1GB ceiling.” Pages publication has1GB maximum; source-repo1GB is recommended. General repo guidance recommends ideally<1GB, strongly<5GB; current repository-limits guidance lists10GB on-disk recommendation. Ten-MB clips times100≈1GB is sound sizing, but not a shared hard ceiling. P-12. Impact: false premise under the settled host choice; Beni should receive corrected evidence, not a reviewer-selected host. Acceptance: distinguish limits/recommendations and repo-history accumulation in the rationale. Adjudication A-03 covers retaining the host after corrected premises.

Verified facts: a sample release asset supports206 seeking bytes; release assets are outside Git tree weight. GitHub documents1000 assets/release, each<2GiB, with no total release-size/bandwidth quota. That is not a service-level or unlimited-media guarantee; general terms still apply. Git LFS is not served by Pages per its documented Pages support. Declined Supabase Storage reasoning and all provider billing rules were not refreshed because requests to Supabase/fal are prohibited. Browser-followed redirects and WebKit octet-stream MP4 playback stay unverified.

PM5→D-32; PM6→D-30 (setting independently measured off); PM7→D-33 (14 tags rather than only v0.4.0 onward); PM8→D-34; PM9 binary MIME confirmed, WebKit consequence Not verified. Blocks1–4 complete.

## Block 5 — Studio ST3 (completed)

### Evidence index

- **P-13** — Prices, sizes, caps and policy source. Read architecture review8.1/8.2/8.3,11.4/11.6,15.1–15.14, AppendixS:1290–1318, against studio.jsx:5–185 and spec117–128. Recompute cost table/bars in Python. Expected: distinguish observed, assumed, derived and proposed. Observed: now.051×3+.225=.378; after.051×3+.375=.528; session1.058→$1.06; remaining6.742→$6.74; largest15%, session11.333%+6.3%, balance71.953%. All shown cap math agrees to display precision and stays below1.50/6/9.37. After15Oct largest25%, session1.208, balance6.592 are derived, not measured. Capture: `evidence/P-13-costs.json`. Limits: AppendixS is the authorized public summary, not rerun provider billing; no fal/Supabase request.
- **P-14** — Studio rendered state/accessibility. IAB DOM of10/11/12/13: enumerate tr[data-state], pill voices, seven composer inputs/selects/textareas and five checklist groups, banners and Keep.disabled. Expected: full state coverage, names, honest Keep gating. Observed:14 labels with neutral refused/ink exported; both banners; Keep disabled for1Present/1Unsure; seven controls have no label/aria-label/aria-labelledby, all five checklist groups unnamed. Capture: `evidence/P-14-studio-dom.md`. Limits: static Segs; changing answers does not execute a state machine. No paid action or upload pressed.

### Findings

**D-36 · Medium · Design · Ten-minute timeout presented as settled behavior.** Spec121/studio.jsx:89 fix the ceiling at10minutes. Review8.2:596 only calls it the Studio's ceiling;8.1:579 mentions a15-minute course figure, not a Kickoff ruling. No Q-row decides10minutes. P-13. Impact: ST1/ST3 builder silently adopts an operational timeout without authority. Acceptance: label10minutes a proposal and decide it through the appropriate plan, or cite the existing authoritative ruling. Preserve unknown billed cost and never equate timeout with cancellation.

**D-37 · Medium · Design · Completed/download-failed recovery is missing.** Review8.2:597–598 requires a completed job whose download failed to remain recoverable until result expiry and say so. Jobs row83 is generic completed;84 jumps to downloaded; inventory/deck omit retry-download, expiry and this substate. P-13/P-14. Impact: builder guesses whether to regenerate/pay again, lose the result or retry the free download. Acceptance: draw/specify the recoverable and expired outcomes, remaining-window/unknown-expiry copy and the action that retries download without another generation.

**D-38 · High · Design · Export photo reassurance exceeds the ruled privacy boundary.** Spec128/studio.jsx:166 says “Photographs: none leave this Mac.” Composer36/spec122 says fal receives stripped copies; review11.4 permits those copies and excludes photos from Git and Supabase. P-13/P-03. Impact: an operator reading the export surface receives an unqualified false privacy promise. Acceptance: the export statement is explicitly about what the PR/media host receives, while the composed-upload disclosure remains accurate; no statement implies stripped copies stay local. No photo was uploaded in this review.

**D-39 · High · Design · Studio fields/checklist have no accessible context.** Composer controls atstudio.jsx:40–51 use sibling spans instead of associated labels; Seg at25 has role=group but no name; Review141 repeats Clear/Present/Unsure five times in unnamed groups. P-14 finds seven empty label sets and five unnamed checklist groups. Expected: assistive users can identify model, each keyframe, motion prompt, seed and the checklist question for each answer. Observed: choices/values alone. Impact: core creation/policy-review journey is inaccessible to a screen-reader user. Acceptance: inspect accessibility names in the new target and perform keyboard/screen-reader walkthrough; every field/group/question and selected answer must be understandable independently. This finding targets the supplied design markup/handoff, not unbuilt Studio code.

**D-40 · Medium · Design · Media duration is asserted as billed units.** Frame12/studio.jsx:127 says$0.225 for15.084 billable seconds “from the response header.” AppendixS:1305 establishes15.084s output duration and$0.225 cost; the price is$0.015/s. P-13 calculates15.084×.015=.22626, not.225. Nothing read establishes the header had15.084 units. Impact: builder may reconcile by decoded duration instead of actual units and preserve invented evidence. Acceptance: trace billable-unit count to an authorized public record, or label it unknown/illustrative and separate output duration from units. No private provider receipt is required from this seat.

### Verified facts, interpretation and PM checks

The5s480P$0.075 price is **measured**, not merely15s scaling: AppendixS:1303 explicitly records four5s runs at$0.075 each;1304 groups four more at$0.300. PM10 **overturned**. $0.125 after15Oct is a documented/derived rate, not a live measurement. K0$0.051 rounds the measured.0506–.0513 range. K1/K2$0.051 assumptions are explicitly unmeasured; their conservative estimate can exceed the measured end-to-end.30–.37 summary without contradicting it. 10.0/10.4MB,15.084s and768×480 trace to AppendixS1305;20.4MB is a sum. The copied generated SHA and attestation are illustrative, D-22.

Model selectors are drawn from registry rows, never text inputs. The actual registry is unbuilt; no typed endpoint override is drawn. Fourteen states and both Studio-level banners are present. The database banner matches8.2's refuse-before-ledger-write/local-cache rule; the credit banner uses the exact observed fal error and ink voice. Balance$0.00 is illustrative, not the provider's lock threshold;8.1 does not say the lock starts exactly atzero. Neither banner authorizes automatic retries/top-ups.

Q10's five-Clear rule is explicit, with Present/Unsure blocking Keep. The part-answered frame demonstrates disabled Keep; all-Clear enabling, unanswered, kept/discarded and attestation persistence are only specified, not interactive/drawn variants. The attestation preview is labelled “written at Keep” and should remain a preview until all answers clear. Native comma/period frame-scrubbing claim (studio.jsx:123) is unverified without a valid local-video shortcut test. “16:10 is what every clip so far measures” should be scoped to the selected H3 image-to-video series: AppendixS also contains other model/aspect outputs.

PM11→D-36; PM12→D-37; PM13→D-38. Blocks1–5 complete.


## Block 6 — tokens and contrast (completed)

### Evidence index

- **P-15** — Independent WCAG contrast calculation. `python3 probes/contrast.py`, parsing current src/index.css root/dark values, standard sRGB luminance and alpha compositing; IAB read-only getComputedStyle confirms H1's canvas aliases against those values. Expected: reproduce §5 and add omitted pairs. Observed: all actual new text pairs pass4.5; pending dark11.21, not spec8.23. Capture: `evidence/P-15-contrast.json`, `P-15-dom-token-notes.md`; script `probes/contrast.py`. Limits: token pairs, not a rendered anti-aliased glyph/screen-reader test; non-text values have different criteria, decorative bars have none.
- **P-16** — App-pill and mirror source audit. Read src/index.css:17–127; FixtureRow.tsx:70–80; LedgerWeek.tsx:56–59; PosterWeek.tsx:9–13; TabNav.tsx:12–18,44–47; competitions.ts; mirror tokens/colors.css, spacing.css:16 and bundle:510–558, readme hard rules3/5. Expected: verify shipped code rather than assume H1's diagnosis. Observed: dark LIVE/Today use theme bg, not white; contrast8.98/7.75 (Broadcast11.21). Mirror muted2.95/4.18 and seven missing aliases confirmed. Capture: P-15 calculation/source pointers here; limits: no production build or live rendered fixture tested.

### Findings

**D-41 · Low · Design · Pending-billed contrast value is stale in the spec.** Spec:166 gives dark8.23; H1 DOM and P-15 independently give11.21 for #f7c948 on #0e1c15. This is the database-banner composite value copied into the plain-bg row, not a contrast failure. Expected: copy deck's measured numbers equal resolved values. Impact: audit/handoff evidence is inconsistent. Acceptance: re-run the luminance calculation and align §5 with H1. Database8.23 versus8.22 is a rounding discrepancy, not another finding.

### Recomputed pairs (app source and resolved canvas agree)

| §5 pair | Light | Dark |
| --- | ---: | ---: |
| Badge bg on ink |15.19|14.99|
| Ink on surface |16.57|12.98|
| Secondary on bg |6.00|8.55|
| Secondary on surface |6.54|7.40|
| Muted on bg |4.99|6.04|
| Pitch link on bg |4.82|7.75|
| Database amber on amber-bg, composited |4.95|8.22|
| Pending amber on bg |5.18|11.21|
| Kept white/light, bg/dark on pitch |5.26|7.75|
| Failed white/light, bg/dark on accent-strong |5.58|8.98|
| Ink on surface-alt |13.76|11.61|
| Media/bg, decorative |1.21|1.07|

Additional used pairs omitted from §5: photo secondary/media4.95/9.13; table heading muted/surface5.44/5.23; neutral pill secondary/composited line4.73/5.83; cap addition muted/alt4.52/4.68 (non-text); pending on row-hover alt4.69/8.68; secondary/alt5.44/6.62; hovered link deep-pitch/light, amber/dark7.89/11.21. Inverse primary/selected Seg/export pills reuse the badge pair. Ink on bg15.19/14.99 and ink-muted on surface-alt4.52/4.68 complete the extra grounds. Native control chrome is browser-owned; the screenshot's black-alpha mock is not a promised app token pair.

Mirror drift verified: ink-muted #8a9284/#6e8074 yields2.95/4.18 on bg; app/canvas #646c61/#8a9c8e yields4.99/6.04. The seven tokens absent from colors.css are media, floodlight-strong, accent-strong, accent-lead, lens-accent, on-accent-lead and accent-lead-strong. Reader Header uses the app underline alias; imported Studio TabNav uses mirror pitch, appropriate to its absence of reader lenses. Mirror's always-pitch underline differs from the app's Broadcast leading accent, a documented mirror drift, not grounds to change the settled app.

Amber checks: pending billed cost has uncertain provenance; unavailable database prevents the ledger from being authoritative; Studio header explicitly identifies when balance/prices/ledger were read. All three convey data trust under hard rule3; none is decoration. Failed/timed-out pill accent-strong is a stronger existing alarm hue, not a third accent; hard rule5 preserved. competitions.ts's known competition colors belong to existing reader data, not authority for new Studio alarm colors.

### App observations (separate from D2 findings)

**AO-01 / PM14 overturned.** Spec:172/H1 describe white dark LIVE/Today at1.96/2.27. Those ratios reproduce the *assumed* white pair, but current source already uses `dark:text-bg` for LIVE and `text-on-accent-lead` for Today. Current ratios are8.98/7.75; Broadcast11.21. This code is unchanged since54f7804, so it is not snapshot drift. No LIVE/Today AA failure is established by this probe, and no app correction is recommended on that premise. A shipped-app browser test would verify actual utility output; it was not run.

Blocks1–6 complete.

## Block 7 — motion (completed)

### Evidence index

- **P-17** — Every rendered frame's computed motion, normal and reduced. IAB read-only getComputedStyle inventory (9,690 element/pseudo-element records); then installed Chrome155.0.8059.40 headless via CDP pipe, disposable profile,1000×900/DPR1. `node probes/canvas-motion.mjs`; allow page requests only to127.0.0.1:8765 and unpkg, DNS deny others; Emulation.setEmulatedMedia no-preference then reduce; await fonts.ready in each. Expected: no newly animated properties; reduced setting verified true. Observed:34 frames,9,690 records per setting, zero nonzero-duration transitions, zero named animations and zero active Web Animations in both; fonts loaded. Capture: `evidence/P-17-motion.json`, `P-17-motion-reduced.png`; scripts in probes/. Limits: static atlas; no player, polling/Keep lifecycle, lens cross-fade or marquee is implemented here. Chrome and its page closed by script; no package installed or provider/player requested.

Verified inventory: all frames1a–c,2a–e,3a–b,4a–b,5a–c,6a–c,7a–b,8a–c,9a–d,10–14,H1,H2 have only zero-duration transitions and animation-name:none. Normal and reduced render agree. All12 candidates on14/spec§4 say no new motion; there is no hidden220ms Cinema fade or timer/progress animation. Ordinary pointer hover changes styles instantly; DS TabNav has no transition. Native media chrome is absent and cannot be included as a Kickoff animation.

Source budget cross-check: mirror spacing.css:18–25 declares150ms ease,180ms cubic-bezier(.2,.7,.2,1),220ms ease, with the first two reduced to0ms. Existing app index.css:158–164 uses220ms ease for lens color/background/border; LensSwitcher.tsx:66 uses180ms cubic-bezier(.2,.7,.2,1) and motion-reduce:transition-none. Existing marquee at index.css:176–182 is36s linear and disabled for reduced motion. These are retained budget classes, not motion observed in D2. The statement that all budgeted motion “collapses to opacity” is a design-system shorthand: current app lens color transitions are skipped for reduced preference, not observed fading opacity. This does not create new D2 motion or justify an extension.

No motion finding. Blocks1–7 complete.

## Pass 1 disposition and finding index

**Ready after named design fixes and Beni's policy/export adjudications; not ready for an implementation plan as-is.** The choices in Q1–Q12, Studio15.1–15.14, official-source/90-day/Made-For-Kids rulings, selected host and unrun16:9 probe remain settled. Findings correct evidence and handoff consequences; they do not authorize a replacement design or reverse Beni's choices.

Ordered by impact for the PM rebuttal brief (locations, probes and acceptance tests remain in the blocks):

| Severity | IDs | Required outcome |
| --- | --- | --- |
| High | D-24 | Designate the own-terms statement/access path and adjudicate policy mechanism |
| High | D-30 | Enforce or accurately scope non-overwrite/immutability guarantee |
| High | D-31 | Explain that media upload publishes public release assets before edition merge |
| High | D-38 | Scope photo reassurance to export recipients, preserve stripped-upload disclosure |
| High | D-39 | Give Studio controls and checklist groups accessible names/context |
| Medium | D-25,D-26,D-27 | Persistent privacy access, honest YouTube source naming, static privacy delivery contract |
| Medium | D-28,D-29 | Canvas reproduces app cascade/geometry and aspect-preserving selected bars |
| Medium | D-32,D-33,D-34,D-35 | Accurate redirect/limit facts, export identity/Latest policy, bounded clip verification |
| Medium | D-36,D-37,D-40 | Timeout authority, recoverable failed download, duration versus billing units |
| Medium | D-21,D-22 | Disclosure-answer coverage and visibly honest illustrative provenance/content |
| Low | D-23,D-41 | Verbatim punctuation and corrected contrast number |

Counts: **5 high,14 medium,2 low**. All findings target D2; current-app observations are separate. No finding alleges a proven rights violation, legal inadequacy, provider playback failure or WebKit failure.

## Verified facts

- The reviewed42-file target remains the PM-hashed D2 revision. D1/D2 substantive deltas map to the decisions record; no extra unlogged change was established.
- Current source drift is generated fixture data only. PR175 remains open; content policy was read from its remote branch, not treated as merged.
- All34 actual named frame boxes have their own scrollWidth equal to their assigned width. This does not cure internal track sizing/aspect defects or prove app layout equivalence.
- Notice/player rectangles do not intersect in8a–c and exceed200×200. All new audited text token pairs meet4.5; no new motion is active in normal/reduced D2.
- Scratch Chrome reports MediaError4 for both HTTP404 and invalid eight-byte MP4. D2's generic4 recovery sentence fits both; precise2/3 paths remain untested.
- $0.075 for5s is directly measured in AppendixS; estimate/cap arithmetic reproduces. Output15.084s does not establish15.084 billed units.
- GitHub sample transport redirects to release-assets.githubusercontent.com, supports206 ranges, and serves a binary as application/octet-stream. Immutability is disabled for this repository; there are no releases and14 product v-tags.

## Design interpretation

D2 is an atlas of states and an implementation contract. It supplies useful hierarchy and terse copy, including a persistent textual Generated label and a neutral provider-credit state. A drawn state, `<video>`-like picture or declared state inventory is not interactive proof. The bars board gets the arithmetic right but the image fill and reader-container cascade obscure the chosen behavior. The most consequential gaps are operator/public promises and the lifecycle boundary between local Keep, public media delivery and edition merge.

## Proposed improvements (outcomes, not replacement layouts)

Make the target's static-prototype limits explicit; complete the static privacy/token/theme contract; caption illustrative record fields where displayed; include the completed/download-failed recovery and the export-publication consequence. Keep status derived from actual events, distinguish decoded duration from billing units, and carry a deterministic export identity and validation lifecycle into the implementation plan. The PM should request evidence-backed corrections rather than inventing an alternate layout. These suggestions do not authorize any change here.

## Beni's adjudication items

Each accepts one word; recommendation first. A factual correction does not itself reopen a decision.

- **A-01 — Review / Accept.** Obtain an explicit policy interpretation before accepting Play-only agreement as satisfying III.A.2's timing/scope? **Review** recommended. The link and in-memory notice decision can remain while its policy premise is assessed.
- **A-02 — Define / Defer.** Designate the client's own terms statement and its S7 access path? **Define** recommended (D-24); no particular new route is required by this review.
- **A-03 — Retain / Reopen.** Retain GitHub Releases after correcting immutability/size premises and specifying settings/export identity/Latest policy? **Retain** recommended, conditional on these obligations (D-30,D-33,D-35). Host reversal is Beni's alone.
- **A-04 — Disclose / Defer.** Accept that an authorized media export publishes clips before the draft edition PR is merged, with that fact stated in confirmation? **Disclose** recommended (D-31), preserving per-export permission.
- **A-05 — Propose / Set.** Keep10minutes labelled as a proposal until the operational plan adjudicates the timeout? **Propose** recommended (D-36); Set would be a new ruling, not a recovered old one.
- **A-06 — Clarify / Defer.** Require an explicit applicability/disclosure answer for brief A1 rather than silently treating the badge as the answer? **Clarify** recommended (D-21). This seat does not adjudicate EU legal applicability.

## Not verified

1. **S7 pre-Play live network proof:** the supplied [PR168 comment](https://github.com/BeniCheni/kickoff/pull/168#issuecomment-6043493399) is a base64url ruling, not a network receipt. A corrected public network record, or a separately authorized live S7 before/after-Play trace, must settle the assertion that the player requests nothing before Play. Current code intent and Beni's testimony are distinct evidence. No private receipt was sought.
2. **Implemented K3 host lifetime:** with a valid locally served clip, capture one video's identity/src/poster/preload across ready/play/pause/ended, Cinema entry/exit, theme/lens/tab changes and Retry. Prove no fetch before Play, no remount/reparent and object-fit:contain. This atlas contains zero video/iframe elements; no hosted implementation exists here to exercise.
3. **Keyboard/native-controls integration:** local valid-media test of Play focus to video, Pause focus retained, Retry destination, Cinema Escape returning to surviving opener, native-fullscreen Escape precedence, play rejection and play/pause/ended/error/volumechange synchronization. Test native controls and Kickoff controls together, including whether native Replay is audible and status reflects the element.
4. **Precise recovery branches:** cause an actual mid-stream network failure/code2, a supported-container decode failure/code3, aborted/code1 and a load timeout on scratch loopback. Settle each sentence/state and whether Retry makes one new attempt. The404/invalid-byte experiments establish code4 only.
5. **WebKit release MP4 playback:** a separately authorized public MP4 served with the actual release asset Content-Type and range behavior in Safari/WebKit, on desktop and iOS. Settle whether application/octet-stream is playable/seeking-compatible. Tarball headers cannot answer it; no upload performed.
6. **Studio16:9 provider verification:** the already specified cropped768×432 K0 plus one5s480P run, ffprobe dimensions/aspect and cost receipt. This spends Beni's balance and remains his authorized run; it was not run here.
7. **Static public privacy artifact:** standalone built public/privacy.html with JS disabled, both themes, both widths, working links/assets and documented existing-key/theme fallback. Settle actual bundle independence and disclosure list. Only React drawings exist now.
8. **Full responsive/application matrix:**375 and breakpoint-adjacent760/761/887/888, Ledger/Poster/Broadcast × light/dark × relevant tabs, app-generated cards/queue/Cinema. Settle cascade/outdent repair at a new revision and native-control footprint. Fixed-width D2 frames are a partial design matrix, not full app verification. The full-form360 notice is not drawn and needs a new-target rectangle test.
9. **Filtering/ordering/save/spoiler runtime:** execute every filter, generated/no-fixture Newest placement, saved-only, history/Undo/shuffle and spoiler-light toggle, ensuring Generated survives and fixture honesty is maintained. Controls in D2 are static; source-conditional text is verified, projection/state integration is not.
10. **Studio lifecycle variants:** unanswered/all-Clear/kept/discarded review; composer budget/db-disabled states; billed-estimate replacement; export without upload/PR-opened/partial-failure/retry; actual registry selection; attestation write/persistence and exported-once behavior. Inventory describes them but only part-answered review/normal composer/upload-choice/exported jobs are drawn. No live server/provider/persistence probe was permitted.
11. **Frame-step claim:** test comma/period scrubbing in each promised browser using a valid local video. No universal native shortcut follows from the drawing or a type label.
12. **Post-change/publication facts:** rerun manifest/SHAs, GitHub immutability setting, redirects and public-copy source references at the next revision; legal interpretation, third-party cookies/subprocessors and provider billing/hosting terms were not adjudicated here. No Supabase/fal/Google API/player request made.

## App observations

AO-01 is the PM14 source-backed overturn in block6, not a D2 finding: dark LIVE/Today use safe theme-background text in current source. Actual emitted Tailwind utilities/live rendering remain untested. Generated-sync drift at HEAD does not alter reviewed CSS/source behavior. The existing app code has three storage keys, no discovered own cookie/analytics/beacon access, and unconditional Google Fonts links; network caches and third-party behaviors remain separate. No app files were changed and no app tests/build were run: there was no product change to validate, and running a build would not prove this design's unimplemented mechanisms.

## Appendix PM ledger (checked after own probes in each block)

| Item | Outcome | Independent evidence |
| --- | --- | --- |
| PM1 | Confirmed D-21 | P-02/P-03 brief answer missing |
| PM2 | Confirmed D-24; legal adequacy not adjudicated | P-04 allIII.A, P-03 copy/links |
| PM3 | Overturned for suspected extra ads/cookie omissions | P-03/P-04;9a–d already addressIII.A.2.f–g; other independently found gapsD-24/D-25 |
| PM4 | Code4 premise confirmed; wrong-copy allegation overturned | P-09 both failures4; spec74–76 generic4 covers both |
| PM5 | Confirmed D-32 | P-10 observed release-assets host |
| PM6 | Confirmed D-30 | P-11 setting disabled; P-12 opt-in docs |
| PM7 | Confirmed D-33 with corrected tag inventory | P-11 no releases,14 tagsv0.2.0–v0.5.2; P-12 Latest default; date identity source |
| PM8 | Confirmed D-34 as planned consequence | P-12 build chain, current validator local-only |
| PM9 | Binary octet-stream confirmed; WebKit consequence Not verified | P-10 headers/range; missing MP4 Safari/iOS test |
| PM10 | Overturned | P-13 AppendixS directly measures5s$0.075; post15Oct$0.125 derived |
| PM11 | Confirmed D-36 | P-13 no authoritative10minute value |
| PM12 | Confirmed D-37 | P-13/P-14 recoverable-download substate absent |
| PM13 | Confirmed D-38 | P-03/P-13 export versus stripped-upload text |
| PM14 | Overturned as current-app failure; AO-01 only | P-15/P-16 dark:text-bg/text-on-accent-lead, safe source ratios |

## Completion and PM handoff

Completed all seven ordered blocks, each appended at its boundary. No blocks unreached. Review skill and browser-evidence method applied; sealed PM claims checked after independent artifact probes. Read-only evidence remains separate from future implementation/provider/live acceptance.

PM seat: turn this report into the **Pass1.5 rebuttal brief** for the unchanged hash above. Lead with D-24,D-30,D-31,D-38,D-39, then public privacy/source and canvas-geometry gaps. Ask Claude Design to accept, contest with reproduction evidence, or accept while contesting characterization for each stable ID. Preserve all settled rulings. Supply the corrected PM10/PM14 evidence so neither gets carried as a false defect. Require a fresh42-file-or-new-count manifest and copy/geometry/contrast/normal+reduced receipts for any D2 successor; do not claim behavioral or provider proof from a new screenshot. Future R1/R2,S7,ST3/ST4 plans must explicitly own the tests named above. Beni's one-word decisions belong to Pass3; this report neither runs Pass1.5 nor adjudicates it.

## Final integrity and cleanup

- **P-18** — Final target/integrity check and cleanup. Recomputed all42 SHA-256 lines: manifest hash unchanged9e5663a3ff4f879aba354f01e951757feb45d02ceb1c73b57ff6d59b5dc83748; detached worktree git status empty before removal. Ran requested worktree remove from the primary repository; verified directory absent and worktree unregistered. Stopped the Python server with SIGINT; port8765 no longer accepts a connection. Reset IAB viewport and closed the temporary tab. Disposable Chrome instances closed. Capture: evidence/P-18-final-integrity.json and P-18-cleanup.json. No prohibited directory, account, package install, spend, provider/player/Google API request or GitHub mutation was performed.

Only local report, evidence, probe scripts and their disposable browser profiles remain under /Users/benicheni/kickoff-d2-review/. Nothing sent to another seat or GitHub. This is the end of Pass1.
