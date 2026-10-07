# Moments slice 4 — specification

Written by the PM seat on Thu 1 Oct 2026 (TZ=America/New_York) from a fresh read of
`origin/main` at `7636b08`. That is the PR #128 squash `9188cb6` plus scheduled sync commits
only: `git diff --stat 9188cb6 7636b08` touches `src/data/*.json` and `docs/sync-digest.md`
and nothing else. This file supersedes `docs/moments-player-plan.md` §9, which stays as the
original archive. It assigns no version number.

Amended Sun 4 Oct 2026 for two of Beni's rulings on the S4a runner (draft PR #144, Pass 2):
**Hosts** and **Shelf**. Only the rulings table, the S4 stage row, the S4 protocol and the
Unverified table changed; everything else is as written on 1 Oct. Amended again on 6 and
7 Oct 2026 for his S4b tooling rulings (PRs #164 and #168), in the same places: a rulings
table for each day, the S4 protocol and the Unverified table.

## Authority

Rulings this spec carries, in force before it was written:

- 28–29 Sep 2026: object-form `loadVideoById({ videoId, startSeconds })`; the phone stage and
  Cinema boxes grow to at least 200px tall; the iframe is built on `youtube-nocookie.com` with
  `allow="autoplay; encrypted-media"`; reload-and-seek labels last-known recovery, not
  continuity.
- 30 Sep 2026: keep `referrerpolicy="strict-origin-when-cross-origin"`. PR #128 findings 1, 2,
  5 and 20 are high only once an edition exists. “Resuming from the last known position.” is
  accepted; a provider sample of exactly zero must not show it, and a later sample greater
  than zero still may (`afa7626`). Ideas rows 65, 66 and 68 stay deferred.

Beni's rulings on the slice-4 plan, 1 Oct 2026:

| Question | Ruling |
|---|---|
| Is the first real request loopback-only? | **Yes** |
| Is a demo edition in this plan? | **In** — behind a separate publication yes |
| Who names the video ids? | **Beni** |
| Does slice 4 stay a non-release until a reader can use Moments? | **Yes** |

Beni's rulings of 4 Oct 2026, on the S4a observation runner (PR #144, Pass 2). They narrow the
S4 protocol and nothing else here:

| Question | Ruling |
|---|---|
| Which hosts may the player contact? | **Record named hosts.** The written authority lists every host family beyond the two required; the runner prints the list in the confirmation Beni types. Any other host is aborted by the runner and flagged in the observation notes. |
| What if the shelf shows another video? | **Stop on playback of another id.** A shelf thumbnail or storyboard image is recorded, not a stop. |

Beni's rulings of 6 Oct 2026, on the tooling that precedes his S4b visit. They do not open a release:

| Question | Ruling |
|---|---|
| How fresh is the written authority? | **24 hours.** Live mode refuses it when `now - at` is more than 24 hours, at the start and again at the typed confirmation. Exactly 24 hours is accepted. A second visit inside that window, with a new output directory, is still possible. Nothing marks an authority spent. |
| The Chrome debugging port? | **Replace.** Chrome opens no debugging port. The network guard uses Playwright's own pipe. |
| A shelf thumbnail with a query string? | **Stop.** The run fails closed. S4b observes the real shelf traffic. |
| Escape once the picture has focus? | Stays on ideas row 100. It is not fixed before S4b. |

Beni's ruling of 7 Oct 2026, after the 6 Oct visit showed the request the 6 Oct Stop was waiting for. It narrows that Stop for one shape and does not open a release:

| Question | Ruling |
|---|---|
| A shelf thumbnail with a query string? | **Allow, narrowly: only `sqp` and `rs`.** The real player requests them. |

Still open, and asked separately: (5) add a one-page first-edition source policy, S5.5,
before edition ids are picked; (6) keep the S4 test ids separate from the edition ids. The
PM seat recommends yes and separate. Neither blocks S1–S3. S4 needs an answer to (6); S6
needs an answer to (5).

**This spec authorises none of the following:** a request to any provider host; an edition
in `src/curated/moments.json`; a staging site; a workflow, cron or CI change on the sync or
Pages path; a version, tag or release. Each has its own gate below.

## What the repo says that the archived §9 does not

1. **The embed-permission check is not connected.** `hasEmbedPermission`
   (`src/lib/moments.ts`) is called only by `tests/momentsContract.test.ts`.
   `src/components/MomentsPlayback.tsx` offers Play for any item with `source.identity`, and
   `MomentsSessionProvider.play` passes that item's `videoId` to the adapter. The README's
   “clear permission to embed” is not enforced anywhere a reader would meet it.
2. **§9 cannot run as written.** It asks for a served `npm run build`; with `moments.json` at
   `[]` that bundle renders no player. A loopback run needs an edition input that the Pages
   build cannot reach.
3. **A test pins the edition to empty.** `tests/moments.test.ts` asserts
   `parseMoments(raw, FIXTURES)` equals `[]`. Publication replaces that assertion on purpose.
4. **An edition couples Moments to the betting pipeline's Step 0.** `npm run build` runs
   `scripts/validate-moments.ts`, and `parseMoments` throws when a curated fixture's teams,
   kickoff, competition, venue zone or time confidence disagrees with the live snapshot. CI's
   `verify` builds every sync PR, and the sync fetches today −30 to +150 days
   (`scripts/sync.ts`). A provider correction to a curated fixture inside that window turns
   `verify` red. The sync PR then cannot auto-merge, and every later run ends MERGE
   UNCONFIRMED until the curation is fixed. A fixture outside the window is not
   cross-checked. The first committed snapshot (`1fad342`, 23 Aug 2026) carries kickoffs from
   12 Aug 2026.
5. **There is no private preview of the demo.** `pages.yml` deploys every push to `main`, and
   `sync.yml` dispatches it after each bot merge. Merging an edition is publishing it.
6. **Two receipts cannot be re-run from the repo.** The real-adapter stub and the 180-box
   layout probe live in `/Users/benicheni/kickoff-pr128-pass2/pass1`, and the stub needs a
   copied dev entry (`docs/verification/moments-player/pass2.md`, “Regression and
   supplementary probes”). The 1,260-cell matrix, the six mutations and the 72-cell inert
   comparison are in the repo.
7. **The harness examples deliberately claim no permission.** `tests/fixtures/moments/gallery.ts`
   says its archival items claim no present availability or permission. They carry the three
   historical ids. `tests/harness/moments.tsx` and `tests/dom/momentsPlayerHost.test.tsx`
   play them through the mock. Once Play is gated, those paths lose Play unless the gate has
   a test seam.
8. **The README's description becomes false at publication.** It says Moments “never plays
   anything here”.

## Stages, steps and gates

Through S6, a reader of `https://benicheni.github.io/kickoff/` sees exactly today's site and
`moments.json` stays `[]`.

| Step | What it is | Reader sees | Stays inert | Evidence | Gate |
|---|---|---|---|---|---|
| S1 | This spec | Nothing | Everything | Review against `docs/moments-architecture.md` | None |
| S2 | Connect the permission check; test seam; acceptance build and edition; probes into the repo | Nothing | Pages, edition, provider | Gate tests fail before and pass after; build grep; 72-cell inert comparison | None |
| S3 | Integration acceptance on the S2 tip, as the S2 PR's builder evidence | Nothing | Zero provider egress | Receipts below | None |
| S4 | Loopback real-provider observation | Nothing | Pages, CI, every unnamed id | Protocol below | **Provider authority** + host families and ids named in writing |
| S5 | Optional same-origin staging observation | Nothing at `/kickoff/` | `/kickoff/` | Referer and 153 on HTTPS | Its own yes, asked after S4 |
| S5.5 | First-edition source policy (if ask 5 is yes) | Nothing | Everything | Review | Ask 5 |
| S6 | Initial-edition proposal | Nothing | Edition, Pages | Branch CI validates the draft outside `moments.json` | None beyond S4 |
| S7 | The publication PR; **merging it is the publication decision** | Gallery; Play on permitted items; a picture after Play | Unpermitted items stay links; no autoplay on entry | Six-pass 360; populated matrix on the production bundle | **Publication authority** |
| S8 | Live confirmation on Pages, then the tag | As S7 | — | Pages run for the merge SHA; live probe; next sync green | Beni's number and tag |

S2 and S3 ship as one pull request: S3's receipts are the builder's acceptance evidence for
S2's tip, and the cold review re-runs them. Splitting S2's code into commits or PRs is the
builder's call.

## S2 contracts

### Permission check

- One playability rule decides, from a moment and the app clock's `nowUtcIso`, whether an
  item may offer Play. Its production default is `hasEmbedPermission(source, nowUtcIso)`.
  Every place that decides playability uses it. Today those are `MomentsPlayback`'s
  `identity` (the Primary control, the secondary source link and `PlaybackRecovery`) and
  `MomentsSessionProvider.play`'s `videoId`. The builder finds any others.
- An item that fails the rule renders exactly as a link-only item does today: the source link
  is the primary action, and there is no Play, recovery copy or player stop. `play()` for
  such an item creates no attempt and passes nothing to the adapter, even when called
  directly.
- A permission that lapses during a visit stops any new Play, Retry or Replay from the next
  clock tick. What happens to a frame already playing at that moment is the builder's call:
  park it through an existing path, or let the current attempt run. Record the choice and
  test it.
- Missing, `unknown`, `denied` and `revoked` decisions, an expiry at or before now, a missing
  identity, `unknown` content scope and `unverified` content all fail. That is the existing
  `hasEmbedPermission` contract, unchanged.

### Test seam

- The harness and DOM tests may inject a different playability rule through the same kind of
  optional `App` prop the player factory already uses. `src/main.tsx` passes neither. The
  archival fixtures keep their no-permission statement. Do not add permission records to
  items that carry the historical ids.
- The real adapter never runs with the injected rule. Real-adapter journeys run on the
  acceptance build, which uses `src/main.tsx` and the production rule. Retire the copied
  `_probe_real` dev-entry approach.

### Acceptance build and edition

- A build reachable only by a separate script, for example `npm run build:acceptance`, emits
  to its own git-ignored directory. It substitutes an acceptance edition for
  `src/curated/moments.json` at bundle time. The mechanism is the builder's: a Vite mode and
  an alias, or equivalent.
- `npm run build` and `npm run build:single` cannot reach that input, whatever the
  environment. Prove it by grep over `dist/` and `dist-single/` for every acceptance id and
  marker.
- The acceptance build validates its edition with `parseMoments` against the committed
  snapshot before bundling, and fails on any error.
- The acceptance build marks itself without changing layout, for example a `document.title`
  prefix and a root data attribute. Every receipt names the build it ran.
- The committed acceptance edition uses fictional 11-character ids, never the historical
  ones. It includes at least:
  - two permitted items, so Next and Previous, reload-and-seek and the resume sentence can run;
  - one item with an identity and no permission;
  - one `denied` and one with an expiry in the past;
  - one legacy link-only item without identity.
  Permission `basis` text must say these are fictional acceptance records.
- Acceptance fixtures come from a committed snapshot, cited by SHA, and must be absent from
  the current snapshot, so neither the sync nor `npm test` can collide with them. A node test
  validates the file and asserts that absence.
- S4 later supplies its named ids through a path given to the same script. The format and
  rules are the S4 prompt's; S2 only makes the input replaceable without editing the
  committed file.
- `pages.yml`, `sync.yml` and `ci.yml` do not change.

### Probes in the repo

- Bring the real-adapter stub and the layout probe into the repo, under a new
  `docs/verification/moments-acceptance/` (scripts and receipts). No dependency is added;
  scripts take the Playwright runtime and Chrome paths as arguments, as the existing checkers
  do.
- The real-adapter stub runs against the served acceptance build. The browser context
  fulfils `https://www.youtube.com/iframe_api` from a committed stub script that attaches
  player methods at ready, as the reference describes, with a control variant that attaches
  them at construction. The context fulfils the nocookie embed URL with an empty document and
  aborts every other provider host. Zero requests may leave the machine for a provider host.

## S3 acceptance receipts (in the S2 PR)

Base is the branch's merge base with `main`, built from the same data snapshot as the tip.
Record its SHA.

1. Re-run, at base and tip, the four in-repo checks Pass 3 did not re-run:
   - the 1,260-cell player matrix (`docs/verification/moments-player/check-player.mjs`);
   - the six checker mutations (`check-mutations.mjs`);
   - the 72-cell inert comparison (`docs/verification/moments-foundation/check-browser.mjs`);
   - the 180-box layout comparison, using the probe brought into the repo.
2. Run the real-adapter stub at the tip on the acceptance build.
3. Run full journeys at the tip on the acceptance build with the real adapter and the stub API,
   each at 360, 390 and 1000 with the viewport set before load:
   - Play, stage, Cinema, park and return.
   - Next, then Previous: the resume sentence appears only after a sample greater than zero,
     and a sample of zero shows none.
   - Error codes 150, 2, 100 and 153.
   - Player-lost Retry, tab away and back.
   - Each failing permission item shows no Play and issues no adapter call.
4. In every cell: `scrollWidth === innerWidth`; at most one iframe; zero requests before Play
   other than Google Fonts; zero provider egress.

The receipt states plainly that a green stub is not playback.

## S4 observation protocol (written now; runs only after both its gates)

- **Environment:** installed Google Chrome, headed, fresh profile, version recorded. Chrome
  opens no debugging port. The acceptance build with Beni's named ids, served on `127.0.0.1`
  with the port recorded. One page load. No CI, cron, `workflow_dispatch` or Pages. The written
  authority is no older than 24 hours when the run starts and again at the typed confirmation.
- **Ids:** at most two, named by Beni in writing. Each must pass the playability rule at the
  test instant. If Play does not appear, stop. Ideally one plays and one has embedding turned
  off by its uploader (error 150). If Beni names one id, the 150 path stays stub-only.
- **One visit:**
  1. A plays with a cold API load and is paused above zero.
  2. Next selects B, which uses the warm API and `loadVideoById` on the same instance.
  3. Previous returns to A: reload-and-seek, and the resume sentence.
- **Network allowlist, enforced:** every provider host is aborted before Play. After Play,
  only `https://www.youtube.com/iframe_api` and one `www.youtube-nocookie.com/embed/<named
  id>` frame per named id are released. Further requests the player then makes (scripts,
  media, images) are released only to host families Beni's written authority names, and are
  recorded host by host; none is described as expected in advance.
  - **Hosts are named, not discovered.** The authority lists every host family it permits.
    `youtube.com` and `youtube-nocookie.com` are always required; any other family the player
    needs (a thumbnail, media or avatar family, say) must be named before the visit. A name
    covers itself and its subdomains. The runner prints the list in the confirmation Beni
    types before Chrome launches. That confirmation also re-checks the 24-hour bound.
  - **A provider family the authority leaves out stops the run.** A request to any other,
    non-provider host is aborted by the runner, counted by host and reason, and noted in the
    observation as a runner decision rather than a provider failure. An aborted request can
    change what Beni sees, so the picture and ad answers describe this allowlist, not the
    provider's unrestricted behaviour.
  - **Another id.** Any request carrying a video id that was not named is aborted, and that
    ends the run, with one exception: **a shelf image.** An image request whose path is
    `/vi/<id>/…`, `/vi_webp/<id>/…`, `/an_webp/<id>/…` or `/sb/<id>/…` with exactly one id
    and no body, on an authorised host, after the API script has been released, is recorded
    as a shelf image instead. Its query is empty, or every key is exactly `sqp` or `rs`
    (case-sensitive), each key once, and every value is nonempty and at most 256 characters
    and, once percent-decoded, only letters, digits, `_`, `.`, `-`, `=`, `+` and `/`. An
    escape may spell one of those characters (`%2F`, `%3D`) and nothing else, so a nested URL
    with a scheme, in any case or encoding, a smuggled `&`, whitespace or a second layer of
    escapes stops the run, as does anything else in the query. A scheme-less path spelled
    from that alphabet, such as `//www.youtube.com/embed/<id>`, is recorded: the id check
    does not read an id there (see its limits below). A frame, document, API, fetch, XHR or
    media request for another id still stops the run: that is playback, not display.
  - **Limits of the id check.** It reads recognised identity locations only. An id inside an
    opaque media signature, a binary body or an unknown parameter is not seen, so “no unnamed
    id” is a claim about what the runner can read.
- **Observe:**
  - picture on stage and in Cinema at 390 and 1000; at 360, the 16:10 box and any letterboxing;
  - one-press playback, cold and warm; `onAutoplayBlocked`;
  - the iframe's attributes after ready (`src` host and query, `allow`, `referrerpolicy`,
    `allowfullscreen`);
  - the Referer header actually sent on the frame request; error 153 or not; ads;
  - park and return: same element, same position, bytes fetched while parked;
  - queue hit-tests on the live frame; console; reducer snapshots;
  - hosts contacted and runner aborts, counted by host and reason; shelf images recorded.
- **Stop, and do not continue to another id or origin:**
  - any provider request before Play;
  - a second iframe or API script;
  - the iframe's parent changes;
  - the live box covers a queue row, or `elementFromPoint` on a row hits the frame;
  - navigation waits on a cross-origin reply;
  - a second terminal failure on one attempt;
  - a position that did not come from `getCurrentTime`;
  - error 150 described as a territory block;
  - error 153;
  - `onAutoplayBlocked` on a warm direct click;
  - the parked player returns blank, or the instance died;
  - the resume sentence after a zero sample;
  - Play shown for an item that fails the rule;
  - a provider family the authority does not name;
  - any id not named, other than a shelf image whose query is empty or only `sqp` and `rs`.
- **Output:** dated `source.availability` observations, with an environment string naming
  loopback and the Chrome version, for S6. Nothing is written to `moments.json`.
- **What it does not prove:** anything about the Pages origin. Pages is HTTPS, on another
  origin, with no port. A loopback pass or failure predicts nothing there.

## S5–S8 in outline

- **S5.** Under `strict-origin-when-cross-origin`, a page at
  `https://benicheni.github.io/<repo>/` should send the same Referer and `origin` as
  `/kickoff/`. This is inferred, and the first check is `location.origin` on both pages. A
  throwaway project site serving the acceptance build would observe the Pages-origin Referer
  and 153 without touching `/kickoff/`. It is a public, unlinked URL, needs its own yes, and
  comes down afterwards. Without it, the first Pages-origin observation is S8.
- **S6.** For each item:
  - the id Beni named;
  - the fixture row copied from a cited snapshot SHA;
  - content verified as watched;
  - an `embed` permission with its basis in Beni's words;
  - the S4/S5 observations;
  - title, spoiler-light copy, cover and order.

  Every fixture is outside the sync window on the intended merge date, unless Beni accepts the
  Step 0 coupling (finding 4) in writing. The proposal names the rollback: revert to `[]`,
  which Pages redeploys.
- **S7.** The edition; the empty-edition test replaced by “the committed edition validates
  and every identity item passes the playability rule at build time”, named in the PR as a
  replacement; the README corrected; rows 66 and 68 resolved as Beni rules and row 65
  disclosed; a CHANGELOG section with “Deliberately not done”; the version strings. The
  number is Beni's.
- **S8.**
  - The Pages run succeeds for the merge SHA.
  - In one Chrome: no provider request before Play; a picture after Play; the Referer and
    153 on the real origin; Fixtures and Table unchanged.
  - The next sync run is green.
  - Any stop condition means revert.
  - Then the tag.

## Unverified, and where each item gets observed

| Item | First step that can observe it |
|---|---|
| Real playback, ads, ready-window duration (no timeout is invented), one-press playback, attribute retention, 16:10 letterboxing in desktop Chrome, parked decoding | S4, as one sample each |
| Which host families the real player contacts, and whether its shelf thumbnails carry a query string | Observed once, on 6 Oct 2026: about 1.3 seconds after Play the player requested one thumbnail of another video whose only query keys were `sqp` and `rs`. Before Beni's 7 Oct ruling that request stopped the run. Other query keys, and thumbnails on other hosts, remain unobserved |
| Deployed Pages Referer and error 153 | S5 or S8 |
| Physical devices, Safari, Firefox, screen-reader speech, Android and iOS Back, CloseWatcher, browser zoom | Nothing in this plan; disclosed under “Deliberately not done” unless Beni adds a device pass |
| Rights | No test; the permission basis is an authored judgment |

## Deferred, with when each must be decided

- Row 65, Cinema reading order: may stay deferred past publication if disclosed.
- Row 66, copy for provider codes 2 and 5: decided before S7, because an edition makes it
  reachable.
- Row 68, Play on the single-file build: decided before S7, for the same reason.
- The long-term curation and video data source strategy: outside slice 4 (ask 5).
