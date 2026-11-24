# The second edition's handoff, Poster-pass addendum (Claude Design, Mon 23 Nov 2026, TZ=America/New_York)

Claude Design drew the Poster pass on the "Fergie Time — second edition" canvas on Mon 23 Nov 2026,
from the brief in
[`design-overhaul-poster-design-prompt.md`](../../design-overhaul-poster-design-prompt.md). It
saved the folded handoff on the canvas, in the handoff folder, as `21-second-edition-handoff.md`,
which is not in this repository. This copy is its reply as Beni relayed it to the Track A PM seat
(Claude Code, `claude-opus-5-5` at `high`) at about 7:15 PM EST, word for word, with its headings
moved one level down. The full diff the
reply says it attached did not come with the relay. The diff below is the one in the reply, with
unchanged text cut to "…".

The five ruled matters it redrew (the closing book, no cycles, fixed titles, the all-hidden day and
no rule in a competition's hue) are the later word on the sections it names.
[`second-edition-handoff.md`](second-edition-handoff.md) and
[`gap-18-addendum.md`](gap-18-addendum.md) are not edited here. Questions 30 to 39 bind nothing
until Beni rules them, and his rulings are added below as he gives them.

## The PM seat's check, Mon 23 Nov 2026, about 7:20 PM EST

Read against the integration branch at `45b7bc6`, whose snapshot was synced on 19 Nov 2026
(`lastSyncAt` 2026-11-19T19:33:56.613Z). The files came from
`git archive 45b7bc6 tests/contrast.ts src`, and the counts from a Node 24.15.0 script over
`src/data/fixtures.json`, with dates in Brooklyn time and weeks running Monday to Sunday
(`startOfWeek`, `src/lib/time.ts:118-119`).

- **Contrast.** `scrimComposite()` in `tests/contrast.ts` returns `#1E1E1F`, and
  `ratio(rgb('#FF7074'), scrimComposite())` is 6.204:1. `#FF7074` is `--fb-alarm`
  (`src/shell.css:201`). The reply's 6.20:1 stands.
- **Counts.** 1,446 fixtures on 109 match days: 263 at full time, 1,182 scheduled and one
  suspended, the last on Wed 9 Dec with nine others. 77 days hold more than four matches, 13 hold
  one, and the heaviest holds 36. The week of 26 Oct holds 2, 3, 5, 2, 5, 22 and 16, 55 in all.
  Saturday 21 Nov holds 26. No fixture is after extra time, on penalties or in play, and no day is
  partly final. Sunday 8 Nov holds 24 matches, all at full time, so the book that cannot close is
  ILLUSTRATIVE, as drawn.
- **The slot rule (question 36) places all 109 days.** It gives 6 first Champions League nights,
  5 second ones, 7 Europa and Conference nights, 13 Fridays, 24 Saturdays, 24 Sundays, 11 Mondays
  and 19 domestic midweeks. No week holds three Champions League days, no Champions League day falls
  off a Tuesday or a Wednesday, and no Friday to Monday holds a European match. The one lone night
  is Wed 27 Jan 2027, which takes The First Night. The three supercup days (Tue 22 Dec, Tue 2 Feb
  and Wed 3 Feb) fall to the domestic midweek. 20 days are closed books.
- **Heights.** The arithmetic holds: 1 + 9 + 16.5 + 9 = 35.5 px a day, 248.5 px for seven, and
  52 px and 364 px where a pair cannot share a line. The 16.5 px line is 11 px type
  (`text-[11px]`, `src/components/PosterWeek.tsx:33` and `:58`) at the base line-height of 1.5.
  No browser measured it. The Ledger's 450 px is not touched by this pass.
- **Titles.** The seven retired titles are the seven that spell a count, and the six kept spell
  none.
- **What the reply leaves to the plan.** Question 30 passes over an unsettled match but does not
  name a kickoff the league has not set. The plan already rules it: the cover band "must skip
  unset and unsettled kickoffs the way `kickoffBounds` does" (`docs/design-overhaul-plan.md`,
  line 54), and an unset kickoff gives the band "an amber count and no fixture" (line 487). The
  snapshot holds 493 such fixtures on 29 days, from Sun 13 Dec on. That rule binds PR 5 whatever
  question 30's answer.
- **What Claude Design could not read.** Sunday 8 Nov's first kickoff is 6:30 AM ET (Napoli v
  Lazio, Serie A), then 8:00 AM (Elche v Real Betis) and 9:00 AM (Stade Rennais v LOSC Lille). If
  the ILLUSTRATIVE abandoned match is not the first, the cover's date line ends `FIRST 6:30 AM ET`.
- **Left for a follow-up pass**, by the reply's own account: the handoff's "Where the boards are",
  section 6, section 2's measured pairs (the 6.20 pair), section 9's list of new rules, section 13
  and the Retired board's list of the three left rules.

## Beni's rulings on questions 30 to 39

None yet.

## The reply, as relayed

**One thing for Beni first.** The second paste stopped one line short: it lacks only `END OF BRIEF`. It matches the first paste word for word, and the first is complete, so I went ahead. I could not compare either with the archived brief: the repository is not linked to this session and my request for access went unanswered.

The pass is published to the canvas, and the handoff is saved to the handoff folder as `21-second-edition-handoff.md`. Nothing was rendered; every check was on the files.

### Boards changed, and what each holds

- **The books** (Components):
  - Every Rack face, marker and spine prints its slot's title.
  - A new section, "A book closes only on finals", holds the closed cover with one AET and one PENS result, and the book that cannot close at 390 and at 360.
  - It also holds one specimen of every form an open band can print.
  - Three rules are written beside them: no dot on the band, no rule in a competition's hue, one title per day type.
- **Page controls** (Components): the all-hidden day (the week at 390, the longest pair at 360, dark), the "more" rule, the label as it reads now beside the proposed one, and asides.
- **Imagery** (System): the cover library as a table of eleven slots, and the rule that gives a day its slot.
- **Type** (System): the aside specimen now shows an aside already on the Ledger.
- **Poster** (six frames): fixed titles; the aside "Fifteen minutes between doors…" is gone.
- **UEFA week** (390 and 360) and **Quiet week** (390 and 360): fixed titles. The UEFA week's slide keys read "First Champions League night" and "Second Champions League night".
- **States sheet** (both themes): C gains the closed cover after extra time and on penalties, and "C, open", the book that cannot close.
- **New, Saturday opened**: six frames (390, 360 and 1000, paper and dark). Each holds the part opener, the date line, four rows, the control reading HIDE, and rows 5 to 26 in the row order.
- **New, the all-hidden day and week**: four frames (390 and 360, paper and dark). Each holds the week of 26 October with all seven days hidden, and a mixed week of a part, an all-hidden day and a part.
- **Open questions** (Handoff): the five matters recorded as redrawn, and questions 30 to 39.

### What the brief asked me to say

- **The book that cannot close** ends its date line `FIRST H:MM ET`, rule 9's normal form. Wed 9 Dec is covered by the same rule; nothing is drawn for it.
- **Cycles:** no template on the canvas showed a cycle or a time-of-day rule. One Poster aside leaned on the day's fixtures and is removed.
- **"in The Fifth Minute":** that line is not on this canvas, only on the Pen boards.
- **The Rack's spoken names** keep their form: "The Tower Counts, Sunday 22 November, 3 of 4".
- **Part numbers** skip an all-hidden day.
- **Hue:** no Poster board carries a rule, edge, bar or tint in a competition's hue. A band fixture carries no dot. Nothing replaces the three rules, so there is no question.

### The cover library

| Slot | Title | Tagline, proposed |
|---|---|---|
| Domestic Friday | The Fifth Minute | The lights came back on in the ninety-fifth minute. So did something else. |
| Domestic Saturday | **The Valley Doors** (new) | Every door was left open that Saturday. The whistle did not close them all. (new) |
| Domestic Sunday | The Tower Counts | The tower counts its bells every Sunday. It has never been wrong. (new) |
| Domestic Monday | **The Empty Hallways** (new) | It is only Monday. The week has not finished with you. (new) |
| First Champions League night | **The First Night** (new) | Grounds lit at once, a continent apart. Something walks between them. (cut) |
| Second Champions League night | The Second Night | It walked between them all night. It is still walking. (new) |
| Europa and Conference night | **The Far Windows** (new) | Windows lit across the map. Count them again. One is watching back. (cut) |
| Domestic midweek | **The Night Between** (new) | The weekend is days away. Something could not wait. (new) |
| The Register | The Register | Every name goes in. Some are already falling. (cut) |
| A closed book | The Long Whistle | Every whistle blew, and every one was answered. You made it to morning. (cut) |
| The quiet week | A Quiet Week | A no-bet week is a successful outcome. |

"Cut" means shortened from the approved line. New words for Beni: the five titles, the five new taglines, the four cut ones, and "More stories".

### Proposals, each a yes or no

- **30. The open book's band.** Keep kickoff order, so results lead. Each entry prints what the snapshot stores, and an unsettled match is passed over. The count line keeps its open form until every match it counts is final.
- **31. The "more" rule.** A day shows its first four rows. The control appears from six rows up, so it never hides fewer than two. Under filters it counts the rows left beyond the fourth.
- **32. The label spells no number.** "More stories", with the count in Plex Mono. Kept as it is, it reads "Thirty-two more stories", and "One more story · 1 MATCH" for one.
- **33. Asides.** At most one to a part, at its foot, belonging to the slot and never to the fixtures. Both of the brief's asides fall, and the Poster carries none until one is written.
- **34. The five new titles.**
- **35. One tagline to a slot**, as in the table. The boards keep the approved taglines until this is ruled.
- **36. The slot rule.**
  - A Champions League match makes a Champions League night.
  - Otherwise a Europa or Conference League match makes that night.
  - Otherwise the weekday decides: Tuesday to Thursday is the domestic midweek, and a supercup counts as domestic.
  - A week's only Champions League night is the first, so a lone Wednesday is The First Night.
- **37. The all-hidden day in one line.** The date line and the hidden count share a line.
- **38. Today.** Neither a part nor an all-hidden day marks it. The TODAY pill stays on the Ledger.
- **39. The Rack and the shelf.** Counts follow the filters. An all-hidden day's book leaves the Rack and its spine leaves the shelf.

### Heights

- An all-hidden day is 35.5 px at 360 and at 390: a 1 px rule, 9 px, one 16.5 px line, 9 px.
- The week of 26 October is 248.5 px at both widths, under the 510.5 px ceiling.
- If a pair could not share a line, a day would be 52 px and the week 364 px.

### Contrast

There is one new pair, not none. Alarm `#FF7074` on the scrim's worst case `#1E1E1F` is 6.20:1. It arises only if question 30 is accepted and LIVE is printed on a cover band.

### The handoff's changed lines

Unchanged text in a line is cut to "…". The two tables are the ones above, with the handoff's recommendations for 30 to 39 a little shorter. The full diff is attached.

````diff
@@ line 5 @@
- … Nov: twenty-three questions are ruled, two are closed, three are settled in the build and one stays open …
+ … Nov; the Poster pass of 23 Nov redrew five ruled matters and puts ten questions: twenty-three questions are ruled, two are closed, three are settled in the build and eleven are open, question 16 and questions 30 to 39 …
@@ line 162 @@
- … TIME`.
+ … TIME`. The closed form is printed only when every match of the day is final: FT, AET or PENS (ruled 14 Nov 2026). A day with a postponed, cancelled, suspended or abandoned match stays open and keeps the normal form, with the first kickoff among the matches that still have one.
@@ line 164 @@
- … rest.
+ … rest (`+ 22 more results`). A result after extra time prints its score and AET; one settled on penalties prints its score, the shootout in brackets, and PENS, as in `3–3 (2–4) PENS`. These are the app's own forms, and all three are finals, so all three scores are pitch. A fixture on the band carries no 8 px dot: a dot stands beside its competition's name, the band prints no competition, and a dot alone would be colour alone.
+ 
+ An open book with results in it (proposed, question 30): the band stays the day's kickoff list, so results lead. Each entry prints what the snapshot stores: a final in pitch with FT, AET or PENS; a live score in ink beside LIVE in the alarm voice; KICKED OFF in amber, after the last score in amber where the snapshot holds one; both clocks on a fixture to come. A tie is never broken and an unsettled match is passed over. The count line keeps its open form (`+ 24 more, from 9:00 AM ET`) until every match it counts is final, and then reads `+ 21 more results`. The cover adds no line for the unsettled match. One new pair, used only by LIVE on a band: alarm `#FF7074` on the scrim's worst case `#1E1E1F` is 6.20:1.
@@ line 170 @@
- The closed book (D6): the cover turns to the dawn plate and is still, with motion on or off. No stake, price or pay-out.
+ **No rule in a competition's hue.** No cover, part opener, date line or row carries a rule, an edge, a bar or a tint in a competition's hue: a hue is an 8 px dot or a zone band and nothing else, the first edition's three left rules (12 px down a heavy day's header, 12 px down the hero, 4 px beside each of the hero's fixtures) are retired, and nothing replaces them.
+ 
+ **Titles.** One title per day type (ruled 14 Nov 2026). A cover's title belongs to its slot in the cover library (section 7), is reused week to week and spells no count. It stays live type under the foil, and every count stays on the date line in Plex Mono.
+ 
+ The closed book (D6): a book closes only when every match of its day is FT, AET or PENS (ruled 14 Nov 2026). Then the cover turns to the dawn plate and is still, with motion on or off. No stake, price or pay-out.
+ 
+ The book that cannot close: a day with a postponed, cancelled, suspended or abandoned match stays open, however many of its other matches are final. It keeps its own photograph and title and never takes the dawn plate, and FULL TIME is never printed over a match that was not played. Its band is the kickoff list with the results the snapshot stores, passing over the unsettled match, whose row carries its word in the alarm voice. Wed 9 Dec, the suspended match with nine others, is this case and needs nothing more. Both books are drawn on the books board and on states sheet C, ILLUSTRATIVE: the snapshot holds no AET or PENS result and no day that is partly final.
@@ line 180 @@
- … ("Sixteen Bells, …
+ … ("The Tower Counts, …
@@ line 234 @@
+ **The all-hidden day** (kept, 21 Nov 2026; ruled again 23 Nov). A day whose fixtures the filters all hide keeps its own date line, with `0 MATCHES` and no first kickoff, then "N hidden by filters" in muted ink, and nothing else. On the Poster it is not a part: no plate, no part label, no rows. The line may be slimmer in the Poster's day blocks, and a week in which every day is hidden is no taller than 510.5 px, at 360 and at 390. Proposed (question 37): the date line and the count share one line, 35.5 px a day (a 1 px hairline, 9 px, one 16.5 px line of 11 px Plex Mono, 9 px), each a no-break unit, and 52 px where a pair cannot share a line; the part numbers skip the day. The week of 26 Oct with every competition hidden (2, 3, 5, 2, 5, 22 and 16 hidden, 55 in all) is seven blocks, 248.5 px at 360 and at 390. Proposed (question 38): neither a part nor an all-hidden day marks today; the TODAY pill stays on the Ledger. Proposed (question 39): counts follow the filters on the Rack and the shelf, and an all-hidden day's book leaves the Rack and its spine leaves the shelf until one of its competitions is shown again. Drawn on the page-controls board and as `PosterHidden` at 390 and 360 in both themes: the all-hidden week, and a mixed week of a part, an all-hidden day and a part (an ILLUSTRATIVE filter).
@@ line 250 @@
+ No cycles and no time-of-day rules (ruled 14 Nov 2026): the rows it opens are ordinary contents rows, each with both clocks, in the row order. No header, rule or label groups them, and nothing names a time of day. Saturday 21 Nov is drawn opened as `PosterSat`, all 26 rows, at 390, 360 and 1000 in both themes, with the control reading HIDE. Proposed (question 31): a day shows its first four rows; the control appears when it would hide two or more, so from six rows up, and a day of five shows all five; under filters it counts the rows the filters leave beyond the fourth. Proposed (question 32): the label spells no number and reads "More stories" on every day, with the count in Plex Mono beside it; kept as it is, it reads "Thirty-two more stories" for thirty-two and would need "One more story · 1 MATCH" for one. The templates keep the spelled label until that is ruled.
+ 
+ **Asides.** Proposed (question 33): at most one to a part, at its foot, after its last row and its "more" control; it belongs to the day's slot, as the title does, and may not depend on the day's fixtures. "Fifteen minutes between doors. The house likes them close." and "Five doors at once. Nobody can watch five doors." sat under kickoff groups and fall with them. The Poster carries no aside until one is written for a slot.
@@ line 397 @@
- … week): domestic Friday, Saturday, Sunday (in hand); domestic Monday and the first Champions League night (landscape plates standing in); a second Champions League night (reuses the first night's plate); Europa and Conference night (in hand); domestic midweek (reuses the Friday cover); The Register (one for every league); a closed book (the dawn plate); the quiet week (the shop). No new covers (ruled 14 Nov 2026, question 15).
+ … week; ruled 14 Nov 2026: one title per day type, and no title spells a count). Eleven slots, each with one photograph and one fixed title. No new covers (ruled 14 Nov 2026, question 15). Six of the boards' thirteen titles spell no count and are kept; seven are retired (Twenty-Six Doors, Sixteen Bells, Three After Dark, Nine Lamps, Thirty-Six Windows, The Five, Twenty Rooms). The five new titles are question 34 and the taglines are question 35: one to a slot, stating no count, no league size and no weekday but its own. The boards print the titles below and keep the approved taglines until question 35 is ruled.
+ 
+ [the eleven-slot table: slot, photograph, title, proposed tagline]
+ 
+ Which slot a day takes (proposed, question 36). The first test that fits decides. One: a day with a Champions League match is a Champions League night, whatever else it holds; the earliest such day of its week takes the first night and any later one the second, and a week's only night is the first whatever its weekday, so a lone Wednesday is The First Night. Two: otherwise, a day with a Europa League or Conference League match is the Europa and Conference night. Three: otherwise the weekday decides; Friday, Saturday, Sunday and Monday take their own slot, and Tuesday, Wednesday and Thursday take the domestic midweek, with a supercup counted as domestic. A week runs Monday to Sunday in Brooklyn. A day whose every match is final takes the closed book in place of its own slot, a week with no fixtures takes the quiet week, and The Register is the Table's cover. That places all 109 match days of the snapshot of 19 Nov 2026.
@@ line 455 @@
- … text is unchanged; the fixtures band's tie rule is written beside it. …
+ … date line and its three forms are unchanged, and the fixtures band's tie rule is written beside it. Its closed form's condition, "when every match of the day is full time", now reads "when every match of the day is final: FT, AET or PENS" (ruled 14 Nov 2026), so a day with a postponed, cancelled, suspended or abandoned match keeps the normal form and never ends FULL TIME. …
@@ line 469 @@
- … 17 …
+ … 23 …
@@ line 471 @@
- … Twenty-three questions are ruled, two are closed, three are settled in the build, and one stays open. …
+ … The Poster pass of 23 Nov redrew five ruled matters and puts ten questions. Twenty-three questions are ruled, two are closed, three are settled in the build, and eleven are open: question 16, and 30 to 39. …
@@ line 478 @@
+ Put by the Poster pass of 23 Nov, for Beni. The recommendation comes first and each takes one word, yes or no:
+ 
+ [the table of questions 30 to 39]
@@ line 536 @@
- Also ruled, with boards to follow in a later pass, before the Poster is built. Nothing is redrawn for these yet.
+ Ruled, and redrawn in the Poster pass of 23 Nov:
@@ line 538 @@
- - A book closes only when every match of its day is FT, AET or PENS.
- - No cycles and no time-of-day rules on a heavy day.
- - One title per day type, and no title spells a count.
+ - 14 Nov: a book closes only when every match of its day is FT, AET or PENS. The closed book is drawn with one result after extra time and one on penalties, and the book that cannot close at 390 and 360, on the books board and on states sheet C in both themes. Both are ILLUSTRATIVE.
+ - 14 Nov: no cycles and no time-of-day rules on a heavy day. Saturday 21 Nov is drawn opened, all 26 rows in the row order, at 390, 360 and 1000 in both themes. No template drew a cycle; one aside that leaned on the day's fixtures is gone from the Poster.
+ - 14 Nov: one title per day type, and no title spells a count. The cover library is a table of eleven slots with one fixed title each, and every cover, Rack face, marker and spine prints its slot's title.
+ - 21 and 23 Nov: the all-hidden day is kept, and slimmer on the Poster. Drawn as a day, as the week of 26 Oct and inside a mixed week, at 390 and 360 in both themes.
+ - No rule in a competition's hue. The first edition's three left rules are retired and nothing replaces them. No Poster board carried one, and a fixture on a cover band carries no dot.
+ 
+ Also ruled, with boards to follow in a later pass. Nothing is redrawn for these yet.
````

### What I could not do

- **Sunday 8 November's first kickoff.** It is on no board and in no brief, and I could not read the snapshot. The cannot-close cover draws a hatched slot where the time goes.
- **That cover's tagline.** It prints the only Sunday line on the canvas, "The bells are hung. Nobody has told them when.", which was written for a day with no kickoff set. Question 35 replaces it.
- **The mixed week** uses an ILLUSTRATIVE filter. No real filter hides all of Saturday and leaves Friday and Sunday.
- **Taglines and the "more" label on the templates** are unchanged. The approved taglines still state counts, and the label still spells its number, until 32 and 35 are ruled.
- **Frame heights are estimates** on six boards that grew: the books, page controls, Imagery, both states sheets and Open questions.
- **Handoff, outside the sections you named:**
  - I changed the status line's counts on line 5 so it agrees with section 11.
  - "Where the boards are" and section 6 do not list the new frames or the new states.
  - Section 2's measured pairs lack the 6.20 pair.
  - Section 9's list of new rules and section 13 do not mention this pass.
- **The Retired board** does not yet list the three left rules.
