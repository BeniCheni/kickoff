# Moments D6 — Codex's Pass 1 cold review (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by Codex (GPT-6.1 Sol Extra High) on Mon 12 Oct 2026 against the D6 export (fingerprint `c3812bf3…7478`). Verdict: ready after named design fixes; 12 findings, D-46 to D-57 (3 high, 7 medium, 2 low), with Q13–Q22 and the adjudication items A-09 to A-11 for Beni. This text is the copy uploaded to Claude Design with the rebuttal brief, byte-identical to the report. Its evidence (probe scripts, captures, JSON) was in `~/kickoff-d6-review/`, which was deleted on 13 Oct, so none of it survives; nothing from it is committed.

---

# Moments D6 — Pass 1 cold design review

Seat: Codex, requested GPT-6.1 Sol Extra High; independent reviewer, no implementation or adjudication authority.
Date: 2026-10-12, America/New_York.
D6 fingerprint: `c3812bf334aeb68832d9c3e1821a163440cda0446c8b92044a6142d7f2c77478`.
Whole-folder manifest: `57192aa44739272b5482cb1fc9f776cb80e39b866952bb95c282475b21a2fda1`.
Review worktree: `/Users/benicheni/kickoff-d6-review-codex`, full head `f523b52eb2a18cfb8599aa9858b6f6a037ef465c` (detached, clean).
Browser/version: Google Chrome 155.0.8059.40 over CDP; visible Codex in-app browser tab loaded independently. Node 24.15.0, DPR 1, fonts ready; actual viewport receipts at 360, 390 and 1000 × 1000.

The artifact, repository and PM appendix are claims to verify. This report records a design atlas and source review, not production, provider, database or publication proof. Report and probes are outside the repo and design folder.

## Evidence index

- P-01: Setup, integrity and source identity. Six manifest entries pass; fingerprint and 30-file folder manifest match supplied pins; detached origin/main is f523b52. Source checkout has two pre-existing untracked skill directories, untouched. D2 probe directory absent.

- P-02: Browser environment, initial complete frame DOM, resource requests/empty image slots — `P-02-environment.json`, `P-02-dom.json`; full AX export timed out.
- P-03: Four docs equality, root runtime equality and frame identity — `P-03-source-identity.json`.
- P-04: Brief A–E, artboards/handoff/changelog/labels/source facts — `P-04-record-coverage.txt`.
- P-05: Original gallery/card/unavailable computed boxes and capture — `P-05-gallery-geometry.json`, `P-05-gallery.png`.
- P-06: Scoped Chrome AX subtrees — `P-06-ax.json`.
- P-07: Independently recomputed geometry against original rig rects — `P-07-independent-geometry.json`.
- P-08: All original watch states/rects/markup and countdown capture — `P-08-watch.json`, `P-08-countdown.png`.
- P-09: Actual pinned URL codec execution and ordinary URL resolution — `P-09-url-contract.json`, `P-09-link-resolution.json`.
- P-10: Ordinary Tab traversal at ready/countdown — `P-10-keyboard.json`.
- P-11: Primary public documentation read — `P-11-public-documentation.txt`.
- P-12: Four privacy and all Studio DOM states/controls, privacy capture — `P-12-privacy-studio.json`, `P-12-privacy.png`.
- P-13: Sentence-by-sentence privacy classification — `P-13-privacy-claim-audit.txt`.
- P-14: Live read-only branch/ruleset/bypass JSON — `P-14-main-rules.json`, `P-14-rulesets.json`, `P-14-status-ruleset-detail.json`.
- P-15: Publication/state/schema/process source audit — `P-15-studio-source-audit.txt`.
- P-16: Independent visible rendered contrast and all declared H1 math — `P-16-contrast.json`, `P-16-H1-independent.json`.
- P-17: Actual emulated no-preference/reduce motion plus shadow DOM — `P-17-motion.json`.
- P-18: Chrome AX on all 70 original content frames; 855 exposed controls, zero empty names — `P-18-all-ax.json`, `P-18-names-summary.json`.
- P-19: Actual viewport 360/390/1000 remeasurement of original gallery states — `P-19-viewport-matrix.json`.
- P-20: Verbatim deck literal comparison, manual substitutions/absent-state classifications — `P-20-copy-deck-audit.json`.
- P-21: End identity, unchanged source, cleanup receipt — `P-21-cleanup.txt` (recorded at teardown).

All filenames above are relative to `/Users/benicheni/kickoff-d6-review/evidence`; reusable probes live beside them in `probes/`. Commands/methods and expected/observed/limits are described in the block citing each receipt.

## Block completion ledger

6/6 completed; block entries below preserve the incremental record.

## Block 1 — record and coverage (completed)

Evidence: P-02 `evidence/P-02-environment.json`, `P-02-dom.json`; P-03 `P-03-source-identity.json`; P-04 `P-04-record-coverage.txt`. Chrome 155.0.8059.40, Node 24.15.0, local HTTP; visible in-app tab also loaded. Full worktree SHA `f523b52eb2a18cfb8599aa9858b6f6a037ef465c`. Fonts ready. All four reference docs match main; six-file spec duplicates match. No photo/media host requested by the artifact. Generic image-slot Unsplash capability remains unused.

Verified: brief A–E and handoff 1–8 each have a spec answer; all 14 requested artboard families exist (72 `data-frame` nodes, H4 wrapper, 24 geometry rigs). §0 honestly supersedes A-01/A-03/A-08 by the pivot, keeps the badge/native controls/sound/gate/global foot, changes Q3's premise and Q9, and reopens the named new choices. D5 remains the base for untouched Studio states. The reported 15.084 s and 10.0/10.4 MB trace to the public architecture Appendix S; this verifies attribution, not the original media measurement.

### D-46 — Medium — state coverage and handoff leave gaps

Location: D6 §1/§3/§5; artboards 1–12. Expected: the named states and new outcomes have drawn answers. Observed: no NoResults with its rewritten copy, no saved/refused card, no muted watch; abort is only an arrow to ready. Record-write failure has prose but no drawn partial outcome; Unpublish partial failures have neither a state answer nor recovery drawing. P-02/P-04 reproduce the complete IDs and DOM. Impact: builders must infer recovery and altered states; a supplied static atlas cannot substantiate full coverage. Acceptance: add/identify pinned drawings for changed states and publication/withdrawal failures, or explicitly map each unchanged state to its D5 frame and show why no new copy/behavior needs drawing. No request for an interactive implementation.

### D-47 — Medium — invented operational values are not all labelled

Location: canvas Studio header and Publish table (lines 324–325); §3 stamp; introductory honesty banner. Expected: every invented value is ILLUSTRATIVE. Observed: 10.1/10.2 MB and 48/51 KB, balance $9.37/caps/db state, and privacy stamps are not locally marked; global banner enumerates titles/dates/notes/seeds/hashes/prompts/sync/thumbnails but declares only 10.0/10.4 MB measured. Gate-none has no local tag; a gate-yes tag identifies the answer alone. P-04; privacy stamp examined again in block 4. Impact: a builder can copy invented file/operational values as measured. Acceptance: unmistakably scope an ILLUSTRATIVE label to every invented field, preserving the separate measured source receipts; do not invent replacement live values.

### D-48 — Low — D6 fingerprint does not pin the runtime path it executes

Location: canvas line 6, six-file manifest, §10. Expected: a fingerprint used as artifact identity pins its executed runtime. Observed: root `support.js` is loaded but only `d6/support.js` is in the six-line manifest. Today they compare equal; whole-folder hash pins both here. P-01/P-03. Impact: later root-runtime drift can survive the advertised D6 fingerprint. Acceptance: the next export pins the executed path, or explicitly requires whole-folder identity in addition to the six-file fingerprint. This is a future pin gap, not corruption of this target.

Design interpretation: the generated-only pivot and reopened choices are authority, not findings. Placeholder blocks accurately admit their status; they cannot prove thumbnail subject quality. Proposed improvement: make coverage inheritance and illustrative scope explicit. Not verified: original Appendix S files/ffprobe (not requested); runtime playback/state machine. PM-1 checked only after the independent source/DOM audit: confirmed pin gap, low because the independently matched folder hash protects this review.

Blocks completed: 1/6.

## Block 2 — gallery (completed)

Evidence: P-05 `P-05-gallery-geometry.json` and `P-05-gallery.png` (all original gallery/card/unavailable frames, computed boxes/styles); P-06 `P-06-ax.json` (Chrome AX subtrees, not H3's text-presence heuristic); P-07 `P-07-independent-geometry.json` (independent arithmetic from current CSS and declared D6 grid). Full AX-tree export timed out; scoped Chrome AX queries succeed. Initial P-05 viewport was 756×469 after a CDP reconnect reset; the artboard boxes still measured at their declared widths. Later captures explicitly set 1400×1000. These are fixed-width atlas artboards, not an adaptive production page.

Verified: all 18 gallery frames at 360/390/1000 × three lenses × two themes have frame scrollWidth equal to frame width. Gallery widths 320/350/960; 1/1/3 columns; 1000 card 309.328 px and thumb 192.078 px. All 24 G rigs independently agree within browser subpixel rounding: 760/761 column boundary, 887/888 two-column player boundary, player 350×200 at 390 and 632×355.5 at 1000, theater 960×540 at 1000. The eight-row §5 geometry table reproduces from `src/index.css` gallery outdent/player floor/stage gap and D6's 280 px grid. It is not validation by `geo()`.

Slots: loading is text in a reserved media box; nominal loaded/fallback is a flat labelled ILLUSTRATIVE block; slot is an empty drop placeholder; last resort is original SVG/typographic STUDIO. No actual `<img>` chain is implemented in this static artifact. Q22 uses 16:10 for all sample cards; the declared per-record rule is sensible but a mixed-ratio row has no drawing. Card height varies with content between rows; equal grid tracks do not imply equal title length. Subject/Browse order/Saved only appear in the expanded filter; no Competition/Category/Spoiler-light remains. Generated stays visible.

Amber interpretation: fallback provenance and missing-thumbnail explanation are data-trust uses, consistent with hard rule 3, rather than promotion. No finding on that choice. Original fallback cards are drawn only at 390, Ledger, both themes; unavailable only 390 Ledger light and 1000 Ledger dark. The demanded fallback/unavailable full lens/theme/width matrix cannot be claimed from these mounts; D-46 also covers that missing drawing coverage. The filter controls in this atlas do not drive results; native details opening is the only filter interaction, so Subject intersection behavior (including the two-cat record), saved filtering and authored/newest/shuffled order remain builder tests.

PM-3, checked after the independent fallback/list read: scoped fail-safe is explicit in §6 and unavailable copy—no cards if the database list fails; site copies survive only Storage-image failure while the live list is available. The privacy-page wording is broader and is addressed in block 4. A joint database/Storage outage is not a fallback gallery. No request to Supabase was made; no pause behavior empirically proved.

Not verified: comparison with `/Users/benicheni/kickoff-d2-review/evidence/P-22-app-geometry.json` because that file and its directory are absent; a fresh current-app browser measurement was not substituted for it. Mixed 16:9/16:10 thumbnails, error-driven chain, live filtering, all-state matrix, and photo/clip subject quality require the named missing render/runtime tests.

Blocks completed: 2/6.

## Block 3 — watch and autoplay-next (completed)

Evidence: P-08 `P-08-watch.json`, `P-08-countdown.png`; P-09 `P-09-url-contract.json` and `probes/url-contract.mjs` (Node executes a review-local copy of pinned urlCodecs.ts, imports the actual pinned codecs/constants); P-10 `P-10-keyboard.json` (ordinary CDP Tab events from the first watch control); P-11 primary [WAI-ARIA status definition](https://www.w3.org/TR/wai-aria-1.2/#status), read in this review. MDN was a discovery cross-check; the conclusion uses the W3C source.

Verified: ready/playing/paused/ended-off/network/decode/not-supported/not-found/server-unavailable/countdown/cancelled/refused/last/theater/provenance-open are drawn. End-of-list copy says stop/no loop; recovery says stop/no skip; browser-refused frame has the next title and Play; countdown/Cancel sit below the player and outside its rect. Theater uses one column and the outdent. The spec consistently requires one host/one video, controls/playsinline/preload none, no poster, source set at Play, sound on; the actual atlas has zero video/iframe elements and only div/span pictures. The 36px simulated native band is explicitly canvas chrome, not a proposed product overlay. No lifecycle continuity, native-control accessibility or autoplay-policy success is proved.

### D-49 — High — before-Play copy promises no fetching while the thumbnail fetches

Location: §3 watch ready; §6 thumbnail premise; frames 4-390-ready/4-1000-ready. Expected: accurately describe what reaches hosts before consent/Play. Observed: `Nothing is fetched until Play.` while the same design explicitly fetches the thumbnail via Storage → site copy before Play; the gallery already fetches thumbnails. P-08 plus §1/§6/§9. Impact: reader receives a false network/privacy promise and builder can carry a D5 sentence whose premise changed. Acceptance: scope the promise to the video file, and reconcile it with the thumbnail privacy disclosure; run a future authorized network test showing no video request before Play while thumbnails load. Overturn only with a design that truly fetches nothing before Play (would need to account for the settled thumbnails).

### D-50 — Medium — the countdown specification cannot guarantee “announce once”

Location: §4/§6/§8; 6-1000-countdown and 6-390-countdown. Expected: one polite announcement with focus unchanged. Observed: role=status, aria-live=polite; the spec mandates replacing its text every second 5→1, then relies on coalescing. P-08/P-06 confirm live markup; P-11 says status implicitly polite and atomic; it does not promise deduplication over five seconds. Impact: builders have contradictory requirements and screen readers may repeatedly announce the countdown. This is a specification mismatch, not an observed five-announcement screen-reader result. Acceptance: state a mechanism that independently guarantees the named single announcement, then verify with an authorized screen-reader countdown/cancel/next test. PM-4 checked afterwards: confirmed in this scope.

### D-51 — Medium — watch navigation examples discard the existing URL contract

Location: gallery title/thumbnail and watch Up next/Earlier/back hrefs; §6/§9. Expected: preserve only/date/tab/lens/view across watch entry and exit except the intentionally changed watch/tab values. Observed: literal `?tab=moments&watch=<id>` and back `?tab=moments` replace the whole query; no merge mechanism is specified. P-02/P-08 hrefs and P-09. `canonicalSearch` itself DOES leave the unknown watch key alone; this claim is correct and is not the defect. It normalizes owned keys as today, including omitting defaults/invalid values, so “unchanged” must mean contract semantics, not byte identity. Impact: literal implementation would lose the fixture/date/lens/view selection that the brief protects. Acceptance: define query merging and Back/Forward/route-exit semantics and show entry/next/back preserve valid keys, explicit empty only and unknown keys. Keep the existing codecs on the Next server and client; recognize watch without converting date into server timezone or changing default omission rules. Do not infer a path migration from the query decision.

### D-52 — Medium — accessibility receipt disagrees with names and keyboard order

Location: §8, gallery Save action, watch shell/Cancel/switch/queue, H3. Expected: saved action named `Save reference: <title>`, one Lens tab stop, documented order, stable switch name. Observed via Chrome AX and Tab: Save actions are all `Save reference`; theme comes first, then Fixtures/Table/Moments, then ALL THREE radios, not §8's single group followed by theme. Cancel comes before Replay/Copy link, not after Copy link. Switch name includes `On`/`Off`; queue link names include duration/date instead of title alone. P-06/P-10; current LensSwitcher.tsx uses roving tabindex, unlike the atlas. Impact: H3's “nonempty text” check misses contextual naming and tab-order regressions; builder cannot reproduce the specified receipt from the supplied markup. Acceptance: reconcile spec and actual AX/Tab receipt; keep per-card context and the source's single-stop radio behavior, stable switch name/state, and explicit Cancel order. No need to invent new shortcuts. More AX audit in block 6.

Design interpretation: Query URL, Theater, Native shortcuts remain defensible recommendations; no decision made for Beni. Hidden-at-ended continues the countdown in §6, while route-leave/paused stops; I recommend an additional explicit background-tab choice, with Pause first, because audible continuation may occur after attention moves away. This is a proposed policy question, not an invented settled rule or proven failure.

Not verified: actual single-element identity across ended/src changes, source/poster/preload network behavior, focus transfer/return, Escape/fullscreen interaction, cancellation/hidden-tab race, Safari/iOS refused-play behavior, native key coverage. The static element cannot run those tests. URL test's first case used `epl`, an invalid source key, so its removal is expected; valid-key preservation is independently rerun below.

Blocks completed: 3/6.

## Block 4 — privacy and terms (completed)

Evidence: P-12 `P-12-privacy-studio.json` (original four privacy frames and publication DOM); P-13 `P-13-privacy-claim-audit.txt` (every sentence classified against pivot/current source); P-11 public [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod) and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), read as documentation only. The checklist says Free projects with low activity in a seven-day period may pause; this is documented policy, not an empirical joint-outage test.

Verified design facts: the pivot places site requests at Vercel, gallery/detail DB reads on its server, file requests directly at Supabase, and never browser-to-Postgres. The page names all three providers in that architecture, includes Google Fonts' cache qualification (current index.html references both font origins), and lists the current three storage keys plus proposed autoplay key. Key retention depends on Q17; Q16 Off does not technically force Visit—D6's coupling is a recommendation Beni can accept or reject. Transport statements describe intended future behavior; no new app network trace supports them yet.

### D-53 — High — privacy copy claims a code audit of an app that does not exist

Location: privacy intro/stamp, §3; frames 9-390-L/D and 9-1000-L/D. Expected: every future-app claim clearly stays a design statement until the shipped code/network is audited; stamp labelled ILLUSTRATIVE as §3 itself requires. Observed: intro and stamp both say `Read from the code on 2026-10-12`; no local ILLUSTRATIVE label, and no qualification that server/database/key behavior is proposed. The atlas-wide label only calls dates invented and does not turn an exhaustive code-audit claim into a code audit. P-12/P-13; main is the React/Vite app. Impact: readers/builders would ship a false audited-current privacy assurance. Acceptance: identify this as prospective copy in the design, make the stamp status unmistakable, and require the migration's actual code/dependency/cookie/network audit to set the final stamp and claims. PM-6 independently confirmed after the DOM/source comparison. This is not a challenge to Beni's server pivot.

### D-54 — Medium — the privacy fail-safe statement omits its critical limit

Location: §3 privacy Fallback thumbnails vs §6 No cards without the list. Expected: explain the fail-safe covers failed image delivery while the current published list succeeds. Observed: privacy says site copies are served “when Supabase does not answer,” without the database/list prerequisite. P-12/P-13 and block 2. Impact: a reader/Beni can expect the fallback to survive a whole-project outage; the actual design deliberately renders unavailable/no cards. Acceptance: scope the privacy statement consistently with §6/unavailable copy; demonstrate separate image-only failure and list failure in the authorized build. PM-3 is confirmed as an already explicit spec limit, with this remaining public-copy gap. Adjudication below preserves Beni's chosen ordering and asks only whether the limited coverage meets his intended fail-safe.

Terms Q15: the two sentences accurately state the intended personal/as-is service and fictional generated content; no YouTube API/consent claims remain. Keeping them is a reasonable recommendation; legal adequacy and Article 50 applicability are not findings or answers here. Storage-tail “nothing elsewhere” is read in its section's reader-preference context; I do not allege it denies the separate database or hosted files. More explicit scope is proposed polish.

Not verified: actual Vercel/Supabase request headers/logging/cookies/cache behavior, deployed Google Fonts retention, exhaustive no-analytics audit, key refusal/persistence/deletion, current-code stamp at migration release, legal adequacy. Each needs the unbuilt application's source/runtime or Beni's recorded answer. No provider or account APIs called.

Blocks completed: 4/6.

## Block 5 — Studio Publish and Unpublish (completed)

Evidence: P-12 DOM; P-14 `P-14-main-rules.json`, `P-14-rulesets.json`, `P-14-status-ruleset-detail.json` from read-only `gh api`; P-15 `P-15-studio-source-audit.txt` comparing ST1 v2/addendum/CLAUDE/workflows. Public [GitHub rules API](https://docs.github.com/en/rest/repos/rules) and [ruleset documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) establish the bypass semantics; no push/PR/check dispatch attempted.

Verified: both A-06 states are present; none disables Publish with a status reason, recorded shows the quoted answer placeholder and enables it. The answered state is illustrative and does not claim Beni has actually answered. Four publish steps and upload/fallback-failure outcomes are honest about database publication; record failure has equivalent prose but lacks its drawing. Withdrawn clears publication, optionally deletes files and removes fallback by later deploy; it accurately admits open/cached copies cannot be recalled. D-46 also includes absent Unpublish partial failures and missing actual jobs rows: the jobs frame displays seven distinct states, not all fifteen (D5 inherited inventory is not a drawing of the new ledger).

### D-55 — High — Q19's recommended direct-main delivery silently bypasses the normal CI gate

Location: §3 Studio Fallback copy/Retry commit; §6 Q19 Commit; §9. Expected: a delivery recommendation states the actual repository checks/authority it uses and does not imply a checked normal publication path. Observed: Commit pushes to main with Beni's token for Publish and Unpublish. P-14 shows required `verify`, AND admin role's `bypass_mode: always` with `current_user_can_bypass: always`. Therefore it is incorrect to say “main will always refuse this”: a fast-forward push by the currently authenticated bypass actor can be accepted WITHOUT verify first. A non-bypass token with no successful required status on that new commit would be refused. P-15 confirms CI runs on main only after such a direct update, and CLAUDE's sync process uses a PR/verify gate and never direct-main pushes. Impact: recommendation hides a process/CI exception that Beni must explicitly decide, rather than merely choosing thumbnail placement. This is a false safety premise under a choice, not a veto of Beni's chosen Studio publication model. Acceptance/overturn: describe actual bypass/check consequences, name the authorized delivery protocol and failure states, and demonstrate the chosen protocol later in an authorized non-production test; do not test by pushing now. A newly read ruleset eliminating the bypass changes the refusal branch, not the need to respect verify.

PM-2 checked afterwards: required-check claim confirmed; blanket refusal premise overturned by ruleset detail. Q19 must come back to Beni with this correction. Alternatives, without choosing for him:

- **Build:** a deploy fetches current thumbnails from Storage. Cost: network dependency on the service the copy is intended to survive, build-failure/retry policy, and latency before the fallback becomes available. It also requires a deploy trigger for each new copy; neither a dollar amount nor timing was measured. Existing already-shipped copies may survive, but a Storage outage can block the next build unless a retained independent cache is designed.
- **PR:** a thumbnail-only branch/PR goes through `verify`, with auto-merge only if Beni authorizes that exception. Cost: GitHub automation/token/CI and deploy latency, concurrent publish/conflict/idempotency handling; restores the repo's normal gate while the video record can publish immediately. This is a PR for the fallback asset, not a return to a PR per catalog edition.
- **Host:** a separate host for redundant copies. Cost: another dependency/provider/disclosure, retrieval/deletion/versioning and cache guarantees; possible service charges unverified. It does not literally “ship with the site” and needs Beni to amend that settled requirement.
- **Commit:** lowest conceptual delivery-step count, but current admin bypass skips pre-main checks and must be an explicit process exception; otherwise it needs a prior check-bearing commit/protocol. It still waits for deployment. “About a minute” is an illustrative estimate, not a verified Vercel latency guarantee.

PM-5 checked after the record/state audit: aligned. Addendum wins over original ST1's fourteen-state list, adds withdrawn and all four partial outcomes, clears published time and records withdrawal, and explicitly carries videos/published_at/position. No logical name mismatch finding. Proposed builder clarification: bind D6's `videos` read to the approved public read-only views (ST1 permits SELECT on views only), with shared public schema/field types; it must never grant the website access to private Studio tables. This is not proof of a built database.

Proposed improvement: make public-by-address upload exposure and Cancel-after-upload semantics explicit (the same A-04 disclosure spirit) before implementing; “nothing live” currently means no catalog record, while files in a public bucket may already be address-readable. No publication/privacy conclusion inferred from a failed stub.

Not verified: actual token identity/permissions of the future Studio; public bucket creation, file upload/delete/reuse/idempotency; gate enforcement in DB; cache invalidation/immediate publish/withdraw; deploy/fallback propagation; all fifteen states and Completed substates at runtime; billed values; Article 50 answer. No account, key, provider, migration or production operation performed.

Blocks completed: 5/6.

## Block 6 — tokens, contrast, motion and accessible names (completed)

Evidence: P-16 `P-16-contrast.json` (independent computed-style scan/composited ancestor backgrounds), `P-16-H1-independent.json` (independent Python WCAG math for all 16 H1 rows, not D6's ratio helper); P-17 `P-17-motion.json` (CDP Emulation.setEmulatedMedia no-preference/reduce, including image-slot shadow roots); P-18 `P-18-all-ax.json` and `P-18-names-summary.json` (70 original frame subtrees via Chrome Accessibility.queryAXTree); P-19 `P-19-viewport-matrix.json` (actual browser innerWidth 360/390/1000, height1000,dpr1; each original gallery/card/unavailable frame remeasured); P-20 `P-20-copy-deck-audit.json` (literal deck vs DOM with manual template/state classification).

Verified: computed tokens agree with current app light/dark values; DS ink-muted drift remains real and the artifact deliberately uses app values. All 16 H1 pairs and §5 pairs independently reproduce to rounding: inverse15.19/14.99; title16.57/12.98; secondary-surface6.54/7.40; secondary-bg6.00/8.55; trust-surface5.65/9.71; trust-bg5.18/11.21; pitch4.82/7.75; muted-alt4.52/4.68; ink-alt13.76/11.61; failed intended cream/accent5.12/8.98; gate4.95/8.22 (canvas8.23 rounds RGB during alpha composition; not a meaningful defect); media1.21/1.07 nontext. The independent rendered scan finds 35 distinct text/background pairs, no failing visible enabled text under the normal 4.5/large-text3 criteria. Disabled controls excluded; simulated native-band labels are canvas chrome. No full WCAG compliance conclusion follows from this contrast scan.

Omitted rendered pairs are retained in P-16 with examples: secondary on surface-alt5.44/6.62 and on media4.95/9.13; muted on bg4.99/6.04; light Broadcast selected ink on floodlight5.62; white on pitch5.26; white on strong accent5.58. STUDIO large lettering inherits the global link pitch (#2c7a4b), giving3.98 light/3.57 dark on media: passes large-text3, not ordinary4.5. The direct text-node scan sees actual foregrounds rather than token-table assumptions.

### D-56 — Medium — reduced-motion receipt does not match the existing source behavior

Location: §4/H4; inline lens segment styles (canvas common/segBase); source LensSwitcher.tsx. Expected: the retained lens token respects the app's `motion-reduce:transition-none`, and inventory reflects the actual DOM including shadow roots. Observed: 144 lens elements retain 180 ms transitions under BOTH no-preference and reduce. Four image-slot shadow elements retain120 ms transitions in both; H4 scans light DOM and omits those. P-17; source has explicit reduced-motion suppression. Impact: a builder copying the atlas/receipt can lose the existing reduced-motion behavior; the “everything else zero” inventory is not complete. Slot transitions are design-tool chrome, so they are not alleged new product motion. Acceptance: preserve/restate source reduced-motion semantics and rerun a complete, scoped inventory in both modes; separate tool-chrome motion explicitly. No new product animation is otherwise observed.

### D-57 — Low — contrast receipt omits used pairs and describes the wrong foreground

Location: §5/H1 and Studio pill styles; STUDIO fallback. Expected: receipts include every used text pair and match rendered foregrounds. Observed: light step pills use white, while §5 explicitly says cream; additional pairs above and global-link STUDIO color are omitted. The declared pairs themselves pass, and all actual enabled text passes its applicable threshold. P-16. Impact: local receipt accuracy, not an evidenced contrast exclusion. Acceptance: reconcile the used-pair list and actual colors and state large-text thresholds where relevant; independent rerun produces the revised table.

Accessible names: independent Chrome subtrees cover gallery/watch/privacy/Studio and include shadow controls that H3's text heuristic omits. There are no empty names among exposed action controls in the audit; that does not vindicate the incorrect contextual names/order in D-52. Privacy has one Back link per frame; unanswered Publish remains disabled with separate reason, recorded Publish enabled; all Studio actions have names. Native video element/name is not measurable because it is not mounted. Role=status maps polite/atomic in Chrome; no screen-reader utterance was measured.

P-19 confirms original artboard widths/geometry survive actual browser viewport changes. The *atlas document* intentionally retains scrollWidth1120 at viewports360/390/1000 because it contains1000px artboards; it is not the product page and this is not reported as a product overflow. Individual gallery frames remain equal to their width. Card fallback and unavailable state mounts still lack the full demanded matrix (D-46); changing the outer viewport does not create those missing lens/state drawings.

Copy audit: rendered supplied states use the deck's visible sentences after substitutions/case transforms; omissions include NoResults, Saved reference, muted, copy-failed and native-shortcut discovery below a focused real player (the proposal frame discusses it). P-20 does not convert an absent state into a copy match. Template fields in provenance and A-06 are illustrative placeholders, not actual published data/answers. The privacy stamp mismatch and incorrect before-Play claim remain D-47/D-53 and D-49. No real club/player/crest/competition/result or stock photograph appears in the generated media frames; “Brooklyn · ET” is the existing shell clock locale, not a depicted match/place or thumbnail photograph.

Not verified: assistive-technology walkthrough/announcement count, contrast of actual movie/native browser controls/loaded thumbnails, hover/focus states beyond the Tab receipt, iOS/Firefox/Safari/zoom matrix, and transition behavior of a future dynamic app. Those require the relevant implementation or authorized browser/AT tests. No package installed.

Blocks completed: 6/6.

## Consolidated verified facts, interpretation and proposed improvements

The fingerprint/folder/docs/main pins reproduce; gallery grid and retained player geometry reproduce independently; no photos or actual players are mounted; Generated/provenance and both A-06 drawings survive the pivot; original state-family/artboard coverage exists; public logical catalog names align with ST1's addendum; the canonicalSearch unknown-key claim is true; all tested rendered enabled text passes applicable contrast. Main's detailed CI ruleset permits always-bypass for the current principal, despite its required verify rule.

Interpretation: D6 is an understandable generated-only gallery/watch/publication design. A static atlas is sufficient for copy/layout review and insufficient for playback, countdown utterances, server freshness and publication transactions. The narrowed thumbnail fail-safe is intentional and explicit in §6, while its public privacy wording needs the same limit. Inherited decisions are respected; findings concern incorrect facts/receipts and missing outcomes, not reversal of the pivot.

Proposed improvements beyond findings: name Subject matching for the two-cat record; show mixed record aspect ratios so “uniform” is unambiguous; bind public catalog read views/types across Studio and Next; scope storage-tail copy explicitly to reader preferences; state public-by-address upload exposure and Cancel after upload; distinguish committed fallback from deployed/available fallback. These are handoff suggestions, not artifact edits or new product requirements imposed by this reviewer.

## Beni's adjudication items — recommendations, not answered rulings

Each recommendation is one word, first. Explanations give the reviewer’s view; Beni decides.

- **Q13 Native** — shortcuts: keep browser-owned controls; Page adds duplicate handlers/conflicts. Native browser-specific key claims in frame 8 remain unverified (no real native element in atlas).
- **Q14 Theater** — retain one page/host/element and place countdown below it; Overlay requires the D5 modal/privacy/focus obligations to continue.
- **Q15 Keep** — retain concise own terms for the stated service/content. Drop is possible; neither choice settles legal adequacy or A-06.
- **Q16 Off** — differs from Claude Design's On. Autoplay-next remains available when opted into; short illustrative clips do not justify imposing automatic audible continuation by default.
- **Q17 Key** — remember the explicit choice and disclose it, even if default Off. Differs from D6's conditional “Off implies Visit”: the defaults and memory are independent choices; Key is still useful with Off. Visit remains the alternative.
- **Q18 Remove** — no defined spoiler-light transformation remains for this gallery. Keep needs a concrete, useful effect to avoid an inert control.
- **Q19 PR** — differs from Commit: a fallback-thumbnail PR through verify (auto-merge only if explicitly authorized) retains checks while catalog publication remains immediate. Build has Storage dependency; Host changes “shipped with site”; direct Commit can currently bypass verify. No option chosen for Beni.
- **Q20 Query** — compatible with existing codecs, provided navigation merges/preserves the existing parameters and resets watch appropriately on route/tab leave. Path needs an explicit compatibility design.
- **Q21 No** — preserve the authored published-once/withdrawn history; regenerate with parent for a new version. Yes requires a separate tested relisting rule rather than an incidental button.
- **Q22 Record** — use actual dimensions and contain the full thumbnail; test mixed-ratio rows. Fixed remains the uniform-box alternative.
- **A-09 Scoped** — confirm the chosen fail-safe covers image-only failures with a readable current list; Broader requires a different catalog availability/withdrawal design and is not delivered by these copies.
- **A-10 Pause** — pause/cancel countdown and automatic start when the tab becomes hidden; Continue is D6's stated behavior. Route leave and explicit pause must always stop it either way.
- **A-11 Preserve** — retain verify before main updates for fallback delivery; Bypass is the explicit admin-process exception a direct-main Commit would use today.

A-06 remains a gate requiring an actual recorded applicability/disclosure answer from the authorized human process. I have not supplied or summarized that answer.

## Not verified — missing tests consolidated

- Historical P-22 app rect comparison: supplied path absent; requires that receipt or a separately authorized current-app browser rerun.
- Full gallery fallback/unavailable lens × theme × width matrix and mixed frame ratios: missing mounts; redraw/inheritance mapping then independent DOM measurements.
- Live filters/saves/order/refusal: requires an implementation and real state transitions; atlas controls do not implement them.
- Native video identity/controls/name/poster/preload, first-Play gating, source swaps, pause/leave/cancel/hidden races, Replay/end/errors, focus return, theater/Escape/fullscreen: requires the real player or a explicitly scoped implementation fixture.
- Once-only assistive announcement and native-key coverage in Chrome/Firefox/Safari/iOS: requires actual native video/AT walkthrough; static status markup alone does not yield utterances.
- Server read-only view boundary, Next freshness/cache invalidation, immediate Publish/Unpublish, Storage delivery/Range/play/delete/idempotency, thumbnail error chain and joint paused-project outage: requires later authorized source/runtime/network tests. Public docs are not live receipts.
- Fallback delivery through chosen protocol: token/check behavior and deploy completion/failure/retry need later authorized isolated tests. This review read rules and made no push.
- Privacy completeness/cookies/logs/analytics/font caching/storage persistence/refusal: actual migration code plus network/storage audit needed before dated “read code” copy can ship.
- A-06 substantive answer and legal adequacy: absent authorized recorded answer, not supplied by a design reviewer.
- Original Appendix S media facts/billing/provider headers: source attribution verified; private media/receipts and providers were not opened.
- Actual thumbnail content and native browser/movie-control contrast, zoom/AT/non-Chrome matrix: no media present and no full WCAG compliance claimed.

## Appendix PM ledger

Checked each PM item after the independent probe/read for its block.

- **PM-1 confirmed, scoped low:** executed root support outside six-file manifest; bytes equal today; folder hash protects this review. D-48.
- **PM-2 corrected:** required verify exists, but detailed ruleset grants admin/current-principal always bypass. Direct-main is not categorically refused; it can bypass checks. D-55; Q19/A-11. No push test.
- **PM-3 mixed:** §6/unavailable explicitly limits fail-safe to image failure with a readable current list; the narrower intent is not a spec omission. Privacy wording omits the limit, D-54/A-09. Paused-project joint outage empirical test not run.
- **PM-4 confirmed as spec mismatch:** once-per-second polite updates do not guarantee one announcement, D-50. Actual utterance count unverified.
- **PM-5 aligned:** addendum adds withdrawn and carries catalog fields/sequence; no logical naming mismatch. Physical public-view contract awaits builder implementation.
- **PM-6 confirmed:** future-app “read from code” claim/stamp lacks promised local status, D-53 and illustrative scope D-47.

## Blocks completed and verdict

All six ordered blocks completed and appended at their boundaries. Findings D-46–D-57: **3 high, 7 medium, 2 low**. No prior D-ID reused.

**Verdict: ready after named design fixes.** Resolve D-46/47/49/50/51/52/53/54/55/56 and take Q13–Q22 plus A-09–A-11 to Beni before treating D6 as the build-plan source. D-48/57 are local receipt/pin polish. Pass 1.5 should request accept/contest/recharacterize with reproduction evidence at a newly pinned export; this report does not redesign, adjudicate, build or publish anything.

## Probe corrections and boundary observations

The complete Chrome AX query timed out; scoped queryAXTree succeeded. A generated AX-selector expression initially had a syntax error and was corrected before P-18. The P-20 probe initially contained an accidental heredoc terminator as Python; it wrote outputs before raising NameError, then was repaired and rerun successfully. Only successful final outputs support the findings. Initial URL case used invalid `epl`; final P-09 rerun uses valid `pl` and confirms preservation.

Chrome's launch stderr logged background Google GCM registration errors. The captured artifact request list contains only loopback and unpkg, and no intentional Google API/provider call was made; however this launch log means I cannot certify zero browser-background Google requests. This is an execution boundary limitation, not evidence of a D6 request or privacy behavior. No account/key/spend/package install or service/project API was used. Protected paths were never opened. No design/repository file was changed; `_ds` was read in place and never copied into a repo. No commit/push/branch/PR/issue/comment/release/settings/sync operation was performed. Only the explicitly authorized detached worktree setup/removal and fetch changed Git administrative state.

Cleanup verified (P-21): detached worktree removed by the requested command; dedicated Chrome/CDP and HTTP listener closed; visible review tab closed; final whole-folder manifest identical; original checkout retains only its two pre-existing untracked skill directories. Report/probes/evidence remain outside both targets.
