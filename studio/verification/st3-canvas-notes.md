# ST3 beside the D4 canvas

Opened locally on 18 Oct 2026: `Kickoff Moments - D4 design canvas.html` (frames 10–13). D5 changed D4 only as its §0 changelog says; these Studio frames are the ones D5 kept. Nothing from that folder was copied.

## Frame 10 · Composer, 1280, light

Matches: the Kickoff wordmark; the loopback line; Compose · Jobs · Review as tabs; subject, stripped-photo sentence, keyframe model, canvas 16:10 / 16:9 with the verification help, K0–K2 prompts, clip model, frames, resolution, length, motion prompt, seed, expansion, the estimate card, three cap bars, and Submit disabled when the estimate is over the caps or the database is paused. Photos stay on this Mac, in D5’s words. Endpoints come from the registry, not a typed field. 16:10 stays the default because the 16:9 run is still unverified.

Deliberate differences:

- The address is `127.0.0.1:5176`, the port this brief set. The canvas prints `5174`.
- The amber line is `transport=stub` or `transport=live`. The canvas’s “ledger written 09:41 ET · fal balance read 09:41 ET · prices read 4–5 Oct” is illustrative and is not a recorded fact.
- Balance, session spend, and the caps are read from the engine. When no balance has been entered, the shell says it is not recorded. The canvas’s `$7.12` and `$0.68` are marked illustrative.
- TabNav adds Publish (the pivot’s name for Export) and Import. Import’s screen is ST3b.
- The estimate has one column, the engine’s current price. The canvas’s “Now · to 14 Oct” and “From 15 Oct” columns are retired; that date has passed.
- 768P is still a control, as D5 names it. The registry has no current row for it, so Submit says there is no current price instead of inventing one.
- A file input sits with the photo tiles so a JPEG can be chosen. The canvas draws four named tiles and no chooser.
- One photograph is sent per request, because that is what `submit` accepts. The canvas’s four-photo keyframe is one design row, not four engine calls unless each prompt is filled.
- The theme control is an extra stop after the page. The canvas sets the theme on the frame, not as a product control.

## Frame 11 · Jobs, 1000, dark, both banners

Matches: the table columns Job, Subject, Step, Model, Est., Billed, State, Time; the state pill voices (neutral, muted, ink, pitch, alarm); Completed’s two substates with Retry download and Regenerate; billed `pending` in amber italic; `unknown` on timed-out and cancelled; the refused, timed-out, and completed sentences; the database banner in the ledger voice and the out-of-credit banner in ink. Published uses the ink voice that D5 gave `exported`.

Deliberate differences:

- `exported` is not a state. `published` and `withdrawn` are, from the pivot. The canvas’s “Exported once, in PR #211” line is retired.
- Rows are seeded records, not the canvas’s `j-0112` identifiers or its illustrative times, models, and dollar figures. A subject the record does not have is “none recorded”.
- The two banners are separate server states. The canvas draws them together and says that in use they are independent. The proof captures each.
- A completed row with no substate has Download, so the stub flow can fetch the file. The canvas’s completed row does not draw that first fetch; it draws the two failure substates.
- The page polls while it is visible and does not poll while it is hidden. The jobs screenshots were taken with timers paused so a poll would not move queued and in-progress rows before the shot.

## Frame 12 · Review, 1280, light

Matches: a local file with native controls only; D5’s help line; file facts from the record; “First generation; no parent.” when there is no parent; Regenerate with the current estimate; the five checklist groups named by D5’s questions; Clear, Present, Unsure; Keep disabled, with a reason, until all five are Clear; Discard; the attestation sentence, with the walker and the time taken from the record after Keep.

Deliberate differences:

- The canvas title “j-0105 · Fenway, from the spot” and its lineage dollars are illustrative. The page uses the job id and the recorded prompt.
- Width, height, and duration are shown only when the record has them. The canvas’s `768 × 480 · 15.084 s` is a measured spike figure, not this stub file.
- The checklist’s longer explanations under each question are on the canvas and not in D5 §3’s one-line names. The page uses the §3 names.
- A clip menu is an extra stop so more than one generation can be opened. The canvas draws one clip.
- A real `<video controls>` is a tab stop. The canvas receipt used a static picture, so its 21 stops do not include it.
- The theme control is an extra stop after Discard.

## Frame 13 · Export, 1000, dark

Matches: the section “Publication gate · Article 50”; the gate sentence; Confirm disabled, with `Unavailable: the Article 50 answer is not recorded (A-06).`, until an answer is recorded; the reason is `role="status"`.

Deliberate differences, from the pivot:

- The heading is Publish, not “Export 2 kept clips as a draft pull request”.
- The PR table, the upload question, the release identity, the GitHub release addresses, the branch, and “Upload 2 clips, then open draft PR” are retired. Replacements are drafted in `studio/shared/admin-copy.ts`.
- The confirmation says the clip is written to the catalog and is live on the next read. There is no pull request and no release.
- The Card check (width, height, duration, one subject, a safe public id, a finish time) is shown in plain words. Since #226 the engine refuses those gaps. The screen's check remains a stand-in until ST3b reads `cardGaps`, so the rule lives in one place.
- Storage keys are named from the recorded hashes and the public id the operator typed, in the `<public id>/video-<sha8>.mp4` shape. They are not GitHub release addresses.
- Unpublish, Retry delete, and Retry removal follow the README: withdraw first, delete as a separate retry, removal of the site copy as its own retry. A withdrawn clip is not relisted. The clip menu refreshes after Publish and Unpublish, so the label reads `withdrawn` once the job has moved.

## Keyboard order against D5 §8

§8 counts stops on the canvas frames. The receipt records the built order. Differences:

- Frame 10’s 25 stops end in Export and include Fenway and Frankenstein, then Submit. The built composer has five tabs (Publish and Import in place of Export), one subject, the photo tile, and Choose a JPEG. Empty prompts are reached by their field ids. The theme control is last. Submit is not a stop while it is disabled: the editable shot has no motion prompt, and the budget shot is over the cap.
- Frame 11 has no numbered list in §8. The built order is the five tabs, then whichever row actions are on the table (Regenerate, Retry download, Download), then the theme control.
- Frame 12’s 21 stops are four tabs, Regenerate, five questions, and Discard, with Keep out until every line is Clear. The built review adds Import, the clip menu, and the `<video controls>` stop the canvas counted as a picture. Keep is absent while a line is unanswered and sits before Discard once all five are Clear.
- Frame 13’s 8 stops (Confirm out while the Article 50 gate is empty) become five tabs, the clip menu, the video, the gate fields, and Record the answer. Publish stays out of the order while the gate is empty or the card check refuses, the same rule as the disabled Confirm. After unpublish the stops are the five tabs, the clip, the video, the public id, the title, the position, Retry delete, Retry removal, and the theme control. Upload, the PR button, and Cancel are retired with the export copy.

## Drops recorded against the canvas

Pass 1 compared each frame’s text with the screen. These lines are on the canvas and not on the page. Each drop is deliberate.

- Frame 10, the longer subject help, the registry help, and the Frames help. D5 §3 names the controls. The page uses those names. The canvas’s extra sentences under the rows are not in §3.
- Frame 10, “Each submit writes…” and “Refusals this surface makes”. They are canvas annotations, not D5 §3 sentences. Refusals the engine returns are shown as status lines when a submit is refused.
- Frame 11, the per-state row notes for draft, budget-refused, submitted, queued, in progress, downloaded, kept, discarded, failed, and cancelled. The page uses D5 §3’s one-line state sentences where D5 has one. The canvas’s extra commentary on each row is illustrative.
- Frame 12, the Model line. It was not rendered. `readReview` returns the endpoint, and the page now also reads resolution, seed, and expansion and renders `Model · endpoint · resolution · seed · expansion`.
- Frame 12, the attestation footnote. The card uses the attestation written on the record. The canvas footnote is a design annotation, not a second sentence in §3.
- Jobs at 1000. The canvas draws one-line rows. The Job cell now shows eight characters of the id and does not wrap. The full id is the cell’s title.
- An empty public id used to say the keys wait on recorded hashes. It now says they cannot be named until a public id is typed. The hash sentence remains for a typed id whose clip or still has no hash.
