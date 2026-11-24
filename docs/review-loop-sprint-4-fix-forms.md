# The review loop, Sprint 4 — what the fix round for elenchus #9 reads from Pass 1 (archived Tue 24 Nov 2026, TZ=America/New_York)

Copied by the Planner seat from Pass 1's folder, `~/code/review-seats/elenchus-pr9-pass1`, on Tue 24 Nov 2026,
so that the fix round in [review-loop-sprint-4-fix-prompt.md](review-loop-sprint-4-fix-prompt.md) relies on no seat
folder. Neither file is on GitHub. Each block below is the file byte for byte; check it with `wc -c` and
`shasum -a 256` after extracting it.

## `correction-finding-4.md`

Pass 1's correction to its finding 4, written after it posted (comment 7136930430) and told to Beni in chat.
The probe paths it names are in Pass 1's folder.

3172 bytes, sha256 `945e418e3d5d3e70dfe900e3b6216130413f9c6a19402067c164bc8392f6e56e`.

````markdown
# Correction to finding 4 of Pass 1's comment on elenchus PR 9 (comment 7136930430)

Found after posting, 24 Nov 2026, 11:00 to 11:05 ET. Not on GitHub: Pass 1 posts once and edits nothing. Told to Beni in chat.

## What finding 4 says

A record whose `source` holds ESC, BEL, NUL or U+009B prints those bytes into the paste-ready block. I showed that
against the head's `buildHandoff` with the suite's in-memory client. That client does not go through `gh`.

## What is true on the real path

elenchus reads GitHub through `gh api` (`src/gh.ts`, `cliGh`). gh 2.105.0 rewrites control characters in a JSON
response before elenchus parses it.

Probe: `probes/gh-sanitize/probe.mjs`, results in `probes/gh-sanitize/results.json`. A stub server on 127.0.0.1 serves a
comment body the way GitHub encodes one (C0 controls as six-character JSON escapes, C1 controls as raw UTF-8). The real
gh reads it with `api --method GET` and with `--paginate --slurp`, in the isolated environment, with no Authorization
header sent.

| Served | What gh hands on |
|---|---|
| ESC (U+001B) | the two characters `^[` |
| BEL (U+0007) | `^G` |
| NUL (U+0000) | `^@` |
| FF (U+000C) | `^L` |
| CSI (U+009B) | `^[` |
| NEL (U+0085) | `^E` |
| VT (U+000B), DEL (U+007F), U+2028, U+2029 | unchanged |

So the ESC, BEL, NUL and C1 scenarios of finding 4 cannot arrive from a record through this gh. VT, DEL, U+2028 and
U+2029 still can; none is an escape sequence.

## What I would say now

- Finding 4 as written, about records: a note, not a should-fix. `handoff` has no guard of its own and relies on gh's,
  which no test and no README line states.
- The same rule has a live path that finding 4 does not name: the changelog subject. It comes from the head's
  CHANGELOG.md through the contents API, base64-encoded, so gh's rewriting does not touch it, and `oneLine` is not
  applied to it. Probe: `probes/body/test/zz-probe-subject.test.ts`, results in `probes/subject-out/results.json`.
  With ESC `[1A` ESC `[2K` BEL in the subject paragraph, both bytes are in the block's `--subject` and in the tag's
  `-m`. The subject code has been on main since Sprint 2. I found this after posting; it is in neither my comment nor
  my record, and it was not sealed.
- The counts as posted: 0 blocking, 4 should-fix, 6 notes. With finding 4 as a note: 0 blocking, 3 should-fix, 7 notes.
  The verdict stays "merge after a fix round".

## Not checked

- Which gh versions rewrite responses this way.
- Control characters in the configuration's own values (roles, seats, authors, templates), which also arrive base64-encoded.

## A side effect on my own comment

My comment holds the six-character escape texts for U+0000, U+001F and U+009F in two places: finding 4's mechanism line
and the record's evidence string for finding 4. GitHub stores them as written: an anonymous GET of the comment returns
the 51361 characters of my draft, byte for byte (`post/anon/comment.json`). Read through gh they come back as a
backslash followed by `^@`, `^_` and `^_`, so elenchus sees that one evidence string with those three changes. The
record validates and `check` prints `ok` (live, 11:00 ET, `post/verify/`).
````

## `all-forms.json`

Pass 1's 36 form definitions: Control; the Planner's nine R- forms and the re-read's Q1 and Q2; its own M1 to M8,
with the contrasts K1 and K2; and its fourteen deletions, X01 to X14. Each edit replaces a `find` text, which must
occur exactly once in `file`, with `replace`. The find texts are written against `bd84690`.

13203 bytes, sha256 `494e2d862eec2b2ccc4b9e77d7ae3894fccb3bdea585977151dc743c12e9a877`.

````json
[
 {
  "group": "control",
  "name": "Control",
  "note": "no edit",
  "edits": []
 },
 {
  "group": "planner",
  "name": "R-SchemaSeat",
  "note": "planner-r34.json",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    return { step: id, seat, role, blocked: issue.message, options: null };",
    "replace": "    return { step: id, seat: schema ? null : seat, role, blocked: issue.message, options: null };"
   }
  ]
 },
 {
  "group": "planner",
  "name": "R-SchemaRole",
  "note": "planner-r34.json",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    return { step: id, seat, role, blocked: issue.message, options: null };",
    "replace": "    return { step: id, seat, role: schema ? null : role, blocked: issue.message, options: null };"
   }
  ]
 },
 {
  "group": "planner",
  "name": "R-SchemaOptions",
  "note": "planner-r34.json",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    return { step: id, seat, role, blocked: issue.message, options: null };",
    "replace": "    return { step: id, seat, role, blocked: issue.message, options: schema ? [\"wait\"] : null };"
   }
  ]
 },
 {
  "group": "planner",
  "name": "R-RulingSeat",
  "note": "planner-r34.json",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    return { step: id, seat, role, blocked: issue.message, options: null };",
    "replace": "    return { step: id, seat: schema ? seat : null, role, blocked: issue.message, options: null };"
   }
  ]
 },
 {
  "group": "planner",
  "name": "R-RulingRole",
  "note": "planner-r34.json",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    return { step: id, seat, role, blocked: issue.message, options: null };",
    "replace": "    return { step: id, seat, role: schema ? role : null, blocked: issue.message, options: null };"
   }
  ]
 },
 {
  "group": "planner",
  "name": "R-WithinSeat",
  "note": "planner-r34b.json",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "      seat: firstOpen.seat,\n      role: firstOpen.role,\n      blocked: which,",
    "replace": "      seat: null,\n      role: firstOpen.role,\n      blocked: which,"
   }
  ]
 },
 {
  "group": "planner",
  "name": "R-InProgressSeat",
  "note": "planner-r34b.json",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "      seat: firstOpen.seat,\n      role: firstOpen.role,\n      blocked: `commits pushed",
    "replace": "      seat: null,\n      role: firstOpen.role,\n      blocked: `commits pushed"
   }
  ]
 },
 {
  "group": "planner",
  "name": "R-InProgressOptions",
  "note": "planner-r34b.json",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "      options: [\"wait\", \"re-route\"],",
    "replace": "      options: [\"wait\"],"
   }
  ]
 },
 {
  "group": "planner",
  "name": "R-NoRecordSeat",
  "note": "planner-r34b.json",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record for pass",
    "replace": "    seat: null,\n    role: firstOpen.role,\n    blocked: `no record for pass"
   }
  ]
 },
 {
  "group": "reread",
  "name": "Q1",
  "note": "",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    const { id, seat, role } = pass;",
    "replace": "    const { id, seat, role } = pass;\n    if (schema && state.config.unknownKeys) return { step: id, seat: null, role: null, blocked: issue.message, options: null };"
   }
  ]
 },
 {
  "group": "reread",
  "name": "Q2",
  "note": "",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    const { id, seat, role } = pass;",
    "replace": "    const { id, seat, role } = pass;\n    if (schema && state.config.unknownKeys) return { step: id, seat, role, blocked: issue.message, options: [\"wait\", \"re-route\"] };"
   }
  ]
 },
 {
  "group": "mine",
  "name": "M1-Absent-role-as-seat",
  "note": "no-record arm, role: names the seat instead of the role",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    role: firstOpen.role,\n    blocked: `no record for pass",
    "replace": "    role: firstOpen.seat,\n    blocked: `no record for pass"
   }
  ]
 },
 {
  "group": "mine",
  "name": "M2-Progress-seat-as-id",
  "note": "in-progress arm, seat: names the pass id instead of the seat",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "      seat: firstOpen.seat,\n      role: firstOpen.role,\n      blocked: `commits pushed",
    "replace": "      seat: firstOpen.id,\n      role: firstOpen.role,\n      blocked: `commits pushed"
   }
  ]
 },
 {
  "group": "mine",
  "name": "M3-Within-role-as-id",
  "note": "within-the-cap arm, role: names the pass id instead of the role",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "      role: firstOpen.role,\n      blocked: which,",
    "replace": "      role: firstOpen.id,\n      blocked: which,"
   }
  ]
 },
 {
  "group": "mine",
  "name": "M4-Finding-seat-as-role",
  "note": "ruling arm on a finding, seat: names the role instead of the seat",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    return { step: id, seat, role, blocked: issue.message, options: null };",
    "replace": "    return { step: id, seat: schema ? seat : role, role, blocked: issue.message, options: null };"
   }
  ]
 },
 {
  "group": "mine",
  "name": "M5-Progress-blocked-names-seat",
  "note": "in-progress arm, blocked: names the previous pass's seat instead of its id",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "blocked: `commits pushed after pass ${previous?.id ?? \"none\"} and pass ${firstOpen.id} has no record`,",
    "replace": "blocked: `commits pushed after pass ${previous?.seat ?? \"none\"} and pass ${firstOpen.id} has no record`,"
   }
  ]
 },
 {
  "group": "mine-contrast",
  "name": "K1-Schema-role-as-seat",
  "note": "schema arm, role: names the seat; the replay's captured status should catch it",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    return { step: id, seat, role, blocked: issue.message, options: null };",
    "replace": "    return { step: id, seat, role: schema ? seat : role, blocked: issue.message, options: null };"
   }
  ]
 },
 {
  "group": "mine-contrast",
  "name": "K2-Absent-seat-as-id",
  "note": "no-record arm, seat: names the id; the replay's T1 should catch it",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record for pass",
    "replace": "    seat: firstOpen.id,\n    role: firstOpen.role,\n    blocked: `no record for pass"
   }
  ]
 },
 {
  "group": "mine-complement",
  "name": "M6-Finding-role-as-id",
  "note": "ruling arm on a finding, role: names the pass id instead of the role",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "    return { step: id, seat, role, blocked: issue.message, options: null };",
    "replace": "    return { step: id, seat, role: schema ? role : id, blocked: issue.message, options: null };"
   }
  ]
 },
 {
  "group": "mine-complement",
  "name": "M7-Within-seat-as-role",
  "note": "within-the-cap arm, seat: names the role instead of the seat",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "      seat: firstOpen.seat,\n      role: firstOpen.role,\n      blocked: which,",
    "replace": "      seat: firstOpen.role,\n      role: firstOpen.role,\n      blocked: which,"
   }
  ]
 },
 {
  "group": "mine-complement",
  "name": "M8-Progress-role-as-seat",
  "note": "in-progress arm, role: names the seat instead of the role",
  "edits": [
   {
    "file": "src/report.ts",
    "find": "      role: firstOpen.role,\n      blocked: `commits pushed",
    "replace": "      role: firstOpen.seat,\n      blocked: `commits pushed"
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X01-merge-body-refusal",
  "note": "B: a merge_command without {merge_body} is refused",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "  if (!handoff.merge_command.includes(\"{merge_body}\")) {\n    throw new Error(\"config.handoff.merge_command must include {merge_body}\");\n  }\n",
    "replace": ""
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X02-empty-merge-commit-stop",
  "note": "B: the chain stops before git tag when there is no merge commit",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "    'test -n \"$merge_commit\"',\n",
    "replace": ""
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X03-trailers-none-twice",
  "note": "B: no trailer twice",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "  const trailers = new Set<string>();",
    "replace": "  const trailers: string[] = [];"
   },
   {
    "file": "src/handoff.ts",
    "find": "      trailers.add(`Co-authored-by: ${oneLine(first)}`);",
    "replace": "      trailers.push(`Co-authored-by: ${oneLine(first)}`);"
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X04-trailer-fold",
  "note": "B: a configured author's line breaks are folded in the trailer",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "      trailers.add(`Co-authored-by: ${oneLine(first)}`);",
    "replace": "      trailers.add(`Co-authored-by: ${first}`);"
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X05-pass-line-fold",
  "note": "B: one line per pass (line breaks folded)",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "    return oneLine(`Pass ${id} — ${role}, seat ${seat} — ${runtime}, model ${routeValue(model)}, effort ${routeValue(effort)}${count}`);",
    "replace": "    return `Pass ${id} — ${role}, seat ${seat} — ${runtime}, model ${routeValue(model)}, effort ${routeValue(effort)}${count}`;"
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X06-prepare",
  "note": "A: prepare builds dist/",
  "edits": [
   {
    "file": "package.json",
    "find": "    \"prepare\": \"npm run build\",\n",
    "replace": ""
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X07-grok-medium-only",
  "note": "D: Grok runs at medium and no other effort",
  "edits": [
   {
    "file": "examples/kickoff.elenchus.json",
    "find": "\"efforts\": { \"medium\": [\"medium\"] },\n      \"read_only_seat\": false\n    }\n  },",
    "replace": "\"efforts\": { \"medium\": [\"medium\"], \"high\": [\"high\"] },\n      \"read_only_seat\": false\n    }\n  },"
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X08-tag-on-merge-commit",
  "note": "B: the tag lands on the pull request's merge commit, not the base tip",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "    `git tag -a ${shellQuote(tag)} \"$merge_commit\" -m ${shellQuote(tagMessage)}`,",
    "replace": "    `git tag -a ${shellQuote(tag)} ${shellQuote(`refs/remotes/origin/${baseRef}`)} -m ${shellQuote(tagMessage)}`,"
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X09-null-observation-as-request",
  "note": "B: a null observation is never written as if observed",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "  return value.observed ?? `${value.requested ?? \"unspecified\"} requested (observed: null, source: ${value.source ?? \"absent\"})`;",
    "replace": "  return value.observed ?? value.requested ?? \"unspecified\";"
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X10-incomplete-comparison-refusal",
  "note": "B: an incomplete comparison is refused",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "  if (!range.commits || range.commits.length !== range.total_commits) {\n    throw new Error(\"handoff cannot identify commit authors from an incomplete PR comparison\");\n  }\n",
    "replace": ""
   },
   {
    "file": "src/handoff.ts",
    "find": "new Set(range.commits.map(",
    "replace": "new Set((range.commits ?? []).map("
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X11-astra",
  "note": "D: gpt-6.2-astra is in codex's models",
  "edits": [
   {
    "file": "examples/kickoff.elenchus.json",
    "find": "        \"gpt-6.2-astra\": [\"gpt-6.2-astra\"],\n",
    "replace": ""
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X12-base-from-pull-request",
  "note": "B: the block fetches the pull request's own base",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "    `git fetch origin ${shellQuote(`refs/heads/${baseRef}:refs/remotes/origin/${baseRef}`)}`,",
    "replace": "    `git fetch origin ${shellQuote(`refs/heads/main:refs/remotes/origin/main`)}`,"
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X13-grok-authors-empty",
  "note": "D: Grok's authors list is empty, so it gets no trailer",
  "edits": [
   {
    "file": "examples/kickoff.elenchus.json",
    "find": "    \"xai\": {\n      \"authors\": [],",
    "replace": "    \"xai\": {\n      \"authors\": [\"Grok <grok@x.ai>\"],"
   }
  ]
 },
 {
  "group": "deletions",
  "name": "X14-standing-record-credit",
  "note": "B: a vendor that holds a standing record gets a trailer",
  "edits": [
   {
    "file": "src/handoff.ts",
    "find": "    if (holder) standingVendors.add(holder.name);\n",
    "replace": ""
   },
   {
    "file": "src/handoff.ts",
    "find": "    const holder = vendorForRuntime(state.config, runtime);\n",
    "replace": ""
   },
   {
    "file": "src/handoff.ts",
    "find": "import { vendorForRuntime } from \"./config.js\";\n",
    "replace": ""
   }
  ]
 }
]
````
