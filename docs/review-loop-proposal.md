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

**Sprint 2 — preparing a seat (non-production).**
- *Scope:* `loop prep` makes a fresh worktree at the expected SHA with its own `npm ci`, never a
  shared or symlinked install. It refuses when the branch has moved, the route is unconfirmed,
  or another seat's worktree is open on the branch. It writes the seat's deny profile (A2) and
  the coverage manifest (T11). `loop handoff` prints the SEMVER block and never tags.
- *Acceptance:* T1 (`prep`), T4 for all three vendors (Cursor's ask mode is expected to fail,
  per S7), T8, T11.
- *Review:* fast-track, for the same reason as Sprint 1.
- *Rollback:* archive.

**Sprint 3 — the gate, on the scratch repo (non-production, after D1, D2, D3 and D9).**
- *Scope:* `loop authorize`; the scratch repo's rulesets mirroring Kickoff's two, plus a third
  for `kickoff/360` alone; the credentials D1 and D9 choose; the sync path D2 chooses.
- *Acceptance:* T5, T6, T7 (with forgery), T10.
- *Review:* **all six passes.** This is the gate code Sprint 5 ports. Reviewing it at full depth
  where it is written means the port is a copy of reviewed code.
- *Rollback:* archive.

**Sprint 4 — Kickoff phase 1: records (after v0.6.0).**
- *Scope:* the seat-record block in `pr-comment.md` and `SKILL.md` (with drift items 3 and 4
  fixed in the same PR); `loop status` and `loop check` ported to their home (D5);
  `tests/loop/` joins the root `node` project.
- *Acceptance:* T1, T3, T9 and T13 against a real Kickoff PR's records, read-only.
- *Review:* all six passes. It changes the method every later review reads.
- *Rollback:* revert the merge; seats stop posting the block.
- *Number:* D8.

**Sprint 5 — Kickoff phase 2: the gate on `main` (after Sprint 3 passes).**
- *Scope:* the `kickoff/360` ruleset on `main`, applied by Beni; `loop authorize`; the sync
  change if D2 is Workflow, which touches `sync.yml`'s gates and therefore escalates under the
  Pass 2.5 gate by rule.
- *Acceptance:* T6 and T7 on a docs-only canary PR, and T10 observed on the next two scheduled
  syncs.
- *Review:* all six passes.
- *Rollback:* disable the ruleset (a settings act, Beni's).

**Sprint 6 onward — headless dispatch, one vendor per sprint.**
- Claude Code first: it has the best observability (S2), and S1 proves it can start the skill.
  Codex second. Cursor third, per D4, for writing seats only.
- *Scope:* `loop run` launches the confirmed flags, reads `observed` back before the seat
  pushes, and stops on a mismatch. The manual path stays.
- *Acceptance:* T2 and T4 for that vendor.
- *Review:* all six passes for Sprint 6, because the first runner can start a pass that pushes;
  fast-track for the later vendors, which reuse its shape behind Sprint 5's gate.
- *Rollback:* run that vendor by hand again.

**Optional, after Sprint 4 (the addendum's experiment).** On the first real PR at least #320's
size (57 files or 1,500 changed lines in its own diff, the one size this record measured), Pass 1
runs as two fresh sub-agents, Spec and Standards, each covering the manifest. Findings and quota
are compared with a normal Pass 1 before anything is adopted.

**Deferred:** any GUI viewer (Paradev included), any Gemini or Antigravity seat.

## The seat roster (D7)

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

None yet.
