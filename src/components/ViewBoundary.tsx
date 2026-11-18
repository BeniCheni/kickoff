import { Component, type ReactNode } from 'react'

/** Contains render failures below App's persistent navigation. A tab/lens key remounts
 * it for another view. Module-import, event-handler and async failures are outside this seam. */
export class ViewBoundary extends Component<{ children: ReactNode; allowRetry?: boolean; onFailure?: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() { this.props.onFailure?.() }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="view-alert">
        <p className="view-alert-title">This view couldn’t load.</p>
        <p className="view-alert-copy">{this.props.allowRetry ? 'Retry this view to keep your current visit.' : 'Reload or reset the view to try again.'}</p>
        <div className="view-alert-actions">
          {this.props.allowRetry && <button
            type="button"
            onClick={() => this.setState({ failed: false })}
            className="view-alert-button"
          >Retry</button>}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="view-alert-button view-alert-solid"
          >
            Reload
          </button>
          <a href={window.location.pathname} className="view-alert-button">
            Reset view
          </a>
        </div>
      </div>
    )
  }
}
