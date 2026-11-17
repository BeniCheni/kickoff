# Fergie Time second edition — the rows before they are built (Claude Design brief, archived Tue 17 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Tue 17 Nov 2026 at about 3:40 PM EST, at Beni's
word ("Yes, draft it"), from a fresh read of `main` at `2aea6c8`. To be pasted into the same Claude
Design chat as the "Fergie Time — second edition" canvas. The rows' build brief (PR 3) waits on
its result. The Poster's rulings (a book closes only on finals, no cycles, one title per day type)
wait for a later pass, before PR 5. The delivery was the fenced block in chat; this copy is the
archive.

Read fresh for it:
- the handoff's §5 "Rows and states", with its StatusPill table, and the States sheet's rows in
  §6;
- section 11 of the gap-18 addendum ([`gap-18-addendum.md`](design/5-handoff/gap-18-addendum.md));
- the build plan's question 13 and §1.7 row 13;
- R1, in [`design-overhaul-pr0-review-prompt.md`](design-overhaul-pr0-review-prompt.md);
- at `2aea6c8`:
  - `src/components/FixtureRow.tsx`, which marks a stale `in_play` row KICKED OFF, keeps its
    score in pitch, and prints the Brooklyn clock unless the time is a placeholder;
  - `src/lib/lensSelectors.ts`, where an unsettled fixture is never next and is skipped by a
    day's kickoff bounds;
  - `src/lib/schema.ts`, whose `unsettledStatus` set is the four statuses.

Two things this brief settles, each with its reason:
- **The stale-LIVE case and the handoff's States E are two different states.** The plan's
  question 13 kept the snapshot's score on a row the app last saw in play. The handoff's
  specimen is a scheduled match past its kickoff, which the rows do not mark today. Each gets
  its own answer.
- **The clockless row is not "a time not set".** That state is amber's second use (the league
  has not set a time). An unsettled match had a time and lost it, so the brief rules out
  borrowing the dash and the amber line.

````text
Fergie Time second edition — the rows before they are built: KICKED OFF with its last score, an unsettled row without a clock, and the handoff brought in line

Work on this same canvas, "Fergie Time — second edition". This is one short pass, in three parts: redraw what two of Beni's rulings change on the rows, and bring the handoff's earlier sections in line with section 11. The Fergie Time design system stays untouched. The rows' build brief (PR 3) waits on this pass. The Poster's rulings (a book closes only on finals, no cycles, one title per day type) wait for a later pass, before PR 5, and are not part of this one.

Settled, and not to reopen:
- everything section 11 lists as ruled;
- the tokens, the voices and amber's eight uses;
- the StatusPill's sizes;
- the wrap rules W1 and W3;
- both clocks on every row, from one UTC instant;
- the row order;
- "20:30 local".
Text sits on a flat plane. Nothing here sits over a photograph.

1. KICKED OFF KEEPS ITS LAST SCORE. This is the ruling section 11 lists as "A stale LIVE row keeps its last score under KICKED OFF" (Beni, 14 Nov 2026). The handoff's StatusPill table says KICKED OFF shows no score, and the States sheet's E draws a scheduled match past its kickoff. The ruling concerns a different case, the one the app marks today: a match the snapshot last saw in play, whose kickoff is now too long ago to believe it is still live. The app's row keeps the snapshot's score and says KICKED OFF in amber (rule 4's third use), and a test pins both. Redraw:
- The StatusPill table's KICKED OFF line: the snapshot's last score is kept, beside the pill, in place of "No score shown". Choose the score's voice and say why. It is not a final, so it is not pitch, which confirms. Today's app sets it in pitch, so this is a change the build will make.
- On the rows board and on the States sheet (both themes), a Poster row and a Ledger row for this case. Use Bayern Munich v FC Cologne, the existing ILLUSTRATIVE specimen, now with a score the snapshot last held, captioned ILLUSTRATIVE.
- The scheduled match past its kickoff (today's States E): the rows do not mark it today, though the Table does, in its next-fixture cell. Keep E as drawn for the Table. For the rows, propose to Beni whether such a row reads KICKED OFF with no score, or nothing at all.

2. AN UNSETTLED ROW PRINTS NO CLOCK. This is R1 (Beni, 15 Nov 2026), which section 11 lists. A postponed, cancelled, suspended or abandoned match keeps its stored kickoff in the snapshot, but that kickoff is no longer a promise. Its row prints no kickoff clock: no Brooklyn clock in the leading slot or at the end of the Poster's first line, and no stadium clock on the second line. The status word stays, in the alarm voice, as drawn. Redraw:
- The real SUSPENDED row (Rayo Vallecano v Athletic Club, Wed 9 Dec) and the POSTPONED, CANCELLED and ABANDONED specimens: on the rows board and on the States sheet (D and I), in both lenses and both themes, at 390 and 360.
- What takes the clock's place, if anything. It is not the ink dash and amber line of "a time not set": that state says the league has not set a time yet, which is amber's second use, and this match had a time and lost it. Propose the leading slot's contents and the second line's, from the existing voices, and say how the Ledger's clock column stays aligned.
- The day note, the leader and the "local" unit fall away with the clocks.
- As a proposal, say what NEXT UP, a cover band's kickoff list and a day's first kickoff do with such a match. The app never names one as next, and leaves it out of a day's first and last kickoff. Draw nothing new there unless something already on the canvas shows one.

3. THE HANDOFF, BROUGHT IN LINE. In your last report you listed the places where earlier sections still call ruled questions open:
- the status line at the top;
- sections 4 and 10, on question 3 (the wordmark);
- sections 5 and 8, on question 21 (the cover's growth);
- section 7, on questions 14 and 15 (D14's record and the missing covers).
Bring each in line with section 11, word for word with its rulings, and change nothing else in those sections. Then remove the sentence in section 11 that names them as stale. Update the StatusPill table and the States sheet's descriptions for parts 1 and 2 above.

On the Questions board, record the KICKED OFF ruling and R1 as redrawn in this pass. Record any new proposal from parts 1 and 2 as a numbered question for Beni, starting at 27.

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
- your proposals for the clockless row, for the kept score's voice, and for the scheduled-past-kickoff row, each with any new ink-and-ground pair's contrast computed as in section 2;
- the handoff's changed lines, as a diff or as the new text of each;
- anything you could not do.
````
