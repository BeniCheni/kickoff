// Standalone experiment: request native non-overlay Chrome scrollbars and measure the gutter.
// Refuses to claim classic-scrollbar coverage unless a positive gutter was actually measured.
// Usage: node pass2-scrollbars.mjs <playwright-module> <chrome> <dev-origin> <output-json>
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const [runtime, chrome, origin, output] = process.argv.slice(2);
const { chromium } = await import(runtime);
const browser = await chromium.launch({ executablePath: chrome, headless: true,
  ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--disable-features=OverlayScrollbar'] });
const context = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
const unexpected = [], errors = [], cells = [];
await context.route('**/*', route => {
  const url = new URL(route.request().url());
  if (!['localhost', '127.0.0.1', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) {
    unexpected.push(url.href); return route.abort();
  }
  return route.continue();
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
for (const width of [360,375,390,761,768,800,855,887,888,1000,1100,1160,1200,1250,1440,1920]) {
  for (const lens of ['ledger','poster','broadcast']) for (const theme of ['light','dark']) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${origin}/tests/harness/moments.html?tab=moments&lens=${lens}&theme=${theme}&scenario=selected`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector('[data-moments-stage-anchor]');
    const geometry = await page.evaluate(() => {
      const gallery = document.querySelector('.moments-gallery').getBoundingClientRect();
      const root = document.documentElement;
      return { innerWidth, clientWidth: root.clientWidth, scrollWidth: root.scrollWidth,
        gutter: innerWidth - root.clientWidth, galleryLeft: gallery.left, galleryRight: gallery.right,
        galleryWidth: gallery.width, minGutter: Math.min(gallery.left, root.clientWidth-gallery.right) };
    });
    cells.push({ width, lens, theme, ...geometry });
    assert.equal(geometry.scrollWidth, geometry.clientWidth, 'Actual no-horizontal-overflow invariant');
    assert(geometry.galleryLeft >= 0 && geometry.galleryRight <= geometry.clientWidth);
  }
}
const result = { browser: browser.version(), nativeScrollbarRequested: true,
  classicCells: cells.filter(c => c.gutter > 0).length, cells, errors, unexpected };
await fs.writeFile(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ browser: result.browser, cells: cells.length, classicCells: result.classicCells,
  gutterWidths: [...new Set(cells.map(c => c.gutter))], minGutter: Math.min(...cells.map(c => c.minGutter)), errors, unexpected }));
await browser.close();
assert.equal(errors.length + unexpected.length, 0);
