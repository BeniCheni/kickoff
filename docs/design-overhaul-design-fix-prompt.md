# Fergie Time second edition — fix pass after Beni's review (13 Nov 2026)

*Written 13 Nov 2026 by the session that directed the Pen spike, after reviewing Claude Design's
canvas "Fergie Time — second edition" against the snapshot and the live app and after Beni ruled
"as recommended" on its open questions. To be pasted into the same Claude Design chat, with
`exports/handoff/21-pen-source-prompts.md` from the b2 folder attached. Archive copy; the
delivery was the fenced block in chat, per the ladder's rule.*

---

Work on this same canvas, "Fergie Time — second edition". Beni has reviewed it and ruled on its
open questions. Make one pass that applies the rulings and the fixes below, and keep everything
else as it is. The Fergie Time design system itself stays untouched.

Attached: 21-pen-source-prompts.md, the prompts Pen used to make seven of the photographs,
recovered from Pen's session logs.

## What the review confirmed

Every fixture, kickoff, venue, stadium clock, result and count on the canvas matches the
snapshot, as do all 20 Premier League rows and all 40 contrast figures. Do not re-derive them;
change only what is named here.

## Rulings, 13 Nov 2026 (Beni, by the Questions board's numbers)

- Accepted as drawn: 1, 2, 4, 5, 6, 8, 9, 10, 12 and 13. Mark each one ruled on the Questions
  board. Questions 1 and 2 are now rulings, not working assumptions, so take the "Directing
  session" flag off them on every board that carries it.
- 7, amber has eight uses. Keep rule 4's six and add two: a UEFA matchday line that is
  rescheduled or falls outside UEFA's published windows (a computed line stays in ink), and a
  stadium clock whose zone is not known, which reads "local time not known". The live app
  already sets both in amber. Rewrite rule 4, and every place that says amber has six uses.
- 11, the stadium clock reads "20:30 local" on every row, cover band, Table cell and NEXT UP
  card: 24-hour, then the word local, never a zone abbreviation such as CET or GMT. The
  Brooklyn clock does not change. Update every board that prints a zone abbreviation or
  describes the format.
- Still open, so keep them on the Questions board: 3 (the wordmark), 14 (see fix 6), 15 (the
  missing covers) and 16 (the full-size look at two photographs).

## Fixes

1. The eight-marker Rack row does not fit at 360. Eight 44 px markers need 352 px, and the row
   has 336 (360 less its 12 px side padding), so the eighth marker wraps. Give the eight-marker
   row a 360 rule that keeps all eight on one line at 44 px each, and draw the UEFA week at
   360.

2. Draw three honesty states that the live app has and the canvas does not, on the states sheet
   in both themes and on the rows board. None occurs in the snapshot, so caption each specimen
   ILLUSTRATIVE. (a) The matchday line's two other forms, in amber, in the live app's words:
   "MATCHDAY 5 · RESCHEDULED — NOW OUTSIDE ITS UEFA WINDOW" and "MATCHDAY — · DATE OUTSIDE
   UEFA'S PUBLISHED WINDOWS" (the app writes FIRST SEEN in place of DATE when it first saw the
   fixture outside a window). (b) "local time not known" in amber, in place of the stadium
   clock, when a stadium's zone is unknown. (c) The day note, for when Brooklyn's calendar date
   differs from the stadium's: the live app adds "(Thu, prev. day)" or "(Fri, next day)" beside
   the Brooklyn clock, naming Brooklyn's weekday. Draw it on a Poster row, a Ledger row and a
   cover-band entry, in muted ink, because it states a fact rather than a doubt.

3. The motion board adds a fourth state-change value: 600 ms for a tapped cover growing into
   its book. The brief kept 150, 180 and 220 ms. Take 600 ms out of the budget and add it to
   the Questions board as a new open question; the build's prototype is where that duration
   gets set.

4. Two captions. The Bayern Munich v FC Cologne KICKED OFF specimens on the rows board and the
   Table board need ILLUSTRATIVE, as the states sheet already has it. The Ledger's NEXT UP
   countdowns ("8 DAYS", "9 DAYS") assume the page is read on Thu 12 Nov; say so in an
   ILLUSTRATIVE caption.

5. Ties at one kickoff keep the live app's order. The app orders a day's fixtures by group
   (supercups, then European cups, then domestic leagues), then by kickoff, and keeps the
   snapshot's order for ties. The Poster has this right; the Ledger sorted its ties
   alphabetically. Reorder the Ledger's ties to: Sat 21 Nov 9:00 AM, Lazio v Lecce, Como v
   Cagliari. Sat 9:30 AM, SV Elversberg v SC Freiburg, Borussia Mönchengladbach v Borussia
   Dortmund, 1. FC Union Berlin v RB Leipzig, Eintracht Frankfurt v TSG Hoffenheim, Bayer
   Leverkusen v SC Paderborn 07. Sat 10:00 AM, Tottenham Hotspur v Ipswich Town, Aston Villa v
   Sunderland, Coventry City v Crystal Palace, Chelsea v Leeds United, AFC Bournemouth v
   Nottingham Forest. Sat 2:45 PM, RC Strasbourg v Stade Brestois, AS Monaco v AJ Auxerre, LOSC
   Lille v Olympique Lyonnais, RC Lens v Toulouse FC, Napoli v Torino. Sun 22 Nov 9:00 AM,
   Paris FC v Angers SCO, Hull City v Brighton & Hove Albion, Sassuolo v Genoa, Bologna v
   Udinese.

The same rule changes the states sheet's filtered example (F): with only the Premier League
shown, Saturday's second row is Tottenham Hotspur v Ipswich Town, not AFC Bournemouth v
Nottingham Forest. Write the order rule on the rows board. On a day that mixes groups the rows
lead with the European cups while the date line goes by the earliest kickoff, so say on the
books board which order the cover's lower band follows.

6. D14's record. Update the Imagery board from 21-pen-source-prompts.md. The six photographs
   marked "Source unrecorded" and the void now have a provider (pen.dev, through its Generate
   tool) and a prompt, quoted verbatim in the attachment, but no recorded model. Record each
   one with its model marked "not recorded", and recount the gap: three photographs complete,
   seven with provider and prompt but no model. Question 14 becomes one choice: record those
   seven with the model marked unknown, or regenerate them.

7. The Table at 1000. Its W, D and L columns were held because no board showed them. Fill them
   from these figures, copied from the standings snapshot of 11 Nov 2026, as position, club,
   W-D-L: 1 ARS 9-0-1; 2 BHA 7-1-2; 3 MNC 7-0-3; 4 LIV 5-3-2; 5 CHE 5-1-4; 6 EVE 4-4-2; 7 BOU
   4-3-3; 8 BRE 3-5-2; 9 LEE 3-5-2; 10 AVL 3-4-3; 11 TOT 3-3-4; 12 NEW 3-3-4; 13 HUL 2-5-3; 14
   IPS 3-2-5; 15 FUL 2-4-4; 16 NFO 2-3-5; 17 COV 3-0-7; 18 MAN 1-5-4; 19 SUN 2-2-6; 20 CRY
   2-1-7. PPG stays points divided by played, to two decimals, as the live app computes it.
   With these figures the open row can be drawn: draw it for Arsenal at 390. Question 17 then
   comes off the Questions board.

## Fences

Unchanged: write no code and change no file in the repository; do not change the Fergie Time
design system; pick no version number; show no real money figure; do not restructure the Table;
generate no new photographs. Every figure you add is one given above or one already on the
canvas.

## Report back

A short list: each ruling and fix, the boards it touched, anything you could not do, and the
Questions board as it now stands.
