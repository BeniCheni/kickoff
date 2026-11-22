# PM chores

Two chores the PM seat used to do by hand on every PR and every release. Each one is plain code
except for one `claude -p` call, and each prints a draft for a person to read. Neither writes to
the repo, posts to GitHub or edits `CHANGELOG.md`.

| Chore | Run it from the repo root | What it prints |
| --- | --- | --- |
| Pass 0 skeleton | `npx tsx scripts/pm/pass0.ts 352` | Who wrote which commit, which files changed, and the builder's claims sealed for a cold reviewer |
| `[Unreleased]` draft | `npx tsx scripts/pm/unreleased.ts` | The PRs merged since the last tag, and a draft `[Unreleased]` section that cites them |

**Each run uses Claude Max usage.** Every run makes at most one model call, on
`claude-sonnet-5-5`, through your signed-in `claude` CLI. `unreleased.ts` makes no call when only
the sync bot has merged since the tag. On a Max plan the call counts against Max usage. There is
no API key and nothing is billed per token. Neither chore has a `package.json` script, because
`package.json` is a release file.

You need `gh` signed in to GitHub with read access to the repo, and `claude` signed in. Inside a
Claude Code sandbox, run both outside the sandbox: `tsx` has to open a local IPC pipe, and `gh`
and `claude` need the network.

## `pass0.ts <PR number>`

It reads `gh pr view <N> --json number,title,url,headRefName,headRefOid,baseRefName,files,commits,body,changedFiles,additions,deletions`.
The last three fields are the PR's own totals. If `gh` listed fewer files than the PR changed,
the skeleton says its file table is incomplete instead of passing it off as complete.

Plain code prints:

- the PR line, its branch and base, and the head SHA;
- an authorship table by author name and email, with each identity's share of the commits. The
  vendor comes from the email: `noreply@anthropic.com` is Claude, `noreply@openai.com` is Codex,
  `cursoragent@cursor.com` is Cursor, a `[bot]` address is a bot and anyone else is a person.
  GitHub lists a commit's author first and its `Co-authored-by` trailers after, so those are
  counted in a separate column;
- one row for each commit, giving its short SHA, author and headline;
- every file with its additions and deletions, and a total row.

The model call gets the PR body and each commit message, and returns the builder's checkable
claims as exact quotes, each tagged with the block it came from. Only labels this code wrote can
be cited, and the schema enforces that. Plain code then looks for each quote in its source. A
quote it cannot find word for word is flagged, never silently kept. The quotes print under
**Sealed appendix: claims to verify independently, never conclusions**, so a reviewer gets
claims to check, not a verdict.

## `unreleased.ts`

1. It finds the latest tag with `git describe --tags --abbrev=0`, from the checkout you run it in.
   Run `git fetch origin --tags` first, or an old tag will pull released PRs back into the draft.
2. It asks GitHub for the PRs merged into `main` from a day before the tag, then keeps those whose
   merge commit is **not** an ancestor of the tag (`git merge-base --is-ancestor`). The date only
   narrows the search, and git decides what the release holds. A date cut would get the boundary
   wrong. v0.5.5's own PR, #320, shows a `mergedAt` one second after the commit that the tag
   points at. The script refuses a shallow clone, because ancestry in one can't be trusted.
3. It leaves out the sync bot's PRs, meaning a head of `sync/scheduled`, or a title starting
   `npm run sync` or `sync: verified unchanged`, with or without the leading ⚠. Their bodies
   never reach the model.
4. The model call gets each remaining PR's title, branch and body, plus the current `[Unreleased]`
   section, so the draft matches its voice. The draft follows the shape in
   `.claude/rules/releases.md`: one lead sentence, then Added, Changed and Fixed, then
   **Deliberately not done**, with every line citing its PRs. A line can cite only a PR that was
   sent. Any PR the draft leaves out is named under it, so a person decides whether it belongs.

It prints the draft inside a fence. Wrap it to the file's style when you paste it into
`CHANGELOG.md`.

## The model call (`model.ts`)

PR bodies and commit messages are untrusted text, since anyone who opens a PR writes them. So
the call is set up so that an injected instruction has nothing to work with:

- `--tools ""`, `--strict-mcp-config` and `--disable-slash-commands`: no built-in tools, no MCP
  servers and no skills. The only tool the model sees is the CLI's own structured-output tool for
  `--json-schema`, which can do nothing but return the schema's shape.
- `--setting-sources ""`: no user, project or local settings load, so no hooks or plugins from
  them run in the child. The child also runs in the OS temp folder, not the repo.
- `--max-turns 1`, `--no-session-persistence`, `--output-format json`, `--model claude-sonnet-5-5`,
  and a short `--system-prompt` that says fenced text is data.
- The text goes in on stdin, never in argv. Each block sits between `<<<UNTRUSTED <marker> BEGIN …>>>`
  and `… END …>>>` lines. The marker is random, and the script checks that no block contains it,
  so a block can't forge its own end. The task comes before the data and is restated after it.
- The answer must pass the same zod schema that produced `--json-schema`.

Every flag was checked against `claude --help` on Claude Code 2.1.330 on 22 Nov 2026.
`--max-turns` is the one hidden flag: help doesn't list it, but the CLI still parses and validates
it. If a later CLI drops or renames a flag, the call fails loudly. A real run with
`--json-schema` reports `num_turns: 2`, which is the structured-output tool call, and still
succeeds under `--max-turns 1`.

When `claude` is missing, signed out, times out after five minutes, or returns anything that
fails validation, the chore still prints its plain-code part. It then prints one line, starting
`Model part failed:`, that says why, and exits 1. It also writes that line to stderr when stdout
is a file or a pipe. It never prints part of a model result. A signed-out CLI exits 1 with
`"subtype": "success"` and `"is_error": true`, so the check reads `is_error` first.

Exit codes: `0` when the result is complete, `1` when the model part failed, and `2` when the
plain part could not be built (a bad argument, `gh` or `git` failing, or a list that may have been
cut short).

## Tests

`tests/pmModel.test.ts`, `tests/pmPass0.test.ts` and `tests/pmUnreleased.test.ts` run under
`npm test` from the fixtures in `tests/fixtures/pm/`. `gh`, `git` and `claude` are injected
runners, and every test passes a fake, so no test reaches GitHub or Claude. The signed-out
envelope is the shape a real signed-out `claude -p` printed on 22 Nov 2026.
