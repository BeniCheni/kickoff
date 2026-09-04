import { it, expect } from 'vitest'

// Probe for the v0.2.2 review (PR #15, human-review item 1). This PR exists so that
// `gh pr merge --squash --auto` can be run against a PR whose required `verify` check is
// deliberately red — a BLOCKED PR — on this repo, with its "Allow auto-merge" setting as it
// is, and the exact response recorded. Never to be merged; closed and deleted by the review.
it('fails on purpose so that verify is red and the PR is blocked', () => {
  expect('verify').toBe('red')
})
