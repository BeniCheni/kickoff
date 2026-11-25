# Roadmap pointers

Moved out of `CLAUDE.md` on 19 Nov 2026, unchanged, so only the sessions that need it load it.


**The full-stack work, and what the next release is (current).** The Moments pivot of 12 Oct 2026
made Kickoff a full-stack app — the Studio, a Supabase catalog, Cloudflare R2 video, CLIP
similarity through pgvector, and a Next.js reader on Vercel — recorded in
`docs/moments-pivot-record.md` and planned in `docs/nextjs-migration-plan.md`. It lands as
**non-releases** (Beni's SP6 ruling, "None", 19 Oct 2026). D3 (13 Nov 2026), confirmed by Beni
on 14 Nov 2026, let the clearing change the public site before the cutover, and the full-stack
work still lands as non-releases. The fixes merged since v0.5.2 shipped as **v0.5.3** on 27 Oct 2026 (a suspended or abandoned
match no longer freezes every table; Beni ruled on 22 Oct 2026 to cut after Demo Day) and
**v0.5.4** on Sat 14 Nov 2026 (extra time and penalties, ruled a patch on 11 Nov 2026) and
**v0.5.5** on Sat 14 Nov 2026 (the clearing). The cutover is a **minor** (N0-Q10 ruled
Minor and left the number to Beni), and on 21 Oct 2026 Beni planned it as v0.6.0.

**Amended Sat 14 Nov 2026 (Beni): revamp first, and it takes v0.6.0.** The design overhaul
(Fergie Time's second edition) is built before the cutover, on Fixtures and Table only, and its
release is **v0.6.0**; the cutover moves to the minor after it, numbered by Beni when it is
scoped. N5 and the rest of the Moments and Studio work are parked while he rethinks the user
journey. The overhaul is built as ten PRs: one tests-and-tooling PR on `main` that changes no
rendered byte, eight reviewed into one integration branch, and one release PR, so `main` and
Pages change once. Step 0 moves to `&lens=ledger` in the same sitting as that release, not
before. Plan, scoring and all nineteen rulings: `docs/design-overhaul-plan.md` and
`docs/design-overhaul-plan-review.md`.

Beni ruled on 10 Sep 2026: **sync first as v0.4.0; European week second as v0.5.0**.
v0.4.1 (rows 43–51) shipped 12 Sep 2026, before v0.5.0 (Beni, 11 Sep 2026).
PR #39 keeps its readable competition chips; the designer re-mirrors them after release.
`docs/v0.4.0-proposal.md` records the sync scope and implementation choices. The European-week
PR stays unmerged until the sync release has shipped, then refreshes its generated data,
merge-day date and exact-tip verification. Each release merge and tag remains Beni's.

`docs/v0.2.6-ideas.md` is the **current** ranked candidate list, written cold after the v0.2.5
build. It carries open rows from `docs/v0.3.0-ideas.md` with their original numbers, the two
new provider candidates, and this build's verification lessons. Read its process notes
together with that earlier file's tail and `docs/v0.2.0-ideas.md`, whose text stays the fuller
description for the rows it originated. `docs/v0.2.5-proposal.md` is the inherited spec for
the next session, including the authoritative snapshot boundary and its accepted cost.
`docs/v0.2.1-proposal.md` ("The train") is the release plan that turns that list into a train
of patches and the v0.4.0 sync minor, with the deferred rows and their reasons — **amended on
numbering by `docs/v0.2.2-proposal.md`** (4 Sep 2026: v0.2.2 is "the front door") **and again
by the v0.2.3 hotfix** (same day, `CHANGELOG.md` `[0.2.3]`, Node 24 actions; Beni's call): the
jsdom rig is v0.2.4, the resilience patch v0.2.5; **amended again by v0.3.0**
(`docs/design-cycle-proposal.md`, Beni's 6 Sep ruling): the design cycle takes v0.3.0,
the sync theme becomes v0.4.0, and the earlier proposals stay as historical records; `/kickoff-pr-review`
(`.claude/skills/kickoff-pr-review/`, shipped in v0.2.1, renamed in v0.2.4, planned in
`docs/v0.2.1-pr-review-skill-plan.md`) is ladder step 4 as a command.
Separately, the standing bridge to the betting track (it was the README's "Beyond" section until
the 28 Sep 2026 revamp dropped it, so this is now its owning copy): fixtures carry stable ids so a
later `positions.json` join — plus a token-expiry-vs-kickoff feature — can badge fixtures holding
an open position or an expiring token, and Moments reads the same identity through `fixtureId`.
Not yet on the ranked list; blocked on defining those files in `../Sportsbooks/`.
