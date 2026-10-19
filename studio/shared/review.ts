export const CHECKLIST: readonly { line: string; name: string }[] = [
  { line: 'extra-players', name: 'Extra players or officials' },
  { line: 'text-on-boards', name: 'Text on boards, shirts or screens' },
  { line: 'logo-like-marks', name: 'Logo-like or crest-like marks' },
  { line: 'subject-identity', name: 'The subject’s identity and posture' },
  { line: 'soundtrack', name: 'The soundtrack' },
]

export const CHECKLIST_RULE = 'Every model in the spike added marks, text or players nobody asked for; a prompt cannot stop it. Keep needs five Clear answers. Present or Unsure leaves Keep unavailable: discard, or regenerate with this generation as parent.'

export const PLAYER_HELP = 'The Studio plays the local file with native controls; frame-stepping is whatever those controls offer, not promised here.'

export function keepReason(answers: Record<string, string>): string | null {
  const lines = CHECKLIST.map((item) => item.line)
  const value = (line: string) => answers[line]
  if (lines.some((line) => value(line) !== 'clear')) {
    const present = lines.filter((line) => value(line) === 'present').length
    const unsure = lines.filter((line) => value(line) === 'unsure').length
    const missing = lines.filter((line) => value(line) !== 'clear' && value(line) !== 'present' && value(line) !== 'unsure').length
    const parts = [
      present ? `${present} Present` : '',
      unsure ? `${unsure} Unsure` : '',
      missing ? `${missing} unanswered` : '',
    ].filter(Boolean)
    return `Keep is unavailable: ${parts.join(', ')}.`
  }
  return null
}
