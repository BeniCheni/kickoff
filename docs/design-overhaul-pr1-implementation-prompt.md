# Kickoff design overhaul, PR 1 — tokens and type (Cursor build brief, archived Mon 16 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Mon 16 Nov 2026 at about 11:55 AM EST. Beni
asked for it in the session that briefed PR 0's review cycle. Rung 3 of the ladder for the
overhaul's PR 1, the first PR into the integration branch.

Read fresh for it:
- the plan, [design-overhaul-plan.md](design-overhaul-plan.md): sections 2(a), 3, 4.2, 7.4,
  8.2, 8.3 and 10.1;
- Beni's rulings, in [design-overhaul-plan-review.md](design-overhaul-plan-review.md), above
  all question 9 ("Self": fonts self-hosted) and question 3 ("Oswald": the wordmark);
- the handoff's sections 2 and 4 (`docs/design/5-handoff/second-edition-handoff.md`);
- the code PR 1 touches: `src/shell.css`, `tests/contrast.ts`, the font links in
  `index.html`, `offline.html`, `web/app/layout.tsx` and both harness pages, and
  `web/scripts/write-shell-css.mjs`;
- PR 0's carry-forwards, at the end of
  [design-overhaul-pr0-review-prompt.md](design-overhaul-pr0-review-prompt.md).

When it was written:
- `origin/main` was `ad4c5f3`;
- PR #327 (PR 0) was still open at `ae927d7`, with Beni's ruling to merge it at that head;
- no integration branch existed.

So the brief opens with checks that stop the build if PR 0 has not merged or if the routing
window has passed. The PM seat checked that no other session was writing this brief.

Four things this brief adds to the plan, each with the reason:
- **Caslon is not preloaded yet, although the handoff preloads it.** Nothing renders in Caslon
  until a later PR, and Chrome warns about a preload that goes unused. PR 0's runner fails a
  cell on a console warning.
- **The flipped host tests are a strengthening.** Ruling 9 makes the two Google hosts foreign,
  so tests that allowed them now expect them to fail. The brief says why this weakens no
  assertion.
- **The integration branch has a name.** The plan named none, and this brief calls it
  `overhaul/second-edition`. A ruleset for it stays Beni's, per the plan review's
  adjustment 6.
- **Every cell's capture is compared with `main`'s,** because self-hosting can change glyphs
  that the plan expects to stay the same.

Delivered in chat in a four-backtick fenced block, one line per paragraph. This copy is the
archive.

**Amended at about 12:00 PM EST the same day.** The first attempt (Cursor, 11:55 AM) stopped
before building, on two checks:
- #327 was still open;
- `agent about` reported "Grok 4.7 256K Low".

That model line is the CLI's stored default, which the review-loop spikes had left at low
effort (`docs/review-loop-proposal.md`, S4, on PR #328's branch). It is not necessarily the
running session's model. The brief now has the session started in the CLI with
`agent --model grok-4.7-xhigh`, which also stores that model, and requires `agent about` to read
Extra High. Nothing else changed. The version below is the one re-sent.

---

````text
Kickoff design overhaul — PR 1: tokens and type (Cursor build brief; the first PR into the integration branch)

You are building one PR in github.com/BeniCheni/kickoff: the second of ten that build Fergie Time's second edition into Fixtures and Table, and the first that goes into the integration branch. This session must run on grok-4.7-xhigh. Start it in the Cursor CLI with agent --model grok-4.7-xhigh. The CLI stores the last --model it ran, and agent about reports that stored model. In the app, agent about may show the stored default rather than the session's own model, which is what stopped the first attempt at this brief. Your PR body names the model and effort that actually ran. Read CLAUDE.md and AGENTS.md first; they bind you. Then read docs/design-overhaul-plan.md (sections 2(a), 3, 4.2, 7.4, 8.2, 8.3 and 10.1 above all), docs/design-overhaul-plan-review.md (Beni's rulings) and docs/design/5-handoff/second-edition-handoff.md (sections 2 and 4). The PM seat (Claude Code, Opus 5.5) wrote this brief on Mon 16 Nov 2026 at about 11:55 AM EST, from origin/main at ad4c5f3 and PR 0's head at ae927d7. Treat the repository as ground truth and this brief as a map of it. Where they disagree, the repository wins: say so in the PR and carry on. Run TZ=America/New_York date before writing any date.

BEFORE YOU START. Any of these stops you.
- PR 0 (#327) must have merged. Check with gh pr view 327 --repo BeniCheni/kickoff --json state,mergeCommit. Beni ruled "Merge at ae927d7" on Mon 16 Nov 2026 and runs that merge himself. If the PR is still open, stop and say so.
- The routing Beni approved on Sun 15 Nov 2026 (the amendment to section 3 of docs/design-overhaul-plan.md, on branch docs/review-loop-plan in PR #328): Cursor builds PR 1 on grok-4.7-xhigh only if PR 0 has merged and the integration branch exists by Tue 17 Nov. A build that would run past Thu 19 Nov, when Beni's Cursor tier changes, waits instead, so that each PR has one builder model on its record. If you are starting after Tue 17 Nov, or cannot open the PR with its evidence by Wed 18 Nov, stop: PR 1 is then routed by the amendment's table, and that is Beni's call.
- Run `agent about`. The tier must read Super, and the model must read Grok 4.7 at Extra High. If it shows another effort, stop and say so: never build on another model.
If usage stops you partway, push what is green, say so in the PR and stop. Never finish on another model.

THE INTEGRATION BRANCH. PR 1 creates it.
- After PR 0's merge, git fetch origin. Then create overhaul/second-edition at origin/main's tip with git push origin origin/main:refs/heads/overhaul/second-edition. That push writes no commit.
- Branch cursor/overhaul-pr1-tokens off it, and open the PR into overhaul/second-edition, never into main.
- A ruleset for the integration branch is a repository setting, and it is Beni's to add.
- From now on, every overhaul PR merges main into its branch and runs the suite before its evidence run (the plan review's adjustment 1), because the daily sync moves main.

WHAT THIS PR IS. The second edition's tokens and type, defined beside the first edition's and used by nothing yet. The fonts move from Google's servers to the site's own (Beni's question 9, "Self"). The handoff's measured contrast pairs become tests. A reader of this PR's preview should see today's look, set in the same faces, served from the site itself. No component changes.

RULINGS THAT BIND IT (Beni, in docs/design-overhaul-plan-review.md unless dated).
- 1 Branch and 2 Ten: this PR goes into the integration branch, third in section 3's order, and main and Pages do not change until the release.
- 3 Oswald: the wordmark stays Oswald, and Abril Fatface is not fetched for one word. Abril keeps its job as the display face under the foil (handoff section 4).
- 9 Self: fonts are self-hosted under public/fonts/, each family with its OFL.txt, Inter included, and no page contacts a font host.
- 12 Six: the overhaul is v0.6.0, numbered at the release, so this PR has no version, no tag and no CHANGELOG release section.
- 19 Repaint: Moments takes the second edition's tokens in PR 2, not here.
- Standing (CLAUDE.md): no data-honesty assertion is weakened, ever.
- Seats: you build and you answer Pass 2's rebuttal. Pass 1 is a fresh Claude Code session; Pass 2.5 is Codex's synthesis; Beni's word merges.

1. THE fb- TOKENS (handoff section 2).
- Add every token in the handoff's table to src/shell.css beside the first edition's. The handoff names them: fb-pulp, fb-typescript, fb-cover-black, fb-pulp-ink, fb-pulp-muted, fb-cover-ink, fb-cover-muted, fb-pitch, fb-amber, fb-alarm, fb-blood, fb-rift, fb-on-pitch, fb-rule and fb-rule-strong, fb-scrim, fb-torch, the fb-foil stops, and the type and measure tokens fb-display, fb-book, fb-neon, fb-label, fb-mono, fb-gutter, fb-measure and fb-measure-register.
- They sit on two axes: mode (light or dark) and stock (paper or black). A dark page resolves every surface to the black-stock voices. How you express the stock axis is your design; say what you chose and why.
- No component uses them in this PR.
- The first edition's tokens stay defined with their values. Moments' CSS reads them (src/index.css:12-175, web/app/moments/gallery.css), and so does every component until later PRs repaint them.
- Write each colour as a six-digit hex or as rgb(r g b / a), the only two forms tests/contrast.ts reads (its parseColor fails closed on anything else; plan 10.1, row 18). Alternatively, extend that parser, still failing closed.
- If you put them in Tailwind's @theme, keep it in mind: since #323, the public app's Tailwind scans only src/**/*.{ts,tsx}, and a token that no class uses emits nothing there. Say what each app's built CSS gains.

2. THE MEASURED PAIRS AS TESTS (plan section 3, PR 1's evidence line).
- Every pair in the handoff's "Measured pairs" table is computed in tests/contrast.ts from the tokens as written, never from literals, and asserted in tests/contrast.test.ts.
  - Each pair must reach its floor: 4.5, or 3 for large text.
  - Each must match the handoff's ratio to two decimals.
  - Count the rows yourself; the PM seat counts 34.
- Composites are computed, not typed. The scrim's worst case is fb-scrim at 92% over a white pixel, which the handoff gives as #1E1E1F.
- Where the handoff's ground is a measurement rather than a token, as the torch pool's RGB 57 50 43 is (measured at the spike's lit-paper centre), pin that literal with a comment that says so.
- Pin the five pairs the handoff lists as failing and not allowed, each as below 4.5:
  - blood on cover-black, 2.84;
  - the first edition's accent on pulp, 2.88;
  - its floodlight on pulp, 2.19;
  - its pitch on pulp, 3.91;
  - the spike's amber #8A5F00 on pulp, 4.20. That is today's --floodlight-strong.
  A later PR that reaches for one of these then fails a test that says why.
- Leave tests/contrast.ts's existing cases as they are. The StalenessBanner pair moves in PR 2.
- Show the new tests failing on purpose, then restored: change one fb- token so that a pair drops under its floor, and change one failing pair's colour so that it passes.

3. THE FONTS (handoff section 4; plan section 4.2; ruling 9).
- The files. The Fixtures and Table budget is ten styles in nine files:
  - Oswald, as one variable file;
  - IBM Plex Mono 400, 400 italic, 500 and 600;
  - Libre Caslon Text 400 and 400 italic;
  - Abril Fatface 400;
  - Chakra Petch 700.
  Inter comes as well, at the weights the first edition and Moments use today (400, 500 and 600), because today's body text and Moments are set in it. No other weight may be requested.
  - Take each family from its upstream OFL source at a named commit or release.
  - Subset to Latin and Latin Extended, as WOFF2.
  - Keep each family's OFL.txt beside its files.
  - Record, in the PR body and in a short record file beside the fonts, each file's source, version, the exact subsetting command and tool version, and its size.
  - The tool is yours, and it stays out of package.json.
- Reserved names (plan 4.2, which is the plan's reading and not legal advice). Abril Fatface's OFL reserves "Abril" and "Abril Fatface", and IBM Plex Mono's reserves "Plex". A subset of either is a Modified Version, so either ship it whole or subset it and rename it, in the file's name table and in every stylesheet that asks for it. That includes the first edition's --font-mono, which may change its family name for that reason only. Read Inter's OFL.txt before subsetting it, and follow what it says. Oswald, Libre Caslon Text and Chakra Petch reserve no name.
- One set of files, two apps. The plan puts the files once under public/fonts/. The Vite build uses base './' (vite.config.ts), while the Next app serves from its own root out of web/public/, and inlines the compiled shell CSS into the head (web/scripts/write-shell-css.mjs, then web/app/layout.tsx). Choose how each app reaches the files:
  - commit no second copy of a binary unless a test pins it byte for byte;
  - a generated copy made at build time is acceptable, as web/generated/shell.css already is;
  - it must work on Vercel, whose project root is web/;
  - a test asserts that the two apps' @font-face declarations name the same families, weights, styles and files.
  No next/font, and no new dependency.
- Loading.
  - Remove the Google preconnects and stylesheet links from index.html, offline.html, web/app/layout.tsx (including its document.write) and both harness pages, tests/harness/states.html and tests/harness/moments.html.
  - Use font-display: swap.
  - Preload only faces that today's first paint actually renders: Oswald and IBM Plex Mono 500. A font preload needs crossorigin even from the same origin, and its URL must match the @font-face source exactly.
  - Do not preload Libre Caslon Text yet, although the handoff preloads it. Nothing renders in Caslon until a later PR. Chrome warns in the console about a preload left unused, and PR 0's runner fails a cell on a console warning. The PR that first sets text in Caslon adds its preload.
  - The second edition's faces are declared but not yet used. A browser fetches no face that no text uses, so check that the cold-load report shows none of them.
- Width-matched fallback. Ideas row 125 measured the layout shift caused by Oswald arriving late (docs/v0.2.6-ideas.md, row 125). With the font delayed 1.5 s, against ddd9a37, the score went from 0.014 to 0.047 at 375, from 0.025 to 0.046 at 390, and from 0.057 to 0.108 at 360. Measure the same way, with and without a size-adjusted local fallback for Oswald. Ship the fallback only if it lowers the score, and changes nothing once the real face has loaded.
- The offline and single files (plan 7.4). Today the offline file links Google Fonts, so it is not offline for type.
  - Neither file may contact any host after this PR.
  - For each face the first edition's offline page renders (Oswald, Inter and IBM Plex Mono 500 and 600), either inline it in the file or let it fall back to a system face, and say which.
  - The plan's recommendation for the end state is to inline Oswald, Plex Mono 500 and Caslon 400 only.
  - Measure dist-offline/index.html and dist-single/index.html before and after.
  - Add fonts.googleapis.com and fonts.gstatic.com as markers in scripts/scan-offline-bundle.ts, and pin them in its test.
- Studio (studio/) keeps its Google Fonts. It is not a reader's page, and it is not in this PR.

4. THE RUNNER AND THE SMOKE, AFTER SELF-HOSTING.
- The host gate. FONT_HOSTS in scripts/rendered-contrast.mjs allows fonts.googleapis.com and fonts.gstatic.com. Ruling 9 makes both foreign, so remove them: the online and offline host gates then become same-origin. Tests that expected those hosts to pass must now expect them to fail: tests/requestHosts.test.ts, and the font examples in tests/coldLoad.test.ts. This is a strengthening, not a weakening; say so in the PR, and keep a cross-host redirect case in coldLoad with a host that is still foreign.
- The smoke. These three items were carried forward from PR 0's review cycle, and they reach main at the release. In scripts/vercel-smoke.mjs:
  - startTags skips the contents of <template> and <noscript>;
  - a tag name runs to whitespace, / or >, so <button.x …> is not a button;
  - the contract comment above ROUTES states the threat model: the scan trusts React's escaping, so a PR that adds raw HTML to a smoke route hardens the scan first.
  Pin each case in tests/vercelSmoke.test.ts, shown red, then green. Keep the Previous contract exactly as Beni ruled it (R3): a <button> whose accessible name is exactly "Previous", in the server HTML of "/" only.

PROOF THAT NOTHING ELSE CHANGED. The plan says nothing renders differently in PR 1, so the matrix is a smoke pass. Self-hosting can still change glyphs, if a file's version or subset differs from what Google served. So:
- run PR 0's runner (web/scripts/evidence.mjs) in report mode at main and at your head, with all three origins set, and each server's working directory confirmed with lsof;
- compare every cell's capture pixel for pixel;
- report each cell that differs, and why. None should differ.
Report mode must exit 0. The contrast baseline is unchanged apart from any difference you have explained. --enforce still exits 1 on the 16 loss-pip samples only (R2: PR 4 repaints the pip).

VERIFICATION, GREEN AT EVERY COMMIT.
- Root: npm run typecheck, npm test (both vitest projects), build, build:single, build:offline and the offline-bundle scan.
- web/: typecheck, test, build, check:client and check:css. check:css reads web/generated/shell.css; say what it now checks of your fonts.
- The tailwind-scan guards stay green.
- Reader parity is not expected to hold in this PR. Run web/scripts/check-reader-parity.mjs against a build of the integration branch's base, and list every file that differs, and why.
- The smoke checker through scripts/n6b-proof.mjs against a local Next production build, on every route.

EVIDENCE FOR THE PR BODY (plan section 3, PR 1's line; plan 8.3, row 1).
- Every measured pair and the five failing pairs, with each test's mutation receipt.
- Each font file's size, and the total per page.
- The cold-load request report at 390 and 1000 on each tab, in both apps. The only host is the page's own, and no unused face is fetched.
- The layout-shift scores at 360, 375 and 390, with and without the fallback, set beside ideas row 125's.
- The offline and single files' sizes, before and after.
- The pixel comparison of the cells.
- The runner's summary in both modes.
- The parity listing.
- Each place the repository disagreed with this brief.

THE PR.
- Branch cursor/overhaul-pr1-tokens, opened into overhaul/second-edition. Commit as Cursor <cursoragent@cursor.com>.
- Make small commits that each stay green, in this order: the tokens; the pair tests; the font files with their licences and records; loading in both apps, the harness pages and the offline file; the host gate and the offline scan markers; the smoke hardening.
- Title: "Overhaul PR 1: tokens and type".
- No CHANGELOG edit: the release PR writes v0.6.0's section.
- Rollback is a revert of the merge commit on the integration branch, and no reader notices it.
- Do not merge, do not enable auto-merge, do not bump, do not tag. Your gh is Beni's account, an Admin who can bypass the verify gate, so this brief is what stops you: no force-push, and no change to rulesets, repo settings, workflows or any other PR. Never run npm run sync.

DELIBERATELY NOT IN THIS PR.
- Any component or markup change, and any use of an fb- token.
- The imprint band, the motion control and Moments' repaint, which are PR 2.
- R1's unsettled-row clocks (PR 3), and the loss pip (PR 4).
- Caslon's preload, which waits for the PR that first sets text in it.
- The foil ground capture in the contrast sampler, which waits for the first PR that renders foil text.
- Studio's fonts.
- The privacy copy, which N5 writes and which stays parked; it will say that fonts are served from this site.
- A ruleset for the integration branch, which is Beni's.
````
