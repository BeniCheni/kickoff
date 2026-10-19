'use client'

import { useEffect } from 'react'
import { useWatchHref, useWatchNavigation } from './watch-url'

export function WatchMissing({ search }: { search: string }) {
  const navigate = useWatchNavigation()
  const href = useWatchHref(search, null)
  useEffect(() => { document.getElementById('moments-missing-heading')?.focus() }, [])
  return (
    <>
      <h1 id="moments-missing-heading" tabIndex={-1}>No published video has this address.</h1>
      <p>The id in the address is not published, or never was. Nothing more is known from here.</p>
      <a href={href} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        navigate('moments', null)
      }}>← Gallery</a>
    </>
  )
}

export function WatchUnavailable({ search }: { search: string }) {
  const navigate = useWatchNavigation()
  const href = useWatchHref(search, null)
  useEffect(() => { document.getElementById('moments-watch-unavailable')?.focus() }, [])
  return (
    <>
      <h1 id="moments-watch-unavailable" tabIndex={-1}>The watch page is unavailable.</h1>
      <p>The server could not read this video{'\u2019'}s record. The cause is unknown from here.</p>
      <button type="button" onClick={() => window.location.reload()}>Try again</button>
      <a href={href} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        navigate('moments', null)
      }}>← Gallery</a>
    </>
  )
}
