# Moments slice 3 — PM-seat review of the Cursor/Grok plan, and Beni's rulings (Mon 28 Sep 2026, TZ=America/New_York)

Cursor Plan mode, running Grok 4.7 at Extra High, returned an implementation plan for slice 3.
The prompt is `docs/moments-player-plan-prompt.md`, and the plan is archived verbatim as
`docs/moments-player-plan.md` (SHA-256 `9e194e5e02ec0d1f…`). The PM seat scored it against the
criteria it fixed before the run. Every number below comes from a command or fetch run this
session. The plan is builder evidence, not a review of PR #118, which still had no Pass 1
comment at 15:26 EDT.

## Verdict: the plan passes, and earns slice 3's build

| Criterion | Result |
|---|---|
| Grounding | About 45 file, line and symbol claims were spot-checked at `704581c`, and all held: App/provider/page/queue/CSS line ranges, rig exports, harness StrictMode, `youtubeIdFromUrl` and `hasEmbedPermission`, and the R3 template's `#skip`/`#next`, `showModal`, `#cinema-exit` focus, `#player` min-heights and the dialog/1440 rules. The one miss was trivial: it gives MomentsPage.tsx as 223 lines, and `wc -l` gives 222. |
| Honesty | Strong. It re-ran the R3 seal itself (56 OK) and explained its two cwd false starts. It names partial reads by line range. It keeps the three lists (repo / provider docs / inferred) apart, and marks UNVERIFIED where the docs are silent. It declines to invent a `MessageEvent.origin` check, a `host` constructor option or a timeout duration. |
| Provider fidelity | Five claims were checked against the live IFrame API reference: codes 2/5/100/101/150/153 (150 is "the same as 101"; 153 is a missing Referer); `onAutoplayBlocked` and the functions it covers; the `origin` wording; no documented `host` option; and that the constructor replaces the element with an iframe. All matched. |
| Spec fidelity | It keeps Decision 2: one host, never reparented or portalled. It keeps the intent gate (no script, iframe, preconnect or `cueVideoById` thumbnail before Play), the inert empty edition, D-16 (a) at 888px, H-A, and the 780px header. It also makes explicit precedence calls: 888 over the template's 760, and 16:9 over the template's `aspect-ratio: auto`. |
| Coverage | D-06, D-07 (modal), D-08, D-09, D-14, D-15, D-16, D-17–D-20, H-A–H-G, the owner boundaries and the intent gate are each mapped to a test or evidence. |
| Actionability | It gives six commits and a node/DOM/browser test plan. The inert receipt is 72 cells and the slice-3 matrix is 1,260 cells plus 90 journeys. Its one-PR argument is sharp: splitting stage from Cinema would force a reparent. |
| Decisions | It raises eight one-word questions with recommendations. On seven of them the PM seat agreed with the plan; on the phone box it did not. |

**Workspace note, not a demerit.** The prompt said to write nothing inside the repo. Cursor's
Plan mode saves every plan to `<workspace>/.cursor/plans/*.plan.md`, and it wrote
`moments_slice_3_3da59276.plan.md` there at 14:24. That is product behaviour, not the model
disobeying. A copy one byte different appeared at `docs/moments-implementation-slice-3.md` at
15:08; who made it is not established. The plan's line "No repo file was created" is therefore
literally untrue of the workspace as found. Future Cursor prompts must exempt Cursor's own
`.cursor/plans/` file rather than forbid all repo writes. Both files are untracked, and nothing
tracked changed.

## Beni's rulings (28 Sep 2026, answered to the PM seat first-hand)

1. **Builder: Cursor/Grok builds slice 3** from this plan, in Cursor on Grok 4.7 at Extra High.
   Claude Code does Pass 1, and Cursor/Grok answers it in Pass 2 (the builder rebuts).
2. **Phone box: grow.** On narrow screens the stage anchor stays full width and grows in normal
   flow to at least 200px tall: height = max(width × 9/16, 200px), so 320 × 200 at 360px. This
   applies until the 16:9 height reaches 200, around a 396px viewport. The queue is pushed down,
   never covered. This amends the slice-2 architecture line "No minimum-height workaround
   defeats the aspect ratio" for phone widths only, and the builder records it as Beni's ruling.
   Whether the provider letterboxes a 16:10 iframe as expected is UNVERIFIED until slice 4.
   Clip, the plan's recommendation, is rejected because it breaks YouTube's stated "must be at
   least 200px by 200px" on every phone narrower than about 396px.
3. **The plan's other seven defaults, accepted as a set:**
   - slice 3 lands inert, as a non-release (`moments.json` stays `[]`; no version, CHANGELOG section or tag);
   - one PR;
   - H-C `no` (Cinema pushes no history entry);
   - H-G `single` (the transport's Next only);
   - `youtube-nocookie.com` embeds, built as the iframe element and passed to `YT.Player`;
   - `playsinline=1`;
   - no invented loading timeout.

## Carried into the build prompt — engineering questions the plan leaves open

These are the PM seat's reading, not Beni rulings and not findings against built code. The
builder answers each one in the PR's Resolutions. Pass 1 tests them.

1. **Stage semantics and focus order.** In stage mode the iframe sits in a non-modal `<dialog>`
   that is a sibling of the whole 780px shell, positioned over the in-page anchor. Two
   consequences follow:
   - assistive technology will announce a dialog around an inline player;
   - in DOM order the iframe comes after the entire shell, so Tab from Play travels the rest of
     the page before it reaches the player (WCAG 2.4.3).
   The builder states how both are handled. Options include managing focus into the host after
   Play with a labelled region and a return control, or a different host element for stage.
   Any option must still never reparent.
2. **Escape must not depend on `closedby`.** Option `no` relies on `closedby="closerequest"` for
   Escape and Android back. The plan does not state that attribute's browser support. Escape
   needs an explicit `keydown` path that works wherever `closedby` is absent.
3. **Scroll tracking.** The plan puts a `position: fixed` dialog on the anchor's viewport rect
   and resyncs it on every scroll. A position in document coordinates would move with the page
   and need re-measuring only on layout change. The builder chooses, and the browser matrix
   records scroll behaviour at 360 and 390.
4. **Inert base.** The plan compares against `704581c`. The inert receipt's base must be the
   slice-3 branch's merge-base on `main` after #118 has merged, which includes any Pass 1/2
   changes.
5. **Dependency on #118's review.** The plan's risk 1, Pass 1 moving the session owner, is live:
   the #118 Pass 1 brief asks exactly that. The build prompt is written against #118 as merged,
   not against `704581c`.
