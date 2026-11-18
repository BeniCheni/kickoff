import { useLayoutEffect, type RefObject } from 'react'

/** The custom property the stylesheet reads. 118px there until the page measures. */
export const BAND_HEIGHT = '--band-height'

/**
 * The band is pinned, so whatever pins below it has to start at its foot. Its
 * height is not a constant: the provenance wraps under about 366px, and a
 * fallback face or a reader's text size can move that point. The band is
 * measured and the figure is published on <html>, where the Table's pinned rows
 * and the page's scroll padding read it (src/shell.css).
 */
/**
 * The same measurement for a shell the server renders. Its HTML is laid out before the
 * app runs, and the hook below measures nothing until it does: at 360 the band stood 133
 * tall over a stylesheet that still said 118, and the Table's labels pinned 15px behind
 * it. This runs as the parser passes the band, as the script directly after it, and
 * publishes the figure in the form the hook writes. It keeps watching, because the band
 * can change height before the app arrives: the provenance is drawn in a fallback face
 * until its own loads, and the two wrap one pixel apart.
 */
export const BAND_HEIGHT_BOOT = `(function(){var b=document.currentScript.previousElementSibling;if(!b)return;var m=function(){var h=b.getBoundingClientRect().height;if(h)document.documentElement.style.setProperty('${BAND_HEIGHT}',h+'px')};m();if(window.ResizeObserver)new ResizeObserver(m).observe(b)})()`

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
    return () => {
      observer.disconnect()
      root.style.removeProperty(BAND_HEIGHT)
    }
  }, [ref])
}
