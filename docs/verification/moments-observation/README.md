# Moments slice 4 S4a — observation runner

Non-release, draft, six-pass 360. Beni adjudicates and merges. S4a builds and proves this
manual runner with fictional identities and zero provider egress. S4b is a later run by
Beni on his Mac with his written authority. Codex does not run live mode.

**A green stub is not playback. A loopback result predicts nothing about the Pages origin.**
The production edition stays empty. Nothing imports these observations into curation.

**Picture finding, repaired by PR #159 (ideas row 79).** When this runner was built, the
application's Cinema cover obscured the synthetic frame at 390, 1000 and 360 while the stage
displayed it. Viewport and full-page captures reproduced that, and the centre hit-test
reached the cover word in Cinema. The receipts and captures in this directory record that
state and are historical. One Cinema-scoped stacking rule now puts the live frame above its
slot; `check-cinema-repair.mjs` is the repaired-state probe and `../moments-cinema-repair/`
holds its evidence. `check-cinema.mjs` asserts the old defect, so it exits non-zero against
any repaired build, by design. A completed stub visit still establishes the runner's
protocol, not a provider picture.

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
node --import tsx docs/verification/moments-observation/runner.mjs --live --authority "$AUTH" --runtime "$RT" --chrome "$CHROME" --ceiling-ms 900000 --out /absolute/external/new-receipt
```

The command explicitly allows fifteen minutes for twelve prompts (thirteen with
`--manual-next`): confirmation, advancement, six captures, parking, blank return, ads and
final picture description. The default remains five minutes; neither limit measures product
readiness. A ceiling at any prompt aborts the pending question, writes both JSON files and
returns exit 1. Ctrl-C uses the same path with `operator-interrupt`.

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
fifteen minutes. It is operational protection, **not a product readiness timeout**. The
launch explicitly sets `chromiumSandbox: true`, in both modes. A launch failure refuses the
run; no unsandboxed fallback exists. The receipt records Chrome's effective command line
(with the temporary profile path redacted) and `navigator.webdriver`. This remains an
automation-controlled browser; no flag hides that fact. The ephemeral loopback debugging
endpoint is used for the browser-wide network guard. Sandbox-on headless and headed stub
launches are measured in the proof driver.

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
nonzero exit without moving to another identity or origin, including a ceiling at a prompt. A human unsure answer is kept as uncertainty,
never promoted to a pass for the corresponding provider claim. The ad answer describes what
Beni saw under the named-host policy and any recorded runner aborts (next section), so it is an
observation of this allowlist as much as of the provider.

## Request and observation boundary

The pure policy decides release, record, abort or stop. Before Play every provider request
is aborted and stops the run. Afterwards the exact API entry and at most one nocookie
frame request per named ID are released. Subsequent requests, including loader-generated
scripts, are released only within authorized families and recorded host by host. They are
not described as expected beforehand. Ruling 2 counts the page-created iframe and API
entry elements, including removed/replaced ones, rather than counting downstream scripts.

An unnamed playback identity stops even on a named extra host. Under Beni's 4 Oct ruling,
image requests with exactly one thumbnail/storyboard path identity (`vi`, `vi_webp`,
`an_webp`, `sb`), no body and no query are recorded as shelf images rather than stopping.
Document, API/fetch and media requests still stop on an unnamed identity. This intentionally
narrows the spec's broader unnamed-id stop; the PM amends the spec separately. The extractor recognizes embed,
watch/v, short/live, short-link, thumbnail/storyboard paths, repeated identity parameters,
video_id/docid and JSON videoId fields, including duplicate explicit keys. It follows
nested URLs three levels. It cannot identify IDs hidden in opaque signatures, binary
bodies, unknown parameter names, arbitrary encodings or an undocumented protocol. An
eleven-character opaque media token is not assumed to be a video ID. This is conservative
about recognized identity fields, not a claim to decode all provider traffic.

Authority can name up to 32 host families, including the required `youtube.com` and
`youtube-nocookie.com`. Names are lowercase DNS names with bounded labels: no IP literals,
schemes, paths, ports, wildcards or trailing dots. A name authorizes itself and dot-bounded
subdomains; the printed authority lists them before typed RELEASE. Before Play only the app
origin and HTTPS Google Fonts are released. Afterwards named extra hosts follow the same
HTTPS, identity and redirect rules. Every other non-provider host is aborted as
`unlisted-host`, a runner decision rather than a provider failure. Hosts and abort reasons
are counted; every completed observation notes any runner abort during the visit. This is
narrower than the spec's unrestricted recording language, as Beni ruled on 4 Oct.

Stub mode receives a local fulfilment function, never a provider or named-extra-host
continuation. The extra-host proof fulfils the fictional named host locally and aborts the
unnamed host. Redirect fixtures use only the runner's own server through fixed
loopback-resolved names. Provider DNS remains blocked in every stub launch. Service workers
are blocked. Provider-shaped local requests, aborts and continuations have separate counts.

Every HTTP redirect ends the run before Location is followed. Playwright's route callback
skips redirect hops; Pass 2 therefore removes that competing interceptor and uses one
browser-target CDP Fetch owner for request policy and response decisions. Page-target
interceptors lost coverage when an out-of-process iframe rejoined its parent. The browser
target survives those transitions; failure or disconnection stops the run. The one recorded
exception is Chrome cancelling a paused response during document replacement: an exact
`Fetch.continueResponse` InvalidParams/expired-id response is logged as cancellation, with
no new request released. Request-release, fulfilment and redirect-abort errors still stop. This is measured
on the recorded Chrome version, not a promise about an untested browser version.

**Coverage measured in Pass 2:** initial same-site and cross-site frames, top frame,
subsequent same-site/cross-site frame documents and a nested cross-site frame; document,
first script, later fetch and two-hop chain redirects; 301, 302, 303, 307 and 308. Each
redirect has a guard-off browser mutant that must reach the loopback Location, then a
restored guard that must stop with zero target hits. Meta refresh and script-driven
navigation are new requests: the corresponding twelve cases reach the loopback target
through the policy and are recorded, without pretending they are HTTP redirects. These
fixtures prove interception, not provider behavior. Binary identities, WebRTC, WebSockets,
real media redirects and traffic outside the guarded HTTP lifecycle remain unmeasured.

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

| # | Stop | Can fire against the unchanged application in S4b? | Proof and limits |
|---|---|---|---|
| 1 | Provider before Play | Yes | Routed request; phase flips once and stays after-Play. |
| 2 | Second iframe/API element | Yes | Counts every element ever added; a legitimate rebuilding Retry also stops. |
| 3 | Parent changes | Yes | DOM identity and parent observation. |
| 4 | Queue covered/frame hit | Yes | Real hit-tests and viewport/ancestor-clipped overlap; a clipped parked frame is excluded. Cinema cover remains a separate defect. |
| 5 | Navigation waits | Yes | Requires local selection after two paints; any late commit stops, without attributing it to the provider. |
| 6 | Second terminal failure | Adapter regression only | Current `fail()` guards the ticket; injected dispatch proves the tripwire. |
| 7 | Unsampled position | Adapter regression only | Instrumented `sample()` precedes current position dispatch; numeric membership does not establish causality. |
| 8 | 150 called territory | Dispatch: regression only; copy: possibly | Current mapping is owner-blocked. Copy regex can miss other wording and cannot read the provider frame's text. |
| 9 | Error 153 | Yes | Hook precedes stale-callback filtering; conservative stop. |
| 10 | Warm autoplay blocked | Yes | Warm direct-click callback. |
| 11 | Blank/dead return | Element loss: yes; blankness: human | `unsure` remains uncertainty and continues. |
| 12 | Resume after zero | Adapter regression or wrong copy | Uses the sample when the resume signal was emitted; a later zero does not falsely invalidate an existing label. |
| 13 | Ineligible Play | Regression only in this protocol | Generated items are permitted without expiry. The variant evaluates the rule at year 2000; it does not read a failing page. |
| 14 | Unnamed playback id | Yes | Frame/API/media identities stop; recognized shelf image identities are recorded under Beni's ruling. |

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

The protected-path diff is a review assertion for this PR, with BASE supplied explicitly;
it is not a driver precondition on future main. The three drivers work after legitimate
application/data changes. Exact adapter instrumentation still fails on source drift, as
its unit regression demonstrates. Do not replace that guard with a source-history pin.

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
never a territory diagnosis. Only a completed run produces observations; stopped/refused
runs write an empty array alongside their full receipt. Every stub environment begins
`STUB;` and every note says synthetic. Unreached identities are labelled explicitly.
`played` requires a matching current-attempt PLAYING event followed by a finite positive
sample for that identity. It still cannot distinguish content from an ad; picture/content
judgment remains human. Pass 2.5 should ask Beni to accept this conservative rule.
Malformed provider codes are recorded as unknown with a note and no invalid numeric field;
they cannot prevent receipt serialization. Runner aborts appear in every completed note
when any occurred during the visit.

`receipt.json` contains the authority, source and dist hashes, request decisions, host counts,
hook/DOM/click observations, schema observations, console messages, captures and hashes,
manual answers, ceiling, stop reason and non-claims. PNGs and the raw authority accompany it.
These records are for test identities; no curation write or import is offered.

Not verified by S4a: real provider playback, content and rights, ads, readiness duration,
nearest-keyframe seeking, one-press autoplay, real iframe attribute retention, the IFrame
API loader's own requests, parked decoding, the Referer received by the provider, error 153
on any origin, the Pages origin, physical devices, Safari and Firefox, screen-reader speech,
browser zoom, Android and iOS Back, CloseWatcher. A stub proves runner logic only.

## Pass 2 receipts

Implementation `a022828e5d399f391767f65dc89174c362b0d07b`: typecheck and **860 tests in
55 files** pass; **69 proof cases**, **64 pure mutants** and **47 browser mutants** pass,
with every mutant red and restored green. The disposable merge onto main `d1b2023` passes
typecheck, the same suite and all 69 proof cases (merge tree `81dcfe4b`, no merge commit).
Chrome 154.0.8037.93, Playwright 1.62.1, Node 24.15.0 and npm 11.12.1 were used on Darwin
25.6.0 arm64. Clean two-ID port: 65007; one-ID: 63404; headed sandbox: 64812; base Cinema:
57237. Every case's dynamic port is in the receipts. A docs-only evidence commit follows;
the final head and Verify run are in the single Pass 2 PR comment. Earlier receipts are historical
where explicitly dated; regenerated clean observations carry the stub marker and stricter
played rule. A completed protocol is not a visual pass.

- [Proof summary](receipts/proof.json): forced stops, authority refusals, frame/redirect/navigation variants,
  prompt ceiling, named/unnamed hosts, shelf images, malformed callbacks, sandbox-on headed
  launch and complete visits. Every run asserts zero provider continuations and zero
  unhandled provider responses.
- [Pure mutants](receipts/mutations.json) and [browser mutants](receipts/runner-mutations.json): deletion controls, each restored green;
  browser reds disclose alternate stops. Redirect reds must actually reach Location.
- `clean/` and the one-ID summary: completed two-ID and one-ID protocols and captures.
- `base-cinema.json`: independent `11845cb` default acceptance build, six cells (three
  widths × opaque/transparent frame), five hit points each. Stage hits the iframe; Cinema
  hits the cover word; hiding the cover exposes the slot. `check-cinema.mjs` reproduces it
  using the base build and its original S3 stub. Beni authorized a separate repair before
  S4b. This PR changes no application source. (That repair is PR #159; since it, the
  script reproduces the defect only against a build made before it.)

The full raw archive was removed under Beni's ruling. Its historical SHA-256 was
`7b4e0dcbdbf91576efb8db453e97efeabcd4cac99b75707c120eb5662ce2bad3`.
The small final-check archive was also removed (SHA-256
`ffc8bec71ac5afd22f2d8b6479010506f70b7bbd01cc49f4c328e5dcb9a3e240`);
readable check summaries replace compressed logs. After running the recipe above, regenerate
a raw archive outside Git with `tar -czf "$RUN/full-evidence.tar.gz" -C "$RUN" proof mutations runner-mutations`.
New times, ports and browser files mean it is not expected to match the historical hash.
No archive belongs in the final tree. Committed copies redact local workspace/profile paths;
raw external evidence retains exact launch provenance.

The authority freshness/reuse finding stays open: old past timestamps can pass and the
same authority can generate the same edition twice. Pass 2 recommends a 24-hour bound for
Beni to rule on; it implements neither expiry nor consumption. A spent marker beside one
receipt alone would not prevent reuse with another output directory. The five-minute
runner default is unchanged; the live example explicitly chooses fifteen minutes.


The controlled production comparison uses current-main application source and PR source
with the exact committed `11845cb` data bytes in both disposable archives: no fixtures are
typed or regenerated. Production and single-file outputs are byte-identical. CSS SHA-256 is
`f22157bc13632d0de509baba600fb44c087975b29e1d722c6e13eaa5bac7cdaa`; single-file HTML is
`be6c6ede104d573b5415ddd6a2bf19747d1f3c2eee6bbe10d56642fc1393b91e`.
The independent merge test uses current main's actual `d1b2023` snapshot. The smoke receipt
covers ten cells at 390/1000 with V0.5.2, equal scrollWidth/innerWidth, no frames and no
provider attempts. S3 was not rerun: neither instrumentation nor the acceptance build script
changed. `regressions.json` records the parent reds, execution-edge checks, authority reuse
and the interim cancellation failure; `parent-runner-probes.patch` contains only the stub
entry/fixture additions used against 54d4e80, never a copied or modified redirect guard.
Apply it to an external 54d4e80 checkout and copy `probe-fixtures.mjs` there to repeat those
parent cases with the same generated acceptance build, runtime and DNS guard.
