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
nothing to contradict it. Venue-id overrides take precedence over the provider's venue
country reference table. An unmapped or missing venue leaves `venueTz` absent: the app says
"local time not known" and keeps the Brooklyn clock. It never uses the viewer's system zone
as a stadium clock; an invalid nonempty zone fails validation.

## 3. An unset kickoff stays unset

Leagues fix the date before the hour. When ESPN carries a placeholder time for such a
fixture, the normalizer marks it `timeConfidence: round_placeholder` (or `tbd`, when neither
the date nor the time is settled) rather than `exact`, and the app renders "kickoff time not
yet set by the league" in amber italic — never a number. No sub-line derives "FIRST 3:00 PM"
from a filler; no hero counts a placeholder as the next kickoff; no ticker segment names it.
A placeholder is trusted to the *day* and no further: it stays in tonight's slate until
midnight, and is never evicted by arithmetic on an instant the league never set — and the
slate's sub-line says how many of its count are TBC, so a count never quietly outruns the
FIRST/LAST range drawn from the league-set times.

Matchday numbers are not invented either. Where the provider exposes none, the app derives the number once, from the governing body's published windows, on the day it first sees the fixture, labels it computed, and keeps it; a fixture whose date later leaves that window is shown as rescheduled from it, and a fixture first seen outside every window is shown without a number. A fixture already moved between windows before the app first saw it is numbered by the window it was found in, and that is the one case this rule cannot detect.

A future provider's round string outranks the derived window. This cycle ESPN supplies none;
its phase and season guard the window derivation, so qualifying ties receive no league-phase number.

## 4. Every sync diffs against the last snapshot

`scripts/diff.ts` compares the fresh fetch with the committed file, fixture by fixture, and
reports what moved: `DATE_MOVED`, `TIME_CHANGED`, `VENUE_CHANGED`, `STATUS_CHANGED`,
`VENUE_TZ_CHANGED` (non-urgent), `TIME_CONFIDENCE_CHANGED`, `RESULT_CHANGED`, `TEAM_RENAMED`, `TEAM_CHANGED`, `NEW`,
`DISAPPEARED`, and `HOME_AWAY_INVERTED` — the last one is
the PSG–Rennes case, and it is detected both when the provider keeps the event id and swaps
the roles, and when it recreates the event as its mirror image within ten days. Anything
inside −6 h..+72 h of now is **urgent**, and so is any postponement or cancellation at any
horizon. Corrections between two known final scores and changes to provider team identity
are urgent at any horizon inside the sync window, which reaches 30 days back. Normal completion remains a status change; a team rename is
never urgent and is reported once per competition/team identity. The sync exits 1 when something urgent moved, so an unattended run cannot update
silently.

Fixture ids are the provider's own event id namespaced by competition, *not* built from team
names: a season contains both legs of every pairing, and a name-derived id makes the reverse
fixture look like an inversion of the first.

## 5. Fail loudly, never guess

An unattended sync must never invent scheduledness or quietly disappear real fixtures. So
these failures abort with exit 2 before any snapshot is written:

- an ESPN status the mapper doesn't recognise (a delay, a suspension, an abandonment) —
  rather than defaulting to `scheduled`;
- a response chunk at ESPN's undocumented 100-event cap — the provider requests the window in
  28-day chunks precisely so a cap is unlikely, and refuses any chunk that reaches it;
- a league whose fetched count falls under half its previous in-window count — a broken
  response, not a real collapse;
- a fetched row the Zod schema rejects — the provider changing shape;
- an event or standings entry that cannot be normalized, including an invalid provider
  identity — every offender is reported, never skipped just because enough other rows remain;
- a fixture or standings fetch failure, including a network outage or malformed response.

**Fixtures + standings form the authoritative snapshot boundary (v0.2.5).** Both must be
fetched and validated before publication; a failure in either publishes neither. A standings
outage can therefore delay otherwise valid fixture updates — an explicitly accepted
availability cost. The last committed snapshot remains the last completely successful one.
A fetch or validation failure creates or updates no sync PR, label or commit; an existing PR
stays unchanged.
Its failure and diagnostics are in Actions. Re-reading the committed app cannot reveal a
withheld fixture move. The header stamp and 24/72-hour banner describe snapshot age, not
whether a check failed. The app advances after a successful snapshot PR merges and is
deployed or pulled locally; quiet verified runs now take that same path. PR #23's Pass 2 treats a verified failure reader
as an unresolved release gate, not a cost that documentation alone settles.
Future ancillary data does not automatically join this boundary; membership needs an explicit
decision. A structurally ended phase table is different from a failed fetch: after its final
configured matchday window, a validated response in which no child carries the phase's name,
or the phase child no longer has its row count, is dropped for that competition only; an extra
child beside an intact phase child is noise, named in the log and ignored, during and after the phase. The report and
metadata name it; every fetch or entry-validation failure still aborts the whole snapshot.
Unknown seasons cannot use this exception. This supersedes the earlier standings soft-failure exception.

**Moments do not join the authoritative snapshot boundary** (Beni's ruling 4):
`src/curated/moments.json` is hand-curated, outside the diff engine and snapshot freshness
clock. Its denormalised fixture facts survive the rolling window; matching snapshot facts
must agree at validation, and its status is explicitly the status at curation. The tab shows
`curatedAt`, never passes off the sync stamp as a content update, and links out to rights
holders without playing media here.

## 6. The report line is an API

Every sync that completes fetching and validation ends with one machine-readable line:

```
report: changed=true changes=2 urgent=0 standings=changed rank-moves=8 merge=auto zones-unknown=0 standings-degraded=none
```

"Changed" is the diff engine's verdict, never `git diff`'s — per-row fetch stamps move on
every run and are not changes. `merge=` is a reader-facing signal, not an auto-merge gate:
`hold` when anything is urgent, when any fixture vanished or inverted at any horizon, or when
the standings fetch failed; `auto` otherwise. `standings=failed` remains a supported legacy
report value that publication refuses; current fetch failures abort with exit 2 before a
report instead. Every valid snapshot PR still requires its own successful verify run.
`zones-unknown` counts fixtures without a mapped stadium zone; Brooklyn still renders, the
stadium clock does not. `standings-degraded` names structurally ended phase tables, or `none`.
The format is pinned verbatim in a test, the
workflow validates it with the same regex, and a missing or malformed line fails the run
rather than falling through to a guess.

## 7. Staleness is a state, not a footnote

The snapshot carries its own timestamp. The header shows it; past 24 hours a banner says the
data may have moved, past 72 hours that it is stale. The clock behind that ticks once a
minute and catches up in one step when a suspended tab wakes, so a page left open overnight
rolls over honestly instead of quietly showing yesterday. A frozen `in_play` stops claiming
LIVE four hours after kickoff, because the app can no longer know. Two heroes on two clocks
was a lie the app told from the day the lenses shipped (31 Aug 2026) until v0.2.2; since then
both read one gate — *remaining* means not yet kicked off, on the same instant.

A successful quiet sync now publishes its verified snapshot through the same required PR
check as a change-bearing run. It advances both fixture and standings freshness, paying off
the earlier cost where an unchanged schedule looked unverified through an international
break. A failed fetch, failed verification, unmerged PR or undeployed build does not earn a
fresh stamp in the app. A local server still needs a pull after the merge.

The [recent change digest](sync-digest.md) contains the latest 30 change-bearing reports;
quiet checks add no entry. It is a record to read, never evidence of a human read. Automatic
snapshot merges explicitly request a Pages deployment; the next real sync retries missed
main delivery. A requested deployment is not a confirmed deployment.

## 8. The snapshot is committed

`src/data/*.json` lives in git, so the history of every fixture change is `git log`. The
scheduled sync never pushes to `main`; it opens a pull request carrying the full diff report.
Since 6 Sep 2026 that PR merges itself once CI is green, urgent lines included — the report is
the audit trail, not a gate. So the honest claim is narrower than it was: every change is
*written down*, not every change is *read first*. Anyone betting on a fixture re-reads the app
and verifies the moved line at the source; a merged PR is not evidence that anyone read it.

---

If you remember one thing: the promise is a correct kickoff time, and the app would rather say
"not yet set" than be wrong. Everything above is in service of that sentence.
