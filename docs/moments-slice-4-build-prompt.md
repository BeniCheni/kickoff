# Moments slice 4, S2–S3 — the build prompt (archived by the PM seat, Thu 1 Oct 2026, TZ=America/New_York)

Written from a fresh read of `origin/main` at `7636b08`: the PR #128 squash `9188cb6` plus
sync data only. The specification it builds is `docs/moments-slice-4-spec.md`, committed with
this file. S2 connects the embed-permission check, adds a test seam and an acceptance-only
build, and brings the two out-of-repo probes into the repo. S3's receipts are S2's builder
evidence in the same pull request. Nothing here requests a provider, changes the empty
production edition, or assigns a version.

Routing: recommended builder is Codex on GPT-6 Astra at High (the README's seat for deep,
ambiguous work). Cold review is Claude Code through `/kickoff-pr-review --no-merge`. If Beni
routes the build elsewhere, the title line and the authorship line change and nothing else
does.

Delivered in chat; this file is the archive.

---

Kickoff Moments slice 4, S2–S3 — connect the permission check, add an acceptance build, bring the probes home (Codex · GPT-6 Astra · High)

You are the builder for the first code step of Moments slice 4 in the Kickoff repo (github.com/BeniCheni/kickoff), running in Codex on GPT-6 Astra at High. Slices 1–3 are merged and inactive: the gallery, the player host, the YouTube adapter and Cinema are in the code. src/curated/moments.json is [], so https://benicheni.github.io/kickoff/ shows the empty shelf and the player requests nothing. This step changes none of that. It makes Play depend on a recorded embed permission before any real video is ever requested. It gives the next step a build it can test against without touching the published one. It re-runs the evidence the last review did not.

WORKSPACE

- Work in a Codex worktree, not Local mode. Never open, edit, check out or commit in /Users/benicheni/Documents/Claude/Projects/Kickoff, which is Beni's own checkout, or in any other existing worktree. /Users/benicheni/kickoff-cursor-build-slice3 is stale at d93c551; do not build from it.
- Create the branch codex/moments-slice-4-acceptance from the latest origin/main. At writing that is 7636b08. Run git diff --stat 7636b08 origin/main: anything newer must touch only src/data/*.json and docs/sync-digest.md, or stop and say what moved.
- Make the first commit with git cherry-pick 7636b08..claude/kickoff-moments-slice-4-060343. That local branch holds one docs-only commit by Claude, adding three paths: docs/moments-slice-4-spec.md, docs/moments-slice-4-build-prompt.md (this prompt's archive), and a one-line superseded pointer in docs/moments-player-plan.md §9. Confirm exactly those three paths, then never modify the spec. If you disagree with it, say so in the PR.
- Author and commit every other commit as Codex <noreply@openai.com>. Run npm ci once.

GROUND TRUTH — read fresh; nothing in this prompt is evidence

Read in this order:
1. AGENTS.md.
2. CLAUDE.md: "Verification discipline" and "Release management".
3. docs/moments-slice-4-spec.md, all of it. It is the specification for this work.
4. docs/moments-architecture.md: Decision 1, Decision 2, "Slice 3 implementation decisions" and "Slice 3 review resolutions", including the Pass 2 amendments.
5. docs/verification/moments-player/README.md and pass2.md.
6. docs/v0.2.6-ideas.md, rows 56–70.

Then the code:
- src/lib/moments.ts, src/lib/clock.ts, src/lib/useNow.ts and src/lib/momentsPlayer.ts.
- src/App.tsx and src/main.tsx.
- src/components/MomentsSessionProvider.tsx, MomentsPlayback.tsx, MomentsPlayerHost.tsx and MomentsPage.tsx.
- tests/moments.test.ts, tests/momentsContract.test.ts, tests/fixtures/moments/gallery.ts, tests/harness/moments.tsx, tests/dom/momentsPlayerHost.test.tsx and tests/dom/rig.ts.
- vite.config.ts, package.json and .gitignore.
- .github/workflows/ci.yml, pages.yml and sync.yml.

The two out-of-repo probes and the dev entry the stub used are in /Users/benicheni/kickoff-pr128-pass2/pass1: real-adapter.mjs, layout-probe.mjs and probe-entry/_probe_real.tsx. Read and copy from them; never modify that directory.

Precedence on the slice-4 contract: the spec, then docs/moments-architecture.md, then this prompt. Beni's rulings in the spec's Authority section outrank all three. Record every resolution in the PR body.

WHAT TO BUILD — the spec's "S2 contracts" are the requirements; this is the order

1. The permission check.
   - Add one playability rule: a moment and the app clock's nowUtcIso in; whether it may offer Play out. The production default is hasEmbedPermission. Route every playability decision through it: MomentsPlayback's identity (the Primary control, the secondary source link, PlaybackRecovery), MomentsSessionProvider.play's videoId, and any other you find.
   - An item that fails renders exactly as a link-only item does today.
   - play() on a failing item creates no attempt and passes nothing to the adapter, even when called directly. Today the reducer's play runs before the videoId check; move the check ahead of it.
   - Decide what a permission lapse does to a frame already playing, and test it. At minimum the lapse stops any new Play, Retry or Replay from the next clock tick.
   - Write DOM tests on the existing rig, red at the commit before and green after (record both SHAs). Cases: permitted; identity without permission; unknown; denied; revoked; expiry at or before now; checkedAt after now; unverified content; unknown scope; legacy link-only; a lapse mid-visit driven by the rig's clock; and a direct play() on a failing item making zero mock-adapter calls.
2. The test seam.
   - An optional App prop, threaded like momentsPlayer, lets the harness and DOM tests inject a different rule. src/main.tsx passes neither prop.
   - The archival fixtures keep their no-permission statement. Do not give any item carrying pkEpLtePJm0, iBuTEywEQ6U or sXAkBsEcXSo a permission record.
   - The harness and the existing player DOM tests inject a permissive rule, so they keep playing the archival items through the mock.
   - The real adapter is never paired with an injected rule. Retire the _probe_real dev-entry approach.
3. The acceptance build and edition.
   - A separate npm script builds to its own git-ignored directory. It substitutes an acceptance edition for src/curated/moments.json at bundle time and validates that edition with parseMoments against the committed snapshot before bundling.
   - It marks itself without changing layout, for example a document.title prefix and a root data attribute.
   - npm run build and npm run build:single must be unable to reach the acceptance input under any environment. Prove it.
   - The committed acceptance edition uses fictional 11-character ids. It includes: two permitted items; one with an identity and no permission; one denied; one expired; and one legacy link-only item. Every permission basis says the record is a fictional acceptance record.
   - Its fixtures are rows copied from a committed snapshot, cited by SHA, and absent from the current snapshot. A node test validates the file and asserts that absence.
   - The script also accepts a replacement edition path, so S4 can supply named ids without editing the committed file. Read the path only in that script's mode.
   - ci.yml, pages.yml and sync.yml do not change.
4. The probes.
   - Bring the real-adapter stub and the layout probe into a new docs/verification/moments-acceptance/, with no new dependency. Scripts take the Playwright runtime and Chrome paths as arguments, as the existing checkers do.
   - Run the stub against the served acceptance build. The browser context fulfils https://www.youtube.com/iframe_api from a committed stub script that attaches player methods at ready, with a control variant that attaches them at construction.
   - The context fulfils the nocookie embed URL with an empty document and aborts every other provider host.
5. The docs.
   - Add a section headed "Slice 4 implementation decisions (S2)" at the end of docs/moments-architecture.md. Record each call the spec left to you, with its cost: the mechanism, the lapse behaviour, file names, any commit split.
   - Add docs/verification/moments-acceptance/README.md with exact commands.
   - Add a CHANGELOG [Unreleased] entry in the voice of the slice 1–3 entries: inactive, empty production edition, the interface readers see unchanged.
   - Add new ideas rows for anything you found and left.
   - No version bump, no new CHANGELOG version section, no README edit, no tag.

THE RECEIPTS — the spec's "S3 acceptance receipts", all of them, in this pull request

Use RT=/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs and CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' (Google Chrome 154.0.8037.58 at writing); record the versions you actually run.

Base is the branch's merge base with main, built from the same data snapshot as the tip. Serve base and tip dist on separate loopback ports. The harness dev server and the acceptance build each get their own port. Set the viewport before every load. Never edit a served checkout during a run.

Run:
- The 1,260-cell matrix (docs/verification/moments-player/check-player.mjs), at base and tip.
- The six checker mutations (check-mutations.mjs), at base and tip.
- The 72-cell inert comparison (docs/verification/moments-foundation/check-browser.mjs), base against tip.
- The 180-box layout comparison, with the probe you brought in.
- The real-adapter stub, both variants, on the acceptance build.
- The acceptance journeys the spec lists, at 360, 390 and 1000.

Every cell asserts scrollWidth === innerWidth, at most one iframe, no request before Play other than Google Fonts, and zero provider egress.

Commit machine receipts and a README under docs/verification/moments-acceptance/, with screenshots only where they prove what a number cannot. The README's first paragraph says that a green stub is not playback.

HARD LIMITS

- No request may reach a provider host from this work, even once. Every browser context uses the existing checkers' provider predicate (youtube.com, youtu.be, youtube-nocookie.com, ytimg.com, googlevideo.com, ggpht.com and their subdomains) and aborts every match, except the two URLs the stub fulfils locally. A receipt that records an escaped request fails the run.
- src/curated/moments.json stays []. tests/moments.test.ts's empty-edition assertion does not change. No data-honesty or inert assertion is weakened. Typecheck and test are green at every commit.
- No change to package dependencies, index.html, src/data, pages.yml, sync.yml or ci.yml.
- No change to the ruled player behaviour: nocookie, allow, referrerpolicy, object-form startSeconds, the 200px floor, the zero-sample sentence. Rows 65, 66 and 68 stay as they are.
- The three historical ids never enter the acceptance edition and never receive a permission record.
- No merge, version, tag, release, Pages dispatch or workflow_dispatch.

STOP AND SAY SO, rather than working around it, if:
- the check cannot be connected without changing the reducer's provider-event contract;
- any request escapes to a provider host;
- you cannot prove the production builds unable to reach the acceptance input;
- an existing data-honesty or inert assertion would have to change;
- the inert comparison shows any body-text or element-box difference on the production build.

FINISH

Push the branch. Open a draft pull request against main titled "Moments slice 4, S2–S3: permission-gated Play and an acceptance build — inert until curated". The body carries:
- what changed, and what a reader of the site sees (nothing);
- every decision the spec left to you;
- the evidence commands with SHAs;
- the receipts' headline numbers;
- a "Not verified" section;
- the line "Non-release. Cold review: Claude Code via /kickoff-pr-review --no-merge."

Then stop. Do not request review, merge or label.
