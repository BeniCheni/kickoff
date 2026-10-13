const falAssignment = ['FAL', '_KEY='].join('')

export function redact(text: string): string {
  return text
    .replace(/authorization\s*[:=]\s*\S+(?:\s+\S+)?/gi, 'authorization: [redacted]')
    .replace(/postgres(?:ql)?:\/\/\S+/gi, '[connection-redacted]')
    .replace(/FAL_KEY\s*=\s*\S+/gi, `${falAssignment}[redacted]`)
}
