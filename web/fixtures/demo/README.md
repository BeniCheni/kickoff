# Demo social fixture

Sample reactions and comments for the Next reader. Not a measurement.
`web/scripts/generate-demo-social.mjs` writes `social.json` from the stub
catalog ids and `@kickoff/demo`'s fixed seed. The file carries
`KICKOFF-DEMO-SOCIAL`. The reader opens it only when `KICKOFF_DEMO=on` and
`KICKOFF_DEMO_FILE` names it. There is no baked-in path.
