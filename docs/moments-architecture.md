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

Mount a future `MomentsSessionProvider` once inside `App`, above both the existing
`ViewBoundary key={tab + ':' + lens}` and the future player host. Use its reducer for queue,
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
minimum-height workaround defeats the aspect ratio. A short, single-line Selected moment
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
