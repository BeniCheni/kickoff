/** Recovery sentences. A title is quoted and not given a second terminal mark. */

export function nextSelectionSentence(title: string | null): string {
  if (title === null) return 'There is no next selection in this order.'
  return `Next opens “${title}”`
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
