# Claude Design brief — the European week, the league-phase table, the Moment gallery

> Historical input record for the UCL league-phase design cycle. **The release number for this
> cycle is open** (the canvas's not-decided item (f); Beni rules at Round 3) and this file claims
> none. The design canvas supersedes this brief on every point where they differ — precedence is
> **design system template > design brief > implementation prompt** — and the transcription of the
> canvas is `docs/design-cycle-ucl-spec.md`.

## Provenance of this archive

The brief was generated in the Football/Soccer Claude project as `claude/kickoff-ucl-design-prompt.md`
and was **not available to the Round 1 review session** that wrote this file (8 Sep 2026): it is not
in this repo, and a search of the machine's Claude project folders found no copy. What follows is
therefore the brief *as the artifacts that consumed it describe it* — the canvas's own restatement
(artboard 1h and the header block) and the Round 1 prompt — not the brief's text. When Beni pastes
the original, it replaces this section and the summary below verbatim; the provenance note stays.

## What the brief asked for (as restated by the canvas and the Round 1 prompt)

Three items, and nothing else:

1. **The European week as a first-class citizen.** A Champions League matchday on the Fixtures
   tab in all three lenses, judged in company with a mixed domestic weekend. Sub-question B: whether
   the competition chip or the day carries the identity. Item 1's matchday question had three
   options: (1) show no matchday, (2) derive it from UEFA's published windows and say so,
   (3) read a round string from the provider.
2. **The league-phase table.** Thirty-six rows and three regions (1–8, 9–24, 25–36) in the Table
   tab, under Fergie Time hard rule 6 — the Table's language extended, not restyled, with the five
   domestic tables unchanged.
3. **The Moment gallery.** Beni's three categories — Pre-match, Highlights, Celebrations — as a
   hand-curated content class; three shapes were on the table (typographic, linked still, in-app
   playback).

Its precedence line — design system template > design brief > implementation prompt — governs the
cycle, and it asked for a handoff section: the brief archived into `docs/` under a name that does
not claim a release number, the design spec beside it, and the ideas rows the cycle consumes struck
through in place.

## What the brief inherited as settled (and the review kept closed)

The three-lens system with Poster as default and no fourth lens; the two-clock rendering from one
`kickoffUtc`; hard rule 6; the motion budget (150 ms ease, 180 ms cubic-bezier(.2,.7,.2,1), 220 ms
ease, plus the marquee); the shape-and-line rules (4px corners, full pills, 1px hairlines, 1.5px
controls, 3px rails, `inset 0 -2.5px 0` on the active tab); the four colour voices with amber
reserved for data-trust provenance; the four-hour LIVE window (v0.3.0); the `?only=` and `&date=`
URL contract the betting pipeline's Step 0 reads; and the 390 px judge, 360 px jury, ~1000 px
desktop check.

## The claim the brief carried in

The canvas leads with a blocking finding attributed to Beni's curl check — that ESPN publishes no
`uefa.champions`, `uefa.europa` or `uefa.europa.conf` scoreboard — and the Round 1 prompt notes that
this reached the design as *routed* evidence: the generating session's container had
`site.api.espn.com` refused by egress policy, and nothing Claude ran had verified it. The Round 1
review re-ran the check with network; `docs/design-cycle-ucl-review-pass-1.md` has the result.
