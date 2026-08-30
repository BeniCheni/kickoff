# Kickoff v0.0.2 — UI/UX Overhaul, Stack & DX Audit, AI Feature Scoping, Deployment Plan

## Context
This is "Kickoff" — my personal soccer fixtures + standings tracker that also supports my betting research pipeline (fixture data feeds pre-match research; I don't need you to touch any betting/staking logic in this session). It runs locally at http://localhost:4173/. I'm the only user. I care about it being genuinely gorgeous and fun to open, about the codebase being modern and pleasant to poke around in (not necessarily "enterprise scalable"), and about eventually reaching it from my phone via a URL.

**Before proposing anything: actually look at what's here.** Don't assume a stack or a file structure — inspect package.json, the folder layout, routing config, and git log. Run the dev server yourself and click through it. I'll tell you if something you find contradicts what I remember; treat my recollection as unreliable and the repo as ground truth.

### Design reference for Table/Standings — read this before Part 1
`Kickoff Standings.html`, sitting in the `Kickoff/` project root, is a standalone exported HTML page of a Claude Design artifact I built to spec out the Table/Standings screen. **Open it and actually look at it (in a browser, not just as source) before you write the audit or the redesign proposal.** It contains three labeled artboards:

- **1a — mobile, light** (390×812): default state.
- **1b — mobile, dark** (390×812): zone-legend expanded and a table row opened, showing the extra-detail state.
- **1c — desktop** (1000px): sortable, full columns.

It's built on Kickoff's own palette, type, and "the data has a timestamp and a confidence" provenance posture — same header treatment, same competition colors pulled from `competitions.ts` — using live La Liga matchday-2 data as a placeholder dataset.

This means: **for the Table/Standings view specifically, the visual direction is already decided.** Don't give me 2-3 alternate directions for that screen — audit the current app's (nonexistent or placeholder) standings view against this design, and your Part 1 redesign directions for the rest of the app (fixtures list, overall shell) should stay coherent with whichever elements of this design carry over as the house style. Call out plainly anywhere your proposed direction(s) for the rest of the app would clash with this reference so I can reconcile them.

The artifact also embeds a few actual feature ideas beyond pure visual styling, worth carrying into Part 1's feature brainstorm as candidates rather than re-inventing:
- An expandable qualification-zone legend explaining each zone (Champions League, Europa, relegation, etc.) and how ties are broken per competition (e.g., "La Liga separates level clubs on head-to-head record first"), sourced from `competitions.ts` so the colors match the fixtures calendar.
- A "games in hand" callout ("Six clubs have a game in hand — sort by PPG to compare like with like") when the table has an uneven number of matches played.
- A home/away split view for the table (overall vs. venue-only standings), with the zone legend and form column suppressed on the split view since they only make sense for the overall table.
- Per-row expansion for extra detail on tap/click.
- A visible data-freshness indicator ("As of matchday 2 of 38 · synced 3h ago") consistent with the app's existing provenance/confidence posture.

Flag which of these are cheap to adopt now versus which are structural enough to defer to a later pass.

## Ground rules
- Audit and propose first. Don't do a silent rewrite — I want to see the plan and weigh in before big structural changes land.
- Leave betting/staking/EV logic and any data pipeline code untouched unless a UI change genuinely requires touching the file it lives in.
- **Persistent navigation between Fixtures and Table/Standings is a MUST-HAVE, non-negotiable requirement of this whole overhaul** — not a nice-to-have you can trade off in the redesign directions. Every direction you propose in Part 1, and whatever ships in Part 4, has to include it. See Part 4 for the specific pattern to match.
- When you're not sure whether a change is cosmetic vs. structural, say so and ask rather than guessing.

## Part 1 — UI/UX Audit & Overhaul Proposal
- Critique the current UI/UX honestly — where it's flat, generic, confusing, or just not fun to use. Screenshot or describe what you see at each route so I know you actually looked.
- Propose an overhaul aimed at "stunning" rather than "functional-but-plain": type, color, layout, motion, information hierarchy — the works. Give me **2-3 distinct visual directions** for the app overall (not just one), each with a short rationale, so I can pick a lane rather than getting one opinion presented as the only option. For Table/Standings, treat the design reference above as settled and show me how each direction would (or wouldn't) sit next to it.
- Propose feature ideas that would make me actually want to open this daily during a betting research session — not just fixtures/standings display, but things that make research faster or more enjoyable (e.g. surfacing which of today's matches have anchors on Kalshi/Polymarket, quick-glance status on unconfirmed fixtures, the standings-view ideas noted above, whatever else you notice is missing once you've used it).

## Part 2 — Code/Stack Efficiency & Pragmatic AI Integration
- Review the code for efficiency and modernity of the stack and dev experience — not test coverage, not scalability, not "what a team of 10 would need." I want it to be a stack that's fun for me to tinker in.
- Flag anything actively outdated (framework version, patterns, build tooling) worth upgrading, and why it'd improve DX specifically.
- Scope realistic AI features against a **free-tier API** (Gemini, Groq, OpenRouter free models, Cloudflare Workers AI, Hugging Face inference, local Ollama — research current free tiers, don't assume what you remember is still true). I'm not asking you to literally train an LLM from scratch — be the pragmatic voice here. Give me a short list of AI features ranked by (a) actually helps me win more or enjoy soccer more, vs (b) just technically impressive, and be explicit about which is which. A lightweight RAG over my own fixture/research history is a more plausible "yes" than "fine-tune a model" — tell me if I'm wrong.

## Part 3 — Free Hosting & Deployment Plan
- The only hard requirement: I can open a URL on my phone and it works. No urgency, no custom domain need, no enterprise uptime requirement.
- Research current (not stale) free-tier hosting options fitting this app's actual frontend/backend shape once you know it — Vercel/Netlify/Cloudflare Pages territory for static/frontend, and whatever's appropriate if there's a backend or persistence layer.
- Give me one clear recommendation plus a runner-up, and a rough outline of the deployment pipeline (how a future `git push` gets it live) — I don't need this built now, just a plan I can hand to a future session.

## Part 4 — Fix now: Fixtures ↔ Standings navigation
There's no way to get from the fixtures view to the Table/Standings view (or back), and I don't remember the route. This is not optional polish — it's the one must-fix, hard requirement of this session. Please:
1. Find the actual route/page for standings (or confirm it doesn't exist yet).
2. Add persistent navigation (header/nav bar, tabs, whatever fits the redesign direction from Part 1) so both pages are reachable from each other at all times. **Match the tab pattern already demonstrated in `Kickoff Standings.html`**: a persistent horizontal tab row (it shows Fixtures / Table / Results) with the active tab marked by an underline in the app's accent color, present identically on both the fixtures page and the Table/Standings page. If a "Results" view doesn't exist in the current app, just wire up Fixtures ↔ Table for now and note Results as a future tab rather than inventing it.
3. Tell me the URL/route directly so I'm not stuck rediscovering it again.

## Deliverables
1. A written audit (what's here now, what's wrong/missing).
2. The redesign proposal with 2-3 directions, reconciled against the Table/Standings design reference.
3. The stack/DX findings + AI feature shortlist with rationale.
4. The hosting recommendation + deployment outline.
5. The navigation fix, actually implemented and verified by running the app — confirm both directions (Fixtures→Table and Table→Fixtures) work and that the tab treatment matches the design reference.
6. A short call-out of any place the shipped Table/Standings implementation deviates from `Kickoff Standings.html`, and why.

Take your time and be thorough — I'd rather get a genuinely deep pass on this than a fast surface-level one.
