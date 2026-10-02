# Moments implementation architecture

Slice 1 supplies inactive foundations. It changes no component, CSS, navigation, generated
snapshot or production curation. The existing link-only Moments page and empty collection stay
as they are. This document is unversioned; it assigns no release number.

## Authority and boundary

Beni's 25 September 2026 R3 approval and the implementation-builder prompt adopt Matchnight,
Floodlights Cinema and the scoped lens/dimension decisions. The local handoff is
`docs/moments-implementation-handoff-2026-09-25.md` in the main checkout; it is untracked, not
silently imported here. Its product contract governs; this session's prompt supersedes its
opening skill line and seat routing. Step 0.5 is historical context, not a production inventory.

The main checkout's sealed `docs/design/moments-r3/` was verified before use: 56/56 entries;
`index.html` SHA-256 `c5eb8a4bb5bcffcf8fe3f29ad06831e76f1a92413a31ac2e0dfce666ec80117c`;
manifest SHA-256 `f6e2cf704f35c8cf4bfe700276a97312f4f60eefe58f50ceb44f7e1853e9a349`.
`decision-brief.md` and `evidence-index.md` were read. Their pending-approval wording is sealed
historical text superseded by Beni's instruction. Their simulated builder checks are neither an
independent R3 review nor real-provider acceptance. R1/R2/R3 are not modified or run in place.

## Ownership and dependency chain

| Slice / file | Owns | Depends on |
|---|---|---|
| 1: `src/lib/moments.ts` | Authored contract, fixture cross-validation, identities, source observations and permission decisions | Existing Zod and fixture schema |
| 1: `src/lib/momentsQueue.ts` | Pure queue reducer, neighbours, per-item visit media state and attempt generations | No React, storage, network or provider |
| 1: `src/lib/momentsSaved.ts` | Reference-only persistence boundary and reportable refusal | Browser storage, injected structurally for tests |
| 1: `tests/moments{Contract,Queue,Saved}.test.ts` | Deterministic contract acceptance | Pure modules; historical data only under `tests/fixtures/moments/` |
| 2: future `MomentsSessionProvider.tsx`, `MomentsPage.tsx`, scoped styles | Stable visit owner; Matchnight, covers, filters/sort/save, empty and spoiler-light states | Slice 1 independently reviewed and landed |
| 3: future `MomentsPlayerHost.tsx`, `lib/momentsPlayer.ts`, Cinema controls | Stable player DOM, one YouTube adapter, intent, cancellation, focus and recovery | Slice 2 owner and selection UI |
| 4: integration acceptance and separate initial-edition proposal | Full journeys; narrow authorized real-provider test; source eligibility/publication gate | Slices 1–3 reviewed; explicit provider/publication authority |

This PR stops after slice 1. No later slice can call the feature complete from mocks. Claude
Code is the separate cold-review seat; the builder supplies reproducible acceptance evidence,
not its own review or approval. No merge, version, tag or deployment belongs to this session.

## Decision 1: visit ownership outside the keyed boundary

Mount `MomentsSessionProvider` once inside `App`, above both the Moments route's
`ViewBoundary key={tab + ':' + lens}` and the future player host. Fixtures and Table retain
their own keyed boundary outside the owner; the shared header and navigation are outside it
too. Use its reducer for queue,
first-open history, active item, positions, completion and view state. It must not be keyed by
lens, tab or selection, and must not be conditionally mounted with Moments. This avoids the
current `App.tsx` remount discarding the visit on each lens/tab switch.

Keep the existing keyed ViewBoundary around the route content, retaining fresh fallback/retry
behavior on tab/lens changes. A route error pauses/invalidate-attempts through an explicit owner
notification; error recovery re-renders the route without resetting the session. Give the
player host a separate error boundary so a provider failure cannot take Fixtures/Table down.
A session-owner error must surface a safe fallback; recovery may lose this visit and must say
so rather than claiming saved playback. No global mutable singleton: StrictMode and separate
app mounts need independent visits.

Queue state lasts until an App visit ends/reloads. Browser back/forward and `?only=`/`&date=`
retain their existing meaning. Leaving the Moments tab dispatches `leave`, pauses the adapter
and invalidates its callbacks. Re-entry never autoplays. Lens changes preserve playback rather
than invoking leave. The keyed content alone is not a reliable lifecycle owner.

## Decision 2: one mounted DOM host, never move the iframe

In slice 3, mount `MomentsPlayerHost` as an unkeyed sibling of the route boundary, under the
stable session owner and its own error boundary. A fixed host DOM container owns the only
iframe. Gallery selected stage and Cinema share this host: change its CSS placement/size using
an in-flow measured stage anchor versus the Cinema viewport, keeping the host and iframe in
the same DOM ancestry. Lens styling inherits the root data attributes. Do not render the
iframe inside the tab/lens-keyed boundary; do not portal/reparent it into a second container
for Cinema. Both approaches destroy/reload a real iframe even when a simulation looks intact.

The Cinema shell and player host must share the accessible dialog subtree; only the rest of
the application becomes inert. Focus containment must account for a cross-origin frame;
controls and provider attribution stay unobscured. Stage-anchor movement/resize and scroll
need geometry tests, especially D-06/D-15. At gallery-only or a different app tab, hide the host
and pause; preserve its DOM instance when safe. This plan is not proof of iframe continuity.

**Slice-2 placement clarification (PR #118 Pass 2).** The owner now sits inside the shared
780px shell, after navigation. Slice 3 mounts its unkeyed player error boundary and
`MomentsPlayerHost` there, under the owner as a sibling of `MomentsRouteBoundary`, outside
the `tab === 'moments'` condition. The host's stable DOM subtree contains both the one iframe
and Cinema controls; it becomes the accessible dialog while Cinema is open. Neither tab/lens
changes nor Cinema entry/exit may key, reparent or replace that host. A host recovery may
recreate the player, as described below.

With that nesting, "the rest of the application" means the shared header/navigation, the
ordinary Moments route content, and any other active route content. Apply `inert` to those
background subtrees, **never to the 780px shell, `#root`, `body`, or any ancestor of the
dialog**: an inert ancestor would disable the player and Cinema controls as well. The
slice-3 coordinator must restore background interactivity on close, tab departure and
owner/player failure or unmount, and restore focus to a surviving appropriate control.
The gallery anchor may remain inside an inert background subtree while the fixed host
occupies Cinema. This specifies a buildable placement and cleanup contract, not implemented
Cinema, focus containment or provider continuity; slice 3 must verify each in the browser.

Cache the last **finite, nonnegative provider-reported position for the owning item and
attempt**, including zero. Do not estimate from wall time, elapsed loading, duration, or a
synthetic progress bar. The cache is only last known, not frame-exact. Pause/navigation requests
may sample before cancellation, but never block navigation waiting for a cross-origin reply.
The reducer retains the last valid value when a sample is absent/invalid.

A different source, destructive provider failure, page reload or host recovery may require
recreating/loading a player. Returning to an earlier item after using the single instance for
another source needs **reload-and-seek**, a live provider request, on explicit play/resume.
Re-entering after canceled loading may also need a fresh request. Restore the cached position
only after that item's new attempt is ready; label it as resuming from the last known position,
not seamless continuity. Actual seek success must be observed. Nothing in slice 1 requests it.

## Authored data and migration defaults

Keep the existing array and existing required fields (`id`, category, fixtureId, title, source
name/URL, curatedAt, fixture). Keep optional credited stills. `[]` remains valid and production
curation stays empty. Existing link-only records using only recognized authored keys require no
rewrite. Root/source/still strictness is an intentional increase over the base's key stripping;
records relying on ignored extra keys must remove or migrate them. Empty production curation
proves there is no current record migration, not compatibility with every previously accepted input.

Authored root, source metadata, still, editorial and collection objects reject unknown keys.
The archived fixture deliberately remains a projection of the sync fixture schema (including
its non-strict team objects). A complete sync fixture may be supplied: fields outside the
archived shape are stripped. Making this pick strict would reject those valid full-fixture
inputs; this exception does not change the sync schema or relax fixture cross-validation.

- Editorial title/category/notes and the archived fixture snapshot are durable authored facts.
  `editorial` optionally adds note and neutral spoiler text and, since slice 2, an explicit
  `cover` family (`voices` | `seven` | `together`; any other value fails validation, absent
  means the neutral MOMENTS art — never guessed from title, category or ID). Missing neutral copy is not a
  licence to expose a revealing title in a future spoiler-light view.
- Optional `source.identity` is `{ provider: 'youtube', videoId }`. The ID is exactly 11 allowed
  characters; its source URL must be HTTPS `youtube.com/watch?v=ID`, `www.youtube.com/watch?v=ID`
  or `youtu.be/ID`. Credentials, extra query parameters, fragments, arbitrary ports, embed HTML
  and mismatching IDs fail validation. New playback metadata must use this allowlist. The
  legacy HTTP(S) source/still links retain their previous link/image contract; without an
  identity they are **not adapter inputs or proof of playback**. This compatibility exception
  preserves today's valid authored shape rather than silently promoting arbitrary URLs.
- Optional `source.content` records scope, description and whether watched, source-described
  or unverified. Missing means unknown. A compilation/reaction is not a standalone goal.
- Optional `collections: [{ id, order }]` supplies collection membership and nonnegative
  canonical order. Duplicate membership/order slots fail. With no membership metadata,
  legacy array order remains the implicit legacy collection; explicit collections select only
  their members and sort by authored order. Do not infer Newest from upload/curation time:
  use verified fixture chronology with stable editorial ties; unknown times remain unknown.
- Optional dated `source.availability` is a source-local evidence log with named environment,
  literal outcome, error code and note. No observations means unknown. A later unknown cannot
  erase an earlier known observation; a later known result can supersede the displayed summary
  while retaining the original record. Error 150 means an owner block, not a territory claim.
- Optional `source.permissions` stores one current decision per intended use, checked date,
  basis and optional expiry. Missing means unknown. `hasEmbedPermission` requires declared
  identity/content, described or watched content, an affirmative embed permission checked at or
  before the instant asked about, and no expiry at or before that instant. It is a
  permission/content gate, **not a playback guarantee or publication
  approval**. A played observation grants no rights; revoked/denied/expired rights grant no
  eligibility. A known block remains a labelled recovery/link entry, never a promise to play.

Fixture cross-validation still compares teams and provider identities, kickoffUtc, competition,
venueTz and timeConfidence with the live snapshot, refusing disagreements instead of silently
replacing authored facts. Status remains the curation-time observation. Archived snapshots stay
valid outside the rolling window. Both clocks still derive from the one UTC instant; missing
zones and unknown/postponed/cancelled times retain existing UI fallbacks and tests unchanged.
No schema field adds an independently authored second clock. No provider metadata fetching,
thumbnail scraping, generated-data editing or sync is introduced.

## Queue state machine

`canonical` is the full edition's stable IDs; `pool` is the current filter membership; `saved`
is reference membership; `savedOnly` adds that filter. The full unvisited `remainder` is kept
separately from `history`. Filter changes project navigation without deleting either sequence.

| Action | State transition |
|---|---|
| Open / Next / Previous | Opened ID appends to history only on first open and leaves remainder. Reopening never reorders/duplicates history. Leaving a different active item pauses playing even at zero. |
| Filter | Change eligibility only. History survives; excluded active ID stays reachable. Navigation is eligible history (plus excluded active) followed by eligible remainder. |
| Shuffle | Canonical eligible unvisited pool + seed drive deterministic Fisher-Yates; only eligible remainder slots change. Equal inputs, including repeat clicks, repeat order. Repeat no-op preserves Undo. Fewer than two eligible unvisited items is a no-op. |
| Undo | Restore previous order/mode/seed, remove any newly opened IDs from that remainder. Preserve current history, active item, media, completion and positions. One order-only undo snapshot, not a session rollback. |
| Restore | Canonical editorial remainder excluding all first-open history; editorial mode, cleared seed/Undo. |
| Explicit order | Caller supplies stable sorted IDs; normalize to known unique IDs, append omitted canonical IDs, exclude history. Clear the prior Shuffle Undo. |
| Save / unsave | Update references only; no order/Undo reset. Saved-only projects the changed eligible membership without deleting session state. |

`queueNeighbours` is the single Previous/Next calculation. Both buttons and recovery copy consume
its nullable IDs, with titles looked up by those IDs; null means disabled and no named target.
Before any selection, Next is the first eligible item. Direct opening of a known excluded item
is allowed for Return to selection. Unknown IDs are ignored. Neither navigation nor a source
link sets watched. Only a current genuine provider `ended` event sets `completed`.

Per-item media tracks status, last position, completion, attempt generation and failure. Explicit
Play/Retry enters loading and advances the attempt; Replay also resets position to zero but
retains historical completion. Stage↔Cinema preserves media exactly. Leave/gallery pauses
playing (including at zero), retains ready/loading/paused/ended/failure states, and invalidates
old events. Loading retained after cancellation means an interrupted attempt, not an assertion
that a live request survived. Explicit re-entry Play must issue a new attempt.

The future adapter captures `(item ID, attempt)` and rejects stale callbacks at its boundary;
the reducer also rejects wrong-item/generation/hidden-surface events. Error and terminal states
cannot be revived by playing/position callbacks; an explicit new attempt is required. Unknown
terminal failures may upgrade to a known diagnosis on the same attempt; other terminal failure
updates are ignored. A new explicit Retry may establish different known evidence. Unknown
retries can display a retained older block; `failureAttempt` identifies that evidence's origin
so the retry's own unknown outcome can still upgrade to a new known diagnosis.
An unknown
failure cannot overwrite that item's recorded owner block. An accepted `playing` or `ended`
event clears the visit's failure record for that item: actual playback disproves the block, and
a later unknown outcome reports a timeout, not a resurrected block. A `paused` acknowledgement
or `position` sample during loading does not prove playback and retains the record. The authored availability log,
not visit state, keeps the historical evidence. Reducer provider actions are
trusted adapter inputs, not a public user-controlled event bus; slice 3 must verify origin,
instance, source and event semantics before dispatching completion.

## Saved-reference persistence

Only unique string IDs use `kickoff-moments-saved-v1`. No queues, positions, media observations,
completion or footage are persisted. Preserve stored references to missing edition items; do
not silently erase a bookmark merely because an edition/filter changed.

Reads and writes catch both storage-property access and method refusal. Missing storage and
invalid saved payloads return reportable visit-only state. A refused write still applies the
requested full set for the visit, including unsave, and returns `write-refused`; the old disk
copy may reappear next visit. Future UI must say this next to the affected action, inside the
active modal when applicable. A later successful full-set write persists the current intent
and clears the warning. Queue updates consume returned IDs but never recreate the queue. The
reducer's `saved` holds that full set unfiltered, references to missing edition items included,
so writing `state.saved` back never erases a bookmark; eligibility reads only the pool.
There is no application-level count or byte cap. References can accumulate across editions
until the user removes them or storage refuses a write; refusal retains the visit's intent.
Deduplication prevents repeat full-set writes from growing the set. Any future limit needs an
explicit retention/export policy, not silent pruning of missing-edition references.

## Acceptance map and remaining risks

Slice 1 unit coverage: D-01 Undo after advancement/completion/backtrack; D-02 Save isolation;
D-03 newest sixth → 6,1,2,3,4,5; D-05 deterministic/repeat shuffle; D-08 actual neighbour;
D-09 item-local failure and preserved 150; D-10 newest third → 4,1,2,3,5,6 and skipped items;
D-14 per-item round trips including zero/ended; zero/one/sparse pools; excluded active item;
read/write refusal and failed unsave. Original data-honesty assertions remain unchanged.
D-07 persistence truth is covered here; its adjacent live-region UI belongs to slices 2–3.
D-04/06/11/12/13/15 are future UI acceptance, not claims made by these unit tests.

Source IDs and observations from historical R3 inputs appear only in isolated test fixtures.
They establish no present availability, permission or eligible production edition. The fictional
six-ID queue tests are algorithms, not production content. No initial collection is proposed.

Risks needing later evidence: real iframe continuity and host positioning; provider readiness,
ads/controls/seek/focus; StrictMode and error-boundary cleanup; real keyboard/dialog semantics;
unknown-time sorting; permission basis and expiry; storage UI warning placement. The slice 1
browser regression is the current app at all 72 cells (3 lenses × 2 themes × 3 tabs × 4 widths),
not a populated future gallery/player test. Google Fonts requests are reported separately from
zero media-provider requests. Physical phones, Safari, actual screen readers, production
performance and live release are not verified by this foundation.

No design conflict requires a focused Beni ruling in slice 1. The stable-host approach is a
routine implementation decision under the delegated authority, with its real continuity claim
explicitly deferred to slice 3/4 acceptance.

## Slice 2 implementation decisions (27 September 2026)

This section extends the slice-1 plan above with the gallery landing. Beni keeps it a
non-release foundation: production curation remains `[]`, the visible empty route stays
identical, and there is no version bump, release section or tag. The independent cold-review
seat remains Claude Code; these tests and receipts are builder acceptance evidence only.

### Authority recovered without touching the main checkout

The three design inputs were extracted read-only with `git archive` from local
`wip/main-checkout-2026-09-27` (`e26e7e95902b800669fc153bce13725ecbcb2360`) to
`/tmp/kickoff-moments-inputs.qxAdt8`. They were not copied into this worktree or committed.
The extracted R3 package passed all 56 manifest entries and both hashes recorded above.
Its `review.html`, decision brief and evidence index, the 25 September handoff, and the
independent R3 cold review govern this work. The old main-checkout/untracked locations in
slice 1 are historical. The archived slice-2 prompt was applied from `f47b888` as the first
commit; this session's correction about input recovery supersedes its original paths.

### Visit and recovery

`MomentsSessionProvider` mounts once in App above the tab/lens-keyed Moments route boundary,
whatever the tab, and is never keyed. Only the Moments route sits under it: Fixtures and Table
render outside both Moments boundaries, so an owner failure cannot take the shell or another tab
down, and their error paths are exactly main's (Pass 1 of PR #118 moved the owner from around the
whole shell to around the route after demonstrating that a throw in the owner replaced the
header, tabs, Fixtures and Table on every tab). A lazy
initializer reads saved references through `readSavedReferences` and creates an independent
queue for that mounted visit. React may call that initializer twice in development StrictMode;
there are no initializer writes, subscriptions or shared visit state. Separate app mounts are
independent. The edition input is a visit snapshot; changing editions requires a new visit,
not a filter/lens/tab remount.

The owner also keeps filters, spoiler preference and action-local feedback. Tab departure
from Moments dispatches `leave` once; a lens transition does not. A route failure notifies the
owner with `leave` to invalidate future media attempts, preserving history, active ID and
saved references. The existing ViewBoundary had no Retry, so an opt-in Retry button now resets
only the Moments route boundary. Other tabs keep their existing recovery controls and copy.
The separate owner boundary says the visit may be lost; Retry visit creates a new owner and
re-reads disk without claiming it retained a visit it no longer holds. Its fallback renders only
while the Moments tab is active; on any other tab a failed owner renders nothing.

Save writes occur only in event handlers, outside React state updaters/effects, to avoid
StrictMode replaying a storage write. The owner consumes all three returned fields: IDs update
the reducer, persistence controls the visit-only label, and reason selects the adjacent feedback.
A current-state ref keeps same-turn full-set writes from using a stale saved set. A failed unsave
applies for this visit while warning that the stored reference may return. Selection clears old
action feedback; a successful full write clears the refusal. Saved-only projects membership,
while Save with that filter off preserves remainder order and Undo.

Row 58 is resolved by `momentsReferences.ts`: one nonempty/already-trimmed string predicate
feeds both boundaries. Invalid input returns its valid unique subset as visit-only with
`invalid-data`, never touches storage, and never throws. The reducer uses that same subset.
IDs are not trimmed into different identities. The dedicated commit's regression failed on
main's throwing implementation and passed afterward; row 58 records the resolution in place.

### Edition input, covers and unshipped harness

App's `momentsEdition` defaults to the validated production MOMENTS array. Tests and
`tests/harness/moments.html` inject isolated inputs from `tests/fixtures/moments/gallery.ts`.
The source order of that supplied edition is the canonical editorial order. An edition curator
selecting an explicit collection must supply its members in authored collection order; this
slice does not guess a collection from multiple memberships or invent an initial edition.

The gallery's input union admits explicitly labelled, unlinked queue examples without a fixture,
competition, category, source, or authored cover. Their chronology is illustrative test data;
production always comes from the strict Moment contract. The six examples therefore cannot
borrow real competition identities or VOICES/SEVEN/TOGETHER families. Historical R3 archival
examples stay in the fixture module. Their date-only clock placeholders are `tbd`, not verified
kickoff instants, and never enter Newest's confirmed-fixture ordering. Historical provider
observations remain historical, without permission or present-availability claims.

A small authored-contract extension, `editorial.cover`, explicitly chooses `voices`, `seven`
or `together`; a missing choice uses neutral MOMENTS art. This avoids guessing a revealing
SEVEN cover from a highlights category or shipping an ID-to-sample lookup. Original SVG
geometry and HTML typography use existing app tokens and loaded Oswald 500/600/700 only.
No font, thumbnail or still is fetched by the gallery. The optional authored still remains a
valid record field but this slice renders original covers instead of remotely loading it.

The harness is a separate Vite dev HTML entry. Neither the production `src/main.tsx` import
graph nor either build configuration imports it; both build commands use only root index.html.
The harness entry, fixture strings, all three archival source IDs and the storage/error switches
must be absent from both build outputs. The receipt includes the grep and file inventory proof.
Harness files are typechecked in the existing DOM TypeScript project, excluded from the node
project. There is no new dependency or production URL parameter. Harness-only query parameters
belong to its separate HTML page; the app's tab/lens/only/date codecs are unchanged.

### Inert path and selected anchor

With an empty edition the provider renders no DOM and MomentsPage returns exactly the prior
banner and sentence. No gallery class, controls, statuses or media elements exist on that path.
The existing 9.5px banner is preserved by the explicit inert ruling; the new gallery content
has a 10px minimum, including its original-art disclosure. The shared 780px shell never changes
between tabs. Only `.moments-gallery` outdents: a maximum 1120px content area plus the existing
20px page gutters gives the scoped 1160px gallery. Ledger is the base, with Tailwind `poster:`
and `broadcast:` variants layered on top; no Ledger override cascade or new token was added.

Opening a card updates active ID and first-open history, then shows a selected reference view.
It focuses the selected heading in flow. That view's `data-moments-stage-anchor` is a true 16:9
box containing only original cover art and its honesty label. The source link is its primary
action, opens a new tab, and sets no completion flag. There is no media element, simulated
player, Play action, progress, Cinema, adapter or media request. Queue Previous/Next and their
names use `queueNeighbours`; disabled buttons name no destination. Slice 3 can measure this
anchor while keeping its one persistent player host outside the keyed boundary.

Beni's D-16 remedy (a) is encoded now: the stage and queue stack through 887px; at 888px they
become two columns. At that threshold, the content width is 848px minus a 300px list and 28px
gutter, leaving a 520 × 292.5 anchor; wherever side by side, it is at least 480 × 270. No
minimum-height workaround defeats the aspect ratio. Slice 3 amends that sentence for phone
widths only: on 28 Sep 2026 Beni ruled that the stage anchor and the player host keep full
width and grow in normal flow to at least 200px tall, `height = max(width × 9/16, 200px)`,
so the list is pushed down and never covered. At 888px and above the 16:9 column is already
taller than 200px, so the floor does not change that ratio. A short, single-line Selected moment
label replaces the prototype's wrapping stage-top pill.

The lead primary label is Open selection. Save reference keeps its visible and accessible
name stable, with state in `aria-pressed` and separate saved/visit-only text. Feedback occupies
its own reserved row under both actions and writes to only the affected live region. Selection
names are not followed by generated terminal punctuation. Filter/no-results text explicitly
accounts for no active item versus a retained item outside the filter. Spoiler-light neutralizes
category labels as well as titles, scope, notes, evidence and cover motifs; fixture/date/source
identity stays visible and the disclosure identifies external-page limits.

### Verification and later ownership

`docs/verification/moments-gallery/` records the two receipts and exact tested source/build
identities. UI tests extend `tests/dom/rig.ts` and cover the owner above a real App boundary,
StrictMode writes, two mounts, route Retry, queue interactions, refused read/write/unsave,
spoiler-light, identical text across lenses and the inert DOM. The browser receipt supplies
layout, hit-testing, real keyboard events and geometry; jsdom does not prove those.

Two populated link-only UI tests changed, by name:
`renders only populated categories in their fixed order and uses the curation stamp` now
asserts authored gallery order, category filtering and selected curation attribution;
`keeps the credited still in its frame and the solid link outside, with no playback` now
asserts labelled original art, no remote image and unchanged source-link/clock semantics.
The original empty-state, missing-zone, unknown-clock, URL, and pure data-honesty assertions
are unchanged. The old saved-reference throw assertion alone changes for row 58's explicit
returned refusal.

H-C (Cinema history/back behavior), H-G (duplicate playback recovery controls), D-06/D-15
(real player geometry/focus), D-09/D-14 provider journeys and in-modal live regions remain
slice 3/4 work. There is no provider validation or first-edition proposal in this landing.
Slice 3 implementation decisions, below, is where those player items landed. Real provider
behaviour stays slice 4.

## Slice 3 implementation decisions

The visit owner now lives inside the 780px shell, after the header and the tab row, and it
wraps only the Moments route. Slice 3 mounts `MomentsPlayerBoundary` and `MomentsPlayerHost`
under that owner as a sibling of `MomentsRouteBoundary`, outside `tab === 'moments'`. Fixtures
and Table stay in the other route, outside the owner. An empty edition renders no player: the
boundary returns null, and the page keeps the banner and the sentence. The host is one element
for the whole visit. Stage and Cinema share it by measuring the in-flow
`data-moments-stage-anchor` or the Cinema slot; the iframe is never inside the keyed route,
never portaled, and never reparented. `App` takes an optional player factory. `src/main.tsx`
passes nothing, so production uses the YouTube adapter. The harness and the DOM tests pass
the mock.

Cinema does not mark the shell, `#root`, `body`, or any ancestor of the dialog `inert`. It
marks four subtrees, each with `data-moments-background`: the header, the tab row, the Moments
route while that tab is showing, and the Fixtures or Table route while one of those tabs is
showing. Closing Cinema, leaving the tab, or unmounting the host or the player boundary
removes that inert state. A player render failure shows “The player could not be shown.” and
“Retry player” inside the owner. The shell, the tabs, Fixtures and Table stay up. The owner’s
own fallback copy is unchanged.

Beni’s phone ruling is the minimum height on `.moments-stage-anchor` and
`.moments-cinema-slot`: full width, `aspect-ratio: 16 / 9`, and `min-height: 200px`. At 360px
that box is 320 × 200. The queue stays in normal flow below it. Side by side, from 888px, the
column is already at least 480 × 270, so the floor does not replace 16:9 there. Whether a
provider letterboxes the 16:10 phone frame is unverified until slice 4.

The adapter is not React and adds no dependency. Nothing is requested before an explicit Play:
no API script, no iframe, no preconnect, no thumbnail. `index.html` keeps only its Google Fonts
preconnects. The first Play inserts `https://www.youtube.com/iframe_api` and builds one
`youtube-nocookie.com` iframe, with `enablejsapi=1`, `playsinline=1`, and
`origin: window.location.origin`, and passes that element to `YT.Player`. `controls` stays at
the provider default. `modestbranding` is not set. One instance lasts the visit. `pauseVideo`
parks and leaves; `stopVideo` and `cueVideoById` are not used. `destroy()` runs only when the
host unmounts. A hung load stays `loading` until the visitor leaves or a provider event
arrives. `onAutoplayBlocked` stays on `loading`, records no failure, and shows that the
control inside the player can start playback. Callbacks carry the item, the attempt, and the
instance. A stale target, a video id that does not match on `playing` or `ended`, or a second
terminal code on the same attempt is dropped at the adapter. Codes 101 and 150 are
owner-blocked, 2, 5 and 100 are unavailable, and 153 or any other integer is unknown.
`getCurrentTime()` is sampled on pause, on ended, and before retire; only a finite number at
least 0, zero included, is dispatched. Beni’s 29 September 2026 ruling supersedes the archived ready-or-cued specification:
a different loaded id uses `loadVideoById({ videoId, startSeconds })`. A fresh instance
seeks at ready and then calls `playVideo()`. Samples before matching playback begins do not
replace the cached position. “Resuming from the last known position.” requires a positive
cached position and a provider sample greater than zero after playback begins, not the
requested target. A sample of exactly zero stays a position and keeps the sentence pending
until a later sample is greater than zero. Beni, 30 September 2026. This is last-known
recovery, not proof of an exact seek. Navigation does not wait on a
cross-origin reply.

Stage keeps the same `<dialog>` open once a frame exists, because a closed dialog is
`display: none` and would hide the iframe. While the visitor is on the stage the dialog’s
explicit role is `region` and its name is Player, so it is not exposed as a modal dialog;
`aria-modal` is absent. Cinema removes that role override, sets `aria-modal="true"`, and names
the dialog Cinema. The host stays after the route in DOM order, outside the keyed boundary.
Play moves focus to “Back to selection”, the first stop in the player region, which returns
focus to the stage’s primary action. An in-anchor “Player” control sends Tab into that region
and sends Shift+Tab from later in the route to the iframe. “Continue past the player” returns
focus under the picture. The iframe is not reparented. Shift+Tab from inside the frame does
not bubble, so when that key moves focus onto the dialog itself, Cinema sends it to the last
control in the dialog. Escape is a capture-phase `keydown` on
the document, which does not depend on `closedby`. Cinema also sets `closedby="closerequest"`
and handles `cancel`, calling `preventDefault` so the dialog stays open. If a user agent
closes it anyway while a frame exists, the host calls `show()` again in that turn and does
not destroy the instance. Gallery and other tabs pause and park: the dialog stays open, clipped
to a fixed 0×0 box, `inert`, `aria-hidden`, and `pointer-events: none`.

The stage dialog is `position: absolute`. Its top and left are the anchor’s document
coordinates, minus a positioned ancestor’s document origin when one exists. It scrolls with
the page. It is measured again on a resize of the anchor, the stage column, the header, the
gallery, the Cinema slot, or the document, on `visualViewport` resize, when font loading
finishes, on a lens or theme change, and when the surface or the active item changes. A late
font can move the anchor without resizing it; the stage column and the header catch that.
There is no document scroll listener. The slice-3 receipt records the 360 and 390 scroll check.

The first successful save or unsave from the stage, any gallery card or Cinema after an
unreadable opening read says “This write replaces the unreadable stored set.” Beni widened
row 61 to every surface on 29 September 2026. Refused writes and tab departure do not
consume the notice; the first persisted write does, for the whole visit. Subsequent writes
use the ordinary sentence. Feedback replaces the initial warning in the same live region.

Cinema pushes no history entry. One Next control, the transport’s, is fed only by
`queueNeighbours`. Recovery copy names that item, or says there is no next selection, and does
not add a second button. Recovery sits below the frame, not over it. Cinema content is at most
1440px wide inside a full-viewport dialog. The shared header stays in the 780px shell. The
breakpoint remains 888, not the template’s 760. Activating a lower queue row scrolls the dialog
until the player and the primary action are inside its visible box, then focuses that action
with `preventScroll: true`.

The inert receipt’s base is the merge base `8cb9d87c531ffce3c609f98e0da557c26027d432`. The
tip is built from that same snapshot, without a rebase onto later sync commits.

## Slice 3 review resolutions (PR #128, Pass 1, 29 September 2026)

Pass 1 was the cold review by the seat that did not build slice 3. What it changed is recorded
here with its cost; what it measured and left alone is in the PR conversation. Beni's rulings
are not reopened. Where a sentence above says something this section amends, this section is
the later one.

**Provider commands before `onReady`.** The reference makes `onReady` the point where a player
"is ready to begin receiving API calls". The adapter used to call `pauseVideo`, `playVideo` and
`loadVideoById` as soon as `YT.Player` was constructed; against a stub that attaches those
methods at ready, `retire()` threw from inside the owner's dispatch, Next, Previous, a queue
row, the Gallery button and a second Play did nothing, and leaving the tab threw inside the
owner's effect, so the owner boundary replaced the visit. Commands now go through one guarded
send, and the attempt that is current at `onReady` is the one that runs: when its video is not
the one the frame was built with, that video is loaded. Cost: a command the provider refuses
for any other reason is also dropped without a failure; the attempt then waits for a provider
event, which is ruling 7's hung load. The real provider has not been run. Slice 4 does that.

**The frame belongs to one selection.** The host remembers the selection the frame was last
asked to play. On any other selection the stage parks the dialog and Cinema clips the host to
0 x 0 and marks it inert, so the anchor or the slot shows that selection's cover, as it does
before a first Play. Before this, the earlier video's frame sat over the next selection's
cover, under the next selection's heading. The builder's matrix could not see it: the mock's
frame paints nothing, and its `ready` cells are fresh loads. "Ready cells have no iframe" in
the builder's receipt is true of those cells only. The in-anchor "Player" stop exists only
while the frame is on the selection.

**Focus when Cinema closes.** When the stored opener is detached (a lens change through
history remounts the stage; a tab change or a route failure removes it), focus goes to the
stage's Enter Cinema button, then the gallery heading, then the tab that is showing. The
host's unmount cleanup clears the background's inert marks before it focuses, because an
inert control cannot take focus and that cleanup runs before the one that removed them.

**Escape inside the frame.** The parent document’s `keydown` handler does not receive
child-document key events. With the same-origin mock frame focused, Cinema stayed open on
Escape and one Tab reached Exit Cinema. This establishes the current handler’s limit, not
that every parent-side solution is impossible. Real-provider keyboard behavior and browser
close requests remain unverified. No timer pulls focus out of the frame.

**Leaving the tab.** The owner’s tab watcher uses a layout effect. Pass 1’s eight
click/Back browser cases observed no player box on the other tab after this change; the
passive-effect version had exposed one. This is sampled evidence, not a universal timing
guarantee for every navigation or provider. The effect also sends the guarded retire command.

**Recovery punctuation.** A quoted title that ends its own sentence keeps that mark and gains
none (D-18). Any other title, every spoiler-light neutral title among them, gets the full
stop after the quotes. Without it the body read `Next opens “Match highlights from the
archive” The official source is also available.`

**Row 61.** The visit keeps its own mark of an unreadable stored set, set by the opening read
and cleared by a write that persists. `saved.reason` could not carry it: a refused write
overwrites it, and a write refused for an invalid reference returns `invalid-data` too.

**What the inert path changes in the markup.** The builder’s 72-cell empty-edition run reported equal body text and PNGs. Pass 1’s
re-runs kept equal text but had first-capture PNG noise; PNG identity is advisory. The markup does not: `header` carries
`data-moments-background="header"`, the tab row carries `data-moments-background="tabs"`, and
the route content of Fixtures and Table sits inside one
`<div data-moments-background="route">`. Removing exactly those three from the head's
`outerHTML` gives the merge base's, byte for byte, in 12 shell cells, 12 route-error cells
and 5 `?only=` / `&date=` cells. The builder’s layout comparison was equal at six scroll offsets in 30 cells, including
sticky headers and zone dividers; Pass 1 later recorded 0.03px subpixel noise. Current
Pass 2 measurements are in the verification addendum. These exact three differences on Fixtures and Table were accepted by Beni, 29 Sep 2026.
The empty Moments tab has the same three differences; his wording named Fixtures and Table.
No fourth markup difference is covered by that ruling.

**Pass 2 amendments (Beni’s rulings, 29 September 2026).** The archived plan and build
prompt retain their original text with dated pointers here. Beni’s ruling outranks the sealed
package, handoff and plan where they differ.

- **Reload/resume (row 62, with row 67).** The current adapter contract above replaces
  ready-or-cued seeking. State 5 is no longer used as a seek-completion proxy. The reference
  documents cued state for cueing and does not promise it after loading, nor provide a
  seek-complete event. Commands wait for ready and the current ticket is reconciled there,
  including a replay requested before ready. A malformed/absent sample preserves the cache. A second Play while a resume load is
  still unsettled carries the seek again, including after retirement; it does not treat the
  provider’s changed video ID alone as proof that the seek applied.
  The label requires a positive cached position; a failed initial load at zero cannot resume.
  A sample of exactly zero after playback begins does not show the sentence; a later sample
  greater than zero still can. Beni, 30 September 2026.
- **Iframe permissions and identity (row 63).** Only after explicit Play, construction adds
  `allow="autoplay; encrypted-media"` and
  `referrerpolicy="strict-origin-when-cross-origin"`, retaining `allowfullscreen` and the
  existing attributes. No sandbox or loading attribute is added. The two-item delegation is
  the [official privacy-enhanced embed example](https://support.google.com/youtube/answer/171780).
  The earlier seven-item claim in row 63 was not sourced by Pass 1 and is corrected. Neither
  the [API reference](https://developers.google.com/youtube/iframe_api_reference) nor the
  [parameters page](https://developers.google.com/youtube/player_parameters) supplied that list.
  Permission delegation is not proof of autoplay: browser/user policy and the provider still
  decide whether playback starts.
- YouTube’s [minimum functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)
  recommends the chosen referrer policy. Leaving the attribute unset would currently inherit
  browser/page defaults; `no-referrer` or `same-origin` would suppress cross-origin identity;
  `unsafe-url` would disclose more than the origin. The chosen value is explicit and sends
  only the origin cross-origin, except on a security downgrade. Under the
  [Referrer Policy specification](https://w3c.github.io/webappsec-referrer-policy/), §§3.9,
  4.3 and 10.2, an explicit element policy can be less restrictive than the document policy;
  it controls the iframe navigation request, not every subsequent request inside the loaded
  third-party document. Browser privacy controls can still suppress referrers. No page-level
  policy is set by the app. Source-link `rel="noopener noreferrer"` is unchanged.
- **Still open: row 68.** A local `file:` source has no HTTP referrer; this attribute cannot
  manufacture one. Whether the single-file build offers Play once curated remains a slice-4
  decision. Deployed Pages Referer/error 153, one-press playback, and whether the API retains
  these attributes remain unverified until explicitly authorized provider observation.
- **Player failure (rows 69–70).** `componentDidCatch` reports `player-lost` to the stable owner.
  It invalidates the active attempt, changes playing/loading to paused, preserves position,
  completion, history, saved references and queue order, and returns Cinema to the stage.
  It leaves a gallery surface as gallery. Retry recreates only the host; another explicit Play
  is required to create a frame. This preserves the plan’s reason for retaining the visit
  without retaining the false claim that a destroyed player is playing. The fallback says
  “Retry the player, then press Play when you are ready.”
- **Keyboard (row 65).** Stage Shift+Tab from Back to selection now targets Enter Cinema.
  Cinema’s different visual and focus orders remain a design/accessibility follow-up: changing
  the persistent frame ancestry would need a separate continuity decision and verification.

**Review qualifications.** The late-method stub is a conservative stress case, not evidence
that the real provider omits methods before ready. Its synchronous load/state sequence and
exact seek are also simplifications: the reference permits nearest-keyframe starts. The
adapter still catches synchronous command exceptions; a refused command is not proof of a
provider failure code and no loading timer is invented. Global focus lookup and inert cleanup
assume the app’s single host; no multi-player support is claimed. Parking preserves the DOM
instance, not verified decoding or playback continuity. Escape key events within an iframe do
not bubble into this document; the existing parent key listener cannot handle them. The real
provider’s keyboard handling and browser close requests remain slice-4 observations, so the
Pass 1 statement that the parent can never fix this is broader than the evidence.

## Slice 4 implementation decisions (S2)

This non-release implements `docs/moments-slice-4-spec.md` S2 and records S3 builder
acceptance in `docs/verification/moments-acceptance/`. The spec is unchanged. Its Authority
rulings govern over this section and the archived prompt; no ruled player behavior changes.

- **One decision, one clock.** `src/lib/momentsPlayability.ts` defines `MomentsPlayability`
  and its production default, `mayPlayMoment`, delegating to the unchanged
  `hasEmbedPermission`. The owner subscribes to `useNow`; `canPlay` feeds the action row,
  recovery/status visibility, frame visibility and direct `play()`. The identity/permission
  check precedes retire and the reducer's play action, so a refused call does not even
  invalidate a current attempt. Cost: another subscription to the shared clock, not another
  timer; permission changes are observed at its minute tick or focus/visibility catch-up.
- **Lapse parks a live frame.** When the same active selection loses eligibility while its
  frame is live, a layout effect samples and retires the adapter, then dispatches existing
  `player-lost`. Playing/loading becomes
  paused, Cinema returns to stage, the frame parks inert, and the Player focus stop vanishes.
  Position, queue and history survive. Other terminal states keep their diagnosis internally
  but expose only the source link. The iframe stays mounted. Cost: a permission lapse ends
  the current attempt too; this is stronger than refusing the next Play. It does not destroy
  the provider instance or establish anything about parked decoding. The reducer's provider
  contract and adapter commands are unchanged. Pass 2 implements Beni's 1 Oct rulings:
  without a live frame, the cover keeps its surface and attempt, including in Cinema. A
  frame parked under another active selection is left alone. The lapse effect reads the
  render's `playerLive` closure (the preceding commit's shown frame); the host's layout
  effect queues false for the next render, without changing that closure. Tests cover both
  live surfaces, both cover surfaces and both possible lapsing items around a parked frame.
  On stage-to-parked, focus inside the active owner's host moves to Enter Cinema before the
  return stop is hidden; focus elsewhere is untouched. In cover-only Cinema, the clipped
  host stays inert, the dialog controls remain active and focus stays on Exit Cinema.
- **Playback labels stay whole.** Only primary buttons marked `data-playback-action`
  receive zero flex shrink and no wrapping. Play, Pause, Retry and Replay stay on one line;
  the source link takes the wrapping cost. Primary source links and gallery Open selection
  buttons keep their wrapping rules. No token or action-row layout mode changes.
- **Mock seam.** Optional `App.momentsPlayability` is threaded to the owner like the existing
  factory seam. `tests/fixtures/moments/mockPlayability.ts` is passed only alongside the mock
  in the harness and player DOM tests. `src/main.tsx` passes neither prop. Archival examples
  retain their no-permission statement and carry no permission decisions. Cost: callers of
  the internal test seam must keep that pairing; it is not a production configuration API.
- **Separate build entry, no environment selector.** `scripts/build-moments-acceptance.ts`
  validates its optional command-line JSON path (or committed `edition.json`) against
  `git show HEAD:src/data/fixtures.json`, then installs a local Vite replacement plugin and
  writes git-ignored `dist-acceptance/`. The replacement plugin is not imported by
  `vite.config.ts`; even passing acceptance mode to a production build cannot install it.
  A title prefix and `html[data-moments-acceptance]` mark this build without a layout change.
  Cost: the acceptance command requires a Git checkout with a committed snapshot; ordinary
  archive builds remain available for production. A new bundle is required for a new edition.
- **Fictional acceptance input.** `edition.json` holds two permitted, one identity-only, one
  denied, one expired and one legacy link-only selection. Its video IDs are fictional, and
  every permission basis says so. `fixture-provenance.json` preserves six complete rows
  copied from `1fad3427dfeeeae4a642b6996fe1a114f4640d63`; the edition projects their authored
  fixture fields without changing them. The node test validates the edition and proves all
  six IDs absent from the current snapshot. Cost: these records prove neither rights nor
  content; S4 must supply its separately authorized replacement input.
- **Probes and evidence.** `real-adapter.mjs`, `youtube-stub.js`, `layout-probe.mjs`,
  `check-build-isolation.mjs` and `reproduce-permission.mjs` live in the new receipt directory.
  The first two replace the copied `_probe_real` entry with the actual bundled production
  entry and rule. The stub attaches methods at ready, with a construction-time control;
  only the API URL and the two fictional nocookie frame URLs are fulfilled locally. Every
  other provider URL is aborted, with DNS blocking as a second guard. The layout probe now
  fails on differences and compares the shared route wrapper too. The old inert checker
  gains the complete provider predicate and an explicit viewport on its initial load; no
  assertion is weakened. Cost: stub readiness, state events and seeks are simplified and
  establish no real playback. Pointer probes settle scrolling before dispatch; the initial
  unsettled-click limitation is recorded in ideas row 71.
- **Commit split.** Claude's docs commit is cherry-picked first, preserving its authorship.
  The gate, seam, fixtures, build script and tests form the first Codex code commit. Red
  tests are run against the prior commit in a disposable archive, never committed red.
  Tooling, documentation and machine receipts follow separately so the served application
  remains frozen throughout verification. Typecheck and the full suite stay green at each
  commit. The production edition, empty-edition test, workflows, snapshot, dependencies,
  version and README stay unchanged.

There is no disagreement with the slice-4 spec. S4 provider observation and S7 publication
remain separately gated; the acceptance edition is not a proposed public edition. Rows 65,
66 and 68 retain their existing wording and status.
