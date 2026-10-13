# Moments — the build plan from design D5: the generated kind in the reader, YouTube's publication duties, the Studio, and clip hosting

> **Superseded in part, Tue 13 Oct 2026.** Beni's pivot of 12 Oct makes Moments generated-only, moves the app to Next.js on Vercel and publishes from the Studio's database. [moments-pivot-record.md](moments-pivot-record.md) records the rulings and wins where the two differ; the migration plan is [nextjs-migration-plan.md](nextjs-migration-plan.md). This plan's YouTube stages (S6a–S8), its GitHub Releases hosting and its PR-per-edition publication no longer apply. The text below is kept as written.

Written by the PM seat (Claude Code, Opus 5.5) on Mon 12 Oct 2026 (TZ=America/New_York),
against `main` at `3937d02`. This is a sequence and a set of slice contracts. It is not a
build prompt: each slice gets its own prompt from the PM seat, written against `main` on the
day and against D5 at its fingerprint. It changes no code, proposes no version number and
makes no ruling for Beni.

## 1 · What this plan is built from

**The design.** D5, by Claude Design (Fable 5.1 Extra), exported to
`/Users/benicheni/Moments Studio admin surface design D5`. Its fingerprint is the SHA-256 of
`Kickoff Moments - D5 manifest.sha256` (13 files):
`ada850417ec10ef382eed98d7daa897a87fb18a735f85c154d0989911ab4e29d`. The spec is archived
verbatim as [design-cycle-moments-d5-spec.md](design-cycle-moments-d5-spec.md). The canvas,
Beni's captures and the Fergie Time mirror stay local (CLAUDE.md); builders read them from the
folder, and a builder that finds a different fingerprint stops.

**The review record.** Codex (GPT-6.1 Sol) reviewed the design across four rounds, all
archived under `design-cycle-moments-*`:
- **Pass 1, on D2 (8 Oct).** 5 high, 14 medium and 2 low findings, D-21 to D-41.
- **Pass 1.5 and Pass 2.** The PM seat's rebuttal brief, and Claude Design's answers with D3.
- **Pass 2.5, on D3 (11 Oct).** It closed 20 findings and opened D-42 to D-44.
- **The D4 delta check (12 Oct).** It opened D-45.
- **The D5 check and its addendum (12 Oct).** They closed D-45, after a fresh measurement of
  the app at `3937d02`.

Every finding is closed. The evidence (probe scripts, captures, JSON) stays local at
`~/kickoff-d2-review/`.

**Beni's rulings this plan carries.**
- **The D1 brief's settled items.**
- **The Studio rulings §15.1–15.14** (5 Oct; 15.2 amended 6 Oct).
- **The 7 Oct source rulings:** official channels only, 90-day permissions, a privacy page and
  a notice at Play shipped at S7, Made For Kids "exclude unverifiable".
- **D2's Q1–Q12** (8 Oct; Q5, sound on at Play, by his answer, the rest by recommendation).
- **The Pass 3 answers A-01 to A-08** (11 Oct): A-01 Accept, A-02 Define, A-03 Retain, A-04
  Disclose, A-05 Propose, A-06 Clarify, A-07 Global, A-08 Curated.

**The roadmaps it amends.**
- **The slice-4 stage table** in [moments-slice-4-spec.md](moments-slice-4-spec.md): S6a to
  S8.
- **The Studio roadmap** in
  [moments-studio-architecture-review.md](moments-studio-architecture-review.md) §13: R1, R2,
  ST1, ST3, ST4 and PUB.

**Precedence.** The Fergie Time design system, then the D1 brief, then the D5 spec, then this
plan, then any slice prompt. CLAUDE.md governs process and release management throughout.

## 2 · Where each part of D5 lands

| D5 part (spec section) | Slice | Reader sees it |
|---|---|---|
| The generated kind's still rendering (§1, §3): the `Generated` badge (`.moments-kind`, from `record.kind`), the STUDIO cover, Facts, the generated source line, `data-kind` on the card with no outbound link, the provenance rows under Source & curation, the Studio category and the Newest clause (15.6), the queue suffix, the spoiler-light rules | **R1** | At PUB |
| Hosted playback (§1, §3, §6 A2–A4): the `<video>` inside the one host (no `src` before Play, no poster, `preload="none"`, `object-fit: contain`), Kickoff's shared Play/Pause/Replay/Retry row, the status line, the hosted recovery copy keyed to `MediaError.code`, sound on at Play (Q5), the focus contract | **R2** | At PUB |
| Q12's rule (`source.name` ends "/ YouTube" for `provider: youtube`), on `src/curated/moments.json` only (A-08) | **S6b** | Never directly; it guards S7's edition |
| The notice beside Play (§3 B1: full form before the visit's first Play, short form after, held in memory, Play `aria-describedby` it, the PM15 wording invariant, accepted as drawn under A-01); the YouTube source line `<Channel> / YouTube`; the Cinema's own Privacy & terms line | **S6d** (new) | At S7 |
| `public/privacy.html` and `public/privacy.css` (§9), with `#terms` as Kickoff's own terms of use (A-02); the shell foot `Privacy & terms` on every tab (§13, A-07) | **S6d** (new) | At S7 |
| The Studio admin surface (§1 Studio rows, §3 Studio copy, §5, §8): shell, composer, estimate, jobs with 14 states and the two Completed substates, banners, the review checklist (Q10), the attestation, the Export screen with A-04's confirmation and A-06's gate | **ST3** | Never (local tool) |
| Export mechanics (§10, under A-03): the GitHub Releases media port, export identity, `make_latest: "false"`, upload before the draft PR (A-04), partial-failure recovery, verify-media, A-06 enforcement at upload | **ST4** | Never (local tool) |
| The first generated edition | **PUB** | Yes |

D5 also lists the design system's drift from `src/index.css` (§2: `--ink-muted` and seven
missing tokens). Fergie Time is Beni's and local-only, so that is a note for him and Claude
Design, not a build slice.

## 3 · Two lanes, and the order

The two halves keep building in parallel (15.14). They work in different parts of the repo, so
they run as two lanes with **one open PR per lane**.

**Lane A — the reader and the YouTube edition, in `src/`, `scripts/` and `public/`:**

S6a → S6b → **R1** (floats) → S6c → S6d → S7 → S8 → R2

- **The YouTube edition goes first** because it is closest to readers: S4b ran complete on
  7 Oct, and S5.5 is ruled.
- **R1 floats.** An absent `kind` means curated (review §7.3), so the union is additive and
  never blocks S7. R1 goes into the first gap in Lane A, most likely while S6c waits on Beni's
  ids and observation runs. It must land before ST4, because the export validates against the
  reader's schema.
- **R2 comes after S8.** It serves only generated playback, which nobody sees before PUB, and
  waiting keeps the player host free for S6d and S7. Only one builder works in the player
  host at a time (`MomentsPlayerHost.tsx`, `MomentsPlayback.tsx`).

**Lane B — the Studio, in `studio/`, outside the reader (15.3):**

ST1 → ST3 → ST4 (after R1) → PUB (after R2, and after the A-06 answer)

- ST1 can start now; D5 does not change it.

**Can start this week:** S6a in Lane A and ST1 in Lane B.

## 4 · The slices

Tests are named T1 to T17, as in Codex's merged list (the D4 delta check, block 5,
reproduced in §7 below).

### S6a — rows 66 and 68 (unchanged from the slice-4 spec)
- **Scope.** Copy for provider codes 2 and 5 (row 66), and Play on the single-file build as
  link-only (row 68), as ruled on 2 Oct. Nothing from D5.
- **Stays inert.** The edition and Pages.
- **Proves.** Typecheck, tests and the browser matrix. The production stylesheet is unchanged,
  or the PR states its new size and SHA-256 and why.
- **Default route.** Cursor (Grok 4.7 High) builds; fast-track cold read by Claude Code.

### S6b — edition tooling, plus Q12
- **Scope.** The slice-4 scope (snapshot projection, the sync-neutral draft test, the
  populated-bundle matrix, and the keyless APIs Explorer Made For Kids trial on one id), plus
  Q12's rule in `scripts/validate-moments.ts`. It applies to `src/curated/moments.json` only
  (A-08): the acceptance template, the generator's test edition and every receipt keep their
  synthetic labels and are not validator inputs.
- **Proves.** An offline build: `validate-moments` never fetches. Q12 is red on a bad suffix
  and green on a good one, and never runs on the test inputs. Part of T10.
- **Default route.** Cursor (Grok 4.7 Extra High) builds; fast-track cold read by Claude
  Code.

### R1 — the reader contract, and the generated kind's still rendering
- **Scope.** The review's §7.2–7.4: the `curated | generated` union, with an absent kind
  meaning curated; the hosted identity; provenance (the prompt as text, 15.7); the policy
  block (`fictionalOnly: true`); playability by provider (C6); and C10's expiry choice, which
  R1's brief still decides. Amendment A7 already settles the YouTube edition: playability at
  the edition's newest `checkedAt`, never the wall clock, and first-edition permissions carry
  an `expiresAt` ([moments-slice-4-spec.md](moments-slice-4-spec.md)). C10's generated choice
  is a different one: either generated permissions carry no expiry, or the build-time test
  evaluates at `curatedAt`. Those are not the same instant, and this plan does not pick one.
  On the UI side, D5's still-rendering parts (§2 above), with the copy verbatim from §3.
- **The address.** A proposal for R1's brief. D5 §10, under the proposals §11
  brings back to Beni, says `source.identity.url` is the release address
  `github.com/<owner>/<repo>/releases/download/<tag>/<assetId>.mp4`, never a signed redirect.
  The review's C2 says the URL is built in code from one allow-listed origin constant and the
  record cannot name a host. This plan would meet both by having the record carry the release
  tag and the asset id, and having code build
  `https://github.com/BeniCheni/kickoff/releases/download/<tag>/<assetId>.mp4`. Never a
  signed redirect. R1's brief asks Beni before the schema locks the shape (§8).
- **The A-06 refusal.** `validate-moments` refuses any `kind: "generated"` record while the
  A-06 record (§5) holds no answer. That keeps the edition free of generated clips until PUB
  whoever merges, and it is the repository half of A-06.
- **Stays inert.** The edition holds no generated record. The acceptance build gains a
  generated item with no media.
- **Proves.**
  - Contract tests, with each refusal red then green.
  - T11 for the generated kind: filters, Newest placement, saved, spoiler-light, queue.
  - The 72-cell inert comparison on the production bundle.
  - The stylesheet's new size and hash, recorded. Reader CSS has changed in earlier PRs,
    including the Cinema repair (PR #159). R1 records the hash this slice produces.
- **Default route.** Codex (GPT-6.1 Sol High) builds; full pipeline (Pass 1 Claude Code).

### S6c — the initial-edition proposal (unchanged from the slice-4 spec)
- **Scope.** The ids are Beni's, with one observation run per id under his written authority.
  Each item carries its Made For Kids lookup, a source name ending "/ YouTube" (Q12), and a
  permission expiring 90 days after `checkedAt`. The draft is validated outside
  `moments.json`.
- **Default route.** The PM seat drafts; Beni supplies ids and runs; cold read by a vendor
  that did not draft it.

### S6d — the publication chrome, built dark (new)
- **Scope.**
  - The notice, the YouTube source line and the Cinema's line (§1, §3).
  - The shell foot, as the last child of `App.tsx`'s 780 px wrapper (§13).
  - `public/privacy.html` with `#terms`, and `public/privacy.css` (§9): a token block copied
    from `src/index.css`, with a unit test that the two blocks are equal; the three font
    links; the theme from `prefers-color-scheme` without JavaScript and from `kickoff-theme`
    with it; the stamp set by hand.
- **Dark until S7.** S6d builds the notice, the page, the shell foot and the Cinema line, and
  ships them unlinked. While the published edition is `[]`, the shell foot is not rendered and
  `public/privacy.html` sits at an unlinked URL, so readers of the production bundle see
  nothing. This is the one place the plan sequences D5 rather than building it as drawn.
  After S7 the foot is on every tab, exactly as D5 §13 and A-07 draw it — Fixtures, Table and
  Moments — and it stays on if the edition later has no playable item. Playability does not
  gate it. The Cinema line is the dialog's own link (D-25, D5 §13): it is in the focus cycle
  while Cinema is open, and the shell foot is inert behind it (T16).
- **Proves.** T5, T14 and T16, and the notice parts of T2. The shell foot must belong to the
  inert background while Cinema is open (T16). The acceptance build, which holds YouTube
  items, shows the foot on every tab and the Cinema line. The production bundle, edition
  `[]`, shows no foot. T14 on the production bundle is S7's proof that the foot is then on
  every tab.
- **Default route.** Cursor (Grok 4.7 Extra High) builds; full pipeline, because this is what
  readers will meet at S7.

### S7 — the publication PR (the slice-4 scope, now smaller)
- **Scope.**
  - The edition: the empty-edition test replaced by the A7 playability test, the README and
    CHANGELOG, and the version strings.
  - The shell foot turned on, on every tab, and left on (A-07, D5 §13). S7 does not leave it
    gated on a playable item.
  - The privacy stamp set to the PR's date and version.
  - Developer Policies III.A and III.C re-read at source on the day.
  - Any terms wording Beni or counsel changed.
- **Gate.** Publication authority; the number is Beni's (15.14). Six-pass 360. T13.

### S8 — live confirmation, then the tag (unchanged), plus two checks
- The link and the privacy page live on Pages, with JavaScript on and off.

### R2 — hosted playback
- **Scope.** C8's composite adapter: one host, a YouTube frame or a `<video>`, never both live.
  The shared action row, the status line, the hosted recovery copy, sound on at Play, and the
  A2 focus contract. Plus the acceptance item backed by a tiny synthetic same-origin clip
  (review §12) and C12's matrix count.
- **Stays inert.** The edition holds no generated record.
- **Proves.** T1, T2 and T3, and T11 with playback.
- **Default route.** Codex (GPT-6.1 Sol High or Extra High) builds; full pipeline.

### ST1 — Studio core (unchanged from the review §13)
- **Scope.** The `studio/` folder, excluded from the Tailwind scan. The registry, state
  machine, ledger, caps ($1.50, $6, $9.37), the fal port with its stub, the CLI, and the
  Drizzle schema on PGlite tests.
- **The timeout.** A-05 left it a proposal. ST1 makes the timed-out ceiling one config value,
  defaulting to 10 minutes and labelled a proposal; ST1's brief asks Beni to set it.
- **Proves.** The production stylesheet and single-file hashes stay equal to `main`'s, and the
  Studio suite stays outside the required check.
- **Beni.** He creates the Supabase project before the first live use, not before the merge.
- **Default route.** Cursor (Grok 4.7 Extra High) or Codex lighter builds; full pipeline.

### ST3 — the Studio surface from D5
- **Scope.** Everything in D5's Studio rows and copy: the 14 states and two substates, both
  banners, the checklist (Q10), the attestation, the Export screen's UI with A-04's
  confirmation and A-06's gate, and §8's names and keyboard order. The server listens on
  loopback only.
- **The export action** is wired to ST4's port when ST4 lands. Until then it is drawn and
  disabled, with its reason.
- **Proves.** T6, and T12 against the stub. The reader's hashes are unchanged.
- **Default route.** Codex (GPT-6.1 Sol High) builds; full pipeline.

### ST4 — the media port and the export (after R1)
- **Scope.** D5 §10's proposals, settled in ST4's brief with Beni:
  - the identity `media-<yyyymmdd>-<8 hex>`, with a retry-safe branch and title;
  - `make_latest: "false"`, sent as a string;
  - upload first, then the draft PR (A-04); the upload is asked on every export;
  - partial-failure recovery;
  - verify-media on export PRs only, bounded to records whose address is new or changed;
  - A-06 enforced at upload (§5).
- **Proves.** T8, T9, T10 and T15. T4 needs one public MP4 in a test repository, under Beni's
  authority.
- **Beni.** The immutable-releases setting (on or off) and the test repository and token.
- **Default route.** Codex (GPT-6.1 Sol High) builds; full pipeline.

### PUB — the first generated edition (unchanged from the review §13, plus)
- The A-06 answer recorded (§5).
- The 15.12 primary read: fal's output terms and Article 50, quoted into the content policy's
  section two.
- The privacy page's Hosted clips line made current, with the redirect domain re-checked.
- Gate: publication authority, and the number is Beni's.

## 5 · The A-06 record — a proposal, settled in ST4's brief

A-06 needs an explicit answer on whether Article 50 applies to Kickoff, and what disclosure it
would need, before any generated clip is published. Codex showed that a disabled Studio
button alone does not do that: a merge from anywhere else, or a manual upload, would bypass
it.

The proposal is one committed record that both halves read. For example,
`src/curated/publication-gates.json` would hold `article50: { answer, disclosure, recordedOn,
recordedBy, source }`. The content policy's section two quotes it. Two readers enforce it:
- **The repository.** `validate-moments` refuses `kind: "generated"` records while the answer
  is absent (built in R1). This covers every merge.
- **The Studio.** The export refuses to upload while the answer is absent (built in ST4). This
  covers the first public upload.

Who answers stays unnamed until Beni names someone. The no-upload draft path stays behind the
gate too, as D5 draws it. Tests: T15.

## 6 · What every slice prompt carries

- **The repo.** A fresh fetch, and SHAs taken from GitHub.
- **The design.** D5 read at its fingerprint, with copy verbatim from §3 and values
  substituted. Precedence as in §1.
- **The stylesheet.** Tooling-only PRs prove the production stylesheet and single-file hashes
  unchanged; reader PRs record the new size and hash and say why.
- **Drift gates** name the paths that carry layout or behaviour: `src/index.css`, `App.tsx`,
  `src/components`, `public`, `index.html`. Never `src/data`, which the sync changes daily.
  That is the D5 lesson.
- **Never committed:** the design folder, captures, `_ds/`, receipts, keys or photographs.
- **Never read:** nothing under `~/s4b` or `~/kickoff-s4b`.
- **No provider request** except under Beni's written authority. Live runs are Beni's.
- **Process.** Comments posted with `--body-file`; `TZ=America/New_York date` before any date;
  tests recounted.
- **Never:** `npm run sync` or `npm audit fix`.

## 7 · Tests the plan must own (Codex's merged list, 12 Oct)

| # | Test | Slice |
|---|---|---|
| T1 | K3 host lifetime with a loopback clip: no fetch before Play, no remount or reparent, one player, real `object-fit: contain` | R2 |
| T2 | Native controls and focus: Play focus, Pause focus, Retry, Cinema Escape to the opener, fullscreen Escape, event synchronization. No frame-step shortcut test (D-44) | R2; the notice parts in S6d |
| T3 | Recovery beyond code 4: real codes 1, 2 and 3 and a timeout on loopback | R2 |
| T4 | WebKit playback of a public release MP4 served as octet-stream | ST4 (Beni's authority) |
| T5 | The standalone privacy page: JavaScript off, both schemes, 390 and 1000, token equality, the stored and Broadcast-only theme cases, no new key | S6d |
| T6 | The built Studio's accessibility: screen reader; 25, 21 and 8 stops (9 once the gate is recorded) | ST3 |
| T7 | The 16:9 run | Beni (spend) |
| T8 | The release setting and replacement, in a test repository | ST4 (Beni's authority) |
| T9 | Export identity, idempotency and lifecycle | ST4 |
| T10 | The offline build and bounded verify-media | S6b (offline), ST4 (verify-media) |
| T11 | Runtime filtering, save, spoiler-light and queue for the generated kind | R1, R2 |
| T12 | Studio operations and persistence | ST3 (stub), ST1 |
| T13 | Publication-day refresh: setting, redirect, sources, stamp, prices | S7, PUB |
| T14 | The shell foot in the real app: every tab × lens × theme at 360, 375, 390 and about 1000, nothing above it moves, `?only=` and `&date=` unchanged | S6d (acceptance build); S7 (production bundle, every tab) |
| T15 | The A-06 record and its two enforcement points | R1, ST4 |
| T16 | The Cinema's own link, inside the dialog's focus cycle; the shell foot inert behind it | S6d |
| T17 | D-45 — closed 12 Oct (D5 check addendum) | done |

## 8 · What stays Beni's

- **The 16:9 run.** $0.075 was the measured price on 11 Oct, and $0.125 from 15 Oct is the
  derived later estimate (D5 §12). Refresh the quote on or after 15 Oct rather than treating
  $0.075 as a current price (T7).
- **R1.** The address shape in §4: tag and asset id in the record, the URL built in code,
  against C2 and D5 §10. Asked in R1's brief, before the schema locks it.
- **S6c.** The ids and one observation authority per id.
- **S7.** Publication authority, the number (15.14), and any terms wording change (counsel
  only if he asks).
- **ST1.** The Supabase project, before first live use; he holds the password and keys. The
  timeout value (A-05).
- **ST4.** The immutable-releases setting; a test repository and token; the identity, Latest
  and verify-media proposals.
- **PUB.** The Article 50 answer and who gives it (A-06); publication authority and the
  number.

## 9 · Deliberately not done

- No code, test, workflow, dependency, README or CHANGELOG change, and no version or tag.
- No slice prompt: each is written on its day.
- No ruling for Beni. §5's record, §4's sequencing and §4's address shape are proposals he can change.
- The D5 canvas, Beni's captures and the Fergie Time mirror are not committed.
- No re-sync of the design system: Fergie Time is Beni's, local-only.
- No new provider observation, upload, release, tag or spend.
