// Browser-target Fetch owns every HTTP request and response in this fresh Chrome.
// A page-target interceptor loses subresource coverage when an OOPIF rejoins its parent;
// this owner survives frame/process changes. Playwright retains DOM control only.
import fs from 'node:fs/promises'
import path from 'node:path'
import { redirectLocation, cancelledInterception } from './redirect.ts'
export async function guardNetwork(profile, routeRequest, onRedirect, onFailure, pending) {
  const [port, endpoint] = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).trim().split('\n')
  const socket = new WebSocket(`ws://127.0.0.1:${port}${endpoint}`)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  let serial = 0
  const replies = new Map(), audit = []
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++serial; replies.set(id, { resolve, reject, method }); socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
  })
  const track = promise => { pending.add(promise); promise.finally(() => pending.delete(promise)) }
  socket.addEventListener('close', () => { onFailure(new Error('browser-network-guard-disconnected')); for (const reply of replies.values()) reply.reject(new Error('CDP connection closed')); replies.clear() })
  socket.addEventListener('message', message => {
    const event = JSON.parse(message.data)
    if (event.method === 'Fetch.requestPaused') audit.push({ url: event.params.request.url, frameId: event.params.frameId, stage: event.params.responseStatusCode === undefined ? 'request' : 'response', status: event.params.responseStatusCode })
    if (event.id) {
      const reply = replies.get(event.id); replies.delete(event.id)
      if (event.error && reply && cancelledInterception(reply.method, event.error.code, event.error.message)) {
        audit.push({ stage: 'cancelled-response', method: reply.method, code: event.error.code, message: event.error.message }); reply.resolve({})
      } else if (event.error) reply?.reject(new Error(event.error.message)); else reply?.resolve(event.result)
      return
    }
    if (event.method === 'Fetch.requestPaused') {
      const e = event.params, sessionId = event.sessionId
      const task = (async () => {
        if (e.responseStatusCode !== undefined || e.responseErrorReason) {
          const location = redirectLocation(e.responseStatusCode ?? 0, e.responseHeaders ?? [])
          if (location !== null) {
            await send('Fetch.failRequest', { requestId: e.requestId, errorReason: 'Aborted' }, sessionId)
            onRedirect({ url: e.request.url, status: e.responseStatusCode, location, action: 'aborted-before-follow', sessionId })
          } else await send('Fetch.continueResponse', { requestId: e.requestId }, sessionId)
          return
        }
        const route = {
          request: () => ({ url: () => e.request.url, postData: () => e.request.postData ?? '', resourceType: () => e.resourceType.toLowerCase(), method: () => e.request.method,
            headers: () => Object.fromEntries(Object.entries(e.request.headers).map(([k,v]) => [k.toLowerCase(), v])) }),
          abort: () => send('Fetch.failRequest', { requestId: e.requestId, errorReason: 'Aborted' }, sessionId),
          continue: () => send('Fetch.continueRequest', { requestId: e.requestId }, sessionId),
          fulfill: ({ contentType, body }) => send('Fetch.fulfillRequest', { requestId: e.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: contentType }], body: Buffer.from(body).toString('base64') }, sessionId),
        }
        await routeRequest(route)
      })().catch(onFailure)
      track(task)
    }
  })
  await send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }, { urlPattern: '*', requestStage: 'Response' }] })
  return { close: () => socket.close(), audit }
}
