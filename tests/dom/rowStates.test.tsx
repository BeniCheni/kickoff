import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { FixtureRow } from '../../src/components/FixtureRow'
import { unsettledStatus } from '../../src/lib/schema'
import { rowStates, specimenRowProps } from '../fixtures/edgeFixtures'

for (const lens of ['poster', 'ledger'] as const) {
  it.each(rowStates)(`${lens} renders %s with the recorded state and score`, (_name, fixture, label) => {
    const { container } = render(<FixtureRow {...specimenRowProps(fixture)} lens={lens} />)
    const status = container.querySelector<HTMLElement>('.fixture-status')
    const score = container.querySelector<HTMLElement>('.fixture-score')
    const word = label === 'NEXT' && lens === 'ledger' ? '' : label
    expect(status?.textContent ?? '').toBe(word)
    if (unsettledStatus(fixture.status)) {
      expect(status?.dataset.voice).toBe('alarm')
      expect(container.textContent).not.toMatch(/\d:\d\d|local|prev\. day|next day|—/)
    }
    if (label === 'KICKED OFF') {
      expect(status?.dataset.voice).toBe('amber')
      expect(container.textContent).toMatch(/\d:\d\d/)
      expect(score?.textContent ?? '').toBe(fixture.id === 'stale' ? '1–0' : '')
      if (score) expect(score.dataset.voice).toBe('amber')
    }
    if (label === 'LIVE') expect(score?.dataset.voice).toBe('ink')
    if (['FT', 'AET', 'PENS'].includes(label)) expect(score?.dataset.voice).toBe('pitch')
  })
}

