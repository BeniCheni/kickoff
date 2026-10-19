export type ThemeName = 'light' | 'dark'

export function resolveTheme(stored: string | null, prefersDark: boolean): ThemeName {
  if (stored === 'light' || stored === 'dark') return stored
  return prefersDark ? 'dark' : 'light'
}

export function readStoredTheme(read: () => string | null): string | null {
  try {
    return read()
  } catch {
    return null
  }
}
