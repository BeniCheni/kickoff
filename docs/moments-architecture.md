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
curation stays empty. Existing link-only records require no rewrite.

- Editorial title/category/notes and the archived fixture snapshot are durable authored facts.
  `editorial` optionally adds note and neutral spoiler text. Missing neutral copy is not a
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
failure cannot overwrite that item's recorded owner block. Any provider event accepted for a new
attempt clears the visit's failure record for that item: the visit has disproved the block, and a
later unknown outcome reports a timeout, not a resurrected block. The authored availability log,
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
