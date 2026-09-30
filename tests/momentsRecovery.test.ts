import { describe, expect, it } from 'vitest'
import { blockedRecovery, nextSelectionSentence, timeoutRecovery, unavailableRecovery } from '../src/lib/momentsRecovery'

const recoveries = [blockedRecovery, timeoutRecovery, unavailableRecovery]
const doubled = /\.\.|\?\.|!\.|…\.|[.?!…][”’"')\]]+\./

describe('recovery copy', () => {
  it.each(['Ends.', 'Ends?', 'Ends!', 'Ends…', 'Ends.”', 'Seven. And all that noise.'])('D-18: %s keeps its own mark and gains none', title => {
    expect(nextSelectionSentence(title)).toBe(`Next opens “${title}”`)
    for (const recovery of recoveries) expect(recovery(title).body).not.toMatch(doubled)
  })

  it.each(['Match highlights from the archive', 'A moment from this fixture', 'Fictional selection 2', 'Trailing space '])('%s has no mark of its own, so the sentence is closed after the quotes', title => {
    expect(nextSelectionSentence(title)).toBe(`Next opens “${title}”.`)
    expect(blockedRecovery(title).body).toContain(`Next opens “${title}”. The official source is also available.`)
    expect(unavailableRecovery(title).body).toContain(`Next opens “${title}”. The official source is also available.`)
    expect(timeoutRecovery(title).body.endsWith(`Next opens “${title}”.`)).toBe(true)
  })

  it.each(['Ends.', 'Ends?', 'Match highlights from the archive', null])('every sentence in every recovery body has a boundary (%s)', title => {
    for (const recovery of recoveries) {
      const { heading, body } = recovery(title)
      expect(body).toMatch(/[.?!…][”’"')\]]*$/)
      expect(heading).toMatch(/[.?!]$/)
      // No quoted title runs straight into the next sentence.
      expect(body).not.toMatch(/[^.?!…]” [A-Z]/)
      expect(body).not.toMatch(doubled)
    }
  })

  it('names no next selection when there is none', () => {
    expect(nextSelectionSentence(null)).toBe('There is no next selection in this order.')
    expect(timeoutRecovery(null).body).not.toContain('Next opens')
  })
})
