<!-- Thanks. Short is fine; true is required. CONTRIBUTING.md has the rules this asks about. -->

## What this changes

One paragraph: what moved, and why.

## How it was proved

- [ ] `npm run typecheck` and `npm test` green at every commit (real counts: __ files / __ tests)
- [ ] If `src/` or `index.css` changed: every lens × theme × tab at 360 / 375 / 390 / ~1000 px,
      `scrollWidth === innerWidth` asserted before every capture — say what you checked
- [ ] Behavioural change → a test where the logic is pure (extracted to `src/lib/` if it was inline)
- [ ] No data-honesty assertion weakened; no hand-edit under `src/data/`
- [ ] New dependency (runtime or Actions)? Say why below
- [ ] `[Unreleased]` in `CHANGELOG.md` updated if behaviour changed

## What was deliberately not done

Anything you saw and left alone, with the reason.
