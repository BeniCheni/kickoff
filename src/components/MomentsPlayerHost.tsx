import { Component, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { momentTitle } from '../lib/momentsGallery'
import { createYouTubePlayer, type MomentsPlayer, type MomentsPlayerFactory, type PlayerHooks, type PlayRequest } from '../lib/momentsPlayer'
import { queueNeighbours } from '../lib/momentsQueue'
import { MomentCover } from './MomentCover'
import { MomentsQueueList } from './MomentsPage'
import { PlaybackActions } from './MomentsPlayback'
import { useMomentsSession } from './MomentsSessionProvider'

type Placement = 'idle' | 'stage' | 'cinema' | 'parked'

function ensureOpen(dialog: HTMLDialogElement) {
  if (dialog.open) return
  try {
    if (typeof dialog.show === 'function') dialog.show()
    else dialog.setAttribute('open', '')
  } catch {
    dialog.setAttribute('open', '')
  }
}

const playerHostMarkup = { __html: '' }

function seedPlayerHost(host: HTMLElement) {
  const existing = host.querySelector<HTMLButtonElement>('[data-player-return]')
  const continueButton = host.querySelector<HTMLElement>('[data-player-continue]')
  if (existing && continueButton) {
    if (!host.querySelector('[data-moments-player-slot], iframe')) {
      const slot = document.createElement('div')
      slot.setAttribute('data-moments-player-slot', '')
      host.insertBefore(slot, continueButton)
    }
    return
  }
  host.replaceChildren()
  const back = document.createElement('button')
  back.type = 'button'
  back.className = 'sr-only'
  back.setAttribute('data-player-return', '')
  back.hidden = true
  back.textContent = 'Back to selection'
  back.addEventListener('click', () => {
    document.querySelector<HTMLElement>('.moments-stage-main [data-primary-action]')?.focus()
  })
  back.addEventListener('keydown', event => {
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault()
      document.querySelector<HTMLElement>('.moments-stage-top button')?.focus()
    }
  })
  const slot = document.createElement('div')
  slot.setAttribute('data-moments-player-slot', '')
  const forward = document.createElement('button')
  forward.type = 'button'
  forward.className = 'sr-only'
  forward.setAttribute('data-player-continue', '')
  forward.hidden = true
  forward.textContent = 'Continue past the player'
  forward.addEventListener('focus', () => {
    document.querySelector<HTMLElement>('.moments-stage-main [data-primary-action]')?.focus()
  })
  host.append(back, slot, forward)
}

function ensureClosed(dialog: HTMLDialogElement) {
  if (!dialog.open && !dialog.hasAttribute('open')) return
  try {
    if (typeof dialog.close === 'function') dialog.close()
    else dialog.removeAttribute('open')
  } catch {
    dialog.removeAttribute('open')
  }
}

/** Document coordinates, so the stage box scrolls with the anchor. Remeasure on layout change only. */
function containingOrigin(element: HTMLElement) {
  let node = element.parentElement
  while (node) {
    const position = getComputedStyle(node).position
    if (position === 'absolute' || position === 'relative' || position === 'fixed' || position === 'sticky') {
      const rect = node.getBoundingClientRect()
      return { top: rect.top + window.scrollY, left: rect.left + window.scrollX }
    }
    node = node.parentElement
  }
  return { top: 0, left: 0 }
}

function place(dialog: HTMLDialogElement, host: HTMLElement, placement: Placement) {
  if (placement === 'cinema') {
    dialog.style.top = ''
    dialog.style.left = ''
    dialog.style.width = ''
    dialog.style.height = ''
    const slot = dialog.querySelector('[data-moments-cinema-slot]')
    if (!(slot instanceof HTMLElement)) return
    const slotRect = slot.getBoundingClientRect()
    const dialogRect = dialog.getBoundingClientRect()
    host.style.top = `${slotRect.top - dialogRect.top + dialog.scrollTop}px`
    host.style.left = `${slotRect.left - dialogRect.left + dialog.scrollLeft}px`
    host.style.width = `${slotRect.width}px`
    host.style.height = `${slotRect.height}px`
    return
  }
  if (placement === 'parked') {
    dialog.style.top = '0px'
    dialog.style.left = '0px'
    dialog.style.width = '0px'
    dialog.style.height = '0px'
    return
  }
  if (placement !== 'stage') return
  const anchor = document.querySelector('[data-moments-stage-anchor]')
  if (!(anchor instanceof HTMLElement)) return
  const rect = anchor.getBoundingClientRect()
  const origin = containingOrigin(dialog)
  dialog.style.top = `${rect.top + window.scrollY - origin.top}px`
  dialog.style.left = `${rect.left + window.scrollX - origin.left}px`
  dialog.style.width = `${rect.width}px`
  dialog.style.height = `${rect.height}px`
  host.style.top = '0px'
  host.style.left = '0px'
  host.style.width = '100%'
  host.style.height = '100%'
}

function reveal(dialog: HTMLElement) {
  const slot = dialog.querySelector('[data-moments-cinema-slot]')
  const action = dialog.querySelector<HTMLElement>('[data-primary-action]')
  if (slot instanceof HTMLElement && action) {
    const dialogRect = dialog.getBoundingClientRect()
    const slotTop = slot.getBoundingClientRect().top - dialogRect.top + dialog.scrollTop
    const actionRect = action.getBoundingClientRect()
    const actionTop = actionRect.top - dialogRect.top + dialog.scrollTop
    const actionBottom = actionTop + actionRect.height
    const view = dialog.clientHeight
    let next = dialog.scrollTop
    if (actionBottom - slotTop <= view) {
      if (slotTop < next) next = slotTop
      if (actionBottom > next + view) next = actionBottom - view
    } else next = slotTop
    dialog.scrollTop = Math.max(0, next)
  }
  action?.focus({ preventScroll: true })
}

export function MomentsPlayerHost({ factory, fault = false }: { factory?: MomentsPlayerFactory; fault?: boolean }) {
  const session = useMomentsSession()!
  const dialogRef = useRef<HTMLDialogElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<MomentsPlayer | null>(null)
  const sessionRef = useRef(session)
  const factoryRef = useRef(factory)
  const placementRef = useRef<Placement>('idle')
  const stageFocus = useRef(false)
  const wasCinema = useRef(false)
  const seenActive = useRef(session.queue.active)
  const [live, setLive] = useState(false)
  sessionRef.current = session
  factoryRef.current = factory
  const surface = session.queue.surface
  const placement: Placement = surface === 'cinema' ? 'cinema' : live && surface === 'stage' ? 'stage' : live ? 'parked' : 'idle'
  placementRef.current = placement
  const hooks = useRef<PlayerHooks>(null)
  if (!hooks.current) hooks.current = {
    dispatch(event) {
      const current = sessionRef.current
      if (event.event === 'failure') {
        current.dispatch({ type: 'failure', id: event.itemId, attempt: event.attempt, failure: event.failure })
        return
      }
      current.dispatch({ type: 'provider', id: event.itemId, attempt: event.attempt, event: event.event,
        ...(event.position === undefined ? {} : { position: event.position }) })
    },
    onResumeLabel(visible) { sessionRef.current.setPlayerNotice({ resume: visible }) },
    onAutoplayBlocked() { sessionRef.current.setPlayerNotice({ autoplayBlocked: true }) },
  }

  const ensureAdapter = () => {
    if (playerRef.current || !hostRef.current || !hooks.current) return playerRef.current
    playerRef.current = (factoryRef.current ?? createYouTubePlayer)(hostRef.current, hooks.current)
    return playerRef.current
  }

  const focusStage = (from: EventTarget | null) => {
    const dialog = dialogRef.current
    const host = hostRef.current
    if (!dialog || !host) return
    const anchor = document.querySelector('[data-moments-stage-anchor]')
    const fromAfter = from instanceof Node && anchor instanceof HTMLElement
      && Boolean(anchor.compareDocumentPosition(from) & Node.DOCUMENT_POSITION_FOLLOWING)
      && !dialog.contains(from)
    if (fromAfter) {
      const frame = host.querySelector('iframe')
      if (frame instanceof HTMLElement) { frame.focus(); return }
    }
    host.querySelector<HTMLElement>('[data-player-return]')?.focus()
  }

  useLayoutEffect(() => {
    sessionRef.current.registerPlayer({
      play(request: PlayRequest) {
        setLive(true)
        sessionRef.current.setPlayerLive(true)
        const dialog = dialogRef.current
        const host = hostRef.current
        if (dialog && host) {
          dialog.hidden = false
          const next = sessionRef.current.queue.surface === 'cinema' ? 'cinema' : 'stage'
          place(dialog, host, next)
          ensureOpen(dialog)
        }
        ensureAdapter()?.play(request)
        if (sessionRef.current.queue.surface !== 'cinema') stageFocus.current = true
      },
      pause: () => playerRef.current?.pause(),
      retire: () => playerRef.current?.retire(),
      focus: focusStage,
    })
    return () => sessionRef.current.registerPlayer(null)
  }, [])

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    return () => {
      const inside = !!dialog && document.activeElement instanceof Node && dialog.contains(document.activeElement)
      playerRef.current?.dispose()
      playerRef.current = null
      if (inside) document.querySelector<HTMLElement>('nav[aria-label="Primary"] button')?.focus()
    }
  }, [])

  useLayoutEffect(() => {
    const host = hostRef.current
    if (host) seedPlayerHost(host)
  }, [])

  useEffect(() => {
    if (surface === 'gallery') playerRef.current?.retire()
  }, [surface])

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const host = hostRef.current
    if (!dialog || !host) return
    host.querySelectorAll<HTMLElement>('[data-player-return], [data-player-continue]').forEach(button => {
      button.hidden = placement !== 'stage'
    })
    if (placement === 'idle') {
      ensureClosed(dialog)
      return
    }
    place(dialog, host, placement)
    ensureOpen(dialog)
    if (placement === 'cinema') dialog.setAttribute('closedby', 'closerequest')
    else dialog.removeAttribute('closedby')
    if (placement === 'stage' && stageFocus.current) {
      stageFocus.current = false
      host.querySelector<HTMLElement>('[data-player-return]')?.focus()
    }
  }, [placement, session.queue.active, live])

  useEffect(() => {
    if (placement === 'idle') return
    const measure = () => {
      const dialog = dialogRef.current
      const host = hostRef.current
      if (!dialog || !host || placementRef.current === 'idle') return
      place(dialog, host, placementRef.current)
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    const anchor = document.querySelector('[data-moments-stage-anchor]')
    const gallery = document.querySelector('[data-moments-gallery]')
    const slot = dialogRef.current?.querySelector('[data-moments-cinema-slot]')
    const stage = document.querySelector('.moments-stage-main')
    const header = document.querySelector('header')
    if (observer) {
      if (anchor) observer.observe(anchor)
      if (gallery) observer.observe(gallery)
      if (slot instanceof HTMLElement) observer.observe(slot)
      if (stage instanceof HTMLElement) observer.observe(stage)
      if (header) observer.observe(header)
      observer.observe(document.documentElement)
    }
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    document.fonts?.addEventListener('loadingdone', measure)
    const mutation = new MutationObserver(measure)
    mutation.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lens', 'data-theme'] })
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
      document.fonts?.removeEventListener('loadingdone', measure)
      mutation.disconnect()
    }
  }, [placement])

  useLayoutEffect(() => {
    if (surface !== 'cinema') return
    const nodes = [...document.querySelectorAll<HTMLElement>('[data-moments-background]')]
    for (const node of nodes) node.setAttribute('inert', '')
    return () => { for (const node of nodes) node.removeAttribute('inert') }
  }, [surface])

  useLayoutEffect(() => {
    const cinema = surface === 'cinema'
    if (cinema && !wasCinema.current) dialogRef.current?.querySelector<HTMLElement>('[data-cinema-exit]')?.focus()
    if (!cinema && wasCinema.current) {
      const control = session.cinemaOpener()
      if (control?.isConnected) control.focus()
      else document.querySelector<HTMLElement>('.moments-edition-head h1')?.focus()
    }
    wasCinema.current = cinema
  }, [surface, session])

  useLayoutEffect(() => {
    const next = session.queue.active
    const changed = seenActive.current !== next
    seenActive.current = next
    if (surface === 'cinema' && changed && dialogRef.current) reveal(dialogRef.current)
  }, [session.queue.active, surface])

  useEffect(() => {
    if (surface !== 'cinema') return
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      sessionRef.current.exitCinema()
      const dialog = dialogRef.current
      if (dialog && !dialog.open) ensureOpen(dialog)
    }
    document.addEventListener('keydown', onEscape, true)
    return () => document.removeEventListener('keydown', onEscape, true)
  }, [surface])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onCancel = (event: Event) => {
      event.preventDefault()
      if (sessionRef.current.queue.surface === 'cinema') sessionRef.current.exitCinema()
    }
    const onClose = () => {
      if (placementRef.current === 'idle' || !dialogRef.current) return
      ensureOpen(dialog)
    }
    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('close', onClose)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      dialog.removeEventListener('close', onClose)
    }
  }, [])

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape' && placementRef.current === 'cinema') {
      event.preventDefault()
      event.stopPropagation()
      session.exitCinema()
      const dialog = dialogRef.current
      if (dialog && !dialog.open && live) ensureOpen(dialog)
      return
    }
    if (event.key !== 'Tab' || placementRef.current !== 'cinema') return
    const dialog = dialogRef.current
    if (!dialog) return
    const controls = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], iframe, input:not([disabled]), select:not([disabled]), summary')]
      .filter(element => !element.hasAttribute('hidden') && !element.closest('[hidden]'))
    const first = controls[0]
    const last = controls.at(-1)
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  if (fault) throw new Error('player fault')

  const active = session.edition.find(item => item.id === session.queue.active)
  const neighbours = queueNeighbours(session.queue)
  const next = neighbours.next ? session.edition.find(item => item.id === neighbours.next) : undefined
  const nextTitle = next ? momentTitle(next, session.spoiler) : null
  const previous = neighbours.previous ? session.edition.find(item => item.id === neighbours.previous) : undefined

  return <dialog ref={dialogRef} className="moments-player-dialog" data-moments-player-dialog data-placement={placement}
    hidden={placement === 'idle'} role={placement === 'stage' ? 'region' : undefined}
    aria-modal={placement === 'cinema' ? true : undefined}
    aria-label={placement === 'cinema' ? 'Cinema' : placement === 'stage' ? 'Player' : undefined}
    aria-hidden={placement === 'parked' ? true : undefined} inert={placement === 'parked'}
    onFocus={event => {
      if (placementRef.current !== 'cinema' || event.target !== event.currentTarget) return
      const dialog = event.currentTarget
      const related = event.relatedTarget
      const fromFrame = related instanceof Element && related.tagName === 'IFRAME'
      const fromOutside = !(related instanceof Node) || !dialog.contains(related)
      if (!fromFrame && !fromOutside) return
      const controls = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], iframe, input:not([disabled]), select:not([disabled]), summary')]
        .filter(element => !element.hasAttribute('hidden') && !element.closest('[hidden]'))
      const next = fromFrame ? controls.at(-1) : controls[0]
      next?.focus()
    }}
    onKeyDown={onKeyDown}>
    <div ref={hostRef} data-moments-player-host className="moments-player-host" dangerouslySetInnerHTML={playerHostMarkup} />
    {placement === 'cinema' && <div className="moments-cinema" data-moments-cinema>
      <div className="moments-cinema-frame">
        <div className="moments-cinema-bar">
          <span className="label-caps">Kickoff / Cinema</span>
          <button type="button" className="moments-button" data-cinema-exit onClick={() => session.exitCinema()}>Exit Cinema</button>
        </div>
        {active && <div className="moments-cinema-layout">
          <div className="moments-cinema-main">
            <div className="moments-stage-top">
              <button type="button" className="moments-button" onClick={() => session.dispatch({ type: 'surface', surface: 'gallery' })}>← Gallery</button>
            </div>
            <h1 tabIndex={-1}>{momentTitle(active, session.spoiler)}</h1>
            <div data-moments-cinema-slot className="moments-cinema-slot"><MomentCover moment={active} spoiler={session.spoiler} /></div>
            <PlaybackActions moment={active} target="cinema" nextTitle={nextTitle} readNotice />
            <div className="moments-neighbours">
              <button type="button" className="moments-button" disabled={!previous}
                aria-label={previous ? `Previous: ${momentTitle(previous, session.spoiler)}` : 'Previous'}
                onClick={() => { if (neighbours.previous) session.dispatch({ type: 'open', id: neighbours.previous }) }}>
                Previous{previous && <span className="moments-neighbour-title">{momentTitle(previous, session.spoiler)}</span>}
              </button>
              <button type="button" className="moments-button" disabled={!next}
                aria-label={next ? `Next: ${momentTitle(next, session.spoiler)}` : 'Next'}
                onClick={() => { if (neighbours.next) session.dispatch({ type: 'open', id: neighbours.next }) }}>
                Next{next && <span className="moments-neighbour-title">{momentTitle(next, session.spoiler)}</span>}
              </button>
            </div>
          </div>
          <aside className="moments-queue" aria-label="Selection queue" data-moments-list>
            <h2>Your evening</h2>
            <MomentsQueueList onOpen={id => session.dispatch({ type: 'open', id })} />
          </aside>
        </div>}
      </div>
    </div>}
  </dialog>
}

export class MomentsPlayerErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <div role="alert" data-moments-player-fallback className="rounded border border-line-strong bg-surface p-4 text-ink">
      <p className="font-display text-[22px] font-semibold">The player could not be shown.</p>
      <p className="mt-1 text-[13px] text-ink-secondary">Retry the player to mount it again. This visit’s other pages stay available.</p>
      <div className="mt-4"><button type="button" className="label-caps cursor-pointer rounded border border-ink px-3 py-2 text-[12px]"
        onClick={() => this.setState({ failed: false })}>Retry player</button></div>
    </div>
  }
}

export function MomentsPlayerBoundary({ factory, fault = false }: { factory?: MomentsPlayerFactory; fault?: boolean }) {
  const session = useMomentsSession()
  if (!session || session.edition.length === 0) return null
  return <MomentsPlayerErrorBoundary><MomentsPlayerHost factory={factory} fault={fault} /></MomentsPlayerErrorBoundary>
}
