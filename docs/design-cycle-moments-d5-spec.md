# Moments D5 — the design spec builders implement (archived Mon 12 Oct 2026, TZ=America/New_York)

Written by Claude Design (Fable 5.1 Extra), 11–12 Oct 2026; the D5 export's fingerprint is `ada850417ec10ef382eed98d7daa897a87fb18a735f85c154d0989911ab4e29d`. This is the text builders implement, through [moments-d5-build-plan.md](moments-d5-build-plan.md). The canvas it describes, Beni's captures and the Fergie Time mirror stay local (CLAUDE.md); frame ids and `d5/` paths below refer to that local export.

---

# Kickoff Moments — D5 spec

D5, written 12 Oct 2026, is D4 with one receipt restored: the geometry matrix G (D-45, below). Every other frame, sentence, token and ruling is byte-for-byte D4’s; the D4 text follows unchanged, and D1–D4 stay as the reviewed record.

Written 11 Oct 2026 against `main@2199649` (PR #175 merged 11 Oct; the Moments rules in `src/index.css` are unchanged since `54f7804`), beside the canvas `Kickoff Moments - D4 design canvas.html` (now `Kickoff Moments - D5 design canvas.html`). Supersedes the D3 spec. D4 is the last design delta before the implementation plan: it makes the three fixes Codex opened at Pass 2.5 (D-42, D-43, D-44) and records Beni’s eight Pass 3 rulings (A-01 to A-08, decided 11 Oct). The 20 findings closed at Pass 2.5 stay closed; D-24 closes on A-02. D1, D2 and D3 are untouched as the reviewed record. Nothing settled moves: Q1–Q12 (Q5 On by Beni’s answer, the other eleven by recommendation), Beni’s Studio rulings §15.1–15.14, his 7 Oct source rulings, GitHub Releases as the ST4 host (retained 11 Oct), the 16:9 run as specified and unrun. The one scoped exception Beni granted is A-07: one Privacy & terms link in the app’s shared chrome, reachable on every tab — this one link and nothing else; no Fixtures or Table row, column, colour, motion or content changes (§13). Precedence: the Fergie Time design system > the brief > any implementation prompt written from this. Nothing here claims a release number.

A frame on the canvas is a static receipt. It proves geometry, copy, contrast and accessible names; it does not prove playback, provider behaviour or a state machine, and nothing below says it does. Values marked **measured** come from a file or a receipt named in the brief; values marked **ILLUSTRATIVE** are invented for illustration and must not be copied into a record as fact.

## 0 · Changelog — D4 and D5, keyed by D-ID and A-ID

| ID | Sev. | Disposition | Changed in D4 — frame · file:line | Still unverified |
| --- | --- | --- | --- | --- |
| D-45 | L | Accept (D5, 12 Oct) | D4 dropped the geometry matrix G from the rendered canvas: `GeoRig` was still defined (d4/canvas.jsx:60) but the section heading and the 24 rig mounts D3 rendered (d3/canvas.jsx:245–246) were not in D4’s `App`, so the loaded D4 page had zero `G-*` frames — while the D4 response §3 claimed “Unchanged receipts — G (geometry, 24 rigs)”. D5 restores the section as D3 rendered it: the same heading and the same 24 rigs at 360 · 375 · 390 · 760 · 761 · 887 · 888 · 1000 × Ledger · Poster · Broadcast, each a frame `G-<width>-<lens>` (d5/canvas.jsx:295–296, before the Handoff frames). The rig’s “expected” column stays labelled as the canvas’s own computation (`expected from src/index.css`, computed in `GeoRig` from the cascade in §2), not an app measurement; Codex’s P-22 app measurements at Pass 2.5 are the comparison. Nothing else changes; the D4 response is left as written and the D5 response corrects its §3 claim. | — |
| D-42 | M | Accept | The privacy page’s before-Play sentence now reads: `The YouTube player loads nothing until you press Play — observed in a recorded test visit of this site’s build on 7 Oct 2026 (a loopback test with two test videos), summarised in the repository’s slice-4 spec, docs/moments-slice-4-spec.md, under “S4b, as run”; its receipts are not published. After Play, YouTube and Google may set cookies and serve ads under their own terms.` (data.js:103; §3 B2; frames 9a–d). The pointer is a repository path on `main`; no visit id, request URL or receipt is quoted. The §0b paragraph that located the visit’s receipts in the repository is corrected below: the committed receipts under `docs/verification/moments-observation/receipts/` are stub-mode runs, not that visit; the visit’s own receipts are on Beni’s Mac, uncommitted. Receipt H5 reads the sentence from the DOM of 9a–d against the deck and against this spec. | That the slice-4 summary says what it is cited for: Codex read it at Pass 2.5 (P-23, P-26); the PM seat re-reads it on the day |
| D-43 | M | Accept | The four artefacts are named accurately wherever they appear (§0b D-22 and D-26 rows, §6 B3, §7 Pass 3 table, §11): `docs/verification/moments-acceptance/edition.json` — the committed acceptance template; `docs/verification/moments-observation/edition.ts` with `generate.mjs` — a generator that writes an uncommitted test edition outside the repository; `docs/verification/moments-observation/receipts/` — committed stub-mode receipts; Beni’s own visit receipts — on his Mac, uncommitted. The observed-visit claim about the generator is removed. A-08 is recorded as decided Curated with the corrected rationale (editorial validation is separate from an explicitly synthetic verification harness). The D-22 contest stands: Codex confirmed at P-26 that commit `1fad342`’s fixtures contain the PSG v Aston Villa fixture. The canvas banner on 1a–c and the card’s note name the template (shell.jsx `ILL_CARDS`; data.js:19, 25). Receipt H5 checks the four names in the rendered spec and the absence of the withdrawn phrases on every frame. The D3 Pass 2 response is left as written; it is history. | — |
| D-44 | L | Accept | Logged: D3 withdrew D2’s promise of comma/period frame-stepping from the Review player help (`The Studio plays the local file with native controls; frame-stepping is whatever those controls offer, not promised here.`, studio.jsx:125; §3) without a changelog entry. The withdrawal stands and is now recorded here. No keyboard shortcut is required by the design; Q2’s native controls are unchanged; the implementation plan tests no shortcut unless Beni asks for one. Frame 12 probes the help line; section 12’s note records the entry. | — |
| A-01 | — | Decided 11 Oct: **Accept** | Play-as-agreement accepted as drawn, without an outside policy review: the notice in full before the first Play of a visit, the short form after, Play `aria-describedby` the notice. Both review seats had recommended Review; Beni chose Accept — recorded as such (§6 B1, §7). Every “pending A-01” label is removed (§6 B1, §11, canvas section 8). The PM15 invariant stays (§3). | — |
| A-02 | — | Decided 11 Oct: **Define** | The `#terms` section on the privacy page is Kickoff’s own terms of use for Developer Policies III.A.1 and is what S7 builds (data.js:105–108; reader.jsx:255; frames 9a–d; §1, §3 B2, §9). PROPOSED → decided. Beni, or counsel if he asks, may still edit the wording before S7, including the “personal, non-commercial … without warranty” sentence. **D-24 closes on this ruling** (§0b). | Legal adequacy: not a design question |
| A-03 | — | Decided 11 Oct: **Retain** | GitHub Releases stays the host, marked “retained 11 Oct” (§7 ST4, §10 heading; export copy data.js:128 “decided 8 Oct (ST4) and retained 11 Oct (A-03)”; frame 13). §10’s non-overwrite rule, export identity, not-Latest policy and verify-media lifecycle stay labelled proposals for the implementation plan to settle and test. Nothing else in §10 changes. The setting fact is refreshed: immutable releases off, release list empty as of 11 Oct (Codex P-19). | The proposals: implementation plan |
| A-04 | — | Decided 11 Oct: **Disclose** | Frame 13’s confirmation is the decided behaviour: the clips are public at upload, the edition changes only on Beni’s merge, and the screen states what Cancel before upload and a partial failure leave (data.js:133, unchanged text). The upload is still asked on every export. §0b D-31 row and §6 updated from “consequence to Beni” to decided. | The state machine: unbuilt |
| A-05 | — | Decided 11 Oct: **Propose** | The 10-minute ceiling stays a proposal for the Studio’s operations plan. Timed-out row now reads `No status in 10 minutes — a proposed ceiling; the Studio’s operations plan sets it (A-05). …` (data.js:122; frame 11; §3). | The ceiling: operations plan |
| A-06 | — | Decided 11 Oct: **Clarify** | A gate on the Studio’s publication step (Export, frame 13): before any generated clip is published, an explicit answer is recorded on whether EU AI Act Article 50 applies to Kickoff, and what disclosure it would need. §6 A1 stays its source. Drawn with no answer on file: a “Publication gate · Article 50” section (studio.jsx:180; data.js:131) and Confirm disabled with the reason `Unavailable: the Article 50 answer is not recorded (A-06).` (studio.jsx:187–188; data.js:132). Consequence for §8: frame 13 has 8 tab stops, not 9; Confirm enters before Cancel when the gate is recorded, as Keep does on frame 12. Nobody is named as the answerer. | Who answers, and the answer: Beni’s, outside this design |
| A-07 | — | Decided 11 Oct: **Global** | One “Privacy & terms” link in the app’s shared chrome, reachable on every tab: `ShellFoot` (`.kickoff-foot`), a `<footer>` appended in `App.tsx` after the route boundaries as the last child of the 780 px wrapper (reader.jsx:293; moments.css:135; shell.jsx:83 `AppFrame`). Nothing above it moves; the document grows by the foot’s height. D3’s per-state Moments line is folded into it (gallery, empty gallery, stage: reader.jsx:213–215, 296); the Cinema keeps its own line because the Cinema dialog is fixed over the shell (reader.jsx:232, 290). Drawn at 360 · 390 · 1000 × Fixtures · Table · Moments × Ledger · Poster · Broadcast × light · dark — 54 frames, canvas section 15 (canvas.jsx:291), each printing the link’s rect, accessible name, keyboard position and contrast; before/after position pairs in section 16 (canvas.jsx:293) with receipt H6. `?only=` and `&date=` unchanged; no storage key added. Design and reasons: §13. | The built shell: Pass 3.5 / implementation |
| A-08 | — | Decided 11 Oct: **Curated** | Q12’s rule (`source.name` ends “/ YouTube” for `provider: youtube`) validates the production curated edition `src/curated/moments.json` only. S4 test inputs keep their plainly synthetic labels (“S4 test source; content unverified”). Rationale (Codex, D-43): editorial validation is separate from an explicitly synthetic verification harness. Recorded in §6 B3 and §7; Q12 stays Yes; frame 13’s Checks row is unchanged. | The validator: unbuilt, expected |

Also in D4: §12 refreshed (main `2199649`, PR #175 merged 11 Oct with `docs/moments-content-policy.md` and “S4b, as run” on main; D3’s “PR #175 open” line was dated 10 Oct). Section 1’s frames 1a–d, section 2’s 2a and 2e and section 8’s 8a gain a probe that the shell foot’s link is the last tab stop. H3’s frame-13 count changes to 8 for the A-06 reason above. Motion sheet row 13 (the shell foot: no motion). No other frame, token, number or sentence changes.

## 0b · Pass 2 dispositions (D3), as closed at Pass 2.5 — with D4 corrections marked

| ID | Sev. | Disposition | Changed in D3 — frame · file:line | Still unverified |
| --- | --- | --- | --- | --- |
| D-21 | M | Accept · closed | §6 note on Article 50(4) with the primary text (EUR-Lex 2024/1689, Art. 50(4), 3(60), 2(10), 113); what the badge and Source & curation rows already disclose. Applicability: **A-06 decided 11 Oct (Clarify)** — a gate on the publication step, §6 A1, frame 13. | Applicability and adequacy: Beni’s, outside this design |
| D-22 | M | Accept the first part; contest the characterisation of the club names · closed, contest upheld | Frames 1a–c carry a visible ILLUSTRATIVE banner naming every invented field; frames 7a–b carry an ILLUSTRATIVE tag beside each invented value; 2a notes the invented title and note. Names: the card is captioned as a fictional selection from the committed acceptance template with fixture facts from committed snapshot 1fad342. **Corrected in D4 (D-43):** the evidence chain, as Codex traced it at P-26, is `data.js` → `docs/verification/moments-acceptance/edition.json` (the committed acceptance template, acceptance-1) → `git show 1fad342:src/data/fixtures.json`, which holds the fixture; the Fixtures tab shows the same text. `docs/verification/moments-observation/edition.ts` carries no literal names — it is a generator (with `generate.mjs`) that writes an uncommitted test edition outside the repository — and is not the evidence. The contest stands. | — |
| D-23 | L | Accept · closed | Source line DOM reads `Kickoff Studio · Generated · fictional players · no fixture` (reader.jsx:53); credit banner quotes fal’s sentence (data.js:118); frame 11. | — |
| D-24 | H | Accept · **closed in D4 on A-02 (Define)** | Terms of use section at `#terms` on the same static page, statement verbatim in §3 (data.js:106–108; reader.jsx:255), drawn on 9a–d, reached from every reader state through the shell foot (A-07) and the Cinema line (D-25) and from the notice. Decided 11 Oct: this is what S7 builds; wording editable by Beni or counsel before S7. | — |
| D-25 | M | Accept · closed | In D3: `.moments-foot` at the foot of every reader state. **In D4 (A-07):** the gallery, empty-gallery and stage lines fold into the shell foot (`.kickoff-foot`, reader.jsx:293), which follows every route on every tab; the Cinema keeps `.moments-foot` (reader.jsx:232). The policy stays one link from every Moments state; receipts: tabstop probes on 1a–d, 2a, 2e, 8a; name probes on 3a–b. | Keyboard path: a static receipt; the built shell is Pass 3.5’s |
| D-26 | M | Accept · closed | The YouTube item’s source is a fictional, ILLUSTRATIVE “Illustrative Channel / YouTube” on card, stage and Cinema, with its watch link (data.js:22); frames 1a–c, 8a–d. **Corrected in D4 (D-43):** Q12’s scope, §6 B3 — the rule validates `src/curated/moments.json`; the committed acceptance template (`moments-acceptance/edition.json`) and the generator’s uncommitted test edition are not validator inputs and are not changed. **A-08 decided 11 Oct: Curated.** | The validator rule itself: unbuilt, expected |
| D-27 | M | Accept · closed | §9 delivery contract: own stylesheet with the token block copied from `src/index.css`, the same font links as `index.html`, theme from `prefers-color-scheme` without JavaScript and from the stored `kickoff-theme` with it, a hand-set stamp refreshed in the S7 PR. 9a–d drawn in both themes at 390 and 1000. | The exported file with JavaScript disabled: S7 |
| D-28 | M | Accept · closed | Cascade reproduced (moments.css:29, 44, 102, 115); probes under 1a–c, 2a, 2e, 3a–b, 8a–d and the geometry matrix G at 360 · 375 · 390 · 760 · 761 · 887 · 888 · 1000 × three lenses. Codex’s P-22 matched the real app in 48 cells at 0.02 px. | — |
| D-29 | M | Accept · closed | Aspect-preserving picture: `ClipPicture` computes the contain rect from the box and prints it (reader.jsx:84). Frames 2b–e, 3a–b, 5a–c, 12; A 320 × 200 · 320 × 200 · 568.8 × 355.5 (bars 0 · 15 · 31.6); C 320 × 180 · 350 × 196.9 · 632 × 355.5 (10 · 1.6 · 0 px). | A real hosted video’s `object-fit: contain`: implementation |
| D-30 | H | Accept · closed | No immutability promise; the setting (off as of 11 Oct, Beni’s) would prevent replacement; the recorded SHA-256 detects it (data.js:128); frame 13; §10. **Host retained 11 Oct (A-03).** | Setting and negative replace/delete test: not run |
| D-31 | H | Accept · closed | Confirmation separates “uploading publishes these clips now” from “the edition changes only when Beni merges”, and says what Cancel and a partial failure leave (data.js:133); frame 13. **Decided 11 Oct (A-04 Disclose): this is the behaviour.** | The state machine: unbuilt |
| D-32 | M | Accept · closed | Privacy copy names GitHub as provider in wording that survives a redirect-domain change (data.js:110); the Addresses row says “the release address, never the signed redirect” (studio.jsx:175); frames 9a–d, 13. | Redirect domain on publication day |
| D-33 | M | Accept · closed | Proposals under A-03 (host retained; the proposals stay proposals): tag `media-<yyyymmdd>-<8 hex>`, retry-safe; `make_latest=false`; media tags separated from v* tags (data.js:134; studio.jsx:174); §10; frame 13. | Same-day and retried exports: implementation plan |
| D-34 | M | Accept · closed | `validate-moments` at build, offline; `verify-media` on the export PR only (data.js:129); §10; frame 13. | Offline build and changed-remote-file proofs: implementation plan |
| D-35 | M | Accept · closed | §10 states each limit as what it is. | — |
| D-36 | M | Accept · closed | 10 minutes labelled a proposal (data.js:122); **A-05 decided 11 Oct: Propose** — the operations plan sets it. | The ceiling: operations plan |
| D-37 | M | Accept · closed | Two substates of Completed drawn and written (data.js:124–125; studio.jsx:84–85); frame 11. | fal’s result-expiry window |
| D-38 | H | Accept · closed | Export sentence scoped to what the PR and the release carry (data.js:127); frames 10, 13. | — |
| D-39 | H | Accept · closed | Every field and group named (studio.jsx:25, 40, 143); receipt H3; §8. **D4:** frame 13’s Confirm disabled behind the A-06 gate → 8 stops. | A screen-reader walkthrough on the built Studio |
| D-40 | M | Accept · closed | Billed dollars, measured output duration and billable units separated (studio.jsx:129); frame 12. | Billable units: no public record |
| D-41 | L | Accept · closed | §5: pending billed on bg, dark, 11.21; H1 measures it live. | — |

Overturned in Pass 1 and not touched: PM3, PM4, PM9, PM10, PM14 (withdrawn; §5).

PM-seat corrections folded into D3, with the D4 correction: the before-Play sentence on the Privacy page is attributed to the recorded 7 Oct test visit of this site’s build (a loopback test with two test videos), whose public record is the “S4b, as run” section of `docs/moments-slice-4-spec.md` — on `main` since PR #175 merged 11 Oct. **Correction (D-42):** D3 located that visit’s receipts in the repository; they are not there. The receipts committed under `docs/verification/moments-observation/receipts/` (including `network-proofs.json`) are stub-mode runs, not that visit; the visit’s own receipts are on Beni’s Mac, uncommitted, and are not cited. The fonts sentence allows for the browser cache.

PM15 (Developer Policies III.C), not a finding: what any future notice wording must keep is in §3 under the notice.

## 1 · Component inventory, with states, and where each lands

| Component | States | Lands |
| --- | --- | --- |
| `KindBadge` — `<span class="moments-kind" data-kind="generated">Generated</span>` | one state; rendered from `record.kind`, never from a setting; present on card eyebrow, stage source line, Cinema source line; queue rows carry the word in their small line | R1 (reader) |
| `Cover` family `studio` — word STUDIO, hairline-frame motif, label "Original typographic art · the generated clip plays here after Play" | one state; spoiler-light leaves it unchanged | R1 |
| `Facts` for the generated kind — two lines: fictional players · no fixture; duration · size · mime | one state | R1 |
| `SourceLine` for the generated kind — `Kickoff Studio · [Generated] · fictional players · no fixture` (DOM text with the separators, D-23) | one state | R1 |
| `SourceLine` for a YouTube item — `<Channel> / YouTube · <description>`; the link text carries the same name | one state; spoiler-light hides the description, never the name | R1 |
| `Card` with `data-kind` — eyebrow Studio + badge; no outbound link (C3) | normal; saved; save-refused (existing) | R1 |
| `PlayerBox` hosted — one host; cover before Play; `<video controls playsinline preload="none">` shown while a hosted item is live, hidden otherwise; `src` set only at Play; no poster; `object-fit: contain`; `aria-label="Generated clip: <title>"` | ready · playing · paused · ended · error(2 network · 3 decode · 4 not supported) · aborted(1, returns to ready) | R2 |
| `PlaybackActions` — Kickoff's Play/Pause/Replay/Retry drives the element; label follows `play`/`pause`/`ended`/`error` events | Play · Pause · Replay · Retry; status line per state; notice slot (YouTube only) | R2, S7 |
| Status line (`data-player-status`) — reads the element: ready, sound on, muted, paused at t of d, ended | five texts | R2 |
| `Recovery` hosted — heading + body, keyed to `MediaError.code` | network · decode · notfound | R2 |
| `Provenance` ("Source & curation") generated rows — who/when, model + pin + resolution + seed, expansion, prompt as submitted, attestation, parent, file + SHA-256 prefix, soundtrack, host line, watched line | closed · open; spoiler-light appends one sentence | R1 |
| `Filters` — Category gains `Studio`; Newest sentence gains one clause | existing states | R1 |
| `Queue` row — small line gains `· Generated` | existing states | R1 |
| `ShellFoot` (`.kickoff-foot`, NEW in D4, A-07) — one line, "Privacy & terms" linked, appended in `App.tsx` after the route boundaries, last child of the 780 px wrapper; present on Fixtures, Table and Moments in every state the shell renders | one state | App shell (S7) |
| `Foot` (`.moments-foot`, D3, D-25) — the same line inside the Cinema dialog, under the neighbours; the Cinema is fixed over the shell, so the shell foot is not reachable from it | one state | R1 Cinema (S7) |
| `Notice` (`.moments-notice`, `id` referenced by Play's `aria-describedby`) | full (before first Play of the visit) · short (after); in-memory flag, no storage. Mechanism accepted 11 Oct (A-01) | S7 |
| Privacy and terms page `public/privacy.html` — sections: stored, who sees a visit, YouTube, Terms of use (`#terms`, decided 11 Oct — A-02), hosted clips, changes, stamp | one page, both themes, 390 and 1000; delivery contract §9 | S7 |
| `StudioShell` — wordmark, loopback address, provenance meta (amber), balance/session/caps/db meta, TabNav Compose · Jobs · Review · Export | db reachable · db paused · credit exhausted | ST3 |
| `Composer` — subject, stripped-photo tiles, keyframe rows, canvas ratio, clip rows, motion prompt, seed, expansion; every control named (§8) | editable · budget-refused (Submit disabled with reason) · db-paused (Submit disabled) | ST3 |
| `Estimate` card — Now (to 14 Oct) / From 15 Oct columns, three cap bars, Submit | before submit; after submit the billed column replaces estimates row by row | ST3 |
| `Jobs` table + `spill` state pill | draft · budget-refused · submitted · queued · in-progress · completed (substates: download failed — recoverable, Retry download; result expired — Regenerate only) · downloaded · kept · exported · discarded · failed · refused · timed-out · cancelled; billed `pending` in amber italic until the response header arrives; `unknown` for timed-out and cancelled until reconciled | ST3 |
| `Banner` | database-unavailable (amber, ledger voice) · out-of-credit (ink, a state) | ST3 |
| `Review` — local video with native controls (no frame-step shortcut promised, D-44), file facts, lineage list, Regenerate, checklist (5 × Clear/Present/Unsure, each group named by its question), Keep/Discard, attestation preview | unanswered · partly answered (Keep disabled, reason line) · all Clear (Keep enabled) · kept · discarded | ST3 |
| `Export` — PR contents table, media-upload question (asked every export), release identity, addresses, branch/title/checks, **Publication gate · Article 50 (A-06)**, Confirm (publication stated) | gate not recorded (Confirm disabled with reason — drawn) · gate recorded: upload now · PR without upload (draft; publication check fails until files exist) · PR opened · upload failed part way (release kept, no PR, both clips listed again) | ST3 |

**Decided 8 Oct (Q9):** the fourteenth job state `exported` (kept → exported, carrying the PR number) so a clip is exported once; Export never lists it again. Drawn on artboard 11 in the ink voice. The two Completed substates (D-37) are substates, not states: the ledger value stays `completed`.

## 2 · Tokens reused or added

Reused, no change: `--bg --surface --surface-alt --text --text-secondary --pitch --floodlight --floodlight-bg --accent --line --line-strong --media --font-display --font-sans --font-mono`, radii 4 px / 9999, hairlines 1 / 1.5 / 3 px, the 44 px control height, `.label-caps`, the StatusPill geometry (9 px, 700, .05em, 4 px corners).

Added, each a design-system change:

- `.moments-kind` — the Generated badge: StatusPill geometry, `background: var(--text); color: var(--bg)`. New use of an existing pair (the `moments-primary` inverse). Decided 8 Oct (Q1). Not amber: amber means "check this number's provenance"; a kind label is a fact about the clip, not a doubt about a number.
- Cover family `studio` (word STUDIO) — a fourth typographic cover. Decided 8 Oct (Q4).
- `.moments-notice` — 11.5 px / 1.6, `--text-secondary`, max 62ch, link underlined in pitch. One slot, two wordings.
- `.kickoff-foot` (NEW in D4, A-07) — the shell foot: 11 px / 1.5, `--text-secondary`, hairline top (`--border`), 24 px above, 12 px padding above the text; the link underlined in pitch, `text-underline-offset: 3px`. In the app: `mt-6 border-t border-line pt-3 text-[11px] text-ink-secondary`, the link `text-pitch underline underline-offset-[3px]`. The existing pairs; nothing new to measure beyond §5’s foot and link rows — the per-lens, per-theme readings are printed under each frame of section 15.
- `.moments-foot` (D3, D-25) — the same values, now the Cinema’s line only.
- `.spill[data-voice]` — Studio state pill voices: neutral (outline), muted, ink (exported), pitch (kept), alarm (failed, timed-out, on `--accent-strong`). In dark the pitch and alarm pills use `var(--bg)` as text.
- `.studio-banner[data-kind='ledger']` — amber banner for database-unavailable, the StalenessBanner idiom.
- Cap bars — `--surface-alt` track, `--ink` fill, `--ink-muted` for the pending addition.
- `public/privacy.css` — not a token change: a copy of the token block, see §9.

Canvas-only chrome, not product: the ILLUSTRATIVE tags and banners (`.ill-tag`, `.ill-banner`), the probe lines under frames, the receipts H1, H3–H6, the geometry rigs, and the Fixtures/Table route excerpts (`.fx-*`, `.tb-*`) drawn for section 15 with the design system’s primitives.

Design-system drift found, to re-sync (the app `src/index.css` is the source of truth the DS mirrors):

- `--ink-muted`: DS carries #8a9284 light / #6e8074 dark (2.95:1 and 4.18:1 on bg); the app carries #646c61 / #8a9c8e (4.99:1 and 6.04:1). The canvas uses the app's values.
- Missing from the DS tokens, present in the app: `--media`, `--floodlight-strong`, `--accent-strong`, `--accent-lead`, `--lens-accent`, `--on-accent-lead`, `--accent-lead-strong`. The canvas defines them per frame exactly as `src/index.css` does.
- `TabNav` draws its underline in pitch in every lens; the app's underline follows `--accent-lead` (floodlight in Broadcast). Noted, not changed.

Canvas translation of the app’s cascade (D-28), so the frames judge what the app renders: Tailwind’s `@variant poster/broadcast` (a `:where()` custom variant, specificity 0,1,0) becomes `.selector:where([data-lens='poster'] *)`; the viewport media queries at 888 and 760 become container queries on the frame; `100vw` becomes `100cqw`; the Cinema 888 rule follows its base rule as in the source. The numbers are the app’s: 888, 760, 780, 1120, 300, 28, 480, 200.

## 3 · Copy deck — every sentence, verbatim

Badge and lines (from `record.kind`):

- `Generated`
- `Kickoff Studio · Generated · fictional players · no fixture` (DOM text, separators included — D-23)
- Queue small line suffix: `· Generated`
- Category option: `Studio`
- Cover word: `STUDIO`
- Cover label: `Original typographic art · the generated clip plays here after Play`
- Facts: `Fictional players · no fixture, no kickoff` / `15 s · 768 × 480 · video/mp4`

YouTube item source (B3, Q12), from the record: `<Channel> / YouTube`; link text `Open at <Channel> / YouTube ↗`. The canvas draws a fictional `Illustrative Channel / YouTube` (ILLUSTRATIVE).

Shell foot (A-07) and Cinema line (D-25), one text: `Privacy & terms` (the link, `href="./privacy.html"`) ` · what Kickoff stores, who sees a visit, the YouTube terms`. The link’s accessible name is its text, `Privacy & terms`.

Empty gallery (frame 1d), the app’s own NoResults sentences (`MomentsPage.tsx`), unchanged: `No selections match.` / `No selection is active. Clear filters to browse this edition.` / button `Clear filters`; the filters follow in `.moments-browse-controls` as the app places them.

Status lines (read from the element):

- `Nothing is fetched until Play.`
- `Sound on · the soundtrack is generated. Mute in the player.`
- `Muted · the soundtrack is generated. Unmute in the player.`
- `Paused at 0:07 of 0:15.`
- `Ended. Replay starts from the beginning.`

Hosted recovery (A5), keyed to `MediaError.code`; `Next opens “<title>”.` follows the D-18 punctuation rule in `momentsRecovery.ts`:

- 2 network — heading `The clip did not arrive.` body `The media host did not answer, or the connection dropped. The cause is unknown. Retry asks for the file again. Next opens “<title>”.`
- 3 decode — heading `The clip arrived but will not decode.` body `This browser could not decode the file. Retry will not change that; another browser may. Next opens “<title>”.`
- 4 not supported / not found — heading `No playable file at the published address.` body `The media host served nothing this browser can play. The record is unchanged. Next opens “<title>”.` (PM4: a 404 and undecodable bytes both report code 4 in Chrome; this one sentence covers both.)
- 1 aborted — no panel; the stage returns to Play.
- Hosted timeout (no `loadeddata` within the existing wait) reuses the network sentence; to the browser the two are the same unknown.

Provenance rows (A6), under the existing summary `Source & curation`:

- `Kickoff Studio · generated <when> · reviewed and kept <when>`
- `Model <endpoint> · pinned <date> · <resolution> · seed <seed> · Prompt expansion ran · <mode>` (or `Prompt expansion did not run`)
- Eyebrow `Prompt, as submitted` then the prompt text in quotation marks
- `Fictional players. Fenway and Frankenstein are cats. No real club, player, kit, crest, sponsor or competition is depicted or intended. Policy v<n> · fictionalOnly true · checklist walked by <who> <when>.`
- `Regeneration of <parent id> (<outcome> <date>).` or `First generation; no parent.`
- `File video/mp4 · <duration> s · <w> × <h> · SHA-256 <8 hex>…<4 hex>`
- `Soundtrack AAC stereo, generated with the picture.`
- `Hosted clip. The media host is named on the Privacy page and sees each play. There is no outside page for a generated clip.`
- `Opening a selection does not mark it watched.` (existing)
- Spoiler-light on: `Spoiler-light changes nothing on a generated clip: there is no result to hide, and the Generated label is never hidden.`

On the canvas (D-22) the SHA-256, every date, the seed, the pin date, the prompt, the walker, the parent id and the permission `checkedAt`/basis are ILLUSTRATIVE and tagged where drawn; duration (15.084 s), frame (768 × 480) and size (10.0 / 10.4 MB) are measured (Appendix S).

Filters (A7):

- `Newest uses confirmed fixture times, with editorial ties. Unconfirmed times follow in Beni’s order. Generated clips have no fixture and follow last, in Beni’s order.`

YouTube notice (B1), one slot, Play `aria-describedby` it. Mechanism accepted 11 Oct (A-01). Wording may change without layout change, within the invariant below:

- Full: `Play loads YouTube’s player. YouTube and Google may set cookies and show ads. Pressing Play agrees to the Privacy page.` ("Privacy page" is the link.)
- Short: `Plays on YouTube · Privacy` ("Privacy" is the link.)
- Invariant (PM15, Developer Policies III.C — a feature that starts a user action on a YouTube resource must be clearly and unequivocally identifiable as a YouTube action): any wording names **YouTube** as what Play starts, in the slot the Play button is `aria-describedby`, present before the first Play of the visit and in the short form after; the name may not be dropped, abbreviated, or replaced by a mark or colour alone. A wording that fails this is a layout change, not a copy change, and reopens B1.

Privacy and terms page (B2), `public/privacy.html`:

- Eyebrow `Kickoff · Privacy`; h1 `What this site stores, and who sees a visit.`
- `Kickoff is a static site. It has no accounts, no analytics, no beacons and no tracking code. This page lists everything it stores and every third party a visit reaches. Read from the code on 2026-10-08.`
- `Stored in your browser` — `Three browser-storage keys. No cookies.` — `kickoff-theme — Your light or dark choice.` — `kickoff-theme-broadcast — The theme choice kept for the Broadcast lens.` — `kickoff-moments-saved-v1 — The Moment references you saved.` — `Clearing site data in your browser removes all of it. Nothing is stored anywhere else.`
- `Who sees a visit` — `GitHub Pages serves the site and sees each request, as any web host does.` — `Pages fetch their fonts from Google Fonts (fonts.googleapis.com, fonts.gstatic.com) unless your browser already has them cached, so Google can see visits.`
- `YouTube` — `Kickoff uses YouTube API Services to play curated highlights from rights holders’ official channels. YouTube is the source of every such clip; each card and stage names the channel and links the watch page.` — `The YouTube player loads nothing until you press Play — observed in a recorded test visit of this site’s build on 7 Oct 2026 (a loopback test with two test videos), summarised in the repository’s slice-4 spec, docs/moments-slice-4-spec.md, under “S4b, as run”; its receipts are not published. After Play, YouTube and Google may set cookies and serve ads under their own terms.` (D-42: attributed to the recorded test visit; the public summary is on `main`; no id or URL quoted) — `Pressing Play agrees to this page, to YouTube’s Terms of Service and to Google’s Privacy Policy.` — links `Google Privacy Policy — http://www.google.com/policies/privacy` and `YouTube Terms of Service — https://www.youtube.com/t/terms`
- `Terms of use` (`#terms`; decided 11 Oct, A-02 Define; D-24, Developer Policies III.A.1) — `Kickoff is a personal, non-commercial reference site, offered as it is, without warranty.` — `By using Kickoff you agree to be bound by the YouTube Terms of Service.` — `Kickoff uses YouTube API Services. What YouTube and Google receive after you press Play is governed by Google’s Privacy Policy.` — the same two links. Beni, or counsel if he asks, may edit the wording before S7, including the first sentence. Access path: the shell foot on every tab (A-07); the Cinema’s line; the notice’s link; the page’s own heading.
- `Hosted clips` — `Not yet published. When generated clips arrive they will be served by GitHub from this repository’s releases — the provider that already serves the site. Your browser follows GitHub’s redirect to a GitHub download host (observed 8 Oct 2026: release-assets.githubusercontent.com; re-checked before any clip is published). GitHub sees each play as it sees each page load. No new third party.` (D-32)
- `Changes` — `This page is dated and lives in the repository. Changes are visible in its history.`
- Stamp `Read from the code on 2026-10-08 · kickoff v0.5.2` · `← Back to Kickoff` — the 8 Oct audit; how S7 refreshes it is §9.

Studio:

- Database banner: `Database unavailable. The Studio’s records live in a Supabase project that pauses after a week idle on the free plan. Every paid submit is refused until it is back, because the estimate and the ledger line are written first. Drafts and the local cache still work. Restoring is one click in Supabase’s dashboard: open the project and choose Restore.`
- Credit banner: `Out of credit. fal answered “User is locked. Reason: Exhausted balance”. This is a state, not an error. Top up by hand at fal; the balance stays at or below $9.37. Submits resume when fal answers.` (D-23: the quotation marks are in the DOM.)
- Refused row: `Refused by the model’s safety checker. Not a failure of the Studio; never retried on its own.`
- Completed row: `Completed means finished, not succeeded. The result’s HTTP status decides.`
- Completed · download failed (D-37): `Completed; the download failed. The result is still at fal. Retry download fetches it again — no new generation, no new charge. Result expiry: unknown until read from fal’s documentation; shown here as unknown.` Action `Retry download · no new charge`.
- Completed · result expired (D-37): `Completed; the result expired at fal before a download succeeded. The charge stands. Nothing to download: Regenerate (a new generation, this one as parent) is the only path.` Action `Regenerate · est. $<n>`.
- Timed-out row (D-36; A-05 decided 11 Oct: Propose): `No status in 10 minutes — a proposed ceiling; the Studio’s operations plan sets it (A-05). The charge is unknown until the ledger is reconciled with fal’s history. A timeout is never treated as a cancellation.`
- Photos (composer, unchanged): `Photos stay on this Mac. What fal receives is a stripped copy: no EXIF, no location, no device. Nothing on this page shows where a photo was taken.`
- Canvas help: `16:10 is what every H3 image-to-video clip so far measures (Appendix S; that appendix’s other models and aspects are not this series). 16:9 is UNVERIFIED (H3 takes its canvas from the input image). The verification run, decided 8 Oct: crop the existing K0 to 768 × 432 locally (free), one 5 s 480P clip ($0.075), pass if ffprobe reports a 16:9 frame. Pass flips this default to 16:9; fail closes the question at 16:10 with the bars.`
- Review billed row (D-40): `$0.225 billed (Appendix S) · output 15.084 s, measured · billable units: in no public record — ILLUSTRATIVE until read from fal’s response header`
- Review player help (D-44, logged): `The Studio plays the local file with native controls; frame-stepping is whatever those controls offer, not promised here.` No keyboard shortcut is required by the design.
- Checklist lines: `Extra players or officials` · `Text on boards, shirts or screens` · `Logo-like or crest-like marks` · `The subject’s identity and posture` · `The soundtrack`; answers `Clear · Present · Unsure`
- Checklist rule: `Every model in the spike added marks, text or players nobody asked for; a prompt cannot stop it. Keep needs five Clear answers. Present or Unsure leaves Keep unavailable: discard, or regenerate with this generation as parent.`
- Attestation: `policy v1 · fictionalOnly true · checklist walked by <who> · <when> · 5 of 5 clear · answers recorded per line`
- Export photos (D-38): `Clip sizes are measured (Appendix S). The PR and the release carry records and clips only: no photograph and no stripped copy. What fal received is stated on the composer.`
- Export upload (D-30, D-31, D-33; A-03 retained 11 Oct): `Host, decided 8 Oct (ST4) and retained 11 Oct (A-03): GitHub Releases, the provider that already serves the site. Upload creates one release for this export and one asset per clip, named by assetId, and marks the release not Latest. Uploading publishes both clips now, at the addresses below, to anyone with the address — before the PR is merged. Assets are not immutable unless the repository’s immutable-releases setting is on (off as of 11 Oct; Beni’s to set). The record carries each file’s SHA-256, so a replaced file fails the publication check — detected, not prevented. Without the upload the PR opens draft and the publication check fails until the files exist.`
- Export release row: `media-<yyyymmdd>-<8 hex> · not Latest · not a v* tag` (identity a proposal under A-03; the drawn value ILLUSTRATIVE)
- Export addresses row: `github.com/BeniCheni/kickoff/releases/download/media-<id>/<assetId>.mp4 — the release address, never the signed redirect`
- Export checks (D-34; Q12 scope A-08 Curated): `validate-moments runs at build, offline: the schema, and for provider youtube that source.name ends “/ YouTube” (Q12). verify-media runs on this PR only, for records whose file address changed: HTTP 200, Content-Length equal to the recorded size, SHA-256 of the fetched bytes equal to the recorded hash. A failure makes the PR red. The build never fetches a clip. The edition stays unchanged until Beni merges.`
- Export gate (A-06, decided 11 Oct: Clarify), section `Publication gate · Article 50`, row `Gate`: `Before any generated clip is published, an explicit answer is recorded on whether EU AI Act Article 50 applies to Kickoff, and what disclosure it would need (A-06; source: spec §6 A1). Answer on file: none. Export stays unavailable until one is recorded.` Confirm reason line (role status): `Unavailable: the Article 50 answer is not recorded (A-06).`
- Export confirm (D-31; A-04 decided 11 Oct: Disclose): `Uploads the two clips first, then opens a draft PR from this Mac with Beni’s GitHub token. The clips are public from the upload; the edition changes only when Beni merges. Cancel before the upload leaves nothing behind. If the upload fails part way, the release stays with the assets that arrived, no PR is opened, and Export lists both clips again, naming that release.` Button `Upload 2 clips, then open draft PR` (disabled while the gate has no answer on file); `Cancel`.
- After the PR: `The two jobs move from kept to exported in the ledger, with the PR number (decided 8 Oct, Q9). A clip is exported once; Export never lists it again. Export identity (proposal under A-03): media-<yyyymmdd>-<8 hex of SHA-256 over the sorted assetIds>, so a retry finds the same release and uploads only what is missing; a second export the same day of other clips gets another tag. Media tags never become Latest and are not v* tags.`

## 4 · Motion spec

Extension: none. The budget stays 150 ms ease · 180 ms cubic-bezier(.2,.7,.2,1) · 220 ms ease · the marquee. Reduced motion unchanged. Zero-dependency (15.10); `motion/mini` not needed; no exception written. Receipt H4 reads every rendered frame’s computed motion: zero named animations; the only non-zero transition is the design system’s CompetitionChip opacity on `--motion-expand` (150 ms, the budget’s first token), present only where the section 15 Fixtures and Table excerpts draw that chip; the Broadcast ticker on those frames is drawn static. The only reduced-motion rule loaded is the design system’s token collapse.

| Candidate | Trigger | If animated: duration · easing · API | Reduced motion | Decision |
| --- | --- | --- | --- | --- |
| Cinema enter and leave | Enter/Exit Cinema, Escape | 220 ms ease opacity on the chrome only, host excluded · `element.animate` | opacity already | No new motion. Declined 8 Oct (Q7) |
| Cover → video at Play | Play press | none · display swap | — | No new motion; matches the YouTube frame today |
| Hover on the video | pointer | none; UA control auto-hide is browser chrome | — | No new motion |
| Generated badge | never | none | — | No new motion; a fact, not an event |
| Notice full → short | first Play of the visit | none · text swap | — | No new motion |
| Sound-state line | volumechange, play, pause, ended | none · text swap | — | No new motion |
| Recovery panel | error event | none, as today | — | No new motion |
| Studio job progress | status polling | none · elapsed timer text once a second | — | No new motion; no percentage exists to show |
| Studio banners | state change | none | — | No new motion |
| Keep enabling | fifth Clear | none · disabled toggles | — | No new motion |
| Estimate cap bars | edit | none · widths on render | — | No new motion |
| Source & curation details | toggle | none today | — | No new motion |
| Shell foot (A-07, new in D4) | never | none | — | No new motion; hover is the link’s colour shift only |

## 5 · Artboards and measured contrast

Artboards (D5 renders every one listed, including G — D-45): 1a–c cards at 390 in three lenses · 1d filtered-empty gallery · 2a–d stage at 390 · 2e stage at 1000 · 3a Cinema 1000 · 3b Cinema 360 · 4a–b sound on / muted · 5a–c frame ratio at 360, 390, 1000 with the measured box and picture · 6a–c recovery · 7a provenance open · 7b spoiler-light on · 8a–d notice (stage 390 full, 360 short, 360 full, Cinema 1000) · 9a–d privacy and terms · 10 composer 1280 · 11 jobs 1000 · 12 review 1280 · 13 export 1000 (gate not recorded) · 14 motion sheet · **15 the shell foot: 54 frames, Fixtures · Table · Moments × 360 · 390 · 1000 × Ledger · Poster · Broadcast × light · dark, ids `15-<fx|tb|mo>-<width>-<lens>-<L|D>`** · **16 before/after pairs: 9 pairs, ids `P-<fx|tb|mo>-<width>-before|after`, Ledger light** · G geometry matrix (8 widths × 3 lenses) · H1 contrast · H2 this spec · H3 accessible names · H4 motion inventory · **H5 D-42/D-43 text, DOM against deck and spec** · **H6 positions before and after**. Each frame's label reports `scrollWidth = width`; frames with probes print measured values beside the expected ones.

Measured boxes (the stage anchor / Cinema slot, `aspect-ratio 16/9; min-height 200px`, in a gallery that outdents to `min(100vw − 40px, 1120px)`): 360 → 320 × 200; 390 → 350 × 200; 1000 → 632 × 355.5. Picture rects under `object-fit: contain` (D-29): a 768 × 480 clip → 320 × 200 · 320 × 200 · 568.8 × 355.5, bars 0 · 15 · 31.6 px each side; a 16:9 clip → 320 × 180 · 350 × 196.9 · 632 × 355.5, bars 10 · 1.6 · 0 px top and bottom (the 200 px floor).

The shell foot (A-07): width 320 · 350 · 740 at 360 · 390 · 1000 (the shell column; the Moments gallery outdents to 960 at 1000 and the foot does not follow it); outer height 53.5 px where the line fits on one line (1000: 24 margin + 1 hairline + 12 padding + 16.5 text) and 70 px where it wraps to two lines (360 and 390) — the amount every tab’s document grows by; each frame of section 15 prints the measured rects (740 × 29.5; 320 × 46; 350 × 46, margin excluded).

Contrast, WCAG relative luminance, light / dark (H1 measures the same pairs live from resolved tokens; the foot and link pairs are also measured per frame in section 15 against each frame’s own ground — Ledger, Poster and Broadcast share the same `--bg`, `--text-secondary` and `--pitch`, so the readings repeat):

| Pair | Light | Dark | Note |
| --- | --- | --- | --- |
| Generated badge, bg text on ink fill | 15.19 | 14.99 | new use of an existing pair; also the Studio’s exported pill |
| Ink on surface | 16.57 | 12.98 | |
| Ink-secondary on bg (status, notice, foot, shell foot) | 6.00 | 8.55 | A-07: the shell foot’s text, every tab |
| Ink-secondary on surface (cards) | 6.54 | 7.40 | |
| Ink-muted, app value, on bg | 4.99 | 6.04 | DS mirror: 2.95 / 4.18 — re-sync |
| Pitch link on bg | 4.82 | 7.75 | A-07: the shell foot’s link, every tab |
| Floodlight-strong on floodlight-bg (db banner) | 4.95 | 8.22 | dark composited over bg |
| Floodlight-strong on bg (pending billed) | 5.18 | 11.21 | D-41 |
| Kept pill: white / bg on pitch | 5.26 | 7.75 | dark uses bg as text |
| Failed pill: white / bg on accent-strong | 5.58 | 8.98 | dark uses bg as text |
| Ink on surface-alt (costs) | 13.76 | 11.61 | |
| Ink-secondary on media (photo tiles) | 4.95 | 9.13 | |
| Ink-muted on surface (table headings) | 5.44 | 5.23 | |
| Media bars vs bg (non-text) | 1.21 | 1.07 | no requirement |

Withdrawn (PM14): D2 §5’s line “the reader's LIVE and Today pills draw white on accent/pitch in dark at 1.96 and 2.27”. The shipped app uses the theme background as text in dark (`dark:text-bg` on LIVE, `text-on-accent-lead` on Today): 8.98 and 7.75, Broadcast 11.21. Not an app defect; nothing to reopen.

## 6 · Decisions, with reasons — decided 8 Oct, with the 11 Oct rulings folded in

- **A1 badge (Q1 ink inverse)** — see §2. **Article 50(4) note (D-21, brief A1):** Regulation (EU) 2024/1689, EUR-Lex `https://eur-lex.europa.eu/eli/reg/2024/1689/oj`. Article 50(4), first subparagraph, puts a disclosure duty on deployers of AI systems that generate or manipulate image, audio or video content constituting a deep fake, and limits it, where the content is part of an evidently artistic, creative, satirical, fictional or analogous work, to disclosing the existence of such generated content in an appropriate manner that does not hamper the display or enjoyment of the work. Article 3(60) defines a deep fake as content that resembles existing persons, objects, places, entities or events and would falsely appear authentic or truthful. Article 2(10) excludes, for deployer obligations, natural persons using AI systems in a purely personal non-professional activity (Codex P-29: read within that deployer-duty context, not as a universal exemption). Article 113 applies Article 50 from 2 August 2026. What the reader already discloses: a persistent text label `Generated` on card, stage and Cinema, rendered from `record.kind` and never hidden by spoiler-light; the Source & curation rows naming the generator, model, pin date, prompt as submitted and the attestation (“No real club, player, kit, crest, sponsor or competition is depicted or intended”); a subject that is a cat in plain kit. That is the lighter 50(4) form drawn, if the Article applies. **A-06, decided 11 Oct (Clarify):** whether it applies, and what disclosure it would need, is answered explicitly before any generated clip is published — a gate on the Studio’s publication step (frame 13, §3 Export gate). This note is that gate’s source. No ruling is made here, and nobody is named as the answerer.
- **A2 controls (Q2 native)** — Native controls on the `<video>`, shown only after Play; Kickoff's Play/Pause/Replay/Retry keeps driving it so both kinds share one action row. Reasons: zero dependency, keyboard and fullscreen for free, the UA's chrome plays the part YouTube's chrome plays for the other kind, and nothing is ever drawn over the picture. Focus: Play moves focus to the video (the existing player-sentinel pattern); Pause from Kickoff's button keeps focus on the button; Escape in Cinema exits as today. **Poster: none (Q3).** No frame-step shortcut is promised (D-44).
- **A3 sound (Q5 on — Beni’s one explicit answer)** — Sound on at Play, as YouTube items play; the status line reads the element; the native control is the only mute. No per-item `startMuted`: with Q10, a Present or Unsure soundtrack blocks Keep, so a kept clip has a Clear soundtrack by construction.
- **A4 frame ratio (Q6 bars)** — Accept the bars in the reader (one box for both kinds, `object-fit: contain`, bars in `--media`); set the Studio's keyframe canvas default to 16:9 once one 5 s 480P run ($0.075, measured price) verifies a 16:9 output. Corrected premise (D-29, not a reopening): at 360 and 390 the 200 px floor leaves a 16:9 clip 10 px and 1.6 px bars top and bottom; only from 356 px of column does C fill the box. Never a 16:10 frame for one kind, never `object-fit: cover`.
- **B1 once or every visit (Q8 memory; A-01 accepted 11 Oct)** — Neither a modal nor a stored flag. The notice is a paragraph beside Play on every YouTube item: full form before the first Play of the visit, short form after, held in memory. Pressing Play is the agreement; the button is `aria-describedby` the notice. **A-01, decided 11 Oct: Accept** — Beni accepts this mechanism as drawn, without an outside policy review; both review seats had recommended Review, and the record says so. Invariant for rewording: §3.
- **B2 home (Q11 static; A-02 and A-07 decided 11 Oct)** — `public/privacy.html`, a static page at `/kickoff/privacy.html`; the `?only=` and `&date=` contract is untouched. Delivery contract §9. Terms: `#terms` on this page is Kickoff’s own terms of use (A-02 Define) and is what S7 builds. Persistent access: the shell foot on every tab (A-07 Global, §13), the Cinema’s own line, the notice’s link.
- **B3 check (Q12 yes; A-08 decided 11 Oct)** — Card: source line names the channel ("<Channel> / YouTube") and the link opens the watch page; drawn (D-26) on 1a–c with a fictional channel. Stage: both. Cinema: the link text carries the name and the source line sits under the title (3a/8c). `source.name` ending in `/ YouTube` is a validation rule for `provider: youtube` in `validate-moments`. **Scope — A-08, decided 11 Oct: Curated.** The rule validates the production curated edition `src/curated/moments.json` at build, and only that. S4 test inputs keep their plainly synthetic labels (“S4 test source; content unverified”) and are not validator inputs. The four things, named accurately (D-43): `docs/verification/moments-acceptance/edition.json` — the committed acceptance template; `docs/verification/moments-observation/edition.ts` with `generate.mjs` — a generator that writes an uncommitted test edition outside the repository; `docs/verification/moments-observation/receipts/` — committed stub-mode receipts; Beni’s own visit receipts — on his Mac, uncommitted. None is changed. Rationale: editorial validation is separate from an explicitly synthetic verification harness.
- **Review (Q10 yes)** — Present blocks Keep, as does Unsure; there is no warn-and-keep path. Discard, or regenerate with this generation as parent.

## 7 · Decisions log — 8 Oct 2026 and 11 Oct 2026

Beni answered the D1 form on 8 Oct: Q5 **On**, chosen; the other eleven left to the recommendation (decide-for-me). Each stands as decided; nothing here is reopened without a new brief.

| # | Question | Decided | Folded where |
| --- | --- | --- | --- |
| Q1 | Badge colour | ink inverse | §2 `.moments-kind` · artboards 1a–c, 2, 3 |
| Q2 | Hosted controls | native | §1 PlayerBox · artboards 2b–e |
| Q3 | Poster | none | §1 PlayerBox · §6 A2 |
| Q4 | Cover family STUDIO | yes | §2 · artboards 1a–c, 2a |
| Q5 | Sound at Play | **on — Beni's answer** | §6 A3 · `startMuted` dropped · artboards 4a–b, 12 |
| Q6 | Frame ratio | bars in the reader; 16:9 keyframes as the Studio default once verified | §6 A4 · artboards 5a–c, 10 |
| Q7 | Cinema chrome fade, 220 ms | no | §4 row 1 · artboard 14 |
| Q8 | Notice form | memory | §1 Notice · artboards 8a–d |
| Q9 | Job state `exported` | yes | §1 Jobs · artboards 11 (ink voice), 13 |
| Q10 | Present blocks Keep | yes | §1 Review · §6 · artboard 12 |
| Q11 | Privacy page home | static `public/privacy.html` | §3 B2 · §9 · artboards 9a–d |
| Q12 | `source.name` ends "/ YouTube" | yes, a validation rule | §6 B3 · artboard 13 Checks |

Decided the same day at Beni’s request, and kept:

- **ST4 media host — GitHub Releases.** Reasons, with the premises corrected in §10: GitHub already serves the site, so the Privacy page gains a sentence and no new party; release assets add no repository weight; a sample asset answers Range requests with 206 (Codex P-10, P-19), so seeking works; the `<video>` follows GitHub’s redirect without code. Declined: in-tree files (repository weight), Git LFS (Pages does not serve it), Supabase Storage (pauses when idle — the Studio banner already says so), a third-party bucket (a new party on the Privacy page for no gain at this scale). **Retained 11 Oct (A-03).**
- **16:9 verification run — specified, not run.** Crop the existing K0 locally to 768 × 432 (free), submit one 5 s 480P clip ($0.075, measured price), read the frame with ffprobe. Pass (16:9 frame) flips the Studio canvas default to 16:9 · 854 × 480; fail keeps 16:10 and closes the question with the bars. Either way the reader is unchanged. It spends Beni’s balance and stays his; an unrun paid test is not a proven requirement.

Pass 3 — Beni’s rulings, first-hand to the PM seat, Sun 11 Oct 2026. Each decided 11 Oct.

| # | Question | Decided 11 Oct | Folded where |
| --- | --- | --- | --- |
| A-01 | Play-as-agreement: outside policy review? | **Accept** — the mechanism as drawn, no outside review; both review seats had recommended Review | §1 Notice · §3 B1 · §6 B1 · artboards 8a–d |
| A-02 | Kickoff’s own terms statement and access path | **Define** — `#terms` on the privacy page is the terms of use for III.A.1 and is what S7 builds; wording editable by Beni or counsel before S7; D-24 closes | §1 · §3 B2 · §9 · artboards 9a–d |
| A-03 | GitHub Releases after corrected premises | **Retain** — host retained; §10’s proposals stay proposals for the implementation plan | §7 ST4 · §10 · artboard 13 |
| A-04 | Upload publishes before merge | **Disclose** — frame 13’s confirmation is the decided behaviour; the upload is asked on every export | §1 Export · §3 · artboard 13 |
| A-05 | The 10-minute ceiling | **Propose** — stays a proposal for the Studio’s operations plan | §3 Timed-out · artboard 11 |
| A-06 | Article 50 applicability and disclosure | **Clarify** — an explicit answer is a gate on the Studio’s publication step; §6 A1 is its source; nobody named | §1 Export · §3 Export gate · §6 A1 · §8 · artboard 13 |
| A-07 | Privacy & terms access outside Moments | **Global** — one link in the app’s shared chrome, every tab; a narrow, explicit exception covering this one link and nothing else | §1 ShellFoot · §2 · §3 · §13 · artboards 15, 16, H6 |
| A-08 | Q12 validator scope | **Curated** — `src/curated/moments.json` only; S4 test inputs keep their synthetic labels; rationale per D-43 | §6 B3 · artboard 13 Checks |

## 8 · Accessibility — names and keyboard order (D-39)

Rules in the markup: a single control gets `<label for>`; a Seg group gets `role="group"` with `aria-labelledby` pointing at its visible row label, or `aria-label` when two Segs share a row (Resolution, Clip length, Prompt expansion; the seed input has `aria-label="Seed"`); each checklist group is `aria-labelledby` its question; the selected answer is `aria-pressed="true"`; the two model selects are labelled “Keyframe model” and “Clip model” so neither depends on its section for meaning. No `tabindex` anywhere, so keyboard order is DOM order. Receipt H3 computes every name from the rendered markup; the count of unnamed controls is 0.

Keyboard order, as rendered:

- Frame 10 (Composer), 25 stops: Compose · Jobs · Review · Export (TabNav) · Fenway · Frankenstein (Subject) · Keyframe model · 16:10 · 16:9 (Canvas) · K0 prompt · K1 prompt · K2 prompt · Clip model · K0 first · K2 last · K0 only (Frames) · 480P · 768P (Resolution) · 5 s · 10 s · 15 s (Clip length) · Motion prompt · Seed · expansion off · balanced (Prompt expansion) · Submit 4 jobs.
- Frame 12 (Review), 21 stops: the four tabs · Regenerate · five questions × Clear · Present · Unsure · Discard. Keep is disabled in the drawn state and out of the tab order; it enters before Discard when enabled.
- Frame 13 (Export), **8 stops in D4**: the four tabs · Upload both files now · Open the PR without uploading (Upload) · Title · Cancel. Confirm (`Upload 2 clips, then open draft PR`) is disabled while the Article 50 gate has no answer on file (A-06) and is out of the tab order; it enters before Cancel when the gate is recorded — then 9 stops, as D3 recorded. The reason line beside it is `role="status"`.
- The shell foot (A-07): a plain `<a>` in DOM order, the last stop on every tab in every frame of section 15 (probe `link keyboard position … expected last` on each); its accessible name is its text, `Privacy & terms`. The Cinema’s line (3a–b) is the last stop inside the Cinema’s main column, before the queue.

Not verified here: a screen-reader walkthrough on the built Studio and the built shell; both belong to the implementation plan.

## 9 · Static privacy and terms page — delivery contract (D-27)

- **File.** `public/privacy.html`, copied verbatim by Vite to `/kickoff/privacy.html`; not processed, not in the bundle; links are relative (`./` back to the app) so the Pages base path holds. Reached from the shell foot on every tab (`href="./privacy.html"`, A-07), the Cinema’s line and the notice.
- **Style.** `public/privacy.css`, its own small stylesheet. Its token block — the `:root` and `[data-theme='dark']` custom-property declarations — is copied verbatim from `src/index.css` with a comment naming the source file and commit; a unit test asserts the two blocks are equal so the copy cannot drift. Type: Oswald 600 for the h1 and the caps headings, Inter for body, IBM Plex Mono for keys, URLs and the stamp — the values the canvas uses (`.privacy` rules in `d4/moments.css`). No Tailwind utilities, no hashed asset.
- **Fonts.** The same three Google Fonts `<link>`s as `index.html` (preconnect ×2, the css2 stylesheet). The page discloses that dependency itself.
- **Theme without JavaScript.** Light is the default; `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { …dark tokens… } }` reproduces `resolveTheme`’s fallback (`storedTheme ?? (prefersDark ? 'dark' : 'light')`) for a visitor with no stored choice.
- **Theme with JavaScript.** One inline script before the stylesheet, four lines: read `localStorage['kickoff-theme']`; if it is `light` or `dark`, set `data-theme` on `<html>`; otherwise leave it unset so the media query decides; wrapped in try/catch, writes nothing. The page has no lens, so `kickoff-theme-broadcast` does not apply, as `themeStorageKey('ledger')` is the shared key in `src/lib/theme.ts`. No new key: the three-key list stays true. A stored Broadcast-only choice can therefore differ on this page (Codex PM20): a stated choice, and a case for the built-page tests.
- **Terms.** The `#terms` section is decided (A-02 Define); its wording may still be edited by Beni or counsel in the S7 PR without a design change.
- **Stamp.** Static text. The S7 PR sets it to that PR’s date and the version then current in `package.json`; every later change to the page’s sentences updates it in the same PR. There is no build step for it; the Changes section already says the history is the record. Until S7 it reads the 8 Oct audit.
- **Drawn.** 9a–d are the page in both themes at 390 and 1000; the canvas draws them with React, which the shipped page does not use.
- **Not verified here.** The exported file with JavaScript disabled, both themes, both widths, the Broadcast-only theme case, and keyboard access from every tab through the built shell foot — build artefacts, to be tested at S7.

## 10 · Release hosting — host retained 11 Oct (A-03); corrected premises and proposals (D-30, D-32, D-33, D-34, D-35)

Facts (Codex P-10 to P-12, P-19 and P-28; PM re-checked 10 Oct; Codex re-ran the setting and transport checks 11 Oct):

- The repository’s immutable-releases setting is off (`enabled: false`, `enforced_by_owner: false`); the release list is empty; 14 tags `v0.2.0`–`v0.5.2`. Ordinary release assets can be deleted and replaced.
- A public release asset redirects `github.com` → `release-assets.githubusercontent.com` with a signed, time-limited URL; the final response is `application/octet-stream` and answers a Range request with 206. Whether Safari/WebKit plays an MP4 served that way is unverified and not claimed.
- GitHub Pages: a published site may be no larger than 1 GB — a hard limit (`https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits`). Repositories: GitHub recommends staying under 1 GB and strongly recommends under 5 GB — recommendations, not limits (`https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github`). The sizing argument stands: ~10 MB per clip, ~100 clips to 1 GB in tree; release assets sit outside the tree (each under 2 GiB, up to 1000 per release — documented limits, not a service guarantee).
- The create-release API’s `make_latest` is a string enum (`true` / `false` / `legacy`), default `true` for a newly published release (Codex P-28): the proposal below must serialise `"false"` explicitly and the plan must test the actual latest-release result.

Proposals (Beni retained the host 11 Oct; these stay proposals for the implementation plan to settle and test; nothing here is settled by this spec):

- **Non-overwrite.** Either Beni turns the repository’s immutable-releases setting on (then published assets cannot be replaced — and later missing assets cannot be added to that release, which the partial-upload recovery must reconcile) or the application rule stands alone: the record carries size and SHA-256, `verify-media` detects a replaced file and fails the PR. Detection, not prevention, is what this design promises.
- **Identity.** Tag `media-<yyyymmdd>-<8 hex of SHA-256 over the sorted assetIds>`; branch `studio/export-<same>`; release title `Media · <same>`. Retry-safe: the same kept set yields the same tag, so a retried export finds the release and uploads only the missing assets; two same-day exports of different clips differ in the hash.
- **Latest.** Created with `make_latest: "false"`; never a pre-release flag (which would read as a product state). Release management (CLAUDE.md) reads `v*` tags only; the `media-` prefix is documented as outside it.
- **Verification lifecycle.** `validate-moments` at build: offline, schema, the Q12 rule on the curated edition only (A-08) — an offline build passes. `verify-media`: on the export PR, for records whose `source.identity.url` is new or changed; HEAD for 200 and Content-Length, GET for SHA-256; results in the PR check; fail = red. Never in the build, never in Pages.
- **Addresses.** `source.identity.url` is the release address `github.com/<owner>/<repo>/releases/download/<tag>/<assetId>.mp4`, never a signed redirect URL. The Privacy page names GitHub as provider and lists the observed redirect domain, re-checked before S7 publishes.

## 11 · Questions for Beni — none open in D4

All eight Pass 3 questions were answered 11 Oct and are recorded in §7 (A-01 Accept · A-02 Define · A-03 Retain · A-04 Disclose · A-05 Propose · A-06 Clarify · A-07 Global · A-08 Curated). What remains his is operational, not a design question: the 16:9 verification run (specified, unrun, $0.075), the immutable-releases setting, the Article 50 answer behind the A-06 gate, and the §10 proposals the implementation plan brings back to him. No settled ruling was reversed to make D4; nothing in it needed a new one-word question.

## 12 · Facts refreshed 11 Oct 2026

- Main `2199649` (full `21996495160a8d1e409c3f93e802924548415523`): PR #175 merged 11 Oct, bringing `docs/moments-content-policy.md` and the slice-4 spec’s “S4b, as run” onto `main`. Codex’s P-19 diff of the named CSS/component/lib/public/index/script/package paths against `54f7804` is empty: the Moments rules, components, scripts, public and package are unchanged. D3’s “PR #175 open at `cdb1b52`” line was a 10 Oct snapshot.
- GitHub (Codex P-19, 11 Oct): immutable releases off (`enabled: false`, `enforced_by_owner: false`), release list empty. The `release-assets.githubusercontent.com` redirect and the 206 Range answer reproduced on the public sample tarball 11 Oct; a signed redirect is transient and never a record address.
- YouTube Developer Policies III.A and III.C read at source by Codex 11 Oct (P-19): III.A.1 carries the YouTube-terms link and the own-terms agreement statement; III.A.2 the agreement timing and persistent privacy access; III.C.2 names video playback among user-initiated YouTube actions. Re-read again before S7.
- fal prices: today, 11 Oct, is before 15 Oct, so the estimate’s “Now · to 14 Oct” column applies ($0.075 / 5 s, $0.225 / 15 s at 480P, measured); “From 15 Oct” ($0.125 / $0.375) is the documented later estimate, derived. Refresh the applicable estimate on or after 15 Oct rather than treating $0.075 as a current quote.
- The privacy stamp reads the 8 Oct audit; §9 says how S7 refreshes it.
- Design manifest: D5 has its own, `Kickoff Moments - D5 manifest.sha256` (SHA-256 per file, sorted by path, excluding itself and `github.md`), covering the D5 canvas, this spec, the D5 response and `d5/`. The fingerprint is that file’s own SHA-256; the PM seat pins it. D4’s manifest stays as D4’s record.

## 13 · A-07 — the global Privacy & terms link, designed

**Ruling.** One “Privacy & terms” link, reachable on every tab (Fixtures, Table and Moments), in the app’s shared chrome. A narrow, explicit exception to the settled rule that Fixtures and Table are untouched: it covers this one link and nothing else. No Fixtures or Table row, column, colour, motion or content changes. The `?only=` and `&date=` URL contract is unchanged; no storage key is added.

**Where it sits.** `App.tsx`’s shell is a 780 px wrapper (`mx-auto max-w-[780px] px-5 pt-7 pb-16`) holding the header, `TabNav` with the `LensSwitcher`, then the route — the Moments boundaries, or the `ViewBoundary` with the ticker, staleness banner and Fixtures or Table page. The link is a `<footer>` appended after those route boundaries as the wrapper’s last child, on every tab:

- `<footer class="mt-6 border-t border-line pt-3 text-[11px] text-ink-secondary"><a href="./privacy.html" class="text-pitch underline underline-offset-[3px]">Privacy & terms</a> · what Kickoff stores, who sees a visit, the YouTube terms</footer>` — the canvas draws it as `.kickoff-foot` with the same values (moments.css:135).
- Not in the header (the header’s right column is the theme button; a second control there wraps at 360 in Broadcast and competes with the wordmark) and not on the tab row (the row is a settled component whose `flex-wrap-reverse` already stacks the lens switcher above the tabs on phone widths; a third item changes its wrapping). A foot after the route is the one placement that touches no existing element.

**What moves.** Nothing above it. The header, the tab row, the lens switcher and every element of the Fixtures and Table routes keep their positions to the pixel; the document grows by the foot’s outer height — 53.5 px at 1000, 70 px at 360 and 390 where the line wraps to two — inside the wrapper’s existing bottom padding. Receipt: section 16 renders each tab at 360, 390 and 1000 twice — before (no foot) and after — and H6 prints the top and height of the header, the tab row, the route box, the route’s last element and the link in both, with the difference (Δ 0 on every landmark above the foot; the frame taller by the foot). On Fixtures the foot follows the page’s own Data footer; on Table it follows the provenance note; two hairlines 24 px apart, chrome under route, as the header sits above it.

**Moments.** D3 drew the line inside every Moments state (`.moments-foot` in the gallery, the empty gallery and the stage). D4 folds those into the shell foot — my call, for three reasons: one link in one place is the ruling’s shape (“one link”); two identical “Privacy & terms” links stacked at the foot of a Moments page would be a duplicate name in the accessibility tree and noise on the screen; and the shell foot already sits exactly where the gallery’s line sat, directly under the route. The gallery therefore shrinks by the line it loses and the shell foot takes the same text below it; the frame height is unchanged within a pixel (H6, Moments pairs). At 1000 the link moves from the gallery’s 960 px outdent to the 740 px shell column — the foot keeps the header’s column, as chrome does. **The Cinema keeps its own line** (`.moments-foot` under the neighbours, 3a–b, 8c): the Cinema is `position: fixed; inset: 0` over the shell (`index.css` `.moments-player-dialog[data-placement="cinema"]`), so the shell foot is not reachable while it is open. The notice’s link (B1) is unchanged. D-25 stays satisfied: the policy is one link from every Moments state.

**Lenses and themes.** The foot uses `--text-secondary` and `--pitch` on `--bg`; these tokens are identical across Ledger, Poster and Broadcast, so the foot reads the same in every lens — 6.00 / 8.55 (text) and 4.82 / 7.75 (link) light / dark — and each frame of section 15 prints its own measured ratio against its own ground. Broadcast’s floodlight lead touches the tab underline and the Today pill, not this line; the link stays pitch, as every privacy link in the reader does. Hover: the link’s colour shift only (`a:hover` → pitch-deep; floodlight in dark, as the reader’s links). No motion (§4 row 13).

**Keyboard and name.** A plain `<a>` in DOM order, the last tab stop on every tab (54 probes in section 15 read `stop n of n · expected last ✓`); its accessible name is its text, `Privacy & terms`; focus ring is the app’s one `:focus-visible` rule. No `tabindex`.

**Receipts.** Section 15: 54 frames, `15-<fx|tb|mo>-<360|390|1000>-<ledger|poster|broadcast>-<L|D>`, each with scrollWidth, the link’s rect, accessible name, keyboard position and contrast, and the foot’s text contrast and rect. Section 16 and H6: the before/after positions. The Fixtures and Table bodies on those frames are excerpts drawn with the design system’s primitives (FixtureRow, TickerCard, FilterBar, WatchPanel, CompetitionChip, FormPips, ZoneDivider, InHandChip) from illustrative rows, tagged ILLUSTRATIVE; the Broadcast ticker is drawn static; the desktop Table excerpt compacts three columns so it fits the 740 px column (the product’s columns are not a subject of this design). The receipt is the shell — where the foot sits and what precedes it — not the rows. A drawing is a static receipt: the built shell, keyboard access through it from every tab and state, and the link’s behaviour on tab and lens changes belong to the implementation plan’s tests.
