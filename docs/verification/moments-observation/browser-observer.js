// Installed before the one navigation, in every frame. Only the parent owns DOM evidence.
(() => {
  if (window.top !== window) return
  const frames = new Set(), scripts = new Set()
  let firstFrame, firstParent
  const send = (kind, value) => window.__observationReport({ kind, value }).catch(() => {})
  window.addEventListener('moments-observation-hook-v1', event => send('hook', event.detail))
  document.addEventListener('click', event => {
    const button = event.target.closest?.('button')
    if (button) send('click', { text: button.textContent.trim(), label: button.getAttribute('aria-label'), queueId: button.dataset.queueId ?? null, at: performance.now() })
  }, true)
  const inspect = records => {
    for (const record of records) for (const added of record.addedNodes) {
      if (!(added instanceof Element)) continue
      for (const frame of [added, ...added.querySelectorAll('iframe')].filter(n => n.tagName === 'IFRAME')) frames.add(frame)
      for (const script of [added, ...added.querySelectorAll('script')].filter(n => n.tagName === 'SCRIPT')) {
        // The adapter's entry element; downstream loader scripts are network observations.
        if (script.hasAttribute('data-moments-youtube-api') || script.src === 'https://www.youtube.com/iframe_api') scripts.add(script)
      }
    }
    const frame = document.querySelector('iframe')
    if (!firstFrame && frame) { firstFrame = frame; firstParent = frame.parentElement }
    send('structure', { frames: frames.size, apiElements: scripts.size,
      parentChanged: !!firstFrame && firstFrame.parentElement !== firstParent,
      instanceDied: !!firstFrame && !firstFrame.isConnected })
  }
  new MutationObserver(inspect).observe(document, { subtree: true, childList: true })
  window.__observationSnapshot = () => {
    const frame = document.querySelector('iframe'), dialog = document.querySelector('[data-moments-player-dialog]')
    const rect = frame?.getBoundingClientRect()
    const visible = node => node.getClientRects().length > 0 && !node.closest('[hidden], [inert]')
    const clippedRect = node => {
      const r = node.getBoundingClientRect()
      const bounds = { left: Math.max(0, r.left), top: Math.max(0, r.top), right: Math.min(innerWidth, r.right), bottom: Math.min(innerHeight, r.bottom) }
      for (let parent = node.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent), clip = parent.getBoundingClientRect()
        if (/(hidden|clip|auto|scroll)/.test(style.overflowX || style.overflow)) { bounds.left = Math.max(bounds.left, clip.left); bounds.right = Math.min(bounds.right, clip.right) }
        if (/(hidden|clip|auto|scroll)/.test(style.overflowY || style.overflow)) { bounds.top = Math.max(bounds.top, clip.top); bounds.bottom = Math.min(bounds.bottom, clip.bottom) }
      }
      return bounds
    }
    const exposedFrame = frame && clippedRect(frame)
    const rows = [...document.querySelectorAll('[data-queue-id]')].filter(visible).map(row => {
      const r = row.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2
      const hit = document.elementFromPoint(x, y), exposedRow = clippedRect(row)
      return { id: row.dataset.queueId, active: row.getAttribute('aria-current'), visited: row.dataset.visited,
        rect: r.toJSON(), hitFrame: !!frame && hit === frame, inViewport: y >= 0 && y < innerHeight && x >= 0 && x < innerWidth,
        intersects: !!exposedFrame && Math.max(exposedFrame.left, exposedRow.left) < Math.min(exposedFrame.right, exposedRow.right) && Math.max(exposedFrame.top, exposedRow.top) < Math.min(exposedFrame.bottom, exposedRow.bottom) }
    })
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: innerHeight,
      placement: dialog?.dataset.placement ?? null, sameElement: !firstFrame || frame === firstFrame,
      parentChanged: !!firstFrame && firstFrame.parentElement !== firstParent,
      rows, primary: [...document.querySelectorAll('[data-primary-action]')].filter(visible).map(n => ({ tag: n.tagName, text: n.textContent.trim() })),
      status: [...document.querySelectorAll('[data-player-status], [data-recovery-copy]')].filter(visible).map(n => n.textContent),
      frame: frame ? { rect: rect.toJSON(), src: frame.getAttribute('src'), allow: frame.getAttribute('allow'),
        referrerpolicy: frame.getAttribute('referrerpolicy'), allowfullscreen: frame.hasAttribute('allowfullscreen') } : null }
  }
  let previous = ''
  const monitor = () => {
    const state = window.__observationSnapshot()
    const key = JSON.stringify([state.width, state.scrollWidth, state.parentChanged,
      state.rows.map(r => [r.id, r.active, r.intersects, r.hitFrame]), state.primary, state.status])
    if (key !== previous) { previous = key; send('dom', state) }
    requestAnimationFrame(monitor)
  }
  requestAnimationFrame(monitor)
})()
