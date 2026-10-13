/** D5 §3 sentences. Apostrophes and quotes are the spec's own characters. */
export const COPY = {
  databaseUnavailable:
    'Database unavailable. The Studio\u2019s records live in a Supabase project that pauses after a week idle on the free plan. Every paid submit is refused until it is back, because the estimate and the ledger line are written first. Drafts and the local cache still work. Restoring is one click in Supabase\u2019s dashboard: open the project and choose Restore.',
  outOfCredit:
    'Out of credit. fal answered \u201cUser is locked. Reason: Exhausted balance\u201d. This is a state, not an error. Top up by hand at fal; the balance stays at or below $9.37. Submits resume when fal answers.',
  refused:
    'Refused by the model\u2019s safety checker. Not a failure of the Studio; never retried on its own.',
  completed: 'Completed means finished, not succeeded. The result\u2019s HTTP status decides.',
  downloadFailed:
    'Completed; the download failed. The result is still at fal. Retry download fetches it again \u2014 no new generation, no new charge.',
  resultExpired:
    'Completed; the result expired at fal before a download succeeded. The charge stands. Nothing to download: Regenerate (a new generation, this one as parent) is the only path.',
  timedOut:
    'No status in 10 minutes \u2014 a proposed ceiling; the Studio\u2019s operations plan sets it (A-05). The charge is unknown until the ledger is reconciled with fal\u2019s history. A timeout is never treated as a cancellation.',
  gate: 'Unavailable: the Article 50 answer is not recorded (A-06).',
  photos:
    'Photos stay on this Mac. What fal receives is a stripped copy: no EXIF, no location, no device. Nothing on this page shows where a photo was taken.',
} as const
