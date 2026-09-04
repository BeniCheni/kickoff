# ⚽ Kickoff

[![CI](https://github.com/BeniCheni/kickoff/actions/workflows/ci.yml/badge.svg)](https://github.com/BeniCheni/kickoff/actions/workflows/ci.yml)
[![version](https://img.shields.io/badge/version-0.2.1-1d4ed8)](CHANGELOG.md)
[![license](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)
[![built with](https://img.shields.io/badge/built%20with-Claude%20Code-D97757)](CLAUDE.md)

**Big-5 European football fixtures and standings, in Brooklyn time — from a tracker that
would rather admit what it doesn't know than tell you a confident lie.**

> *"Who plays tonight, and when is that for me?"* — asked many times a day,
> answered without ever getting burned.

## 🍸 The confession

Fine, LinkedIn, you dragged it out of me: this repo exists because **Claude and I bet on
European football.** Claude has been an exemplary partner in crime — reads the lines,
remembers La Liga's head-to-head tie-breakers, never orders anything at the bar, splits
the winnings zero ways. The profits have been *juicy* (the sample size is a coin flip and
variance never sleeps, but let's not ruin a good LinkedIn post with statistics 📈).

Here's the part that's actually true enough to build software on: **the bets were never
threatened by bad picks. They were threatened by bad data.** For a while the operation ran
on a hand-typed HTML dashboard, lovingly maintained, quietly wrong. Then we audited it
(23 Aug 2026) and the rap sheet came back with ~20 falsified rows:

- 🗓️ an entire Ligue 1 opening matchday sitting **one day early**
- ⏰ a Bundesliga opener **six hours off**
- 👻 one fixture that **did not exist** — never scheduled by anyone, ever
- 🔄 PSG–Rennes with **the wrong team at home** after the LFP relocated it — which, if
  you're keeping score at home, *inverts the moneyline* 💸

None of those were rendering bugs. They were **provenance** bugs — and no model, however
charming a co-conspirator, can out-reason a fixture list that lies to it. So the partner
in crime built the fix, and the house rule got carved over the door:

### **Never a confident lie.**

## 🧭 What it does (v0.2.1)

La Liga, Premier League, Serie A, Ligue 1, Bundesliga, their domestic super cups and the
UEFA Super Cup; full league standings; and one fixture skeleton read through three lenses.
Every kickoff traces to one stored UTC instant. Every unset time is admitted out loud.
Every sync is diffed against the last one — and since v0.2.0 the sync runs itself twice a
day, at midnight and noon Brooklyn time, opening a pull request a human still reads before
it lands. Every snapshot
carries its timestamp, so the app warns you — in amber, right under the wordmark — when its
own data has grown old; and the clock behind that warning ticks, so a tab left open
overnight rolls over honestly instead of quietly showing yesterday.

## 🔒 How it stays honest

Fixture data is **generated and diffed, never typed.**

- **The stored fact is a UTC instant** (`kickoffUtc`), not a date plus a local time
  string. Stadium-local and Brooklyn clocks are both *derived* from it, so they cannot
  disagree with each other or with the source. Storing them separately is what let a whole
  matchday sit one day early with nothing to contradict it.
- **Every sync diffs against the previous snapshot** and reports what moved — dates,
  times, venues, status, home/away swaps — exiting non-zero when something within 72 hours
  changed. A relocation surfaces instead of rotting.
- **An unset kickoff stays unset.** Fixtures where the league has fixed the date but not
  the hour render as "kickoff time not yet set by the league" in amber italic — never as a
  confident number. No matchday numbers are invented either; the provider exposes none.
- **The snapshot is committed**, so git history is the fixture-change audit trail.
- **Staleness is a first-class state.** The data's age escalates from a quiet note to a
  warning banner; a snapshot's frozen "live" matches stop claiming LIVE a few hours after
  kickoff, because the app can no longer know. Every one of those clocks ticks (v0.2.0):
  the Today pill, the next kickoff, the Broadcast glow and the banner all move on their own,
  and a tab that was asleep catches up the moment it wakes.

## 🔭 One skeleton, three lenses

The fixture list is one instrument; a **lens** is the volume knob, not a different
product. A lens may change the atmosphere (default theme, leading accent), the day-header
scale, the row density, and the hero element at the top of Fixtures. Everything else —
tabs, filters, chips, the two-clock rendering, provenance and staleness callouts,
competition colors, the Table, the footer — is invariant across all three.

| Lens | The mood | Signature moves |
|------|----------|-----------------|
| 📒 **Ledger** *(default)* | The accountant | Date-spine calendar in the Table's quiet language: 30px day numerals, hairline rows, tap-to-expand, a four-card "Next up" strip |
| 🎞️ **Poster** | The editorial desk | Loudness confined to day headers and a full-bleed "tonight's slate" hero, railed in the day's dominant competition color. Rows stay Ledger rows |
| 📺 **Broadcast** | The stadium screen | Dark-first (with a remembered light override), floodlight amber promoted to lead accent, a 36s marquee ticker of live/next/FT, and a glow on exactly the rows that deserve it |

Both themes exist in every lens; a lens only chooses its default. Lens, tab, view, date
and filters all live in the URL — `?lens=broadcast&tab=table` means what it says — so any
view survives a reload and can be sent to someone.

## 🚀 Quick start

```bash
npm install
npm run dev            # dev server with HMR at localhost:5173
npm run sync           # refresh fixtures + standings; exits 1 if something near-term moved
npm run sync -- --check   # report changes without writing
npm test               # vitest
npm run typecheck      # tsc -b
npm run build          # static bundle in dist/
npm run build:single   # one self-contained dist-single/index.html, opens by double-click
```

`sync` accepts `--from=YYYY-MM-DD` and `--to=YYYY-MM-DD`; the default window is −30 to
+150 days.

## 🗺️ The map

```
src/lib/schema.ts          Zod schemas + the Fixture type. Identity lives here.
src/lib/time.ts            Timezone rendering. Formats instants; never parses wall-clock.
src/lib/competitions.ts    Competition metadata: colors, zones, US broadcasters, codes.
src/lib/fixtures.ts        Loads and validates the snapshot; grouping and query helpers.
src/lib/standings.ts       The league tables, same provenance rules.
src/lib/lens.ts            The lens type and its total URL codec.
src/lib/lensSelectors.ts   Pure per-lens data shaping (heroes, ticker, month cells).
src/lib/theme.ts           The one theme decision + guarded storage. Broadcast dark-first.
src/lib/urlCodecs.ts       Total decoders for ?date= and ?only= — junk never crashes.
src/lib/useUrlState.ts     View state in the query string; push vs replace semantics.
src/components/            The skeleton: one FixtureRow, week/month views, lens heroes.
src/data/*.json            GENERATED by `npm run sync`. Do not hand-edit.
scripts/providers/espn.ts  Fetch + normalize, behind a FixtureProvider interface.
scripts/diff.ts            Snapshot comparison. The safety net.
scripts/sync.ts            Orchestrator: fetch → validate → preserve notes → diff → write.
tests/                     DST boundaries, the normalizer, lens plumbing, honesty guards —
                           one case per audited bug class, and per reviewed one.
```

## 📡 Data source

ESPN's public scoreboard and standings APIs — no key, no auth, no secrets anywhere in
this repo (independently reviewed; see PR #4).

```
GET site.api.espn.com/apis/site/v2/sports/soccer/{code}/scoreboard?dates=YYYYMMDD-YYYYMMDD
```

Two traps worth knowing:

1. **It caps responses at 100 events and does not say so.** A four-month range for La Liga
   silently returns only the first 100 fixtures. The provider requests the window in
   28-day chunks and refuses to write from any chunk that comes back at the cap, rather
   than trusting a list that might be truncated.
2. **Some venue strings are wrong.** Rayo Vallecano's home fixtures are currently tagged
   with Leganés's ground. Venue is cosmetic here and is not corrected by hand —
   hand-correcting generated data is the habit this project exists to break. A second
   provider is the durable fix.

An ESPN status this app doesn't recognize (a delay, a suspension, an abandonment) also
refuses to write rather than defaulting to "scheduled," and a league whose fetched count
falls implausibly short of its last snapshot is treated as a broken response, not a real
collapse. All three are "fail loudly" guards: an unattended sync should never invent
scheduledness or silently disappear real fixtures.

Fixture ids are the provider's own event id, namespaced by competition — *not* built from
team names: a season contains both legs of every pairing, and a name-derived id makes the
reverse fixture look like an inversion of the first.

`npm run sync` also runs on a schedule (`.github/workflows/sync.yml`, twice a day at
midnight and noon ET — an hour earlier once EST starts, because GitHub's cron is UTC) — it
never pushes straight to `main`. It opens or updates one pull request carrying the diff
report, and that PR is never auto-merged: the data feeds real bets, so a human reads what
moved before it lands.

## 🤖 How this repo is actually built

Kickoff is an AI-driven codebase in the boring, disciplined sense rather than the
press-release one. The standing brief lives in [CLAUDE.md](CLAUDE.md); every version moves
through a four-document prompt ladder — audit proposal → design brief → implementation
spec → **adversarial review** — and whatever a cycle wrote is archived in [`docs/`](docs/),
receipts and all (not every cycle wrote all four: v0.1.0's has no proposal, v0.2.0's no
design brief or build spec, and the archive says so rather than pretending). Review sessions
receive prior findings only as a sealed "verify independently" appendix, never as
conclusions, which is how v0.1.0's review caught real bugs instead of nodding along; since
v0.2.1 that review method is a repo skill, `/beni-pr-review`, diffed like code instead of
retyped per release. Commits are authored by Claude; typecheck and tests are green at every
one of them; data-honesty assertions are never weakened to make a redesign pass.
The design system it's built against (*Fergie Time* — yes, really) is still
in the tunnel, unreleased until it earns its debut.

## 🧭 Roadmap

**v0.2.0** took rows 1, 3 and 13 of [docs/v0.2.0-ideas.md](docs/v0.2.0-ideas.md) — the
paper trail is [docs/v0.2.0-proposal.md](docs/v0.2.0-proposal.md). The current ranked list is
[docs/v0.3.0-ideas.md](docs/v0.3.0-ideas.md), and the plan that turns it into releases —
three patches, then v0.3.0 — is in [docs/v0.2.1-proposal.md](docs/v0.2.1-proposal.md). Next up:

- **A component test rig** (jsdom beside the node suite), so the clock's component wiring,
  keyboard behavior and URL hooks get the coverage the pure layer already enjoys — v0.2.2,
  first, so what follows ships with tests instead of browser-only proof.
- **An error boundary**, so no malformed input is ever a white screen again — v0.2.3.
- **The stale LIVE pill** — a designed state for "kicked off, outcome unknown to this
  snapshot", the one surface where a frozen `in_play` can still claim liveness.
- **Auto-merging an empty sync report** — defensible only once the diff engine also reports
  result corrections and team-name changes, its two blind spots today.

**Beyond**: betting overlays that join `positions.json` on fixture ids (the
token-expiry-vs-kickoff map is the obvious first feature); a second data provider that
cross-checks ESPN and surfaces disagreement rather than averaging it; a Results tab — the
tab row already leaves it room.

## 📜 Lineage

- **v0.0.1** *(23 Aug 2026)* — the rewrite: generated-and-diffed data replaces the
  hand-typed dashboard.
- **v0.0.2** *(26 Aug 2026)* — the Table: full standings synced from ESPN, Fixtures ↔
  Table navigation.
- **v0.1.0** *(31 Aug 2026)* — the lens system: Ledger, Poster, Broadcast over one
  skeleton; both themes everywhere; month grid as navigation; hardened by an adversarial
  review (see `docs/v0.0.3-*.md` for the design cycle's paper trail, which kept its
  working name).
- **v0.1.1** *(1 Sep 2026)* — the public-repo milestone: security sweep, housekeeping,
  license, CI, and this README.
- **v0.2.0** *(2 Sep 2026)* — the app's relationship to time: a clock that ticks, a sync that
  fails loudly instead of guessing, and a scheduled refresh that opens its own PR but never
  merges it. See [CHANGELOG.md](CHANGELOG.md) and `docs/v0.2.0-proposal.md`.
- **v0.2.1** *(3 Sep 2026)* — the review becomes a command: `/beni-pr-review` lands as a repo
  skill, the sync PR's held check approves itself (the fix that shipped between releases), and
  how a release gets scoped is written down, with the plan for the rest of the v0.2.x train.
  See `docs/v0.2.1-proposal.md`.

## ⚖️ License & the small print

[MIT](LICENSE). Not betting advice — the only edge this repo guarantees is a correct
kickoff time, and honestly, that's the one your model can't live without. If you do bet:
be of legal age, in a legal market, with money you can afford to lose. The variance is
undefeated. 🍀
