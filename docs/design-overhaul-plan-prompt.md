# Kickoff design overhaul — the plan-only brief for building Fergie Time's second edition into Fixtures and Table (archived Sat 14 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Sat 14 Nov 2026 at about 8:30 PM, from main at
`9b0417e`, and delivered in chat; this copy is the archive. It was first written for Cursor (Grok
4.7 Extra High); before it was fired, Beni moved the planning seat to Claude Code on Fable 5.2 at
Extra High, keeping Cursor as the builder and Codex as the synthesis seat.
That evening Beni put the Cosmic Horror revamp ahead of the cutover, on Fixtures and Table only,
and parked N5 and the rest of the Moments and Studio work while he rethinks the user journey. He
then chose a plan before any build brief. The
revamp-first ruling amends D3's sequence ("the overhaul's build follows N7") and the migration
plan's freeze of the look across the cutover. The brief carries the second edition's handoff as
it stood after the review of 13 Nov, with its four questions still open for Beni and its four
gaps still unworked.

---

````text
Kickoff design overhaul — the build plan for Fergie Time's second edition on Fixtures and Table (plan only; Claude Code, Fable 5.2 Extra High)

You are the planning seat for the design overhaul in github.com/BeniCheni/kickoff, in a fresh Claude Code session on Fable 5.2 at Extra High, opened in Beni's main checkout, /Users/benicheni/code/kickoff-pm. You plan; you do not build. Cursor (Grok 4.7 Extra High) is expected to build from your plan, so write it for a builder who did not plan it and has not seen this brief. The PM seat (Claude Code, Opus 5.5) wrote this brief on Sat 14 Nov 2026 at about 8:30 PM (TZ=America/New_York) from main at 9b0417e, and scores your plan; because the PM seat is also Claude, it re-checks every repo claim at its cited line rather than taking any on trust.

OUTPUT STYLE. This session may have started in the Learning output style, which is Beni's default. Ignore it for this task: make no Learn-by-Doing request, add no TODO(human), and put no insight box in the plan.

SANDBOX. In the desktop app's Bash sandbox, `git worktree add` and `remove`, `git fetch`, `gh` and the test runners fail or stall; run those commands with the sandbox off. The sandbox also injects `GIT_CONFIG_*` variables, so a claim of "no Git override" needs a run outside it. Headless Chrome via the repo's own puppeteer-core (web/scripts/clearing.mjs) is allowed for measurements in your worktree.

Your job is a written plan and nothing else: no code, no branch, no commit, no PR, no account action, no image generation, no deploy. The PM seat scores it against the criteria at the end, which are fixed before your run. Beni then answers its questions, and only then does the PM seat write the build briefs. A plan comes first because the work is large (new tokens, three type families, the Rack, photographs, a WebGL layer, a motion control, Ledger listing the whole week), every merge to main deploys the public site, and the design still has open questions.

Run `TZ=America/New_York date` before writing any date. Write the plan to the local output directory as `overhaul-plan.md`, and put evidence and notes in its `evidence/` subdirectory. Write it section by section in the order below, saving after each; if you run low, stop at a section boundary and say what is missing.

Rulings this plan carries. They are settled; do not reopen them. Read each at its source.
- **Revamp first (Beni, Sat 14 Nov 2026, about 8:20 PM).** The overhaul is built before the Next.js cutover (N7), on Fixtures and Table only. It amends D3's "the overhaul's build follows N7" and the migration plan's freeze of the look across the cutover (docs/design-overhaul-proposal.md "Sequence, and a conflict to rule on"). N5 and the rest of the Moments and Studio work are parked while Beni rethinks the user journey. This ruling is not yet in any tracked file; the PM seat records it with this plan's archive.
- **The overhaul's rulings**, in docs/design-overhaul-proposal.md "Rulings received": the direction (develop B, 11 Nov); Poster trimmed (12 Nov); no coded prototype in Pen (13 Nov); D9, the new look across the whole app with fixed inks (13 Nov); and the cold review's D2 to D14, "as recommended" (13 Nov): D2 evoke, never cite or borrow; D4 the Table takes the skin with its structure untouched; D5 Moments takes the shell and the tokens and nothing else; D6 money is a motif, never a real figure, and the pay-out board stays fenced; D7 one persisted motion control for the whole app; D8 live type, with effects around the letters, never on them; D10 Ledger always lists every fixture of the week, and the betting pipeline's Step 0 moves to `&lens=ledger` when the build ships; D11 the Rack holds the week's matchday books in order plus the Register; D12 no row ordinals; D13 the cover names the next matchday's first fixtures; D14 photographs under a separate asset licence, not MIT, each with provider, model and prompt recorded.
- **The second edition's answers (13 Nov):** questions 1, 2, 4, 5, 6, 8, 9, 10, 12 and 13 accepted as drawn; 7, amber has eight uses; 11, every stadium clock reads "20:30 local", never a zone abbreviation, with "local time not known" in amber; 17 closed; and the cover's lower band follows kickoff order on a day that mixes groups. The handoff lists them in its section 11.
- **The clearing (v0.5.5, 14 Nov):** two lenses, Poster then Ledger; no Monthly view; no Broadcast or Where to Watch; one theme key.
- **v0.5.4 (14 Nov):** `after_extra_time` and `after_penalties` are finals of their own, shown as AET and PENS with the shootout in brackets; `suspended` and `abandoned` are stored statuses.
- **Still standing:** Kickoff's hard rules (CLAUDE.md: never render a kickoff time the league has not set, never invent a matchday number or any value, both clocks from one UTC instant, amber only for data trust, data-honesty tests never weakened); Step 0's contract (`?only=` and `&date=`); the sync's snapshot boundary and auto-merge; the one required `verify` check; SP6, the full-stack work as non-releases, and the cutover planned as v0.6.0; `src/index.css` and `src/lib/competitions.ts` as the token source of truth; the Fergie Time Design System, the Pen files, the Claude Design canvas and the handoff stay out of the repo.
- **Precedence:** Beni's rulings, then the Claude Design boards, then the handoff, then the build spec. The handoff ranks itself above the boards; this repo's rule is template over brief. Note every place they disagree.

Still open, and Beni's, not yours: the handoff's question 3 (the wordmark: Abril Fatface or Oswald), 14 (record the seven Pen-made photographs with the model marked unknown, or regenerate them), 15 (the two missing covers, a second Champions League night and a domestic midweek, which would spend fal credit) and 16 (a person's full-size look at the Friday cover's silhouettes and the fog plate's parked car). Still needing work: 18 (the filter panel and Zones & key, opened, never drawn), 19 (the title swap at 1.45 s, watched on a phone), 20 (no phone benchmark) and 21 (how long a tapped cover takes to grow into its book; the spike drew 600 ms, outside the 150, 180 and 220 ms state budget). Carry each one; recommend; decide none.

Hard limits:
- **No repo or GitHub writes of any kind**, and no PR comments. Read in a detached worktree you create and remove.
- **No request to fal, Vercel, Supabase, Cloudflare, Claude Design or any account API.** Generate nothing. Public documentation may be read; cite it with its URL and the date read.
- **The design files are read-only and never copied into the repo:** ~/.pencil/documents/kickoff-revamp-b2/ (exports/handoff/, images/, fal/provenance.jsonl, the .glsl files) and ~/Documents/Claude/Projects/Fergie Time Design System/. Do not open the .pen file, not even through the pencil MCP; the exports carry what you need, and no tool call may risk writing to the design file.
- No real money figure anywhere. Nothing names or copies a King or Hill character, town, title or object.
- You may run the existing root, web/ and studio/ tests in your worktree after `npm ci` from the committed lockfiles. Install nothing new. Never run `npm run sync`.

Setup (set `KICKOFF_PLAN_DIR` and `KICKOFF_PLAN_WORKTREE` to separate local paths outside the repository):

```bash
git -C /Users/benicheni/code/kickoff-pm fetch origin
git -C /Users/benicheni/code/kickoff-pm worktree add --detach "$KICKOFF_PLAN_WORKTREE" origin/main
mkdir -p "$KICKOFF_PLAN_DIR/evidence"
```

When you finish, remove the worktree with `git -C /Users/benicheni/code/kickoff-pm worktree remove --force "$KICKOFF_PLAN_WORKTREE"`.

Read:
- **The design.** `21-second-edition-handoff.md` in the Pen handoff exports, whole; the board exports 01 to 19 beside it (03 to 08 and 10 to 19 are the templates; 90 to 92 are fenced or reference only); 20-fal-picks.md and 21-pen-source-prompts.md.
- **The record.** docs/design-overhaul-proposal.md, whole, including "The Rack — the cover carousel" (from line 576) with its platform table; docs/design-overhaul-review.md and its decisions; docs/design-overhaul-design-prompt.md and docs/design-overhaul-design-fix-prompt.md.
- **The app.** src/index.css, src/lib/competitions.ts, src/App.tsx, src/components/ (AppHeader, TabNav, LensSwitcher, FilterBar, CompetitionChip, FixturesPage, PosterWeek, WeekView, TonightSlate, NextUpStrip, LedgerWeek, FixtureRow, MatchdayLines, StalenessBanner, TablePage, MomentsEmpty), src/lib/lensSelectors.ts, src/lib/theme.ts, src/lib/useThemeController.ts, src/lib/urlCodecs.ts, index.html, offline.html, vite.config.ts, and the tests under tests/ and tests/dom/ that pin data honesty.
- **The Next app's share of it.** web/src-allowlist.mjs, web/app/layout.tsx, web/app/shell.tsx, web/app/globals.css and web/app/moments/ (D5's fence), and web/scripts/clearing.mjs (the 96-cell runner).
- **The rules of the house.** CLAUDE.md (verification discipline, Step 0, release management); README.md "How it gets built"; docs/v0.2.6-ideas.md rows 125 to 131; docs/nextjs-migration-plan.md §7's parity rule (lines 296–311).

Every claim about the repo cites a file and line at 9b0417e. Every claim about the design cites the handoff's section or the board's file name. Every vendor or browser claim cites its URL and the date read, tagged DOCUMENTED, or UNVERIFIED.

What the plan must contain, in this order:
1. **The map.** For each second-edition component in the handoff's section 5 (page chrome, the books, rows and states, page controls, the Table) and each template in section 6 (Poster, Ledger, Table, Quiet week, UEFA week, States sheet, Moments shell), name what in src/ it replaces or reskins, what is new, and what retires, with file and line. Then list what the handoff did not draw that the app shows today: at least the AET and PENS rows with the bracketed shootout (v0.5.4, which the handoff predates), suspended and abandoned rows, the staleness banner, the heroes' empty state (row 126), "1 MATCHES" (row 129), the filter panel and Zones & key (gap 18), and the offline file. Say for each whether it needs a board from Claude Design or follows from the tokens.
2. **How it reaches the public site.** Every merge to main deploys Pages, the sync auto-merges to main daily, and the Next preview shares src/ through the allowlist. Lay out at least: (a) an integration branch with each PR reviewed into it, merged to main once as the release; (b) dark on main behind a flag, switched on at release; (c) piece by piece on main, each PR a public change. For each give its cost under the daily sync, the six-pass review per PR, Step 0 reading the live site, and N7's parity proof, and recommend one. The release is a minor under one subject line; the number is Beni's (see section 9).
3. **The split into PRs.** In the order prerequisites land: for example tokens and type, then the chrome and the motion control, then Poster's books and the Rack, then Ledger's whole week, then the Table's skin, then states, then imagery with its licence, then the WebGL layer behind the phone benchmark. For each PR: what changes, what stays as it is, the evidence, its rollback, and its seats under the six-pass 360 (`/kickoff-pr-review`): Cursor builds; a fresh Claude Code Pass 1 in a session that is not this one; Cursor's Pass 2; a synthesis by Codex; Beni's word to merge. If you judge a PR better built by another seat, say so and why.
4. **Assets and their licence.** Where the photographs live (committed with a separate asset licence, or served from elsewhere), their formats (AVIF with a WebP fallback, art-directed crops), sizes and weight budgets, how each carries its provider, model and prompt (D14, with question 14 open), the "ILLUSTRATIVE" captions and the foot that says the photographs are generated, and the licence file. Fonts: the three families, their licences, and self-hosting against today's Google Fonts links, with what each choice does to the network a reader's browser contacts. Any new browser-storage key (the motion control's persisted state) and what the future privacy copy must then say.
5. **Motion and the WebGL layer.** Map the handoff's section 8 onto code: one raw-WebGL canvas per visible region and one pipeline, no new runtime dependency; text and digits as live type above it; stills chosen before first paint under reduced motion; the motion control (D7, WCAG 2.2.2) and the Rack's Stop as its mirror; the WCAG 2.3.1 gate; one requestAnimationFrame clock; hidden tab and out-of-view stops; the state budget kept at 150, 180 and 220 ms. Propose how gaps 19, 20 and 21 are settled: the phone benchmark (16.7 ms a frame at 60 Hz, past it or without WebGL the stills), the cover-grow duration, and the title swap, each with its device, method and pass mark.
6. **Data honesty and Step 0.** How every honesty rule survives the new look, with the tests that pin it: no clock for an unset kickoff; both clocks from one instant; "20:30 local" and "local time not known"; amber's eight uses; the matchday line's computed and amber forms; the row order and the cover band's kickoff order; the book that closes on real results; AET, PENS, suspended and abandoned. No data-honesty assertion is weakened. Then D10: the Ledger lists the whole week, and Step 0 moves to `&lens=ledger` when the build ships; `?only=` and `&date=` must keep working in both lenses; the pipeline skill's owning copy in Beni's local Sportsbooks project changes at release, not before. Say when and how that edit is made.
7. **The Next app and the cutover.** What the Next preview inherits through the allowlist, what web/'s own CSS needs, how D5's fence holds for Moments, how the offline file (`build:offline`, kept by N0-Q2) carries or omits photographs and motion, and how N7's parity proof is re-baselined on the new look.
8. **Evidence per PR.** The matrix in each app: 3 tabs × 2 lenses × 2 themes × 360, 375, 390 and 1000 px = 48 base cells, plus the States sheet's states, the Quiet week and the UEFA week; the viewport set before every capture; `scrollWidth === innerWidth`; contrast measured on the rendered page, over the photographs and scrims, for every new ink and paper pair; reduced motion and the motion control; the phone benchmark; image and font weight; the offline file. Say which checks a script runs (extend web/scripts/clearing.mjs rather than start again) and which need a person.
9. **Questions for Beni.** Each answerable in one word, your recommendation first, with the cost of each answer. At least: how it reaches the public site; the split; question 3, the wordmark; question 14, the photographs' record; question 15, the missing covers (any fal spend is approved by Beni in the session that spends it); question 16, the full-size look; where the photographs live and under which licence; fonts self-hosted or not; when Step 0 moves to `&lens=ledger`; whether rows 126 and 129 fold in; and the version number. On the number, state the fork and what each answer does to the cutover's planned v0.6.0, and recommend nothing: the number is Beni's.
10. **Risks, unknowns and Not verified,** each with the cheapest test that would settle it, including WebKit and a real phone, page weight on a phone connection, and contrast over photographs. Also: what is deliberately not done, every new user-facing string listed for Beni's approval (taglines, captions, the quiet week's lines, the day note), and anything you could not confirm.

How the PM seat will score it (fixed before your run):
- **Repo claims.** Every one checks out at its cited line at 9b0417e.
- **Design claims.** Every one matches the handoff section or board it cites.
- **Vendor and browser claims.** Every one has its URL and date, and is tagged.
- **Nothing settled is reopened,** above all D2, D4, D5, D6, D10, D14, the eight amber uses, "20:30 local" and the clearing.
- **Every honesty rule survives,** with a named test, and nothing invents a value.
- **The map is complete,** including what the handoff did not draw.
- **The route to the public site** is explicit, and the recommendation says what a reader sees after each merge.
- **Open questions stay open.** The plan recommends and Beni decides; the number is not picked.
- **Every PR** has evidence, a rollback and its seats.
- **The questions are one-word,** with recommendations.

Finish in chat with three lines for Beni:
- where the plan is;
- its recommended path, in one sentence;
- the number of questions it asks him.
````
