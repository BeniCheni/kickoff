// Used only by the acceptance plugin. Exact-match replacements fail if application source
// changes; they observe calls, never replace the adapter or its playability rule.
export function instrumentAdapter(source: string): string {
  const replace = (from: string, to: string) => {
    if (source.split(from).length !== 2) throw new Error(`observation-hook-source-mismatch: ${from}`)
    source = source.replace(from, to)
  }
  replace('  let player: YTPlayer | null = null', `
  const observe = (kind: string, value: unknown) => window.dispatchEvent(new CustomEvent('moments-observation-hook-v1', { detail: { kind, value } }))
  const originalHooks = hooks
  hooks = {
    dispatch(event) { observe('dispatch', event); originalHooks.dispatch(event) },
    onResumeLabel(visible) { observe('resume', visible); originalHooks.onResumeLabel(visible) },
    onAutoplayBlocked() { observe('blocked', null); originalHooks.onAutoplayBlocked() },
  }
  let player: YTPlayer | null = null`)
  replace('return finitePosition(player.getCurrentTime())', "const value = finitePosition(player.getCurrentTime()); observe('sample', value); return value")
  replace('    play(request) {', "    play(request) {\n      observe('play', request)")
  replace('    ready = true', "    observe('ready', builtId)\n    ready = true")
  replace('  const onError = (event: YTEvent, builtId: number) => {', "  const onError = (event: YTEvent, builtId: number) => {\n    observe('error', event.data)")
  replace('      player = created', "      observe('instance', builtId)\n      player = created")
  replace('    dispose() {', "    dispose() {\n      observe('dispose', null)")
  return source
}
