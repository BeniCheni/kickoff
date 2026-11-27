# The review loop, Sprint 3: Codex's deletion forms from the ninth fix round of elenchus #8 (archived Sun 22 Nov 2026, TZ=America/New_York)

Archived by the Planner seat (Claude Code, Opus 5.5, `xhigh`) with the brief for the eighth Pass
2.5 re-read, [`review-loop-sprint-3-synthesis-9-prompt.md`](review-loop-sprint-3-synthesis-9-prompt.md).
The ninth round's record ([comment](https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7081284607))
describes these forms and lists the tests each fails. Seat folders have been emptied before,
mid-pass among them, so this file is the copy the re-read relies on.

**How to use it.** The section below holds one file between four-backtick fences. A file's text
is everything between its opening fence line and its closing fence line, ending in a newline. The
sha256 and byte count given are of that text. Each form is a list of exact replacements: each
`find` text occurs exactly once in its file at `75fada0`, and `a61d6e8`'s `src` is the same.

## Codex's case file, `deletions.json`

Copied by the Planner on Sun 22 Nov from the builder's folder,
`~/code/review-seats/elenchus-pr8-pass2-r9/receipts/deletions.json` (last modified 09:48:18 EST),
byte for byte. It holds four keys:
- `head`: the 102 forms the round ran at `75fada0`, in the order of its record's matrix;
- `base`: the 43 of them it also ran at `a61d6e8`: the eleven forms the eighth Pass 3 names
  (P1, P2b, P3, P6, P6b, P6c, P6d, P7, P13, P15 and PL-P6), the 25 forms for added cells, whose
  names start `Cell-`, the inherited cell's proof `Opener-note`, and the six deferred forms (P9,
  P10, P11 and PL-P9 to PL-P11);
- `reproduced`: the other 59, rebuilt from the eighth round's record;
- `cells`: the 25 added tests, each keyed by its form's name without `Cell-`.

The forms named P and PL-P are byte-identical to those in `forms.mjs` and `planner-p6d.json` in
[`review-loop-sprint-3-fix-9-forms.md`](review-loop-sprint-3-fix-9-forms.md).

`deletions.json`: 106224 bytes, sha256 `abdfb7367222a2872bc408c9a60739ff8883146a178705ff80f7a193385a5b49`.

````json
{
  "head": [
    {
      "name": "Z2",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, synthesis.record.findings.map(({ id }) => id).filter((id) => !opened.includes(id)));"
        }
      ]
    },
    {
      "name": "Y2",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (schema || !firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "Y2r",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!schema || !firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "Y3",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate?.required_checks.length ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "Y3b",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.length ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "Y3c",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate?.app_id !== undefined ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "Z1",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, synthesis.record.findings.map(({ id }) => id));"
        }
      ]
    },
    {
      "name": "R1",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!firstOpen || firstOpen !== pass\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "R1-no-gap",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && firstOpen && ( state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "R1-later-gap",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!firstOpen || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "R1-same-absent",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass))) {"
        }
      ]
    },
    {
      "name": "R1-same-rejected",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && [\"absent\", \"rejected\"].includes(firstOpen.outcome.kind)))) {"
        }
      ]
    },
    {
      "name": "R2",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = ruling?.schema[0];"
        }
      ]
    },
    {
      "name": "R2-allowed-changes",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate?.allowed_changes ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "X7",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, opened);"
        }
      ]
    },
    {
      "name": "M1",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    else earlier.push(posting);",
          "replace": "    else if (!posting.record.reread) earlier.push(posting);"
        }
      ]
    },
    {
      "name": "M4",
      "edits": [
        {
          "file": "src/config.ts",
          "find": "  if (unknownKeys.length) config.unknownKeys = unknownKeys;",
          "replace": "  if (unknownKeys.length) config.unknownKeys = unknownKeys;\n  if (unknownKeys.some((key) => !key.startsWith(\"config.gate.\"))) delete config.gate;"
        }
      ]
    },
    {
      "name": "M5",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, state.passes\n      .filter(({ id }) => id !== flow.opens && !flow.carries.includes(id) && id !== flow.ruling)\n      .flatMap(({ outcome }) => outcome.kind === \"recorded\" ? outcome.record.findings.map(({ id }) => id) : []));"
        }
      ]
    },
    {
      "name": "M5-pass0",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, state.passes.flatMap(({ id, outcome }) =>\n      id === \"0\" && outcome.kind === \"recorded\" ? outcome.record.findings.map(({ id }) => id) : []));"
        }
      ]
    },
    {
      "name": "M5-exec",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, state.passes.flatMap(({ id, outcome }) =>\n      id === \"exec\" && outcome.kind === \"recorded\" ? outcome.record.findings.map(({ id }) => id) : []));"
        }
      ]
    },
    {
      "name": "UK-pass",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.passes[0].unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-finding-flow",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.finding_flow.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-required-checks",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.gate.required_checks[0].unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-allowed-changes",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.gate.allowed_changes.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-version-only",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.gate.allowed_changes.version_only.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-vendor",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.vendors.claude.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-install",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.installs[0].unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-handoff",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.handoff.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "D320",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened: string[] = [];"
        }
      ]
    },
    {
      "name": "D344",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  checkCarriedFindings(items, synthesis.posting, beforeSynthesis, opened);",
          "replace": ""
        }
      ]
    },
    {
      "name": "D351",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": ""
        }
      ]
    },
    {
      "name": "Z3",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      posting.record.schema_version === \"1.2\" && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "Zc",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    else earlier.push(posting);",
          "replace": "    else if (posting.replaces === undefined) earlier.push(posting);"
        }
      ]
    },
    {
      "name": "Y3d",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && state.config.finding_flow?.carries.length ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "Y3e",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && state.config.finding_flow?.ruling ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "O1-synthesis-ruling-reread",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "const beforeSynthesis = [...earlierSyntheses, ...rulings.filter(({ record }) => !record.reread)].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "O2-ruling-blocking-only",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({ ...posting, record: { ...posting.record, findings: posting.record.findings.filter(({ severity }) => severity === \"blocking\") } })));"
        }
      ]
    },
    {
      "name": "O3-fixed-exempt",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    for (const { id } of posting.record.findings) {\n      if (have.has(id)) continue;",
          "replace": "    for (const { id, status } of posting.record.findings) {\n      if (have.has(id) || status === \"fixed\") continue;"
        }
      ]
    },
    {
      "name": "O5-status-unknown-keys",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (!firstOpen) {\n    return {\n      step: \"authorize\",",
          "replace": "  if (!firstOpen && state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n  if (!firstOpen) {\n    return {\n      step: \"authorize\","
        }
      ]
    },
    {
      "name": "O6-synthesis-ruling-legacy",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter(({ record }) => record.schema_version === \"1.2\")].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "O7-synthesis-ruling-corrected",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !rulings.some((later) => later.replaces === posting.id))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Opener-reread",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" && !opener.outcome.record.reread ? opener.outcome.record.findings.map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Opener-correction",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" && opener.outcome.posting.replaces === undefined ? opener.outcome.record.findings.map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Synthesis-replaced",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !synthesis.postings.some((later) => later.replaces === posting.id));"
        }
      ]
    },
    {
      "name": "Before-correction",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => posting.replaces === undefined)].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Before-returning",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "const standing = rulings.at(-1)?.record;\n  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !standing?.reread || !(sameSha(posting.record.input_sha, standing.input_sha) &&\n      sameSha(posting.record.output_sha, standing.output_sha)))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "After-replaced",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0 && !rulings.some((later) => later.replaces === posting.id),\n    );"
        }
      ]
    },
    {
      "name": "Opener-ontime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" && !(opener.outcome.record.schema_version === \"1.2\" && !opener.outcome.record.reread && opener.outcome.posting.replaces === undefined) ? opener.outcome.record.findings.map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Opener-legacy",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" && opener.outcome.record.schema_version === \"1.2\" ? opener.outcome.record.findings.map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Synthesis-ontime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id)));"
        }
      ]
    },
    {
      "name": "Before-ontime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id)))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "After-ontime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0 && !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id)),\n    );"
        }
      ]
    },
    {
      "name": "Synthesis-returning",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "const standing = synthesis.record;\n  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !standing.reread || !(sameSha(posting.record.input_sha, standing.input_sha) &&\n      sameSha(posting.record.output_sha, standing.output_sha)));"
        }
      ]
    },
    {
      "name": "After-returning",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "const standing = ruling.record;\n    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0 && (!standing.reread || !(sameSha(posting.record.input_sha, standing.input_sha) &&\n      sameSha(posting.record.output_sha, standing.output_sha))),\n    );"
        }
      ]
    },
    {
      "name": "M1-synthesis",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !posting.record.reread);"
        }
      ]
    },
    {
      "name": "M1-ruling",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      !posting.record.reread && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "Zc-synthesis",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => posting.replaces === undefined);"
        }
      ]
    },
    {
      "name": "Zc-ruling",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      posting.replaces === undefined && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "Z3-synthesis",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => posting.record.schema_version === \"1.2\" && postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "P1",
      "origin": "mine (ruling 2, synthesis side)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  checkCarriedFindings(items, synthesis.posting, beforeSynthesis, opened);",
          "replace": "  checkCarriedFindings(items, synthesis.posting, beforeSynthesis.map((posting) => ({ ...posting, record: { ...posting.record, findings: posting.record.findings.filter(({ status }) => status !== \"fixed\") } })), opened);"
        }
      ]
    },
    {
      "name": "P2b",
      "origin": "mine (ruling 2, synthesis's ruling input)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({ ...posting, record: { ...posting.record, findings: posting.record.findings.filter(({ severity }) => severity === \"blocking\") } }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "P3",
      "origin": "mine (ruling 2, opener)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.filter(({ status }) => status !== \"fixed\").map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "P6",
      "origin": "mine (ruling 3, no-record branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  return {\n    step: firstOpen.id,\n    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record",
          "replace": "  if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n  return {\n    step: firstOpen.id,\n    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record"
        }
      ]
    },
    {
      "name": "P6b",
      "origin": "mine (ruling 3, in-progress branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (firstOpen.id === state.inProgressPass) {",
          "replace": "  if (firstOpen.id === state.inProgressPass) {\n    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "P6c",
      "origin": "mine (ruling 3, rejected branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (firstOpen.outcome.kind === \"rejected\") {",
          "replace": "  if (firstOpen.outcome.kind === \"rejected\") {\n    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "P6d",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    if (firstOpen.outcome.failures > state.config.retry_cap) {",
          "replace": "    if (firstOpen.outcome.failures > state.config.retry_cap) {\n      if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "P7",
      "origin": "mine (ruling 3, ruling-routing branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const { id, seat, role } = pass;",
          "replace": "    if (!schema && state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n    const { id, seat, role } = pass;"
        }
      ]
    },
    {
      "name": "P13",
      "origin": "mine (synthesis's own rounds: a v1.1 round not at the returned-to range)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => posting.record.schema_version === \"1.2\" || posting.record.output_sha === synthesis.posting.record.output_sha);"
        }
      ]
    },
    {
      "name": "P15",
      "origin": "mine (ruling rounds after the synthesis: a v1.1 round not at the returned-to range)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      (posting.record.schema_version === \"1.2\" || posting.record.output_sha === ruling.posting.record.output_sha) && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "PL-P6",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const which = `record rejected",
          "replace": "    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n    const which = `record rejected"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerShouldFix",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"should-fix\" && status === \"open\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisShouldFix",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"should-fix\" && status === \"open\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarryBeforeShouldFix",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"should-fix\" && status === \"open\")),\n      },\n    }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterShouldFix",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"should-fix\" && status === \"open\")),\n      },\n    })));"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisNote",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"note\" && status === \"open\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarryBeforeNote",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"note\" && status === \"open\")),\n      },\n    }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterNote",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"note\" && status === \"open\")),\n      },\n    })));"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerFixed",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"blocking\" && status === \"fixed\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisFixed",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"fixed\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarryBeforeFixed",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"fixed\")),\n      },\n    }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterFixed",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"fixed\")),\n      },\n    })));"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerContested",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"blocking\" && status === \"contested\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisContested",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"contested\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarryBeforeContested",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"contested\")),\n      },\n    }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterContested",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"contested\")),\n      },\n    })));"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerOnTime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"blocking\" && status === \"open\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerLegacy",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version !== \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"blocking\" && status === \"open\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisCorrection",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces !== undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"open\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisLegacy",
      "origin": "mine (synthesis's own rounds: a v1.1 round not at the returned-to range)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => posting.record.schema_version === \"1.2\" || posting.record.output_sha === synthesis.posting.record.output_sha);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterLegacy",
      "origin": "mine (ruling rounds after the synthesis: a v1.1 round not at the returned-to range)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      (posting.record.schema_version === \"1.2\" || posting.record.output_sha === ruling.posting.record.output_sha) && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "Cell-on a ruling finding",
      "origin": "mine (ruling 3, ruling-routing branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const { id, seat, role } = pass;",
          "replace": "    if (!schema && state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n    const { id, seat, role } = pass;"
        }
      ]
    },
    {
      "name": "Cell-past the retry cap",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    if (firstOpen.outcome.failures > state.config.retry_cap) {",
          "replace": "    if (firstOpen.outcome.failures > state.config.retry_cap) {\n      if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "Cell-within the retry cap",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const which = `record rejected",
          "replace": "    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n    const which = `record rejected"
        }
      ]
    },
    {
      "name": "Cell-in progress",
      "origin": "mine (ruling 3, in-progress branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (firstOpen.id === state.inProgressPass) {",
          "replace": "  if (firstOpen.id === state.inProgressPass) {\n    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "Cell-without a record",
      "origin": "mine (ruling 3, no-record branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  return {\n    step: firstOpen.id,\n    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record",
          "replace": "  if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n  return {\n    step: firstOpen.id,\n    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record"
        }
      ]
    },
    {
      "name": "Opener-note",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"note\" && status === \"open\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "P9",
      "origin": "mine (ruling 1 vs the standing chain's deferral)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => {\n    let replaced = ruling?.kind === \"recorded\" ? ruling.posting.replaces : undefined;\n    while (replaced !== undefined) {\n      if (replaced === posting.id) return false;\n      replaced = rulings.find(({ id }) => id === replaced)?.replaces;\n    }\n    return true;\n  })].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "P10",
      "origin": "mine (ruling 1, two kinds at once: v1.1 and replaced, after the synthesis)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      !(posting.record.schema_version !== \"1.2\" && rulings.some((later) => later.replaces === posting.id)) && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "P11",
      "origin": "mine (ruling 1, two kinds at once: v1.1 and replaced, synthesis's own rounds)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !(posting.record.schema_version !== \"1.2\" && synthesis.postings.some((later) => later.replaces === posting.id)));"
        }
      ]
    },
    {
      "name": "PL-P9",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !(posting.record.reread && rulings.some((later) => later.replaces === posting.id)))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "PL-P10",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      !(posting.record.reread && rulings.some((later) => later.replaces === posting.id)) && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "PL-P11",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !(posting.record.reread && synthesis.postings.some((later) => later.replaces === posting.id)));"
        }
      ]
    }
  ],
  "base": [
    {
      "name": "P1",
      "origin": "mine (ruling 2, synthesis side)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  checkCarriedFindings(items, synthesis.posting, beforeSynthesis, opened);",
          "replace": "  checkCarriedFindings(items, synthesis.posting, beforeSynthesis.map((posting) => ({ ...posting, record: { ...posting.record, findings: posting.record.findings.filter(({ status }) => status !== \"fixed\") } })), opened);"
        }
      ]
    },
    {
      "name": "P2b",
      "origin": "mine (ruling 2, synthesis's ruling input)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({ ...posting, record: { ...posting.record, findings: posting.record.findings.filter(({ severity }) => severity === \"blocking\") } }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "P3",
      "origin": "mine (ruling 2, opener)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.filter(({ status }) => status !== \"fixed\").map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "P6",
      "origin": "mine (ruling 3, no-record branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  return {\n    step: firstOpen.id,\n    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record",
          "replace": "  if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n  return {\n    step: firstOpen.id,\n    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record"
        }
      ]
    },
    {
      "name": "P6b",
      "origin": "mine (ruling 3, in-progress branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (firstOpen.id === state.inProgressPass) {",
          "replace": "  if (firstOpen.id === state.inProgressPass) {\n    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "P6c",
      "origin": "mine (ruling 3, rejected branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (firstOpen.outcome.kind === \"rejected\") {",
          "replace": "  if (firstOpen.outcome.kind === \"rejected\") {\n    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "P6d",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    if (firstOpen.outcome.failures > state.config.retry_cap) {",
          "replace": "    if (firstOpen.outcome.failures > state.config.retry_cap) {\n      if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "P7",
      "origin": "mine (ruling 3, ruling-routing branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const { id, seat, role } = pass;",
          "replace": "    if (!schema && state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n    const { id, seat, role } = pass;"
        }
      ]
    },
    {
      "name": "P13",
      "origin": "mine (synthesis's own rounds: a v1.1 round not at the returned-to range)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => posting.record.schema_version === \"1.2\" || posting.record.output_sha === synthesis.posting.record.output_sha);"
        }
      ]
    },
    {
      "name": "P15",
      "origin": "mine (ruling rounds after the synthesis: a v1.1 round not at the returned-to range)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      (posting.record.schema_version === \"1.2\" || posting.record.output_sha === ruling.posting.record.output_sha) && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "PL-P6",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const which = `record rejected",
          "replace": "    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n    const which = `record rejected"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerShouldFix",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"should-fix\" && status === \"open\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisShouldFix",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"should-fix\" && status === \"open\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarryBeforeShouldFix",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"should-fix\" && status === \"open\")),\n      },\n    }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterShouldFix",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"should-fix\" && status === \"open\")),\n      },\n    })));"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisNote",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"note\" && status === \"open\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarryBeforeNote",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"note\" && status === \"open\")),\n      },\n    }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterNote",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"note\" && status === \"open\")),\n      },\n    })));"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerFixed",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"blocking\" && status === \"fixed\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisFixed",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"fixed\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarryBeforeFixed",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"fixed\")),\n      },\n    }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterFixed",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"fixed\")),\n      },\n    })));"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerContested",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"blocking\" && status === \"contested\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisContested",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"contested\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarryBeforeContested",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"contested\")),\n      },\n    }))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterContested",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"contested\")),\n      },\n    })));"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerOnTime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"blocking\" && status === \"open\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarryOpenerLegacy",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version !== \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"blocking\" && status === \"open\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisCorrection",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).map((posting) => ({\n      ...posting,\n      record: {\n        ...posting.record,\n        findings: posting.record.findings.filter(({ severity, status }) =>\n          !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces !== undefined && !synthesis.postings.some((later) => later.replaces === posting.id) && severity === \"blocking\" && status === \"open\")),\n      },\n    }));"
        }
      ]
    },
    {
      "name": "Cell-CarrySynthesisLegacy",
      "origin": "mine (synthesis's own rounds: a v1.1 round not at the returned-to range)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => posting.record.schema_version === \"1.2\" || posting.record.output_sha === synthesis.posting.record.output_sha);"
        }
      ]
    },
    {
      "name": "Cell-CarryAfterLegacy",
      "origin": "mine (ruling rounds after the synthesis: a v1.1 round not at the returned-to range)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      (posting.record.schema_version === \"1.2\" || posting.record.output_sha === ruling.posting.record.output_sha) && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "Cell-on a ruling finding",
      "origin": "mine (ruling 3, ruling-routing branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const { id, seat, role } = pass;",
          "replace": "    if (!schema && state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n    const { id, seat, role } = pass;"
        }
      ]
    },
    {
      "name": "Cell-past the retry cap",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    if (firstOpen.outcome.failures > state.config.retry_cap) {",
          "replace": "    if (firstOpen.outcome.failures > state.config.retry_cap) {\n      if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "Cell-within the retry cap",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const which = `record rejected",
          "replace": "    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n    const which = `record rejected"
        }
      ]
    },
    {
      "name": "Cell-in progress",
      "origin": "mine (ruling 3, in-progress branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (firstOpen.id === state.inProgressPass) {",
          "replace": "  if (firstOpen.id === state.inProgressPass) {\n    if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
        }
      ]
    },
    {
      "name": "Cell-without a record",
      "origin": "mine (ruling 3, no-record branch)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  return {\n    step: firstOpen.id,\n    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record",
          "replace": "  if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n  return {\n    step: firstOpen.id,\n    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record"
        }
      ]
    },
    {
      "name": "Opener-note",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" ? (\n    opener.outcome.posting.record.schema_version === \"1.2\" && !opener.outcome.posting.record.reread && opener.outcome.posting.replaces === undefined\n      ? opener.outcome.record.findings.filter(({ severity, status }) => !(severity === \"note\" && status === \"open\"))\n      : opener.outcome.record.findings\n  ).map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "P9",
      "origin": "mine (ruling 1 vs the standing chain's deferral)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => {\n    let replaced = ruling?.kind === \"recorded\" ? ruling.posting.replaces : undefined;\n    while (replaced !== undefined) {\n      if (replaced === posting.id) return false;\n      replaced = rulings.find(({ id }) => id === replaced)?.replaces;\n    }\n    return true;\n  })].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "P10",
      "origin": "mine (ruling 1, two kinds at once: v1.1 and replaced, after the synthesis)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      !(posting.record.schema_version !== \"1.2\" && rulings.some((later) => later.replaces === posting.id)) && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "P11",
      "origin": "mine (ruling 1, two kinds at once: v1.1 and replaced, synthesis's own rounds)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !(posting.record.schema_version !== \"1.2\" && synthesis.postings.some((later) => later.replaces === posting.id)));"
        }
      ]
    },
    {
      "name": "PL-P9",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !(posting.record.reread && rulings.some((later) => later.replaces === posting.id)))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "PL-P10",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      !(posting.record.reread && rulings.some((later) => later.replaces === posting.id)) && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "PL-P11",
      "origin": "appendix A4",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !(posting.record.reread && synthesis.postings.some((later) => later.replaces === posting.id)));"
        }
      ]
    }
  ],
  "reproduced": [
    {
      "name": "Z2",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, synthesis.record.findings.map(({ id }) => id).filter((id) => !opened.includes(id)));"
        }
      ]
    },
    {
      "name": "Y2",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (schema || !firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "Y2r",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!schema || !firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "Y3",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate?.required_checks.length ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "Y3b",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.length ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "Y3c",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate?.app_id !== undefined ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "Z1",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, synthesis.record.findings.map(({ id }) => id));"
        }
      ]
    },
    {
      "name": "R1",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!firstOpen || firstOpen !== pass\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "R1-no-gap",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && firstOpen && ( state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "R1-later-gap",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!firstOpen || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {"
        }
      ]
    },
    {
      "name": "R1-same-absent",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass))) {"
        }
      ]
    },
    {
      "name": "R1-same-rejected",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && firstOpen.outcome.kind === \"absent\"))) {",
          "replace": "  if (issue && pass && (!firstOpen || state.passes.indexOf(firstOpen) > state.passes.indexOf(pass)\n      || (firstOpen === pass && [\"absent\", \"rejected\"].includes(firstOpen.outcome.kind)))) {"
        }
      ]
    },
    {
      "name": "R2",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = ruling?.schema[0];"
        }
      ]
    },
    {
      "name": "R2-allowed-changes",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate?.allowed_changes ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "X7",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, opened);"
        }
      ]
    },
    {
      "name": "M1",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    else earlier.push(posting);",
          "replace": "    else if (!posting.record.reread) earlier.push(posting);"
        }
      ]
    },
    {
      "name": "M4",
      "edits": [
        {
          "file": "src/config.ts",
          "find": "  if (unknownKeys.length) config.unknownKeys = unknownKeys;",
          "replace": "  if (unknownKeys.length) config.unknownKeys = unknownKeys;\n  if (unknownKeys.some((key) => !key.startsWith(\"config.gate.\"))) delete config.gate;"
        }
      ]
    },
    {
      "name": "M5",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, state.passes\n      .filter(({ id }) => id !== flow.opens && !flow.carries.includes(id) && id !== flow.ruling)\n      .flatMap(({ outcome }) => outcome.kind === \"recorded\" ? outcome.record.findings.map(({ id }) => id) : []));"
        }
      ]
    },
    {
      "name": "M5-pass0",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, state.passes.flatMap(({ id, outcome }) =>\n      id === \"0\" && outcome.kind === \"recorded\" ? outcome.record.findings.map(({ id }) => id) : []));"
        }
      ]
    },
    {
      "name": "M5-exec",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, state.passes.flatMap(({ id, outcome }) =>\n      id === \"exec\" && outcome.kind === \"recorded\" ? outcome.record.findings.map(({ id }) => id) : []));"
        }
      ]
    },
    {
      "name": "UK-pass",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.passes[0].unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-finding-flow",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.finding_flow.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-required-checks",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.gate.required_checks[0].unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-allowed-changes",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.gate.allowed_changes.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-version-only",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.gate.allowed_changes.version_only.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-vendor",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.vendors.claude.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-install",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.installs[0].unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "UK-handoff",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && !state.config.unknownKeys?.includes(\"config.handoff.unexpected\") ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "D320",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened: string[] = [];"
        }
      ]
    },
    {
      "name": "D344",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  checkCarriedFindings(items, synthesis.posting, beforeSynthesis, opened);",
          "replace": ""
        }
      ]
    },
    {
      "name": "D351",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": ""
        }
      ]
    },
    {
      "name": "Z3",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      posting.record.schema_version === \"1.2\" && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "Zc",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    else earlier.push(posting);",
          "replace": "    else if (posting.replaces === undefined) earlier.push(posting);"
        }
      ]
    },
    {
      "name": "Y3d",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && state.config.finding_flow?.carries.length ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "Y3e",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const schema = state.config.gate ? ruling?.schema[0] : undefined;",
          "replace": "  const schema = state.config.gate && state.config.finding_flow?.ruling ? ruling?.schema[0] : undefined;"
        }
      ]
    },
    {
      "name": "O1-synthesis-ruling-reread",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "const beforeSynthesis = [...earlierSyntheses, ...rulings.filter(({ record }) => !record.reread)].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "O2-ruling-blocking-only",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
          "replace": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({ ...posting, record: { ...posting.record, findings: posting.record.findings.filter(({ severity }) => severity === \"blocking\") } })));"
        }
      ]
    },
    {
      "name": "O3-fixed-exempt",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    for (const { id } of posting.record.findings) {\n      if (have.has(id)) continue;",
          "replace": "    for (const { id, status } of posting.record.findings) {\n      if (have.has(id) || status === \"fixed\") continue;"
        }
      ]
    },
    {
      "name": "O5-status-unknown-keys",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  if (!firstOpen) {\n    return {\n      step: \"authorize\",",
          "replace": "  if (!firstOpen && state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n  if (!firstOpen) {\n    return {\n      step: \"authorize\","
        }
      ]
    },
    {
      "name": "O6-synthesis-ruling-legacy",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter(({ record }) => record.schema_version === \"1.2\")].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "O7-synthesis-ruling-corrected",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !rulings.some((later) => later.replaces === posting.id))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Opener-reread",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" && !opener.outcome.record.reread ? opener.outcome.record.findings.map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Opener-correction",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" && opener.outcome.posting.replaces === undefined ? opener.outcome.record.findings.map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Synthesis-replaced",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !synthesis.postings.some((later) => later.replaces === posting.id));"
        }
      ]
    },
    {
      "name": "Before-correction",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => posting.replaces === undefined)].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "Before-returning",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "const standing = rulings.at(-1)?.record;\n  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !standing?.reread || !(sameSha(posting.record.input_sha, standing.input_sha) &&\n      sameSha(posting.record.output_sha, standing.output_sha)))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "After-replaced",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0 && !rulings.some((later) => later.replaces === posting.id),\n    );"
        }
      ]
    },
    {
      "name": "Opener-ontime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" && !(opener.outcome.record.schema_version === \"1.2\" && !opener.outcome.record.reread && opener.outcome.posting.replaces === undefined) ? opener.outcome.record.findings.map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Opener-legacy",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
          "replace": "  const opened = opener?.outcome.kind === \"recorded\" && opener.outcome.record.schema_version === \"1.2\" ? opener.outcome.record.findings.map(({ id }) => id) : [];"
        }
      ]
    },
    {
      "name": "Synthesis-ontime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id)));"
        }
      ]
    },
    {
      "name": "Before-ontime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id)))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    },
    {
      "name": "After-ontime",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0 && !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id)),\n    );"
        }
      ]
    },
    {
      "name": "Synthesis-returning",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "const standing = synthesis.record;\n  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !standing.reread || !(sameSha(posting.record.input_sha, standing.input_sha) &&\n      sameSha(posting.record.output_sha, standing.output_sha)));"
        }
      ]
    },
    {
      "name": "After-returning",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "const standing = ruling.record;\n    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0 && (!standing.reread || !(sameSha(posting.record.input_sha, standing.input_sha) &&\n      sameSha(posting.record.output_sha, standing.output_sha))),\n    );"
        }
      ]
    },
    {
      "name": "M1-synthesis",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !posting.record.reread);"
        }
      ]
    },
    {
      "name": "M1-ruling",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      !posting.record.reread && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "Zc-synthesis",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
          "replace": "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => posting.replaces === undefined);"
        }
      ]
    },
    {
      "name": "Zc-ruling",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
          "replace": "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      posting.replaces === undefined && postingOrder(posting, synthesis.posting) > 0,\n    );"
        }
      ]
    },
    {
      "name": "Z3-synthesis",
      "origin": "round (reconstructed)",
      "edits": [
        {
          "file": "src/report.ts",
          "find": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
          "replace": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => posting.record.schema_version === \"1.2\" && postingOrder(posting, synthesis.posting) < 0);"
        }
      ]
    }
  ],
  "cells": {
    "CarryOpenerShouldFix": "CarryOpenerShouldFix",
    "CarrySynthesisShouldFix": "CarrySynthesisShouldFix",
    "CarryBeforeShouldFix": "CarryBeforeShouldFix",
    "CarryAfterShouldFix": "CarryAfterShouldFix",
    "CarrySynthesisNote": "CarrySynthesisNote",
    "CarryBeforeNote": "CarryBeforeNote",
    "CarryAfterNote": "CarryAfterNote",
    "CarryOpenerFixed": "CarryOpenerFixed",
    "CarrySynthesisFixed": "CarrySynthesisFixed",
    "CarryBeforeFixed": "CarryBeforeFixed",
    "CarryAfterFixed": "CarryAfterFixed",
    "CarryOpenerContested": "CarryOpenerContested",
    "CarrySynthesisContested": "CarrySynthesisContested",
    "CarryBeforeContested": "CarryBeforeContested",
    "CarryAfterContested": "CarryAfterContested",
    "CarryOpenerOnTime": "CarryOpenerOnTime",
    "CarryOpenerLegacy": "CarryOpenerLegacy",
    "CarrySynthesisCorrection": "CarrySynthesisCorrection",
    "CarrySynthesisLegacy": "CarrySynthesisLegacy",
    "CarryAfterLegacy": "CarryAfterLegacy",
    "on a ruling finding": "on a ruling finding",
    "past the retry cap": "past the retry cap",
    "within the retry cap": "within the retry cap",
    "in progress": "in progress",
    "without a record": "without a record"
  }
}
````
