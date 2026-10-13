/**
 * Blank means no character outside whitespace.
 *
 * The database check is `"answer" ~ '[^[:space:]]'` (POSIX `[:space:]`:
 * space, tab, newline, carriage return, form feed, vertical tab).
 * JavaScript `\s` also covers U+00A0 NO-BREAK SPACE, which PGlite's
 * POSIX class does not. The engine refuses that character too, so it
 * is the stricter of the two. Read against PGlite on 13 Oct 2026.
 */
export function hasVisibleAnswer(value: string): boolean {
  return /[^\s]/u.test(value)
}
