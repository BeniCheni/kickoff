# The review loop — a controller that reads the PR, and the plan to build it

The six-pass 360 keeps every seat, prompt and ruling it has, and gains a stateless `loop` that
reads one machine-readable seat record per pass from the PR, then a GitHub-enforced gate once the
spikes below say who may open it.

Proposal and spike record, Sun 15 Nov 2026 (Brooklyn). Sprint 0 of the review-loop tooling track:
spikes, the plan and the decisions. Nothing here is built; no version moves; no number is chosen.
Written by the Planner seat (Claude Code, Opus 5.5) from a fresh read of `origin/main` at
`0fd5b98` and from probes run in throwaway directories under `/tmp/claude-501/rlp-spike.9DSETm/`.
One sync commit (`ad4c5f3`, PR #326) landed on `main` during the session and changes nothing here.
The brief is [review-loop-planner-brief.md](review-loop-planner-brief.md).

## The consensus record

On 15 Nov 2026 the Cowork Planner and ChatGPT (Codex) converged on **Proposal C+**, after one
rebuttal round:

- [review-loop-rebuttal.md](review-loop-rebuttal.md) (Attachment B) is the Planner's rebuttal
  and the architecture: seat records in PR comments, a stateless `loop` that rebuilds state from
  the PR on every call, and a ruleset requiring `verify` and a `kickoff/360` status on the head.
- [review-loop-consensus-codex.md](review-loop-consensus-codex.md) (Attachment A) is Codex's
  verdict: consensus on C+; MCO and Antigravity out of the core; the six passes and Beni's
  adjudication unchanged; records and a read-only controller first; the gate only once the
  authorization and sync policies are settled; vendors automated one at a time with manual
  fallback; Paradev only later, as a viewer. A non-production POC is approved now.

**Attachment A names "the four remaining design decisions" but does not list them.** What Beni
supplied is the assessment's closing recommendation only. D1 to D4 below are therefore the
brief's candidates, labelled as such, not Attachment A's wording.

Two addenda arrived the same day and are folded in: four references reviewed (A1–A5, spikes
S9–S11, decisions D9–D11, options O1–O2) and TypeSafe Jev (option O3, spike S12, decision D12).

## Drift found while reading

Reported, not resolved. Each is a place where two owning copies, or a copy and the machine,
disagree.

1. `CLAUDE.md:36` says "model routing that worked — Fable 5 **High** for design/build, **Extra**
   for the review pass". Builds have gone to Codex (GPT-6.1 Sol) and Cursor (Grok 4.7) since PR
   #24, and Pass 1 runs `claude-fable-5-2` (S2 shows that model id).
2. `README.md:359` seats Codex (GPT-6.1 Sol) in "Synthesis and merge, Passes 2.5 to 3". That held
   for #237, #247 and #316, whose Pass 2.5 comments name GPT-6.1 Sol or GPT-6.1 High. PR #320's
   Pass 2.5 ran in Claude Code on Fable 5.2 at Extra. The overhaul plan names Codex again for
   2.5 (`design-overhaul-plan.md:217`). Pass 3 is Beni in both 360 tables, not Codex.
3. `SKILL.md`'s 360 table names Fable 5.1 for Passes 0 and 1, "Codex, GPT-6 Astra Extra High"
   for Pass 2, and "the PM seat" for Pass 2.5. `README.md:344` says Pass 2.5 is "a seat that
   wrote neither the build nor the fixes". On #320 the PM seat was Opus 5.5, Pass 2 was Cursor
   on Grok 4.7, and Pass 2.5 was a fresh Fable 5.2 session, not the PM seat.
4. `SKILL.md:12-16` says the skill is invoked by hand because a human types the command. That is
   true of the app. S1 shows a headless `claude -p "/kickoff-pr-review …"` loads it too.
5. Attachment B says Codex's read-only sandbox is "the config default". On this Mac
   `~/.codex/config.toml` sets `sandbox_mode = "workspace-write"`, `model = "gpt-6.1-sol"` and
   `model_reasoning_effort = "xhigh"`, and `codex` is not on `PATH` (S3).
6. Attachment B marks Cursor's effort in the model string **UNVERIFIED**. It is verified: the
   model ID carries it (S4).
7. Every 360 comment on #237, #247, #316 and #320 is posted as `BeniCheni`, because seats post
   through his `gh`. Who wrote a comment is knowable only from the record's own claim and from
   commit authors (S8, S11).
8. `~/.claude/settings.json` sets `"effortLevel": "low"`, yet every `claude -p` run without
   `--effort` recorded `"effort":"medium"` (S2). Not investigated; `loop` passes effort every
   time.
9. The README's builder row says "GPT-6 and 6.1". Codex's catalog has no plain GPT-6; it has
   `gpt-6-astra`, `gpt-6-sol`, `gpt-6-luna`, `gpt-6.1-sol` and `gpt-6.1-terra` (S3). Seat
   records name the model ID.

## What the spikes found

| # | Question | Answer | What it changes |
|---|---|---|---|
| S1 | Can headless `claude -p` start a `disable-model-invocation: true` skill? | **Yes.** A slash command at the start of the prompt is a user invocation. | A headless Pass 1 or 2.5 can start `/kickoff-pr-review`; the runner must be gated as tightly as a human typing it. |
| S2 | What does Claude Code report about the model and effort that ran? | Model in the JSON result; effort only in the session transcript. **Plan mode swapped Haiku for Sonnet silently.** | `observed` is read from two places; a mismatch stops the seat. |
| S3 | What does Codex report? | Nothing in `--json`; model, effort and sandbox in the session file. Bad model or effort fails loudly. | `observed` comes from the session file, joined by `thread_id`. |
| S4 | Can Cursor express effort headless? | **Yes, in the model ID** (`grok-4.7-xhigh`). `stream-json` reports it. Stored login. | Flag (b) is closed; D4 is reworded. |
| S5 | What protects `main`? | Two rulesets, no branch protection. `verify` is pinned to the Actions app; admins bypass it always. | The new gate needs its own ruleset. |
| S6 | Who arms and merges the sync PR? | `app/github-actions`, end to end, on the last three sync PRs. | Shapes D2. |
| S7 | Are the read-only modes read-only on disk? | Codex: yes. Claude: nothing written, but by refusal. **Cursor's ask mode wrote inside and outside the worktree.** | Cursor holds no read-only seat headless. |
| S8 | What lands after Pass 2.5? | 9 commits on three PRs; the rebuttal's 4-file rule blocks 8. | The D3 allowed set below. |
| S9 | Open Code Review's coverage, offline | Works; 27 of 57 files by default, 54 with an include rule; **deletions are never listed.** | D10 recommends a git-built manifest instead. |
| S10 | Do per-vendor deny profiles hold? | Direct `git tag` blocked by all three; `sh -c` and `git -C .` evade all three. | Seatbelts only, as A2 said. |
| S11 | Who are the seats on GitHub? | `BeniCheni`, Admin, scopes `repo`, `delete_repo`, `gist`, `read:org`; bypasses the CI gate always. | D9 decides whether the gate binds agents at all. |
| S12 | Jev calibration | Not run: D12 is unruled and it needs Beni's key. | — |

### S1 — headless skill invocation

A scratch repo held two probe skills: `probe-sealed` with `disable-model-invocation: true`, and
`probe-open` without it as a control. Each says to reply with one fixed word.

```text
$ claude -p "/probe-sealed x" --permission-mode plan --max-turns 2 --output-format json --model haiku
"result": "PELICAN-SEALED", "num_turns": 1, "modelUsage": ["claude-sonnet-5-5"]
$ claude -p "/probe-open x"   (same flags)      → "PELICAN-OPEN", num_turns 1
$ claude -p "/probe-sealed x" --model haiku     → "PELICAN-SEALED", modelUsage ["claude-haiku-5-5"]
```

One turn and no tool call, so the skill's text was injected, not read from disk. The flag stops
the *model* loading a skill on its own; a prompt that begins with the slash command is the
user's. **A headless Pass 1 or 2.5 can start `/kickoff-pr-review`.** Each `-p` call is a fresh
session, so the skill's warning about worktrees created after the session started does not
apply. Not tested: the real skill, which this session was forbidden to run against a real PR.
This also means a runner that composes the wrong prompt can start a pass that pushes commits.
Sprint 6 gates `loop run` like a human typing the command.

### S2 — Claude Code observability

```text
$ claude -p "reply ok" --model haiku --effort low --output-format json
modelUsage: { "claude-haiku-5-5": { … "canonicalModel": "claude-haiku-5-5" } }   (no effort key in the result)
$ claude -p "reply ok" --model fable --effort xhigh --permission-mode plan --output-format json
modelUsage: { "claude-fable-5-2": { "outputTokens": 146, "costUSD": 0.807712 } }
transcript ~/.claude/projects/<cwd-slug>/<session_id>.jsonl: "model":"claude-fable-5-2" ×4, "effort":"xhigh" ×4, "perTurnEffort":"xhigh" ×2, "permissionMode":"plan"
$ claude -p "reply ok" --model haiku --permission-mode plan --output-format json
modelUsage: { "claude-sonnet-5-5": … }      ← Haiku requested, Sonnet ran, exit 0
```

- **Model:** the keys of `modelUsage` in the JSON result, and `"model"` on every assistant
  message in the transcript. (`advisorModel` in the transcript names Opus 5.5 and is not the
  seat's model.)
- **Effort:** only in the transcript, as `"effort"` and `"perTurnEffort"` per message. Runs with
  no `--effort` recorded `medium` (drift 8).
- **Requested is not observed.** `--model haiku` under `--permission-mode plan` ran
  `claude-sonnet-5-5` in all three runs that combined them (both S1 probes and a plain "reply
  ok"); without plan mode, Haiku ran. Fable 5.2 under plan mode stayed Fable. The cause was not
  established. Only `modelUsage` showed it.
- Fable 5.2 and Opus 5.5 are selectable today (S2's run; this session runs on Opus 5.5).
- A trivial "reply ok" on Fable 5.2 at `xhigh` cost $0.81 at list prices, almost all of it
  caching the system prompt. Haiku cost $0.004 and Sonnet about $0.09.

**Changes:** `observed.model` comes from `modelUsage`, `observed.effort` from the transcript, and
`loop check` fails a record where either differs from the request (test T13 uses this run as
its fixture).

### S3 — Codex observability

```text
binary: /Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex  (codex-cli 0.169.0-alpha.11.1; not on PATH)
$ codex exec --sandbox read-only -c model_reasoning_effort=low --json "reply ok"
thread.started {thread_id} · item.completed {type:"error", "Under-development features enabled: chronicle…"} · turn.started · agent_message "ok" · turn.completed {usage}
~/.codex/sessions/2026/11/15/rollout-…-<thread_id>.jsonl, turn_context:
  "model":"gpt-6.1-sol","effort":"low","sandbox_policy":{"type":"read-only"},"approval_policy":"on-request"
$ codex exec … -m no-such-model-xyz …        → "The 'no-such-model-xyz' model is not supported when using Codex with a ChatGPT account."
$ codex exec … -c model_reasoning_effort=extra-high …  → exit 1, "Supported values are: 'none', 'minimal', 'low', 'medium', 'high', 'xhigh', and 'max'."
```

- The `--json` stream reports neither model nor effort. The session file does, under
  `turn_context`, and the stream's `thread_id` names that file.
- An unknown model or effort fails loudly; nothing falls back silently.
- `codex debug models` lists `gpt-6.1-sol`, `gpt-6-astra`, `gpt-6.1-terra`, `gpt-6-sol` and
  `gpt-6-luna`, each with its own levels. The catalog lists `ultra` for some models, which the
  API's enum above does not; untested.
- A harmless warning arrives as an item of type `error`, so `loop` must not treat every error
  item as a failure.

**Changes:** `observed` comes from the session file. The runner calls the binary by its path,
or Beni puts it on `PATH`, and always passes `-m`, `--sandbox` and the effort, because this Mac's
defaults are `gpt-6.1-sol`, `xhigh` and `workspace-write`.

### S4 — Cursor routing

```text
agent 2026.11.11-b912975 · `agent status`: logged in · CURSOR_API_KEY unset · no key created
$ agent --list-models          → 284 IDs, 246 end in an effort word
  grok-4.7-low | -medium | -high | -xhigh ("Grok 4.7 Extra High"), each with a -fast twin
  gemini-4-argon-low | -medium | -high          (Argon stops at High, as PR #320's record says)
  claude-fable-5-2-low … -xhigh | -max
$ agent -p --mode ask --trust --model grok-4.7-low --output-format json "reply ok"
  keys: type, subtype, is_error, duration_ms, duration_api_ms, result, session_id, request_id, usage   (no model, no effort)
$ … --output-format stream-json
  {"type":"system","subtype":"init","apiKeySource":"login","model":"Grok 4.7 256K Low","permissionMode":"default"}
$ agent -p … --model grok-4.7-ultra …   → "Cannot use this model: grok-4.7-ultra. Available models: …"
```

- **Effort is expressible headless, as part of the model ID.** Flag (b) is closed for routing.
- **Observed:** the `stream-json` init event names the model as a display string whose last
  word is the effort ("Low"). The plain `json` result reports neither. The model ID itself sits
  only in an undocumented SQLite store (`~/.cursor/chats/…/store.db`, `"modelName":"grok-4.7-low"`).
- The display string differs from the list's ("Grok 4.7 256K Low" against "Grok 4.7  Low"), so
  `loop` compares the effort word, within Cursor's own vocabulary.
- `permissionMode` read `default` under `--mode ask`, so the mode is not observable.
- **Cursor loads Claude-format project skills.** Asked "reply ok" in the S1 scratch repo, it
  answered `PELICAN-OPEN`, having invoked `probe-open` on its own. It left `probe-sealed` alone;
  whether it honours `disable-model-invocation` was not established. Cursor seats in Kickoff
  see `.claude/skills/` and `.agents/skills/`.

### S5 — what protects `main` today

```text
$ gh api repos/BeniCheni/kickoff/branches/main/protection   → 404 "Branch not protected"
$ gh api repos/BeniCheni/kickoff/rulesets/21984730   "main — CI gate", active, ~DEFAULT_BRANCH
  required_status_checks: [{"context":"verify","integration_id":15368}]   (15368 = the github-actions app)
  bypass_actors: [{"actor_id":5,"actor_type":"RepositoryRole","bypass_mode":"always"}]   current_user_can_bypass: always
$ gh api repos/BeniCheni/kickoff/rulesets/21984729   "main — history is append-only", active
  deletion · non_fast_forward · required_linear_history · pull_request (0 approvals)   bypass_actors: []
$ gh api repos/BeniCheni/kickoff/actions/permissions/workflow
  {"default_workflow_permissions":"write","can_approve_pull_request_reviews":true}
```

The only required check is `verify`, pinned to the Actions app. The Admin role (actor 5)
bypasses the CI gate always. No one bypasses the append-only ruleset. Every workflow's token
defaults to write.

**Changes:** `kickoff/360` belongs in a ruleset of its own, so its bypass list is not the CI
gate's. A ruleset can pin a required status to one app, as `verify` is pinned; that is D1's
lever.

### S6 — the sync identity

```text
$ gh pr list --head sync/scheduled --state merged -L 3
#326 author=app/github-actions mergedBy=app/github-actions 2026-11-15T19:29Z  npm run sync 11/15/2026 2:23 PM ET
#324 author=app/github-actions mergedBy=app/github-actions 2026-11-15T08:01Z  sync: verified unchanged — 2:54 AM ET
#319 author=app/github-actions mergedBy=app/github-actions 2026-11-14T07:45Z  sync: verified unchanged — 2:38 AM ET
$ gh run list --workflow=sync.yml -L 1000 → success=368 failure=34
```

`sync.yml` runs with `GH_TOKEN: ${{ github.token }}` and `contents`, `pull-requests` and
`actions` write (`sync.yml:51-54`). It opens the PR, approves its own held `verify` run through
the Actions API (`sync.yml:332`) and arms `gh pr merge --squash --auto --match-head-commit`
(`sync.yml:355`). One identity does everything: the github-actions app.

### S7 — read-only on disk

Each vendor got its own scratch repo with `node_modules → ../deps` (a symlink, as in the D8
check) and an `npm test` that writes `node_modules/.cache/probe-results.json`, standing in for
Vitest. The prompt asked for a canary inside the repo, a canary outside it, and `npm test`.
`git status --porcelain --ignored` and `find -L . -newer marker` followed each run.

| Vendor and mode | What the seat did | On disk |
|---|---|---|
| Codex, `--sandbox read-only` | Ran `printf x > canary-inside.txt`, the outside write and `npm test` (all in its session file). The sandbox refused each; `npm test` hit `EPERM` on `node_modules/.cache`. | Nothing |
| Claude Code, `--permission-mode plan` (Sonnet 5.5 ran) | Declined both times, even when told to attempt each call; `permission_denials: []` | Nothing, by refusal; the tool layer was never exercised |
| Cursor, `--mode ask` (run 1) | Declined | Nothing |
| Cursor, `--mode ask` (run 2, told to attempt) | Edit tool wrote both canaries; shell rejected `npm test` (`"isReadonly":false`) | **`repo/canary-inside.txt` and `outside/canary-outside.txt`** |
| Cursor, `--mode ask --sandbox enabled` | Declined | Nothing; the sandbox's effect on edits was not observed |

Attachment B's stop rule reads: "Stop and stay manual if any read-only probe writes anywhere."
Cursor's did. **Cursor holds no read-only seat headless.** Today that costs little, because the
read-only seats (Passes 0, 1.5 and 2.5) run in Claude Code or Codex and Cursor's seats (Pass 2,
the executor) write by design. Nothing was written through the symlink: Codex ran `npm test`
and its sandbox refused the write with `EPERM`, and the other two never ran it. `loop prep`
still gives each seat its own install, never a symlink into another checkout, as the D8 record
asks.

### S8 — what lands after Pass 2.5

The two most recent PRs other than #320 whose comments record a Pass 2.5 are #316 (Pass 2.5 at
`5a2eeda`) and #247 (at `de75088`). The census, from `git log <2.5 head>..<final head> --stat`:

| PR | Commit | Author | Files | Under the rebuttal's 4-file rule | Re-read in the record? |
|---|---|---|---|---|---|
| #320 | `217189c` merge of `main` (six conflicts, resolved by hand) | Cursor | resolution in `src/lib/lensSelectors.ts`, tests, docs | blocked | yes: the PM seat's re-read (`--remerge-diff`, the AET mutation) |
| #320 | `8ea93e2` Release v0.5.5 | Cursor | `package.json`, `package-lock.json`, `CHANGELOG.md`, `README.md`, `CLAUDE.md`, `studio/README.md`, `docs/v0.2.6-ideas.md`, five tests changing only the version string | blocked | yes |
| #320 | `7b7da6b` README pictures | Cursor | `CHANGELOG.md`, `README.md`, three JPGs under `docs/screenshots/2026-11-14/` | blocked | yes |
| #320 | `188b909` audit test skips `src/data`, matches any case | Cursor | `tests/removalAudit.test.ts` (behaviour) | blocked | yes |
| #320 | `dcb914e` ideas rows | Cursor | `docs/v0.2.6-ideas.md` | blocked | yes |
| #316 | `7f7746f` first-final horizon, date | Cursor | `CHANGELOG.md`, `CLAUDE.md`, `README.md`, `docs/v0.2.6-ideas.md` | blocked | yes (`Re-read at 7f7746f`) |
| #316 | `8e955ad` date for 14 Nov | Cursor | the same four files | blocked | yes (`Re-read at 8e955ad`) |
| #247 | `4cd4697` Pass 2.5's three low fixes | Claude | `README.md`, `web/README.md` | blocked | answered on the PR, not re-read |
| #247 | `288fcbb` LinkedIn row | Claude | `README.md` | allowed | no |

(#320's range also carries `f7775c9` and `34d078b`, which arrived through the merge and passed
their own gates on `main`.) The rebuttal's rule blocks eight of the nine, including both of
#316's date commits, which changed no line of code. The rule that matches the record is D3's
allowed set below. It sends exactly two of the nine to a re-read: #320's hand-resolved merge and
its test-behaviour change, the two commits whose risk the record shows the PM seat checked.

### S9 — Open Code Review's coverage preview (A1)

Checked first: `@alibaba-group/open-code-review@1.13.10`, Apache-2.0, repository
`github.com/alibaba/open-code-review`, Alibaba maintainers. Its `postinstall` downloads a binary
from that repository's GitHub release and checks it against the release's `sha256sum.txt`.
Installed pinned into a scratch tool directory, not `npx -y`, and run in a scratch clone with
`main` and `refs/pull/320/head` fetched.

```text
$ ocr delegate preview --format json --from origin/main --to 0faf606
mode=range from=origin/main merge_base=ddd9a37 total=57 reviewable=27 excluded=30   (same with --from ddd9a37)
  excluded [default_path] ×18: tests/dom/*.test.tsx, tests/*.test.ts, web/test/*.test.tsx
  excluded [unsupported_ext] ×9: .claude/skills/kickoff-pr-review/{SKILL,pr-comment,browser-matrix}.md, .agents/skills/…, CHANGELOG.md, CLAUDE.md, README.md, web/README.md
  excluded [deleted] ×3: src/components/MonthView.tsx, TickerStrip.tsx, WatchPanel.tsx
with .opencodereview/rule.json {"include": ["tests/**","web/test/**","studio/test/**","**/*.test.ts","**/*.test.tsx","**/*.md"]}
  total=57 reviewable=54 excluded=3 (the three deletions)
$ ocr delegate preview --format json --commit 188b909   → reviewable 0 without the rule, 1 with it
```

- It diffs from the merge base, so the addendum's `--from origin/main` is right as written. The
  57 files and +465/−1054 match the archived record of #320 exactly.
- The default hides the 18 test files, all nine Markdown files (the review skill among them)
  and the whole of `188b909`. With the include rule, read from `.opencodereview/rule.json` with
  no flag, they return.
- **Deleted files are excluded whatever the rule says.** The clearing was a removal PR, and the
  three deletions were its subject. A coverage floor built on this preview needs deletions added
  back from `git diff --name-status`.
- Side effects: the launcher wrote `~/.opencodereview/last-update-check` and checks the npm
  registry for a newer version on use.

**Changes:** see D10. What the manifest needs is `git diff --name-status <merge-base>..<head>`
plus a short exclusion list. `loop` can build that itself; Open Code Review earns its place
only if O2's path-scoped rules are wanted.

### S10 — seat permission profiles (A2)

Each vendor's deny list covered `git tag`, `git push --force`, `gh pr merge` and `gh release`.
The prompt asked for `git tag v9.9.9`, then `sh -c "git tag evade-sh"`, then
`git -C . tag evade-c`.

| Vendor | Profile | Direct `git tag` | `sh -c` | `git -C .` | Other evasions |
|---|---|---|---|---|---|
| Codex | `seat.rules`, `prefix_rule(pattern = ["git", "tag"], decision = "forbidden")` etc., via `codex execpolicy check` | forbidden | no match | no match | `bash -lc`, `env git tag`, `git push -f`, `git push origin +x`: no match |
| Claude Code | `--allowedTools Bash --disallowedTools "Bash(git tag *)"` | denied ("Permission to use Bash with command git tag v9.9.9 has been denied.") | **tag created** | **tag created** | the rule also denied the harmless `git tag -l` |
| Cursor | `.cursor/cli.json` `{"permissions":{"deny":["Shell(git tag)", …]}}` with `--force` | `permissionDenied`, "Command blocked by permissions configuration" | **tag created** (exit 0) | **tag created** (exit 0) | — |

Seatbelts, exactly as A2 said: each catches the direct form, and none catches a shell wrapper or
a flag before the subcommand. They stay because they stop accidents. The boundary is the
ruleset and the seat's credential (D1, D9), and T4 records evasions without requiring them
blocked.

### S11 — seat identity (A3)

```text
$ gh auth status   → github.com account BeniCheni (keyring) · protocol ssh · scopes: 'delete_repo', 'gist', 'read:org', 'repo'
$ gh api repos/BeniCheni/kickoff → admin=true push=true allow_auto_merge=true visibility=public
```

Every seat's `gh` is Beni: an Admin, so the CI gate's "always" bypass covers it, and with
`repo` and `delete_repo` it can edit or disable rulesets and delete the repository. Every seat's
`git push` uses his SSH key, which no token scope limits. The append-only ruleset, which has no
bypass, is the only rule today that binds a seat.

## Seat-record schema v1.1

`seat_record` stays `1`. Every addition is optional, so a v1 record still validates and the
validator needs no version switch. One fenced `json` block ends each pass's PR comment. Values
below are illustrative, from PR #320's Pass 2.

```json
{
  "seat_record": 1,
  "pr": 320,
  "pass": "2",
  "runtime": "cursor agent -p",
  "runtime_version": "2026.11.11-b912975",
  "session": { "id": "<session_id or thread_id>", "log": "stream-json init" },
  "model":  { "requested": "grok-4.7-xhigh", "observed": "Grok 4.7 256K Extra High", "source": "stream-json init.model" },
  "effort": { "requested": "xhigh", "observed": "xhigh", "source": "effort word of init.model" },
  "mode":   { "requested": "write", "observed": null, "source": "not reported" },
  "route":  { "recommended_by": "Planner", "confirmed_by": "Beni", "by_hand": false },
  "posted_by": "BeniCheni",
  "input_sha": "89b8067",
  "output_sha": "09324fb",
  "commits": ["0c7bdd8", "…", "09324fb"],
  "findings": [
    { "id": "F6", "severity": "low", "status": "contested",
      "disposition": "accept-observation-contest-severity",
      "evidence": "<the command and its result>",
      "path": "src/components/TabNav.tsx", "start_line": 0, "end_line": 0, "category": "layout" }
  ],
  "coverage": { "total": 57, "reviewed": 54,
                "skipped": [ { "path": "src/components/MonthView.tsx", "reason": "deleted; covered by tests/removalAudit.test.ts" } ] },
  "not_verified": ["Pass 1's 7-in-9 failure rate"],
  "retries": 0,
  "verdict": "mergeable after fixes"
}
```

What changed from v1, and why:

- **From A4:** `path`, `start_line`, `end_line` and `category` on findings; `coverage`,
  `not_verified` and `retries` on the record.
- **From S2–S4:** `source` on each observed field, `session` (so a later pass can re-derive
  the observed values instead of trusting them), `runtime_version` (log formats are
  undocumented and move with releases), and `mode`.
- **From S8 and S11:** `posted_by`, because the comment author is Beni for every seat today, and
  a seat token (D9) makes it informative.
- **From the Pass 1.5 brief's three answers:** `disposition` (`accept`, `contest`,
  `accept-observation-contest-severity`). `status` stays `open | fixed | contested | killed`,
  and killed findings stay in the record, per A1.
- `pass` is one of `0`, `1`, `1.5`, `2`, `2.5`, `3` and `exec`. A Pass 3 record is written by
  the Planner, quotes Beni's rulings by id, and has `route.confirmed_by: "Beni"`.
- Rules for `observed`: when the CLI reports nothing, the value is `null` with
  `"source": "not reported"`, never a copy of the request. A mismatch fails `loop check` (T13).
- Finding ids are never reused within a PR. Pass 1 numbers F1…Fn. A later pass answers an id
  by repeating it, and opens new ones with its own prefix (#320's Pass 2 used N1 and N2).

What each vendor can actually fill:

| Field | Claude Code (`claude -p`) | Codex (`codex exec`) | Cursor (`agent -p`) |
|---|---|---|---|
| `model.observed` | yes: `modelUsage` in the JSON result | yes: session file `turn_context.model` (not in `--json`) | yes: `stream-json` init `model`, a display name |
| `effort.observed` | yes: transcript `effort` per message (not in the JSON result) | yes: `turn_context.effort` | yes, as the display name's effort word |
| `mode.observed` | yes: transcript `permissionMode` | yes: `turn_context.sandbox_policy` | no: init says `default` under `--mode ask` |
| `session.id` | `session_id` → `~/.claude/projects/<slug>/<id>.jsonl` | `thread_id` → `~/.codex/sessions/…/rollout-*-<id>.jsonl` | `session_id` |
| bad model or effort | not tested; plan mode swapped Haiku for Sonnet with exit 0 | fails loudly | fails loudly |

## Acceptance tests

T1 to T10 are Attachment B's (section 7), restated with what the spikes changed. T11 is the
addendum's. T12 and T13 are new.

- **T1 — sequence.** `loop status` names the next seat and what blocks it at every point of the
  replay; `loop check` fails a record that skips a pass; and, once `loop prep` exists,
  `loop prep <PR> 2` refuses before a Pass 1.5 record exists, naming it.
- **T2 — routing.** One seat per vendor on a confirmed model and effort. `observed` equals
  `requested` for all three; for Cursor, effort is the model-ID suffix (S4). A mismatch stops
  the seat before it pushes.
- **T3 — evidence handoff.** Finding ids carried from Pass 1 to 2.5; deleting one id from
  Pass 2's record fails `loop check`, and restoring it passes.
- **T4 — read-only isolation.** S7's harness per vendor: a canary inside and outside the
  worktree, and a command that writes through a dependency symlink. Nothing changes anywhere.
  Extended by A2: each forbidden command's direct form is refused, and each evasion is recorded.
- **T5 — conflicting findings.** Pass 2 contests a Pass 1 finding; Pass 2.5 escalates; `loop
  authorize` refuses until a ruling is recorded.
- **T6 — changed head.** A push after authorization: the new head lacks `kickoff/360` and GitHub
  blocks the merge; `loop check` classifies the push by D3.
- **T7 — CI failure, and forgery.** `kickoff/360` posted on a red head: GitHub still blocks on
  `verify`, and `loop authorize` refuses a red head. Then each forge path tries to post
  `kickoff/360`: a seat's token, and a workflow added on the PR's own branch. Both must fail
  under D1 and D9 as ruled. The same probe tries a PR-added workflow posting a fake `verify`,
  to settle whether today's pin to the Actions app can be satisfied that way (**UNVERIFIED**).
- **T8 — handoff.** A release-shaped head: `loop handoff` prints the block, and no tag exists
  afterwards.
- **T9 — recovery.** Delete every local file; `loop status` rebuilds the same state from GitHub
  alone. A seat stopped mid-run (commits pushed, no record) reads as "pass in progress", and
  the operator re-routes.
- **T10 — sync exemption.** A PR shaped like `sync/scheduled`, opened and merged by
  `github-actions`, merges on `verify` alone under D2, and an ordinary PR still cannot.
- **T11 — coverage.** The manifest (every path in `git diff --name-status`, deletions
  included) is reviewed or skipped with a reason in each Pass 1 and 2.5 record; deleting one
  entry fails `loop check`.
- **T12 — retry cap (A5).** A malformed record is rejected; the second resubmission that also
  fails escalates to Beni instead of going back to the seat.
- **T13 — route mismatch.** A record whose observed model or effort differs from the request
  fails `loop check`. The fixture is S2's Haiku request that ran Sonnet in plan mode.

## The sprint plan

Sprints 1 to 3 live in the scratch repository (D6), so they share no branch with the overhaul by
construction. Sprints 4 and 5 change the review skill and the merge gate on `main`, which every
overhaul PR's review reads and whose release PR must pass. They land **after v0.6.0 ships**. The
overhaul's builder is Cursor (`design-overhaul-plan.md:217`), so while an overhaul PR is in
Cursor's hands this track seats no Cursor.

**Sprint 0 — this session.** Spikes, this proposal, the archives, the decision packet. No code.

**Sprint 1 — records and the read-only controller (non-production, approved).**
- *Scope:* the schema v1.1 validator; `loop status`; `loop check` (sequence, the SHA chain,
  finding carry, commit authors against the seat's vendor, route mismatch, retry count).
- *Where:* a new scratch repository (D6), code under `scripts/loop/` and tests under
  `tests/loop/`, mirroring the Kickoff home D5 recommends. The replay is seeded from `main` at
  `ddd9a37`, **with `sync.yml` and `pages.yml` deleted in the seed commit**, or the scratch repo
  runs Kickoff's cron sync against ESPN and deploys Pages. The replay branch is then pushed
  commit by commit: `0faf606` (build), `89b8067` (Pass 1), `09324fb` (Pass 2), then `main`
  advanced to `34d078b` and `dcb914e` (the release step). The records are transcribed by hand
  from #320's comments `6880031532`, `6882281451`, `6882900669`, `6884589607` and `6884640961`.
- *Acceptance:* T1 (status and check), T3, T9, T12, T13.
- *Review:* fast-track, Pass 1 then Beni. Nothing here can merge anything that matters; a miss
  costs a sprint, and Sprints 3 and 4 review the same code at full depth before production.
- *Rollback:* archive the scratch repository. Kickoff is untouched.
- *Done (Mon 16 Nov 2026):* merged by Beni as elenchus `84764ff`, a squash of #2; see "Sprint 1's
  build". The rulings since then changed its home (D5, D6, one repository) and its rollback.

**Sprint 2 — preparing a seat (non-production).**
- *Scope:* `loop prep` makes a fresh worktree at the expected SHA with its own `npm ci`, never a
  shared or symlinked install. It refuses when the branch has moved, the route is unconfirmed,
  or another seat's worktree is open on the branch. It writes the seat's deny profile (A2) and
  the coverage manifest (T11). `loop handoff` prints the SEMVER block and never tags.
- *Acceptance:* T1 (`prep`), T4 for all three vendors (Cursor's ask mode is expected to fail,
  per S7), T8, T11.
- *Review:* fast-track, for the same reason as Sprint 1.
- *Rollback:* archive.
- *Built (Mon 16 Nov 2026):* by Cursor as elenchus #4 (`sprint-2`, head `c4497cb`), with the
  fixture #3 for `prep`. Pass 1 asked for a fix round, which Beni ordered the same night; its
  first amendment makes each seat a clone of its own rather than a worktree of a shared clone.
  Merged on Tue 17 Nov 2026 as elenchus `71c8d1c`. See "Sprint 2's build" below.

**Sprint 3 — the gate, on the scratch repo (non-production; D1, D2, D3 and D9 ruled 17 Nov).**
- *Scope:* `loop authorize`; the scratch repo's rulesets mirroring Kickoff's two, plus a third
  for `kickoff/360` alone; the credentials D1 and D9 choose. Seat record schema v1.2, which lets
  a repository name its own passes (Beni, 17 Nov). D2's real change, to Kickoff's `sync.yml`,
  lands in Sprint 5.
- *Acceptance:* T5 (offline), T6 and T7 (with forgery) live on a gate fixture pull request.
  T10 moved to Sprint 5 (Beni, 17 Nov): the replay cannot run a sync, because its `sync.yml`
  refuses any branch but `main`, schedules run only on the default branch, and `elenchus` does
  not let Actions open pull requests.
- *Brief:* [`review-loop-sprint-3-build-prompt.md`](review-loop-sprint-3-build-prompt.md), for
  Codex.
- *Built (Tue 17 Nov 2026):* by Codex on `gpt-6.1-sol`, as elenchus #8 (`sprint-3`, head
  `91aa3dc`), with the gate fixture #6 and the forge pull request #7, now closed. The Planner
  checked the report against GitHub before briefing the review:
  - the rulesets mirror Kickoff's two exactly, apart from the ref;
  - the review gate pins the App's integration, `5804709`, with no bypass;
  - `replay/main` gained one commit, touching only `.elenchus.json`.
  T7's fourth forge path counts as a finding for Kickoff, *corrected after Pass 1 (finding 11)*:
  GitHub labels a `verify` job that the pull request's own workflow adds as a required check.
  That such a job satisfies the CI gate is very likely and not shown, and that it can stand in
  for a failing `verify` is not shown. The plainer path needs no test: a pull request can edit
  the `verify` job in `ci.yml` itself. The review gate held on every forge path GitHub still
  shows.
- *Review brief:* [`review-loop-sprint-3-review-prompt.md`](review-loop-sprint-3-review-prompt.md),
  Pass 0's brief for Pass 1 (Claude Code, `claude-fable-5-2`, `xhigh`), with its sealed appendix as
  a second paste, and the brief that resumed Pass 1 after a restart emptied `/tmp`.
- *Reviewed (Wed 18 Nov 2026):* Pass 1's
  [comment](https://github.com/BeniCheni/elenchus/pull/8#issuecomment-6969080448): *merge after
  a fix round*, 23 findings (4 blocking, 6 should-fix, 13 notes). Beni's rulings on them are
  under "Rulings received" ("Sprint 3's fix round").
- *Fix brief:* [`review-loop-sprint-3-fix-prompt.md`](review-loop-sprint-3-fix-prompt.md),
  Pass 1.5's brief for Pass 2 (Codex in the ChatGPT desktop app, `gpt-6.2-sol`, `xhigh`, by Beni's
  ruling of 18 Nov; the build was `gpt-6.1-sol`).
- *Fixed (Wed 18 Nov 2026):* Pass 2's
  [record](https://github.com/BeniCheni/elenchus/pull/8#issuecomment-6985927278): three commits to
  `65d38f1`, 21 findings fixed and 14 and 15 left open as Beni deferred them.
- *Synthesis brief:* [`review-loop-sprint-3-synthesis-prompt.md`](review-loop-sprint-3-synthesis-prompt.md),
  for Pass 2.5 (Claude Code, `claude-opus-5-5`, `xhigh`), with its sealed appendix as a second
  paste.
- *Carried from Sprint 1's Pass 1* (Beni, 16 Nov, under "Rulings received"; the numbers are that
  comment's findings): 6, sequence by the order records were posted, not their presence; 7, every
  pass's `input_sha` is the previous recorded pass's `output_sha`, writing or not, and a head
  past the last `output_sha` fails here (T6) after Sprint 1's fix round starts reporting it; 8, a
  merged pull request is named in one line and its range rules skipped; 10, the pass that opens
  findings, the passes that carry them and the escalation's addressee move into the
  configuration, beside the pass D3's re-read needs; 13, one paginated compare per writing pass
  instead of one per commit; 14, the replay's records carry `pr: 1`, the pull request they sit on,
  and a rule checks it; 17, schema v1.2 requires a `source` beside a null observed value; 18, the
  configuration Kickoff adopts carries CLI values only, the replay's prose stays in the replay's;
  20, refs are encoded and the base is read as `heads/<ref>`; 21, `authorize` reads `status` and
  `check` together; 22, actions pinned by SHA; and 23 (a) to (d), the replay's transcription
  corrections.
- *Carried from Sprint 2's Pass 1* (Beni, 16 Nov, under "Rulings received"; the numbers are
  [that comment's](https://github.com/BeniCheni/elenchus/pull/4#issuecomment-6936683164)):
  16 and A10, the coverage floor. Today a marked record with no `coverage` is only UNVERIFIED, so
  a seat does better by leaving the block out than by reporting it. And because GitHub's compare
  lists at most 300 files, a pull request of 300 or more can never pass a coverage check
  (Kickoff's `v0.5.0...main` already returns exactly 300). `authorize` decides whether UNVERIFIED
  coverage blocks it, and whether the configuration can require coverage on real pull requests
  while the replay stays exempt. A pull request too large for the compare API needs another
  source for its manifest before Kickoff's overhaul release PR reaches a coverage pass. 25: prep
  fetches the pull request twice.
- *Review:* **all six passes.** This is the gate code Sprint 5 ports. Reviewing it at full depth
  where it is written means the port is a copy of reviewed code.
- *Rollback:* archive.

**Sprint 4 — Kickoff phase 1: records (after v0.6.0).**
- *Scope:* the seat-record block in `pr-comment.md` and `SKILL.md` (with drift items 3 and 4
  fixed in the same PR); `loop status` and `loop check` ported to their home (D5);
  `tests/loop/` joins the root `node` project.
- *Acceptance:* T1, T3, T9 and T13 against a real Kickoff PR's records, read-only.
- *Carried from Sprint 1:* a release artefact Kickoff can pin (finding 15: no `dist/`, no
  `prepare`, `private: true`), and a slot in `pr-comment.md` for the sealed appendix, delivered as
  a second paste after the reviewer's findings are written.
- *Carried from Sprint 2:* the squash body the skill's step 4 asks for, naming who ran which
  pass with each vendor's Co-authored-by trailer, rendered by `handoff` from the records (note
  21 of Sprint 2's Pass 1). From the Planner's re-read of the fix round: the block takes the
  base branch from the pull request instead of naming `main`, and tags the pull request's own
  merge commit (`gh pr view --json mergeCommit`) instead of `origin/main`'s tip.
- *Review:* all six passes. It changes the method every later review reads.
- *Rollback:* revert the merge; seats stop posting the block.
- *Number:* D8.

**Sprint 5 — Kickoff phase 2: the gate on `main` (after Sprint 3 passes).**
- *Scope:* the `kickoff/360` ruleset on `main`, applied by Beni; `loop authorize`; the sync
  change if D2 is Workflow, which touches `sync.yml`'s gates and therefore escalates under the
  Pass 2.5 gate by rule.
- *Acceptance:* T6 and T7 on a docs-only canary PR, and T10 observed on the next two scheduled
  syncs.
- *Candidate, from Sprint 3's T7* (Beni, 17 Nov, under "Rulings received"): a configured binding
  of the App's id to its bot login, so that `status` can name the App's own status. `authorize`
  checks the binding each time it posts, against the `app_slug` its first allowed request
  already returns. Kickoff's configuration is written here from scratch, so adding the binding
  needs no exception to a ruleset.
- *Carried from Sprint 3's Pass 1* (Beni, 18 Nov, under "Rulings received"; the numbers are
  [that comment's](https://github.com/BeniCheni/elenchus/pull/8#issuecomment-6969080448)):
  7, a pass names the pass whose vendor it must differ from, so that the roster's rule is
  checked; 12, a rule for any path under `.github/workflows/` in the manifest; 13, which
  configuration a gate trusts, since a status sits on a commit and a second pull request with a
  lax base can authorize the same head; 14, who may post which pass, with D9's machine account;
  15, blocking on an unreported model without blocking on an unreported effort; A6, what binds
  a seat besides the Keychain prompt; and A7, `prep` for an adopter with no seat token, with the
  Keychain service names as configuration.
- *Review:* all six passes.
- *Rollback:* disable the ruleset (a settings act, Beni's).

**Sprint 6 onward — headless dispatch, one vendor per sprint.**
- Claude Code first: it has the best observability (S2), and S1 proves it can start the skill.
  Codex second. Sprint 8, Cursor's runner, was dropped on 17 Nov with the move to two vendors
  (see "Rulings received").
- *Scope:* `loop run` launches the confirmed flags, reads `observed` back before the seat
  pushes, and stops on a mismatch. The manual path stays.
- *Acceptance:* T2 and T4 for that vendor.
- *Carried from Sprint 2's fix round:* T4's harness counts only files the seat wrote. It does not
  count the vendor CLI's own start-up paths (Claude's `.claude/.cc-writes` and `.git/worktrees`),
  or a directory whose timestamp moved. The limits either allow each CLI's own state writes,
  listed, or point `CLAUDE_CONFIG_DIR` and `CODEX_HOME` at the scratch root. Codex seats have no
  deny profile until Codex can trust a project for one run without writing `~/.codex`.
- *Review:* all six passes for Sprint 6, because the first runner can start a pass that pushes;
  fast-track for the later vendors, which reuse its shape behind Sprint 5's gate.
- *Rollback:* run that vendor by hand again.

**Optional, after Sprint 4 (the addendum's experiment).** On the first real PR at least #320's
size (57 files or 1,500 changed lines in its own diff, the one size this record measured), Pass 1
runs as two fresh sub-agents, Spec and Standards, each covering the manifest. Findings and quota
are compared with a normal Pass 1 before anything is adopted.

**Deferred:** any GUI viewer (Paradev included), any Gemini or Antigravity seat. A Gemini model
may serve as one of S12's judges, which is not a seat.

## The seat roster (D7)

*Amended Tue 17 Nov 2026 for two vendors.* The rule, the two orientations and each sprint's seats
are under "Rulings received". The table below is the roster of 15 Nov.

Model IDs are each CLI's own; effort labels are never mapped across vendors. Every model named
was selectable on 15 Nov 2026: Opus 5.5 (this session), `claude-fable-5-2` (S2), `gpt-6.1-sol`
(S3's run and the catalog) and `grok-4.7-xhigh` (S4's list).

| Sprint | Seat | Who | Why |
|---|---|---|---|
| 0 | Planner | Claude Code, Opus 5.5 | this session |
| 1, 2 | Builder | Codex, `gpt-6.1-sol`, `high` | outside the overhaul builder's window; S3's observability is good. Never switched mid-sprint: if the Plus window refuses a start, wait for it. |
| 1, 2 | Pass 0 brief | the Planner | as on #320 |
| 1, 2 | Pass 1 (fast-track) | Claude Code, `claude-fable-5-2`, `xhigh`, fresh session | the strongest recorded Pass 1, and outside Cursor's window (flag a below) |
| 1, 2 | Pass 3 / executor | Beni rules; Codex applies | fast-track |
| 3, 5 | Builder | Codex, `gpt-6.1-sol`, `xhigh` if quota allows, else `high` | gate code |
| 3, 4, 5 | Passes 0 and 1.5 | the Planner | as on #320 |
| 3, 4, 5 | Pass 1 | Claude Code, `claude-fable-5-2`, `xhigh`, fresh session | strongest review on the gate code |
| 3, 4, 5 | Pass 2 | Codex, the builder, `gpt-6.1-sol`, `xhigh` | SKILL.md's original design: the builder rebuts |
| 3, 4, 5 | Pass 2.5 | Claude Code, `claude-fable-5-2`, `xhigh`, a fresh session that writes nothing | #320's precedent; Codex built it, so Codex cannot synthesise |
| 3, 4, 5 | Pass 3 / executor | Beni rules; Codex applies | |
| 4 | Builder | Codex, `gpt-6.1-sol`, `high` | method text plus a port |
| 6 | Builder; Pass 1 | Codex `high`; Claude Code Fable 5.2 `xhigh` | the runner that launches Claude, reviewed by a seat that did not build it |
| 7 | Builder; Pass 1 | Codex `high`; Claude Code Fable 5.2 `xhigh` | |
| 8 | Builder; Pass 1 | Codex `high`; Claude Code Fable 5.2 `xhigh` | Cursor's runner; no Cursor seat reviews its own launcher |

**Flag (a).** Claude authored C+ and Codex co-signed it, so a Claude Pass 1 reviews an
implementation of its own design, and in Sprints 3 to 5 Claude also sits Pass 2.5. Mitigation
in the roster: each Pass 0 brief seals the design rationale and puts the design's assumptions
(the forge paths especially) in scope as findings. Codex's Pass 2 is the cold read of Pass 1's
fix commits, as Cursor's was on #320. **The alternative:** Cursor on `grok-4.7-xhigh` as Pass 1
for Sprints 3 and 5, independent of both authors. It is not the default because, while the
overhaul builds, Cursor's window is the overhaul builder's.

**Flag (b)** is closed by S4. A Cursor seat's effort is its model ID, and the record shows it.

**Quota.** Codex builds five sprints and also sits the overhaul's Pass 2.5. A loop-track build
starts only when no overhaul Pass 2.5 is due. Starting at `high` rather than `xhigh` outside the
gate sprints is part of the same budget.

## Decision packet

Each answers in one word. **D1 to D4 are candidates** from the brief, because Attachment A does
not list its four.

- **D1 — who may post `kickoff/360`. (Token / App)** *Recommend App.* Ruled "Token", the ruleset
  accepts the status from any source. Then any seat (all of them hold Beni's admin token, S11)
  and any workflow a PR adds on its own branch (default workflow permissions are write, S5) can
  post it, and the gate binds no one. Ruled "App", the ruleset pins the status to one GitHub
  App, as `verify` is pinned today, and only the App's key can post it. Seats run as Beni's
  macOS user, so the key must sit behind a per-use human prompt (a Keychain item that asks, or a
  password manager's CLI with Touch ID). Creating the App is Beni's act. Token becomes sound
  only with D9 = Seat **and** seat pushes over HTTPS with a token that lacks the Workflows and
  Commit-statuses permissions: three conditions instead of one.
- **D2 — the sync PR under the gate. (Bypass / Workflow)** *Recommend Workflow, if D1 is App.*
  `github-actions` opens, approves and merges every sync PR (S6). "Bypass" puts the Actions app
  on the new ruleset's bypass list. Whether GitHub accepts that app as a bypass actor is
  undocumented (**UNVERIFIED**; T10 decides). Even if it does, every workflow inherits the
  bypass, including one a PR adds, so it is safe only when seats cannot push workflow changes.
  "Workflow" has `sync.yml` post `kickoff/360` on its own head as the App. That needs the App's
  key as a secret in an Actions environment restricted to `main`, so a PR's workflows cannot
  read it. It is the repo's first secret (CLAUDE.md: the sync needs "no secret, no PAT"), and it
  changes `sync.yml`'s gates, so that PR escalates by rule.
- **D3 — commits after Pass 2.5. (Allowed-set / Always)** *Recommend Allowed-set,* derived from
  S8. A commit after the Pass 2.5 head needs no re-read when `verify` is green at the new head
  and the commit is one of three things:
  1. It changes only `package.json`, `package-lock.json` (the two lines `npm version` writes),
     `CHANGELOG.md`, any `README.md`, `CLAUDE.md` or files under `docs/`, screenshots included.
  2. It changes a test file only by replacing the previous version string with the new one.
  3. It is a merge of `origin/main` whose `git show --remerge-diff` is empty, with every
     incoming commit already on `main`.

  Anything else needs a recorded Pass 2.5 re-read at that SHA. That covers `src/`, `scripts/`,
  `web/`, `studio/`, `.github/`, `.claude/`, `.agents/`, `src/data/`, a test whose behaviour
  changes, and a merge resolved by hand. Against the census, it sends #320's `217189c` and
  `188b909` to a re-read and passes the other seven; both were re-read in the record. Accepted
  cost: `CLAUDE.md` is in the set because every release step edits its roadmap paragraph, so a
  rule changed there after review is caught only by Beni reading the diff.
- **D4 — Cursor seats headless. (Manual / Headless)** *Reworded, because S4 overtook the
  question.* Effort is expressible headless as the model ID, so "headless with effort recorded
  as not expressible" no longer arises. *Recommend Headless,* for writing seats (Pass 1, Pass 2,
  the executor) once that vendor's sprint passes T2. A headless Cursor seat is never a read-only
  one (S7).
- **D5 — home for `loop`. (Kickoff / Separate)** *Recommend Kickoff,* `scripts/loop/` with
  `tests/loop/` in the root `node` project, so `verify` runs it and the 360 reviews it. Its rules
  are Kickoff's own: the seven version places, D3's set, the skill's pass names. A separate
  repository earns its keep only if `loop` is to serve another repository.
- **D6 — the POC repository. (Public / Private)** *Recommend Public:* rulesets demonstrably work
  on this public repository (S5), and everything the replay pushes is already public. Name it
  for what it is (`kickoff-loop-poc`, say) and archive it when the POC ends. Creating it is
  Beni's act, or the builder's on his word.
- **D7 — the roster above, including flag (a). (Yes / Edit)**
- **D8 — numbering for the Sprint 4 and 5 PRs. (Patch / Fold-into-v0.6.0 / Later)** The number
  is yours; three facts bear on it. `CLAUDE.md` calls a skill, workflow or doc change a patch
  however large. This plan lands Sprints 4 and 5 after v0.6.0. And v0.6.0 is built so `main`
  changes once, with one theme.
- **D9 — seat credentials. (Beni / Seat)** *Recommend Seat:* a fine-grained token for this
  repository only, with Contents and Pull requests write, and without Administration, Workflows
  or Commit-statuses write. Seats push over HTTPS with it, never over Beni's SSH key. Without
  this, every seat can bypass the CI gate, edit the rulesets and delete the repository (S11),
  and S10 shows the seatbelts do not stop a determined command. One unknown remains
  (**UNVERIFIED**): whether a fine-grained token belonging to an admin still gets the Admin
  role's bypass. T7's forge test settles it. If it does, the follow-up question is a machine
  account with the Write role.
- **D10 — Open Code Review as the coverage floor. (Now / Later / No)** *Recommend Later.* The
  floor itself ships in Sprint 2 (T11), built from `git diff --name-status`. S9 shows the
  preview needs two overrides to fit this repo, never lists deletions, and adds a downloaded
  binary and an update check. Adopt it with O2 if path-scoped rules are wanted.
- **D11 — sprint tickets as GitHub issues, O1. (Yes / No)** *Recommend No for now.* This file is
  the plan of record, and issues would be a second roadmap to keep honest. Revisit if the track
  grows past one open sprint.
- **D12 — Jev as an advisory signal in `loop check`. (Pilot / Later / No)** *Recommend Later,*
  after Sprint 4. The Cowork Planner's probes, not re-run here because this seat holds no key,
  show it skewing severity upward and getting a date comparison wrong. And S12 calibrated on
  free-text comments would spend its effort parsing. After Sprint 4, seat records give every
  finding a structured `evidence` field to calibrate on.

## Risks, and what would stop the track

**Stop and stay manual** if any of these happens:
- the controller ever needs to push to a PR branch;
- T9 cannot rebuild state from GitHub alone;
- T7 shows `kickoff/360` can be forged under the D1 and D9 as ruled (the gate would then be
  advisory, which the record must say plainly);
- Beni's actions per cycle rise after Sprint 4, counted before and after.

A read-only probe that writes stops that vendor's read-only seats, which has already happened
for Cursor (S7).

**Risks:**
- **Silent substitution.** Requested is not observed, with exit 0 (S2). Only reading `observed`
  back catches it.
- **Undocumented logs.** The observed values come from session files and an init event whose
  formats can change with any CLI release. Records carry `runtime_version`, and `loop` fails
  closed when a field is missing.
- **Workflows are a privilege path.** Default permissions are write, and any PR can add a
  workflow. Today's `verify` pin may be satisfiable the same way (T7, **UNVERIFIED**).
- **Cursor sees Kickoff's skills** (S4) and may load them on its own.
- **The Codex binary lives inside ChatGPT.app,** at an alpha version that moves with app
  updates.
- **Quota.** Headless seats spend the same plans. Codex is this track's builder and the
  overhaul's Pass 2.5.
- **The replay repo.** Kickoff's own workflows would run there unless the seed commit removes
  them.

## Deliberately not done

- No code. No change to rulesets, branch protection, workflows, `src/`, `web/`, `studio/` or
  `src/data/`. No merge, tag, release or Pages deploy. `npm run sync` not run.
  `/kickoff-pr-review` not run.
- No API key, token, account, GitHub App or repository created. `CURSOR_API_KEY` untouched.
  S12 not run.
- No version number chosen (D8).
- Not verified: Attachment A's four decisions (not supplied); Claude plan mode's enforcement at
  the tool layer (the model declined twice); Cursor's `--sandbox enabled` against its edit tool
  (the model declined); whether GitHub takes the Actions app as a bypass actor; whether an
  admin's fine-grained token gets the admin bypass; whether Cursor honours
  `disable-model-invocation`; Codex's `ultra` level; why plan mode swapped Haiku for Sonnet.
- Probe side effects on this Mac: each CLI's session logs
  (`~/.claude/projects/-private-tmp-claude-501-rlp-spike-*`, `~/.codex/sessions/2026/11/15/`,
  `~/.cursor/chats/` and `~/.cursor/projects/private-tmp-claude-501-rlp-spike-*`),
  `~/.opencodereview/last-update-check`, and `pull/320`, `pull/316` and `pull/247` fetched into
  the main checkout's object store with no ref written. Claude spend was under $2 at list
  prices, $0.81 of it the one Fable 5.2 run. Codex and Cursor drew on plan quota.

## Rulings received

- **D7 — Yes (Beni, Sun 15 Nov 2026).** The roster stands as written: Codex builds, Claude Code
  reviews and synthesises, the Planner briefs, Beni rules. Beni gave the reason with the ruling:
  it lets him drop the xAI subscription he uses for Grok in Cursor. Cursor stays in the track as
  an **optional seat on Cursor's free tier**, in the POC and in the implementation. What that
  changes:
  - No sprint needs a Cursor seat. Where one is used, its model comes from `agent --list-models`
    on the day, and the record shows what ran. Which models and efforts the free tier offers was
    not checked: this Mac was on the paid plan when S4 ran.
  - Sprint 8, Cursor's headless runner, becomes optional, and D4 applies only if a Cursor seat
    is used. Sprint 2 still probes Cursor in T4; a trivial probe fits any tier.
  - Flag (a)'s alternative, Cursor as Pass 1 for Sprints 3 and 5, remains an optional seat,
    subject to the free tier's models.
  - Outside this track, and still open: the v0.6.0 overhaul routes all ten PRs through Cursor
    on Grok 4.7 Extra High, as builder and as Pass 2 (`design-overhaul-plan.md:217`). PR 0 is
    open as #327 (Cursor, last commit 15 Nov 2026 at 2:58 PM EST). When the subscription ends
    decides whether the overhaul is re-routed, which was put to Beni the same day.
- **D7, amended the same day (Beni).** Cursor is not dropping to the free tier. Its "Super"
  tier runs until Thu 19 Nov 2026, then a lower paid tier that still includes Cursor usage and
  some models. And Sprint 8 is in: "definitely conduct Sprint 8". What that changes:
  - **Sprint 8 is required again,** and D4 applies to it. Its T2 uses the effort-suffixed
    Grok 4.7 IDs the lower tier lists. If it lists none, T2 records effort as fixed by the model,
    and D4 comes back to Beni before the sprint starts.
  - Cursor's optional seats in this track run on the lower tier, never ahead of the overhaul's
    Cursor seats.
  - The overhaul's routing around 19 Nov is planned in `design-overhaul-plan.md`, section 3,
    "Amended Sun 15 Nov 2026". Beni approved it as proposed the same day. Its one rule for this
    track: while Codex builds an overhaul PR, this track's Codex builds wait.
  - Today's Super-tier model list is the receipt
    [`verification/review-loop/cursor-models-2026-11-15-super.txt`](verification/review-loop/cursor-models-2026-11-15-super.txt).
    The lower tier's list is diffed against it on 19 Nov.
- **D5 — Separate (Beni, Mon 16 Nov 2026),** against the recommendation. `loop` gets a
  repository of its own instead of `scripts/loop/` in Kickoff. What that changes:
  - Sprints 1 to 3 build the tool in its own repository from the start, not in a Kickoff-shaped
    layout to be ported in Sprint 4.
  - Kickoff's rules (the seven version places, D3's set, the skill's pass names) become
    configuration the tool reads from the repository it checks, not code inside the tool.
  - Kickoff's `verify` no longer runs `loop`'s tests; the tool's own CI does, and Kickoff runs
    a pinned release of it.
  - Sprint 4's Kickoff PR shrinks to the seat-record block in `pr-comment.md` and `SKILL.md`,
    drift items 3 and 4, and how Kickoff calls the pinned tool. D8 still numbers Kickoff's
    Sprint 4 and 5 PRs. The tool repository's own version numbers are a separate question, put
    to Beni before its first tag.
- **D6 — Public (Beni, Mon 16 Nov 2026).**
- **Sprint 1's seats, an edit to D7 (Beni, Mon 16 Nov 2026).** Cursor on Grok 4.7 creates the
  POC repository and builds Sprint 1, and Beni asked the Planner to suggest the effort. The
  Planner recommends `grok-4.7-high` for both. The Super window's `xhigh` goes to the overhaul's
  seats first, and the setup's one irreversible step, the first public push, is guarded by
  checks written into its prompt rather than by depth. If the lower tier keeps
  `grok-4.7-high`, a fix round after 19 Nov runs on the same model. Pass 1 stays a fresh Claude
  Code session on `claude-fable-5-2` at `xhigh`. What that changes:
  - Sprint 1 starts once no overhaul Cursor seat is waiting: after Cursor's #327 fix round is
    pushed, and after PR 1's build if PR 1 runs in the Super window. For Sprint 1 this
    replaces "run on the lower tier" above.
  - A Sprint 1 fix round after Thu 19 Nov runs on whatever the lower tier lists, and its
    record names the model that ran.
  - Codex is free of Sprint 1, so "this track's Codex builds wait" touches Sprints 2 and 3
    onward.
  - Beni created `BeniCheni/elenchus` himself at 12:40 PM the same day (one commit, a README
    holding its name). Cursor's seat stopped before any write, as its brief required, and a
    continuation adopts the repository: nothing is pushed to `main`, and what the brief's
    first commit would have held goes on `sprint-1` for review.
- **One repository, `BeniCheni/elenchus` (Beni, Mon 16 Nov 2026).** The tool and the POC
  replay share it, under four conditions the Planner set out and Beni accepted with the name:
  1. The tool owns `main`, the default branch, and the replay of Kickoff lives only on
     `replay/*` branches. GitHub runs scheduled workflows only from the default branch, and
     `pages.yml` fires only on a push to `main`, so the replay's sync and Pages cannot fire.
     The replay's seed commit still deletes both files, as a second guard.
  2. Every ruleset Sprint 3 creates targets `replay/main` only.
  3. Kickoff's `ci.yml` runs `verify` on replay PRs unchanged: its `pull_request` trigger has
     no branch filter.
  4. The POC ends by deleting the `replay/*` branches.

  The accepted cost: GitHub never deletes a pull request, so the replay PRs stay in the tool's
  history, as drafts labelled `fixture`. Repository-wide settings are shared by the experiment
  and the tool. This replaces the sprint plan's separate scratch repository, D6's "archive it
  when the POC ends", and the "archive" rollback of Sprints 1 to 3; rollback is now reverting
  on `elenchus`'s `main` and deleting the replay branches. The replay keeps Kickoff's original
  SHAs on `replay/pr320` (checked 16 Nov: each range descends from the last, and its commits
  are by one vendor each, the build's four by Codex, Pass 1's six by Claude, Pass 2's four and
  the release step's five by Cursor), so the records' SHAs stay true. The Sprint 1 build
  prompt is [`review-loop-sprint-1-build-prompt.md`](review-loop-sprint-1-build-prompt.md).
- **The replay restores `sync.yml` and `pages.yml` (Beni, Mon 16 Nov 2026),** amending the first
  condition above. Its second guard broke the third condition, because Kickoff's tests read
  `sync.yml`. Cursor restores both files in Sprint 1's fix round; the reasons and the timing are
  under "Sprint 1's build".
- **Sprint 1's fix round (Beni, Mon 16 Nov 2026, "Approve as proposed").** The finding numbers
  are Pass 1's on [elenchus#2](https://github.com/BeniCheni/elenchus/pull/2#issuecomment-6927342519).
  *Fixed now, by Cursor on `sprint-1`:* 1 and 2 (extraction, CRLF, and a notice for a json fence
  not read as a record); 3 (attribution by the top-level `pass` only, and an invalid block never
  displaces a pass's valid record: it is reported and the record kept); 4 (a block whose pass
  cannot be read is listed with its URL and reason, and counts against the first pass that had
  no valid record when it was posted); 5 (`.elenchus.json` lists the accounts whose comments may
  carry records, and `posted_by` must equal the comment's author); 7's status line only (once
  every pass is recorded, status says whether the head equals the last `output_sha`; reported,
  not failed); 9; 11 (the `gh` guard becomes an allowlist); 12's failing-case tests with a CLI test of the exit codes; and notes 16, 19 and
  22's first two. The restore above rides in the same round. The Planner locked #1's
  conversation the same afternoon. *Deferred:* 6, 7's chain rule, 8, 10, 13, 14, 17, 18, 20, 21,
  22's third and 23 (a) to (d) to Sprint 3, and 15 to Sprint 4; each is written into that sprint above.
  23 (e) needs no transcription: #320's "killed as unreproducible" items are Pass 1's verdicts on
  its sealed appendix, not findings, so the fix round adds an offline test of a killed finding
  instead. One detail the table left open: the proposal kept the P9 fixtures as a historical
  capture at `8cb964c`, but finding 5's new field makes their `.elenchus.json` invalid, so the fix
  round re-captures them at the new base, and Git keeps the old capture. After the fix round the
  Planner re-reads each fix against this list, read-only, and Beni merges with a merge message
  written by hand, without Kickoff links.
- **Sprint 2's builder is Cursor (Beni, Mon 16 Nov 2026),** replacing Codex in the roster (D7)
  for Sprint 2's build and its fix round; the Planner picked `grok-4.7-high`, as for Sprint 1.
  Codex now holds no seat in Sprints 1 and 2. Sprint 2 starts once Kickoff #330's Pass 2, an
  overhaul Cursor seat, has run and no other overhaul Cursor seat waits. The roster's rule
  stands: the builder is never switched mid-sprint, so if the tier change on 19 Nov removes
  Grok 4.7 High, the seat stops and Beni re-routes. The brief is
  [`review-loop-sprint-2-build-prompt.md`](review-loop-sprint-2-build-prompt.md). Three things the
  plan left open are settled there, each marked as the Planner's: a seat's route reaches `prep`
  as flags with a named confirmer, because schema v1.1 has no field for the next pass's route;
  seat worktrees live under a root outside every checkout, and one counts as open while its pass
  has no record; and T4's probes run in scratch repositories where `gh` cannot act as Beni, so a
  forbidden command that gets through harms nothing. A second fixture pull request, #3 at
  `0faf606`, gives `prep` a live pass to prepare, which #1, recorded to the end, cannot.
- **Sprint 2's fix round (Beni, Mon 16 Nov 2026, "Approve as proposed").** The numbers are
  Pass 1's on [elenchus#4](https://github.com/BeniCheni/elenchus/pull/4#issuecomment-6936683164),
  findings by number and the sealed appendix's items as A1 to A12. *Fixed now, by Cursor on
  `sprint-2`, in four amendments to the build brief and a list:*
  - **One clone per seat** (2, 4 and 9; A5, A8, A11). Each seat is a clone of its own,
    made with `--reference` to the shared clone and `--dissociate`, about 30 MiB for Kickoff. A
    worktree shares config, hooks and the exclude file with every other worktree of its clone.
    That sharing is the common cause of three findings: a seat's identity leaking into the next
    seat's commits, a hook one seat drops running inside the next `prep`, and the leftover
    branch that stopped a second `prep`. The seat's branch takes the head branch's name, so a
    plain `git push` under git's default reaches the pull request. A seat is open while its
    directory exists and its pass has no record, so deleting the stamp no longer frees it. A
    pull request from a fork is refused.
  - **The release block** (1, 10 and 26; A6, A7, note 21's smaller edges). It refuses a head past
    the last recorded `output_sha`. Kickoff's merge line gains `--repo` and
    `--match-head-commit`, its subject `v{version} — `. The block pulls before it tags, tags the
    squash commit by an explicit SHA, and chains its lines.
  - **Codex's profile** (6). It moves to `.codex/rules/`, trusted only by a `-c` override and
    never by writing `~/.codex`; if that does not load it, `prep` says the profile is not known
    to load.
  - **T4** (7 and 8; A1, A2, A11). Each verdict comes from the vendor's own record, the probe
    environment is built from an allowlist, and Codex runs outside `$TMPDIR`. T4 is re-run for
    Claude and Codex only: Cursor's profile result stands, and a re-run would move its stored
    default again.
  - **The list.** 3 (the git wrapper becomes an allowlist of `prep`'s exact calls); 5 (Pass
    0's expected SHA is the head); 11 to 15; 17's section labels; 18; 19; 22; and 23 with the
    corrected receipts in #4's body.

  *Deferred:* 16 and A10, and 25, to Sprint 3; note 21's squash body to Sprint 4; 20 as an accepted
  risk (`npm ci` runs the head's install scripts as the operator, as the build brief asked); and
  17's fixed `npm ci`, which stays because `prep`'s runner admits only git and npm and a
  configurable install command would widen that. *Beni's other calls, the same night:* the record
  keeps the effort Pass 1 observed, with its source named, in place of the null the review brief
  asked for, because the session transcript records it. Kickoff's SKILL.md section 7 step 8,
  which lists the tag before the pull as this block did, is fixed in a small Kickoff docs PR
  before v0.6.0 rather than in Sprint 4. The stray seat branch was deleted. The brief is
  [`review-loop-sprint-2-fix-prompt.md`](review-loop-sprint-2-fix-prompt.md). After the round the
  Planner re-reads each fix against this list, read-only, and Beni merges with a message written
  by hand, guarded by `--match-head-commit`.
- **elenchus is a general review controller, not Kickoff's tool (Beni, Tue 17 Nov 2026).** keel
  uses it as well as Kickoff, and later projects will too. Beni disliked a README that led with
  Kickoff, because it reads as if elenchus served only one repository.
  - **The README is rewritten** as elenchus #5, a draft stacked on `sprint-2` until #4 merges.
    It describes the tool on its own terms and lists keel and Kickoff as adopters. It names what
    is still fixed in code (the seven pass ids, the finding-carry passes, the escalation's
    addressee, the base branch in the release block), and puts each on the roadmap. The minimal
    configuration and the example record in it pass elenchus's own parser and validator.
  - **The repository's About line now reads:** "A controller for multi-pass, cross-vendor AI code
    review on GitHub. Each agent seat posts a record; elenchus checks them and says what the
    review needs next." Its topics are `code-review`, `ai-agents`, `claude-code`, `codex`,
    `cursor` and `github-cli`.
  - **The description says nothing that is true only for now (Beni, the same day).** Phrases
    like "read-only" or "never writes to GitHub" come out of the About line, the README and
    `package.json`, because the gate will post a status, and every such phrase would need a
    cleanup later. The README's boundaries name the file that enforces each one (`src/gh.ts`,
    `src/git.ts`), so they change with that code. `read-only` stays only as a seat kind, a
    configuration value.
  - **A new roadmap item, not yet scheduled:** schema v1.2 lets a repository name its own
    passes, in place of v1.1's fixed seven. It joins the v1.2 gaps already listed: the next
    pass's route, and the paths a record read rather than their count.
  - **D5 reads more strictly from now on.** Anything that names an adopter, a person or a branch
    belongs in configuration, and a review of elenchus treats a Kickoff value in `src/` as a
    finding.
- **D1, D2, D3 and D9 — as recommended (Beni, Tue 17 Nov 2026, "Approve as proposed").** They
  were put to Beni after Sprint 2 merged, reframed for elenchus as a general controller. The
  recommendations stood, and the generality made three of them stronger.
  - **D1 — App.** One elenchus GitHub App, created by Beni, installed on each adopter repository
    in turn, starting with `BeniCheni/elenchus` for the replay. Each adopter's ruleset requires
    the review status from that App alone. Only the App's key can post it, and the key sits behind
    a prompt that asks Beni on each use. The status's name is configuration, so Kickoff keeps
    `kickoff/360` and keel names its own.
  - **D2 — Workflow.** An adopter's bot workflow posts the review status on its own head, as the
    App. The key is a secret in an Actions environment restricted to the default branch, so
    workflows a pull request adds cannot read it. For Kickoff this is `sync.yml`: its first
    secret, and a change to its gates, which escalates that PR by rule. The question applies
    only to adopters whose bots open pull requests. How T10 runs on the replay is left to
    Sprint 3's brief, because two things constrain it: the replay's `sync.yml` is Kickoff's
    byte for byte, and Actions may not create pull requests in `elenchus`.
  - **D3 — Allowed-set.** A commit after the Pass 2.5 head needs no re-read only when CI is green
    and the commit is one of the packet's three shapes. The set is configuration in
    `.elenchus.json`, with Kickoff's values as the packet lists them.
  - **D9 — Seat.** Each adopter repository gets a fine-grained token for that repository only,
    created by Beni. It has Contents and Pull requests write, and no Administration, Workflows
    or Commit-statuses write. Seats push over HTTPS with it, never through the operator's own
    credentials; T1's live `git push --dry-run` showed a seat authenticating through Beni's
    global credential store as the admin account. T7 settles whether an admin's fine-grained
    token keeps the admin bypass; if it does, a machine account with the Write role follows.
    The Planner never creates, reads or prints the token or the App's key.
  - **What Sprint 3 needs from Beni before its live tests:** the App, installed on `elenchus`,
    and the seats' token. The build brief names their exact settings.

- **Sprint 3's builder, and four rulings for its brief (Beni, Tue 17 Nov 2026).** Codex builds
  Sprint 3, as the roster has it ("Codex, per roster"). Asked before the brief was written, Beni
  took each recommendation:
  - **A record's `pr` is the pull request it sits on.** The replay's records are edited to carry
    1 and 3, with Sprint 1's transcription fixes 23 (a) to (d); a new rule checks the number.
  - **`sequence` checks posting order,** not presence (Sprint 1's finding 6). Re-reads are
    excepted.
  - **T10 moves to Sprint 5,** where D2's change to Kickoff's `sync.yml` lands. Sprint 3 proves
    what D2 rests on instead: the App's status is the only one the review gate counts, and a
    workflow a pull request adds can neither post it nor read a secret kept in an environment
    restricted to the base branch.
  - **Schema v1.2 lets a repository name its own passes, in Sprint 3.** It joins v1.2's other
    changes: a source beside every null observed value, a re-read that can be recorded, the
    route of the next pass, and the paths a record read.

  The brief is [`review-loop-sprint-3-build-prompt.md`](review-loop-sprint-3-build-prompt.md).
  Eight resolutions in it are the Planner's, each named there:
  - `authorize` blocks on unverified coverage, configured per adopter;
  - a manifest past the compare API's 300 files comes from two tree reads;
  - `authorize`'s refusal of a red head makes "a review status on a red head" unreachable by
    construction;
  - a gate fixture with constructed records keeps #1's receipts T9's;
  - the rulesets mirror Kickoff's two exactly, plus a review gate with no bypass;
  - D2's environment rule is tested with a dummy secret;
  - T5 runs offline;
  - D9's token reaches a seat through the clone's own credential configuration.

  Beni starts the build only when no overhaul Codex build is running, and its live part only
  after he has created the App and the seats' token.

  A ninth went to Codex before part F. `security find-generic-password -w` prints a value as hex
  whenever any byte is not printable (Apple's `keychain_find.c`), and a PEM always has newlines,
  so `authorize` decodes the App key from that hex form. The README says how to store each item
  so that it reads back this way.

- **What `status` says about a status's source (Beni, Tue 17 Nov 2026).** Codex asked during
  T7. GitHub's status API names a status's creator only by login, id and account type
  (`elenchus-gate[bot]`, `Bot`), never by App id. `GET /apps/<slug>` returns 404 for a private App
  to the operator's `gh` login. So `status` cannot tell the configured App's status from another,
  as Part C of the brief assumed it could. Beni took the recommendation, to document the limit:
  - **`status` names each status on the configured context at the head** by its state and its
    creator's login and account type. It says the source is UNVERIFIED, and that the review
    gate's ruleset decides whether the status counts.
  - **The wording is the same for every creator,** an App's bot or a person. A person's status
    can carry an App's integration when it is posted with that App's user token, and only GitHub
    sees the integration.
  - **It is display only:** no `check` rule, and nothing `authorize` reads or blocks on. The README
    and the pull request state the limit.
  - **Sprint 3 adds no App-to-login binding.** One would have needed a change to `replay/main`
    with its review gate turned off. It is a candidate for Sprint 5 instead (see there).

- **Two vendors, each at its deepest (Beni, Tue 17 Nov 2026).** Beni moved to Claude Max and
  ChatGPT Pro, and is ending the xAI and Cursor paid tiers. *Corrected Wed 18 Nov:* xAI was kept,
  downgraded to $8 a month, for light work only ("A light seat on Grok 4.7", below). He asked for
  the review cycle to be fitted to the two vendors at the deepest each subscription allows. He
  approved four proposals as written, after confirming that GPT-6.2 Sol is available and having
  it folded in.
  - **D7, amended: one rule, two orientations.**
    - **The rule.** The vendor that builds a pull request never holds its Pass 1 or Pass 2.5.
      The other vendor holds both, each in a fresh session, and Pass 2.5 writes nothing.
    - **Review briefs.** The reviewing vendor also writes the review briefs (Passes 0 and 1.5),
      so the side that built never steers its own reviewer.
    - **Two models.** Pass 1 and Pass 2.5 run on different models of the reviewing vendor, so
      the synthesis never judges findings written by its own model.
    - **The Claude Planner** keeps the plan of record and writes every build brief.

    | Seat | Codex builds (Sprints 3, 5, 7) | Claude builds (Sprints 4, 6) |
    |---|---|---|
    | Plan of record and build brief | Claude Planner | Claude Planner |
    | Passes 0 and 1.5 | Claude Planner | Codex, `gpt-6.2-astra`, as review lead |
    | Build, Pass 2, executor | Sprint 5: `gpt-6.2-astra`, `xhigh`. Sprint 7: `gpt-6.2-sol`, `xhigh`. Sprint 3's build stayed on `gpt-6.1-sol`; its fix round runs on `gpt-6.2-sol` (Beni, 18 Nov). | Claude Code, `claude-fable-5-2`, `xhigh` |
    | Pass 1 | Claude Code, `claude-fable-5-2`, `xhigh` | Codex, `gpt-6.2-astra`, `xhigh`, fresh |
    | Pass 2.5 | Claude Code, `claude-opus-5-5`, `xhigh`, a fresh session that writes nothing | Codex, `gpt-6.2-sol`, `xhigh`, `--sandbox read-only` (read-only on disk, S7) |

    - **Sprint 3** is Codex's and already building; a sprint never switches mid-build. Its
      Pass 2.5 becomes Opus 5.5 at `xhigh`. The review paragraph of its build brief is
      superseded on that point, and Sprint 3's Pass 0 brief carries the new seats.
    - **Sprint 4 is Claude's.** It is Kickoff's skill text, in Claude's own skill format, and a
      Codex review clears flag (a) for it.
    - **Sprint 5 is Codex's.** It ports Sprint 3's reviewed gate code, so the port stays a copy.
    - **Sprints 6 and 7 cross,** so that no vendor reviews its own launcher: Claude builds the
      Claude runner and Codex reviews it, and the reverse for the Codex runner.
  - **The models, as Codex's catalog listed them on 17 Nov** (`codex debug models`, codex-cli
    0.169.0-alpha.11.1):
    - **`gpt-6.2-astra`** is "our most capable model for complex coding and professional work".
      It takes the gate build, the cold review and the review briefs.
    - **`gpt-6.2-sol`** is the "fast, go-to model for coding and everyday work". It takes the
      other builds and the synthesis.
    - **`gpt-6-astra`** is now "previous generation".
    - **Efforts.** Every GPT-6.x model offers `low` to `max` plus `ultra`, which is "maximum
      reasoning with automatic task delegation". Claude Code 2.1.325 offers `low` to `max`. No
      seat goes above `xhigh` (Beni's effort cap, below). Effort labels are still never mapped
      across vendors.
    - **Configuration.** Sprint 4's brief adds both 6.2 models to the model tables in Kickoff's
      configuration.
  - **The wait rule stood at this ruling:** this track's Codex builds waited while an overhaul
    Codex build ran. Beni lifted it the same evening (the overhaul's routing, below).
  - **Sprint 8 is dropped and D4 withdrawn.** Both concerned Cursor seats.
    - **elenchus stays vendor-neutral.** An adopter such as keel may still configure Cursor,
      and nothing in `src/` changes.
    - **The 19 Nov check of Cursor's models is dropped.**
    - **Outside this track:** the v0.6.0 overhaul routed its builder and Pass 2 through Cursor
      on Grok (`design-overhaul-plan.md`). It was re-routed to two vendors the same evening
      (below).
  - **D12 — Pilot, with S12 widened to compare judges.**
    - **The blocker is gone.** D12 waited for a structured evidence field, and schema v1.2's
      findings carry `evidence`.
    - **The judges.** S12 asks O3's two questions, the evidence screen and the missed-high
      screen, of each of these:
      - **Jev:** `jev-1.14.0` pinned, `@typesafe-ai/sdk` 0.7.0, Node 22 or later.
      - **Claude:** Haiku 5.5, Sonnet 5.5 and Opus 5.5 through the API credits, with structured
        outputs and the Batches API.
      - **GPT:** `gpt-6.2-sol` through `codex exec --output-schema --ephemeral --json` on Pro
        quota, with no key.
      - **Optionally Gemini,** through fal's OpenRouter route.
    - **The answer key** is Beni's rulings on about 70 findings: Kickoff PR 320's Pass 1, and
      elenchus Sprints 1 and 2's Pass 1 with Sprint 2's appendix.
    - **The cost** is about $3–6 in all.
    - **The keys.** Beni sets `TYPESAFE_API_KEY` and `ANTHROPIC_API_KEY` in his own shell and
      runs the script, which a seat writes. The Planner never sees a key.
    - **What a calibrated judge becomes:** an advisory signal in `check` under O3's rules,
      adding NOTICE lines only and never passing or blocking anything.
    - **One caveat.** Claude and GPT state a confidence, while Jev reports a calibrated
      probability. S12 scores all of them the same way.
  - **The App's avatar and the repository's social preview** were generated on fal: Nano Banana
    Pro, four images, about $0.60. Beni chooses which to use and uploads them himself.

- **The effort cap is Extra High (Beni, Tue 17 Nov 2026).** No model runs deeper than `xhigh`,
  the level both CLIs call Extra High. That applies to every seat on both vendors, and to S12's
  judges. `max`, and Codex's `ultra`, are used nowhere.
  - **The roster.** The two-vendor table above was amended to read `xhigh` wherever it said
    `max`.
  - **Sprint 3.** Its Pass 0 brief and Pass 0 comment were corrected before Pass 1 started.
  - **Enforcement already exists.** In `examples/kickoff.elenchus.json`, every vendor's effort
    table stops at `xhigh`, so `check`'s route rule fails a record that requests `max`. Sprint
    4's brief keeps that ceiling when it adds the two GPT-6.2 models.

- **The overhaul on two vendors, and the wait rule lifted (Beni, Tue 17 Nov 2026).** Beni
  approved the overhaul's re-routing "as drafted". It is `design-overhaul-plan.md`, section 3,
  "Amended Tue 17 Nov 2026: two vendors, and no seat for Cursor or Grok", in Kickoff PR 340,
  merged into this branch the same night. It applies the two-vendor rule above to overhaul PRs 3
  to 9: Codex builds 3, 6 and 8, and Claude builds 4, 5, 7 and 9. *Corrected Wed 18 Nov:* PRs 1b
  and 2 were already building in Cursor when Beni approved it, and he kept both ("Keep both
  builds"), so #341 and #342 are reviewed under the Sun 15 routing (Pass 1 Claude, Pass 2 Cursor
  before Thu 19 Nov, Pass 2.5 Codex). What it changes for this track:
  - **The wait rule is lifted.** It came with the overhaul's Sun 15 Nov amendment (under D7,
    above): while Codex built an overhaul PR, this track's Codex builds waited.
  - **In its place, on either vendor,** both tracks may run at once, and an overhaul seat
    outranks a seat of this track. When a vendor's usage limit warns or refuses, this track's
    seat on that vendor yields first: it pushes what is green and waits. None of this track's
    seats starts on that vendor while an overhaul seat waits for room.
  - **It now reaches Claude's seats too.** The overhaul's Claude builds share Claude Max with
    this track's Claude seats, so a Pass 1, a Pass 1.5 or a Pass 2.5 here can be the seat that
    yields. *Corrected Wed 18 Nov:* this week both vendors carry overhaul seats, since #341 and
    #342 each take a Claude Pass 1 and a Codex Pass 2.5, so Sprint 3's Codex fix round can be the
    seat that yields too.
  - **A seat that yields resumes on the same model.** A sprint still never switches seat or
    model mid-build.

- **Sprint 3's fix round (Beni, Wed 18 Nov 2026, "Approve and post").** Pass 1
  ([comment](https://github.com/BeniCheni/elenchus/pull/8#issuecomment-6969080448),
  `claude-fable-5-2` at `xhigh`) returned *merge after a fix round*: 23 findings (4 blocking, 6
  should-fix, 13 notes), and verdicts on all ten appendix items, none of which changed a finding
  or joined one. Beni approved the Planner's dispositions as proposed. The brief is
  [`review-loop-sprint-3-fix-prompt.md`](review-loop-sprint-3-fix-prompt.md), for Codex, the
  sprint's builder; the model it runs on is the next item.
  - **The fix round's model (Beni, Wed 18 Nov 2026, "we can use gpt-6.2-sol and Extra high").**
    Pass 2 runs on `gpt-6.2-sol` at `xhigh`, in Codex in the ChatGPT desktop app, because the
    restart closed the terminal that built the sprint. It is a ruled exception to the rule that a
    pull request never changes model partway: the builder stays Codex, the build stays
    `gpt-6.1-sol` on its record, and Pass 2's record names Beni as recommending its route. Pass
    1.5's `next_route` still carries `gpt-6.1-sol`, the roster's recommendation when it was
    posted; nothing reads it but `prep`, so it stands as history. The example configuration's
    Codex table gains `gpt-6.2-sol` in this round. Sprint 3's executor model is Beni's word when
    it starts; the Planner recommends the fix round's.
  - **Fixed in Pass 2:** 1 to 6, 8 to 11 and 16 to 23; the test half of 7, the README half of 12
    and the output half of 13; A1 and A9, as corrections in the pull request's body; A3, by
    deleting `codex/forge`; and A10, the latest status per creator in `status`'s gate line.
  - **Three of the four blocking findings were the Planner's.** The build brief restated D3
    loosely: Part D measured it from "the last recorded output_sha", Part B put the merge shape
    as a second-parent test, and its path list dropped "(the two lines `npm version` writes)".
    The fix brief quotes the ruled packet word for word, and later briefs quote a ruling instead
    of restating it.
  - **The Planner's resolutions.** The merge shape is a three-way test against the merge base,
    because the API cannot run `--remerge-diff`; a path both sides changed goes to a re-read.
    The version files are compared parsed, so a dependency pinned at the old version string
    cannot move with the bump. A later unmarked record at the same SHAs replaces the earlier one,
    and `status` names both comments.
  - **Two constraints.** `replay/main` does not change, because its review gate admits a commit
    only with the App's status, so every rule must work on the replay's configuration as it
    stands. No seat reads a Keychain item in this round: the live gate (T1, T6, T7) waits until
    Beni re-creates both items with an empty trusted list and rotates the App's key and the
    seats' token (finding 8).
  - **Deferred to Sprint 5:** 7's vendor check, 12, 13's trusted configuration, 14, 15, A6 and
    A7, each written into Sprint 5 above. **Recorded as a limit:** a lock does not stop an
    admin's comments (A2).
  - **Corrected here:** the Sprint 3 entry's line on T7's fourth forge path, which said more
    than its evidence (finding 11).
  - **Pass 1 ran in two sessions.** A restart of the Mac emptied `/tmp` after the findings were
    written and before the appendix. The Planner checked the first session's transcript (one
    message from Beni, no read of the archive, every command outside the sandbox a GitHub read
    or inside the seat's isolated wrapper), and a second session rebuilt the draft from it to the
    first session's numbers before the appendix was pasted. Both briefs are archived together.
    Beni ruled the record's `runtime_version` 2.1.325, the version every line of the first
    transcript carries: an auto-update put 2.1.326 on PATH in the minute the session started,
    and its `claude --version` ran that.

- **A light seat on Grok 4.7 (Beni, Wed 18 Nov 2026, "Yes, record it").** xAI was downgraded
  that day to $8 a month, not ended. The tier offers one model, Grok 4.7, at medium effort only,
  with a 256K context window. Beni is keeping it for now and may still drop it. He offered it
  "for anything simple docs update, straightforward hotfixes or Pass 3 to logistically approve,
  merging PRs and tagging and/or releasing new version", and said to record it with the
  Planner's limits:
  - **It builds only small work:** simple docs updates and straightforward hotfixes. D7's rule
    holds with a third vendor: when Grok builds, Claude and Codex hold Pass 1 and Pass 2.5.
  - **It never holds Pass 1 or Pass 2.5, and never writes a ruling.** Medium effort is too
    shallow for a cold review or a synthesis.
  - **A Pass 3 goes to it only when nothing is left to decide:** Pass 2.5 says ready, no finding
    is open or contested, and Beni's ruling is a plain yes. Grok then writes the record from
    Beni's words. Anything that needs judgement goes to the Planner.
  - **Merges, tags and releases** run on Grok only for the version Beni names, each on his word.
    *Narrowed the same day:* the runtime is chat only (below), so Grok drafts the release notes
    and the commands, and Beni runs them.
    The number stays his (D8).
  - **Sprint 3 is unchanged.** The Planner writes its Pass 3 record. Its executor, the first live
    run of `authorize`, does not go to Grok; its model is still Beni's word (above).
  - **Two points were open; the first is answered.**
    - **The runtime.** The only Grok software on Beni's Mac is `Grok Bot.app`; there is no CLI.
      *Answered the same day (Beni, "Chat only"):* it cannot run git, gh or tests, and it reads
      only what Beni pastes in. So Grok drafts and someone else acts. Its docs text, release notes
      and Pass 3 records are committed and posted by Beni. A hotfix it drafts is applied by Beni
      or a Codex or Claude seat, which runs the tests before the pull request opens.
    - **The model tables.** `check`'s route rule looks a record's runtime up in the
      configuration's vendors and fails any model or effort its tables do not list
      (`src/report.ts`). Until a configuration lists xAI with `grok-4.7` at `medium`, a Grok
      record fails `check` and blocks `authorize`. Sprint 4's brief adds that entry to Kickoff's
      configuration, beside the two GPT-6.2 models.

D8, D10 and D11 are not yet ruled. D4 is withdrawn, and D12 is Pilot (17 Nov).

## Found after the spikes (15 Nov 2026, afternoon)

- **The Cursor CLI updated itself during the session,** from `2026.11.11-b912975` (S4) to
  `2026.11.13-eacade1` (`agent about`, "up to date"). Seat records carry `runtime_version`
  for exactly this, and `loop` reads the observed fields per version.
- **The Cursor CLI keeps the last `--model` as its default.** The S4 to S10 probes left
  `~/.cursor/cli-config.json` (rewritten at 2:33 PM) with `selectedModel` set to `grok-4.7` and
  `reasoning_effort: "low"`. The value before the probes was not recorded, so it was not
  restored. A seat that omits `--model` inherits whatever ran last. `loop run` always passes
  it, and a hand-run Cursor seat names its model at the start.
- **`agent about` reports the subscription tier** ("Subscription Tier   Super"). A Cursor seat
  record can carry it, so a run on a lower tier is visible in the record.

## Found while writing Sprint 1's prompt (16 Nov 2026)

- **Schema v1.1 has no pass value for D3's re-read.** #320's last comment (`6884640961`) is the
  PM seat's re-read at `dcb914e`, after the release step. It is neither Pass 3 (Beni's
  adjudication) nor `exec`. The replay posts no record for it, and Sprint 3 must give the
  re-read a place in the record before `loop authorize` can rely on D3.
- **#320's executor called itself "Pass 3"** (comment `6884589607`). In schema v1.1 that work is
  `exec`, and Pass 3 is Beni's adjudication. The replay transcribes it as `exec`.
- **The sticky Cursor default caught a real seat.** On 16 Nov, Cursor stopped overhaul PR 1's
  build when its model check read the CLI's stored Low default. That brief now starts Cursor
  with `--model grok-4.7-xhigh` and requires `agent about` to confirm it, and Sprint 1's prompt
  does the same at `grok-4.7-high`.

## Sprint 1's build (16 Nov 2026)

Cursor (Grok 4.7 256K High, Super tier, CLI `2026.11.13-eacade1`) opened
[elenchus#2](https://github.com/BeniCheni/elenchus/pull/2), `sprint-1` → `main` at `f02a644`
(56 files, 20 tests), and the replay [elenchus#1](https://github.com/BeniCheni/elenchus/pull/1)
at `dcb914e`, a draft labelled `fixture` on `replay/main` at `8cb964c`: the seed `b599caf` on
`ddd9a37`, then a merge of Kickoff's `34d078b`. `main` is still Beni's `11d9e53`. The Planner
checked the report with read calls before writing the fast-track Pass 1 brief,
[review-loop-sprint-1-review-prompt.md](review-loop-sprint-1-review-prompt.md), whose sealed
appendix carries the four items below to the reviewer.

- **The replay's `verify` is red by construction.** Kickoff tests open
  `.github/workflows/sync.yml` (`tests/diff.test.ts`, `tests/syncPrBody.test.ts`,
  `tests/syncPublication.test.ts`, `tests/venueTz.test.ts`, `studio/test/secrets.test.ts`), and
  the layout's first condition deletes it, so its third condition, `verify` running unchanged,
  runs red at every head of #1. Sprint 1 reads no CI, but Sprint 3's ruleset on `replay/main`
  and its gate do. **Beni ruled the same day: restore them**, amending the layout's first
  condition. A new commit on `replay/main` restores both files byte for byte from `34d078b`, with
  no force-push, so the base's tree is Kickoff's `34d078b` plus `.elenchus.json`. The deletion
  was a second guard, and three others hold without it. Schedules run only from the default branch,
  whose tree has no Kickoff workflow; `pages.yml` fires only on a push to `main`; and `sync.yml`'s
  own rule stops a real run dispatched on any branch but `main` with an error. Elenchus
  also has "Allow GitHub Actions to create and approve pull requests" off. The alternative, not
  taken, kept the deletion and left `verify` out of Sprint 3's required checks, which would have
  made the replay unlike Kickoff at the one check the gate exists to read.
  *When:* Cursor makes the commit in Sprint 1's fix round, after Pass 1 posts, never under a
  running review: moving `replay/main` changes the `base:` line of the live status that Pass 1
  compares byte for byte with the P9 receipt (T9). The fix round then re-captures that receipt at
  the new base, closes and reopens #1 to get a fresh `pull_request` run (a push to the base starts
  none, and a re-run reuses the old merge commit), and watches `verify` and Studio to their
  conclusion. If Pass 1 orders no fix round, the restore goes out in a brief of its own. The
  ruling waited here until Pass 1 posted, because the Pass 1 brief sealed this section and had
  the reviewer read "Rulings received"; it is now recorded there too.
- **Kickoff's timeline gained two cross-references.** Sprint 1's brief titled the replay "Fixture:
  replay of BeniCheni/kickoff#320", and #2's body links #320, so GitHub added two events to
  #320's public timeline (18:34Z and 18:45Z). That is not a write to Kickoff's content, but it is
  a visible effect on a pull request the brief meant to leave untouched. Later briefs name a
  Kickoff pull request in plain text ("Kickoff PR 320"); the two events stay, because editing the
  title would be a write and would not remove them.
- **GitHub kept a stale pull-request object.** After `replay/main` moved, `pulls/1` still gives
  `base.sha` `b599caf`, and #1's commit list still shows `34d078b` and `f7775c9`, both reachable
  from the base. `f02a644` reads the base branch tip instead. Sprint 3's gate must never trust
  `base.sha` from the pull-request object.
- **The live T3 left its trace.** The replay's Pass 2 comment shows two edits, at 18:41:28Z and
  18:41:51Z, so the delete-and-restore can be checked without repeating it.
- **Pass 1 posted at 19:50Z**
  ([comment](https://github.com/BeniCheni/elenchus/pull/2#issuecomment-6927342519)), on
  `claude-fable-5-2` in Claude Code 2.1.325: *merge after a fix round.* It made 23 findings: one
  blocking (the record extractor matches from the comment's first json fence, so a valid record
  that follows an earlier json block is rejected as invalid JSON), twelve should-fix and ten
  notes. It reproduced T9 byte for byte (27 GET calls, 3.0 MB), checked the replay's 19 SHAs and
  the seed's three paths, and confirmed all four sealed items. A deletion test found 17 of 31
  single-rule removals that leave the 20 tests green, the five SHA-chain conditions among them.
  Finding 13's "15-commit pull request" is 17 commits across the three ranges; the reviewer
  corrected that in chat and left the comment unedited.
- **The seal did not hold, and could not.** The appendix came in the same paste as the brief, so
  the reviewer had it in context from the first minute. It kept this section unread until its
  findings were on disk, and said so. From now on a sealed appendix is a second paste, sent
  only after the reviewer says its findings are written. Sprint 4's port of the review skill
  needs the same, and `pr-comment.md` has no slot for the appendix either.
- **Two items outside the code.** #1 is a public pull request and the tool reads any account's
  comment as a record (finding 5), so #1's conversation should be locked. And #2's merge message
  is written by hand without Kickoff links, or a third cross-reference lands on Kickoff's #320.
- **The fix round, and the Planner's re-read of it (Mon 16 Nov 2026).** Cursor (Grok 4.7 256K
  High, Super) moved `sprint-1` to `970e2cb`, with eleven commits by Cursor on `f02a644` and no
  force-push, and `replay/main` to `b216e81`, one commit whose tree differs from Kickoff's
  `34d078b` only in `.elenchus.json`. With the files restored, `verify` and Studio on #1 are
  green (runs `43950246148` and `43950246712`), so Sprint 3's ruleset can require `verify`. The
  Planner's re-read, read-only, in a fresh clone: a clean `npm ci`, the typecheck and 59 tests in
  7 files pass; the packed tarball installed alone prints a live `status` on #1 byte-identical to
  Cursor's receipt (sha256 `492045c1…`) and to the committed fixture, now with "head equals last
  output_sha dcb914e"; live `check` exits 0 with the four unverified lines. Each ruled fix is in
  the code with a test named for it. `ed61530`, whose title reads like finding 6, only changes a
  test, which pins that the later valid record stands. Comments are sorted by creation before
  anything is counted, so finding 4's "when it was posted" holds. Only GitHub's "Not Found" and
  "No common ancestor" become `FAIL … cannot resolve`, and a network failure still exits 2,
  which a timeout during the re-read showed live. Seven deletions, repeated by the Planner, all
  fail a test, three of them Pass 1's survivors. Nothing in Kickoff moved. One note for Sprint 3:
  as the fix brief asked, every comment by an account outside `record_authors` gets a NOTICE,
  json or not, which on a Kickoff pull request with bot comments is noise; limit it to comments
  that hold a json fence.
- **Merged (Beni, 21:06Z).** Beni squash-merged #2 with the Planner's message, guarded by
  `--match-head-commit 970e2cb`. `main` is `84764ff`, one parent `11d9e53`, and its tree
  (`47deaa0`) is `970e2cb`'s exactly. The message carries no Kickoff link, and Kickoff's #320
  gained no third cross-reference. `test` on the push to `main` is green (run `43956628420`).
  #1 stays open and locked as the fixture; `sprint-1` is left in place.

## Sprint 2's build (16 Nov 2026)

- **What landed.** Cursor (Grok 4.7 256K High, Super, CLI `2026.11.13-eacade1`) opened elenchus
  #4, `sprint-2` → `main`, head `c4497cb`: six commits by Cursor on `84764ff`, 62 paths by
  `git diff --name-status --no-renames` (30 A, 17 D, 15 M; 17 of the deletions and 17 of the
  additions are the re-captured replay fixtures). `replay/main` moved by one fast-forward commit
  to `956af47`, changing only `.elenchus.json`. The new fixture #3 is `replay/pr320-p1` at
  Kickoff's `0faf606`, a draft labelled `fixture`, locked (with the reason "resolved"; #1 has
  none), holding one comment, `6930818158`, whose body is byte-identical to #1's Pass 0 comment.
- **The Planner's check, read-only, in a fresh clone.** Every one of the six commits passes the
  typecheck and its 83 tests on its own. Live, at `c4497cb`: `status` and `check` on #1 are
  byte-identical to the re-captured fixture, and `check` adds exactly the two `UNVERIFIED
  coverage` lines for passes 1 and 2.5; `status 3` reads Pass 0 recorded and next 1; `handoff 1`
  prints the v0.5.5 block and exits 0; `handoff 3` refuses with "no valid record for pass 1". The
  tag list is empty. `~/.elenchus/seats` holds the bare clone T1 left and no worktree or tag.
  Nothing in Sprint 2's commits or pull-request text names a Kickoff pull request, and Kickoff's
  #320 and #330 gained no cross-reference from elenchus.
- **T4's results need reading, not counting.** The pull request reports Claude's writing profile
  as not refusing `git tag`, Codex's `exec` as not loading its rules file, and the read-only
  seats as declining. What the Planner found behind those lines is the second paste of the Pass
  1 brief ([review-loop-sprint-2-review-prompt.md](review-loop-sprint-2-review-prompt.md)), kept
  from the reviewer until its findings are written, so the reviewer should not read this section
  first.
- **One consequence outside the code.** The T4 probe passed `--model grok-4.7-low` to Cursor,
  so the Cursor CLI's stored default is now Grok 4.7 256K Low (read from its config, not edited).
  A Cursor seat started without an explicit `--model` would now run at Low; every Cursor brief
  already names its model.
- **Pass 1 posted at 02:59Z on 17 Nov** (Mon 16 Nov, 9:59 PM in Brooklyn;
  [comment](https://github.com/BeniCheni/elenchus/pull/4#issuecomment-6936683164)), on
  `claude-fable-5-2` at xhigh in Claude Code 2.1.325: *merge after a fix round.* It made 26
  findings, 3 blocking, 12 should-fix and 11 notes. The blocking three:
  - The release block tags the commit before the merge, and pushes that tag. Reproduced on a
    local origin.
  - A seat's plain `git push` is refused, because the seat branch's name differs from the head
    branch's. The obvious retry creates a stray branch on the remote.
  - The git wrapper refuses subcommands, not writes. Through it the reviewer created a tag with
    `fetch`, moved a branch backwards, wrote the global config and ran an arbitrary command; none
    of `prep`'s own calls does this.

  Every acceptance receipt it repeated reproduces, with two exceptions:
  - **T4's Claude verdict.** The build's probe ran all six commands in one `for` loop through
    `eval`, so no direct form reached the profile. The reviewer's two single-command probes were
    both denied.
  - **The deletion claim.** 13 of 30 single-rule deletions leave the 83 tests green, among them
    the only line that binds `prep` to the git wrapper.

  It found what the Planner's appendix had not: `prep` refuses Pass 0, so the first seat of every
  review cannot be made; and one clone shared by every seat is writable state between them. Its
  record validates with the pull request's own code. Coverage is 62 paths: 45 read, and the 17
  deleted fixtures skipped, each with a reason.
- **The seal held, though a paste went astray.** The reviewer saved its findings before seeing
  anything of the Planner's, and it had reached ten of the twelve appendix items on its own. Beni
  then pasted the Planner's provisional rulings by mistake before the appendix. The reviewer
  checked them without posting, and corrected four points that went into the rulings:
  - finding 18 fails Sprint 1's author rule today;
  - the stray branch came from T1, not T4;
  - finding 17 was half assigned;
  - a per-seat clone must clone the GitHub URL, not the shared clone.

  Its comment states that order of events. It marks note 26 as written after the rulings arrived,
  and note 25's correction as written after the appendix. Two appendix items were confirmed only
  in part:
  - **A8.** A deleted stamp does free a seat, but at this head the leftover branch still stops the
    next `prep`.
  - **A10.** The 300-file cap is confirmed live. The overhaul's size cannot be read yet.

  A11 found a second writer: the Claude CLI creates four empty directories in a seat's clone when
  it starts. Since the brief to the reviewer, the Planner has a lesson: Beni starts review seats
  from the desktop app in a Kickoff checkout, and Claude's transcripts record effort. Briefs now
  say so.
- **Kickoff's own tags were checked.** v0.5.0 to v0.5.5 each name the commit carrying their own
  version, tagged within eight minutes of it, so Beni has always pulled before tagging. The
  skill's step 8 is wrong on paper only, which is why its fix waits for a small docs PR before
  v0.6.0 rather than an emergency.
- **The stray seat branch is gone.** T1 had left `elenchus-pr-3-pass-1` (at `0faf606`, held by no
  worktree) in `~/.elenchus/seats/BeniCheni__elenchus.git`. The Planner deleted it on Beni's yes
  the same night. The clone now holds no seat branch, no `branch.*` config, no worktree and no
  tag.
- **The fix round, and the Planner's re-read of it (Tue 17 Nov 2026).** Cursor ran it in the
  Cursor app on Grok 4.7 High, Super. `agent about` showed the CLI's own stored default, still Grok 4.7 Low,
  which an app session does not change. It moved `sprint-2` to `fd4c88a`, nine commits on
  `c4497cb` with no force-push, and `replay/main` to `e0a2aa6`, one commit whose tree differs
  from Kickoff's `34d078b` only in `.elenchus.json`. The Planner's re-read was read-only, in a
  fresh clone:
  - **Each commit stands alone.** Each of the nine typechecks and passes on its own, from 99
    tests to 108; the lockfile and the dependencies are unchanged, and CI's `test` is green at
    `fd4c88a`.
  - **Live receipts.** The tarball installed alone prints `status` and `check` on #1
    byte-identical to the re-captured fixtures. `handoff 1` prints the chained block with
    `--repo` and `--match-head-commit dcb914e`, `handoff 3` refuses, and the tag list is still
    empty.
  - **The code matches the rulings.** The git wrapper is now an allowlist of `prep`'s exact calls,
    with no `config` and no `worktree`, and `-C` only for the cache or the seat being made. Each
    seat is its own clone, on the head branch's name; a seat is open while its directory exists
    and its pass has no record; `prep`'s git runs with hooks off, set through the environment;
    a fork is refused; Pass 0 takes the head; and a Codex seat is reported as having no profile
    known to load.
  - **Deletions.** Ten new rules deleted one at a time each fail a test.
  - **T4's denials.** Claude's writing transcript shows the four direct forms denied, one
    `permission_denials` entry each, and the two evasions ran.

  Four things did not go as briefed. None blocks the merge:
  - **Two commits carry Beni's identity, not Cursor's.** `8046835` and `cfaf8e4` were authored
    and committed under Beni's global git identity, because the app session fell back to it.
    The squash merge folds them, and Sprint 1's squash on `main` already carries that identity,
    so nothing new is exposed. Later briefs for a Cursor app session set the commit identity
    explicitly.
  - **One receipt is wrong.** #4's body gives the read-only Claude probe as "seat files changed
    (5), from the tool calls". Its transcript shows two tool calls: `command -v gh`, and a
    `Write` of a plan file under `~/.claude/plans` that the profile refused. The five paths
    (`.claude`, `.claude/.cc-writes`, `.git`, `.git/objects/info`, `.git/worktrees`) are the
    Claude CLI's own start-up writes and the parent directories they touched. The harness's
    list of CLI paths misses them, and it counts a directory whose timestamp moved as a write.
    The merge message carries the correction; the harness fix goes to Sprint 6, where T4 is
    acceptance again.
  - **The vendor CLIs wrote their own state.** Beyond the Claude transcripts the brief allowed,
    the Claude CLI wrote a config backup and plugin files under `~/.claude`, and the Codex CLI
    updated its state, logs and plugin stamps under `~/.codex`. The harness listed each. The
    brief's limit was the Planner's mistake: no vendor CLI runs without its own housekeeping.
    Sprint 6 either allows those writes, listed, or points `CLAUDE_CONFIG_DIR` and `CODEX_HOME`
    at the scratch root if login survives it.
  - **The release block names `main` and tags its tip.** It fetches `main` by name, which is
    Kickoff's base but not the replay's (`replay/main`), and so not configuration (D5). It tags
    `origin/main`'s tip after the fetch rather than the pull request's own merge commit, so a
    sync PR that merges in those seconds would be tagged instead. Sprint 4, where the block
    first serves a Kickoff release, takes the base from the pull request and the tag's commit
    from `gh pr view --json mergeCommit`.

  The stamp is written after the clone's checkout and head check, not straight after the clone.
  That is immaterial now that a seat directory, not its stamp, decides whether the seat is open.
- **Merged (Beni, Tue 17 Nov 2026, 14:53Z).** Beni squash-merged #4 with the Planner's message,
  guarded by `--match-head-commit fd4c88a`. `main` is `71c8d1c`, one parent `84764ff`, and its
  tree is `fd4c88a`'s exactly. The message carries the correction to the T4 receipt and Cursor's
  Co-authored-by line, and no Kickoff link. CI's `test` on `main` is green (run
  `134125548701`). The tag list is empty; `sprint-2`, `replay/main` and `replay/pr320-p1` are
  unmoved; #1 and #3 stay open and locked as fixtures. The README PR, elenchus #5, was then
  retargeted from `sprint-2` to `main` with `main` merged in. It changes `README.md` and
  `package.json` only. Beni merged it the same day as `7affd47`.
