# Kickoff design overhaul — Fergie Time, second edition (Claude Design brief)

*Written 13 Nov 2026 by the session that directed the Pen spike and the fal work, after Pen
Prompts 13 to 16 and their verification. Routing recommended to Beni: Claude Design on Fable 5.2
at high effort, with the files in `~/.pencil/documents/kickoff-revamp-b2/exports/handoff/`
attached. Archive copy; the delivery was the fenced block in chat, per the ladder's rule.*

---

Work in this design project, with Fergie Time selected as its design system, and do not change
the Fergie Time design system itself yet. Where this brief says to remove or retire something
from the first edition, record it in the handoff as retired; Beni publishes the second edition
into the design system after he has reviewed it. *(Line added 13 Nov 2026, after Beni's
screenshot showed the run starting as a new design with Fergie Time selected.)*

## Your job

Fold a finished, reviewed design spike into the Fergie Time design system as its second
edition, and leave a handoff that an implementation prompt can be written from. The direction
is settled and ruled; this is design-system work, not a new direction. Kickoff is a personal
Big-5 European football fixtures and table app for a bettor in Brooklyn, 390 px mobile-first,
whose data feeds a betting pipeline, so data honesty is betting-grade. The spike restyles it as
Fergie Time Books, a 1980s mass-market horror paperback imprint that never existed, in a
hyper-photoreal cosmic-horror direction in the King and Hill tradition, evoked and never
borrowed: every matchday is a paperback, the horror is added time, and the joy lives in
surviving the night.

## What is attached

- The handoff boards, in reading order: 01-read-me-first (start here), 02-B0-world-bible, 03 to
  05 Friday's Poster at 390, 360 and 1000, 06 Saturday's Poster, 07 and 08 the Table at 390 and
  360, 09 the Rack, 10 to 12 the Ledger at 390, 360 and 1000, 13 and 14 the quiet week, 15 the
  wrap rules, 16 the dark theme, 17 the motion specification, 18 every honesty state, 19 the
  Rack in a UEFA week. 90 is the pay-out board, fenced out of this release (concept only); 91
  and 92 are untrimmed references, not the design of record.
- 00-B0-rules-note.txt: the eleven rules and the SECOND EDITION paragraph that bind every
  board, as text.
- 20-fal-picks.md: the photographs, with each file's provenance.
- design-overhaul-proposal.md: the spec of record; its "Rulings received" section holds every
  ruling below.
- design-overhaul-review.md: the cold review of the spike, findings B1 to B5 and M1 to M10.

## Ground truth

The code is the source of truth: `src/index.css` and `src/lib/competitions.ts` in
github.com/BeniCheni/kickoff hold the tokens, and this design system mirrors them, never the
reverse. So every second-edition token you define is a proposal that the implementation will
move into `src/index.css`. Data on every board is the snapshot synced 2026-11-11T07:48Z. Use
only the fixtures, times, results and table figures shown on the attached boards; anything else
is captioned ILLUSTRATIVE. Never invent a kickoff time or a matchday number, and every fixture
shows the Brooklyn clock and, smaller, the stadium-local clock.

## Rulings that bind you

- D1 · The direction is B, The Paperback, "no boundaries" on the look.
- The clearing: the Broadcast lens is gone, so the switch reads Poster then Ledger; Where to
  Watch is gone completely, along with the 📺 emoji, the TV pill and its dashed outline; the
  Monthly view is gone. The first edition still describes all of these, so remove them from it,
  including the broadcast template.
- D2 · Evoke, never borrow: no character, town, title or iconic object from either author.
- D3 · The clearing ships first on its own; the overhaul's build follows the Next.js cutover.
  Pick no version number.
- D4 · The settled Table takes the new skin; its structure stays untouched.
- D5 · Moments is fenced: it takes the shell and the tokens and nothing else.
- D6 · Money is a motif, never a real figure. The pay-out board is fenced out. The joy lives in
  the full-time state where a matchday's book closes on its real results.
- D7 · One persisted motion control in the imprint band stops every decorative effect on the
  page (WCAG 2.2.2); the Rack's Stop mirrors it.
- D8 · Display titles are live type: a foil drawn in CSS on the live glyphs, with the drip,
  burst and glitch around the letters, never on them.
- D9 · The new look runs across the whole app, with fixed inks: provenance amber on pulp
  #6E4B00, muted pulp ink #4E4538, the NEXT pill's ground #1E5636; text on a flat plane (no
  paper texture under text, caption scrims at least 90% opaque, nothing under 10 px).
- D10 · The Ledger always lists every fixture of the week; the betting pipeline will read it.
- D11 · The Rack holds the week's matchday books in order, then The Register, resting on the
  next matchday.
- D12 · No row numbers beside fixtures.
- D13 · A cover's lower band names its book's first fixtures with both clocks.
- D14 · Photographs ship under a separate asset licence with each image's provider, model and
  prompt recorded.

Two calls are the directing session's, not yet Beni's, so treat them as working assumptions and
flag them: rule 3's exception (a day summary shows its first kickoff in Brooklyn time only,
because one day spans several stadium clocks), and a cover library keyed to the day type and
reused week to week (Friday, Saturday, Sunday, a Champions League night, a Thursday and so on),
because a UEFA week can hold seven books.

## What to produce

1. Second-edition tokens, as a layer beside the first edition rather than over it. For each:
   its name, its value on paper stock and on black stock, its voice, and every text and
   background pair it is used in, with the contrast measured (4.5:1 for body text, 3:1 for
   large text). Include the pulp papers (#EBDDBE light, #0E1420 dark), the inks, blood
   (#B3121B), rift green (#9DFFC8) and the themed fb- tokens on B0.
2. The voice map, reconciled with the first edition. Ink speaks; pitch green confirms (the
   Brooklyn clock, Today, the active tab, scores); rift green is decoration only and must never
   read as a confirmation. Amber means data trust. Rule 4 now lists three uses (the sync line,
   an unset kickoff, KICKED OFF), but the first edition also uses amber for games in hand and
   for 24 to 72 hour staleness, so settle the full list and rewrite rule 4 to match. Settle the
   alarm voice: the first edition's burnt orange, or blood. It covers LIVE, postponed,
   cancelled, abandoned and 72-hour staleness. The states board draws LIVE in pitch green,
   which is the confirm voice; correct it. Competition hues do not change.
3. Type. The spike adds Abril Fatface, Libre Caslon Text, Courier Prime, Orbitron, Chakra Petch
   and Caveat beside Oswald, Inter and IBM Plex Mono, and sets the wordmark in Abril Fatface
   instead of Oswald. Decide which families survive, confirm each one's licence, set a
   font-weight budget, and keep IBM Plex Mono for every numeral that is data. The wordmark
   change is a brand decision: propose it and flag it rather than settle it.
4. Components, each with its states, its sizes at 360, 390 and 1000, and its motion-off still,
   each control with a hit area of at least 44 by 44 px made by padding, and a rule for where
   two hit areas meet:
   - The page chrome: the imprint band (wordmark, motion control, theme toggle, the
     Poster/Ledger switch and the +5 badge) and the provenance line.
   - The books: Cover face (the lower fixtures band; the date-line forms normal, FIRST KICKOFF
     NOT SET and FULL TIME), The Rack (markers, Stop, four slides and eight), Spine, Part
     opener.
   - The rows and states: Contents row (Poster), Ledger row, StatusPill (LIVE, KICKED OFF, FT,
     POSTPONED, CANCELLED, SUSPENDED, ABANDONED and a corrected result), StalenessBanner (24
     and 72 hours).
   - The page controls: the "hidden by filters" note, the expanding "more" control and the UEFA
     matchday line.
   - The Table: its row with the two-clock next-fixture cell and the games-in-hand note.
5. Templates: Poster, Ledger and Table in both themes at 390 (the judge), 360 (the jury) and
   1000; the quiet week; the UEFA week; the states sheet; and Moments' shell only. Retire the
   broadcast template.
6. Imagery: the rules from B0 (cold grade, no lettering or digits, no real people, clubs or
   stadiums, ILLUSTRATIVE captions, a scrim under any text over a photograph), the photographs
   from 20-fal-picks.md with their provenance, and how they ship (AVIF with a WebP fallback,
   art-directed crops at 1x to 3x).
7. Motion: rewrite the first edition's motion budget around the spike's motion specification.
   State changes keep 150, 180 and 220 ms. Every decorative effect gets its period, its
   trigger, its motion-off still and what stops it. The rules stay: one WebGL canvas per
   visible region, live text above it, the WCAG 2.3.1 brightness gate, and no motion with
   reduced motion on.
8. A handoff document the implementation prompt can be written from. It lists the token table
   with measured pairs, the voice map, the type decisions, every component and template, the
   asset list, the motion contracts, the open questions, and what the second edition
   deliberately does not do.

## Known gaps to settle

- Where two controls closer than 44 px share their padded hit areas: the tabs over the
  provenance line, and the week row.
- The motion storyboard's emergence frame keeps the outgoing title: say when the title block
  cross-fades to the incoming book.
- The series line was dropped from the rack face: keep it dropped, or bring it back.
- The week row drops its year at 360, and the page uses a 640 px measure at 1000: confirm both
  or replace them.
- Stadium clocks with no zone abbreviation (Almaty, Baku) print as GMT+5 and GMT+4: match the
  live app's format.

## Fences

Write no code and change no file in the repository. Pick no version number. Show no real money
figure. Do not restructure the settled Table. Generate no new photographs: use the attached
ones, and say where one is missing. Keep every rule in the rules note unless a ruling above
changes it, and say where you changed one and why.

## Report back

A short summary: what changed in Fergie Time, the voice map, the token table with its measured
pairs, the type decisions, what you retired, and every open question for Beni.
