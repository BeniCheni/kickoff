# Executive Summary Brief — PR #113 · Pass 2.5 · 27 Sep 2026 (Brooklyn)

Pass 2.5 of the six-pass 360 for the Moments slice-1 foundation PR (`codex/moments-foundation`,
built by Codex, cold-reviewed by Claude in Pass 1, rebutted by Codex in Pass 2). Synthesis seat:
Claude Code, Fable 5.1 Extra, invoked as `/kickoff-pr-review 113 --pass 2.5 --no-merge`. Every
number below comes from a command run in this session at the SHA named; a number lifted from a
PR body or comment is labelled as that vendor's claim. Delivered in chat; this file is the archive.

**Decision: escalated to Beni on instruction — the Pass 2.5 merge gate is satisfied at
`272ae653ce51d084f81c447e2a9fca909b271e68`, and the merge is withheld because the invocation
carried `--no-merge`.** Not a release: no version bump, no new `CHANGELOG.md` section, no tag
follows. The merge is a non-release foundation landing, Beni's click, and the block is at the end.

## Release-scope verdict

**No Moments release candidate exists.** The exact candidate is a foundation slice: the Moments
page component is untouched, `src/curated/moments.json` is still `[]`, and the queue and saved
modules do not enter the bundle. The served head at 390 px shows `V0.5.2 · 1498 FIXTURES` and
"No moments curated yet." — the same link-only empty tab v0.5.0 shipped. The one bundled change
is the authored-record validator (optional identity, content, availability, permission and
collection fields; root, source and still records now refuse unknown keys), which no reader can
see while curation is empty. **No tag is recommended.** PR #114 (draft, Cursor) is browser
verification tooling, not feature work.

Ground truth for "what has shipped", read together and agreeing: `package.json` `0.5.2`;
annotated tag `v0.5.2` on `644d334` (17 Sep 2026, Beni); `CHANGELOG.md` `[0.5.2] — 2026-09-17`
as the latest released section; `README.md` badge, "What it does (v0.5.2)" heading and Lineage
entry. `origin/main` since `v0.5.2` carries 26 sync commits and nothing else, so `[Unreleased]`
on main is empty; this PR adds one Fixed line to it.

When the feature does land, it classifies as **minor** under this repo's rules — a new
user-visible capability under one subject line — exactly as the 25 Sep handoff says ("suggests
minor scope without assigning the number"). The number is Beni's; nothing here asks him for it
yet, and Beni has made no ruling on release placement or a first edition — none is inferred.

**Remaining implementation and acceptance work before a candidate exists** (from
`docs/moments-architecture.md`, the 25 Sep handoff and the R3 cold review, none of it started):

- Slice 2, gallery: `MomentsSessionProvider` above the keyed `ViewBoundary`, `MomentsPage`
  Matchnight, covers, filters/sort/save, spoiler-light and empty states; acceptance D-04
  (amended to the real shell), D-07 UI, D-11, D-12, D-13, D-17–D-20.
- Slice 3, player/Cinema: `MomentsPlayerHost` as an unkeyed sibling with its own boundary, the
  YouTube adapter, intent, cancellation, focus and recovery; D-06, D-15, D-16.
- Slice 4: integration acceptance, a narrowly authorised real-provider validation (none has run;
  R3 playback is simulated), and a separately reviewable initial-edition proposal with sourced
  fixture facts and intended-use eligibility. Publication needs Beni's explicit decision.
- Two rulings already on Beni's desk from the R3 cold review, unchanged by this pass and not
  needed for #113: the D-16 remedy (a/b/c) and the header width on the Moments tab.

## What ships (if #113 merges)

- Nothing the reader sees. The Moments tab stays empty and link-only; the header still says
  `V0.5.2`. Pages redeploys a bundle whose only difference is the validator.
- The authored record can now carry a YouTube identity (11-character ID, HTTPS watch URL
  allowlist), content scope and verification, a dated availability log (error 150 must be an
  owner block), one permission decision per intended use, editorial neutral copy and collection
  order. Root, source, editorial, collections and still refuse unknown keys; the archived fixture
  keeps the sync projection (documented exception).
- A pure visit-queue reducer and a reference-only saved-list persistence layer, unbundled until
  slice 2 imports them.

## What the 360 found

| # | Pass 1 (Claude) | Pass 2 (Codex) | Pass 2.5 corroboration |
|---|---|---|---|
| 1 | medium — a block the visit disproved reclassified a later timeout as `blocked`; fixed `5bb26fe` | accept, contest the characterisation: any accepted callback is not playback; narrowed so only `playing`/`ended` clear the record — `8db0a58` | **Corroborated.** `5191779`'s reducer under the head's tests fails the two "paused/position on a loading retry" cases; green at the head. The narrowing is right: a pause acknowledgement or a position sample at zero during loading is not evidence the source played. |
| 2 | medium — `saved` filtered out references to missing-edition items; fixed `a30f9da` | accept; pressure test with 10,003 references, no cap documented — `132dd5a` | **Corroborated.** Round-trip test and the pressure test green; `state.saved`'s only read is pool-based `eligibleIds`. No cap is a documented choice, not a gap. |
| 3 | low — doc overclaimed "no known expiry"; fixed `315b694` | accept | **Corroborated.** Probe: a permission whose expiry precedes its check parses and yields `false` at the check instant; expiry at the queried instant yields `false`. |
| 4 | low — same-attempt `unavailable` overwrote a recorded 150; deferred to slice 3 (row 56) | accept, contest: a reducer defect now — only unknown-to-known upgrades within an attempt — `3e87597`; Codex's own follow-up found its first guard blocked a retry's upgrade, fixed by `failureAttempt` — `40a429d` | **Corroborated.** `8db0a58`'s reducer fails the terminal-upgrade test; `132dd5a`'s reducer fails exactly the retained-evidence retry test; both green at the head. Row 56 records the resolution. Pass 1's deferral is withdrawn: the reducer owning the invariant is the better seam. |
| 5 | low — uneven strictness (`still`, archived `fixture` non-strict); deferred (row 57) | accept, contest: `still` strict now — `4a6613f`; the fixture pick stays a projection because full sync fixtures are supported inputs | **Corroborated.** `3e87597`'s `moments.ts` fails the still-strict test; adding `.strict()` to the fixture pick reproduces Codex's **7 failed / 1 passed** in `tests/moments.test.ts`. Row 57 records the split. |
| 6 | — | low (Codex's own): the receipt checker exited 0 after an unexpected host or a failed font — `22a3187` | **Corroborated.** `5191779`'s script under the head's subprocess tests exits 0 for `unexpected` and `font-failure` (and 1 for `png-drift`, which is now advisory); 7/7 green at the head. |
| 7 | — | — | **New, low.** The reducer's `saved` accepts any string (`''`, `' padded '`) while `writeSavedReferences` **throws** on them instead of returning `write-refused`; the future session owner sits above the keyed boundary (Decision 1), so a throw there escapes route recovery. Not fixed — slice 2 seam; `docs/v0.2.6-ideas.md` row 58. |
| 8 | — | added an `[Unreleased]` Fixed line for the still validator — `272ae65` | **New, low, editorial.** The line is true but names one of several validator changes in the same bundle (root/source strictness and the whole optional contract also reach it). Harmless now; the slice-2 entry should describe the authored contract once. Not a vendor contest: Pass 1's "no entry" rested on an unchanged bundle, which `4a6613f` changed. |

Nothing is still contested between the vendors. Pass 2's three "accept-but-contest" positions
are each narrower and better than the Pass 1 characterisation, and each is now pinned by a test
that fails against the previous code.

## Verification as re-run (all at `272ae65` unless stated)

- `npm run typecheck` clean. `npm test` **598 tests / 45 files**, green. `git diff --check`
  over `origin/main...HEAD` clean. Diff: **14 files, +2204 / −3**; no change under `src/data/`,
  `.github/`, the URL codecs, `main.tsx`, `App.tsx`, `MomentsPage.tsx` or `index.css`.
- `verify` green at the exact head: run `36293356694`, `head_sha` confirmed, 37 s.
- Builds: `dist/index.html` `d373a001…`, `dist/assets/index-BwVD5wkq.js` `ae90af2a…`,
  `dist-single/index.html` `75d66536…` — byte-equal to Pass 2's claim. Base (`c108e68`)
  `index-DlxOyKL9.js` `a0e54fd9…`. Built at `3e87597` (the commit before the still fix):
  `index-BuPc_NI5.js` `7fd9f6ce…`, Pass 1's hash — so the bundle moved only at `4a6613f`.
  Grep of the head bundle: storage key and shuffle constants 0 hits; video-ID message 1 hit.
- Browser matrix, the PR's own `check-browser.mjs` at the final tip on both builds (Chrome
  154.0.8037.58 headless via the Playwright runtime already on the machine; clock frozen at
  `2026-09-27T02:40:00Z`; viewport set before every capture): **144 captures, 72 compared,
  72/72 identical text, 72/72 identical PNG on first capture, `scrollWidth === innerWidth` on
  all 144, zero media elements, zero page errors, zero provider requests, 317 Google Fonts
  requests per build (73 + 244), zero failed requests.** PNG identity has now read 69/72
  (Pass 1), 64/72 (Pass 2) and 72/72 (this pass) on first capture: it is run-dependent; text
  hashes are the comparator.
- Pane smoke in my own tab on the served head (`:8862`), viewport set first: 390 × 844 Poster
  light Moments — `innerWidth 390 === scrollWidth 390`, `data-lens=poster`, header
  `V0.5.2 · 1498 FIXTURES · SYNCED …`, main "No moments curated yet.", zero media, console
  clean, script `index-BwVD5wkq.js`; 1000 × 900 Broadcast dark Moments the same.
- Red-then-green, each fixed file's parent version under the head's tests: `8db0a58` 4 failed /
  32 passed (its two cases plus the two later-commit cases); `3e87597` 2 / 34; `40a429d` 1 / 35;
  `4a6613f` 1 / 22; `22a3187` 3 / 4; head 84 / 84 across the five Moments test files.
- Version places: not a release; the four sources agree at 0.5.2 (above).
- **Not re-run:** the Pass 1.5 rebuttal brief (delivered in chat, not archived in the repo —
  Pass 2's account of its CHANGELOG exception is a claim); Pass 2's local recapture rounds;
  live provider behaviour, iframe continuity, phones, Safari, screen readers; the R3 package
  hashes (no UI in scope).

## Risks and accepted costs

- Strictness increase: a curated record with an unknown key at root, source, editorial,
  collections or still fails the build and the module import; the archived fixture and its team
  objects still strip. Production curation is `[]`, so nothing breaks today.
- No saved-reference cap; refusal keeps the visit's intent; the future UI must say so.
- A merge redeploys Pages with an unchanged UI; Step 0 of the betting pipeline reads nothing
  from Moments, and `?only=` / `&date=` are untouched.
- Throwing persistence above the route boundary (finding 7) is a slice-2 hazard, not a slice-1
  defect.

## Handed to the next patch

- `docs/v0.2.6-ideas.md` row 58 (finding 7); rows 56–57 resolved in this PR and left in place
  with their resolutions.
- The `[Unreleased]` wording (finding 8) for the seat that writes the first user-visible line.
- Process notes from this pass appended to the ideas file.

## Questions for the CEO

1. **Merge #113** as a non-release foundation landing (gate satisfied, nothing visible changes,
   Pages redeploys the validator-only bundle)? — yes / no.

Not asked here, still open from the R3 cold review and needed before slice 2/3 layout: D-16
remedy (a / b / c) and header width on Moments (widen / keep).

## Handoff block (if the answer is yes)

```
# Merge (squash) — PR #113, or click "Squash and merge" with this body
gh pr merge 113 --squash --subject "Moments slice 1: contracts, queue state and saved references (#113)" --body "$(cat <<'MSG'
Inactive foundations for Moments. The authored record grows optional source identity, content scope, a dated availability log, per-use permission decisions, editorial neutral copy and collection order; root, source, editorial, collections and still refuse unknown keys while the archived fixture keeps its sync projection. A pure visit-queue reducer and a reference-only saved-list persistence layer land unbundled. Nothing the reader sees changes: the Moments tab stays empty and link-only, curation stays [].

Built by Codex, reviewed cold by Claude (Pass 1), rebutted by Codex (Pass 2), synthesised by Claude (Pass 2.5), merged by Beni.

Co-authored-by: Codex <noreply@openai.com>
Co-authored-by: Claude <noreply@anthropic.com>
MSG
)"

# Then, on main
git pull
npm run typecheck
npm test
npm run build
# Pages: a merge requests a deploy; it is live only when the served index references a bundle
# other than index-DlxOyKL9.js and the header still reads V0.5.2.
```

No tag. No version bump. No release.
