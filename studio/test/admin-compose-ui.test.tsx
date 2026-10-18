import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { COPY } from '../copy.ts'
import { PER_JOB_CAP_USD, PREPAID_CEILING_USD, SESSION_CAP_USD } from '../caps.ts'
import { DRAFT } from '../shared/admin-copy.ts'
import type { ComposeDraft } from '../shared/compose.ts'
import type { ShellView } from '../shared/types.ts'
import { ComposeForm } from '../ui/app/compose.tsx'
import type { ComposeCatalog } from '../ui/app/api.ts'

const catalog: ComposeCatalog = {
  subjects: [{ id: 'fen', name: 'Fenway' }, { id: 'frank', name: 'Frankenstein' }],
  photos: [],
  keyframeModels: [{ id: 'edit', endpoint: 'openai/gpt-image-2/edit', pinnedOn: '2026-10-05' }],
  clipModels: [{ id: 'clip', endpoint: 'minimax/h3-max-turbo/image-to-video', pinnedOn: '2026-10-05' }],
  sessionSpendUsd: '0.000000',
  perJobCapUsd: PER_JOB_CAP_USD,
  sessionCapUsd: SESSION_CAP_USD,
  database: 'reachable',
}

const shell: ShellView = {
  transport: 'stub',
  host: '127.0.0.1',
  port: 5176,
  balance: null,
  session: null,
  caps: { perJobUsd: PER_JOB_CAP_USD, sessionUsd: SESSION_CAP_USD, prepaidCeilingUsd: PREPAID_CEILING_USD },
  database: 'reachable',
  outOfCredit: false,
}

const draft: ComposeDraft = {
  subjectId: 'fen',
  photoId: null,
  keyframeEndpoint: 'openai/gpt-image-2/edit',
  canvas: '16:10',
  prompts: { k0: '', k1: '', k2: '' },
  clipEndpoint: 'minimax/h3-max-turbo/image-to-video',
  frames: 'k0-k2',
  resolution: '480P',
  duration: 15,
  motion: '',
  seed: '',
  expansion: 'off',
}

describe('composer', () => {
  it('names the controls in D5 order and disables submit until there is a prompt', () => {
    const html = renderToStaticMarkup(
      <ComposeForm
        catalog={catalog}
        shell={shell}
        draft={draft}
        lines={[]}
        onDraft={() => undefined}
        onEstimate={() => undefined}
        onSubmit={() => undefined}
      />,
    )
    const names = [...html.matchAll(/>(Fenway|Frankenstein|16:10|16:9|K0 first · K2 last|K0 only|480P|768P|5 s|10 s|15 s|expansion off|balanced)</g)].map((match) => match[1])
    expect(names).toEqual([
      'Fenway', 'Frankenstein', '16:10', '16:9', 'K0 first · K2 last', 'K0 only',
      '480P', '768P', '5 s', '10 s', '15 s', 'expansion off', 'balanced',
    ])
    expect(html).toContain('for="c-kmodel"')
    expect(html).toContain('for="c-cmodel"')
    expect(html).toContain('for="c-k0"')
    expect(html).toContain('for="c-motion"')
    expect(html).toContain('aria-label="Seed"')
    expect(html).toContain(COPY.photos)
    expect(html).toContain(DRAFT.submitEmpty)
    expect(html).toContain('disabled=""')
    expect(html).not.toContain('to 14 Oct')
    expect(html).not.toContain('From 15 Oct')
  })

  it('disables submit when the database is paused', () => {
    const html = renderToStaticMarkup(
      <ComposeForm
        catalog={catalog}
        shell={{ ...shell, database: 'unavailable' }}
        draft={{ ...draft, motion: 'a fictional cat' }}
        lines={[{ outcome: 'estimate', usd: '0.375000', registryId: 'row', tag: 'DOCUMENTED' }]}
        onDraft={() => undefined}
        onEstimate={() => undefined}
        onSubmit={() => undefined}
      />,
    )
    expect(html).toContain(DRAFT.submitDatabase)
    expect(html).toContain('disabled=""')
  })
})
