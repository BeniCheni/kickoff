# Fergie Time second edition — gap 18: the filter panel and Zones & key, opened (Claude Design brief, archived Sat 14 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Sat 14 Nov 2026 at about 10 PM, from a fresh read
of `origin/main` at `9b0417e` and the second edition's handoff, after Beni ruled question 14 of
[design-overhaul-plan.md](design-overhaul-plan.md) "Board" (rulings in
[design-overhaul-plan-review.md](design-overhaul-plan-review.md)). To be pasted into the same Claude
Design chat as the second edition's canvas. The week row's build brief (PR 3) and the Table's (PR 4)
wait on its result. Archive copy; the delivery was the fenced block in chat.

---

````text
Fergie Time second edition — gap 18: the filter panel and Zones & key, opened

Work on this same canvas, "Fergie Time — second edition". One short pass: draw the two components that the handoff lists as gap 18, opened, and record Beni's rulings of 14 Nov on the Questions board. Keep everything else as it is. The Fergie Time design system itself stays untouched.

Why now. The overhaul is being built before the Next.js cutover, as ten PRs, and the build briefs for the week row and for the Table cannot be written until these two are drawn. Both are live in the app today; neither was drawn in the spike or in the second edition.

Settled, and not to reopen: the tokens and measured pairs (handoff §2); the voice map and amber's eight uses (§3); the type and the six glyphs, with no emoji (§4); the hit-area contract H1 to H4 and 44 px pitches (§5); the 150, 180 and 220 ms state budget (§8); a competition hue is an 8 px dot or a zone band, never text and never a tint (§2, comp-*); the Table's structure (D4). Text sits on a flat plane, pulp, typescript or cover-black; nothing here sits over a photograph.

1. THE FILTER PANEL, OPENED. It opens from the week row's Filters control (whose closed forms are drawn: "Filters · all 14", "Filters · 14", glyph and count, "3 of 14"), below the week row, in the page measure (16 px gutter at 360 and 390, 640 px at 1000), as a 180 ms disclosure. Draw it on Poster's pulp and on the Ledger's typescript, in both themes, at 390, 360 and 1000.
What it holds today, in the live app's words (keep them; any new words go to Beni for approval): a line, "Hide a competition here and it disappears everywhere below.", with a "Show all" control; then three groups in this order, each with its label and a "Show all" / "Hide all" control for the group; and fourteen competition toggles, each a real button with a pressed state.
- Big 5 Leagues: La Liga #D85A30, Premier League #7F77DD, Serie A #1D9E75, Ligue 1 #378ADD, Bundesliga #BA7517.
- European Cups: UEFA Super Cup #C4272F, Champions League #8B6FE8, Europa League #FF7A00, Conference League #2FB8C4.
- Domestic Supercups: FA Community Shield #6B4226, Trophée des Champions #C05780, DFL-Supercup #2F4B7C, Supercoppa Italiana #1B4B5A, Supercopa de España #8B1E3F.
The problem to solve. Today an "on" toggle is filled with its competition's hue and carries a flag emoji. The second edition forbids both: a hue may only be an 8 px dot, and no emoji is set. Design the on and off states from the existing voices (ink, pitch, muted, rule) with the competition's dot, so that on and off differ by more than colour and read at 360. Each toggle's hit area is at least 44 × 44 px (H1, H2), and no row of toggles makes the page scroll sideways at 360. Spoken names are full ("Premier League, shown").
States to draw: all fourteen shown; a filtered state that matches "3 of 14" (Premier League, Champions League and La Liga shown); one group hidden; and every competition hidden, with what the label then reads. Show what the week below says in the filtered state, using the "19 hidden by filters" line already drawn.

2. ZONES & KEY, OPENED. The 44 px disclosure on the Table is drawn closed; draw it open, 180 ms, on pulp, in both themes, at 390, 360 and 1000 (in the Table's 780 px measure at 1000). What it holds today, in the live app's words: "Qualification zones", one line per zone (its band, its name, its positions in Plex Mono, and a one-line note); "Columns", a short paragraph explaining Pts, Pl, GD, PPG, Form and Next; and "How ties are broken", one paragraph. Use the real Premier League content, copied from the app (src/lib/competitions.ts at 9b0417e):
- Champions League, 1–5, Champions League hue: "League phase. England holds a fifth berth on the 2025-26 association coefficient — it is not permanent."
- Europa League, 6, Europa League hue: "League phase. Shifts down a place when the FA Cup winner has already qualified through the league."
- Conference League, 7, Conference League hue: "Play-off round. Nominally the League Cup winner’s spot; it falls to the league when they qualify elsewhere."
- Relegation, 18–20: "Straight drop to the Championship. No play-off in England."
- Columns: "Pts points · Pl played · GD goal difference · PPG points per game — the honest comparator while clubs have games in hand · Form results oldest to newest, W / D / L lettered, not colour alone · Next the club's next league match — midweek European and cup ties are not shown here."
- How ties are broken: "The Premier League separates level clubs on goal difference first, then goals scored; head-to-head only comes into it after both of those."
Then draw the Champions League's league-phase key at 390, both themes: Round of 16, 1–8 ("Direct entry to the round of 16."); Knockout play-offs, 9–24 ("Two-legged play-offs for the remaining round-of-16 places; ranks 9–16 are seeded."); Eliminated, 25–36 ("No transfer to another UEFA competition."). Its Columns paragraph reads "different opponents limit the comparison" in place of the games-in-hand clause, and its Next clause reads "match in this competition; domestic and other cup ties are not shown here."
The decision this board must make. Today a play-off zone's band is the first edition's floodlight, an amber (the Champions League's knockout play-offs; Ligue 1's UCL qualifying place and relegation play-off; the Bundesliga's relegation play-off), and the Champions League's Eliminated band uses the retired burnt orange. In the second edition amber has eight uses and a zone is not one of them; relegation is blood. Propose the play-off band and the Eliminated band from the existing tokens, with no tint and no ninth amber use, and draw one Bundesliga key at 390 to show it: Champions League 1–4, Europa League 5, Conference League 6, Relegation play-off 16 ("Two-legged play-off against the third-placed 2. Bundesliga side."), Relegation 17–18 ("Straight drop to 2. Bundesliga."). If no existing token will do, propose one and flag it as a token proposal for Beni; do not add it silently.
One more line lives here today: when the zone data describes a different season from the snapshot, the bands are hidden and a note says so. Say where that note sits and in which voice; it is not one of amber's eight uses.

3. THE QUESTIONS BOARD. Beni ruled on 14 Nov 2026. Record: 3, the wordmark stays Oswald (the build sets it at the band's size; do not redraw the boards for it); 14, the seven Pen-made photographs ship recorded with "model: not recorded"; 15, no new covers: the second Champions League night reuses the first night's plate and a domestic midweek reuses the Friday cover; 16 stays open until Beni has looked at the two photographs at full size; 18 is closed by this pass; 19, 20 and 21 are settled in the build (the title swap watched on a phone, a phone benchmark, and the cover's growth chosen from 220, 320, 450 and 600 ms). Note these rulings too, without redrawing anything for them in this pass: a stale LIVE row keeps its last score under KICKED OFF; a book closes only when every match of its day is FT, AET or PENS; no cycles and no time-of-day rules on a heavy day; one title per day type, and no title spells a count; Moments' ground and inks take the second edition's tokens, with its layout untouched. The boards those last rulings change come in a later pass, before the Poster is built.

Fences, unchanged: write no code and change no file in the repository; do not change the Fergie Time design system; pick no version number; show no real money figure; do not restructure the Table; generate no photograph. Every figure and every sentence you place is one given above or one already on the canvas; any new words are listed for Beni's approval.

Report back, in chat: the boards you added and the frames each holds; your answer to the play-off and Eliminated bands, with every new ink-and-ground pair's contrast computed as in §2; and a handoff addendum in the handoff's own format: a "Filter panel" entry under §5's Page controls, a "Zones & key" entry under §5's The Table, and §11 with gap 18 closed. List any new words, and anything you could not do.
````

---

## Refreshed and re-delivered, Tue 17 Nov 2026 (about 1:35 PM EST)

The board had not been drawn by Tue 17 Nov (Beni: "Not yet"), so the PM seat re-read the brief
against the repository before re-delivering it.
- **No quoted string has changed.** No commit since `9b0417e` touches `src/lib/competitions.ts`,
  `src/components/FilterBar.tsx` or `src/components/TablePage.tsx`. Every app string the brief
  quotes is still in `src/` on `main` at `a16336f`, word for word.
- **Two state lines had gone stale.** PR 0 (#327) and PR 1 (#330) have merged, and the plan gained
  a PR 1b (the font split) on Mon 16 Nov. PR 3 and PR 4, whose briefs wait on this board, come
  after the chrome PR, which Cursor starts on Thu 19 Nov.
- **Two rulings made since affect the canvas.** The Questions board notes them; they are redrawn
  in a later pass:
  - R1 (Sun 15 Nov 2026): a postponed, cancelled, suspended or abandoned row prints no kickoff
    clock, neither in the row's leading slot nor when the row is opened;
  - the stock nest (Mon 16 Nov 2026): on a light page, a paper surface inside a black one takes
    the paper voices; on a dark page every surface takes the black voices.

The block below is the one re-delivered in chat.

````text
Fergie Time second edition — gap 18: the filter panel and Zones & key, opened

Work on this same canvas, "Fergie Time — second edition". One short pass: draw the two components that the handoff lists as gap 18, opened, and record Beni's rulings on the Questions board. Keep everything else as it is. The Fergie Time design system itself stays untouched.

Why now. The overhaul is being built before the Next.js cutover, PR by PR into one integration branch. PR 0 (tests and tooling) and PR 1 (tokens and type) have merged. The chrome PR and the font split start on Thu 19 Nov 2026. The build briefs for the week row (PR 3) and for the Table (PR 4) cannot be written until these two components are drawn. Both are live in the app today; neither was drawn in the spike or in the second edition.

Settled, and not to reopen:
- the tokens and measured pairs (handoff §2);
- the voice map and amber's eight uses (§3);
- the type and the six glyphs, with no emoji (§4);
- the hit-area contract H1 to H4, and 44 px pitches (§5);
- the 150, 180 and 220 ms state budget (§8);
- a competition hue is an 8 px dot or a zone band, never text and never a tint (§2, comp-*);
- the Table's structure (D4).
Text sits on a flat plane: pulp, typescript or cover-black. Nothing here sits over a photograph.

1. THE FILTER PANEL, OPENED. It opens from the week row's Filters control, whose closed forms are drawn: "Filters · all 14", "Filters · 14", glyph and count, and "3 of 14". It opens below the week row, in the page measure (a 16 px gutter at 360 and 390, 640 px at 1000), as a 180 ms disclosure. Draw it on Poster's pulp and on the Ledger's typescript, in both themes, at 390, 360 and 1000.
What it holds today, in the live app's words. Keep them; any new words go to Beni for approval.
- A line, "Hide a competition here and it disappears everywhere below.", with a "Show all" control.
- Three groups, in this order, each with its label and a "Show all" / "Hide all" control for the group.
- Fourteen competition toggles, each a real button with a pressed state:
  - Big 5 Leagues: La Liga #D85A30, Premier League #7F77DD, Serie A #1D9E75, Ligue 1 #378ADD, Bundesliga #BA7517.
  - European Cups: UEFA Super Cup #C4272F, Champions League #8B6FE8, Europa League #FF7A00, Conference League #2FB8C4.
  - Domestic Supercups: FA Community Shield #6B4226, Trophée des Champions #C05780, DFL-Supercup #2F4B7C, Supercoppa Italiana #1B4B5A, Supercopa de España #8B1E3F.
The problem to solve. Today an "on" toggle is filled with its competition's hue and carries a flag emoji. The second edition forbids both: a hue may only be an 8 px dot, and no emoji is set. Design the on and off states from the existing voices (ink, pitch, muted, rule), with the competition's dot, so that on and off differ by more than colour and still read at 360.
- Each toggle's hit area is at least 44 × 44 px (H1, H2).
- No row of toggles makes the page scroll sideways at 360.
- Spoken names are full, for example "Premier League, shown".
States to draw:
- all fourteen shown;
- a filtered state that matches "3 of 14" (Premier League, Champions League and La Liga shown);
- one group hidden;
- every competition hidden, and what the label then reads.
Show what the week below says in the filtered state, using the "19 hidden by filters" line already drawn.

2. ZONES & KEY, OPENED. The 44 px disclosure on the Table is drawn closed. Draw it open (180 ms, on pulp) in both themes, at 390, 360 and 1000; at 1000 it sits in the Table's 780 px measure.
What it holds today, in the live app's words:
- "Qualification zones": one line per zone, with its band, its name, its positions in Plex Mono, and a one-line note;
- "Columns": a short paragraph explaining Pts, Pl, GD, PPG, Form and Next;
- "How ties are broken": one paragraph.
Use the real Premier League content, copied from the app (src/lib/competitions.ts and src/components/TablePage.tsx at a16336f, unchanged since 9b0417e):
- Champions League, 1–5, in the Champions League hue: "League phase. England holds a fifth berth on the 2025-26 association coefficient — it is not permanent."
- Europa League, 6, in the Europa League hue: "League phase. Shifts down a place when the FA Cup winner has already qualified through the league."
- Conference League, 7, in the Conference League hue: "Play-off round. Nominally the League Cup winner’s spot; it falls to the league when they qualify elsewhere."
- Relegation, 18–20: "Straight drop to the Championship. No play-off in England."
- Columns: "Pts points · Pl played · GD goal difference · PPG points per game — the honest comparator while clubs have games in hand · Form results oldest to newest, W / D / L lettered, not colour alone · Next the club's next league match — midweek European and cup ties are not shown here."
- How ties are broken: "The Premier League separates level clubs on goal difference first, then goals scored; head-to-head only comes into it after both of those."
Then draw the Champions League's league-phase key at 390, in both themes:
- Round of 16, 1–8: "Direct entry to the round of 16."
- Knockout play-offs, 9–24: "Two-legged play-offs for the remaining round-of-16 places; ranks 9–16 are seeded."
- Eliminated, 25–36: "No transfer to another UEFA competition."
Its Columns paragraph reads "different opponents limit the comparison" in place of the games-in-hand clause, and its Next clause reads "match in this competition; domestic and other cup ties are not shown here."
The decision this board must make. Today a play-off zone's band is the first edition's floodlight, which is an amber: the Champions League's knockout play-offs, Ligue 1's UCL qualifying place and relegation play-off, and the Bundesliga's relegation play-off. The Champions League's Eliminated band uses the retired burnt orange. In the second edition amber has eight uses, and a zone is not one of them; relegation is blood.
- Propose the play-off band and the Eliminated band from the existing tokens, with no tint and no ninth amber use.
- Draw one Bundesliga key at 390 to show them: Champions League 1–4, Europa League 5, Conference League 6, Relegation play-off 16 ("Two-legged play-off against the third-placed 2. Bundesliga side."), and Relegation 17–18 ("Straight drop to 2. Bundesliga.").
- If no existing token will do, propose one and flag it as a token proposal for Beni. Do not add it silently.
One more line lives here today: when the zone data describes a different season from the snapshot, the bands are hidden and a note says so. Say where that note sits and in which voice. It is not one of amber's eight uses.

3. THE QUESTIONS BOARD. Record Beni's rulings of 14 Nov 2026:
- 3: the wordmark stays Oswald. The build sets it at the band's size; do not redraw the boards for it.
- 14: the seven Pen-made photographs ship recorded with "model: not recorded".
- 15: no new covers. The second Champions League night reuses the first night's plate, and a domestic midweek reuses the Friday cover.
- 16: stays open until Beni has looked at the two photographs at full size.
- 18: closed by this pass.
- 19, 20 and 21: settled in the build (the title swap watched on a phone, a phone benchmark, and the cover's growth chosen from 220, 320, 450 and 600 ms).
Note these rulings too, without redrawing anything for them in this pass:
- a stale LIVE row keeps its last score under KICKED OFF;
- a book closes only when every match of its day is FT, AET or PENS;
- no cycles and no time-of-day rules on a heavy day;
- one title per day type, and no title spells a count;
- Moments' ground and inks take the second edition's tokens, with its layout untouched;
- since 14 Nov: a postponed, cancelled, suspended or abandoned row prints no kickoff clock, neither in its leading slot nor when the row is opened (15 Nov);
- since 14 Nov: on a light page, a paper surface inside a black one takes the paper voices, and on a dark page every surface takes the black voices (16 Nov).
The boards those rulings change come in a later pass, before the rows and the Poster are built.

Fences, unchanged:
- write no code and change no file in the repository;
- do not change the Fergie Time design system;
- pick no version number;
- show no real money figure;
- do not restructure the Table;
- generate no photograph.
Every figure and every sentence you place is one given above or one already on the canvas. Any new words are listed for Beni's approval.

Report back, in chat:
- the boards you added, and the frames each holds;
- your answer to the play-off and Eliminated bands, with every new ink-and-ground pair's contrast computed as in §2;
- a handoff addendum in the handoff's own format: a "Filter panel" entry under §5's Page controls, a "Zones & key" entry under §5's The Table, and §11 with gap 18 closed;
- any new words, and anything you could not do.
````

---

## The result, the PM seat's check and Beni's rulings (Tue 17 Nov 2026, about 3:10 PM EST)

Claude Design drew gap 18 that afternoon and reported in its chat. Beni pasted the reply. It
added 26 artboards on the Components page:
- the filter panel, opened, with its four states, on Poster and on the Ledger;
- Zones & key, opened, for the Premier League, the Champions League's league phase and the
  Bundesliga.
It also wrote a handoff addendum for §5 and §11 in chat, leaving the handoff file unchanged. It
had no repository access, so it hatched the words it was not given and assembled two Columns
paragraphs.

Its band proposal:
- **A play-off for a place:** the destination's hue, broken 4 px on and 3 px off.
- **A relegation play-off:** blood, broken the same way.
- **Eliminated:** solid muted ink.
It adds no new token, no tint and no ninth amber use. The filter toggle is either "shown" (a
solid ink frame, with the competition's dot filled) or "hidden" (a broken muted frame, with a
hollow ring and no hue).

**What the PM seat checked against the repository.**
- **Every contrast figure matches.** All 14 that Claude Design gave match `tests/contrast.ts`'s
  `ratio()` (through `parseColor()`) to two decimals: ink 13.32 on pulp, 14.76 on typescript
  and 14.49 on the dark page; muted ink 7.00, 7.75 and 7.39; blood 5.17 and 2.65; the Champions
  League hue 2.82 and 4.86; and the four Supercup dots on dark pulp, 1.93 to 2.13.
- **"15, not 19" is right, and the brief was wrong.** The snapshot holds 26 matches on Sat 21
  Nov: Premier League 7, La Liga 4, Serie A 4, Bundesliga 6 and Ligue 1 5. So the 3-of-14
  filter shows 11 and hides 15, and "19 hidden" belongs to the Premier League alone.
- **The group control** matches `FilterBar.tsx`, which reads `allOn ? 'Hide all' : 'Show all'`.
- **Two Columns paragraphs.** Claude Design assembled the Champions League's from the brief's
  clauses and reused the Premier League's for the Bundesliga. Both match `TablePage.tsx`'s
  template. The app sets "*league*" in italics.
- **Two departures from the app.**
  - The spec gave each toggle both `aria-pressed` and a spoken name that changes ("Premier
    League, shown"), which announces the state twice. The brief had asked for that name.
    Today's `CompetitionChip` uses a fixed name with `aria-pressed`, the W3C pattern that plan
    5.2 follows.
  - The top "Show all" became "inert" when all fourteen are shown, which would take it out of
    the accessibility tree.
- **The season note** ends with "Update `LEAGUE_TABLES`.", which is an instruction to
  maintainers, shown on a page readers see.

**Ruled: "As recommended"** (Beni, about 3:05 PM EST).
- **22:** the play-off band is the destination's hue, broken 4 px on and 3 px off.
- **23:** the Eliminated band is solid muted ink.
- **24:** the toggle's two states and the panel's controls, with two corrections:
  - a toggle's spoken name is the competition's name alone, with `aria-pressed`;
  - the top "Show all" is muted and disabled, not inert, when all fourteen are shown.
- **25:** the new words and figures are approved: "0 of 14", "Show all / Hide all *group*"
  spoken, and Saturday's 11, 15, 0 and 26. The spoken suffixes ", shown" and ", hidden" are not.
- **26:** the season note drops "Update `LEAGUE_TABLES`." and keeps its first sentence.

**Carried forward, for the PR 3 and PR 4 briefs:**
- `CompetitionChip` serves both the filter panel and the Table's league picker today. The
  second edition draws them apart: the filter toggle in PR 3, the league tabs in PR 4. So the
  shared component splits, and its comment ("so the on/off treatment ... can never drift")
  stops being true.
- The four Supercup dots read at 1.93 to 2.13 on the dark page. The toggle's name carries the
  competition, so no rule is reopened.
- The first edition's `PLAYOFF` colour (`var(--floodlight)`) has three jobs in
  `LEAGUE_TABLES`: the Champions League's knockout play-offs, Ligue 1's "UCL Qualifying", and
  the two relegation play-offs. Under rulings 22 and 23 they split by destination. The
  Champions League's Eliminated band moves off `REL` to muted ink.

The follow-up below was delivered in chat for Claude Design. The final addendum, once folded, is
to be archived with the design record.

````text
Fergie Time second edition — gap 18, the follow-up: Beni's rulings, two corrections and the app's own words

Thank you for the gap-18 pass. The PM seat checked it against the repository:
- every contrast figure you gave matches the repository's own ratio function to two decimals;
- your Saturday counts are right. The snapshot holds 26 matches on Sat 21 Nov: Premier League 7, La Liga 4, Serie A 4, Bundesliga 6 and Ligue 1 5. So the 3-of-14 filter shows 11 and hides 15, and 19 belongs to the Premier League alone. Keep 11 and 15;
- your reading of the group control matches the app, which shows "Hide all" only while every competition in the group is shown.

BENI'S RULINGS, Tue 17 Nov 2026 ("As recommended"). Record each on the Questions board, as ruled:
- 22, the play-off band: yes. The destination's hue, broken 4 px on and 3 px off.
- 23, the Eliminated band: yes. Solid muted ink.
- 24, the filter toggle's two states and the panel's controls: yes, with the two corrections below.
- 25, the new words and derived figures: yes. That covers "0 of 14" and its spoken form; "Show all <group>" and "Hide all <group>" spoken; and Saturday's 11, 15, 0 and 26. It does not cover the ", shown" and ", hidden" spoken suffixes.
- 26, new: the season note drops its last sentence (below).

TWO CORRECTIONS.
1. A toggle's spoken name is the competition's name alone, "Premier League", and its state is aria-pressed: true when shown, false when hidden. Today's app does exactly this. A name that also says "shown" or "hidden" would make a screen reader announce the state twice. The W3C button pattern allows a fixed name with aria-pressed, or a changing name without it, but not both. The PM seat's brief asked for "Premier League, shown"; that was the brief's mistake, not yours. The group controls keep their changing names ("Hide all Big 5 Leagues") and take no aria-pressed: they are actions, not toggles.
2. When all fourteen are shown, the top "Show all" is muted and disabled, not inert. Inert would take it out of the accessibility tree; a disabled button is still announced, as unavailable.

THE APP'S OWN WORDS, for the places you hatched or assembled. They come from src/lib/competitions.ts and src/components/TablePage.tsx on main at 2aea6c8.
- The Bundesliga's zone notes:
  - Champions League, 1–4: "League phase."
  - Europa League, 5: "League phase. Shifts down a place when the DFB-Pokal winner has already qualified through the league."
  - Conference League, 6: "Play-off round, not the league phase directly."
  - The Relegation play-off and Relegation entries are as you drew them.
- How ties are broken, Bundesliga: "The Bundesliga separates level clubs on goal difference first, then goals scored, then head-to-head."
- How ties are broken, the Champions League's league phase: "The Champions League league phase separates level clubs on goal difference first, then goals scored, then away goals, then wins and away wins; only after that do the opponents' collective records, disciplinary points and the club coefficient come into it (Article 18, UEFA Champions League regulations 2026/27)."
- Columns: your assembly is right for both. The Champions League's reads as you built it. The Bundesliga's is the league paragraph, the same as the Premier League's. One detail: in the league paragraph, the word "league" in "the club's next league match" is set in italics.
- The season note (ruling 26): "Zone bands are hidden: the snapshot is the 2026-27 season but the zone metadata describes 2025-26." The app fills in the two seasons; draw them as shown. The app's last sentence, "Update LEAGUE_TABLES.", is an instruction to the repository's maintainers, and it does not ship.

WHAT TO DO.
- Replace the hatched bars with these words. Correct the toggle's spoken name and the top "Show all"'s state, on the doc board and in the addendum.
- Fold the addendum into the handoff, on the canvas and in its folder: §5's Page controls ("Filter panel"), §5's The Table ("Zones & key, opened"), and §11, with 22 to 26 recorded as ruled.
- Change nothing else. The fences are the same as before: no code; no change to the repository or to the Fergie Time design system; no version number; no money figure; no change to the Table's structure; no photograph.

Report back, in chat:
- the boards you changed;
- the final addendum, in the handoff's format, as you folded it;
- anything you could not do.
````
