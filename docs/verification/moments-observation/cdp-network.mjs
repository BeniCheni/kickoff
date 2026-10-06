// Browser-target Fetch owns every HTTP request and response in this fresh Chrome.
// A page-target interceptor loses subresource coverage when an OOPIF rejoins its parent;
// this owner survives frame/process changes. The session is Playwright's browser CDP
// session on its own pipe. Measured here, Fetch events for cross-site frames, nested
// frames, workers and the other loopback redirect kinds arrive on that session without a
// child session id and without Target.setAutoAttach; failing the paused response on the
// same session stops the redirect. Playwright retains DOM control only.
import { redirectLocation, cancelledInterception } from './redirect.ts'

// Playwright 1.62.1's client Error drops the JSON-RPC code, so the code is not observable
// here. The pipe protocol log for this exact message carried
// {"code":-32602,"message":"Invalid InterceptionId."} (6 Oct 2026), and that constant is
// supplied for that message only; at this layer the predicate is therefore the method and
// the exact message. Any other message keeps NaN and stops the run.
function exposedCdpError(error) {
  const text = String(error?.message ?? error)
  const match = text.match(/Protocol error \([^)]+\): (.*)$/)
  const message = match ? match[1] : text
  const code = message === 'Invalid InterceptionId.' ? -32602 : Number.NaN
  return { code, message }
}

export async function guardNetwork(browser, routeRequest, onRedirect, onFailure, pending) {
  const session = await browser.newBrowserCDPSession()
  const audit = []
  const track = promise => { pending.add(promise); promise.finally(() => pending.delete(promise)) }
  const send = async (method, params = {}) => {
    try { return await session.send(method, params) }
    catch (error) {
      const parsed = exposedCdpError(error)
      if (cancelledInterception(method, parsed.code, parsed.message)) {
        audit.push({ stage: 'cancelled-response', method, code: parsed.code, message: parsed.message })
        return {}
      }
      throw new Error(parsed.message)
    }
  }
  // The client session emits 'close' only for Target.detachedFromTarget, which a Chrome that
  // dies or is killed never sends. Measured on Playwright 1.62.1 and Chrome 154.0.8037.98:
  // SIGKILL on Chrome's main process fired the browser's 'disconnected' and nothing on the
  // session; session.detach() fired the session's 'close' only. Both report the loss.
  const lost = () => { onFailure(new Error('browser-network-guard-disconnected')) }
  session.on('close', lost)
  browser.on('disconnected', lost)
  session.on('Fetch.requestPaused', event => {
    audit.push({ url: event.request.url, frameId: event.frameId, stage: event.responseStatusCode === undefined ? 'request' : 'response', status: event.responseStatusCode })
    const task = (async () => {
      if (event.responseStatusCode !== undefined || event.responseErrorReason) {
        const location = redirectLocation(event.responseStatusCode ?? 0, event.responseHeaders ?? [])
        if (location !== null) {
          await send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'Aborted' })
          onRedirect({ url: event.request.url, status: event.responseStatusCode, location, action: 'aborted-before-follow', sessionId: event.sessionId ?? null })
        } else await send('Fetch.continueResponse', { requestId: event.requestId })
        return
      }
      const route = {
        request: () => ({ url: () => event.request.url, postData: () => event.request.postData ?? '', resourceType: () => event.resourceType.toLowerCase(), method: () => event.request.method,
          headers: () => Object.fromEntries(Object.entries(event.request.headers).map(([k, v]) => [k.toLowerCase(), v])) }),
        abort: () => send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'Aborted' }),
        continue: () => send('Fetch.continueRequest', { requestId: event.requestId }),
        fulfill: ({ contentType, body }) => send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: contentType }], body: Buffer.from(body).toString('base64') }),
      }
      await routeRequest(route)
    })().catch(onFailure)
    track(task)
  })
  await session.send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }, { urlPattern: '*', requestStage: 'Response' }] })
  return { close: () => { session.detach().catch(() => {}) }, audit }
}
