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
