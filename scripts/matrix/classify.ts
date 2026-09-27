import type { HostClass } from './types'

const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com'])

const MEDIA_APEXES = ['youtube.com', 'youtube-nocookie.com', 'ytimg.com', 'googlevideo.com']

function hostIs(host: string, apex: string): boolean {
  return host === apex || host.endsWith(`.${apex}`)
}

export function isMediaProviderHost(host: string): boolean {
  const name = host.toLowerCase().replace(/^\[|\]$/g, '')
  return MEDIA_APEXES.some((apex) => hostIs(name, apex))
}

function isLoopback(host: string): boolean {
  const name = host.toLowerCase()
  return name === 'localhost' || name === '127.0.0.1' || name === '::1' || name === '[::1]'
}

/**
 * Classify one request URL against the page being served.
 * Fonts are the two hosts `index.html` already preconnects. Media hosts match
 * youtube.com (and its subdomains), www.youtube-nocookie.com, *.ytimg.com and
 * *.googlevideo.com. Anything else off-origin is other-external.
 */
export function classifyRequestUrl(raw: string, baseUrl: string): HostClass {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    try {
      url = new URL(raw, baseUrl)
    } catch {
      return 'app'
    }
  }
  if (url.protocol === 'data:' || url.protocol === 'blob:' || url.protocol === 'about:' || url.protocol === 'file:') {
    return 'app'
  }
  const host = url.hostname.toLowerCase()
  let baseHost = ''
  try {
    baseHost = new URL(baseUrl).hostname.toLowerCase()
  } catch {
    baseHost = ''
  }
  if (host === baseHost || isLoopback(host)) return 'app'
  if (FONT_HOSTS.has(host)) return 'font'
  if (isMediaProviderHost(host)) return 'media-provider'
  return 'other-external'
}

/** A media-provider request fails the cell unless that cell declared play intent. */
export function mediaRequestFails(hostClass: HostClass, playIntent: boolean): boolean {
  return hostClass === 'media-provider' && !playIntent
}
