# Moments D5 — Codex's check and its addendum (archived Mon 12 Oct 2026, TZ=America/New_York)

Written by Codex (GPT-6.1 Sol Medium) on Mon 12 Oct 2026. The check found the restore sound but held D-45 open on the prompt's drift gate; the addendum re-measured the app at `3937d02` and closed D-45: ready for the implementation plan. Its evidence (probe scripts, captures, JSON) stays local at `~/kickoff-d2-review/`; nothing from it is committed.

---

## The check

# Moments D5 independent G receipt check

**Verdict: not ready for the implementation plan under this check's required unchanged-app prerequisite.** The restore itself passes: 24 G rigs, 264 matching measured fields and no rig overflow. **D-45 remains open for verification only** because the explicitly required app drift gate is nonempty; the missing-receipt defect is repaired. No new D5 design finding (D-46 onward) established.

Seat: Codex, GPT-6.1 Sol Medium (requested configuration; model/effort not independently observable).
Date: 12 Oct 2026, EDT. `TZ=America/New_York date` run before writing dates; final check returned `Mon Oct 12 13:35:03 EDT 2026`.
Target: `/Users/benicheni/Moments Studio admin surface design D5`.
D5 fingerprint, SHA-256 of `Kickoff Moments - D5 manifest.sha256`: **ada850417ec10ef382eed98d7daa897a87fb18a735f85c154d0989911ab4e29d**.
Whole-folder manifest SHA-256: `54eb24511dd3add603aeea1c8f71a8d0ffeed9dd7f99c1b2ba7d118ae5258a88`.
Repository: `github.com/BeniCheni/kickoff`, calling worktree `/Users/benicheni/.codex/worktrees/8cc7/Kickoff`, clean tracked/untracked status; HEAD and origin/main `3937d02e0011515cdde6c2631db2bdf520b4ecfd`. Read-only `git ls-remote origin refs/heads/main` returned the same remote main SHA. No fetch or repository edit.

## P-43 — Pin and historical folder preservation

Ran `shasum -a 256 -c "Kickoff Moments - D5 manifest.sha256"` in the D5 folder: **13/13 OK**, both initially and at final integrity check. Manifest fingerprint independently calculated with SHA-256.

Whole-folder recipe: enumerate all regular files, including hidden files, sort relative paths, emit `SHA256  ./relative/path` with newline per entry; hash that manifest. This hashes captures in place without copying their bytes to evidence. Independent manifest: [P-43-d5-folder-manifest.sha256](evidence/P-43-d5-folder-manifest.sha256); comparison: [P-43-pin.json](evidence/P-43-pin.json).

Compared every one of the 72 entries in `/Users/benicheni/kickoff-s55-run/d4-folder-manifest.sha256` with its matching D5-folder path. **70 byte-identical, only `.thumbnail` and `github.md` differ as permitted; none missing.** The D5 folder contains 86 files. All D1–D4 source/spec/manifest/response paths and historical uploads reproduce their baseline hashes.

D5 added exactly these 14 files:

- `Kickoff Moments - D5 design canvas.html`
- `Kickoff Moments - D5 manifest.sha256`
- `Kickoff Moments - D5 response.md`
- `Kickoff Moments - D5 spec.md`
- `d5/canvas.jsx`
- `d5/capture-1000-box.png`
- `d5/capture-1000-clip.png`
- `d5/capture-390-box.png`
- `d5/data.js`
- `d5/moments.css`
- `d5/reader.jsx`
- `d5/shell.jsx`
- `d5/spec.md`
- `d5/studio.jsx`

The three d5 PNG files hash-identically to their d4 counterparts. They were hashed in place; no capture was copied by this review.

## P-44 — Delta and preservation of settled design

Saved complete d4/→d5/ source diff and top-level canvas/spec diffs, rather than interpreting the builder response as proof:

- [P-44-d4-d5-folder.diff](evidence/P-44-d4-d5-folder.diff)
- [P-44-spec.diff](evidence/P-44-spec.diff)
- [P-44-design-canvas.diff](evidence/P-44-design-canvas.diff)
- [P-44-source-audit.json](evidence/P-44-source-audit.json)

The functional canvas delta is G's section heading and 24 GeoRig mounts, immediately before Handoff. `GeoRig` and every existing frame mount/probe are unchanged. The restored heading/mounts reproduce D3's structure. data.js, moments.css, reader.jsx, shell.jsx and studio.jsx differ only in their opening revision comments and reader.jsx's d4/→d5/ image paths; stripping just those differences makes each file identical. No new selector, token, product copy, interaction, gate, footer mechanism or settled ruling changed.

Provenance changes accompanying the restore: D5 title/intro/comment labels; HTML asset references and H2 spec reference moved to d5/; Handoff mentions restored G. Spec adds the D5 provenance paragraph and D-45 changelog row, names restored G in the artboard list and updates its manifest pointer. These are receipt/revision bookkeeping, not a further product/design delta. The remaining spec sections, including Q1–Q12, A-01–A-08 and A-07, remain unchanged. Top-level D5 spec and d5/spec.md are identical. The D5 response explicitly corrects D4's false “unchanged G” claim without modifying D4 history.

Independent comparison of rendered D5 against the earlier P-32 D4 DOM snapshot: **1,590 checks across 106 non-handoff frames, zero deltas**, including copy, lens/theme, overflow, gallery/card/stage/Cinema geometry, links and terms presence. All 112 earlier named frames remain; G adds 24, giving 136. Atlas absolute x/y and Handoff output are excluded: revision header text and G insertion necessarily alter atlas placement, H2 is the updated spec, and aggregate inventories can include new G elements. This proves preservation in the checked frame contents, not equality of every atlas pixel. Evidence: [P-47-existing-frames.json](evidence/P-47-existing-frames.json).

No new finding numbered D-46 or later: no additional substantive D5 design delta established.

## P-45 — P-22 freshness gate fails

Before relying on P-22, ran the exact requested command:

```sh
git diff --stat 2199649 origin/main -- src public index.html
```

**Nonempty: 8 files, 2,592 insertions and 2,715 deletions.** Changed paths are src/components/FixtureRow.tsx, src/data/fixtures.json, src/data/meta.json, src/data/standings.json, src/lib/fixtures.ts, src/lib/lensSelectors.ts, src/lib/momentsGallery.ts and src/lib/schema.ts. The app has moved from `2199649`. P-22 cannot be labelled unchanged-current app evidence.

Read the non-data source diff: suspended/abandoned status support includes a Moments known-kickoff predicate change, alongside fixture-related changes. A narrower diff of src/index.css, App.tsx, MomentsPage.tsx, MomentsPlayback.tsx, public and index.html is empty. That supports unchanged layout source in those files, but **does not substitute for the requested full no-drift gate**, and no current-app geometry measurement was run.

Evidence: [P-45-app-drift.json](evidence/P-45-app-drift.json), [P-45-app-drift.stat](evidence/P-45-app-drift.stat), [P-45-app-drift.diff](evidence/P-45-app-drift.diff). This is an evidence freshness gap, not an invented new D5 design defect.

## P-46 / P-47 — Restored G runtime and historical comparison

Served the unchanged design folder at `http://127.0.0.1:8766/`, opened `Kickoff Moments - D5 design canvas.html` in headed Chrome with the tab brought to front. Chrome `Chrome/155.0.8059.40`; viewport 1000 × 900, DPR 1, document visibility `visible`, fonts `loaded`. After font readiness, called `window.__placeRows()` and dispatched `d3:remeasure`, then waited for measurement settling. Used the artifact's exposed layout hooks, without style/DOM mutation or control activation. No screenshot was taken and no Play was pressed.

Network policy permits only 127.0.0.1 and the canvas's unpkg React/Babel dependencies. Observed no blocked/provider/YouTube request and no runtime exception; zero video/iframe elements. Server logged an incidental missing favicon (404), which did not affect the rendered frames or loaded fonts. Outer atlas overflow is not phone-page overflow: each G frame is the container width under test.

Enumerated exactly 24 unique G ids; Ledger and Poster are light, Broadcast is dark:

- `G-360-ledger`
- `G-360-poster`
- `G-360-broadcast`
- `G-375-ledger`
- `G-375-poster`
- `G-375-broadcast`
- `G-390-ledger`
- `G-390-poster`
- `G-390-broadcast`
- `G-760-ledger`
- `G-760-poster`
- `G-760-broadcast`
- `G-761-ledger`
- `G-761-poster`
- `G-761-broadcast`
- `G-887-ledger`
- `G-887-poster`
- `G-887-broadcast`
- `G-888-ledger`
- `G-888-poster`
- `G-888-broadcast`
- `G-1000-ledger`
- `G-1000-poster`
- `G-1000-broadcast`

Read actual DOM boxes and computed styles directly, **never the canvas's “expected” column**. Matched P-22 by width, lens and theme. Compared nine probes per frame: gallery width; cards columns; body padding; h1 font size; count display; stage columns; anchor width/height; Cinema columns; slot width/height. Box width/height makes 11 comparisons per frame, **264 total**, all passing at ≤0.02 px tolerance (numeric CSS components also compared with that tolerance; display values exactly). Every G frame's scrollWidth equals its assigned width. Results apply to the historical P-22 reference at 2199649; they do not certify the changed current app.

Raw browser evidence: [P-46-d5-canvas.json](evidence/P-46-d5-canvas.json). Exact fields and per-frame outcomes: [P-47-G-comparison.json](evidence/P-47-G-comparison.json).

Reproducibility: D4 probes reused under new names, preserving originals: `probes/d5-cdp.mjs`, `probes/d5-canvas-observe.mjs`, `probes/d5-regression-audit.py`. Serve the target with `python3 -m http.server 8766 --bind 127.0.0.1 --directory '/Users/benicheni/Moments Studio admin surface design D5'`, run the Node canvas probe, then the Python regression audit. Chrome is closed in the probe's finally block.

## D-45 outcome and handoff

**D-45 open, verification gap only.** The previously missing G receipt is restored, all 24 rigs match historical P-22 and no rig overflows. Settled design remains preserved. The required current-app no-drift prerequisite fails; therefore this seat does not close the full check or declare readiness under that prerequisite.

Required next verification: refresh the eight-width app geometry receipt at the changed, pinned main SHA with the same lens/theme cells, then compare the unchanged D5 G DOM at 0.02 px and recheck overflow. No further drawing fix is indicated by this check. Current app measurement requires a separately scoped run that respects the no-install/no-repository-edit limits; this review did not improvise one. If the authorized acceptance is instead explicitly restricted to historical 2199649/P-22, the recorded historical comparison passes, but that scope change was not assumed here.

Not verified: current-main app geometry, built Studio behavior, playback, provider behavior, publication and all broader implementation-plan tests carried in D4. This focused check does not rerun them or reopen their settled design rulings. Beni retains design/adjudication authority.

## P-48 — Final integrity and cleanup

Manifest rechecked 13/13 OK; whole-folder manifest is byte-identical to P-43 and D5 fingerprint unchanged. Owned server on port 8766 stopped; no listener remains. Owned Chrome was closed; no chrome-d5-g process remains. Calling repository status remains empty. [P-48-cleanup.json](evidence/P-48-cleanup.json) records the checks.

Only the new D5 report, new local evidence/probe files and owned Chrome runtime profile were created under kickoff-d2-review. No earlier report/probe was appended or changed, no design/repository file edited, no installs, no GitHub writes, no provider/YouTube request, no Play, and no access to ~/s4b or ~/kickoff-s4b. Captures were hashed in place and not copied into new files. Work stopped after cleanup.

## The addendum

# Moments D5 G check addendum

**D-45 closed. Verdict: ready for the implementation plan.** Fresh current-main app measurements pass both the P-22 regression comparison and the restored D5 G comparison. This addendum supersedes the earlier D5 check's open verification outcome; that report remains unchanged. No new D-46 or later finding.

Date: 12 Oct 2026 EDT. `TZ=America/New_York date` run before writing dates; final check: `Mon Oct 12 14:35:10 EDT 2026`.
Seat: Codex independent check seat, requested GPT-6.1 Sol Medium; configuration not independently observable.
Worktree SHA: **`3937d02e0011515cdde6c2631db2bdf520b4ecfd`**, detached at origin/main. Read-only remote-main check returned the same SHA.
D5 fingerprint unchanged: **`ada850417ec10ef382eed98d7daa897a87fb18a735f85c154d0989911ab4e29d`**.

## P-49 — Authorized fresh setup and stub build

Created exactly `/Users/benicheni/kickoff-d5-remeasure-codex` with the supplied `git worktree add --detach` command. Read its AGENTS.md; CLAUDE.md hashes match the already-read calling checkout. The parent checkout's pre-existing untracked skill folders were left alone.

Ran, in the new worktree:

```sh
npm ci --no-audit --no-fund
node --import tsx docs/verification/moments-observation/generate.mjs --stub /Users/benicheni/kickoff-d2-review/d5-run/edition-main.json
npm run build:acceptance -- /Users/benicheni/kickoff-d2-review/d5-run/edition-main.json
```

All exited 0. npm installed 134 packages from the existing lockfile. The generator wrote a new external edition with two fictional stub ids; fixture snapshot SHA is the worktree SHA. Stub edition SHA-256: `0cdfa5ba82f53cb3b08f1431889b96f0c93c0b23685c0b78e1ce6410817c5f76`. Acceptance build validated two items against HEAD; TypeScript/build succeeded. Only warning: bundled chunk exceeds 500 kB. No source/data/lockfile edit, commit or general test-suite claim.

Evidence: [P-49-setup.json](evidence/P-49-setup.json), [P-49-build.log](evidence/P-49-build.log), external [edition-main.json](d5-run/edition-main.json). Prior report/receipt hashes pinned in [P-49-prior-hashes.json](evidence/P-49-prior-hashes.json).

## P-50 — Same 48-cell app measurement

Served only the new worktree's `dist-acceptance` at `http://127.0.0.1:4318/`. Reused P-22's app geometry probe under new names: `probes/d5-remeasure-app-geometry.mjs` with `probes/d5-remeasure-cdp.mjs`. The geometry fields and state-entry actions remain P-22's. Additional evidence records the served build's observation manifest, whose SHA independently matches `3937d02e0011515cdde6c2631db2bdf520b4ecfd`.

Environment: Chrome 155.0.8059.40, headless as in P-22, DPR 1, height 900. Width set before every cell: **360, 375, 390, 760, 761, 887, 888, 1000 × Ledger, Poster, Broadcast × light, dark = 48 cells**, exactly that set with no missing/duplicate cell. The app's actual lens/theme and viewport values were measured, not inferred.

Each cell loads Gallery, selects the first card via its own primary control, measures ready Stage, enters Cinema through `[data-cinema-enter]`, measures Cinema and exits through `[data-cinema-exit]`. **Never pressed Play.** No dialog/style injection. Every Gallery/Stage/Cinema observation has zero video/iframe elements.

Request interception enabled before navigation: only 127.0.0.1 requests continued. No external request continued and no provider/YouTube request was attempted. The 49 network failures are deliberately blocked Google font stylesheet requests; zero JavaScript exceptions. As in P-22, these measurements use the external-font-blocked app baseline, not downloaded production fonts or playback.

Evidence: [P-50-app-geometry.json](evidence/P-50-app-geometry.json), [P-50-summary.json](evidence/P-50-summary.json).

## P-51 — Independent numeric comparison

Compared every captured field in all three states of each fresh cell against its matching historical P-22 cell: **2,448 scalar fields, zero mismatches**. This includes gallery width/height, card columns/padding, heading size/count display, Stage columns/anchor width/height, Cinema columns/slot width/height, viewport/lens/theme/scrollWidth and media counts. Numeric dimensions and numeric CSS components use 0.02 px tolerance; nonnumeric values use exact equality.

Compared fresh app cells with the independently measured 24 D5 G rigs in unchanged [P-46-d5-canvas.json](evidence/P-46-d5-canvas.json): Ledger/Poster light and Broadcast dark at the same eight widths. Used measured DOM boxes/computed styles, not G's own expected values. Nine probes per rig, expanding anchor/slot width and height, give **264 comparisons, zero mismatches**. Maximum numeric delta across both comparisons: **0 px**.

No overflow: fresh app scrollWidth equals viewport width in **144/144 state observations**, and all **24/24 G frames** have scrollWidth equal their width. The P-46 rig measurements are reused only after verifying that the entire D5 folder, D5 fingerprint and P-46 receipt remain byte-identical; no capture was copied or new canvas mutation performed.

Evidence: [P-51-comparison.json](evidence/P-51-comparison.json). Reproducible comparator: `probes/d5-remeasure-compare.py`.

## Outcome and limits

**D-45 closed**: the separately fingerprinted D5 restores all 24 G frames, the earlier D5 check established preservation of the settled design, and fresh current-main measurement now confirms their app comparison. The overbroad no-drift gate is resolved by the explicitly requested measurement, rather than waived on a source-only argument.

**Ready for the implementation plan**, for the reviewed design handoff. Existing implementation-plan obligations in the D4 report remain: this is stub geometry evidence, not built Studio, real-provider playback, publication, production-font/browser-matrix or release acceptance. No settled ruling reopened and no new adjudication question introduced.

## P-52 — Integrity and cleanup complete

Before removal, fresh worktree status was empty. Stopped the owned server and ran the supplied `git -C /Users/benicheni/Documents/Claude/Projects/Kickoff worktree remove --force /Users/benicheni/kickoff-d5-remeasure-codex`; exit 0. Worktree directory and registration are absent, port 4318 has no listener, and no owned chrome-d5-remeasure-app process remains. Chrome closed in the probe's finally block.

Rechecked D5 manifest: 13/13 OK; whole-folder manifest unchanged. Earlier D4/D5 reports, P-22 and P-46 hashes preserved. Calling repo remains clean. Evidence: [P-52-cleanup.json](evidence/P-52-cleanup.json).

Only the authorized disposable dependency/build output, new external stub edition, new addendum/evidence/probes and owned Chrome profile were created. No design folder or repository source edit, no earlier report append, no capture copy, no GitHub write, no provider/YouTube request, no Play and no access to ~/s4b or ~/kickoff-s4b. Work stopped after cleanup.
