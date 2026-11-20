import { useLayoutEffect, type RefObject } from 'react'

/** The custom property the stylesheet reads. 118px there until the page measures. */
export const BAND_HEIGHT = '--band-height'

/** Sent on the document once the app's own observer is watching the band. */
export const BAND_HEIGHT_OWNED = 'kickoff:band-height-owned'

/**
 * The band is pinned, so whatever pins below it has to start at its foot. Its
 * height is not a constant: the provenance wraps under about 366px, and a
 * fallback face or a reader's text size can move that point. The band is
 * measured and the figure is published on <html>, where the Table's pinned rows
 * and the page's scroll padding read it (src/shell.css).
 */
export function useBandHeight(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const band = ref.current
    if (!band || typeof ResizeObserver === 'undefined') return
    const root = document.documentElement
    const publish = () => {
      const next = `${band.getBoundingClientRect().height}px`
      if (root.style.getPropertyValue(BAND_HEIGHT) !== next) root.style.setProperty(BAND_HEIGHT, next)
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(band)
    // The handoff. In a shell the server rendered, the script below has watched the band
    // until now. Two observers would publish one figure, and the older is reported to
    // first, so the script would go on writing it and this one never would. This one has
    // published and is watching, so the script is told, and stops.
    document.dispatchEvent(new Event(BAND_HEIGHT_OWNED))
    return () => {
      observer.disconnect()
      root.style.removeProperty(BAND_HEIGHT)
    }
  }, [ref])
}

/**
 * The same measurement for a shell the server renders. Its HTML is laid out before the
 * app runs, and the hook above measures nothing until it does: at 360 the band stood 133
 * tall over a stylesheet that still said 118, and the Table's labels pinned 15px behind
 * it. This runs as the parser passes the band, as the script directly after it, and
 * publishes the figure in the form the hook writes. It keeps watching, because the band
 * can change height before the app arrives: the provenance is drawn in a fallback face
 * until its own loads, and the two wrap one pixel apart. It stops when the hook says the
 * app has the band, and the hook's observer is the only one from then on.
 */
export const BAND_HEIGHT_BOOT = `(function(){var b=document.currentScript.previousElementSibling;if(!b)return;var m=function(){var h=b.getBoundingClientRect().height;if(h)document.documentElement.style.setProperty('${BAND_HEIGHT}',h+'px')};m();if(!window.ResizeObserver)return;var o=new ResizeObserver(m);o.observe(b);document.addEventListener('${BAND_HEIGHT_OWNED}',function(){o.disconnect()},{once:true})})()`
