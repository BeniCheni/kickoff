// Reproduce the clearing's two-app matrix. The general runner lives in evidence.mjs;
// this entry keeps the 96-cell receipt and the same log lines.
import { runClearing } from './evidence.mjs'

await runClearing({ out: process.argv[2] ?? '/tmp/kickoff-clearing' })
