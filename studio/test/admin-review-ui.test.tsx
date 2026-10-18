import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CHECKLIST_RULE } from '../shared/review.ts'
import { ReviewChecklist } from '../ui/app/review.tsx'

describe('review checklist', () => {
  it('keeps Keep out of the tab order until every answer is Clear', () => {
    const disabled = renderToStaticMarkup(
      <ReviewChecklist
        answers={{ 'extra-players': 'clear', 'text-on-boards': 'present', soundtrack: 'unsure' }}
        onAnswer={() => undefined}
        onKeep={() => undefined}
        onDiscard={() => undefined}
      />,
    )
    expect(disabled).toContain('Keep is unavailable: 1 Present, 1 Unsure, 2 unanswered.')
    expect(disabled).toContain('disabled=""')
    expect(disabled).toContain(CHECKLIST_RULE)
    expect(disabled).toContain('Extra players or officials')
    expect(disabled).toContain('The soundtrack')
    const enabled = renderToStaticMarkup(
      <ReviewChecklist
        answers={{
          'extra-players': 'clear',
          'text-on-boards': 'clear',
          'logo-like-marks': 'clear',
          'subject-identity': 'clear',
          soundtrack: 'clear',
        }}
        onAnswer={() => undefined}
        onKeep={() => undefined}
        onDiscard={() => undefined}
      />,
    )
    expect(enabled).not.toContain('disabled=""')
  })
})
