import type { MomentsPlayer, PlayerHooks, PlayerNotice, PlayRequest } from '../../src/lib/momentsPlayer'

/** Deterministic stand-in for the YouTube adapter. moments-player-mock */
export type MockMomentsPlayer = MomentsPlayer & {
  emit: (notice: PlayerNotice | { event: 'autoplay-blocked' } | { event: 'resume-label' }) => void
  reads: { plays: PlayRequest[]; pauses: number; retires: number; disposes: number }
}

let latest: MockMomentsPlayer | null = null
export function currentMockPlayer(): MockMomentsPlayer | null { return latest }

export function createMockMomentsPlayer(host: HTMLElement, hooks: PlayerHooks): MockMomentsPlayer {
  let current: PlayRequest | null = null
  let failed = false
  let position = 0
  let iframe: HTMLIFrameElement | null = null
  const reads = { plays: [] as PlayRequest[], pauses: 0, retires: 0, disposes: 0 }

  const ensureFrame = () => {
    if (iframe?.isConnected) return
    const slot = host.querySelector('[data-moments-player-slot]')
    iframe = document.createElement('iframe')
    iframe.title = 'Moments player'
    iframe.tabIndex = 0
    iframe.src = 'about:blank'
    if (slot) slot.replaceWith(iframe)
    else host.append(iframe)
  }

  const player: MockMomentsPlayer = {
    reads,
    play(request) {
      current = request
      failed = false
      position = Number.isFinite(request.position) && request.position >= 0 ? request.position : 0
      reads.plays.push(request)
      hooks.onResumeLabel(false)
      ensureFrame()
    },
    pause() {
      reads.pauses += 1
      if (!current) return
      hooks.dispatch({ itemId: current.itemId, attempt: current.attempt, event: 'paused', position })
    },
    retire() {
      reads.retires += 1
      if (!current) return
      hooks.dispatch({ itemId: current.itemId, attempt: current.attempt, event: 'position', position })
      current = null
    },
    dispose() {
      reads.disposes += 1
      current = null
      iframe?.remove()
      iframe = null
      if (latest === player) latest = null
    },
    emit(notice) {
      if (!current) return
      if (notice.event === 'autoplay-blocked') {
        hooks.onAutoplayBlocked()
        return
      }
      if (notice.event === 'resume-label') {
        hooks.onResumeLabel(true)
        return
      }
      if (current.itemId !== notice.itemId || current.attempt !== notice.attempt) return
      if (notice.event === 'failure') {
        if (failed) return
        failed = true
      }
      if (notice.event === 'position' && notice.position === undefined) return
      if (notice.event !== 'failure' && notice.position !== undefined && Number.isFinite(notice.position) && notice.position >= 0) {
        position = notice.position
      }
      hooks.dispatch(notice)
      if (notice.event === 'playing' || notice.event === 'ended') hooks.onResumeLabel(false)
    },
  }
  latest = player
  return player
}
