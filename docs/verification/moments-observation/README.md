# Moments slice 4 S4a — observation runner

Non-release, draft, six-pass 360. Beni adjudicates and merges. S4a builds and proves this
manual runner with fictional identities and zero provider egress. S4b is a later run by
Beni on his Mac with his written authority. Codex does not run live mode.

**A green stub is not playback. A loopback result predicts nothing about the Pages origin.**
The production edition stays empty. Nothing imports these observations into curation.

**Unresolved picture finding:** the unchanged application's Cinema cover obscures the
synthetic frame at 390, 1000 and 360. Stage displays it. Both viewport and full-page
captures reproduce this, and the centre hit-test reaches the cover word in Cinema.
The completed stub visit establishes the runner's protocol, not a clear Cinema picture.
No application fix was made; Beni's decision is required before a separate repair or S4b.

## Authority and prerequisites

S4b needs Beni present, installed Google Chrome, an existing Playwright module path, and
an external JSON authority file. No dependency or browser installation is performed. The
authority is an attestation, not a cryptographic signature. Its exact schema has these
fields and no others:

- `who`: exactly `Beni`.
- `at`: an ISO instant with a timezone, not in the future.
- `words`: Beni's actual written authorization, nonempty.
- `hosts`: unique members of the six provider domain families below. Both the YouTube and
  nocookie families are required. A listed family includes its subdomains. Omitted families
  are refused if requested, even after Play.
- `origin`: an exact serialized origin, including port when nondefault, without a path,
  credentials, query or fragment. Localhost or 127.0.0.1 is the default. Other hosts require
  HTTPS, that exact origin in the authority, and explicit attachment with the origin option.
- `ids`: one or two unique objects, each with exactly `id`, `role`, `source`. Video IDs use
  the application's eleven-character schema. Roles are `play`, `owner-blocked-expected`,
  or `unknown`; source is `own-upload` or `third-party`. Roles are expectations, never an
  outcome or permission inference.

Provider families: youtube.com, youtu.be, youtube-nocookie.com, ytimg.com, googlevideo.com
and ggpht.com. None was contacted for S4a. There are no real video identities or genuine
provider authorities in this directory. The stub fixture's words explicitly disclaim
authority and its identities are S4Stub00001 and S4Stub00002.

The first identity is A; it should be the candidate Beni expects to play. The second is B.
Beni takes real IDs from watch URLs; nobody supplies or invents them for him. They stay
separate from any future edition IDs. Authority, generated edition and receipt directories
belong outside this repository. New output paths are required, so prior evidence is not
overwritten. Future dates, missing or extra fields, malformed IDs (including 27-character
strings), duplicates, a third ID and origin mismatch have named refusals before Chrome
launches. The raw authority file and parsed copy are retained in the receipt directory.

## Beni's later command sequence

These are instructions for Beni's separately authorized S4b, not commands run in S4a.
Set AUTH and EDITION to external paths. Write Beni's actual authority first; an example
that says fictional stub is not a provider grant. Run from this checkout at the reviewed
head, with a clean application source tree.

```sh
AUTH=/absolute/external/authority.json
EDITION=/absolute/external/observation-edition.json
RT=/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
node --import tsx docs/verification/moments-observation/generate.mjs "$AUTH" "$EDITION"
npm run build:acceptance -- "$EDITION"
node --import tsx docs/verification/moments-observation/runner.mjs --live --authority "$AUTH" --runtime "$RT" --chrome "$CHROME" --out /absolute/external/new-receipt
```

By default the runner serves that acceptance build itself, using the authority's exact
loopback origin and port. Beni can pin that port explicitly with the port option; a
mismatch is refused. An origin option attaches to an already served build. The runner
compares the served HTML and JavaScript bytes with the supplied local dist before Play.
The bundle must contain every named identity, its exact manifest must match their order,
and live mode refuses the acceptance/stub sentinel strings. The manifest names the build
SHA; the receipt also records runner SHA and a hash of every file and the combined dist.

Before launching Chrome, live mode prints the origin, bound port, Chrome version, identities,
host families and total safety ceiling. Beni confirms both browser and allowlist by typing
`RELEASE` followed by a space and the exact origin. Piped confirmation is refused. Chrome
uses a new profile, headed; live headless is refused. A ceiling of five minutes bounds the
whole interactive visit, including confirmation; the ceiling option can adjust it up to
fifteen minutes. It is operational protection, **not a product readiness timeout**.

The page loads once. A is played cold, then Beni lets it advance before the runner pauses
and records the sample. Stage and Cinema are captured at 390, 1000 and 360, always setting
the viewport first and asserting document width equality. Each capture asks Beni for the
picture/letterboxing observation while that viewport is still present. At 360 the frame
dimensions record the 16:10 box. Resizing is part of this one visit and appears in the
checkpoint ledger. Every visible queue row is scrolled into view and hit-tested.

Gallery parks the player; Beni controls the parked interval, then reports whether it
returned blank or dead (`yes`, `no`, `unsure`). Next selects B; a separate direct Play
click exercises the warm API. Previous selects A and another Play exercises reload-and-seek
and the resume sentence. One ID omits Next/Previous explicitly. The optional manual-next
flag offers one checkpoint for ideas row 71 immediately after Exit Cinema: Beni clicks Next by hand,
then presses Enter in the terminal. The receipt keeps parent-document clicks and selection
state; settled automated clicks do not prove rapid manual pointer behavior.

At the end, Beni answers `ad shown` with yes, no or unsure. Answers are kept verbatim; the
page cannot detect ads. Any observed stop closes Chrome, writes the receipt and returns a
nonzero exit without moving to another identity or origin. A human unsure answer is kept
as uncertainty, never promoted to a pass for the corresponding provider claim.

## Request and observation boundary

The pure policy decides release, record, abort or stop. Before Play every provider request
is aborted and stops the run. Afterwards the exact API entry and at most one nocookie
frame request per named ID are released. Subsequent requests, including loader-generated
scripts, are released only within authorized families and recorded host by host. They are
not described as expected beforehand. Ruling 2 counts the page-created iframe and API
entry elements, including removed/replaced ones, rather than counting downstream scripts.

Explicit foreign IDs stop even on otherwise allowed hosts. The extractor recognizes embed,
watch/v, short/live, short-link, thumbnail/storyboard paths, repeated identity parameters,
video_id/docid and JSON videoId fields, including duplicate explicit keys. It follows
nested URLs three levels. It cannot identify IDs hidden in opaque signatures, binary
bodies, unknown parameter names, arbitrary encodings or an undocumented protocol. An
eleven-character opaque media token is not assumed to be a video ID. This is conservative
about recognized identity fields, not a claim to decode all provider traffic.

Non-provider requests release only the exact app origin and HTTPS Google Fonts; others
are aborted and logged. Stub mode injects local fulfillment and adds the existing provider
DNS guard to Chrome. It cannot obtain a provider continuation. Live alone receives that
function after authority validation and typed confirmation. Service workers are blocked.
Usual Chrome background-networking flags are set, but traffic outside Playwright's view
is not claimed. Provider-shaped local requests, aborted requests, and network continuations
are separate counts.

One additional refusal is deliberately stricter than the brief: HTTP redirects stop before
following the Location header. Installed Playwright 1.62.1's Chromium implementation
automatically continues redirected requests without invoking its route handler. The runner
therefore installs a CDP response guard before releasing each frame's initial requests,
using the parent's guard for frames in the same process. A guard attachment failure refuses
the request. This avoids silently following an unexamined URL. A loopback server's redirect
toward the fictional API entry is stopped with zero provider attempts. The redirect
decision has a pure deletion mutant; disabling that response guard in a browser would
deliberately bypass the route boundary, so S4a does not run that browser mutant. A provider
redirect in S4b ends the visit and needs a new reviewed routing design before another run;
this runner does not claim to observe a redirecting provider flow.

The acceptance plugin alone adds observer events around original adapter dispatches,
samples, ready/error/block callbacks and Play calls; exact source matches fail on drift.
The application source and production builds have no hook. No injected player factory or
playability rule replaces the real adapter. Existing DOM attributes record selection,
visited rows and placement; a full reducer dump is **not observable** from them. Samples
are associated with the current attempt; matching numeric values support provenance but
cannot distinguish two identical numbers from different causal paths. Parked return need
not cause a new sample: the receipt labels cached values and says whether a fresh sample
was observed. Decoding, a fresh unsampled position and provider pixels are not inferred.

Request routing records the proposed Referer. CDP extra-info records browser-reported sent
headers when available, separately; a locally fulfilled frame has no provider receipt.
CDP data events count encoded bytes while parked on the page session. Cross-process frame
coverage and buffered transfers can be absent; this is not a total browser traffic claim.
The provider's received Referer, loader's actual requests and parked decoding remain S4b
observations or explicit non-claims. The stub replaces the loader wholesale.

## Stops and falsification

Each row has a pure decision test and a deletion mutant in `mutations.mjs`. The fourteen
runner variants in `prove.mjs` verify the named receipt, nonzero exit and zero provider
continuations. Injection at the hook/decision boundary is identified below; it is not a
claim that the unchanged application generated that defect.

| # | Stop | Proof boundary | Mutation that must fail |
|---|---|---|---|
| 1 | Provider before Play | Stub inserts a routed API request before intent | Remove before-Play policy/stop detection |
| 2 | Second iframe or API entry element | Stub adds a second iframe; pure test covers API entry count | Remove element-count detection |
| 3 | Iframe parent changes | Stub reparents the existing frame | Remove parent detection |
| 4 | Frame covers a row or row hit reaches frame | Stub overlaps a queue row; all clean rows hit-tested | Remove coverage detection |
| 5 | Navigation waits for cross-origin reply | Stub suppresses local Next commit; runner requires the selection by two paints with no reply awaited | Remove navigation detection |
| 6 | Second terminal failure on one attempt | Two injected adapter-dispatch observations, plus pure telemetry test | Remove terminal-count detection |
| 7 | Position without a current getCurrentTime sample | Injected dispatch value absent from that attempt's sample ledger | Remove sample-membership detection |
| 8 | Error 150 called a territory block | Injected wrong diagnosis; normal 150 schema outcome tested separately | Remove diagnosis detection |
| 9 | Error 153 | Stub emits provider callback 153 | Remove error-code detection |
| 10 | Warm direct-click autoplay blocked | Stub callback on warm load | Remove warm-block detection |
| 11 | Blank parked return or dead instance | Synthetic blank-answer injection; human picture gate in live, element loss monitored | Remove return/instance detection |
| 12 | Resume sentence after zero sample | Inject zero sample then resume signal | Remove zero-resume detection |
| 13 | Play for failed eligibility rule | Pure rule/decision injection using future checkedAt; source is not weakened to make this happen | Remove eligibility detection |
| 14 | Unnamed ID | Routed thumbnail for fictional S4Stub99999, plus body/path policy tests | Remove named-ID detection |

For row 5, live evidence is a conservative local-commit check, not introspection into a
cross-origin implementation. A delayed local commit also stops; the runner cannot prove
the provider was the cause. This two-paint check concerns navigation, not API readiness.
Structure/hooks are checked as observed and geometry is monitored between checkpoints.
Width is checked after the runner's own resize has settled, before every capture.

## Reproduce S4a only

Use existing dependencies. No package script, workflow or test launches the runner. Node
tests import the pure modules; the DOM test exercises the observer against jsdom only.
The following manual sequence creates a fictional edition outside the repo:

```sh
RUN=$(mktemp -d /tmp/kickoff-s4a-XXXXXX)
RT=/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
BASE=11845cb21cfd0e87a1105e37e7b74e348739541c
TIP=$(git rev-parse HEAD)
npm run typecheck
npm test
npm run build
npm run build:single
npm run build:acceptance
git diff --exit-code "$BASE" "$TIP" -- src .github package.json package-lock.json vite.config.ts index.html
node --import tsx docs/verification/moments-observation/generate.mjs --stub "$RUN/edition.json"
npm run build:acceptance -- "$RUN/edition.json"
node --import tsx docs/verification/moments-observation/prove.mjs "$RT" "$CHROME" "$RUN/proof"
node docs/verification/moments-observation/mutations.mjs "$RUN/mutations"
node --import tsx docs/verification/moments-observation/runner-mutations.mjs "$RT" "$CHROME" "$RUN/runner-mutations"
```

The generator accepts an optional final `1` in stub mode to produce a one-item edition.
For that run, supply an external fictional authority with just its first identity and the
matching loopback port. The runner's port option accepts zero only for its own stub fixture,
allowing the OS to choose a port and recording it. Do not reuse zero in genuine authority.
Mutants run in a disposable archive of HEAD with the existing dependencies, restoring and
re-running green after each red. They never modify the served checkout. The proof driver
runs all forced stops and refusals, then ends with a complete clean visit.

## Output and limits

`observations.json` is an array accepted by availabilityObservationSchema.array():
observedAt, environment (loopback status, exact origin, Chrome, headed/headless, OS), outcome,
optional providerError and note. The schema has no identity property, so ordered identities
are in the authority/receipt and each note names its test ID. Error 150 is owner-blocked,
never a territory diagnosis. Stub outcomes describe synthetic events explicitly.

`receipt.json` contains the authority, source and dist hashes, request decisions, host counts,
hook/DOM/click observations, schema observations, console messages, captures and hashes,
manual answers, ceiling, stop reason and non-claims. PNGs and the raw authority accompany it.
These records are for test identities; no curation write or import is offered.

Not verified by S4a: real provider playback, content and rights, ads, readiness duration,
nearest-keyframe seeking, one-press autoplay, real iframe attribute retention, the IFrame
API loader's own requests, parked decoding, the Referer received by the provider, error 153
on any origin, the Pages origin, physical devices, Safari and Firefox, screen-reader speech,
browser zoom, Android and iOS Back, CloseWatcher. A stub proves runner logic only.

## Builder receipts, 2 Oct 2026

Frozen main is `11845cb21cfd0e87a1105e37e7b74e348739541c`: typecheck passed and the
builder reran **753 tests in 53 files**. Implementation evidence is from
`515224be130f704590245844d1a886fd81d9a725`: typecheck passed and **844 tests in 55 files**
passed. Production, single-file, default acceptance and generated stub acceptance builds
passed. The protected application/configuration diff is empty. The later evidence commit
only adds these records and documentation; its exact head and Verify run are in the PR comment.

- [Proof summary](receipts/proof.json): all 24 cases passed their expected result: fourteen
  stops, redirect refusal, six authority refusals before launch, owner-blocked, cold-blocked,
  then a completed two-ID visit. Every case has zero provider continuations and no unhandled
  provider response. The completed visit has two local provider-shaped fulfillments.
- [Pure mutation receipts](receipts/mutations.json): **51 red, 51 restored green**. This
  includes route-action assertions, authority, generation, schemas, extraction, hooks,
  redirect refusal and the observer's absent-frame regression.
- [Browser mutation receipts](receipts/runner-mutations.json): **14 red, 14 restored green**,
  one per stop-table row. Red means the expected-stop assertion failed; the raw process may
  still stop for a different reason or the safety ceiling. Both states kept zero provider
  continuations. These inject evidence and do not establish application defects.
- [Completed visit](receipts/clean/receipt.json), [observation array](receipts/clean/observations.json)
  and six adjacent captures: one page load, one instance, cold/warm synthetic events,
  A sampled at 12, B loaded at zero, A reloaded at 12. All settled width checks matched.
  A separate one-ID visit also completed and explicitly omitted Next/Previous.
- [Picture finding](receipts/picture-finding.json) and [Cinema viewport](receipts/cinema-picture-finding.png):
  the frame is 350 by 200, 632 by 355.5 and 320 by 200 at the respective widths. In Cinema
  its centre hits the cover word at every width. Stage hits the iframe. The diagnostic
  adds read-only hit/style reporting and viewport captures to the same stub runner; no
  application source or style was changed. Receipt status complete is not a visual pass.
- [Full raw evidence](receipts/full-evidence.tar.gz) contains every forced-case receipt,
  request decision, authority copy, observation array, screenshot, red/green log, diagnostic
  script and baseline/build log. Extract into an external directory with `tar -xzf`.
  Regenerable source archives are omitted; the mutation scripts reconstruct them from Git.
  Raw diagnostics are compressed because CSS-like tokens in receipts can alter production
  CSS (ideas row 78). The readable summaries and PNGs remain directly inspectable.

Chrome was 154.0.8037.93 on macOS Darwin 25.6.0 arm64, headless with a fresh profile per
visit. Ports are in each receipt, including 54113 for the completed two-ID visit and 4318
for the one-ID visit. This is the Ledger/light protocol; other lenses/themes are not
claimed. There was no application interface change and no CHANGELOG entry.

Row 78 comparison: production CSS SHA-256 on main and the final documentation tree is
`f22157bc13632d0de509baba600fb44c087975b29e1d722c6e13eaa5bac7cdaa`.
The single-file HTML is also byte-identical to main, SHA-256
`be6c6ede104d573b5415ddd6a2bf19747d1f3c2eee6bbe10d56642fc1393b91e`.
The final-head build and completed stub receipt are also recorded in the PR comment.
