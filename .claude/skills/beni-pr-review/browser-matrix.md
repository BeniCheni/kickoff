# The browser matrix — methods that already work here

The repo drives its own dev server (`.claude/launch.json` → `kickoff-dev`, `npm run dev`,
port 5173) through the browser pane's JavaScript tool. No Playwright, no new dependency.
Everything below was learned the expensive way in the v0.1.0 and v0.2.0 reviews.

## The cells

3 lenses (`ledger`, `poster`, `broadcast`) × 2 themes × 2 tabs (`fixtures`, `table`) at
**360, 375, 390 and ~1000 px** = 48 cells. Lens and tab are URL state (`?lens=poster&tab=table`);
theme is the toggle (or storage: `kickoff-theme`, `kickoff-theme-broadcast`).

Six 390 px captures (lens × theme, Fixtures tab) go in the PR when anything visual changed.
Nothing is committed under `docs/screenshots/` unless the originals were wrong.

## Set the viewport before anything else

`resize_window` to the width **before** any capture or measurement. A clipped capture once cost
a review pass proving a non-bug. Then, on every screen:

```js
document.documentElement.scrollWidth === window.innerWidth
```

Assert it; don't admire the screenshot. `scrollWidth` lays out on demand whether or not
anything paints, so it works while the pane is hidden.

## The pane can be hidden — and `requestAnimationFrame` never fires in a hidden document

A rAF-based wait hangs to the tool timeout and looks like a stuck renderer. Settle React with
`MessageChannel` ticks (its own scheduler primitive, unthrottled):

```js
await new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0) })
```

Run three or four of those after any state change before measuring.

## CSS transitions never advance while `visibilityState === 'hidden'`

Computed styles read mid-transition indefinitely, which looks exactly like a broken cascade.
Flush before reading:

```js
document.getAnimations().forEach((a) => { if (a.effect?.getTiming?.().iterations !== Infinity) a.finish() })
```

(skip the infinite ticker marquee), or measure on fresh loads. After a lens switch, wait ~450 ms
before a capture or the 220 ms cross-fade is in the shot.

## Driving the clock

Inject a `Date` subclass carrying an offset through a `<script>` element so it runs in the page
world, then reach the app's own clock instance by the exact URL Vite served it under:

```js
// 1. shim (page world)
const s = document.createElement('script')
s.textContent = `
  (() => { const Real = Date; let off = 0;
    class D extends Real { constructor(...a) { a.length ? super(...a) : super(Real.now() + off) }
      static now() { return Real.now() + off } }
    D.__setOffset = (ms) => { off = ms }; window.Date = D })()`
document.head.appendChild(s)

// 2. the app's clock module, not a fresh one
const url = performance.getEntriesByType('resource').map((e) => e.name).find((n) => /\/src\/lib\/clock\.ts/.test(n))
const clock = await import(url)
clock.clock.subscriberCount() > 0   // must be true, or you hold a copy the app never reads

// 3. move time, then the catch-up signal
Date.__setOffset(25 * 3600 * 1000)
window.dispatchEvent(new Event('focus'))
```

Then settle (MessageChannel) and read the DOM. `subscriberCount()` on Ledger/Broadcast
fixtures has read 4, on Poster and the Table 3; it must return to the same number after lens
switches and tab flips — StrictMode's double subscribe must leave nothing behind.

## URL state without navigating

`history.replaceState(null, '', '?date=2026-09-12')` then
`window.dispatchEvent(new PopStateEvent('popstate'))` — the shim survives, a navigation would
not.

## What to read, not what to look at

- Colour claims: `getComputedStyle(el).color` / `backgroundColor` and a contrast computation
  over every new pair, in both themes. Amber is light in both themes; be suspicious of anything
  set on it.
- Hot rows: `[data-hot='true']`; the ticker's NEXT: the `.ticker-track` text; the banner: its
  presence and first bold word.
- The header stamp: `v<version> · N fixtures · synced …` — the version comes from
  `package.json` through Vite's `define`.

## Latent paths

The snapshot has zero postponed, cancelled or in-play fixtures. To see those branches in a
browser you stub a row in a local, uncommitted copy of `src/data/fixtures.json` and revert —
never commit hand-edited data. Unit tests with fabricated fixtures are the durable coverage.

## Zero-slack points

The lens switcher once "fit 390 px" with zero pixels of slack and broke at ≤374 — including
360, the most common Android width. Know where the zero-slack points are; that is why 360 is
in the matrix.
