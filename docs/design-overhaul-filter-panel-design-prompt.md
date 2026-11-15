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
