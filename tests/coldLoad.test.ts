import { describe, expect, it } from 'vitest'
import { createColdLoad } from '../scripts/rendered-contrast.mjs'

const page = 'http://127.0.0.1:5174/?lens=poster&tab=fixtures'

describe('cold-load redirect hops', () => {
  it('counts one response once', () => {
    const log = createColdLoad()
    log.requestWillBeSent({ requestId: 'css', type: 'Stylesheet', request: { url: 'http://127.0.0.1:5174/app.css' } })
    log.responseReceived({ requestId: 'css', type: 'Stylesheet' })
    log.loadingFinished({ requestId: 'css', encodedDataLength: 100 })
    expect(log.tally(page)).toEqual({
      bytes: { fonts: 0, images: 0, script: 0, style: 100, other: 0 },
      hosts: [{ host: '127.0.0.1:5174', bytes: 100, count: 1 }],
      foreign: [],
    })
  })

  it('fails a third host that redirects home, and does not count the transfer twice', () => {
    const log = createColdLoad()
    log.requestWillBeSent({ requestId: 'css', type: 'Stylesheet', request: { url: 'https://cdn.example/app.css' } })
    log.requestWillBeSent({
      requestId: 'css',
      type: 'Stylesheet',
      request: { url: 'http://127.0.0.1:5174/app.css' },
      redirectResponse: { url: 'https://cdn.example/app.css', status: 302 },
    })
    log.responseReceived({ requestId: 'css', type: 'Stylesheet' })
    log.loadingFinished({ requestId: 'css', encodedDataLength: 480 })
    log.requestWillBeSent({ requestId: 'doc', type: 'Document', request: { url: page } })
    log.responseReceived({ requestId: 'doc', type: 'Document' })
    log.loadingFinished({ requestId: 'doc', encodedDataLength: 1200 })

    const tally = log.tally(page)
    expect(tally.foreign).toEqual(['cdn.example'])
    expect(tally.bytes).toEqual({ fonts: 0, images: 0, script: 0, style: 480, other: 1200 })
    expect(tally.hosts).toEqual([
      { host: '127.0.0.1:5174', bytes: 1680, count: 2 },
      { host: 'cdn.example', bytes: 0, count: 1 },
    ])
  })

  it('allows a font host to redirect to the other font host', () => {
    const log = createColdLoad()
    log.requestWillBeSent({ requestId: 'font', type: 'Stylesheet', request: { url: 'https://fonts.googleapis.com/css?family=Inter' } })
    log.requestWillBeSent({
      requestId: 'font',
      type: 'Stylesheet',
      request: { url: 'https://fonts.gstatic.com/s/inter.woff2' },
      redirectResponse: { url: 'https://fonts.googleapis.com/css?family=Inter', status: 302 },
    })
    log.responseReceived({ requestId: 'font', type: 'Font' })
    log.loadingFinished({ requestId: 'font', encodedDataLength: 2000 })
    const tally = log.tally(page)
    expect(tally.foreign).toEqual([])
    expect(tally.bytes).toEqual({ fonts: 2000, images: 0, script: 0, style: 0, other: 0 })
  })
})
