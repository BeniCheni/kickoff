// Independent base-build reproduction. Run against 11845cb's default dist-acceptance.
import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'
import assert from 'node:assert/strict'
import { dnsGuard, providerHost, apiUrl } from './policy.ts'
const [runtime, chrome, distArg, stubArg, out] = process.argv.slice(2)
const dist = await fs.realpath(distArg), stub = await fs.readFile(stubArg, 'utf8')
await fs.mkdir(out)
const server = http.createServer(async (req,res) => {
  try { const u = new URL(req.url,'http://localhost');const file = path.resolve(dist, '.'+(u.pathname==='/'?'/index.html':u.pathname)); assert(file.startsWith(dist + path.sep)); res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await fs.readFile(file)) } catch { res.writeHead(404);res.end() }
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const {chromium}=await import(runtime)
const browser=await chromium.launch({executablePath:chrome,headless:true,chromiumSandbox:true,args:[dnsGuard]})
const result={applicationSha:'11845cb21cfd0e87a1105e37e7b74e348739541c',browser:browser.version(),port:server.address().port,providerContinuations:0,cells:[]}
try {
for(const transparent of [false,true]) for(const width of [390,1000,360]) {
 const context=await browser.newContext({viewport:{width,height:width===1000?900:844},reducedMotion:'reduce',serviceWorkers:'block'})
 const handled=new WeakSet(),escaped=[]
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());if(providerHost(u.hostname)){handled.add(req);if(u.href===apiUrl)return route.fulfill({contentType:'text/javascript',body:stub});if(u.hostname==='www.youtube-nocookie.com'&&/^\/embed\/S4Accept00[12]$/.test(u.pathname))return route.fulfill({contentType:'text/html',body:`<!doctype html><body style="background:${transparent?'transparent':'#234'}">${transparent?'':'Synthetic frame'}</body>`});return route.abort()}
  if(u.origin!==origin&&!['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname))return route.abort();return route.continue()
 })
 context.on('response',r=>{if(providerHost(new URL(r.url()).hostname)&&!handled.has(r.request()))escaped.push(r.url())})
 const page=await context.newPage();await page.goto(origin+'/?tab=moments&lens=ledger');await page.evaluate(()=>document.fonts.ready)
 const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))
 const click=async name=>{const b=page.getByRole('button',{name,exact:typeof name==='string'});await b.scrollIntoViewIfNeeded();await settle();await b.click();await settle()}
 await page.locator('[data-lead]').getByRole('button',{name:/Open selection/}).click();await click('Play');await page.getByRole('button',{name:'Pause',exact:true}).waitFor()
 const probe=()=>page.evaluate(()=>{
  const f=document.querySelector('iframe'),r=f.getBoundingClientRect();const points=[[.5,.5],[.35,.35],[.65,.35],[.35,.65],[.65,.65]];const name=n=>n?`${n.tagName.toLowerCase()}${n.className?'.'+String(n.className).replaceAll(' ','.'):''}`:null
  return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,rect:r.toJSON(),hits:points.map(([x,y])=>name(document.elementFromPoint(r.x+r.width*x,r.y+r.height*y))),stack:[f.parentElement,document.querySelector('dialog'),document.querySelector('[data-moments-cinema-slot]')].filter(Boolean).map(n=>({node:name(n),position:getComputedStyle(n).position,zIndex:getComputedStyle(n).zIndex,background:getComputedStyle(n).backgroundColor}))}
 })
 await page.locator('iframe').scrollIntoViewIfNeeded();await settle();const stage=await probe();assert(stage.hits.every(x=>x==='iframe'))
 await click('Enter Cinema');const cinema=await probe();assert(cinema.hits.every(x=>x!=='iframe'));assert.equal(cinema.scrollWidth,width)
 if(!transparent)await page.screenshot({path:path.join(out,`base-cinema-${width}.png`)})
 await page.locator('[data-moments-cinema-slot] .moments-cover').evaluate(n=>n.style.visibility='hidden');const coverHidden=await probe();assert(coverHidden.hits.every(x=>x==='div.moments-cinema-slot'))
 assert.deepEqual(escaped,[]);result.cells.push({transparent,width,stage,cinema,coverHidden});await context.close()
}
} finally {await browser.close();await new Promise(r=>server.close(r));await fs.writeFile(path.join(out,'base-cinema.json'),JSON.stringify(result,null,2))}
console.log(JSON.stringify({cells:result.cells.length,providerContinuations:0,port:result.port}))
