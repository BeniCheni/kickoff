/**
 * Draft sentences for Beni. D5's verbatim lines stay in copy.ts.
 * Retired publication sentences are listed with the replacement underneath.
 */

export const DRAFT = {
  submitBudget:
    'Unavailable: this estimate is over the $1.50 per-job cap or would take the session over $6.00.',
  submitDatabase:
    'Unavailable: the database is paused. Every paid submit is refused until it is back.',
  submitEmpty: 'Add a prompt before submitting.',
  submitUnpriced: 'Unavailable: the registry has no current price for this request.',
  balanceUnrecorded: 'Balance not recorded. The cap is $9.37, kept by hand. This bar does not subtract from a figure the Studio has not recorded.',
  onePhotograph: 'This submit sends the first selected photo. The engine accepts one photograph per request.',
  publishConfirm:
    'Publish writes this clip to the catalog. It is live on the next read. There is no pull request and no release.',
  falKey: 'Unavailable: a live submit needs FAL_KEY on this Mac, and none is set.',
  uploadFailed: 'Unavailable: the files were not stored. The clip stays listed.',
  deleteFailed: 'Unavailable: a stored file was not removed.',
  cardWidth: 'Publish is refused: the clip has no positive width on the record.',
  cardHeight: 'Publish is refused: the clip has no positive height on the record.',
  cardDuration: 'Publish is refused: the clip has no positive duration on the record.',
  cardSubject: 'Publish is refused: the clip needs one approved subject on the record.',
  cardPublicId: 'Publish is refused: the public id is not a safe token.',
  cardFinished: 'Publish is refused: the job has no finish time.',
  importChoose: 'Choose an MP4 clip and a JPEG still. Both stay on this Mac until you confirm.',
  importPrompt: 'The prompt as you typed it into Grok.',
  importMadeOn: 'The day you made the clip.',
  gateUnrecorded:
    'Before any generated clip is published, an explicit answer is recorded on whether EU AI Act Article 50 applies to Kickoff, and what disclosure it would need (A-06; source: spec §6 A1). Answer on file: none. Publish stays unavailable until one is recorded.',
} as const

/** D5 sentences the pivot retires, each with a draft replacement. */
export const RETIRED = [
  {
    was: 'Host, decided 8 Oct (ST4) and retained 11 Oct (A-03): GitHub Releases, the provider that already serves the site. Upload creates one release for this export and one asset per clip, named by assetId, and marks the release not Latest. Uploading publishes both clips now, at the addresses below, to anyone with the address — before the PR is merged. Assets are not immutable unless the repository’s immutable-releases setting is on (off as of 11 Oct; Beni’s to set). The record carries each file’s SHA-256, so a replaced file fails the publication check — detected, not prevented. Without the upload the PR opens draft and the publication check fails until the files exist.',
    draft: 'Publication writes the clip to the catalog through the storage port. The objects are the recorded bucket and key. There is no GitHub Release and no pull request for the clip.',
  },
  {
    was: 'media-<yyyymmdd>-<8 hex> · not Latest · not a v* tag',
    draft: 'No release tag. The public id is the watch address.',
  },
  {
    was: 'github.com/BeniCheni/kickoff/releases/download/media-<id>/<assetId>.mp4 — the release address, never the signed redirect',
    draft: 'The site reads the bucket and object path from the record. It does not build a path.',
  },
  {
    was: 'Uploads the two clips first, then opens a draft PR from this Mac with Beni’s GitHub token. The clips are public from the upload; the edition changes only when Beni merges. Cancel before the upload leaves nothing behind. If the upload fails part way, the release stays with the assets that arrived, no PR is opened, and Export lists both clips again, naming that release.',
    draft: 'Publish writes this clip to the catalog. It is live on the next read. There is no pull request and no release.',
  },
  {
    was: 'Upload 2 clips, then open draft PR',
    draft: 'Publish',
  },
  {
    was: 'The two jobs move from kept to exported in the ledger, with the PR number (decided 8 Oct, Q9). A clip is exported once; Export never lists it again. Export identity (proposal under A-03): media-<yyyymmdd>-<8 hex of SHA-256 over the sorted assetIds>, so a retry finds the same release and uploads only what is missing; a second export the same day of other clips gets another tag. Media tags never become Latest and are not v* tags.',
    draft: 'The job moves from kept to published. Unpublish withdraws it. A withdrawn clip is never relisted.',
  },
  {
    was: 'Clip sizes are measured (Appendix S). The PR and the release carry records and clips only: no photograph and no stripped copy. What fal received is stated on the composer.',
    draft: 'The catalog row carries the record and the stored keys. No photograph is published. What fal received is stated on Compose.',
  },
  {
    was: 'validate-moments runs at build, offline: the schema, and for provider youtube that source.name ends “/ YouTube” (Q12). verify-media runs on this PR only, for records whose file address changed: HTTP 200, Content-Length equal to the recorded size, SHA-256 of the fetched bytes equal to the recorded hash. A failure makes the PR red. The build never fetches a clip. The edition stays unchanged until Beni merges.',
    draft: 'No pull-request checks. The engine refuses a publish that lacks the Card facts or the Article 50 answer, before anything is written.',
  },
  {
    was: 'Before any generated clip is published, an explicit answer is recorded on whether EU AI Act Article 50 applies to Kickoff, and what disclosure it would need (A-06; source: spec §6 A1). Answer on file: none. Export stays unavailable until one is recorded.',
    draft: 'Before any generated clip is published, an explicit answer is recorded on whether EU AI Act Article 50 applies to Kickoff, and what disclosure it would need (A-06; source: spec §6 A1). Answer on file: none. Publish stays unavailable until one is recorded.',
  },
] as const

/** Live mode without the four R2 names. Every method refuses with this sentence. */
export const STORAGE_REFUSAL = 'Storage is not connected, so a live publish, delete, or removal is refused until the files can be stored.'
