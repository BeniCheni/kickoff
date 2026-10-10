# PR #138 — Pass 3: Beni's rulings, as recorded (archived by the Planner seat, Fri 2 Oct 2026, TZ=America/New_York)

PR #138 (Moments slice 4, S2–S3) was squash-merged to `main` on Fri 2 Oct 2026 at 4:13 PM ET as
`11845cb21cfd0e87a1105e37e7b74e348739541c`. Pass 3 of the six-pass 360 is Beni's adjudication,
taken with an independent second read in Cursor / Grok 4.7 High (the prompt is archived as
`docs/pr138-pass-3-adjudication-prompt.md`). Until now the rulings lived only in a chat thread.
This file records them for a reader who has only the repo.

**Sources, so the weight of each line is clear.** The rulings below are written from Beni's own
account to the Planner seat on 2 Oct 2026 (the recap that opened the slice-4 remainder planning
turn). The Planner seat has not seen the Cursor / Grok read or the Pass 3 chat thread, so neither
is summarised here; if Beni pastes either one it is appended below under its own heading, not
paraphrased. Lines marked *repo* were read from `main` at `11845cb` in the same session.

## Rulings

- **N1, a permission lapse that removes the focused playback control drops focus to the page
  body: fix before merge.** Beni reproduced it in jsdom and in Chrome 154 for the stage Pause and
  the Play on the stage and Cinema covers, and also for Retry, Replay, the loading Play and the
  stage source link, which the Pass 2.5 brief had not listed. Severity: medium while the edition
  is `[]`; high at S7, once a reader can reach it.
- **N2, the integrity receipt quoted a Tailwind class name and so changed the shipped CSS by one
  unused rule: reword.** Beni reproduced it, including a control rebuild.
- **Routing of the fix.** Beni asked for a Codex handoff prompt on GPT-6.1 Sol High, because the
  design was settled and the procedure literal. The fix landed as two commits.

## What the repo shows of that fix (*repo*)

- `a23c7f8` (Codex): "fix: retain focus when a permission lapse removes a Moments action".
  Nine files: `MomentsPlayerHost.tsx`, `tests/dom/momentsPermission.test.tsx`,
  `lapse-focus.mjs`, a new `reproduce-focus.mjs`, `integrity.json` (the N2 reword),
  `docs/moments-architecture.md`, `docs/v0.2.6-ideas.md`, `CHANGELOG.md` and `CLAUDE.md`. The
  hand-off remembers focus during render and acts in a separate layout effect, only on the
  active selection's playable-to-refused transition, only for a removed `data-playback-action`,
  `data-primary-action` or source-link control, and only when focus has fallen to the body. It
  lands on Enter Cinema on the stage and on Exit Cinema when a cover-only Cinema stays open. The
  old in-host hand-off lost its dead owner clause (so the Pass 2.5 observation O1 closed by
  deletion and no ideas row 79 is needed).
- `67b52e2` (Codex): receipts only, refreshed from a frozen archive of `a23c7f8`.
- Ideas row 77 is closed and row 78 (keep tracked receipts free of Tailwind utility names) is open.
- The receipts README's Results table records 753 tests in 53 files; the 42-cell lapse probe
  passing at the fix and failing 15 cells (focus on the body) at the red control; and the DOM
  regression at 6 fail / 26 pass on the red control against 32 pass at the fix. The Planner seat
  has not re-run any of these.
- `a23c7f8` also changed the commit-authorship bullet in `CLAUDE.md`; its message says "Beni
  authorizes Claude, Codex or Cursor commit authorship". The edit sits outside a bounded focus
  fix, so the Planner seat asked Beni, who ratified it on 2 Oct 2026
  (`docs/moments-slice-4-spec.md`, Amendments).

## Not archived

The Cursor / Grok 4.7 High read, and the thread in which Beni gave these rulings. Neither has
been shown to the Planner seat.
