/** Recovery sentences. A title is quoted. One that ends its own sentence keeps that mark
 * inside the quotes and gets no second one (D-18); any other title, a spoiler-light neutral
 * title among them, gets the full stop after the quotes, so the next sentence has a boundary. */

const ENDS_ITS_SENTENCE = /[.?!…][”’"')\]]*$/

export function nextSelectionSentence(title: string | null): string {
  if (title === null) return 'There is no next selection in this order.'
  return `Next opens “${title}”${ENDS_ITS_SENTENCE.test(title.trimEnd()) ? '' : '.'}`
}

export function blockedRecovery(title: string | null): { heading: string; body: string } {
  return {
    heading: 'Keep the story. Choose the next step.',
    body: `The owner does not allow playback on other websites. ${nextSelectionSentence(title)} The official source is also available. External playback is unverified.`,
  }
}

export function timeoutRecovery(title: string | null): { heading: string; body: string } {
  return {
    heading: 'Playback not confirmed.',
    body: `Something has not connected. The cause is unknown. This does not establish a territory restriction. ${nextSelectionSentence(title)}`,
  }
}

export function unavailableRecovery(title: string | null): { heading: string; body: string } {
  return {
    heading: 'This selection cannot be played here.',
    body: `The provider reported that this upload is unavailable. ${nextSelectionSentence(title)} The official source is also available. External playback is unverified.`,
  }
}
