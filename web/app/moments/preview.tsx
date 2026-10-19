'use client'

import { useEffect, useRef } from 'react'

let active: HTMLVideoElement | null = null

export function retirePreview(video: HTMLVideoElement | null) {
  if (!video) return
  video.pause()
  video.removeAttribute('src')
  video.load()
  if (active === video) active = null
}

/** One muted looping preview. The previous one is retired first. */
export function CardPreview({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (active && active !== video) retirePreview(active)
    active = video
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'none'
    video.src = src
    void video.play().catch(() => retirePreview(video))
    return () => retirePreview(video)
  }, [src])
  return (
    <video
      ref={ref}
      className="moments-preview-video"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  )
}

