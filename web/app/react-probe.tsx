'use client'

import { useRef } from 'react'
import { LensSwitcher } from '../../src/components/LensSwitcher'

/** Holds a shared reader component in the production graph so the React
 *  resolution proof covers an importer under ../src. It renders nothing. */
export function ReactProbe() {
  const kind = useRef(typeof LensSwitcher)
  if (kind.current !== 'function') throw new Error('shared component missing')
  return null
}
