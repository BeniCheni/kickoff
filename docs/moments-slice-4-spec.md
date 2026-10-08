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
table for each day, the S4 protocol and the Unverified table. Amended once more on 7 Oct
2026 after PR #168 merged: the 7 Oct table's Base64url row, and the shelf alphabet in the
S4 protocol.

**Amended Thu 8 Oct 2026** by the PM seat, with three things. Beni's rulings of 2 Oct 2026
and the Amendments A1–A10 the Planner seat wrote that day (step P0), which were committed but
never pushed and reach `main` only now; where one of them and a later dated table here
disagree, the later table governs. Ask 5 answered: the first-edition source policy is
section one of `docs/moments-content-policy.md` (Beni's rulings of 7 Oct). And S4b's result:
three visits, the third complete (section "S4b, as run").

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

Beni's rulings of 7 Oct 2026. The first, after the 6 Oct visit showed the request the 6 Oct Stop was waiting for, narrows that Stop for one shape. The second, after that rule merged, narrows each value to base64url. Neither opens a release:

| Question | Ruling |
|---|---|
| A shelf thumbnail with a query string? | **Allow, narrowly: only `sqp` and `rs`.** The real player requests them. |
| Base64url? | **Yes**: each `sqp` and `rs` value, after one percent-decode, is base64url with up to two `=` of padding. |

Asked separately on 1 Oct 2026 and **answered yes to both** the same day (recorded in
`docs/moments-slice-4-review-prompt.md` and `docs/moments-slice-4-pass-2-brief.md`; this
spec was left unedited until #138 merged): (5) add a one-page first-edition source policy,
S5.5, before edition ids are picked; (6) keep the S4 test ids separate from the edition ids. Ask 5 is met by
`docs/moments-content-policy.md`, section one (S5.5), ruled by Beni on 7 Oct 2026.

**This spec authorises none of the following:** a request to any provider host; an edition
in `src/curated/moments.json`; a staging site; a workflow, cron or CI change on the sync or
Pages path; a version, tag or release. Each has its own gate below.

## Amendments, 2 Oct 2026

Beni's rulings of 2 Oct 2026, first-hand to the Planner seat, in answer to the fourteen
questions of the slice-4 remainder plan:

| Question | Ruling |
|---|---|
| Split S4 into S4a (the runner, no provider) and S4b (the run)? | **Yes** |
| Loader reading for the stop condition “a second iframe or API script” (A2) | **Ratified** |
| The CLAUDE.md authorship bullet: commits take the identity of the agent doing the work | **Ratified** |
| Review depth for docs-only and tooling-only PRs | **Full** — every slice-4 PR gets the six-pass 360 |
| Row 66, recovery copy for provider codes 2 and 5 | **Name** what the provider reported |
| Row 68, Play on the single-file build | **Link-only** |
| S4b inputs (authority, ids) | **Not given.** Beni's reply delegated implementation choices only; ids and provider authority stay Beni's, per run, in writing (the Planner seat's reading, restated to Beni the same day) |
| S5, the throwaway staging observation | **Yes** in principle; asked again after the S4b receipts are read, under its own written authority |
| Edition fixtures only from committed snapshot history | **Yes** |
| First-edition size | **Five** items or fewer |
| Permission expiry on first-edition permissions | **Yes** |
| Observe each edition id before S7 | **Yes** |
| The S7 version number | **Not yet given** |
| Revert pre-authorised on any S8 stop | **Yes** |

**A1. S4 splits.** S4a builds and proves the observation runner against the local stub: no
provider request, no ids, no authority. Its gate is this spec. S4b is the real run: S4a merged
and cold-reviewed, Beni's written provider authority for that run, and at most two test ids
Beni names. Beni runs S4b. A stop condition ends it, and a retry needs fresh authority. The
protocol below is what S4a implements and S4b performs. *8 Oct:* S4a merged as PR #144 on 4 Oct, with
three tooling follow-ups (#164, #168, #171); S4b ran on 6 and 7 Oct (section "S4b, as run").

**A2. The loader reading.** The stop condition “a second iframe or API script” counts the
`<iframe>` and `<script>` elements the page creates; the adapter creates one
`<script data-moments-youtube-api>` (`src/lib/momentsPlayer.ts`). Requests that provider
scripts then make, including any further script the IFrame API loader fetches, are recorded
host by host and are not stops, as the protocol already says of media and images. That the
loader fetches a second `youtube.com` script is the Planner seat's knowledge of the API, not
something in the repo or observed; the stub replaces the loader wholesale and cannot model it.
The S4b receipt is what establishes it. *8 Oct:* it did. Visit 3's receipt shows the loader
fetching `www-widgetapi.js` from `www.youtube.com`, recorded as a player request and not a stop.

**A3. Test ids and edition ids (ask 6).** S4 observations attach to the test ids and are not
edition data. An edition item's `source.availability` comes only from a separate run of the
same runner on that item's own id: at most two ids per run, each run under its own written
authority, the S6c-approved ids being the writing. This replaces S6's “the S4/S5
observations” as per-item evidence.

**A4. Where edition fixtures come from.** Fixture facts come only from a cited committed
snapshot row, through a generator; none is typed. A fixture older than every committed
snapshot is excluded unless Beni rules otherwise. On 2 Oct 2026 the pool is the 101 fixtures
in `1fad342` with a kickoff before 2 Sep 2026 (30 La Liga, 20 Premier League, 20 Serie A, 18
Ligue 1, 9 Bundesliga, four domestic cup or super-cup ties; all exact times; none a Champions
League match; none in the current snapshot). It grows by one day per day; the first Champions League kickoff in
the current snapshot is 8 Sep 2026. The row's `status` comes from the earliest snapshot in
which the match is `full_time`, found by the tool. *8 Oct:* the counts above are 2 Oct's; the pool has grown by
one day a day since, and S6b counts it on the draft date.

**A5. The sync window only moves forward.** The window is today −30 to +150 in Brooklyn
dates (2 Sep 2026 to 1 Mar 2027 on 2 Oct). Its start never moves back, so a fixture outside it
today stays outside; `scripts/sync.ts` accepts a manual `--from`, but the cron never passes
one. The rule for an edition is that every fixture kicks off before (draft date −30 days) and
is absent from the merge-day snapshot, checked at S6c and again at S7. Finding 4 stays
accurate for a fixture inside the window.

**A6. The S6 draft test is sync-neutral.** CI checks out shallow, so the edition's provenance
rows are committed in the repo, as `fixture-provenance.json` is for the acceptance edition.
The draft's test checks the schema, byte-equality with that provenance and absence from the
live snapshot, and never evaluates a permission against the wall clock. The history-backed
provenance check is ideas row 76 and stays local.

**A7. S7's test instant.** “Every identity item passes the playability rule at build time” is
read as: passes `hasEmbedPermission` at the edition's newest `checkedAt`, never at the wall
clock. A wall-clock assertion over an `expiresAt` turns `verify` red in a sync PR on the
expiry day, which blocks auto-merge, and inside `npm run build` could stop Pages deploying.
First-edition permissions carry an `expiresAt`; the app's runtime rule, which parks the player
at a lapse, is what enforces it.

**A8. Rows and severity.** Rows 66 and 68 move from S7 to S6a, a small code PR that carries
Beni's rulings above. Row 65 stays deferred and is disclosed at S7. From the S6c approval on,
a finding on the player path is rated as reader-reachable, which is high under the 30 Sep
ruling; the S6c proposal gives rows 56–60, 64–66, 68 and 71 one line each (fix, disclose, or
unreachable with the chosen items).

**A9. Review.** Every slice-4 PR runs the full six-pass 360. A PR the Planner seat writes (P0,
S5.5, S6c) is cold-reviewed by a vendor other than Claude. *8 Oct:* Beni's routing of 7 Oct softens the first
sentence: the six-pass 360 is for the larger PRs, a fast-track PR gets one cold pass that
reviews and merges, and the PM seat judges which shape fits. The independence rule holds:
the vendor that wrote a PR never gives its only cold read. #164, #168, #171 and #153 ran
fast-track.

**A10. Revert.** Before the S7 merge a revert branch is staged and proven green
(`moments.json` back to `[]`, the replaced test restored). Any S8 stop condition is met by
merging it; the pre-authorisation covers that merge's decision, and Beni still clicks it.

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
| S4a | The observation runner, proven against the stub (Amendment A1) | Nothing | Pages, edition, CI, provider | Stop-condition table with red/green proof; zero provider egress | None beyond this spec |
| S4b | Loopback real-provider observation, run by Beni | Nothing | Pages, CI, every unnamed id | Protocol below | **Provider authority** + host families and ids named in writing, per run |
| S5 | Optional same-origin staging observation | Nothing at `/kickoff/` | `/kickoff/` | Referer and 153 on HTTPS | Its own written authority, asked after the S4b receipts (yes in principle, 2 Oct) |
| S5.5 | First-edition source policy: `docs/moments-content-policy.md`, section one | Nothing | Everything | A cold read by a vendor other than Claude | Ask 5 (yes, 1 Oct); ruled 7 Oct |
| S6a | Rows 66 and 68 (Amendment A8) | Nothing | Edition, Pages | Typecheck, tests, browser matrix | Beni's rulings (2 Oct) |
| S6b | Edition tooling: snapshot projection, sync-neutral draft test, populated-bundle matrix (A4–A6) | Nothing | Edition, Pages | Tests; isolation check | None |
| S6c | Initial-edition proposal, with a per-id observation run (A3) | Nothing | Edition, Pages | Draft validated outside `moments.json`; one authority per observation run | S5.5 ruled; ids Beni's |
| S7 | The publication PR; **merging it is the publication decision** | Gallery; Play on permitted items; a picture after Play | Unpermitted items stay links; no autoplay on entry | Six-pass 360; populated matrix on the production bundle; revert branch staged (A10) | **Publication authority** |
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

Since Amendment A1 this is the protocol S4a implements in a runner and S4b performs. The
amended stop reading is A2; the output attaches to test ids, not edition items (A3).

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
    and, once percent-decoded, base64url with up to two `=` of padding: letters, digits,
    `_` and `-`, and `=` only at the end. An escape may spell one of those characters
    (`%3D` is one pad) and nothing else, so a nested URL with a scheme, in any case or
    encoding, a smuggled `&`, whitespace, a second layer of escapes, or `.`, `+` or `/`
    stops the run, as does anything else in the query. A scheme-less path such as
    `//www.youtube.com/embed/<id>` stops: those characters are outside the alphabet
    (Beni's Base64url ruling, 7 Oct 2026). A frame, document, API, fetch, XHR or
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
  - a second iframe or API script (the page's own elements; reading in A2);
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
- **Output:** dated `source.availability`-shaped observations, with an environment string
  naming loopback and the Chrome version, for the test ids (A3). Nothing is written to
  `moments.json`.
- **What it does not prove:** anything about the Pages origin. Pages is HTTPS, on another
  origin, with no port. A loopback pass or failure predicts nothing there.

## S4b, as run

Beni ran three visits from his own Mac under his written authority, each from a fresh
checkout outside the repo, with two of his own uploads as the test ids (ask 6).

| Visit | When (EDT) | Runner | Outcome |
|---|---|---|---|
| 1 | Tue 6 Oct, before visit 2 | `f8079b6` | Stopped `parked-return-blank`: Beni answered "yes" to the blank-or-dead question on a player showing error 150, an id whose uploader had embedding turned off at the time. A correct stop on an honest answer, not a defect. Recorded from the PM seat's notes; the receipt no longer exists |
| 2 | Tue 6 Oct, 20:34 | `f8079b6` | Stopped `unnamed-id` about 1.3 s after Play on a thumbnail of another video whose query was only `sqp` and `rs`. Beni ruled Allow, narrowly (PR #168), then Base64url (PR #171). The receipt no longer exists |
| 3 | Wed 7 Oct, 13:29–13:33 | `70de992` | **Complete, no stop.** Chrome 155.0.8059.40, headed; the authority 12 minutes old at launch; the acceptance build from the edition generated on 6 Oct (the same two ids), its served bytes verified against the local build |

Visit 3, as its receipt and Beni's answers record it:

- Both test ids `played`, the strict rule (a current-attempt PLAYING then a positive sample).
  The second was listed as expected owner-blocked; Beni had turned its embedding back on
  before the visit, so the error-150 path is proven by the stub only.
- One press, cold and warm. No ad. Parking kept the same element and parent, reported zero
  bytes while parked, and returned a picture, not a blank.
- The picture was Beni's own Fenway clip, with YouTube's own "AI" label drawn by the player.
  The clip is 16:10 and the box is 16:9, so the player pillarboxed it at 390 and 1000.
- 62 requests continued to the named families and none was refused among them; the runner
  refused 21 to `www.gstatic.com` and `www.google.com`, which the authority did not name,
  and every observation note says so. One thumbnail of another video was recorded as a shelf
  image; every thumbnail carried only `sqp` and `rs`, all 18 values base64url.
- `scrollWidth` equalled the width at every checkpoint (390, 1000, 360).

These are observations of the test ids on loopback, not edition data (A3). An edition id
still needs its own run. The receipts stay on Beni's Mac: they record full request URLs,
including his public address in the video-stream URLs (ideas row 103), and none is
committed or quoted here.

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
  - an `embed` permission with its basis in Beni's words, and a source that qualifies under
    `docs/moments-content-policy.md` section one (official channels only; a recorded Made For
    Kids lookup, or the item is out);
  - the per-id observation run, not the S4/S5 test-id observations (A3);
  - an `expiresAt` on the permission (ruling of 2 Oct), 90 days after its `checkedAt` (7 Oct);
  - title, spoiler-light copy, cover and order.

  Every fixture is outside the sync window on the intended merge date, unless Beni accepts the
  Step 0 coupling (finding 4) in writing (rule and pool in A4 and A5). The proposal names the
  rollback: revert to `[]`, which Pages redeploys.
- **S7.** The edition; the empty-edition test replaced by “the committed edition validates
  and every identity item passes the playability rule at the edition's newest `checkedAt`”
  (A7, not the wall clock), named in the PR as a replacement; the README corrected; rows 66
  and 68 already closed in S6a and row 65 disclosed; a CHANGELOG section with “Deliberately
  not done”; the version strings. The number is Beni's. Added 8 Oct, from the primary read
  of 7 Oct in the content policy: publishing an embed makes Kickoff a YouTube "API Client",
  so S7 also ships the privacy page and the notice at first Play that Beni ruled on 7 Oct
  (Developer Policies III.A.2), shows YouTube as the source of what it displays (III.F.2.a),
  and carries each item's Made For Kids lookup (III.E.4.j) in its proposal.
- **S8.**
  - The Pages run succeeds for the merge SHA.
  - In one Chrome: no provider request before Play; a picture after Play; the Referer and
    153 on the real origin; Fixtures and Table unchanged.
  - The next sync run is green.
  - Any stop condition means revert, through the staged revert branch (A10).
  - Then the tag.

## Unverified, and where each item gets observed

| Item | First step that can observe it |
|---|---|
| Real playback, ads, ready-window duration (no timeout is invented), one-press playback, attribute retention, 16:10 letterboxing in desktop Chrome, parked decoding, the IFrame API loader's own requests (A2) | **Observed once on the test ids, 7 Oct 2026** (S4b visit 3, below): both ids played; one press, cold and warm; no ad; the second id's first `playing` about 0.6 s after its Play; parked with zero bytes reported and not blank at return; a 16:10 clip pillarboxed in the 16:9 box at 390 and 1000; the loader fetched one further `youtube.com` script, recorded and not a stop, as A2 reads it. The iframe kept its element and parent throughout; its attributes were not read separately, so attribute retention stays unobserved |
| Which host families the real player contacts, and whether its shelf thumbnails carry a query string | Observed on 6 Oct (a thumbnail of another video, only `sqp` and `rs`, stopped run 2 before Beni's 7 Oct ruling) and on 7 Oct (visit 3): `www.youtube.com`, `www.youtube-nocookie.com`, `i.ytimg.com`, `yt3.ggpht.com` and three `googlevideo.com` hosts; the runner refused `www.gstatic.com` 16 times and `www.google.com` 5 times as hosts the authority did not name; one shelf image, and all 18 `sqp` and `rs` values base64url. Other query keys, other thumbnail hosts and anything after the first four minutes remain unobserved |
| Deployed Pages Referer and error 153 | S5 or S8 |
| Physical devices, Safari, Firefox, screen-reader speech, Android and iOS Back, CloseWatcher, browser zoom | Nothing in this plan; disclosed under “Deliberately not done” unless Beni adds a device pass |
| Rights | No test; the permission basis is an authored judgment under the content policy's section one (official channels only; Beni, 7 Oct) |

## Deferred, with when each must be decided

- Row 65, Cinema reading order: may stay deferred past publication if disclosed.
- Row 66, copy for provider codes 2 and 5: ruled on 2 Oct (name what the provider reported);
  built in S6a, before S7, because an edition makes it reachable.
- Row 68, Play on the single-file build: ruled on 2 Oct (link-only); built in S6a.
- The long-term curation and video data source strategy: outside slice 4 (ask 5).
