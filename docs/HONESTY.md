# Never a confident lie — the house rules

Kickoff exists because a hand-typed fixture dashboard was quietly wrong in about twenty rows
(23 Aug 2026: a Ligue 1 matchday a day early, a Bundesliga opener six hours off, a fixture
that never existed, PSG–Rennes with the wrong team at home). None were rendering bugs. All
were **provenance** bugs: the file said something the league never did, and nothing in the
system could contradict it.

So the rules below are not style. Each one closes a specific way a fixture list can lie, and
each one has a test in `tests/` named for the claim it protects. If you are about to weaken
one of those tests to make a change pass, the change is what's wrong.

## 1. Fixture data is generated and diffed, never typed

`src/data/*.json` is written only by `npm run sync`. Nobody hand-edits it — not to fix a
venue string you know is wrong, not to add a fixture you know exists. A hand-corrected row is
the exact habit that produced the rap sheet, and the next sync would overwrite it without a
word. If the data is wrong, the fix lives in the provider, the normalizer, or a second source
that can disagree with the first.

## 2. The stored fact is a UTC instant

Every fixture carries one `kickoffUtc`. The stadium-local time and the Brooklyn time are both
*derived* from it at render, through the IANA zone the venue and the reader sit in. They
cannot disagree with each other, and they cannot drift apart across a DST change — Europe
moves its clocks on the last Sunday of October, the US on the first Sunday of November, and
the week between is exactly where a "date plus local time" file falls over. Storing a date
and a wall-clock string separately is what let a whole matchday sit one day early with
nothing to contradict it.

## 3. An unset kickoff stays unset

Leagues fix the date before the hour. When ESPN carries a placeholder time for such a
fixture, the normalizer marks it `timeConfidence: round_placeholder` (or `date_only`) rather
than `exact`, and the app renders "kickoff time not yet set by the league" in amber italic —
never a number. No sub-line derives "FIRST 3:00 PM" from a filler; no hero counts a
placeholder as the next kickoff; no ticker segment names it. A placeholder is trusted to the
*day* and no further: it stays in tonight's slate until midnight, and is never evicted by
arithmetic on an instant the league never set.

Matchday numbers are not invented either. The provider exposes none, so the app shows none.

## 4. Every sync diffs against the last snapshot

`scripts/diff.ts` compares the fresh fetch with the committed file, fixture by fixture, and
reports what moved: `DATE_MOVED`, `TIME_CHANGED`, `VENUE_CHANGED`, `STATUS_CHANGED`,
`TIME_CONFIDENCE_CHANGED`, `NEW`, `DISAPPEARED`, and `HOME_AWAY_INVERTED` — the last one is
the PSG–Rennes case, and it is detected both when the provider keeps the event id and swaps
the roles, and when it recreates the event as its mirror image within ten days. Anything
inside −6 h..+72 h of now is **urgent**, and so is any postponement or cancellation at any
horizon. The sync exits 1 when something urgent moved, so an unattended run cannot update
silently.

Fixture ids are the provider's own event id namespaced by competition, *not* built from team
names: a season contains both legs of every pairing, and a name-derived id makes the reverse
fixture look like an inversion of the first.

## 5. Fail loudly, never guess

An unattended sync must never invent scheduledness or quietly disappear real fixtures. So
four things abort with exit 2 before anything is written:

- an ESPN status the mapper doesn't recognise (a delay, a suspension, an abandonment) —
  rather than defaulting to `scheduled`;
- a response chunk at ESPN's undocumented 100-event cap — the provider requests the window in
  28-day chunks precisely so a cap is unlikely, and refuses any chunk that reaches it;
- a league whose fetched count falls under half its previous in-window count — a broken
  response, not a real collapse;
- a fetched row the Zod schema rejects — the provider changing shape.

The standings fetch is the one soft failure: it warns and keeps the previous table, because a
503 on one league must never discard a successful fixtures sync. Even that is reported on the
sync's last line, and since v0.2.2 it holds the sync PR for a human.

## 6. The report line is an API

Every sync ends with one machine-readable line:

```
report: changed=true changes=2 urgent=0 standings=changed rank-moves=8 merge=auto
```

"Changed" is the diff engine's verdict, never `git diff`'s — per-row fetch stamps move on
every run and are not changes. `merge=` is whether the PR this run opens may merge itself:
`hold` when anything is urgent, when any fixture vanished or inverted at any horizon, or when
the standings fetch failed; `auto` otherwise. The format is pinned verbatim in a test, the
workflow validates it with the same regex, and a missing or malformed line fails the run
rather than falling through to a guess.

## 7. Staleness is a state, not a footnote

The snapshot carries its own timestamp. The header shows it; past 24 hours a banner says the
data may have moved, past 72 hours that it is stale. The clock behind that ticks once a
minute and catches up in one step when a suspended tab wakes, so a page left open overnight
rolls over honestly instead of quietly showing yesterday. A frozen `in_play` stops claiming
LIVE four hours after kickoff, because the app can no longer know. Two heroes on two clocks
was a lie the app told for a week; since v0.2.2 both read one gate — *remaining* means not
yet kicked off, on the same instant.

One honest cost, written down rather than hidden: the scheduled sync commits only when the
diff engine reports a change, so through an international break the banner measures time
since the last *change-bearing* sync and goes amber even though the bot verified nothing
moved. The fix (a verified "nothing changed" that still advances the stamp) is planned for
v0.3.0, after the diff engine learns to see result corrections and team renames — the two
things it is still blind to today.

## 8. The snapshot is committed

`src/data/*.json` lives in git, so the history of every fixture change is `git log`. The
scheduled sync never pushes to `main`; it opens a pull request carrying the full diff report,
and anything a human must read stays held until a human reads it.

---

If you remember one thing: the promise is a correct kickoff time, and the app would rather say
"not yet set" than be wrong. Everything above is in service of that sentence.
