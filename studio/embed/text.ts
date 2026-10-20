import { sha256 } from '../hash.ts'

/**
 * The text that is embedded: the title, then a newline and the editorial note
 * when there is one. The tokenizer truncates what the model sees. The source
 * hash is the SHA-256 of this exact string, before truncation.
 */
export function clipText(title: string, editorialNote: string | null | undefined): string {
  if (typeof editorialNote === 'string' && editorialNote.length > 0) return `${title}\n${editorialNote}`
  return title
}

export function clipTextSha256(title: string, editorialNote: string | null | undefined): string {
  return sha256(clipText(title, editorialNote))
}
