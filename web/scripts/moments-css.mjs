import assert from 'node:assert/strict'
import postcss from 'postcss'

/** Walks rules inside every at-rule and checks each selector-list member. */
export const MOMENTS_KEYFRAMES = [
  'moments-card-enter',
  'moments-reaction-burst',
  'moments-reaction-particle',
  'moments-countdown-ring',
  'moments-comment-in',
  'moments-count-tick',
]
const KEYFRAME_PROPS = new Set(['transform', 'opacity', 'stroke-dashoffset'])
export const VIEW_TRANSITION_SELECTORS = new Set([
  '::view-transition-group(*)',
  '::view-transition-old(root)',
  '::view-transition-new(root)',
  '::view-transition-old(moments)',
  '::view-transition-new(moments)',
])
const ALLOWED_TIME = /^(?:0s|30ms|150ms|180ms|220ms|400ms|5s)$/

export function assertMomentsScope(css) {
  const sheet = postcss.parse(css)
  sheet.walkRules(rule => {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return
    for (const selector of postcss.list.comma(rule.selector)) {
      if (VIEW_TRANSITION_SELECTORS.has(selector.trim())) continue
      // The optional lens ancestor is the only outer scope used by this sheet.
      assert.match(selector, /^(?:\[data-lens=["'](?:ledger|poster|broadcast)["']\]\s+)?\.moments-gallery(?:$|[\s.#:\[])/, `Moments selector is not scoped: ${selector}`)
      assert.ok(!/[+~]/.test(selector), `Moments selector escapes through a sibling: ${selector}`)
    }
  })
}

/** The Moments sheet may animate only the named list, on transform, opacity, or the ring. */
export function assertMomentsMotion(css) {
  const sheet = postcss.parse(css)
  const found = new Set()
  sheet.walkAtRules(rule => {
    if (!/keyframes$/i.test(rule.name)) return
    assert.ok(MOMENTS_KEYFRAMES.includes(rule.params), `Moments keyframes are not on the allowlist: ${rule.params}`)
    found.add(rule.params)
    rule.walkDecls(decl => {
      assert.ok(KEYFRAME_PROPS.has(decl.prop), `Moments keyframe uses ${decl.prop}`)
    })
  })
  assert.deepEqual([...found].sort(), [...MOMENTS_KEYFRAMES].sort(), 'Moments keyframes must be exactly the allowlist')
  sheet.walkDecls(decl => {
    if (decl.parent?.type === 'atrule' && /keyframes$/i.test(decl.parent.name)) return
    if (!/^(?:animation|transition)(?:-|$)/i.test(decl.prop)) return
    const value = decl.value.replace(/\s*!important\s*$/, '').trim()
    if (value === 'none') return
    if (decl.prop === 'animation-play-state') {
      assert.ok(value === 'paused' || value === 'running', decl.value)
      return
    }
    if (decl.prop === 'animation-fill-mode' || decl.prop === 'animation-timing-function' || decl.prop === 'transition-timing-function') return
    if (decl.prop === 'animation-duration' || decl.prop === 'transition-duration') {
      assert.ok(ALLOWED_TIME.test(value), `Moments duration is not on the allowlist: ${value}`)
      return
    }
    if (decl.prop === 'animation-delay' || decl.prop === 'transition-delay') {
      const delays = value.match(/\d+m?s/g) ?? []
      assert.ok(delays.length > 0, `Moments delay has no duration: ${value}`)
      for (const time of delays) assert.ok(ALLOWED_TIME.test(time), `Moments duration is not on the allowlist: ${time}`)
      return
    }
    const times = value.match(/\d+m?s/g) ?? []
    for (const time of times) assert.ok(ALLOWED_TIME.test(time), `Moments duration is not on the allowlist: ${time}`)
    if (decl.prop === 'transition' || decl.prop === 'transition-property') {
      const properties = decl.prop === 'transition-property'
        ? value.split(',').map(part => part.trim())
        : value.split(',').map(part => part.trim().split(/\s+/)[0] ?? '')
      for (const property of properties) {
        assert.ok(property === 'transform' || property === 'opacity', `Moments transition is not composited: ${value}`)
      }
    }
    if (decl.prop === 'animation' || decl.prop === 'animation-name') {
      const names = value.split(/[\s,]+/).filter(part => part.startsWith('moments-'))
      for (const name of names) assert.ok(MOMENTS_KEYFRAMES.includes(name), `Moments animation is not on the allowlist: ${name}`)
    }
  })
}
