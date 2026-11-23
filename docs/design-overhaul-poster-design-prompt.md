# Fergie Time second edition — the Poster before it is built (Claude Design brief, archived Mon 23 Nov 2026, TZ=America/New_York)

Written by the Track A PM seat (Claude Code, `claude-fable-5-2` at `xhigh`) on Mon 23 Nov 2026 at
about 12:25 PM EST, from a fresh read of the integration branch at `45b7bc6` and `origin/main` at
`ffc5cac`. To be pasted into the same Claude Design chat as the "Fergie Time — second edition"
canvas. It is the pass that
[`design-overhaul-rows-design-prompt.md`](design-overhaul-rows-design-prompt.md) left for "a later
pass, before PR 5". Beni ruled that morning that the order is "Leak, then Design", and that PR 5's
build brief waits for what this pass produces. The delivery was the fenced block in chat; this
copy is the archive.

Read fresh for it:
- the handoff's sections 5 ("The books", "Rows and states", "Page controls"), 6, 7, 9 and 11
  ([`second-edition-handoff.md`](design/5-handoff/second-edition-handoff.md)), and the whole of
  the gap-18 addendum ([`gap-18-addendum.md`](design/5-handoff/gap-18-addendum.md)), whose last
  section 11 is the later word;
- the rules note ([`rules-note.txt`](design/5-handoff/rules-note.txt)), rule 9 above all;
- the build plan's sections 1.2, 1.7, 3 and 10.4, and its questions 15, 16 and 18
  ([`design-overhaul-plan.md`](design-overhaul-plan.md)), with Beni's rulings on them in
  [`design-overhaul-plan-review.md`](design-overhaul-plan-review.md);
- boards 03, 06, 18 and 19 of the handoff set under [`design/5-handoff/`](design/5-handoff/);
- at `45b7bc6`: `src/components/PosterWeek.tsx`, the left rules in
  `src/components/TonightSlate.tsx`, `src/components/StatusPill.tsx` and the snapshot,
  `src/data/fixtures.json`;
- #359's body, for the all-hidden week's height (`gh pr view 359 --json body`), and the records
  of both review cycles
  ([`design-overhaul-pr3-review-prompt.md`](design-overhaul-pr3-review-prompt.md),
  [`design-overhaul-pr4-review-prompt.md`](design-overhaul-pr4-review-prompt.md)).

Not read: boards 09, 13 and 16, and the Claude Design canvas itself, which this seat cannot open.
So whether the canvas's Poster template still shows a cycle or a time-of-day rule is unknown here
(the plan's risk 6), and the brief asks Claude Design to say.

## What the read found, and what the brief does with it

- **Seven of the thirteen titles spell a count.** The plan's string 13 lists thirteen titles.
  Twenty-Six Doors, Sixteen Bells, Three After Dark, Nine Lamps, Thirty-Six Windows, The Five and
  Twenty Rooms spell the day's count. Board 19 also shows that Friday, Saturday and Sunday have
  two titles each, one per week. Under ruling 16 four slots are left without a title, and a
  domestic midweek never had one.
- **Most of the approved taglines state a count as well.** Ruling 17 approved string 14's
  taglines "each with its title". On a cover that is reused every week, "Twenty-four whistles
  blew" is wrong beside "16 MATCHES". Ruling 16 names titles only, so this is the PM seat's
  reading, and the brief sends it to Beni as a question.
- **The eleven slots do not cover every day in the snapshot.** The snapshot at `45b7bc6` holds
  109 match days. Three kinds have no slot: a supercup alone (3 days), a domestic league with
  the Champions League (2), and the Champions League with the Europa or Conference League (1).
  No document states the rule that gives a day its slot.
- **A hidden day cannot be a part.** #359's 510.5 px is seven daily accounts, about 73 px each.
  Seven 156 px part openers alone come to 1,092 px.
- **"Strict" makes a state no board draws:** an open book with results in it. The snapshot has
  no such day yet, and its first real one is coming: the suspended match of Wed 9 Dec shares its
  day with nine others.
- **The canvas numbers its questions differently from the plan.** The plan's questions 15, 16
  and 18 are the canvas's unnumbered lines under "boards to follow in a later pass". The
  canvas's own 15, 16 and 18 are other matters. The brief names each ruling by its sentence.

The counts come from one script over
`git show origin/overhaul/second-edition:src/data/fixtures.json`, which groups fixtures by the
Brooklyn date of `kickoffUtc`: 1,446 fixtures; 263 `full_time`, 1,182 `scheduled`, 1
`suspended`; 109 match days; 77 of them over four matches; 13 with exactly one; the heaviest 36.
The week of 26 Oct holds 2, 3, 5, 2, 5, 22 and 16 matches, 55 in all. `meta.json` there says the
snapshot was synced on 19 Nov 2026.

````text
If this paste looks cut short, stop and tell Beni. The whole brief is archived: `git -C /Users/benicheni/code/kickoff show claude/track-a-archive-8:docs/design-overhaul-poster-design-prompt.md`. Its last line reads END OF BRIEF.

Fergie Time second edition — the Poster before it is built: a book closes only on finals, no cycles, one fixed title per day type, the all-hidden day, and no rule in a competition's hue

Work on this same canvas, "Fergie Time — second edition". This is one pass, in five parts, on the Poster only. It is the pass the rows brief of 17 Nov left for "before PR 5", and the Poster's build brief (PR 5) waits on it. The Ledger and the Table are built and are not redrawn. The Fergie Time design system stays untouched.

Settled, and not to reopen:
- everything section 11 lists as ruled, questions 27 to 29 included;
- the tokens, the voices and amber's eight uses;
- both clocks on every row, from one UTC instant, and no clock on an unsettled row;
- the row order: by group, then by kickoff, with ties in the snapshot's order;
- the cover band's kickoff order and its tie rule;
- rule 9's date line, and "20:30 local";
- the hit-area contract;
- the cover library's eleven slots, and no new photograph.
Text sits on a flat plane. Nothing sits over a photograph without its scrim.

A note on numbers. Three of the rulings below are the ones section 11 lists under "boards to follow in a later pass". The build plan numbers them 18, 15 and 16, and those are not this canvas's question numbers. I name each by its sentence.

What the build starts from. The snapshot on the build's branch was synced on 19 Nov 2026. It holds 1,446 fixtures on 109 match days: 263 at full time, 1,182 scheduled and one suspended (Rayo Vallecano v Athletic Club, Wed 9 Dec). It holds no match that ended after extra time or on penalties, none postponed, cancelled or abandoned, and no day on which some matches are final and others are not. So every specimen of those states is ILLUSTRATIVE and is captioned so.

1. A BOOK CLOSES ONLY ON FINALS. This is the ruling section 11 lists as "A book closes only when every match of its day is FT, AET or PENS" (Beni, 14 Nov 2026). A day with a postponed, cancelled, suspended or abandoned match stays open, with that row in the alarm voice, and FULL TIME is never printed over a match that was not played. Rule 9 says "when every match of the day is full time", and states sheet C draws only that case. Redraw:
- The closed book, on the books board and on states sheet C in both themes, for a day whose finals include one result after extra time and one on penalties. The date line still ends FULL TIME. On the band, show how each of those two results is printed. The app's own forms are the words AET and PENS, and a shootout in brackets after the score, as in "3–3 (2–4)". ILLUSTRATIVE.
- The book that cannot close: Sunday 8 November's 24 matches, with one of them abandoned and the other 23 final. ILLUSTRATIVE; in the snapshot all 24 are at full time. Draw its cover, its date line and its band at 390 and 360, in both themes. It keeps its own photograph and does not turn to the dawn plate. Say what its date line ends with, using rule 9's three forms and no new words. A day's first kickoff is the first among the matches that still have one (question 28).
- An open book with results in it. No board draws a day that is under way, nor the day above once its last match has finished. Propose what the band prints then, from what is already ruled: only stored results; scores in pitch; a live score in ink beside LIVE in the alarm voice; KICKED OFF in amber; both clocks on a fixture still to come; a tie never broken; an unsettled match passed over by the kickoff list. Say whether results or fixtures lead the band.
- The real case that is coming. On Wed 9 Dec the suspended match shares its day with nine others, ten in all, across the Champions League and a domestic league. That book stays open after the other nine finish. Draw nothing new for it; say that your answer above covers it.

2. NO CYCLES AND NO TIME-OF-DAY RULES. This is the ruling section 11 lists as "No cycles and no time-of-day rules on a heavy day" (Beni, 14 Nov 2026): a heavy day's "more" opens ordinary rows with both clocks. The Pen boards for a heavy day group Saturday's 26 matches under MORNING, MIDDAY and UNDER THE LIGHTS, and under headers such as "A CYCLE OF FIVE" that carry one Brooklyn clock for the rows beneath them. None of that is built. First say whether any template on this canvas still shows a cycle or a time-of-day rule. Then redraw:
- Saturday 21 November opened, at 390, 360 and 1000 in both themes: the part opener, the date line, the first rows, the "more" control now reading HIDE, and the rows it opened. All 26 are ordinary contents rows, each with both clocks, in the row order. No header, rule or label groups them, and no time of day is named.
- The rule the "more" control follows, which the handoff does not state: how many rows a day shows before it, and from what size of day it appears. The Poster template shows four rows and "Twenty-two more stories · 22 MATCHES · SAT · SHOW". In the snapshot 77 of the 109 match days hold more than four matches, the heaviest holds 36, and 13 hold exactly one. Propose the rule, and say what the control counts when filters hide part of the day.
- The label's spelled number. "Twenty-two more stories" sets a figure from the data in words. Say what the label reads for one match and for thirty-two. Or propose a label that spells no number and leaves the count to "22 MATCHES".
- The lines that hung on a cycle. "MORNING", "MIDDAY", "UNDER THE LIGHTS", "At noon there are no shadows to warn you.", "The lamps come on before anyone asks for them." and "A CYCLE OF FIVE" fall with the ruling. The asides "Fifteen minutes between doors. The house likes them close." and "Five doors at once. Nobody can watch five doors." sat under groups of kickoffs. Say where an aside sits now, and keep none whose truth depends on the day's fixtures.

3. ONE TITLE PER DAY TYPE. This is the ruling section 11 lists as "One title per day type, and no title spells a count" (Beni, 14 Nov 2026). The boards carry thirteen titles. Seven spell the day's count: Twenty-Six Doors, Sixteen Bells, Three After Dark, Nine Lamps, Thirty-Six Windows, The Five and Twenty Rooms. Six do not: The Fifth Minute, The Second Night, The Tower Counts, The Register, A Quiet Week and The Long Whistle. The boards also give Friday, Saturday and Sunday two titles each, one for each of two weeks. Redraw:
- The cover library as a table of its eleven slots, each with one fixed title: domestic Friday, Saturday, Sunday and Monday; the first and the second Champions League night; the Europa and Conference night; a domestic midweek; The Register; a closed book; the quiet week. Keep a title that spells no count where it fits its slot. By my reading four slots are left without one (Saturday, Monday, the first Champions League night, and the Europa and Conference night), and a domestic midweek has never had one. Propose those five, as new words for Beni.
- The taglines. On 14 Nov Beni approved the boards' taglines as listed, each with its title. Most of them state a count too: "Three matches on a Monday.", "Nine more.", "Twenty bells this time.", "Twenty names go in. Three are already falling.", "Twenty-four whistles blew, and every one was answered." On a cover that is reused every week, such a line is wrong in most weeks, and it sits beside a date line that gives the true count. That is my reading, and it is Beni's to rule. Propose one tagline for each slot that states no count, no league size and no weekday but its own, and list them as new words.
- The rule that gives a day its slot. No document states it. Here are the snapshot's 109 match days. Every Friday, Saturday, Sunday and Monday is domestic. A Tuesday is domestic (5 days), the Champions League (5) or a supercup alone (2). A Wednesday is domestic (7), the Champions League (3), a domestic league with the Champions League (2), the Champions League with the Europa or Conference League (1), or a supercup alone (1). A Thursday is a Europa and Conference night (7) or domestic (4). So three kinds of day have no slot of their own: a supercup, a day that mixes a domestic league with a European cup, and a day that mixes the European cups. Propose the rule, so that every day takes exactly one slot from its weekday and its competitions. Say which night is "the second" when a week has a Wednesday night and no Tuesday night.
- Every board that prints a title. Redraw the covers, the Rack's faces, the spines and the line "in The Fifth Minute" with the fixed titles. Give the Rack's spoken names in their new form; today one reads "Sixteen Bells, Sunday 22 November, 3 of 4".
Display titles stay live type under the foil. Every count stays on the date line, in Plex Mono.

4. THE ALL-HIDDEN DAY. A day whose fixtures the filters all hide keeps its own date line, with zero shown and its hidden count (Beni, 21 Nov 2026, "Keep"). Section 5 already says it: such a day "keeps its date line, loses its first kickoff, and reads "0 matches" and "26 hidden by filters"". On 23 Nov 2026 Beni ruled three more things. Keep stands. The line may be slimmer in the Poster's day blocks. And a week in which every day is hidden is no taller than 510.5 px, at 360 and at 390. That figure is the build's own, measured on the week of 26 October with every competition hidden: seven days, each with its own account, about 73 px a day with the space between them. Before the ruling the same week was one line, 46 px tall. Redraw:
- The all-hidden day on the Poster, at 390 and 360, in both themes. It is not a part: seven 156 px plates alone would pass the ceiling twice. Draw its date line with "0 MATCHES" and no first kickoff, then "N hidden by filters" in muted ink, and nothing else. Say whether the part numbers skip it.
- The all-hidden week: Mon 26 Oct to Sun 1 Nov, with 2, 3, 5, 2, 5, 22 and 16 matches hidden, 55 in all. These counts are real. Give the height of the seven blocks together at 360 and at 390, from the top of the first to the bottom of the last. It must not pass 510.5 px, and less is welcome.
- A mixed week: a part with rows, then an all-hidden day, then a part with rows, so the build can see the space on both sides.
- Today. When today is an all-hidden day, the build now prints a TODAY pill on a line of its own under the hidden count, and its review left that to this pass. Say how a part and an all-hidden day mark today, or that they do not. The week row's Today control is a control, not a marker.
- What the Rack and the shelf do with such a day, as a proposal: whether its book stays on the Rack and its spine on the shelf, and what its cover's date line, its band and its spine's count read. The plan's working rule is that counts follow the filters, as states sheet F does.
The Ledger's all-hidden day is built and is not redrawn.

5. NO RULE IN A COMPETITION'S HUE. The first edition's Poster marks competitions with three left rules, and all three are still in the build: a 12 px rule down a heavy day's header in the hue of that day's leading competition, the same rule down the hero, and a 4 px rule beside each of the hero's fixtures in its own competition's hue. On 22 Nov 2026 Beni left them to the PR that repaints the Poster, which is PR 5. Section 2 gives a competition's hue two forms only, an 8 px dot and a zone band, never text and never a tint. So:
- Check every Poster board on the canvas, and say that none carries a rule, an edge, a bar or a tint in a competition's hue. Name any that does, and redraw it.
- Write the rule into section 5, under "The books", in one sentence.
- Say whether a fixture on the cover's lower band carries the 8 px dot. The contents rows carry it, and the band on the Pen boards shows none.
- Say that nothing replaces the rules: no part of a cover, a part opener or a date line tells the reader which competition leads the day. If you think something should, put it as a question and draw nothing.

THE HANDOFF, BROUGHT IN LINE. Fold this pass into the handoff. In section 11, move the three sentences of parts 1 to 3 from "boards to follow in a later pass" to a list of what was ruled and redrawn in the Poster pass of 23 Nov, and add the all-hidden day and the retired rules to it. Leave the other two lines of that list where they are; this pass does not draw them. Bring section 5's "The books" and "Page controls", section 7's cover library and section 9's note on rule 9 in line with parts 1 to 5. Change nothing else.

On the Questions board, record the five matters above as redrawn in this pass. Record each new proposal as a numbered question for Beni, starting at 30, with your recommendation first and an answer he can give in one word.

Not part of this pass: the Rack's rotation, its swipe and the page after a book is opened; the photographs; the decorative layer; the Ledger; the Table; Moments.

Fences, unchanged:
- write no code and change no file in the repository;
- do not change the Fergie Time design system;
- pick no version number;
- show no real money figure;
- do not restructure the Table;
- generate no photograph.
Every figure and sentence you place is either already on the canvas or given above. List any new words for Beni's approval.

Report back, in chat:
- the boards you changed, and the frames each holds;
- the cover library's table, with each slot's title and tagline, and which of them are new words;
- each proposal, numbered from 30;
- the heights of the all-hidden day and of the all-hidden week, at 360 and at 390;
- any new ink-and-ground pair's contrast, computed as in section 2; I expect none;
- the handoff's changed lines, as a diff;
- anything you could not do.

END OF BRIEF
````
