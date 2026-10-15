import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import Home from '../app/page'

test('the only page identifies itself as an unreleased scaffold', () => {
  const html = renderToStaticMarkup(<Home />)
  expect(html).toContain('unreleased scaffold')
  expect(html).toContain('It shows no fixtures.')
  expect(html).not.toMatch(/<video|<iframe|<img|v\d+\.\d+\.\d+/)
})
