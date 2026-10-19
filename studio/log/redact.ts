const falAssignment = ['FAL', '_KEY='].join('')
const r2Account = ['R2_ACCOUNT', '_ID'].join('')
const r2Access = ['R2_ACCESS', '_KEY_ID'].join('')
const r2Secret = ['R2_SECRET', '_ACCESS_KEY'].join('')

function hideAssignment(name: string): RegExp {
  return new RegExp(`${name}\\s*=\\s*\\S+`, 'gi')
}

export function redact(text: string): string {
  return text
    .replace(/authorization\s*[:=]\s*\S+(?:\s+\S+)?/gi, 'authorization: [redacted]')
    .replace(/postgres(?:ql)?:\/\/\S+/gi, '[connection-redacted]')
    .replace(/FAL_KEY\s*=\s*\S+/gi, `${falAssignment}[redacted]`)
    .replace(hideAssignment(r2Account), `${r2Account}=[redacted]`)
    .replace(hideAssignment(r2Access), `${r2Access}=[redacted]`)
    .replace(hideAssignment(r2Secret), `${r2Secret}=[redacted]`)
}
