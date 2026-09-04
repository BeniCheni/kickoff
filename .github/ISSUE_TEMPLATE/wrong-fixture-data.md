---
name: Wrong fixture data
about: The app shows a kickoff, venue, home side or status that disagrees with the league
title: "Wrong fixture: <home> v <away>, <date>"
labels: wrong-data
---

<!-- This is the repo's signature issue type — the whole project exists because a fixture
     list lied. Three things get it fixed; the fixture id is the one that matters most. -->

**Fixture id** (from `src/data/fixtures.json`, e.g. `ligue1:401234567`, or the row's
home/away/date if you can't find it):

**What the app shows** (kickoff time and zone, venue, home side, status — and which lens/tab,
if it matters):

**What the league says** (link to the league's or club's official fixture page):

**When you looked** (the header's `synced …` stamp, and whether the staleness banner was up):

<!-- Note for the fix: the data is never hand-edited. If ESPN is wrong, the fix is in the
     provider or a second source — see docs/HONESTY.md §1. -->
