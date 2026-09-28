// Reuses an existing external Playwright installation. No install or provider access.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const [runtime, chrome, origin, output] = process.argv.slice(2);
if (!output) throw new Error('Usage: node check-gallery.mjs <playwright-module> <chrome> <dev-origin> <output-dir>');
const { chromium } = await import(runtime);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const context = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
const requests = [], errors = [], cells = [], interactions = [], shots = [];
const provider = host => ['youtube.com','youtu.be','youtube-nocookie.com','ytimg.com','googlevideo.com','ggpht.com'].some(d => host === d || host.endsWith('.' + d));
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
    const mediaProvider = provider(url.hostname);
    const unexpected = !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
    requests.push({ url: url.href, mediaProvider, unexpected });
    if (mediaProvider || unexpected) return route.abort();
  }
  return route.continue();
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('requestfailed', r => requests.push({ url: r.url(), failed: r.failure()?.errorText }));
async function load(scenario = 'gallery', width = 390, lens = 'poster', theme = 'light') {
  await page.setViewportSize({ width, height: width <= 390 ? 844 : width <= 888 ? 1024 : 900 });
  await page.goto(`${origin}/tests/harness/moments.html?tab=moments&lens=${lens}&theme=${theme}&scenario=${scenario}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(({lens,theme}) => document.documentElement.dataset.lens === lens && document.documentElement.dataset.theme === theme && !!document.querySelector('main'), {lens,theme});
}
const visit = () => page.locator('[data-visit-state]').textContent().then(JSON.parse);
const click = name => page.getByRole('button', {name, exact: true}).click();
async function filters() { const d = page.locator('.moments-filters'); if (await d.getAttribute('open') === null) await d.locator('summary').click(); }
async function measure() {
  return page.evaluate(() => {
    const rect = selector => { const el = document.querySelector(selector); if (!el) return null; const r = el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}; };
    const main = document.querySelector('main');
    const overflowing = [...document.querySelectorAll('body *')].find(el => {
      const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'absolute';
    });
    const small = [...(main?.querySelectorAll('*') ?? [])].filter(el => el.getClientRects().length && !el.closest('svg') && !el.closest('details:not([open]) > :not(summary)') && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 10).map(el => ({tag:el.tagName,text:el.textContent,size:getComputedStyle(el).fontSize}));
    return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,mainTop:main?.getBoundingClientRect().top ?? null,
      firstOverflow: overflowing ? {tag:overflowing.tagName,class:overflowing.className} : null,
      anchor:rect('[data-moments-stage-anchor]'),list:rect('[data-moments-list]'),
      leadTitle:rect('[data-lead] h2'),leadSource:rect('[data-lead] [data-source-line]'),leadAction:rect('[data-lead] [data-primary-action]'),
      media:document.querySelectorAll('iframe,video,audio').length,small,
      version:document.querySelector('header')?.innerText.includes('V0.5.2'),
      header:rect('header'),nav:rect('nav'),activeTab:rect('nav [aria-current=page]')};
  });
}
async function hitTest() {
  // Open disclosures so hidden named controls participate, then scroll each real target.
  while (await page.locator('main details:not([open]) > summary').count()) await page.locator('main details:not([open]) > summary').first().click();
  return page.evaluate(() => {
    const result = [];
    for (const el of document.querySelectorAll('main [data-moment-card], main [data-queue-id], button, a, input, select, summary')) {
      if (!el.getClientRects().length || el.closest('[data-harness-tools]')) continue;
      el.scrollIntoView({block:'center'});
      const r = el.getBoundingClientRect();
      const y = Math.max(1, Math.min(innerHeight - 1, r.top + r.height / 2));
      const points = [.1,.5,.9].map(f => {
        const x = r.left + r.width * f; const hit = document.elementFromPoint(x,y);
        return !!hit && (hit === el || el.contains(hit));
      });
      result.push({tag:el.tagName,name:el.getAttribute('aria-label') || el.textContent.trim().slice(0,90),points});
    }
    return result;
  });
}
const wantedShots = new Set([
 '390-ledger-light-gallery','390-poster-light-gallery','360-broadcast-dark-gallery',
 '888-poster-light-selected','887-poster-light-selected','768-broadcast-dark-selected',
 '1440-broadcast-dark-selected','390-poster-light-spoiler-light','390-poster-light-save-refused',
 '1000-poster-light-failed-unsave','390-poster-light-no-results','1000-ledger-light-fictional',
 '390-poster-light-empty',
]);
let failure;
try {
  for (const width of [360,375,390,761,768,800,855,887,888,1000,1100,1160,1250,1440,1920]) {
    for (const lens of ['ledger','poster','broadcast']) for (const theme of ['light','dark']) {
      for (const scenario of ['gallery','selected','empty','no-results','spoiler-light','save-refused','failed-unsave','fictional']) {
        await load(scenario,width,lens,theme);
        if (['save-refused','failed-unsave'].includes(scenario)) await page.locator('[data-lead] [data-save]').click();
        // Restore the top after action auto-scrolling before fold measurements/capture.
        await page.evaluate(() => scrollTo(0,0));
        const name = `${width}-${lens}-${theme}-${scenario}`;
        const geometry = await measure();
        assert.equal(geometry.scrollWidth,width,`${name}: overflow ${JSON.stringify(geometry.firstOverflow)}`);
        assert.equal(geometry.media,0,name);
        assert(geometry.version,`${name}: app marker/version missing`);
        if (scenario !== 'empty') assert.deepEqual(geometry.small,[],`${name}: font floor`);
        if (geometry.anchor) {
          const {anchor:a,list:l} = geometry;
          assert(Math.abs(a.height-a.width*9/16)<1,`${name}: 16:9`);
          if (width < 888) assert(l.y>=a.bottom,`${name}: stack`);
          else { assert(a.width>=480 && a.height>=270,`${name}: minimum stage size`); assert(l.x>=a.right && Math.abs(l.y-a.y)<1,`${name}: side by side`); }
        }
        if (width<=390 && scenario==='gallery') for (const key of ['leadTitle','leadSource','leadAction']) assert(geometry[key]?.bottom<=844,`${name}: ${key} beyond fold`);
        if (wantedShots.has(name)) {
          await page.setViewportSize({width,height:width<=390?844:width<=888?1024:900});
          const bytes=await page.screenshot({path:`${output}/${name}.png`,fullPage:true,animations:'disabled'});
          shots.push({name,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
        }
        const hits = await hitTest();
        assert(hits.every(h=>h.points.every(Boolean)),`${name}: hit failure ${JSON.stringify(hits.filter(h=>h.points.some(x=>!x)))}`);
        cells.push({name,width,lens,theme,scenario,geometry,hits});
      }
    }
    await fs.writeFile(`${output}/progress.json`,JSON.stringify({completed:cells.length,lastWidth:width}));
    console.log(`Gallery matrix: ${cells.length}/720 cells, through ${width}px`);
  }
  // D-17: every Save/Unsave attempt, both surfaces, every requested width and theme/lens.
  for (const width of [360,390,768,1000,1440]) for (const lens of ['ledger','poster','broadcast']) for (const theme of ['light','dark']) for (const surface of ['gallery','selected']) {
    await load(surface,width,lens,theme);
    const actions = page.locator(surface==='gallery'?'[data-lead] .moments-actions':'.moments-stage-main .moments-actions');
    const boxes = () => actions.evaluate(el => [...el.querySelectorAll('[data-save],[data-primary-action]')].map(e => {const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
    const save = actions.locator('[data-save]');
    for (const refused of [false,true]) {
      if (refused) await click('Refuse storage writes');
      for (let i=0;i<2;i++) {
        await save.scrollIntoViewIfNeeded();
        const before=await boxes(); await save.click(); const after=await boxes();
        before.forEach((b,j)=>Object.keys(b).forEach(k=>assert(Math.abs(b[k]-after[j][k])<=1,`D-17 ${width}/${lens}/${theme}/${surface}/${refused}: ${k}`)));
        const label=await save.textContent(), name=await save.getAttribute('aria-label'); assert(name.includes(label));
        assert.equal(await page.locator('[role=status]').evaluateAll(els=>els.filter(e=>e.textContent.trim()).length),1);
      }
    }
    interactions.push({id:'D-17/19',width,lens,theme,surface,attempts:4,pass:true});
  }
  // Keyboard: native Tab and Enter from page entry; inspect actual focused controls.
  await load('gallery'); const focusTrail=[];
  for(let i=0;i<30;i++) {
    await page.keyboard.press('Tab');
    const focus=await page.evaluate(()=>({text:document.activeElement.textContent,tag:document.activeElement.tagName,primary:document.activeElement.hasAttribute('data-primary-action')}));
    focusTrail.push(focus); if(focus.primary) break;
  }
  assert(focusTrail.at(-1)?.primary,'Keyboard reaches lead action');
  await page.keyboard.press('Enter'); await page.locator('[data-moments-stage-anchor]').waitFor();
  await page.keyboard.press('Tab'); assert.equal(await page.evaluate(()=>document.activeElement.tagName),'A');
  await page.keyboard.press('Tab'); assert(await page.evaluate(()=>document.activeElement.hasAttribute('data-save')));
  await page.keyboard.press('Space'); assert.equal(await page.locator('[data-save]').getAttribute('aria-pressed'),'true');
  await filters(); await page.getByLabel('Competition',{exact:true}).focus();
  const filterTrail=[];
  for(let i=0;i<5;i++) { filterTrail.push(await page.evaluate(()=>({tag:document.activeElement.tagName,type:document.activeElement.type,label:document.activeElement.closest('label')?.textContent}))); await page.keyboard.press('Tab'); }
  assert.deepEqual(filterTrail.map(x=>x.tag),['SELECT','SELECT','SELECT','INPUT','INPUT']);
  interactions.push({id:'keyboard',focusTrail,filterTrail,pass:true});
  // H-B: shared geometry and underline in every tab, including the 1160–1250 band.
  for(const width of [1160,1200,1250]) for(const lens of ['ledger','poster','broadcast']) for(const theme of ['light','dark']) {
    await load('gallery',width,lens,theme); let prior;
    for(const tab of ['Fixtures','Table','Moments']) {
      await click(tab); const g=await measure();
      assert.equal(g.scrollWidth,width); assert(Math.abs(g.activeTab.bottom-(g.nav.bottom-1.5))<=1);
      if(prior) assert.deepEqual(g.header,prior); prior=g.header;
      interactions.push({id:'H-B',width,lens,theme,tab,header:g.header,nav:g.nav,active:g.activeTab,pass:true});
    }
  }
  assert.deepEqual(errors,[]); assert(!requests.some(r=>r.mediaProvider||r.unexpected||r.failed));
} catch (error) { failure=error.stack; console.error(failure); }
finally {
  const receipt={browser:browser.version(),runtime,chrome,origin,dateUtc:new Date().toISOString(),cells,interactions,shots,requests,errors,failure};
  await fs.writeFile(`${output}/gallery-receipt.json`,JSON.stringify(receipt,null,2));
  await browser.close();
}
if(failure) process.exitCode=1;
else console.log(JSON.stringify({cells:cells.length,interactions:interactions.length,shots:shots.length,mediaProviderRequests:requests.filter(r=>r.mediaProvider).length,errors}));
