// Stub-only loopback fixtures. No provider URL is ever a redirect Location.
const redirectScopes = ['top', 'same', 'cross', 'nested', 'firstsame', 'firstcross']
const redirectKinds = ['document', 'script', 'fetch', 'chain', 'meta', 'script-nav']
const resourceKinds = ['img', 'media', 'css', 'iframe', 'worker', 'sse', 'beacon']
export const redirectVariants = redirectScopes.flatMap(scope => redirectKinds.map(kind => `redirect-${scope}-${kind}`)).concat([301, 303, 307, 308].map(status => `redirect-status${status}-fetch`)).concat(['cross', 'firstcross'].flatMap(scope => resourceKinds.map(kind => `redirect-${scope}-${kind}`)))
export function fixtureURL(url, origin) {
  const u = new URL(url), local = new URL(origin)
  return u.port === local.port && (u.hostname === local.hostname || ['frame.s4a.test', 'nested.s4a.test'].includes(u.hostname)) && u.pathname.startsWith('/__s4a/')
}
export function serveFixture(request, response, origin, proof) {
  const u = new URL(request.url, `http://${request.headers.host}`)
  if (!u.pathname.startsWith('/__s4a/')) return false
  response.setHeader('Access-Control-Allow-Origin', '*')
  if (u.pathname === '/__s4a/landed') {
    proof.locationHits++; response.setHeader('Content-Type', 'text/javascript'); response.end('window.__s4aLanded = true'); return true
  }
  if (u.pathname === '/__s4a/redirect') {
    const location = u.searchParams.has('chain') ? '/__s4a/redirect' : '/__s4a/landed'
    response.writeHead(Number(u.searchParams.get('status') ?? 302), { Location: location }); response.end(); return true
  }
  const kind = u.searchParams.get('kind')
  const redirect = '/__s4a/redirect?status=' + (u.searchParams.get('status') ?? '302')
  let body = ''
  if (u.pathname === '/__s4a/nested') body = `<iframe src="http://nested.s4a.test:${new URL(origin).port}/__s4a/frame?kind=${kind}"></iframe>`
  else if (kind === 'script') body = `<script src="${redirect}"></script>`
  else if (kind === 'fetch' || kind === 'chain') body = `<script>setTimeout(() => fetch('${redirect}${kind === 'chain' ? '&chain=1' : ''}').catch(()=>{}), 50)</script>`
  else if (kind === 'document') body = `<script>location.href="${redirect}"</script>`
  else if (kind === 'img') body = '<img src="' + redirect + '">'
  else if (kind === 'media') body = '<video src="' + redirect + '" preload="auto" muted></video>'
  else if (kind === 'css') body = '<link rel="stylesheet" href="' + redirect + '">'
  else if (kind === 'iframe') body = '<iframe src="' + redirect + '"></iframe>'
  else if (kind === 'worker') body = "<script>const u = location.origin + '" + redirect + "'; new Worker(URL.createObjectURL(new Blob(['fetch(\"' + u + '\").catch(()=>{})'], { type: 'text/javascript' })))</script>"
  else if (kind === 'sse') body = "<script>try { new EventSource(location.origin + '" + redirect + "') } catch (e) {}</script>"
  else if (kind === 'beacon') body = "<script>navigator.sendBeacon(location.origin + '" + redirect + "', 'x')</script>"
  else if (kind === 'meta') body = '<meta http-equiv="refresh" content="0;url=/__s4a/landed">'
  else if (kind === 'script-nav') body = '<script>location.href="/__s4a/landed"</script>'
  response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><title>Loopback proof</title>' + body); return true
}
export async function runRedirectProbe(page, variant, origin, proof) {
  const [, scope, ...parts] = variant.split('-'), kind = parts.join('-')
  const host = ['same', 'top', 'firstsame'].includes(scope) ? new URL(origin).hostname : 'frame.s4a.test'
  const url = `http://${host}:${new URL(origin).port}/__s4a/${scope === 'nested' ? 'nested' : 'frame'}?kind=${kind}&status=${scope.startsWith('status') ? scope.slice(6) : '302'}`
  if (scope === 'top') await page.goto(url).catch(() => {})
  else await page.evaluate(url => { let frame = document.querySelector('iframe'); if (!frame) { frame = document.createElement('iframe'); document.body.append(frame) }; frame.src = url }, url)
  await page.waitForTimeout(2000).catch(() => {})
  proof.probeFinished = true
}
