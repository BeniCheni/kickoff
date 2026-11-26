# The review loop, Sprint 3: the deletion forms and scenarios for the ninth fix round of elenchus #8 (archived Sun 22 Nov 2026, TZ=America/New_York)

Archived by the Planner seat (Claude Code, Opus 5.5, `xhigh`) with the ninth fix brief,
[`review-loop-sprint-3-fix-9-prompt.md`](review-loop-sprint-3-fix-9-prompt.md). The eighth Pass 3
([comment](https://github.com/BeniCheni/elenchus/pull/8#issuecomment-7078983411)) names these
forms. The seat folders that held them were emptied on Sat 21 Nov, so this file is the copy the
round reads.

**How to use it.** Each section below holds one file between four-backtick fences. A file's text
is everything between its opening fence line and its closing fence line, ending in a newline. The
sha256 and byte count given are of that text. Each form is a single exact replacement: its `old`
(or `find`) text occurs exactly once in its file at `a61d6e8`, and `5b0fba2`'s `src` is the same.
Scenario blocks are appended to a copy of `test/authorize.test.ts` and run with
`npx vitest run test/authorize.test.ts -t R8S`, with `R8_OUT` set to a folder they write their
observations to.

## A. Codex's eighth-round forms

Twenty-two of the eighth round's forms, as the Planner copied them from Codex's folder (`.pass2-r8/probes/deletions`) on Sat 21 Nov and merged into one list: M1, M4 and M5 from `cases-mine.json`; O1 to O3 and O5 from `cases-own.json` and O6 and O7 from `cases-own2.json`; the six rows beyond the minimum from `cases-round8.json`; and the seven table proofs from `cases-table-proof.json`. The Planner ran each alone at `a61d6e8` that day, and each failing set equalled the round's own final run, test name for test name. The round's other deletions are in its record and the seventh round's, described there, not here.

`codex-round8-forms.json`: 8845 bytes, sha256 `56d4aba071909c302db7d7e5ea314abdb247053145f45fd9e6c69890c3923dec`.

````json
[
 {
  "id": "M1",
  "file": "src/report.ts",
  "old": "    else earlier.push(posting);",
  "new": "    else if (!posting.record.reread) earlier.push(posting);"
 },
 {
  "id": "M4",
  "file": "src/config.ts",
  "old": "  if (unknownKeys.length) config.unknownKeys = unknownKeys;",
  "new": "  if (unknownKeys.length) config.unknownKeys = unknownKeys;\n  if (unknownKeys.some((key) => !key.startsWith(\"config.gate.\"))) delete config.gate;"
 },
 {
  "id": "M5",
  "file": "src/report.ts",
  "old": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
  "new": "    checkCarriedFindings(items, ruling.posting, afterSynthesis, state.passes\n      .filter(({ id }) => id !== flow.opens && !flow.carries.includes(id) && id !== flow.ruling)\n      .flatMap(({ outcome }) => outcome.kind === \"recorded\" ? outcome.record.findings.map(({ id }) => id) : []));"
 },
 {
  "id": "O1-synthesis-ruling-reread",
  "file": "src/report.ts",
  "old": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
  "new": "const beforeSynthesis = [...earlierSyntheses, ...rulings.filter(({ record }) => !record.reread)].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
 },
 {
  "id": "O2-ruling-blocking-only",
  "file": "src/report.ts",
  "old": "    checkCarriedFindings(items, ruling.posting, afterSynthesis);",
  "new": "    checkCarriedFindings(items, ruling.posting, afterSynthesis.map((posting) => ({ ...posting, record: { ...posting.record, findings: posting.record.findings.filter(({ severity }) => severity === \"blocking\") } })));"
 },
 {
  "id": "O3-fixed-exempt",
  "file": "src/report.ts",
  "old": "    for (const { id } of posting.record.findings) {\n      if (have.has(id)) continue;",
  "new": "    for (const { id, status } of posting.record.findings) {\n      if (have.has(id) || status === \"fixed\") continue;"
 },
 {
  "id": "O5-status-unknown-keys",
  "file": "src/report.ts",
  "old": "  if (!firstOpen) {\n    return {\n      step: \"authorize\",",
  "new": "  if (!firstOpen && state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };\n  if (!firstOpen) {\n    return {\n      step: \"authorize\","
 },
 {
  "id": "O6-synthesis-ruling-legacy",
  "file": "src/report.ts",
  "old": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
  "new": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter(({ record }) => record.schema_version === \"1.2\")].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
 },
 {
  "id": "O7-synthesis-ruling-corrected",
  "file": "src/report.ts",
  "old": "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
  "new": "  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !rulings.some((later) => later.replaces === posting.id))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
 },
 {
  "id": "Opener-reread",
  "file": "src/report.ts",
  "old": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
  "new": "  const opened = opener?.outcome.kind === \"recorded\" && !opener.outcome.record.reread ? opener.outcome.record.findings.map(({ id }) => id) : [];"
 },
 {
  "id": "Opener-correction",
  "file": "src/report.ts",
  "old": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
  "new": "  const opened = opener?.outcome.kind === \"recorded\" && opener.outcome.posting.replaces === undefined ? opener.outcome.record.findings.map(({ id }) => id) : [];"
 },
 {
  "id": "Synthesis-replaced",
  "file": "src/report.ts",
  "old": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
  "new": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !synthesis.postings.some((later) => later.replaces === posting.id));"
 },
 {
  "id": "Before-correction",
  "file": "src/report.ts",
  "old": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
  "new": "const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => posting.replaces === undefined)].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
 },
 {
  "id": "Before-returning",
  "file": "src/report.ts",
  "old": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
  "new": "const standing = rulings.at(-1)?.record;\n  const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !standing?.reread || !(sameSha(posting.record.input_sha, standing.input_sha) &&\n      sameSha(posting.record.output_sha, standing.output_sha)))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
 },
 {
  "id": "After-replaced",
  "file": "src/report.ts",
  "old": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
  "new": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0 && !rulings.some((later) => later.replaces === posting.id),\n    );"
 },
 {
  "id": "Opener-ontime",
  "file": "src/report.ts",
  "old": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
  "new": "  const opened = opener?.outcome.kind === \"recorded\" && !(opener.outcome.record.schema_version === \"1.2\" && !opener.outcome.record.reread && opener.outcome.posting.replaces === undefined) ? opener.outcome.record.findings.map(({ id }) => id) : [];"
 },
 {
  "id": "Opener-legacy",
  "file": "src/report.ts",
  "old": "  const opened = opener?.outcome.kind === \"recorded\" ? opener.outcome.record.findings.map(({ id }) => id) : [];",
  "new": "  const opened = opener?.outcome.kind === \"recorded\" && opener.outcome.record.schema_version === \"1.2\" ? opener.outcome.record.findings.map(({ id }) => id) : [];"
 },
 {
  "id": "Synthesis-ontime",
  "file": "src/report.ts",
  "old": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
  "new": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !synthesis.postings.some((later) => later.replaces === posting.id)));"
 },
 {
  "id": "Before-ontime",
  "file": "src/report.ts",
  "old": "const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);",
  "new": "const beforeSynthesis = [...earlierSyntheses, ...rulings.filter((posting) => !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id)))].filter((posting) => postingOrder(posting, synthesis.posting) < 0);"
 },
 {
  "id": "After-ontime",
  "file": "src/report.ts",
  "old": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
  "new": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0 && !(posting.record.schema_version === \"1.2\" && !posting.record.reread && posting.replaces === undefined && !rulings.some((later) => later.replaces === posting.id)),\n    );"
 },
 {
  "id": "Synthesis-returning",
  "file": "src/report.ts",
  "old": "const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);",
  "new": "const standing = synthesis.record;\n  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting).filter((posting) => !standing.reread || !(sameSha(posting.record.input_sha, standing.input_sha) &&\n      sameSha(posting.record.output_sha, standing.output_sha)));"
 },
 {
  "id": "After-returning",
  "file": "src/report.ts",
  "old": "const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );",
  "new": "const standing = ruling.record;\n    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0 && (!standing.reread || !(sameSha(posting.record.input_sha, standing.input_sha) &&\n      sameSha(posting.record.output_sha, standing.output_sha))),\n    );"
 }
]
````

## B. The seventh Pass 2.5 re-read's forms

The re-read's `probes/deletions/forms.mjs`, verbatim. It rebuilt the round's forms from the records after the folder loss, and adds its own: P1, P2b, P3, P6, P6b, P6c, P7, P9 to P15, Z3-own, the narrower on-time proofs, and the Planner's appendix forms as PL-P2 and PL-P4 to PL-P11. Each form is `{ name, origin, edits: [{ file, find, replace }] }`, and each has one edit.

`forms.mjs`: 13139 bytes, sha256 `be281745cf5515bea74026ce1e86afee6ddd435092df9ba7043d0fc201afeb12`.

````js
// Deletion forms for the seventh Pass 2.5 re-read (rebuilt 21 Nov 2026).
// The round's own case files were lost with the builder's folder, so the round's rows here are
// reconstructed from their posted descriptions (comment 7067280478 and 7048766133).
// Each edit's `find` must occur exactly once in its file.
const L320 = '  const opened = opener?.outcome.kind === "recorded" ? opener.outcome.record.findings.map(({ id }) => id) : [];';
const L342 = "  const earlierSyntheses = earlierRounds(synthesis.postings, synthesis.posting);";
const L343 = "  const beforeSynthesis = [...earlierSyntheses, ...rulings].filter((posting) => postingOrder(posting, synthesis.posting) < 0);";
const L344 = "  checkCarriedFindings(items, synthesis.posting, beforeSynthesis, opened);";
const L348 = "    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      postingOrder(posting, synthesis.posting) > 0,\n    );";
const L351 = "    checkCarriedFindings(items, ruling.posting, afterSynthesis);";
const L360 = "    else earlier.push(posting);";
const L373 = "    for (const { id } of posting.record.findings) {";
const L72 = "    const { id, seat, role } = pass;";
const L75 = "  if (!firstOpen) {\n    return {\n      step: \"authorize\",";
const L84 = '  if (firstOpen.outcome.kind === "rejected") {';
const L94 = "    const which = `record rejected";
const L103 = "  if (firstOpen.id === state.inProgressPass) {";
const L114 = "  return {\n    step: firstOpen.id,\n    seat: firstOpen.seat,\n    role: firstOpen.role,\n    blocked: `no record";
const C54 = "  if (unknownKeys.length) config.unknownKeys = unknownKeys;";
const ESC = 'return { step: escalateTo(state.config), seat: null, role: null, blocked: "unknown configuration keys", options: null };';
const R = "src/report.ts";
const keep = (pred) => `.filter((posting) => ${pred})`;
const after349 = (pred) => `    const afterSynthesis = earlierRounds(rulings, ruling.posting).filter((posting) =>\n      ${pred} && postingOrder(posting, synthesis.posting) > 0,\n    );`;
const onTime = "(posting.record.reread || posting.record.schema_version !== \"1.2\" || posting.replaces !== undefined)";
const replacedBy = (list) => `${list}.some((later) => later.replaces === posting.id)`;
const mapFindings = (list, pred) => `${list}.map((posting) => ({ ...posting, record: { ...posting.record, findings: posting.record.findings.filter(${pred}) } }))`;
const e = (find, replace, file = R) => ({ file, find, replace });

export const forms = [
  // ---- The round's new and narrowed rows (reconstructed) ----
  { name: "O1", origin: "round (sixth re-read's form, verbatim)", edits: [e(L343, L343.replace("...rulings]", "...rulings.filter(({ record }) => !record.reread)]"))] },
  { name: "O6", origin: "round (sixth re-read's form, verbatim)", edits: [e(L343, L343.replace("...rulings]", "...rulings.filter(({ record }) => record.schema_version === \"1.2\")]"))] },
  { name: "O7", origin: "round (sixth re-read's form, verbatim)", edits: [e(L343, L343.replace("...rulings]", "...rulings.filter((posting) => !rulings.some((later) => later.replaces === posting.id))]"))] },
  { name: "O2", origin: "round (reconstructed)", edits: [e(L351, `    checkCarriedFindings(items, ruling.posting, ${mapFindings("afterSynthesis", '({ severity }) => severity === "blocking"')});`)] },
  { name: "O3", origin: "round (reconstructed)", edits: [e(L373, '    for (const { id, status } of posting.record.findings) {\n      if (status === "fixed") continue;')] },
  { name: "O5", origin: "round (sixth re-read's form)", edits: [e(L75, `  if (!firstOpen && state.config.unknownKeys) ${ESC}\n${L75}`)] },
  // ---- Six rows beyond the minimum (reconstructed) ----
  { name: "Opener-reread", origin: "round (reconstructed)", edits: [e(L320, L320.replace('=== "recorded" ?', '=== "recorded" && !opener.outcome.record.reread ?'))] },
  { name: "Opener-correction", origin: "round (reconstructed)", edits: [e(L320, L320.replace('=== "recorded" ?', '=== "recorded" && opener.outcome.posting.replaces === undefined ?'))] },
  { name: "Synthesis-replaced", origin: "round (reconstructed)", edits: [e(L342, L342.replace(");", `)${keep("!" + replacedBy("synthesis.postings"))};`))] },
  { name: "Before-correction", origin: "round (reconstructed)", edits: [e(L343, L343.replace("...rulings]", "...rulings.filter((posting) => posting.replaces === undefined)]"))] },
  { name: "Before-returning", origin: "round (reconstructed)", edits: [e(L343, L343.replace("...rulings]", '...rulings.filter((posting) => ruling?.kind !== "recorded" || posting === ruling.posting || posting.record.output_sha !== ruling.posting.record.output_sha)]'))] },
  { name: "After-replaced", origin: "round (reconstructed)", edits: [e(L348, after349("!" + replacedBy("rulings")))] },
  // ---- The round's table proofs (reconstructed) ----
  { name: "Opener-ontime", origin: "round (reconstructed)", edits: [e(L320, L320.replace('=== "recorded" ?', '=== "recorded" && (opener.outcome.record.reread || opener.outcome.record.schema_version !== "1.2" || opener.outcome.posting.replaces !== undefined) ?'))] },
  { name: "Opener-legacy", origin: "round (reconstructed)", edits: [e(L320, L320.replace('=== "recorded" ?', '=== "recorded" && opener.outcome.record.schema_version === "1.2" ?'))] },
  { name: "Synthesis-ontime", origin: "round (reconstructed)", edits: [e(L342, L342.replace(");", `)${keep(onTime)};`))] },
  { name: "Before-ontime", origin: "round (reconstructed)", edits: [e(L343, L343.replace("...rulings]", `...rulings${keep(onTime)}]`))] },
  { name: "After-ontime", origin: "round (reconstructed)", edits: [e(L348, after349(onTime))] },
  { name: "Synthesis-returning", origin: "round (reconstructed)", edits: [e(L342, L342.replace(");", `)${keep("posting.record.output_sha !== synthesis.posting.record.output_sha")};`))] },
  { name: "After-returning", origin: "round (reconstructed)", edits: [e(L348, after349("posting.record.output_sha !== ruling.posting.record.output_sha"))] },
  { name: "M1-synthesis", origin: "round (reconstructed)", edits: [e(L342, L342.replace(");", `)${keep("!posting.record.reread")};`))] },
  { name: "M1-ruling", origin: "round (reconstructed)", edits: [e(L348, after349("!posting.record.reread"))] },
  { name: "Zc-synthesis", origin: "round (reconstructed)", edits: [e(L342, L342.replace(");", `)${keep("posting.replaces === undefined")};`))] },
  { name: "Zc-ruling", origin: "round (reconstructed)", edits: [e(L348, after349("posting.replaces === undefined"))] },
  { name: "Z3-synthesis", origin: "round (reconstructed)", edits: [e(L343, L343.replace("(posting) => postingOrder", '(posting) => posting.record.schema_version === "1.2" && postingOrder'))] },
  // ---- Inherited rows whose catches the round changed (reconstructed) ----
  { name: "M1", origin: "seventh round (reconstructed)", edits: [e(L360, "    else if (!posting.record.reread) earlier.push(posting);")] },
  { name: "M4", origin: "seventh round (reconstructed)", edits: [e(C54, '  if (unknownKeys.length) config.unknownKeys = unknownKeys;\n  if (unknownKeys.some((key) => !key.startsWith("config.gate"))) delete config.gate;', "src/config.ts")] },
  { name: "M5", origin: "seventh round (reconstructed)", edits: [e(L351, `    const inFlow = new Set([flow.opens, ...flow.carries, flow.ruling]);\n    const outside = state.passes.flatMap((pass) => !inFlow.has(pass.id) && pass.outcome.kind === "recorded" ? pass.outcome.record.findings.map(({ id }) => id) : []);\n    checkCarriedFindings(items, ruling.posting, afterSynthesis, outside);`)] },
  // ---- Mine, aimed at rulings 1 to 3 ----
  { name: "P1", origin: "mine (ruling 2, synthesis side)", edits: [e(L344, `  checkCarriedFindings(items, synthesis.posting, ${mapFindings("beforeSynthesis", '({ status }) => status !== "fixed"')}, opened);`)] },
  { name: "P2b", origin: "mine (ruling 2, synthesis's ruling input)", edits: [e(L343, L343.replace("...rulings]", `...${mapFindings("rulings", '({ severity }) => severity === "blocking"')}]`))] },
  { name: "P3", origin: "mine (ruling 2, opener)", edits: [e(L320, L320.replace("findings.map(", 'findings.filter(({ status }) => status !== "fixed").map('))] },
  { name: "P6", origin: "mine (ruling 3, no-record branch)", edits: [e(L114, `  if (state.config.unknownKeys) ${ESC}\n${L114}`)] },
  { name: "P6b", origin: "mine (ruling 3, in-progress branch)", edits: [e(L103, `${L103}\n    if (state.config.unknownKeys) ${ESC}`)] },
  { name: "P6c", origin: "mine (ruling 3, rejected branch)", edits: [e(L84, `${L84}\n    if (state.config.unknownKeys) ${ESC}`)] },
  { name: "P7", origin: "mine (ruling 3, ruling-routing branch)", edits: [e(L72, `    if (!schema && state.config.unknownKeys) ${ESC}\n${L72}`)] },
  { name: "P9", origin: "mine (ruling 1 vs the standing chain's deferral)", edits: [e(L343, L343.replace("...rulings]", '...rulings.filter((posting) => {\n    let replaced = ruling?.kind === "recorded" ? ruling.posting.replaces : undefined;\n    while (replaced !== undefined) {\n      if (replaced === posting.id) return false;\n      replaced = rulings.find(({ id }) => id === replaced)?.replaces;\n    }\n    return true;\n  })]'))] },
  { name: "P10", origin: "mine (ruling 1, two kinds at once: v1.1 and replaced, after the synthesis)", edits: [e(L348, after349(`!(posting.record.schema_version !== "1.2" && ${replacedBy("rulings")})`))] },
  { name: "P11", origin: "mine (ruling 1, two kinds at once: v1.1 and replaced, synthesis's own rounds)", edits: [e(L342, L342.replace(");", `)${keep(`!(posting.record.schema_version !== "1.2" && ${replacedBy("synthesis.postings")})`)};`))] },
  { name: "Z3-own", origin: "mine (narrower Z3-synthesis: own rounds only)", edits: [e(L342, L342.replace(");", `)${keep('posting.record.schema_version === "1.2"')};`))] },
  // ---- Mine, splitting the v1.1 and returning columns that share one test ----
  { name: "P12", origin: "mine (synthesis's own rounds: a v1.2 round at the range the standing synthesis returns to)", edits: [e(L342, L342.replace(");", `)${keep('!(posting.record.schema_version === "1.2" && posting.record.output_sha === synthesis.posting.record.output_sha)')};`))] },
  { name: "P13", origin: "mine (synthesis's own rounds: a v1.1 round not at the returned-to range)", edits: [e(L342, L342.replace(");", `)${keep('posting.record.schema_version === "1.2" || posting.record.output_sha === synthesis.posting.record.output_sha')};`))] },
  { name: "P14", origin: "mine (ruling rounds after the synthesis: a v1.2 round at the range the standing ruling returns to)", edits: [e(L348, after349('!(posting.record.schema_version === "1.2" && posting.record.output_sha === ruling.posting.record.output_sha)'))] },
  { name: "P15", origin: "mine (ruling rounds after the synthesis: a v1.1 round not at the returned-to range)", edits: [e(L348, after349('(posting.record.schema_version === "1.2" || posting.record.output_sha === ruling.posting.record.output_sha)'))] },
  // ---- Narrower on-time proofs: also keep postings a later correction replaced ----
  { name: "Synthesis-ontime2", origin: "round (reconstructed, narrower)", edits: [e(L342, L342.replace(");", `)${keep(`(${onTime.slice(0, -1)} || ${replacedBy("synthesis.postings")}))`)};`))] },
  { name: "Before-ontime2", origin: "round (reconstructed, narrower)", edits: [e(L343, L343.replace("...rulings]", `...rulings${keep(`(${onTime.slice(0, -1)} || ${replacedBy("rulings")}))`)}]`))] },
  { name: "After-ontime2", origin: "round (reconstructed, narrower)", edits: [e(L348, after349(`(${onTime.slice(0, -1)} || ${replacedBy("rulings")}))`))] },
  // ---- The Planner's forms (appendix A4), as worded there ----
  { name: "PL-P2", origin: "appendix A4", edits: [e(L344, `  checkCarriedFindings(items, synthesis.posting, ${mapFindings("beforeSynthesis", '({ severity }) => severity === "blocking"')}, opened);`)] },
  { name: "PL-P4", origin: "appendix A4", edits: [e(L320, L320.replace("findings.map(", 'findings.filter(({ severity }) => severity !== "blocking").map('))] },
  { name: "PL-P5", origin: "appendix A4", edits: [e(L114, `  if (state.config.unknownKeys) ${ESC}\n${L114}`)] },
  { name: "PL-P6", origin: "appendix A4", edits: [e(L94, `    if (state.config.unknownKeys) ${ESC}\n${L94}`)] },
  { name: "PL-P7", origin: "appendix A4", edits: [e(L103, `  if (firstOpen.id === state.inProgressPass && state.config.unknownKeys) ${ESC}\n${L103}`)] },
  { name: "PL-P8", origin: "appendix A4", edits: [e(L72, `${L72}\n    if (state.config.unknownKeys) ${ESC}`)] },
  { name: "PL-P9", origin: "appendix A4", edits: [e(L343, L343.replace("[...earlierSyntheses, ...rulings]", "[...earlierSyntheses, ...rulings.filter((posting) => !(posting.record.reread && rulings.some((later) => later.replaces === posting.id)))]"))] },
  { name: "PL-P10", origin: "appendix A4", edits: [e(L348, after349("!(posting.record.reread && rulings.some((later) => later.replaces === posting.id))"))] },
  { name: "PL-P11", origin: "appendix A4", edits: [e(L342, L342.replace(");", ").filter((posting) => !(posting.record.reread && synthesis.postings.some((later) => later.replaces === posting.id)));"))] },
];
````

## C. The seventh Pass 2.5 re-read's scenarios, first block

S-P1, S-P2b, S-P3, S-P6, S-P6b, S-P6c, S-P7, S-P9, S-P10, S-P11 and S-PL9. It defines `r8Observe`, `r8Flow` and `onTime`, which the later blocks use.

`r8-block.ts`: 5810 bytes, sha256 `eb38e2d83ce51b0cafb48914e395becdd9d5a4ee667e0dc2547bd5c5b56e41b3`.

````ts

// ---- R8S: the seventh Pass 2.5 re-read's scenario probes (appended to a copy of this file) ----
import { writeFileSync as r8Write } from "node:fs";

const r8Flow = (withKey: boolean) => (config: Config) => {
  config.finding_flow = { opens: "1", carries: ["2", "2.5"], ruling: "3" };
  if (withKey) Object.assign(config, { unexpected: true });
};
const atB = { input_sha: rereadHead, output_sha: rereadHead };
const atC = { input_sha: thirdHead, output_sha: thirdHead };
const docsToB = { output_sha: rereadHead, commits: [rereadHead] };
const moved = { allPasses: replayPasses, boundary: "2.5", head: rereadHead, changedPath: "docs/notes.md" };
const onTime = (count: number) => replayPasses.slice(0, count).map((pass) => record(pass));

async function r8Observe(name: string, build: (withKey: boolean) => ReturnType<typeof world>, keyed = false) {
  const result: Record<string, unknown> = {};
  for (const withKey of keyed ? [false, true] : [false]) {
    const { gh } = build(withKey);
    const state = await loadReview(gh, repo, 1);
    const fails = buildCheck(state).filter(({ severity }) => severity === "fail")
      .map(({ rule, pass, finding, message }) => [rule, pass, finding ?? "", message].join(" | "));
    let dry: unknown;
    try {
      const out = await authorize(gh, repo, 1, { dryRun: true });
      dry = { ok: out.ok, fails: out.items.filter(({ severity }) => severity === "fail").map(({ rule, message }) => `${rule} | ${message}`) };
    } catch (error) { dry = { error: String(error) }; }
    result[withKey ? "withKey" : "plain"] = { fails, next: buildStatus(state).next, authorize: dry };
  }
  r8Write(`${process.env.R8_OUT}/${name}.json`, JSON.stringify(result, null, 1));
}

describe("R8S", () => {
  // 25-29 (ruling 2 on the synthesis's and opener's carries)
  const rulingBefore = (finding: SeatRecord["findings"][number]) => (withKey: boolean) => world({
    ...moved, configure: r8Flow(withKey),
    records: [...onTime(5), record("3", { findings: [finding] }), record("exec", docsToB), record("2.5", { ...atB, reread: true }), record("3", { ...atB, reread: true })],
  });
  it("S-P1 an on-time ruling's blocking id marked fixed, dropped by the synthesis re-read", () =>
    r8Observe("S-P1", rulingBefore({ id: "F41", severity: "blocking", status: "fixed" })));
  it("S-P2b an on-time ruling's open note, dropped by the synthesis re-read", () =>
    r8Observe("S-P2b", rulingBefore({ id: "F42", severity: "note", status: "open" })));
  it("S-P3 the opener's blocking id marked fixed, dropped by passes 2 and 2.5", () =>
    r8Observe("S-P3", (withKey) => world({
      allPasses: replayPasses, configure: r8Flow(withKey),
      records: replayPasses.map((pass) => record(pass, pass === "1" ? { findings: [{ id: "F43", severity: "blocking", status: "fixed" }] } : {})),
    })));
  // 25-30 (ruling 3 in nextStep's other branches)
  it("S-P6 no record for pass 2, with and without an unknown key", () =>
    r8Observe("S-P6", (withKey) => world({ allPasses: replayPasses, configure: r8Flow(withKey), records: onTime(3) }), true));
  it("S-P6b pass exec in progress after a docs push, with and without an unknown key", () =>
    r8Observe("S-P6b", (withKey) => world({ ...moved, configure: r8Flow(withKey), records: onTime(6) }), true));
  it("S-P6c pass 3's record rejected, with and without an unknown key", () =>
    r8Observe("S-P6c", (withKey) => world({
      allPasses: replayPasses, configure: r8Flow(withKey),
      records: [...onTime(5), record("3", { findings: [{ id: "F44", severity: "bogus" as "note", status: "open" }] })],
    }), true));
  it("S-P7 an open blocking id only the synthesis names routes to the ruling, with and without an unknown key", () =>
    r8Observe("S-P7", (withKey) => world({
      allPasses: replayPasses, configure: r8Flow(withKey),
      records: replayPasses.map((pass) => record(pass, pass === "2.5" ? { findings: [{ id: "F45", severity: "blocking", status: "open" }] } : {})),
    }), true));
  // 25-31 (a ruling posting before the synthesis, inside the standing ruling's own chain)
  it("S-P9 the standing ruling corrects a ruling posted before the synthesis re-read", () =>
    r8Observe("S-P9", (withKey) => world({
      ...moved, configure: r8Flow(withKey),
      records: [...onTime(5), record("3", { findings: [{ id: "F46", severity: "blocking", status: "open" }] }), record("2.5", { ...atB, reread: true }), record("3")],
    })));
  // 25-32 (two kinds at once)
  it("S-P10 a v1.1 ruling after the synthesis, replaced by a v1.2 correction, then a ruling re-read", () =>
    r8Observe("S-P10", (withKey) => world({
      ...moved, configure: r8Flow(withKey),
      records: [...onTime(5), legacyRecord("3", { findings: [{ id: "F47", severity: "blocking", status: "open" }] }), record("3"), record("exec", docsToB), record("3", { ...atB, reread: true })],
    })));
  it("S-P11 a v1.1 synthesis replaced by a v1.2 correction, then a synthesis re-read", () =>
    r8Observe("S-P11", (withKey) => world({
      ...moved, configure: r8Flow(withKey),
      records: [...onTime(4), legacyRecord("2.5", { findings: [{ id: "F48", severity: "blocking", status: "open" }] }), record("2.5"), record("3"), record("exec", docsToB), record("2.5", { ...atB, reread: true }), record("3", { ...atB, reread: true })],
    })));
  it("S-PL9 a ruling re-read replaced by a correction before the synthesis re-read, then a later ruling re-read", () =>
    r8Observe("S-PL9", (withKey) => world({
      ...moved, head: thirdHead, intermediateHead: rereadHead, configure: r8Flow(withKey),
      records: [...onTime(6), record("3", { ...atB, reread: true, findings: [{ id: "F49", severity: "blocking", status: "open" }] }), record("3", atB), record("2.5", { ...atC, reread: true }), record("3", { ...atC, reread: true })],
    })));
});
````

## D. The seventh Pass 2.5 re-read's scenarios, second block

S-P12 to S-P15. S-P12 and S-P14 do not build: the world has no answer for the compare they need, and the cells they aim at cannot be reached (`src/load.ts:205` and `:459`).

`r8-block2.ts`: 1651 bytes, sha256 `926693c48f3b5e202bbb56a0b3c9e919f81fd64b32bc97e7129c2c4d37557a3c`.

````ts

describe("R8S", () => {
  // 25-32 (the v1.1 and returning columns, split)
  const blockingOpen = (id: string) => ({ id, severity: "blocking", status: "open" }) as const;
  it("S-P12 a v1.2 synthesis at the range the standing synthesis re-read returns to", () =>
    r8Observe("S-P12", (withKey) => world({
      ...moved, configure: r8Flow(withKey),
      records: [...onTime(4), record("2.5", { findings: [blockingOpen("F50")] }), record("3"), record("exec", docsToB), record("2.5", { ...atB, reread: true }), record("2.5", { reread: true })],
    })));
  it("S-P13 a v1.1 synthesis at an older range, then a synthesis re-read", () =>
    r8Observe("S-P13", (withKey) => world({
      ...moved, configure: r8Flow(withKey),
      records: [...onTime(4), legacyRecord("2.5", { findings: [blockingOpen("F51")] }), record("3"), record("exec", docsToB), record("2.5", { ...atB, reread: true }), record("3", { ...atB, reread: true })],
    })));
  it("S-P14 a v1.2 ruling at the range the standing ruling re-read returns to", () =>
    r8Observe("S-P14", (withKey) => world({
      ...moved, configure: r8Flow(withKey),
      records: [...onTime(5), record("3", { findings: [blockingOpen("F52")] }), record("exec", docsToB), record("3", { ...atB, reread: true }), record("3", { reread: true })],
    })));
  it("S-P15 a v1.1 ruling at an older range after the synthesis, then a ruling re-read", () =>
    r8Observe("S-P15", (withKey) => world({
      ...moved, configure: r8Flow(withKey),
      records: [...onTime(5), legacyRecord("3", { findings: [blockingOpen("F53")] }), record("exec", docsToB), record("3", { ...atB, reread: true })],
    })));
});
````

## E. The Planner's P6d

The unknown-key escalation inside `nextStep`'s rejected arm over the retry cap alone, after `src/report.ts:85`, in the shape of section A's entries. It passes 389 of 389 at `a61d6e8` and 377 of 377 at `5b0fba2`.

`planner-p6d.json`: 361 bytes, sha256 `428e76816b89b37a66fb42af15e632fbb802acd8ff06b3bb6519ed89b0432ecf`.

````json
[
 {
  "id": "P6d",
  "file": "src/report.ts",
  "old": "    if (firstOpen.outcome.failures > state.config.retry_cap) {",
  "new": "    if (firstOpen.outcome.failures > state.config.retry_cap) {\n      if (state.config.unknownKeys) return { step: escalateTo(state.config), seat: null, role: null, blocked: \"unknown configuration keys\", options: null };"
 }
]
````

## F. The Planner's S-P6d

Pass 3's record rejected three times, past the retry cap of 2, with and without an unknown key. Append it after sections C and D. With the key, `status` blocks on "pass 3 exceeded retry cap 2 after 3 failed attempts" at the head, and on "unknown configuration keys" under P6d.

`planner-s-p6d.ts`: 472 bytes, sha256 `8c35b20276bda7f2a7a04c59f44d473f580ec0f8322bbfbb6c607eb8a86ac98d`.

````ts

describe("R8S", () => {
  // The Planner's: the rejected arm over the retry cap, alone
  it("S-P6d pass 3's record rejected three times, over the retry cap, with and without an unknown key", () =>
    r8Observe("S-P6d", (withKey) => world({
      allPasses: replayPasses, configure: r8Flow(withKey),
      records: [...onTime(5), ...["F44", "F45", "F46"].map((id) => record("3", { findings: [{ id, severity: "bogus" as "note", status: "open" }] }))],
    }), true));
});
````
