/**
 * One definition of a blank answer, shared by the engine and the database.
 *
 * An answer is blank when every character is in this set: the characters
 * JavaScript's `\s` matches, plus the zero-width characters U+200B, U+200C,
 * U+200D and U+2060. The database check is a PostgreSQL `~` constraint whose
 * pattern is a standard-SQL Unicode escape string (`U&'...'`, four hex
 * digits). `[:space:]` covers the ASCII members; every code point is also
 * written out, so the check does not depend on the database locale.
 * It runs on Supabase's Postgres only by inference until the migration is applied.
 */
export const BLANK_CODE_POINTS = [
  0x0009, 0x000A, 0x000B, 0x000C, 0x000D,
  0x0020,
  0x00A0,
  0x1680,
  0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A,
  0x200B, 0x200C, 0x200D,
  0x2028, 0x2029,
  0x202F,
  0x205F,
  0x2060,
  0x3000,
  0xFEFF,
] as const

const BLANK = new Set<number>(BLANK_CODE_POINTS)

export function article50NonblankSql(): string {
  const escapes = BLANK_CODE_POINTS.map((code) => `\\${code.toString(16).toUpperCase().padStart(4, '0')}`).join('')
  return `"answer" ~ U&'[^[:space:]${escapes}]'`
}

export function hasVisibleAnswer(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0)
    if (code === undefined || !BLANK.has(code)) return true
  }
  return false
}
