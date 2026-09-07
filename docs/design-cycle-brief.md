# Claude Design brief — the stale-LIVE state, the AA debts, the marquee

> Historical input record, committed by the design-cycle build. The Claude Design spec
> supersedes this brief. Its status family has five entries; LIVE's accent fill belongs to
> the pill; the ticker reads the whole snapshot; Poster focus-ring debt does not reproduce.
> The governing Item 3 is empty/approximate NEXT, not speed or the reduced-motion control.
> See `docs/design-cycle-proposal.md` for the resolved implementation and scope.

Generated in Cowork 5 Sep 2026, from a fresh read of `main` at `8498726` (v0.2.5). Every value
below was read from a file in that session; nothing is recalled. Run this against the **Fergie
Time** design system project.

## What Kickoff is, in one paragraph

A Big-5 European football fixtures and standings tracker rendered in Brooklyn time. Its data is a
committed JSON snapshot refreshed by a scheduled job, and its whole promise is **honest time**: it
never renders a kickoff the league has not set, never invents a match minute, and derives the
stadium-local and Brooklyn clocks from one UTC instant so they cannot disagree. Three lenses
(Ledger, Poster, Broadcast) render the same data at different loudness. Public repo:
`https://github.com/BeniCheni/kickoff`. Live: `https://benicheni.github.io/kickoff/`.

The design system is the source of the *language*; `src/index.css` and `src/lib/competitions.ts`
are the source of the *tokens*. The DS mirrors them, never the reverse.

## The brief covers three rows, and nothing else

From `docs/v0.3.0-ideas.md`. Row 3 shipped in v0.2.2 and row 11's NEXT-day qualifier shipped in
v0.2.5 — both struck in the file. What remains:

- **Row 4 — FixtureRow's stale-LIVE treatment.** The headline. Needs a designed state.
- **Row 10 — palette-level AA debts.** Four named contrast failures wanting text-safe variants.
- **Row 11 (remainder) — the marquee's fixed duration and the inert pause control.**

## Row 4 — the state that does not exist yet

### The exact asymmetry, from the code

`src/lib/lensSelectors.ts` gates the Broadcast ticker and the hot-row glow on `believablyLive`:

```
const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000
function believablyLive(f, nowUtcIso) {
  return f.status === 'in_play' && Date.parse(nowUtcIso) - Date.parse(f.kickoffUtc) <= LIVE_WINDOW_MS
}
```

`src/components/FixtureRow.tsx` does not:

```
in_play: 'LIVE',            // STATUS_LABEL
fixture.status === 'in_play'  // pill styling, no clock read
```

So four hours and one minute after a kickoff that the snapshot froze at `in_play`, the ticker has
stopped saying LIVE, the glow has stopped, and **the row still wears the LIVE pill.** That is the
last surface in the app claiming a liveness the data cannot support. The four-hour window is
deliberate and documented — long enough to clear any stoppage time, short enough not to promise
what a static snapshot cannot know.

### The design question

There are three states, and the app currently renders two of them:

1. **Scheduled** — no pill.
2. **Live, and believably so** — the LIVE pill.
3. **Kicked off, outcome unknown to this snapshot** — currently rendered as (2). This is the state
   to design.

State 3 is not an error and not a warning. It is honest ignorance: the match started, the snapshot
has not been refreshed since, and the app does not know the score or whether it has finished. The
treatment should read as *the app declining to claim* rather than *something went wrong*.

Open questions the brief hands you, deliberately undecided:

- **Label.** Does the pill change text, change weight, or vanish and leave something else? "LIVE?"
  and "LIVE (stale)" both editorialise. The repo's voice elsewhere is plain and declarative —
  `docs/HONESTY.md` and the existing "kickoff time not yet set by the league" line are the register
  to match.
- **Colour.** The LIVE pill is `bg-accent text-white` (dark: `text-bg`), `broadcast:bg-floodlight`.
  Does state 3 desaturate, hollow out to an outline, or move to the `bg-line text-ink-muted`
  treatment that FT already uses? Note FT means *finished and known*; state 3 means *unknown*, so
  sharing FT's treatment would flatten a real distinction.
- **Does it differ per lens?** Ledger is quiet, Poster is large, Broadcast is loud with a glow.
  Broadcast already withholds its glow from a stale row via `hotFixtureIds`, so the row is
  *already* half-designed there — the pill is the inconsistency.
- **Does the row say anything more?** A second line already exists for placeholder kickoffs
  (`kickoff time not yet set by the league`, `text-floodlight italic`). A parallel line is
  available if the pill alone cannot carry it.

### What is settled and must not reopen

- **The four-hour window itself.** It is tested and reasoned in `lensSelectors.ts`. This brief
  designs what happens *after* it expires, not what the number should be.
- **No invented match minute, ever.** The snapshot carries none. A design that implies elapsed time
  is out of bounds.
- **The Table screen.** Untouched by this brief.
- **Token values.** See row 10 — those are a separate, explicit ask.

## Row 10 — the four named AA debts

Real tokens, read from `src/index.css` this session:

| Light (`:root`) | Value | Dark (`[data-theme='dark']`) | Value |
|---|---|---|---|
| `--bg` | `#f7f5ee` | `--bg` | `#0e1c15` |
| `--surface` | `#ffffff` | `--surface` | `#142a1f` |
| `--text` | `#16211b` | `--text` | `#e7efe9` |
| `--text-secondary` | `#55614f` | `--text-secondary` | `#a9b9ac` |
| `--text-muted` | `#8a9284` | `--text-muted` | `#6e8074` |
| `--pitch` | `#2c7a4b` | `--pitch` | `#56c083` |
| `--floodlight` | `#c98a00` | `--floodlight` | `#f7c948` |
| `--accent` | `#d85a30` | `--accent` | `#f7a864` |

The four debts, as the ideas file names them:

1. **Light `--floodlight` (`#c98a00`) as small text.**
2. **`--text-muted` (`#8a9284`) on cream (`--bg` `#f7f5ee`).**
3. **Light `--accent` (`#d85a30`) as a 9px fill** — this is the LIVE pill itself, which ties row 10
   to row 4.
4. **Competition hex colours on dark** — `src/lib/competitions.ts` carries one colour per
   competition, used for the marquee bar and the meta line.

**The precedent to follow is already in the file.** v0.2.2 solved exactly this shape once:

```
[data-lens='broadcast']:not([data-theme='dark']) {
  --accent-lead-strong: #966700; /* floodlight deepened to 4.5:1+ on --bg and --surface */
}
```

A text-safe variant per theme, named `-strong`, scoped where it is needed, with the ratio it
achieves written in the comment. Extend that pattern rather than inventing a second one.

**Deliver measured ratios, not adjectives.** Every proposed value comes with its computed contrast
against the specific background it sits on, and the WCAG level it clears (AA normal 4.5:1, AA large
3:1, AA non-text 3:1). A swatch without a number cannot be reviewed.

**Repainting the base tokens is a design-system decision, not a component fix.** If a debt can only
be cleared by moving `--floodlight` itself, say so explicitly and flag it — do not do it silently.

## Row 11 (remainder) — the marquee

Two items, both in `src/components/TickerStrip.tsx` and `src/index.css`:

- **Fixed 36s duration.** `animation: ticker-scroll 36s linear infinite` regardless of track width,
  so a two-segment night crawls and a fifteen-segment night races. Constant px/s is the obvious fix
  — the design question is what that constant should *be*, in a readable range, and whether the
  ticker has a minimum and maximum duration beyond which it stops scaling.
- **The pause control under reduced-motion.** `@media (prefers-reduced-motion: reduce)` renders the
  ticker static, but the pause affordance still renders and does nothing. Hiding it is the obvious
  answer; confirm that hiding it does not break the WCAG 2.2.2 mechanism the comment cites, since a
  static ticker arguably needs no pause at all.

## Real sample data — use these, labelled

From `src/data/meta.json` and `src/data/fixtures.json` at `8498726`:

- `lastSyncAt`: **2026-09-04T21:34:14.215Z**
- Total fixtures: **1007**
- Status split: **898 scheduled, 109 full_time, 0 in_play**
- Time confidence: **570 exact, 437 round_placeholder**

**Note the zero.** There is no `in_play` fixture in the current snapshot, so row 4's state cannot be
screenshotted from real data — any artboard showing it is **ILLUSTRATIVE** and must be captioned as
such. That is not a gap in the brief; it is the honest state of the data, and it is exactly why this
row needs a designed answer rather than an observed one.

Also worth designing against: **437 of 1007 fixtures carry a placeholder kickoff.** Whatever state 3
looks like, it will sit in lists dense with the existing italic "time not yet set" line.

## Artboards wanted

1. **FixtureRow, three states × three lenses** — scheduled / believably-live / stale-live, in
   Ledger, Poster and Broadcast. Light theme.
2. **The same, dark theme.** Broadcast's glow behaviour differs and the competition hexes are debt
   #4 here.
3. **A dense list in context** — one stale-live row among scheduled rows and placeholder rows, so
   the state is judged in company rather than in isolation.
4. **The AA debt sheet** — each of the four debts, current value and proposed variant, with measured
   ratios against the named background.
5. **The marquee** — a short track and a long track at the proposed constant speed, annotated with
   px/s and the resulting durations; plus the reduced-motion rendering.

Viewports: **390px is the judge, 360px the jury**, with a ~1000px check. That is the repo's
standing matrix.

## Honesty rules that bind this brief

- **Never design a state that implies knowledge the snapshot lacks** — no elapsed minutes, no
  progress indication, no "probably finished".
- **Anything invented is captioned ILLUSTRATIVE.** The stale-live artboards are all illustrative by
  necessity.
- **Contrast claims carry numbers.** "Improved" is not reviewable.
- **Say what you chose not to do, and why.** The repo's `CHANGELOG.md` has a "Deliberately not done"
  heading on every release; that habit starts here.

## Handoff format

The implementation prompt is written straight from your output, so it needs:

1. **Per state: the token or class, not a colour picture.** `bg-line text-ink-muted` is
   implementable; "muted grey" is not.
2. **Per AA fix: variable name, value, scope selector, measured ratio, background.** Following the
   `--accent-lead-strong` precedent exactly.
3. **The lens deltas as CSS variants.** `FixtureRow` takes no lens prop by design — differences are
   `poster:` / `broadcast:` variants, and a design needing a new prop is a finding to state, not to
   assume.
4. **What you deliberately did not decide**, so the implementation prompt does not silently invent
   it.

Precedence for whatever follows: **template > design brief > implementation prompt.** Your output
outranks the build.
