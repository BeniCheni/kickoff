# ⚽ Kickoff

[![CI](https://github.com/BeniCheni/kickoff/actions/workflows/ci.yml/badge.svg)](https://github.com/BeniCheni/kickoff/actions/workflows/ci.yml)
[![version](https://img.shields.io/badge/version-0.5.2-1d4ed8)](CHANGELOG.md)
[![license](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)
[![stack](https://img.shields.io/badge/stack-Next.js%20%C2%B7%20Supabase%20%C2%B7%20pgvector%20%C2%B7%20R2-0f172a)](#-how-it-is-wired)
[![built with](https://img.shields.io/badge/built%20with-Claude%20Code-D97757)](CLAUDE.md)
[![built with](https://img.shields.io/badge/built%20with-Codex-000000)](https://openai.com/codex/)
[![built with](https://img.shields.io/badge/built%20with-Cursor-7c3aed)](docs/moments-player-plan-review.md)

```
╔════════════════════════════╗
║ ╦╔═ ╦ ╔═╗ ╦╔═ ╔═╗ ╔═╗ ╔═╗  ║
║ ║║  ║ ║   ║║  ║ ║ ║   ║    ║
║ ╠╩╗ ║ ║   ╠╩╗ ║ ║ ╠╣  ╠╣   ║
║ ║ ║ ║ ║   ║ ║ ║ ║ ║   ║    ║
║ ╩ ╩ ╩ ╚═╝ ╩ ╩ ╚═╝ ╩   ╩    ║
╠════════════════════════════╣
║ NEVER A CONFIDENT LIE      ║
╚════════════════════════════╝
```

**A football fixtures tracker that would rather admit what it doesn't know than tell you a
confident lie. Then it grew a studio, a database and a video store, and learned to publish
AI-generated cat footballers under the same rule: say what it is, never claim more, and let a
human sign. It's also an open notebook on how one person ships software with three AI vendors
building, reviewing and rebutting each other's work.**

You don't need to follow football to read this repo. The football is the excuse. The
interesting part is the workflow: every line of the app was written by an AI coding agent,
every feature and fix goes through a pull request that a *different* vendor's agent reviews
cold, the builder gets to argue back in writing, and a human rules on whatever is still
contested. (The scheduled sync's own data PRs are the one exception: they merge themselves
once CI is green.) The paper trail for all of that is in this repo, PR by PR.

| If you want | Go here |
|---|---|
| Live GitHub demo page | **[benicheni.github.io/kickoff](https://benicheni.github.io/kickoff/)** |
| Live full-stack milestone, the Vercel demo app *(Vercel sign-in required for now)* | **[kickoff-git-main-beni-von-chenis-projects.vercel.app](https://kickoff-git-main-beni-von-chenis-projects.vercel.app/?tab=moments)** |
| How three AI vendors build one repo | [How it gets built](#-how-it-gets-built) |
| Why a fixtures app has a motto | [Why this exists](#-why-this-exists) |
| Architecture | [Architecture — the map, and the data flow](docs/ARCHITECTURE.md) |

> **The straight answer on what's live.** The GitHub demo is the Vite app on GitHub Pages:
> fixtures, standings and three lenses, redeployed on every merge. If the amber banner is up
> when you get there, that's not a bug; that's the whole pitch. The full-stack version is the
> Next.js app on Vercel, and today it sits behind Vercel's own sign-in, which is why that link
> asks you to log in first. The Moments pictures below were captured from it, the clip was made
from the file it plays, and the three Studio pictures come from the Studio's own stub-mode
proof run. Its public
> cutover is a numbered plan, not a promise with a date, and `v0.5.2` is still the latest
> release.

<p align="center">
  <img src="docs/media/superhero-kitties.gif" width="320" alt="Superhero Kitties: fifteen seconds of generated video. Four cats in capes and bodysuits line up in a floodlit stadium, then play football, and end in a group hug around the ball.">
  <br>
  <sub><i>Superhero Kitties</i> · 15 s · made in Grok Imagine, published through the Studio, served from Cloudflare R2.<br>6 fps and 320 px here to keep the repo light; the real clip is 1920 × 1088.</sub>
</p>

## 🎲 Why this exists

### Act I · the bets

This repo exists because **Claude and I bet on European football.** (Small stakes, a coin flip
of a sample size, the variance undefeated. Let's not ruin a good story with statistics.)

The bets were never threatened by bad picks. They were threatened by bad data. The operation
ran on a hand-typed HTML dashboard, lovingly maintained and quietly wrong. When we audited it
on 23 August 2026, about twenty rows were false:

```
┌────────────────────────────┐
│ AUDIT SLIP · 23 AUG 2026   │
│ DASHBOARD v. THE LEAGUES   │
├────────────────────────────┤
│ Ligue 1's opening matchday │
│ ............ ONE DAY EARLY │
│ Bundesliga, the opener     │
│ ............ SIX HOURS OFF │
│ A fixture nobody scheduled │
│ ............ DID NOT EXIST │
│ PSG–Rennes, relocated      │
│ ....... WRONG TEAM AT HOME │
├────────────────────────────┤
│ FALSIFIED ROWS .. ABOUT 20 │
│ SLIP ................ VOID │
└────────────────────────────┘
```

The PSG–Rennes line is the one to sit with. The league moved the match to the other team's
stadium, the dashboard kept the old home side, and if you had money on the home team, you
were now on the wrong team. None of those were rendering bugs. They were *provenance* bugs,
and no model, however charming, can out-reason a fixture list that lies to it.

So the fix got carved over the door: **fixture data is generated and diffed, never typed.**
Nobody hand-edits a kickoff time in this repo. A script fetches, validates, snapshots and
diffs; a human reads the diff.

### Act II · the second confident lie

Then the repo got a second job, and the lie got better.

A wrong kickoff time is a clumsy lie: somebody can check it against the league. Generated
video is a fluent one. A cat in a cape, kicking a football under floodlights in a stadium that
does not exist, looks like footage until something says otherwise. So the rule that guards
kickoff times crossed the border into video, and it became a second line on the door:

```
┌────────────────────────────┐
│ THE HOUSE RULES            │
├────────────────────────────┤
│ DATA IS GENERATED, DIFFED, │
│ NEVER TYPED.               │
│                            │
│ VIDEO IS GENERATED,        │
│ LABELLED, SIGNED FOR BY A  │
│ HUMAN, AND NEVER PASSED    │
│ OFF AS REAL.               │
└────────────────────────────┘
```

That is why the video side of Kickoff has a checklist before a clip can be kept, a recorded
EU AI Act Article 50 answer before it can be published, a `Generated` label that can't be
filtered away, and made-up viewers that say they are made up. Both halves are built to hold
their rule, and both are covered below.

## ⏱️ What it does today

### ⚽ The football app

Fourteen competitions: the five big domestic leagues (La Liga, the Premier League, Serie A,
Ligue 1, the Bundesliga), the three UEFA club competitions (Champions League, Europa League,
Conference League) and the six super cups. 1,440 fixtures and six league tables as of 21
October 2026, synced from ESPN's public scoreboard and read through three visual "lenses"
over one fixture skeleton. The pictures below are the live GitHub demo, captured that day at
a 390 px phone width.

<p align="center">
  <img src="docs/screenshots/2026-10-21/football-poster-light.jpg" width="230" alt="The Poster lens on a phone, light theme: the next matchday, Thursday 22 October, with 36 matches, as a full-bleed hero above the first kickoffs">
  &nbsp;
  <img src="docs/screenshots/2026-10-21/football-ledger-light.jpg" width="230" alt="The Ledger lens: a date-spine calendar with a Next up strip">
  &nbsp;
  <img src="docs/screenshots/2026-10-21/football-broadcast-dark.jpg" width="230" alt="The Broadcast lens, dark: a marquee ticker and a floodlight glow on the next kickoff">
</p>

What the app refuses to do is the feature:

- **Two clocks from one instant.** Every kickoff is stored once, as a UTC instant. The stadium
  clock and the Brooklyn clock are derived from it, so they cannot disagree.
- **Unknowns stay unknown.** A kickoff the league hasn't set reads "not yet set". A stadium
  whose time zone isn't known reads "local time not known". Nothing is guessed to look tidy.
- **Every sync is diffed.** A moved date, a changed kickoff, a swapped home side, a fixture that
  vanished, a corrected score: each is named in the pull request the sync opens, so it
  surfaces instead of rotting.
- **Staleness is a state.** The header says when the data was synced; a banner turns amber at
  a day old and red at three.
- **The table tells you what it can't compare.** "2 clubs have a game in hand — sort by PPG."

<p align="center">
  <img src="docs/screenshots/2026-10-21/football-table-1000.jpg" width="720" alt="La Liga's table at desktop width in the Ledger lens: matchday banner, European qualification bands, points per game, form and next fixture">
</p>

The full argument — the UTC instant, the diff engine, the fail-loud guards, staleness as a
state — is in **[docs/HONESTY.md](docs/HONESTY.md)**.

### 🎬 Moments: the generated-video gallery

Moments is the third tab, and it is where the video lives. It started as a plan to link out to
match footage; on 12 October 2026 that plan was dropped for generated-only video, and the tab
was rebuilt as a full-stack feature. Here is its team sheet, from both ends of the pipe:

```
╔════════════════════════════╗
║ TEAM SHEET · MOMENTS       ║
╠════════════════════════════╣
║ AS A VIEWER I CAN          ║
║  1 open a gallery where    ║
║    every clip says it was  ║
║    generated               ║
║  2 watch one, muted first, ║
║    and unmute when I like  ║
║  3 find similar moments    ║
║  4 poke the reactions and  ║
║    read the comments       ║
║    (made up, and it says)  ║
╠════════════════════════════╣
║ AS THE CURATOR I CAN       ║
║  1 import a Grok Imagine   ║
║    clip                    ║
║  2 walk the five-point     ║
║    check, line by line     ║
║  3 sign the Article 50     ║
║    answer in my own words  ║
║  4 press Publish           ║
╚════════════════════════════╝
```

**The viewer's side.** The gallery filters by subject (the two cats the whole gallery is built
around, Fenway and Frankenstein), orders by Beni's order or newest generated, and keeps a saved
list in your browser. Every card carries the `Generated` badge and the date it was generated,
and shows the length and an editorial note (here, "Made by Grok Imagine") when the record has
them. The watch page plays the clip muted from R2 with an Unmute button beside
the player, a Theater mode, a copy-link button, and a cancellable countdown to the next clip
when there is one. The first clip is *Superhero Kitties*: four cats, a stadium, a football.

<p align="center">
  <img src="docs/screenshots/2026-10-21/reader-gallery-390-dark.jpg" width="230" alt="The Moments gallery on a phone, dark: a card for Superhero Kitties with a stadium thumbnail of four cats in capes, the Generated badge, 0:15, made by Grok Imagine, and a Save reference button">
  &nbsp;
  <img src="docs/screenshots/2026-10-21/reader-watch-390-dark.jpg" width="230" alt="The watch page, dark: a cat in a red cape dribbling a football, 'Playing muted. Unmute beside the player.', and the five reaction buttons">
  &nbsp;
  <img src="docs/screenshots/2026-10-21/reader-watch-390-light.jpg" width="230" alt="The watch page, light, at the end of the clip: the four cats in a group hug around the ball, with the native player controls and a note that this was the last video, so nothing loops">
</p>

**The crowd is cardboard, on purpose.** The reactions, the view counts and the comments under
a clip are synthetic. The database writes them, with `setseed()` and `generate_series`, from
fictional viewers with kind, cat-and-football handles; every row is flagged `synthetic` by a
database check, and the page carries a label wherever they show:

```
┌────────────────────────────┐
│ SAMPLE REACTIONS AND       │
│ COMMENTS · MADE-UP VIEWERS,│
│ NOT REAL ONES              │
└────────────────────────────┘
```

They exist to sketch the interface of social features Kickoff may grow one day, so there is
something real to design and test against, and not to suggest an audience. Your own taps stay
on the page ("Your reactions stay on this page and aren't saved"), and a Production deployment
refuses the sample layer outright.

<p align="center">
  <img src="docs/screenshots/2026-10-21/reader-comments-390-dark.jpg" width="230" alt="The comment thread on the watch page, dark: made-up viewers such as stripedscarf and yarnball with short comments like 'A tiny celebration after a tiny goal', each with Like and Reply buttons">
</p>

**The curator's side.** None of that appears by itself. Every clip comes through the Studio,
a local admin that runs on one Mac (the header says `127.0.0.1 · THIS MAC ONLY`) and shows,
at the top, whether it is talking to a stub or to the real services. The three screens below
come from the Studio's own proof run: stub transport, a local PGlite database and a fictional
clip, so what you see is the interface and not the live catalog.

<p align="center">
  <img src="docs/screenshots/2026-10-21/studio-import-1280-light.jpg" width="720" alt="The Studio's Import screen: choose an MP4 and a JPEG keyframe, type the prompt, pick Fenway or Frankenstein, then 'Read the file' shows width, height, duration, frame rate, audio and that Strip will remove udta and meta">
  <br>
  <sub><b>1 · Import.</b> The Studio reads the file's own facts, says what Strip will remove, and keeps the prompt exactly as it was typed into Grok.</sub>
</p>

<p align="center">
  <img src="docs/screenshots/2026-10-21/studio-review-1280-dark.jpg" width="720" alt="The Studio's Review screen, dark: the clip in a native player on the left; on the right, the review checklist: extra players or officials, text on boards, shirts or screens, logo-like or crest-like marks, the subject's identity and posture, and the soundtrack, each Clear, Present or Unsure, with Keep and Discard buttons">
  <br>
  <sub><b>2 · Keep.</b> Five questions, each answered Clear, Present or Unsure. Keep needs five Clear.</sub>
</p>

<p align="center">
  <img src="docs/screenshots/2026-10-21/studio-publish-gate-1280-dark.jpg" width="720" alt="The Studio's Publish screen, dark: the Publication gate for Article 50 with an empty answer, disclosure, recorded-by and source form, and a disabled Publish button that says it is unavailable until the Article 50 answer is recorded">
  <br>
  <sub><b>3 · Sign, then Publish.</b> The Publish button stays disabled, and says why, until an Article 50 answer is on file.</sub>
</p>

Here is the same journey as a data flow, from the Grok Imagine tab to a phone:

```
   GROK IMAGINE  (by hand)
          │ clip + keyframe
          ▼
┌────────────────────────────┐
│ 1 · IMPORT                 │
│ read the file's own facts, │
│ strip metadata, hash it    │
├────────────────────────────┤
│ 2 · KEEP                   │
│ five checks, all CLEAR     │
├────────────────────────────┤
│ 3 · SIGN                   │
│ the Article 50 answer, in  │
│ words, with a name on it   │
├────────────────────────────┤
│ 4 · PUBLISH                │
│ gate re-checked in the DB  │
└──────┬──────────────┬──────┘
       ▼              ▼
 ┌───────────┐  ┌───────────┐
 │ Supabase  │  │Cloudflare │
 │ Postgres  │  │    R2     │
 │ catalog + │  │ video and │
 │ CLIP      │  │ thumbnail │
 │ vectors   │  │           │
 └─────┬─────┘  └─────┬─────┘
       └──────┬───────┘
              ▼
  READER · Next.js · Vercel
  read-only role, server-side
              ▼
      you, on a phone
```

The Article 50 gate is enforced twice, in the Studio and in the database, so a bug in one
cannot publish a clip the other would refuse. At the whistle the Studio prints one line, which
is worth reading before you trust it:

```
┌────────────────────────────┐
│ FULL TIME                  │
│ published live=true        │
│ database=postgres          │
│ storage=r2                 │
│ embedding=written          │
└────────────────────────────┘
```

(One line in the terminal, wrapped here. It names where the clip went and whether its vectors
were written, so a fallback can't pass for the real thing.)

**Similar moments** are the last step. At publish time each clip gets CLIP embeddings, one
from its keyframe and one from its title and note, stored with pgvector. The model runs on the
Studio's machine, never in a web request. The reader asks Postgres for a clip's nearest
neighbours, and the vectors never leave the database: the reader's role can read the two
catalog views and the three sample-layer views and call two similarity functions, and nothing
else. A published clip shows up on the
next page load, and a clip whose vectors are missing is simply left out of the rail until
`embed --backfill` heals it.

## 🧱 How it is wired

| Piece | What it is |
|---|---|
| `src/` | The GitHub demo: Vite + React 19, static, on GitHub Pages |
| `web/` | The reader: Next.js 16, on Vercel, behind Vercel Authentication |
| `studio/` | The admin and CLI: Node, Drizzle, `@huggingface/transformers`, PGlite for tests |
| `packages/` | `@kickoff/catalog` (the public row contract) and `@kickoff/demo` (the sample layer) |
| Supabase · R2 | Postgres with pgvector for the catalog and the vectors · Cloudflare R2 for video and thumbnails |

The delivery pipeline is boring on purpose. `verify` is the one required check, Vercel skips
the builds a change provably doesn't affect (it always builds `main`, and builds whenever it
can't tell), and after each successful deployment a smoke test requests four fixed routes
through the protected preview with an automation bypass, checks the deployed commit and the
snapshot's digest, and scans those responses for a leaked secret. The setup, step by step, is in
[`web/README.md`](web/README.md) (the Vercel preview) and [`studio/README.md`](studio/README.md)
(the Studio and its commands); the map and the data flow are in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 🤖 How it gets built

This is the part I'd read first if I weren't a football person.

**Nobody types the code.** As of 21 October 2026 the repo carries 1,327 passing tests (965
for the public app, 120 for the reader, 242 for the Studio, one skipped), a scheduled data
sync that opens and merges its own pull requests, and 241 merged PRs, of which the sync opened
a large share itself. Every line was written by a coding agent under a written spec. Branch
commits carry the author who wrote them, and recent squash-merge messages credit every agent
that touched the PR.

**Most versions climb a ladder of up to four documents**, all archived in [`docs/`](docs/README.md):
a *proposal* (an audit of the repo plus directions), a *design brief* (run against the
design system), a *build spec* (the prompt the coding agent executes) and a *review prompt*.
Some versions skipped a rung, and the archive's index says which. Each document is generated
from a fresh read of the repo, never from anyone's recollection of it.

**Every feature and fix gets a cross-vendor review.** (The scheduled sync's data PRs skip it
and merge on a green `verify`.) A release built by one vendor's agent is reviewed cold by
another vendor's agent, in six passes:

| Pass | Who | What they leave behind |
|---|---|---|
| 0 · Brief | The product-manager seat | The review prompt, with the builder's claims sealed in an appendix marked "verify independently" |
| 1 · Cold review | The vendor that did **not** build it | Findings it reproduced, fix commits, one PR comment |
| 1.5 · Rebuttal brief | The PM seat | Each finding packaged for the builder to accept, contest, or accept-but-contest-the-characterisation |
| 2 · Rebuttal | The builder | Its answers, in code |
| 2.5 · Synthesis | A seat that wrote neither the build nor the fixes | Every number re-run at the tip, and a merge gate |
| 3 · Adjudication | A human | Rules on whatever is still contested, and clicks merge |

Why bother with a rebuttal? Because on the first full run the builder overturned the reviewer
on a live technical claim: the reviewer said a malformed team id "can only miss the join"; the
builder reproduced the opposite, one team borrowing another's standings row, and fixed it.
One reviewer would have merged that. The cycle has run on the full-stack work too: the Vercel
pipeline was built by Codex, cold-reviewed twice by Claude Code, and merged on a human's word.

**The seats are routed by what a mistake would cost, not by brand:**

| Seat | Who sits in it |
|---|---|
| Product manager / scoping / the prompts | Claude (Cowork, then Claude Code) |
| Builder | Cursor (Grok 4.7) and Codex (GPT-6 and 6.1), by task shape and by quota |
| Cold reviewer, Pass 1 | Claude Code (Fable 5.1, extra effort) |
| Synthesis and merge, Passes 2.5 to 3 | Codex (GPT-6.1 Sol), on a human's word |
| Designer | Claude Design, against the *Fergie Time* design system |
| CEO | A human, who rules on every contested point and every release |

**Design gets the same treatment.** The Moments gallery went through three rounds of
functional prototypes (R1 to R3) and then the D-series design cycles (D1 to D9), each sealed
with a checksum manifest and each cold-reviewed by a different agent than the one that drew it. One
review measured 1,080 prototype cells and found a player column that would have been 353px
wide on an iPad, below YouTube's stated minimum. That finding became a ruling, and the ruling
became a line in the build spec.

**Verification is measured, never admired.** A review is not "it looks fine". It's 72 browser
cells compared byte-for-byte against `main` to prove a dormant feature changed nothing
visible; 720 cells of gallery geometry with 16,830 hit-tests; a fix reproduced red against the
commit before it and green after. Screenshots are set to a viewport before capture and checked
for horizontal overflow, because one clipped screenshot once cost a whole review pass proving a
bug that didn't exist.

The repo skills that encode all this: [`/kickoff-pr-review`](.claude/skills/kickoff-pr-review/)
runs the six-pass cycle; [`kickoff-design-studio`](.agents/skills/kickoff-design-studio/) and
[`kickoff-design-review`](.agents/skills/kickoff-design-review/) do the same for design.

## 📍 Where we are

**Shipped, and public** (`v0.5.2`): fixtures, standings, the three lenses, the scheduled sync
with its self-merging PRs and change digest, and the Champions League with computed matchday
provenance and venue clocks (v0.5.0).

**Built since, not yet released.** The full-stack work lands as non-releases, because the
public site doesn't change until the cutover:

- **The Studio:** its core and the Supabase schema (#187), Grok Imagine import, the Card gate
  and R2 storage (#226), the local web admin (#227), live import and the engine's gate in
  Publish (#230), and CLIP embeddings with pgvector (#235).
- **The reader:** the Next.js shell, then Fixtures and Table, with the public app's pixels
  compared cell by cell (#198, #203, #206), the shared catalog contract (#212), the Moments
  gallery and watch page (#217), sample reactions and comments (#225), the live read path
  from Supabase (#231) and the Similar moments rail (#237).
- **The pipeline:** a Vercel preview that skips builds a change provably doesn't affect and
  smoke-tests itself after each successful deployment (#236).

**Next:** a Shorts feed whose next clip is a random pick among the nearest neighbours, and
a like button whose likes live only in the visitor's browser and shape a "For you" shelf; a
privacy page; then the cutover that makes the Next app the public one, with the Pages address
redirecting. Each step is in [`docs/nextjs-migration-plan.md`](docs/nextjs-migration-plan.md)
and its rulings in [`docs/moments-pivot-record.md`](docs/moments-pivot-record.md).

## 🥅 Try it

The [demo](https://benicheni.github.io/kickoff/) needs nothing. To run it yourself you want
Node 24 (24.15 or later; 22.22.2 or later 22.x, or any 26+, also clears jsdom 30's floor):

```bash
npm install
npm run dev              # localhost:5173, hot reload
npm test                 # vitest, two projects: pure layer under node, component wiring under jsdom
npm run typecheck
npm run build            # static bundle in dist/
npm run sync -- --check  # fetch ESPN, diff against the snapshot, write nothing
```

The fixture snapshot is committed, so the app works offline from a clone. `npm run sync`
refreshes it from ESPN's public scoreboard API (no key, no account) and prints what moved,
kind by kind. It writes to the repo, so read [the commands and the one merge-conflict
recipe](docs/ARCHITECTURE.md#commands) first. The data flow and the two ESPN traps worth
knowing about are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

The full-stack half needs accounts and keys, so it is a runbook rather than a quick start:
[`web/README.md`](web/README.md) for the reader and its Vercel preview, and
[`studio/README.md`](studio/README.md) for the Studio. Everything in them runs offline against
a local PGlite database until you pass `--live`.

Lens, tab, week and filters all live in the URL — `?lens=broadcast&tab=table` means what it
says — so any view survives a reload and can be sent to someone. Found a fixture the app gets
wrong? That's this repo's signature issue; there's a
[template](.github/ISSUE_TEMPLATE/wrong-fixture-data.md).

## 🏆 Lineage

One subject line per release. The honours board:

- **v0.5.2** *(17 Sep 2026)* — hotfix to the hotfix: the 30-day lookback restored so the app keeps its recent results.
- **v0.5.1** *(17 Sep 2026)* — hotfix: ESPN's date-range API broke; the sync switched to day-by-day fetching.
- **v0.5.0** *(12 Sep 2026)* — the Champions League joins the schedule: 144 league-phase fixtures, matchday provenance, venue clocks with honest unknowns, a 36-club table, and Moments as an empty-first third tab.
- **v0.4.1** *(12 Sep 2026)* — the small print tells the truth too: every sync warning and red-run outcome says what actually happened.
- **v0.4.0** *(11 Sep 2026)* — the sync tells the whole truth: corrected scores and team identities reported, quiet checks publish verified freshness.
- **v0.3.2** *(9 Sep 2026)* — the sync's verify step survives a live match.
- **v0.3.1** *(8 Sep 2026)* — the Table tells the time like every other lens; the sync merges itself once `verify` is green.
- **v0.3.0** *(6 Sep 2026)* — snapshot states say what is known; the six-pass review cycle is born.
- **v0.2.5** *(5 Sep 2026)* — the resilience patch: fixtures and standings publish together, failed views recover.
- **v0.2.4** *(5 Sep 2026)* — tests reach the wiring: a jsdom project beside the node suite.
- **v0.2.3** *(4 Sep 2026)* — a hotfix: workflows on Node 24.
- **v0.2.2** *(4 Sep 2026)* — the front door: Poster by default, a hero that tells the time, these docs.
- **v0.2.1** *(3 Sep 2026)* — the review becomes a command.
- **v0.2.0** *(2 Sep 2026)* — the app learns to tell time: a clock that ticks, a sync that fails loudly, a scheduled refresh that opens its own PR.
- **v0.1.1** *(1 Sep 2026)* — the public-repo milestone: security sweep, license, CI.
- **v0.1.0** *(31 Aug 2026)* — the lens system: Ledger, Poster, Broadcast over one skeleton.
- **v0.0.2** *(26 Aug 2026)* — the Table: full standings synced from ESPN.
- **v0.0.1** *(23 Aug 2026)* — the rewrite: generated-and-diffed data replaces the hand-typed dashboard.

Every proposal, design brief, build spec, review prompt and executive brief behind those lines
is indexed in [docs/README.md](docs/README.md). The design system they're built against
(*Fergie Time* — yes, really) is still in the tunnel, unreleased until it earns its debut.

## ⚖️ License and the small print

[MIT](LICENSE). Not betting advice — the only edge this repo guarantees is a correct kickoff
time, and honestly, that's the one your model can't live without. If you do bet: be of legal
age, in a legal market, with money you can afford to lose. The variance is undefeated.

The generated video is AI-made and labelled as such. The reactions and comments beside it are
made up and labelled as such. The stack choices (Next.js, Drizzle, Supabase, pgvector, CLIP,
Cloudflare, Vercel) follow the shape of ByteByteGo's *Rebuild YouTube with AI* course. Its
reference repo declares no licence, so patterns were studied and no code was copied.
