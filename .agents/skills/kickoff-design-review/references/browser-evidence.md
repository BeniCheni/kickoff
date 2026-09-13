# Browser and artifact evidence

Read before runtime, responsive or mechanism probes. Keep observations tied to an unchanged
review target; an experiment is evidence about the experiment, not a fix to that target.

## Identify and render

Record artifact revision/hash, repository SHA if relevant, URL and served directory. Confirm
which checkout an existing server serves rather than assuming port 5173 belongs to this task.
Serve local HTML exports over HTTP with their relative assets intact. Report missing runtime
assets or unavailable network access before conclusions dependent on them.

Set the viewport before captures and verify actual `innerWidth`, lens and theme in the target
tab. Record height, zoom/device scale, font readiness and reduced-motion setting when relevant.
A screenshot's cropped width is not proof of the page viewport or a layout defect.

## Select meaningful probes

For responsive claims, use 360, 375, 390 and about 1000px, with a wider cinema view if needed.
Cover relevant lens/theme/state combinations for the design scope. If reviewing an app change,
CLAUDE.md requires every lens × theme × tab; a design-only review must not call a partial matrix
full application verification. Record
`document.documentElement.scrollWidth === window.innerWidth` and the overflowing element when
it fails. Inspect actual source/DOM order as well as the illustrated order.

Measure computed styles and boxes for geometry and contrast claims. Test sticky release at the
next group boundary, not only the initial sticking. Recompute displayed arithmetic independently;
where supported, vary runtime props and check dependent values. Recount time-sensitive repo facts
at the current head and distinguish snapshot drift from a defect at the artifact's original head.

Exercise keyboard entry, traversal, activation and escape/return; check visible focus and reduced
motion. For media, probe real play/pause/end/failure, next/previous and gallery/cinema return where
available. Verify one active player and preserved active item/queue position. Keep provider-owned
controls reachable. Separate mock transitions, permitted real playback observations and untested
provider behavior. Check current provider requirements when player sizing or permission is in scope.

Use exposed prototype controls or ordinary interaction first. If a mechanism needs DOM/style
injection or synthetic inputs, run it only in a disposable copy or separate experimental instance,
label its departures from the target, and restore/reload then verify the baseline. Never alter
the reviewed file or repo data. A changed >8-only rule, reordered control or wider viewport cannot
silently serve as proof of the original requirement. Keep restoration evidence for such probes.

For source-driven claims, separate presence, shape, semantics and integration. An HTTP success
or a plausible field name is not a correct user-visible value. Trace second-hand test claims to
actual receipts; an unavailable check stays not verified.

## Evidence index

Record each probe compactly: ID, target revision, environment/state, steps or command, expected
and observed result, capture/output location, and limits. Reference these IDs in findings instead
of pasting long logs. For unavailable runtime evidence, name the exact test and prerequisite.
An independent builder must be able to reproduce or overturn the finding without accepting its
conclusion first. Preserve old receipts and label any later correction by revision.
