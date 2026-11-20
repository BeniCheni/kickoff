*Archived Sun 15 Nov 2026 (TZ=America/New_York) by the Planner seat for the review-loop track,
as Attachment B of `review-loop-planner-brief.md`. Written by the Claude Code Planner in Cowork on
15 Nov 2026 and returned to ChatGPT for its second assessment (`review-loop-consensus-codex.md`).
Verbatim below the rule, byte for byte from the exported Markdown, including the export's
placeholder for the embedded diagram. Its claims were re-checked in this repository on 15 Nov
2026; where they disagree, `review-loop-proposal.md` says so, and the proposal wins.*

---

# Architecture Rebuttal and Consensus Brief — AI PR Review Loop Orchestrator

Nov 15, 2026 · @Benjamin Chen

- **To:** ChatGPT GPT-6 (Architecture Research / Spike)
- **From:** Claude Code Planner
- **Re:** Architecture Spike Review: AI PR Review Loop Orchestrator (15 Nov 2026)
- **Status:** Independent rebuttal, returned for the second cross-agent assessment

Scope: review only. Nothing was installed, configured or merged. Evidence comes from reading each candidate's public repository at its default-branch HEAD on 15 Nov 2026, the vendors' own documentation, and the Kickoff repository's existing review skill. Claims I could not confirm from a primary source are marked **UNVERIFIED**.

## 1. Executive Verdict: PARTIALLY AGREE

I agree with the primary finding: the gap is a control plane, not another coding agent. I disagree with the preferred architecture. Orchestrator.inc + MCO puts two dispatchers in front of a strictly sequential, one-seat-at-a-time loop, and MCO exposes no reasoning-effort control, which is a CRITICAL requirement.

My recommendation is Proposal C with one addition: GitHub enforces the merge gate. A small repo-native controller keeps no state of its own. It reads and writes seat records in the PR, and the operator posts a required commit status that GitHub ties to the head SHA. That adds no daemon, account or subscription, and a GUI stays optional and comes last.

Two corrections change the requirements themselves. The live protocol is six passes plus an executor, and Pass 3 is Beni, the human operator, not an agent. Pass 1 and Pass 2 also push fix commits by design, so making review seats read-only would change the protocol rather than preserve it.

## 2. Validated Findings

The tool research mostly holds up: all seven candidates exist, the five open-source repositories all had commits in November 2026, and most claims check out. The larger errors are in how the spike describes our own protocol, so that comes first.

### Corrections to the protocol description

Read from [`/kickoff-pr-review`](https://github.com/BeniCheni/kickoff/blob/980b1e62957b876700bfd3112951c5760ac44c40/.claude/skills/kickoff-pr-review/SKILL.md) and the PR #320 archive (the clearing, v0.5.5, run 14 Nov 2026).

- **Six passes, not five seats.** Pass 0 (the planner briefs the cold review), 1 (cold review), 1.5 (rebuttal brief), 2 (rebuttal), 2.5 (synthesis) and 3 (adjudication). Pass 0 is missing from the spike.
- **Pass 3 is Beni, the operator, not an agent.** An executor seat acts on his rulings afterwards. On PR #320, Cursor merged v0.5.4 in and prepared the release after Beni ruled R1 to R7 ([docs index](https://github.com/BeniCheni/kickoff/blob/980b1e62957b876700bfd3112951c5760ac44c40/docs/README.md)).
- **Review seats write.** Pass 1 leaves "fix commits for what it reproduced". On PR #320 it pushed six commits and moved the head from `0faf606` to `89b8067` ([Pass 1.5 brief](https://github.com/BeniCheni/kickoff/blob/980b1e62957b876700bfd3112951c5760ac44c40/docs/design-overhaul-clearing-rebuttal-prompt.md)).
- **The head SHA moves at every writing pass by design.** SHA binding has to be a chain of each seat's input and output SHA, not a freeze.
- **Pass 2.5 is a re-run, not a read.** Every number in its brief must come from a command run in that session. A tool that summarises earlier comments cannot fill this seat.
- **Routing is live, human and availability-bound.** PR #320's Pass 2 route changed six times in about 90 minutes, and Cursor refused one of the models chosen. A Codex brief for PR #153 "could not start inside one Plus window".
- **The planner's output is a prompt, not a routing token.** The PR #320 Pass 1.5 brief differed from its Codex variant in eight ways once Cursor took the seat.
- **The review skill cannot be invoked by a model.** It is `disable-model-invocation: true`, so a human types it. Whether a headless `claude -p` call can start it is **UNVERIFIED**.

### Candidate tools

| Candidate | Confirmed from primary sources | Corrections and UNVERIFIED items |
| --- | --- | --- |
| [Orchestrator.inc](https://github.com/OrchestratorInc/agent-orchestrator/blob/e4ded08c6f150a632909e84bcc65d8cf772b4c2f/README.md) | Apache-2.0 local desktop app. Claude Code, Codex and Cursor each run as worker, chat and reviewer ([agent matrix](https://docs.orchestrator.inc/plugins/agents)). The reviewer launcher carries model and effort per review ([launcher.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/e4ded08c6f150a632909e84bcc65d8cf772b4c2f/backend/internal/review/launcher.go)). Review state is tracked against "the PR's current head" ([planner.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/e4ded08c6f150a632909e84bcc65d8cf772b4c2f/backend/internal/review/planner.go)). The Codex reviewer runs with `--sandbox read-only` ([codex.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/e4ded08c6f150a632909e84bcc65d8cf772b4c2f/backend/internal/adapters/reviewer/codex/codex.go)). | No user-defined multi-pass workflow in the code or docs. Failed checks and review comments "go back to the worker that owns the branch", which would skip Pass 1.5. Its docs say experimental reviewer modes "do not sandbox tools or network access". Telemetry includes your GitHub username unless turned off. |
| [Paradev](https://github.com/ParadevAI/Paradev/blob/fc5bd1d1c32445ff8f99ed1ae0ab0d9a0da484ce/README.md) | MIT desktop app, "free forever"; macOS first, Linux experimental, no Windows. One worktree per task, a PR pane with checks and merge, a model and reasoning-effort picker, and a scriptable `superset` CLI. Runs Claude Code, Codex and Cursor Agent. | Confirmed: automations need the Pro plan. It enforces no protocol, and its own docs say worktrees "do not sandbox processes". |
| [MCO](https://github.com/mco-org/mco/blob/7ce642193a127f3fac9c68fb10c5d0198d4e837e/README.md) | MIT CLI with 12 providers, including Claude Code, Codex and Cursor. Maps `read_only`, `write` and `yolo` onto native flags ([providers](https://github.com/mco-org/mco/blob/7ce642193a127f3fac9c68fb10c5d0198d4e837e/docs/reference/providers.md)). Offers `--chain`, `--debate` and `--synthesize`, plus per-run model pinning. | No reasoning-effort option in its CLI or provider reference. Output is opaque by design: no findings, severity, consensus or decision. Does not manage worktrees. Its [7 Nov 2026 live audit](https://github.com/mco-org/mco/blob/7ce642193a127f3fac9c68fb10c5d0198d4e837e/docs/reference/agent-compatibility-2026-11-07.md) covered Codex but not Claude Code or Cursor. Debate and synthesis are read-only stages. |
| [Frink](https://github.com/benord-labs/frink/blob/707eef3b9082ce4644229f41fb5a2004e1a4c462/README.md) | MIT desktop app. Flows mix agent, command, approval and custom JavaScript steps, and use your Claude Code and Codex sign-ins. | Sharper than the spike: Cursor is in preview, and "Flows… don't work with it yet". Frink also ignores the project's `AGENTS.md` and `.cursor/rules` for Cursor, and bundles its own `claude` binary ([AI accounts](https://github.com/benord-labs/frink/blob/707eef3b9082ce4644229f41fb5a2004e1a4c462/user-docs/ai-accounts.md)). |
| [Shep](https://github.com/shep-ai/shep/blob/56301d59a0d5faa4cb98ab487ea8726353237ab9/README.md) | MIT feature-to-PR orchestrator for claude, codex and cursor-agent. Approval gates; `--allow-merge` off by default; `--model`. | Confirmed: built for implementation, not adversarial review. It defers to "your existing review process". No effort control found. |
| [Conductor](https://www.conductor.build/) | Runs "the first-party Claude Code, Codex, Cursor, and OpenCode agents" on macOS, iOS and an API, with cloud microVMs. The site says "Conductor is joining Meta". | Correction: the Cursor integration concern looks stale. The ownership concern stands. Pricing is not on the homepage (**UNVERIFIED**). |
| [Google Antigravity](https://antigravity.google/) | Google's own agent platform: app, CLI, IDE and SDK, Gemini 4 models, "Available at no charge". | Confirmed: no statement that it runs other vendors' agent runtimes. Orchestrator.inc and MCO already list its CLI (`agy`), so a Gemini seat needs no new platform. |

### The three agent CLIs

Every candidate wraps these CLIs, so no orchestrator can route more precisely than they allow. Cursor is the gap: its parameters page has no effort flag and no output schema.

| Runtime | Headless | Model | Effort | Read-only | Structured output |
| --- | --- | --- | --- | --- | --- |
| [Claude Code](https://code.claude.com/docs/en/cli-reference) | `claude -p` | `--model` | `--effort` (`low` to `max`, model-dependent) | `--permission-mode plan`, `--disallowedTools` | `--json-schema` |
| [Codex](https://learn.chatgpt.com/docs/developer-commands?surface=cli) | `codex exec` | `--model` | `model_reasoning_effort` via `-c`; levels "vary by model and client" ([config sample](https://learn.chatgpt.com/docs/config-file/config-sample.md)) | `--sandbox read-only` (the config default) | `--output-schema`, `-o` |
| [Cursor](https://cursor.com/docs/cli/reference/parameters) | `agent -p` | `--model` | No flag. Effort inside the model string is **UNVERIFIED** | `--mode ask`; plain `-p` can write and run shell | `--output-format json`, no schema |

## 3. Point-by-Point Rebuttal

The spike's eight challenge questions, answered in order, then a verdict on each proposal.

1. **Does Orchestrator.inc + MCO add more complexity than it removes?** Yes. Both dispatch agents and keep their own records (Orchestrator's SQLite store, MCO's run artifacts), so the custom controller would reconcile two state stores against GitHub. The protocol runs one seat at a time, which leaves MCO's parallel fan-out with nothing to do.
2. **Can Orchestrator.inc alone implement the protocol?** No. It has reviewer sessions and head-bound review state, but no user-defined pass sequence and no arbitration between passes. Its core loop sends review comments and CI failures straight back to the builder, which skips Pass 1.5; whether that can be switched off is **UNVERIFIED**.
3. **Would Paradev plus a simple controller be a better day-to-day workspace?** For watching worktrees, terminals and diffs, yes, and the desktop app is free. It enforces nothing, so it is a viewer. Adopt it or not after the controller works, with no coupling either way.
4. **Is a repo-native state machine more appropriate?** Yes. The protocol already lives in the repo (`/kickoff-pr-review`, `CLAUDE.md`, the `docs/` archive), where all three agents read it. GitHub is already the system of record: comments, commits, checks and squash bodies. A controller that reads and writes those adds structure without adding a store.
5. **Does MCO improve review quality?** No evidence that it does. Each seat is one agent in one fresh session, which `claude -p`, `codex exec` and `agent -p` already give us. MCO's debate is a read-only pass over raw answers; our rebuttal reproduces or disproves each finding in code and pushes fixes.
6. **Are we overengineering?** Partly. The cycle already works by hand, and its recorded failures are bookkeeping: routing churn, worktree paths, a branch moved under a seat, a model or usage window that was not available. Fix those with records and a gate first, then automate dispatch one vendor at a time once proven.
7. **Which implementation preserves independence and exact routing?** Whichever passes the flags, records what actually ran, and stops when it cannot honour a request. Independence comes from a fresh session and worktree per seat, fed only the brief and the repo at a known SHA. A controller we write can refuse to run Cursor at an effort its CLI cannot express; a GUI's fallback behaviour would have to be tested.
8. **Hidden costs, operational risks and security boundaries:**
   - **Usage windows.** Headless runs spend the same plan quotas, and a Codex run has already failed to start inside one Plus window.
   - **Credentials.** Every GUI launches CLIs under your sign-ins. Frink bundles its own `claude`, Orchestrator sends your GitHub username in telemetry by default, and Conductor's cloud runs your code in its microVMs.
   - **Read-only leaks.** A "read-only" run in the D8 design check wrote a Vitest cache through a `node_modules` symlink ([D8 check](https://github.com/BeniCheni/kickoff/blob/980b1e62957b876700bfd3112951c5760ac44c40/docs/design-cycle-moments-d8-check.md)).
   - **Product churn.** Conductor is joining Meta, Paradev was renamed from Superset, and MCO's README sends workbench users to a separate product.
   - **Two dispatchers.** Proposal A gives a seat two places to start from. That is the shape of an earlier failure here: one agent editing another agent's live branch unannounced.

**Proposal A (Orchestrator.inc + MCO): DISAGREE** as the preferred option. Drop MCO. Orchestrator.inc remains a candidate viewer under strict conditions (section 6).

**Proposal B (Paradev + MCO): PARTIALLY AGREE.** Drop MCO. Paradev is acceptable later as a viewer.

**Proposal C (minimal custom orchestrator): AGREE,** with the GitHub-enforced gate in section 5. This is my recommendation.

## 4. Comparative Decision Matrix

C+ (Proposal C with a GitHub-enforced gate) is the only option that rates High on reliability and security without adding a process to run. Ratings are my judgement from the evidence in section 2.

| Option | Protocol fidelity | Reliability | Parts to run | Added cost | Maintenance | Security | Day-to-day UX |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **C+ (recommended):** repo-native controller, GitHub gate | High: seats unchanged, order enforced by records | High: GitHub blocks merge on the head SHA | One script, one ruleset | $0 | Low: lives in the repo, reviewed by the same 360 | High: no new process holds credentials | Medium: `loop status` and the PR page |
| **C as written:** scripts and JSON files | High | Medium: a script gate can be skipped | Scripts, state files | $0 | Low | High | Low to medium |
| **D:** Orchestrator.inc alone + controller | Medium: auto-feedback to the builder must be off | Medium: AO approval and seat records can disagree | Desktop app, daemon, controller | $0 licence | Medium: an upstream release train | Medium: telemetry; reviewer sandboxing varies by agent | High |
| **B:** Paradev + MCO + controller | Medium | Medium | Desktop app, MCO, controller | $0; automations need Pro | Medium to high | Medium: worktrees do not sandbox; MCO paths are not an OS sandbox | High |
| **A:** Orchestrator.inc + MCO + controller | Medium | Low: three state stores to reconcile | Desktop app, daemon, MCO, controller | $0 licence | High: two upstream release trains | Medium | High |

Every option spends the same Claude, ChatGPT and Cursor plan quotas; none adds model access.

## 5. Recommended Architecture: C+, a repo-native controller with a GitHub gate

Keep every seat, prompt and decision as they are, and add three things: a seat record in each PR comment, a small `loop` script that reads those records, and a GitHub ruleset that will not merge without a status tied to the head SHA.

&#91;embedded content: C+ architecture · three seats as today, two new parts\]

Beni and the PM seat keep every decision. The controller only reads the PR and, when Beni runs `loop authorize`, posts the status the ruleset requires.

### The parts

1. **Seat records.** Every seat ends its PR comment with one fenced JSON block (schema below). Claude Code and Codex can be held to the schema with `--json-schema` and `--output-schema`. Cursor has no schema flag, so the controller validates its block and rejects a malformed one.
2. **`loop`, a stateless controller** in `scripts/`, written in TypeScript like the repo. It rebuilds state from the PR's comments and commits on every call, so there is no local state to corrupt or recover.
   - `loop status <PR>`: the current pass, the next seat, and what blocks it.
   - `loop prep <PR> <pass>`: a fresh worktree at the expected SHA with its own install. It refuses if the branch moved or the route is unconfirmed.
   - `loop check <PR>`: the SHA chain is unbroken, every finding ID is carried forward or closed, and commit authors match the seat's vendor.
   - `loop authorize <PR>`: run by Beni only. It posts `kickoff/360` as success on the current head if Pass 2.5 passed there, his rulings are recorded, and `verify` is green.
   - `loop handoff <PR>`: prints the SEMVER handoff block for the PM seat. It never tags.
3. **A ruleset on `main`** requiring `verify` and `kickoff/360`. A commit status is created "for a given SHA" ([GitHub](https://docs.github.com/en/rest/commits/statuses)), so any push after authorization arrives without it and the merge stays blocked. Rulesets work on public repositories on GitHub Free, and a bypass list can exempt the self-merging sync PR ([rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)).
4. **Seat runners stay the CLIs we use today.** In phase 3, `loop run` launches them headless with the confirmed flags. Cursor stays manual until its effort control is proven.
5. **The PM seat is unchanged.** Claude Code with the two skills still writes Passes 0, 1.5 and 2.5. The controller only stamps each brief with its route and input SHA.

### Seat record, schema v1

Illustrative values from PR #320's Pass 2 route. `observed` comes from the CLI's own output or session log; where the CLI reports nothing, the record says so rather than copying the request.

```json
{
  "seat_record": 1,
  "pr": 320,
  "pass": "2",
  "runtime": "cursor agent -p",
  "model":  { "requested": "grok-4.7", "observed": "grok-4.7" },
  "effort": { "requested": "extra-high", "observed": "not reported by CLI" },
  "route": { "recommended_by": "PM seat", "confirmed_by": "Beni" },
  "input_sha": "89b8067",
  "output_sha": "<sha after this seat's pushes>",
  "commits": ["<sha>", "<sha>"],
  "findings": [
    { "id": "F5", "severity": "medium", "status": "contested", "evidence": "<command and result>" }
  ],
  "verdict": "mergeable after fixes"
}
```

### Commits after Pass 2.5

The executor's release commits land after Pass 2.5 by design. `loop check` classifies the change from the reviewed SHA. If it touches only the release places (`package.json`, `package-lock.json`, `CHANGELOG.md`, `README.md`), Beni can authorize the new head once `verify` passes. Anything else needs a recorded Pass 2.5 check of that change first.

### Why this beats Proposal A

- The same enforcement, with no daemon, account, telemetry or second state store.
- GitHub enforces merge safety, as it already does for `verify`, instead of a third-party app reimplementing it.
- The protocol's write rules, briefs and human gates stay exactly as they are.
- Each phase can be reversed on its own.

### Migration and rollback

1. **Phase 1, records only:** seat-record blocks, `loop status` and `loop check`. Rollback: stop using them; nothing else changed.
2. **Phase 2, the gate:** the ruleset and `loop authorize`. Rollback: disable the ruleset.
3. **Phase 3, headless dispatch, one vendor at a time** after its POC tests pass. Rollback: run that vendor by hand again.
4. **Phase 4, optional:** a GUI viewer under section 6's conditions. Rollback: uninstall it.

## 6. Middle-Ground Proposal

If ChatGPT holds that a single GUI workspace is required, the compromise is Orchestrator.inc alone as a viewer and launcher, with the C+ controller and GitHub gate staying authoritative. MCO is out in every variant.

Orchestrator.inc is the stronger viewer candidate because it already treats Claude Code, Codex and Cursor as reviewers, tracks review state against the PR head, and records model and effort per review. Paradev is the lighter choice if visibility is all we want.

The compromise holds only if the POC proves all five conditions:

1. Its routing of review comments and CI failures back to the builder is off for 360 PRs, so Pass 1.5 cannot be skipped.
2. Its own approval never becomes a GitHub approval or a merge. `kickoff/360` stays the only gate.
3. Each seat it launches runs at the requested model and effort, as the seat record's `observed` fields show.
4. Telemetry is off, and cloud agents are not used for this repository.
5. Removing it changes nothing in the controller, the records or the ruleset.

I concede that a GUI earns its place once two or more PRs are in flight. I do not concede a GUI as the source of truth: the PR and its required checks stay that.

## 7. POC Plan

Replay PR #320's mechanics in a throwaway public repository, time-boxed to two working sessions, with no new spend and nothing touching the production repository.

PR #320 is merged (v0.5.5 is on `main`), and its cycle had everything the POC must exercise. It had three vendors, a branch moved by review commits, contested findings, an escalation, seven rulings, executor commits after review, and a release.

### Setup

1. Create a public scratch repository. The code is already public, and rulesets on GitHub Free need a public repository. No Pages, no secrets, no sync workflow.
2. Push `main` as of PR #320's merge-commit first parent, and the PR branch at Codex's build tip `0faf606`. Open the PR there.
3. Build `loop` and the schema-v1 validator. This is the only code the POC writes.
4. Seats run short mechanics prompts at low effort: read a named file, attempt the scripted action, post a seat record. One optional seat runs at full effort to measure time and quota.

### Tests and acceptance criteria

| # | Proves | Method | Passes if |
| --- | --- | --- | --- |
| T1 | Sequence | Run `loop prep <PR> 2` before any Pass 1.5 record exists | It refuses and names the missing record; `loop status` names the right next seat |
| T2 | Routing | Launch one seat each on Claude Code, Codex and Cursor with a confirmed model and effort | The requested model is observed for all three. Effort is observed for Claude Code and Codex. Cursor's effort is recorded as not expressible, and the controller stops rather than dropping it |
| T3 | Evidence handoff | Carry findings through Passes 1 to 2.5, then delete one ID from the Pass 2 record | `loop check` fails on the missing ID and passes once it is restored |
| T4 | Read-only isolation | Each vendor in its read-only mode is told to write a canary file inside and outside the worktree | No tracked or untracked change, and no modified file under any install directory |
| T5 | Conflicting findings | Pass 2 contests a Pass 1 finding | Pass 2.5 escalates, and `loop authorize` refuses until a ruling is recorded |
| T6 | Changed head SHA | Push one commit after authorization | The new head lacks `kickoff/360` and GitHub blocks the merge. `loop check` classifies a release-files push and a code push correctly |
| T7 | CI failure | Break a test, then post `kickoff/360` by hand on the red head | GitHub still blocks on `verify`, and `loop authorize` refuses a red head |
| T8 | SEMVER handoff | Push a release-shaped head (version bump, new CHANGELOG section) | `loop handoff` prints the block, and no tag exists afterwards |
| T9 | Recovery | Kill a seat mid-run, delete every local file, run `loop status` | State rebuilt from GitHub alone matches the state before; the operator re-routes and resumes |
| T10 | Sync exemption | Open a `sync/scheduled`-shaped PR | It merges on `verify` alone through the bypass list |

### Stop and go

- **Go to phase 1** in the real repository if T1, T3 and T9 pass.
- **Go to phase 2** if T5, T6, T7 and T10 also pass.
- **Go to phase 3 for a vendor** only if T2 and T4 pass for that vendor.
- **Stop and stay manual** if any read-only probe writes anywhere, if the controller ever needs to push to a PR branch, or if T9 cannot rebuild state from GitHub alone.

### Out of bounds

No merge, tag, release or Pages deploy on `BeniCheni/kickoff`. No new subscriptions or paid plans. The scratch repository is archived when the POC ends.

## 8. Open Questions and Risks

The first two decide how far automation can go; the rest are settled in the POC or by a quick check.

| Question or risk | Why it matters | How to settle it |
| --- | --- | --- |
| Can headless `claude -p` start `/kickoff-pr-review`, which is `disable-model-invocation: true`? | If not, Passes 1 and 2.5 cannot run headless as written | Try it in the POC. If it fails, those seats stay manual or the runner carries the method in the prompt |
| Can Cursor take a reasoning effort headless? | Without it, exact effort routing is impossible for Cursor under any architecture | Test the model-string form in T2 and ask Cursor. Until then, Cursor seats stay manual |
| Does Cursor's headless key bill like the signed-in plan? | `--api-key` or `CURSOR_API_KEY` may draw on a different allowance | Read Cursor's authentication docs before phase 3 |
| A usage window ends mid-seat | A half-pushed branch and no seat record | Seats push as they go; T9 covers resume |
| Can Orchestrator.inc's routing back to the builder be switched off? | Decides whether the middle ground is viable | Its docs, or a POC run |
| What protects `main` today? | GitHub API access was not available in this session, so I could not read it | Beni checks repository settings before phase 2 |
| Cursor seat records without a schema flag | A malformed block stalls `loop` | The validator rejects it and the seat re-posts |
| Read-only by mode is not read-only on disk | The D8 run wrote through a symlinked install | `loop prep` gives each seat its own install; T4 checks install directories |
| Two seats writing one branch | Repeats the live-branch failure recorded in the repo | `loop prep` refuses while another seat's worktree is open on that branch |
| Operator effort | Structure that adds steps defeats the purpose | Count Beni's actions per cycle before and after phase 1; roll back if the count rises |

## 9. Consensus Position

I ask ChatGPT to accept six points, reject four and revise five, and to answer three questions in its second assessment.

### Accept

1. The primary finding: we need a control plane, not another coding agent.
2. Antigravity is an optional reviewer reached through its CLI, not an orchestrator.
3. Proposal C as the base architecture, extended with the GitHub gate in section 5.
4. Human authorization for every merge and release, and the distinction between internal AI approval and GitHub approval.
5. Machine-readable seat records, with findings carried by ID across passes.
6. A POC on a merged PR with no production actions: PR #320, judged against T1 to T10.

### Reject

1. Proposal A as the preferred architecture.
2. MCO in any proposal. It has no effort control, manages no worktrees, keeps output opaque, and is built for parallel fan-out the protocol never uses.
3. "Pass 3: the selected agent completes final validation and merge." Pass 3 is Beni; an executor acts on his rulings.
4. Read-only review and rebuttal seats by default. In this protocol, fixing what a seat reproduces is the default.

### Revise

1. Describe the protocol as six passes plus an executor, with Pass 0 restored.
2. Replace "prevent merges if the reviewed SHA changes" with a SHA chain per seat, a gate status tied to the head, and the release-files rule for commits after review.
3. Replace "the planner selects provider, model and effort" with: the planner recommends, Beni confirms, and the record shows what actually ran.
4. Move single-dashboard visibility to phase 4, behind section 6's five conditions.
5. Update Conductor's entry: its site lists Cursor among supported agents, and the new risk is the move to Meta.

### Questions for the second assessment

1. Is there evidence of any orchestrator that runs a user-defined sequential review with per-seat effort control for Cursor?
2. What breaks in the GitHub-status gate, especially the sync bot's bypass and an executor's commits after review?
3. What would you change in seat-record schema v1?

## Sources

All opened on 15 Nov 2026. Repository links are pinned to the commit read.

**Our protocol**

- [`/kickoff-pr-review` SKILL.md](https://github.com/BeniCheni/kickoff/blob/980b1e62957b876700bfd3112951c5760ac44c40/.claude/skills/kickoff-pr-review/SKILL.md)
- [PR #320 Pass 1.5 brief](https://github.com/BeniCheni/kickoff/blob/980b1e62957b876700bfd3112951c5760ac44c40/docs/design-overhaul-clearing-rebuttal-prompt.md)
- [`docs/` index (PR #153, #320 records)](https://github.com/BeniCheni/kickoff/blob/980b1e62957b876700bfd3112951c5760ac44c40/docs/README.md)
- [D8 design check (read-only deviation)](https://github.com/BeniCheni/kickoff/blob/980b1e62957b876700bfd3112951c5760ac44c40/docs/design-cycle-moments-d8-check.md)

**Candidates**

- Orchestrator.inc: [README](https://github.com/OrchestratorInc/agent-orchestrator/blob/e4ded08c6f150a632909e84bcc65d8cf772b4c2f/README.md), [review planner](https://github.com/OrchestratorInc/agent-orchestrator/blob/e4ded08c6f150a632909e84bcc65d8cf772b4c2f/backend/internal/review/planner.go), [review launcher](https://github.com/OrchestratorInc/agent-orchestrator/blob/e4ded08c6f150a632909e84bcc65d8cf772b4c2f/backend/internal/review/launcher.go), [Codex reviewer](https://github.com/OrchestratorInc/agent-orchestrator/blob/e4ded08c6f150a632909e84bcc65d8cf772b4c2f/backend/internal/adapters/reviewer/codex/codex.go), [agent matrix](https://docs.orchestrator.inc/plugins/agents)
- Paradev: [README](https://github.com/ParadevAI/Paradev/blob/fc5bd1d1c32445ff8f99ed1ae0ab0d9a0da484ce/README.md)
- MCO: [README](https://github.com/mco-org/mco/blob/7ce642193a127f3fac9c68fb10c5d0198d4e837e/README.md), [providers](https://github.com/mco-org/mco/blob/7ce642193a127f3fac9c68fb10c5d0198d4e837e/docs/reference/providers.md), [CLI](https://github.com/mco-org/mco/blob/7ce642193a127f3fac9c68fb10c5d0198d4e837e/docs/reference/cli.md), [7 Nov 2026 audit](https://github.com/mco-org/mco/blob/7ce642193a127f3fac9c68fb10c5d0198d4e837e/docs/reference/agent-compatibility-2026-11-07.md)
- Frink: [README](https://github.com/benord-labs/frink/blob/707eef3b9082ce4644229f41fb5a2004e1a4c462/README.md), [AI accounts](https://github.com/benord-labs/frink/blob/707eef3b9082ce4644229f41fb5a2004e1a4c462/user-docs/ai-accounts.md)
- Shep: [README](https://github.com/shep-ai/shep/blob/56301d59a0d5faa4cb98ab487ea8726353237ab9/README.md)
- [Conductor](https://www.conductor.build/)
- [Google Antigravity](https://antigravity.google/)

**Agent CLIs and GitHub**

- [Claude Code CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Codex CLI commands](https://learn.chatgpt.com/docs/developer-commands?surface=cli) and [config sample](https://learn.chatgpt.com/docs/config-file/config-sample.md)
- [Cursor CLI parameters](https://cursor.com/docs/cli/reference/parameters)
- GitHub: [about rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets), [available rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [commit statuses](https://docs.github.com/en/rest/commits/statuses)
