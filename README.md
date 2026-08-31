# Kickoff

Big-5 European football fixtures and standings, in Brooklyn time. Built to answer two
small questions many times a day — *who plays tonight, and when is that for me?* — and to
answer them without ever telling a confident lie. It supports the betting work in
`../Sportsbooks/`, where a wrong kickoff time is not a cosmetic bug.

**v0.1.0** — La Liga, Premier League, Serie A, Ligue 1, Bundesliga, their domestic super
cups and the UEFA Super Cup and European cups; full standings; and one fixture skeleton
read through three lenses.

## The mission

Every football app knows the fixtures. Almost none will tell you what it *doesn't* know.
Kickoff is that inversion: a tracker whose first loyalty is to the provenance of its data.
Every kickoff traces to one stored UTC instant. Every unset time is admitted out loud.
Every sync is diffed against the last one. Every snapshot carries its timestamp, so the
app can warn you when it has grown old — and it does, in amber, right under the wordmark.

The house rule, which has survived every redesign: **never a confident lie.**

The project replaced a hand-maintained dashboard whose audit (23 Aug 2026) found ~20 wrong
rows: an entire Ligue 1 opening matchday a day early, a Bundesliga opener six hours off,
one fixture that never existed, and PSG–Rennes with the wrong team at home after the LFP
relocated it — which inverts the moneyline. None of those were rendering bugs. They were
provenance bugs. So provenance is what the architecture addresses.

## How it gets there

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
  their kickoff, because the app can no longer know.

## One skeleton, three lenses

v0.1.0's idea: the fixture list is one instrument, and a **lens** is the volume knob — not
a different product. A lens may change the atmosphere (default theme, leading accent), the
day-header scale, the row density, and the hero element at the top of Fixtures. Everything
else — tabs, filters, chips, the two-clock rendering, provenance and staleness callouts,
competition colors, the Table, the footer — is invariant across all three.

- **Ledger** (default): a date-spine calendar in the Table's quiet language — 30px day
  numerals, hairline rows, tap-to-expand detail, and a four-card "Next up" strip.
- **Poster**: editorial loudness confined to day headers and a full-bleed "tonight's
  slate" hero, railed in the day's dominant competition color. Rows stay Ledger rows.
- **Broadcast**: the stadium screen — dark-first (with a remembered light override),
  floodlight amber promoted to the leading accent, a 36s marquee ticker of live/next/FT,
  and a glow on exactly the rows that deserve it. Nothing else glows.

Both themes exist in every lens; a lens only chooses its default. Lens, tab, view, date
and filters all live in the URL (`?lens=broadcast&tab=table` means what it says), so any
view survives a reload and can be sent to someone.

## Commands

```bash
npm run dev            # dev server with HMR
npm run sync           # refresh fixtures + standings; exits 1 if something near-term moved
npm run sync -- --check   # report changes without writing
npm test               # vitest
npm run typecheck      # tsc -b
npm run build          # static bundle in dist/
npm run build:single   # one self-contained dist-single/index.html, opens by double-click
```

`sync` accepts `--from=YYYY-MM-DD` and `--to=YYYY-MM-DD`; the default window is −30 to
+150 days.

## Layout

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

## Data source

ESPN's public scoreboard and standings APIs — no key, no auth.

```
GET site.api.espn.com/apis/site/v2/sports/soccer/{code}/scoreboard?dates=YYYYMMDD-YYYYMMDD
```

Two traps worth knowing:

1. **It caps responses at 100 events and does not say so.** A four-month range for La Liga
   silently returns only the first 100 fixtures. The provider requests the window in
   28-day chunks and warns loudly if any chunk comes back at the cap.
2. **Some venue strings are wrong.** Rayo Vallecano's home fixtures are currently tagged
   with Leganés's ground. Venue is cosmetic here and is not corrected by hand —
   hand-correcting generated data is the habit this project exists to break. A second
   provider is the durable fix.

Fixture ids are the provider's own event id, namespaced by competition — *not* built from
team names: a season contains both legs of every pairing, and a name-derived id makes the
reverse fixture look like an inversion of the first.

## Roadmap

**v0.1.1** is scoped from the v0.1.0 review — the ranked list lives in
[docs/v0.1.1-ideas.md](docs/v0.1.1-ideas.md). The headline candidates:

- **A clock that ticks.** Every "now" is currently captured at page load; a tab left open
  overnight keeps yesterday's Today pill and a frozen ticker. The pure layer already takes
  `now` as an argument everywhere — it's waiting for a hook that supplies a fresh one.
- **An error boundary**, so no malformed input is ever a white screen again.
- **Sync statuses that fail loudly** — an ESPN status the mapper doesn't know should never
  quietly become "scheduled".
- **A component test rig** (jsdom beside the node suite), so keyboard behavior and URL
  hooks get the coverage the pure selectors already enjoy.

**Beyond**: betting overlays that join `positions.json` on fixture ids (the
token-expiry-vs-kickoff map is the obvious first feature); a second data provider that
cross-checks ESPN and surfaces disagreement rather than averaging it; a Results tab — the
tab row already leaves it room.

## Lineage

- **v0.0.1** — the rewrite: generated-and-diffed data replaces the hand-typed dashboard.
- **v0.0.2** — the Table: full standings synced from ESPN, Fixtures ↔ Table navigation.
- **v0.1.0** — the lens system: Ledger, Poster, Broadcast over one skeleton; both themes
  everywhere; month grid as navigation; hardened by an adversarial review (see
  `docs/v0.0.3-*.md` for the design cycle's paper trail, which kept its working name).
