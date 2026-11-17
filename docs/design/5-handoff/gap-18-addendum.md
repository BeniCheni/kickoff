# The second edition's handoff, gap-18 addendum (Claude Design, Tue 17 Nov 2026, TZ=America/New_York)

Claude Design drew gap 18 (the filter panel, and Zones & key, opened) on the "Fergie Time — second
edition" canvas on Tue 17 Nov 2026, in two passes:
- the first from the brief in
  [`design-overhaul-filter-panel-design-prompt.md`](../../design-overhaul-filter-panel-design-prompt.md);
- the second from the PM seat's follow-up, after Beni ruled questions 22 to 26 "As recommended".

It then folded the addendum below into the handoff, on the canvas and in its folder. This copy is
that folded text, word for word, as Claude Design reported it in chat. It is the later word on
every section it names. [`second-edition-handoff.md`](second-edition-handoff.md) is the handoff
as archived on Sat 14 Nov, and is not edited here.

Before it was archived, the PM seat checked it against the repository at `2aea6c8`:
- every contrast figure matches `tests/contrast.ts`'s `ratio()`;
- Saturday 21 Nov's counts match `src/data/fixtures.json`;
- every quoted sentence is the app's own;
- the toggle's spoken name and the top "Show all" are as ruled.

The figures for Saturday 21 Nov describe the snapshot of that date. The build computes them live.

The boards themselves stay on the canvas. A preview of any of them joins this record under
[`LICENCE.md`](../LICENCE.md) only when it is exported.

---

### Section 5 · Page controls, after "Hidden by filters"

**Filter panel.** Opens from the week row's Filters control, below the row, in the page measure (a 16 px gutter at 360 and 390, 640 px at 1000), as a 180 ms disclosure. Pulp under the black week row on Poster; typescript with a rule beneath it on the Ledger; dark pulp on a dark page. Never over a photograph. The Filters control carries `aria-expanded` and its chevron turns up while the panel is open. It holds, in the live app's words and order: the line "Hide a competition here and it disappears everywhere below." with a "Show all" control; three groups (Big 5 Leagues, European Cups, Domestic Supercups), each with its label and one "Show all" / "Hide all" control; and fourteen toggles in the app's order. Drawn on the Components page: "The filter panel, opened", the four-states sheets, and twelve width frames (Poster and Ledger at 390, 360 and 1000, in both themes).

| Part | Drawn | Hit area | States |
|---|---|---|---|
| Toggle | 28 px tall; an 8 px dot and the name in Oswald 600, 10 px caps, .12em | A 44 px row; 8 px gaps split at the midpoint; rows on a 44 px pitch | Shown: 1 px solid ink frame, dot filled with the competition's hue, ink name, `aria-pressed="true"`. Hidden: 1 px broken muted frame, hollow muted ring with no hue, muted name, `aria-pressed="false"`. Its spoken name is the competition's name alone, "Premier League", in both states; it never says "shown" or "hidden". 180 ms |
| Show all (top) | Ink caps with a 1 px ink underline | 44 px tall, at least 44 px wide | When all fourteen are shown it is muted and disabled, not inert: it is still announced, as unavailable |
| Group control | The same | The same | Reads "Hide all" while every competition in its group is shown and "Show all" otherwise, as the app does. An action, not a toggle: its spoken name changes with it ("Hide all Big 5 Leagues") and it takes no `aria-pressed` |
| The line, a group's label and its hairline | Caslon 13 / 1.4; Oswald caps | None; not controls | |

On and off differ by more than colour: the frame is solid or broken and the dot is filled or hollow. A hue appears only as the dot of a shown competition: no fill, no tint, no flag, no pitch. Toggles wrap and never scroll sideways; a name never wraps inside its toggle and is never shortened. No new ink-and-ground pair: ink is 13.32 on pulp, 14.76 on typescript and 14.49 on the dark page; muted ink is 7.00, 7.75 and 7.39.

The control reads "Filters · all 14" (or "Filters · 14") with all shown, "3 of 14" filtered, "9 of 14" with the Domestic Supercups hidden, and "0 of 14" with every competition hidden; its spoken name is always full, "Filters, 3 of 14 competitions shown". Below, a day's count is the count shown and "N hidden by filters" follows the date line. Saturday 21 Nov holds 26 matches: Premier League 7, La Liga 4, Serie A 4, Bundesliga 6 and Ligue 1 5. With the Premier League, Champions League and La Liga shown it reads 11 matches and "15 hidden by filters"; "19 hidden by filters" belongs to the Premier League alone. With every competition hidden a day keeps its date line, loses its first kickoff, and reads "0 matches" and "26 hidden by filters".

### Section 5 · The Table, after "Controls"

**Zones & key, opened.** The 44 px disclosure opens in 180 ms on pulp, between the league tabs and the table head, in the Table's measure (780 px at 1000). Open, its chevron turns down and the rule moves from under the bar to under the key. Nothing inside is a control. It holds three things. "Qualification zones": one entry per zone, with its band at the row's 3 px, its name in Oswald caps, its positions in Plex Mono, and its note in Caslon 12 / 1.4; the note wraps under the name at 390 and 360 and sits on the same line at 1000. "Columns": one paragraph, each heading in Plex Mono 600. "How ties are broken": one paragraph; at 1000 it sits beside Columns. Drawn on the Components page: "Zones & key, opened", the Premier League key at 390, 360 and 1000 in both themes, and the Champions League league-phase and Bundesliga keys at 390 in both themes.

Its words are the app's own, from `src/lib/competitions.ts` and `src/components/TablePage.tsx` on main at 2aea6c8, and are not rewritten here. In a league's Columns paragraph the word "league" in "the club's next *league* match" is set in italics. A phase competition's Columns paragraph reads "different opponents limit the comparison" in place of the games-in-hand clause and "match in this competition; domestic and other cup ties are not shown here." after "the club's next".

Bands. Colour says where a zone leads; a broken band says it is not settled yet.

| Zone | Band | Token |
|---|---|---|
| A place: Champions League, Europa League, Conference League; the Champions League's Round of 16 | Solid, in the destination's hue | `comp-*` |
| A play-off for a place: the Champions League's knockout play-offs; Ligue 1's Champions League qualifying place | The same hue, broken: 4 px on, 3 px off | `comp-ucl` |
| A relegation play-off: the Bundesliga's, Ligue 1's | Blood, broken the same way | `fb-blood` |
| Relegation | Solid blood | `fb-blood` |
| Eliminated: the Champions League, 25–36 | Solid muted ink | `fb-pulp-muted` |

The first edition's floodlight play-off band and burnt-orange Eliminated band are retired. No new token, no tint, and no ninth use of amber. The 8 px square in a zone header and in the closed disclosure breaks the same way: two bars with a gap. Band on ground, computed as in section 2: muted ink 7.00 on pulp and 7.39 on dark pulp; blood 5.17 and 2.65; the Champions League hue 2.82 and 4.86. No zone is told by its band alone: each has its name in the key and its header in the table.

The season note. When the zone data describes a different season from the snapshot, the bands are hidden and a note says so: "Zone bands are hidden: the snapshot is the 2026-27 season but the zone metadata describes 2025-26.", with the app filling in the two seasons. It is the first thing inside the opened key, above "Qualification zones", in ink, Caslon 12 / 1.4. It is not amber and not the alarm. The disclosure loses its squares with the bands. The app's last sentence, "Update LEAGUE_TABLES.", is an instruction to the repository's maintainers and does not ship.

## 11. Questions, as they stand after 17 Nov 2026

Beni reviewed the second edition on 13 Nov 2026, ruled again on 14 Nov, and ruled on the gap-18 pass on 17 Nov. Twenty questions are ruled, two are closed, three are settled in the build, and one stays open. The numbers are the first pass's, so a ruling can be traced. Where an earlier part of this document still calls one of these open (the status line at the top; sections 4 and 10 on question 3; sections 5 and 8 on question 21; section 7 on questions 14 and 15), this section is the later word.

Still open, for Beni:

| # | Question | Where it stands |
|---|---|---|
| 16 | **A full-size look at two photographs**, under rules 1 and 6. | The Friday cover's silhouetted figures under the tent; the fog plate's parked car. It stays open until Beni has looked at both at full size |

Ruled on 17 Nov 2026:

| # | Question | Ruling |
|---|---|---|
| 22 | **The play-off band.** | Yes. The destination's hue, broken: 4 px on, 3 px off |
| 23 | **The Eliminated band.** | Yes. Solid muted ink |
| 24 | **The filter toggle's two states and the panel's controls.** | Yes, with two corrections. A toggle's spoken name is the competition's name alone, "Premier League", and its state is `aria-pressed`: true when shown, false when hidden. When all fourteen are shown the top "Show all" is muted and disabled, not inert. The group controls keep their changing names ("Hide all Big 5 Leagues") and take no `aria-pressed` |
| 25 | **New words and derived figures in the filter panel.** | Yes: "0 of 14" and its spoken form; "Show all *group*" and "Hide all *group*", spoken; and Saturday's 11, 15, 0 and 26. Not the ", shown" and ", hidden" spoken suffixes, which are gone |
| 26 | **The season note.** New on 17 Nov. | It drops its last sentence. It reads "Zone bands are hidden: the snapshot is the 2026-27 season but the zone metadata describes 2025-26.", with the app filling in the two seasons. "Update LEAGUE_TABLES." is an instruction to the repository's maintainers and does not ship |

Ruled on 14 Nov 2026:

| # | Question | Ruling |
|---|---|---|
| 3 | **The wordmark.** | Oswald stays. The build sets it at the band's size. The boards still draw Abril Fatface and are not redrawn for it |
| 14 | **D14's record.** | The seven Pen-made photographs ship recorded with "model: not recorded" |
| 15 | **Missing covers.** | No new covers. The second Champions League night reuses the first night's plate, and a domestic midweek reuses the Friday cover |

Closed:

| # | Gap | How it closed |
|---|---|---|
| 17 | **The Table's open row and its W, D, L columns at 1000.** | Closed, not ruled: the figures came with the review, from the standings snapshot of 11 Nov 2026. The columns are filled at 1000 and Arsenal's row is drawn open at 390 |
| 18 | **The filter panel and Zones & key, opened.** | Closed by the pass of 17 Nov. Both are drawn on the Components page, in both themes, at 390, 360 and 1000, and specified in section 5 |

Settled in the build, not on the canvas:

| # | Gap | How |
|---|---|---|
| 19 | **The title swap at 1.45 s.** | The title swap watched on a phone |
| 20 | **No phone benchmark.** | A phone benchmark |
| 21 | **How long a tapped cover takes to grow into its book.** | The cover's growth chosen from 220, 320, 450 and 600 ms |

Also ruled, with boards to follow in a later pass, before the rows and the Poster are built. Nothing is redrawn for these yet.

- A stale LIVE row keeps its last score under KICKED OFF.
- A book closes only when every match of its day is FT, AET or PENS.
- No cycles and no time-of-day rules on a heavy day.
- One title per day type, and no title spells a count.
- Moments' ground and inks take the second edition's tokens, with its layout untouched.
- Since 14 Nov (15 Nov): a postponed, cancelled, suspended or abandoned row prints no kickoff clock, neither in its leading slot nor when the row is opened.
- Since 14 Nov (16 Nov): on a light page, a paper surface inside a black one takes the paper voices, and on a dark page every surface takes the black voices.

Ruled on 13 Nov 2026:

| # | Question | Ruling |
|---|---|---|
| 1 | **Rule 3's exception.** | Accepted as drawn. A day summary shows the first kickoff in Brooklyn time only: every cover's date line, part opener, rack face and spine |
| 2 | **The cover library.** | Accepted as drawn. Covers are keyed to the day type and reused week to week: eleven slots |
| 4 | **The alarm voice.** | Accepted as drawn. Blood, with burnt orange retired |
| 5 | **The Brooklyn clock and scores in pitch.** | Accepted as drawn |
| 6 | **Form pips.** | Accepted as drawn. Ink, outline and blood |
| 7 | **Amber's uses.** | Eight. Rule 4's six, plus a UEFA matchday line that is rescheduled or falls outside UEFA's published windows (a computed line stays in ink), and a stadium clock whose zone is not known, which reads "local time not known" |
| 8 | **The emoji vocabulary.** | Accepted as drawn. Six drawn glyphs and no emoji |
| 9 | **The week row's year.** | Accepted as drawn. The year shows only outside the current Brooklyn year or across New Year, at every width |
| 10 | **The measure at 1000.** | Accepted as drawn. 640 for Poster and Ledger, 780 for the Table |
| 11 | **The stadium clock's format.** | "20:30 local" on every row, cover band, Table cell and NEXT UP card: 24-hour, then the word local, never a zone abbreviation. The Brooklyn clock is unchanged |
| 12 | **Page length.** | Accepted as drawn. The band grows 6 px, the league tabs 28 px, and the pips take their own line |
| 13 | **NEXT UP gains the stadium clock.** | Accepted as drawn |

Also confirmed on 13 Nov 2026, outside the numbered list: the cover's lower band follows kickoff order on a day that mixes groups (section 5).

---

## Later the same day: the rows pass (Tue 17 Nov 2026)

Claude Design redrew two rulings on the rows board and the States sheet, and Beni ruled on its
three proposals:
- a stale LIVE row keeps its last score under KICKED OFF (14 Nov);
- an unsettled row prints no kickoff clock (R1, 15 Nov).

The briefs, the PM seat's check and the rulings are in
[`design-overhaul-rows-design-prompt.md`](../../design-overhaul-rows-design-prompt.md).

The pass also brought the handoff's earlier sections in line with section 11. Its changed lines
are below, as Claude Design reported them across its two replies. **Section 11 at the end of
this file replaces the section 11 above.** The PM seat checked the counts: 23 ruled, 2 closed, 3
settled in the build and 1 open account for all 29 questions.

### The handoff's changed lines, first reply

```diff
@@ status line
- **Status.** A proposal, reviewed by Beni on 13 Nov 2026: twelve questions are ruled, one is closed and eight stay open (section 11).
+ **Status.** A proposal, reviewed by Beni on 13 Nov 2026 and ruled on again on 14 Nov and 17 Nov: twenty questions are ruled, two are closed, three are settled in the build and four stay open (section 11).
@@ section 4, type table
- | Oswald | 600, 700 | Caps labels: tabs, lens switch, competition names, status pills, imprint foot, captions | SIL OFL 1.1 | Keeps |
+ | Oswald | 600, 700 | Caps labels: tabs, lens switch, competition names, status pills, imprint foot, captions. The wordmark: Oswald stays, and the build sets it at the band's size | SIL OFL 1.1 | Keeps |
- | Abril Fatface | 400 | Display titles under the foil; the proposed wordmark | SIL OFL 1.1 | New |
+ | Abril Fatface | 400 | Display titles under the foil. The boards still draw the wordmark in it and are not redrawn for it | SIL OFL 1.1 | New |
@@ section 4, the wordmark
- **The wordmark (brand decision, still open: question 3).** Proposal A: Abril Fatface at 22 px on every lens, dropping the spike's separate Plex Mono wordmark on the Ledger. B is the first edition's Oswald 700 at the band's size. The templates draw A. The logo files, the K monogram, the +5 badge and the favicons are untouched either way.
+ **The wordmark (ruled 14 Nov 2026, question 3).** Oswald stays. The build sets it at the band's size. The boards still draw Abril Fatface and are not redrawn for it. Proposal A was Abril Fatface at 22 px on every lens, dropping the spike's separate Plex Mono wordmark on the Ledger. B is the first edition's Oswald 700 at the band's size. The templates draw A. The logo files, the K monogram, the +5 badge and the favicons are untouched.
@@ section 5, the Rack
- | Slide | the face | the whole face | Tap opens the book. The duration is open (question 21) |
+ | Slide | the face | the whole face | Tap opens the book. The duration is settled in the build: the cover's growth chosen from 220, 320, 450 and 600 ms (question 21) |
@@ section 6, the States sheet
- ... C the book closes, D suspended, E kicked off, F filtered, G UEFA matchday line, H the Table, I specimens, J staleness, ...
+ ... C the book closes, D suspended, with no kickoff clock, E kicked off, with its last score, and beside it the scheduled match past its kickoff, proposed for the rows (question 29), F filtered, G UEFA matchday line, H the Table, I specimens, the postponed, cancelled and abandoned rows with no kickoff clock, J staleness, ...
@@ section 7, D14's record
- **D14's record (open, question 14).** ... D14 asks for provider, model and prompt before anything ships, so one choice is left for Beni: record those seven with the model marked unknown, or regenerate them. This edition generates nothing.
+ **D14's record (ruled 14 Nov 2026, question 14).** ... The seven Pen-made photographs ship recorded with "model: not recorded". This edition generates nothing.
@@ section 7, the cover library
- ... a second Champions League night (missing; the void is a stand-in with no recorded model); Europa and Conference night (in hand); domestic midweek (missing); ... the quiet week (the shop).
+ ... a second Champions League night (reuses the first night's plate); Europa and Conference night (in hand); domestic midweek (reuses the Friday cover); ... the quiet week (the shop). No new covers (ruled 14 Nov 2026, question 15).
@@ section 8, state changes
- A tapped cover growing into its book is a state change with no value in this budget: the spike drew 600 ms and the build's prototype sets the duration (question 21).
+ A tapped cover growing into its book is a state change with no value in this budget. It is settled in the build: the cover's growth chosen from 220, 320, 450 and 600 ms (question 21).
@@ section 10, replaced by the second edition
- The Oswald wordmark at 34 px (proposed; still open, question 3).
+ The Oswald wordmark's 34 px size (ruled 14 Nov 2026, question 3: Oswald stays, and the build sets it at the band's size).
```

The first reply's StatusPill and section 11 lines were proposals. The second reply below
replaced them, so they are not repeated here.

### The handoff's changed lines, second reply (after rulings 27 to 29)

```diff
@@ status line
- ... twenty questions are ruled, two are closed, three are settled in the build and four stay open (section 11).
+ ... twenty-three questions are ruled, two are closed, three are settled in the build and one stays open (section 11).
@@ section 5, the rows paragraph
- Rows are not controls. Both clocks are always on the row and the TV pill is gone, so nothing expands on a fixture row. No row number (D12). No decorative motion.
+ Rows are not controls. Both clocks are always on the row, except that an unsettled row (postponed, cancelled, suspended or abandoned) prints neither clock, and the TV pill is gone, so nothing expands on a fixture row. No row number (D12). No decorative motion.
@@ section 5, the StatusPill table
+ | KICKED OFF | amber outline | amber | Amber | Two cases, both with both clocks kept. A match the snapshot last saw in play, whose kickoff is now too long ago to believe it is still live (Beni, 14 Nov 2026): the snapshot's last score is kept, beside the pill, in amber, inside rule 4's third use (ruled 17 Nov 2026, question 27). It is not a final, so it is not pitch; today's app sets it in pitch, and the build changes it. ILLUSTRATIVE specimen: Bayern Munich v FC Cologne, 1–0. A scheduled match past its kickoff: KICKED OFF in amber with no score, on the rows as in the Table's next-fixture cell (ruled 17 Nov 2026, question 29) |
+ | POSTPONED, CANCELLED, ABANDONED | cover-ink on blood | `fb-alarm` | Alarm | ILLUSTRATIVE specimens. The row prints no kickoff clock (R1, Beni, 15 Nov 2026): no Brooklyn clock in the leading slot or at the end of the Poster's first line, and no stadium clock on the second line. The day note, the leader and the "local" unit fall away with the clocks. The status word stays, in the alarm voice. Nothing takes the clock's place (ruled 17 Nov 2026, question 28): the Ledger's 62 px leading slot stays empty, so the clock column holds. The row keeps its place in its day by its stored kickoff, as the app orders it today. NEXT UP and the NEXT pill never name such a match, a cover band's kickoff list passes over it, and a day's first kickoff is the first among the matches that still have one |
+ | SUSPENDED | cover-ink on blood | `fb-alarm` | Alarm | Real: Rayo Vallecano v Athletic Club, Wed 9 Dec. No kickoff clock, as above |
@@ section 6, the States sheet
- ... and beside it the scheduled match past its kickoff, proposed for the rows (question 29), ...
+ ... and beside it the scheduled match past its kickoff, KICKED OFF with no score (question 29), ...
```

The three StatusPill rows above are each row's final text, replacing the handoff's original
KICKED OFF, unsettled and SUSPENDED rows.

### Section 11, as it reads after the rows pass

## 11. Questions, as they stand after 17 Nov 2026

Beni reviewed the second edition on 13 Nov 2026, ruled again on 14 Nov, and ruled on the gap-18 pass and on the rows pass on 17 Nov. Twenty-three questions are ruled, two are closed, three are settled in the build, and one stays open. The numbers are the first pass's, so a ruling can be traced.

Still open, for Beni:

| # | Question | Where it stands |
|---|---|---|
| 16 | **A full-size look at two photographs**, under rules 1 and 6. | The Friday cover's silhouetted figures under the tent; the fog plate's parked car. It stays open until Beni has looked at both at full size |

Ruled on 17 Nov 2026:

| # | Question | Ruling |
|---|---|---|
| 22 | **The play-off band.** | Yes. The destination's hue, broken: 4 px on, 3 px off |
| 23 | **The Eliminated band.** | Yes. Solid muted ink |
| 24 | **The filter toggle's two states and the panel's controls.** | Yes, with two corrections. A toggle's spoken name is the competition's name alone, "Premier League", and its state is `aria-pressed`: true when shown, false when hidden. When all fourteen are shown the top "Show all" is muted and disabled, not inert. The group controls keep their changing names ("Hide all Big 5 Leagues") and take no `aria-pressed` |
| 25 | **New words and derived figures in the filter panel.** | Yes: "0 of 14" and its spoken form; "Show all *group*" and "Hide all *group*", spoken; and Saturday's 11, 15, 0 and 26. Not the ", shown" and ", hidden" spoken suffixes, which are gone |
| 26 | **The season note.** New on 17 Nov. | It drops its last sentence. It reads "Zone bands are hidden: the snapshot is the 2026-27 season but the zone metadata describes 2025-26.", with the app filling in the two seasons. "Update LEAGUE_TABLES." is an instruction to the repository's maintainers and does not ship |
| 27 | **The kept score's voice under KICKED OFF.** | Yes: amber, inside rule 4's third use. Today's app sets it in pitch; the build changes it |
| 28 | **The clockless row.** | Yes: nothing takes the clock's place. The Ledger's 62 px leading slot stays empty, so the clock column holds. The row keeps its place in its day by its stored kickoff, as the app orders it today. NEXT UP and the NEXT pill never name such a match, a cover band's kickoff list passes over it, and a day's first kickoff is the first among the matches that still have one |
| 29 | **The scheduled match past its kickoff.** | Yes: KICKED OFF in amber on the rows, with no score and both clocks kept |

Ruled on 14 Nov 2026:

| # | Question | Ruling |
|---|---|---|
| 3 | **The wordmark.** | Oswald stays. The build sets it at the band's size. The boards still draw Abril Fatface and are not redrawn for it |
| 14 | **D14's record.** | The seven Pen-made photographs ship recorded with "model: not recorded" |
| 15 | **Missing covers.** | No new covers. The second Champions League night reuses the first night's plate, and a domestic midweek reuses the Friday cover |

Closed:

| # | Gap | How it closed |
|---|---|---|
| 17 | **The Table's open row and its W, D, L columns at 1000.** | Closed, not ruled: the figures came with the review, from the standings snapshot of 11 Nov 2026. The columns are filled at 1000 and Arsenal's row is drawn open at 390 |
| 18 | **The filter panel and Zones & key, opened.** | Closed by the pass of 17 Nov. Both are drawn on the Components page, in both themes, at 390, 360 and 1000, and specified in section 5 |

Settled in the build, not on the canvas:

| # | Gap | How |
|---|---|---|
| 19 | **The title swap at 1.45 s.** | The title swap watched on a phone |
| 20 | **No phone benchmark.** | A phone benchmark |
| 21 | **How long a tapped cover takes to grow into its book.** | The cover's growth chosen from 220, 320, 450 and 600 ms |

Ruled, and redrawn in the rows pass of 17 Nov:

- 14 Nov: a stale LIVE row keeps its last score under KICKED OFF. Drawn on the rows board and on states sheet E, in both lenses and both themes.
- R1, 15 Nov: a postponed, cancelled, suspended or abandoned row prints no kickoff clock, neither in its leading slot nor when the row is opened. Drawn on the rows board at 390 and 360 and on states sheet D and I, in both lenses and both themes.
- 17 Nov: a scheduled match past its kickoff reads KICKED OFF on the rows, with no score. Drawn on the rows board and on states sheet E.

Also ruled, with boards to follow in a later pass, before the Poster is built. Nothing is redrawn for these yet.

- A book closes only when every match of its day is FT, AET or PENS.
- No cycles and no time-of-day rules on a heavy day.
- One title per day type, and no title spells a count.
- Moments' ground and inks take the second edition's tokens, with its layout untouched.
- Since 14 Nov (16 Nov): on a light page, a paper surface inside a black one takes the paper voices, and on a dark page every surface takes the black voices.

Ruled on 13 Nov 2026:

| # | Question | Ruling |
|---|---|---|
| 1 | **Rule 3's exception.** | Accepted as drawn. A day summary shows the first kickoff in Brooklyn time only: every cover's date line, part opener, rack face and spine |
| 2 | **The cover library.** | Accepted as drawn. Covers are keyed to the day type and reused week to week: eleven slots |
| 4 | **The alarm voice.** | Accepted as drawn. Blood, with burnt orange retired |
| 5 | **The Brooklyn clock and scores in pitch.** | Accepted as drawn |
| 6 | **Form pips.** | Accepted as drawn. Ink, outline and blood |
| 7 | **Amber's uses.** | Eight. Rule 4's six, plus a UEFA matchday line that is rescheduled or falls outside UEFA's published windows (a computed line stays in ink), and a stadium clock whose zone is not known, which reads "local time not known" |
| 8 | **The emoji vocabulary.** | Accepted as drawn. Six drawn glyphs and no emoji |
| 9 | **The week row's year.** | Accepted as drawn. The year shows only outside the current Brooklyn year or across New Year, at every width |
| 10 | **The measure at 1000.** | Accepted as drawn. 640 for Poster and Ledger, 780 for the Table |
| 11 | **The stadium clock's format.** | "20:30 local" on every row, cover band, Table cell and NEXT UP card: 24-hour, then the word local, never a zone abbreviation. The Brooklyn clock is unchanged |
| 12 | **Page length.** | Accepted as drawn. The band grows 6 px, the league tabs 28 px, and the pips take their own line |
| 13 | **NEXT UP gains the stadium clock.** | Accepted as drawn |

Also confirmed on 13 Nov 2026, outside the numbered list: the cover's lower band follows kickoff order on a day that mixes groups (section 5).

One thing is undrawn by design. An unsettled row sitting among the other rows of its day is
stated on the rows board and in the handoff ("keeps its place in its day by its stored
kickoff"), but no specimen shows one. PR 3 pins it with a test instead.
