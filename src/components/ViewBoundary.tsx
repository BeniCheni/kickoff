import { Component, type ReactNode } from 'react'

/** Contains render failures below App's persistent navigation. A tab/lens key remounts
 * it for another view. Module-import, event-handler and async failures are outside this seam. */
export class ViewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="rounded border border-line-strong bg-surface p-4 text-ink">
        <p className="font-display text-[22px] font-semibold">This view couldn’t load.</p>
        <p className="mt-1 text-[13px] text-ink-secondary">Reload or reset the view to try again.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => window.location.reload()}
            className="label-caps cursor-pointer rounded border border-ink bg-ink px-3 py-2 text-[12px] text-bg"
          >
            Reload
          </button>
          <a href={window.location.pathname} className="label-caps rounded border border-ink px-3 py-2 text-[12px] text-ink">
            Reset view
          </a>
        </div>
      </div>
    )
  }
}
