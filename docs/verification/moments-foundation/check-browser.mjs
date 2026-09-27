// Use an already installed Playwright runtime; do not install a project dependency.
const [runtime, chrome, baseUrl, foundationUrl, output] = process.argv.slice(2);
if (!runtime || !chrome || !baseUrl || !foundationUrl || !output) throw new Error('Usage: node check-browser.mjs <playwright-module> <chrome-executable> <base-url> <foundation-url> <output-dir>');
const { chromium } = await import(runtime);
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root=output;
await fs.mkdir(root,{recursive:true});
const browser=await chromium.launch({executablePath:chrome,headless:true});
const requests=[], errors=[], cells=[];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const provider=host=>['youtube.com','youtube-nocookie.com','ytimg.com','googlevideo.com'].some(domain=>host===domain||host.endsWith('.'+domain));
for(const build of ['base','foundation']) {
 const context=await browser.newContext({deviceScaleFactor:1,reducedMotion:'reduce'});
 await context.addInitScript(()=>{
   const Original=Date; const now=Date.parse('2026-09-27T02:40:00Z');
   globalThis.Date=class extends Original { constructor(...args){ super(...(args.length?args:[now])); } static now(){return now;} };
 });
 await context.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(!['127.0.0.1','localhost'].includes(url.hostname)) {
     requests.push({build,url:url.href,mediaProvider:provider(url.hostname)});
     if(provider(url.hostname)||!['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)) return route.abort();
   }
   return route.continue();
 });
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push({build,message:e.message}));
 page.on('requestfailed',r=>{ if(!r.url().startsWith('http://127.0.0.1')) requests.push({build,url:r.url(),failed:r.failure()?.errorText}); });
 const origin=build==='base'?baseUrl:foundationUrl;
 await page.goto(origin);
 for(const width of [360,375,390,1000]) for(const lens of ['ledger','poster','broadcast']) for(const theme of ['light','dark']) for(const tab of ['fixtures','table','moments']) {
   await page.setViewportSize({width,height:width===1000?900:844});
   await page.evaluate(t=>{localStorage.setItem('kickoff-theme',t);localStorage.setItem('kickoff-theme-broadcast',t);},theme);
   await page.goto(`${origin}/?lens=${lens}&tab=${tab}&date=2026-09-26`);
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(({lens,theme,tab})=>document.documentElement.dataset.lens===lens&&document.documentElement.dataset.theme===theme&&[...document.querySelectorAll('[aria-current="page"]')].some(e=>e.textContent.toLowerCase()===tab),{lens,theme,tab});
   const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,mediaElements:document.querySelectorAll('iframe,video,audio').length,text:document.body.innerText}));
   if(geometry.width!==geometry.scrollWidth||geometry.mediaElements) throw new Error(JSON.stringify({build,width,lens,theme,tab,geometry}));
   const name=`${width}-${lens}-${theme}-${tab}`;
   const bytes=await page.screenshot({path:`${root}/${build}-${name}.png`,fullPage:true,animations:'disabled'});
   cells.push({build,name,width,lens,theme,tab,scrollWidth:geometry.scrollWidth,mediaElements:geometry.mediaElements,screenshotSha256:hash(bytes),textSha256:hash(geometry.text)});
 }
 await context.close();
}
const compared=cells.filter(c=>c.build==='foundation').map(c=>{
 const base=cells.find(b=>b.build==='base'&&b.name===c.name);
 return {...c,identicalScreenshot:c.screenshotSha256===base.screenshotSha256,identicalText:c.textSha256===base.textSha256};
});
const result={browser:browser.version(),dateUtc:new Date().toISOString(),clockFixedAt:'2026-09-27T02:40:00Z',requests,errors,cells,compared};
await fs.writeFile(`${root}/matrix.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({browser:result.browser,cells:compared.length,identicalScreenshots:compared.filter(c=>c.identicalScreenshot).length,identicalText:compared.filter(c=>c.identicalText).length,mediaProviderRequests:requests.filter(r=>r.mediaProvider).length,externalRequests:requests.length,errors,mismatches:compared.filter(c=>!c.identicalScreenshot).map(c=>c.name)}));
await browser.close();
if(errors.length||requests.some(r=>r.mediaProvider)||compared.some(c=>!c.identicalScreenshot||!c.identicalText)) process.exitCode=1;
