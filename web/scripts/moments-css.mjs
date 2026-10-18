import assert from 'node:assert/strict'
import postcss from 'postcss'

/** Walks rules inside every at-rule and checks each selector-list member. */
export function assertMomentsScope(css) {
  const sheet = postcss.parse(css)
  sheet.walkAtRules(rule => assert.ok(!/keyframes$/i.test(rule.name), 'Moments sheet added motion'))
  sheet.walkDecls(decl => assert.ok(!/^(?:animation|transition)(?:-|$)/i.test(decl.prop), 'Moments sheet added motion'))
  sheet.walkRules(rule => {
    for (const selector of postcss.list.comma(rule.selector)) {
      // The optional lens ancestor is the only outer scope used by this sheet.
      assert.match(selector, /^(?:\[data-lens=["'](?:ledger|poster|broadcast)["']\]\s+)?\.moments-gallery(?:$|[\s.#:\[])/, `Moments selector is not scoped: ${selector}`)
      assert.ok(!/[+~]/.test(selector), `Moments selector escapes through a sibling: ${selector}`)
    }
  })
}
