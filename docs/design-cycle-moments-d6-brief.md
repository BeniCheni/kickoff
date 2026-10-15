# Moments D6 — the design brief for the pivot (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Mon 12 Oct 2026, after Beni's pivot that evening ([moments-pivot-record.md](moments-pivot-record.md) §1), for Claude Design (Fable 5.1 Extra) on the Fergie Time design system, and delivered in chat; this copy is the archive. It asked for the generated-only gallery, the watch page with autoplay-next, the privacy rewrite, and Publish and Unpublish in the Studio. Claude Design answered with D6 (fingerprint `c3812bf3…7478`).

---

````text
Claude Design brief — D6: Moments as a gallery of Kickoff's own generated videos, with thumbnails and a YouTube-style watch page, plus the Studio's Publish screen

Run this against the Fergie Time design system project, in the same Claude Design project as D1–D5. Written by Kickoff's PM seat (Claude Code) on Mon 12 Oct 2026 (TZ=America/New_York) from main at f523b52. Precedence: the Fergie Time design system, then this brief, then any implementation prompt written from your canvas. Write D6 beside D1–D5 (`Kickoff Moments - D6 design canvas.html`, `Kickoff Moments - D6 spec.md`, a `d6/` folder), leave D1–D5 untouched, and produce a D6 manifest by D5's recipe. Name nothing with a release number.

WHAT CHANGED. Beni ruled a pivot on Mon 12 Oct 2026, first-hand to the PM seat:
- **Drop.** Moments no longer shows curated YouTube highlights. It becomes a gallery of Kickoff's own generated videos only: Fenway and Frankenstein, made in the Studio through fal.
- **Server.** The Kickoff app moves to Next.js on Vercel, like the ByteByteGo course's MewTube app. The app reads published videos from the Studio's Supabase Postgres database through Drizzle on the server; nothing in the browser talks to the database.
- **Thumbnails.** Videos and thumbnails are stored and served from Supabase Storage. Each thumbnail also has a copy shipped with the site, as a fail-safe when Supabase cannot answer.
- **Publication** becomes a Studio action: Publish writes to the database and the video is live. It is no longer a pull request per edition.
- **The watch page.** Beni added autoplay-next and omitted likes, comments and view counts. Kickoff stays without accounts, comments or analytics, so the hard rule against invented numbers needs no new counter.

D5 (`docs/design-cycle-moments-d5-spec.md`) stays the base for everything it still covers. D6 redraws only what the pivot changes.

WHAT STAYS SETTLED, and must not move:
- The design system's tokens, type, lenses (Ledger, Poster, Broadcast), themes and hard rules. Never an invented number as real: no view counts, likes or subscriber numbers, because Kickoff has no analytics and no accounts. Amber is for data trust only. No motion beyond the budget (D5 §4: no new motion).
- The Generated badge, rendered from the record's kind and never hidden (Q1, ink inverse).
- The provenance rows under Source & curation (15.7: the prompt is published), and the attestation.
- Native video controls (Q2) and sound on at Play (Q5).
- No autoplay on entry or re-entry: the first video of a visit starts only when the reader presses Play. Beni's one exception, ruled 12 Oct, is autoplay-next (B below).
- The hosted recovery copy keyed to the media error codes (D5 §3, PM4).
- The fourteen-state Studio surface, its checklist where Present or Unsure blocks Keep (Q10), its accessibility rules (D5 §8), and the caps.
- The global Privacy & terms link on every tab (A-07).
- The `?only=` and `&date=` URL parameters, a contract another system reads.
- Fixtures and Table, untouched apart from that link.

WHAT D6 DESIGNS.

A. **The gallery, now thumbnails.**
- **The card.** Each card leads with the video's thumbnail (16:10 or 16:9; the bars question is D5 A4), then the title, the Generated badge, the duration, and the date generated. No count of any kind.
- **Load states**, each with honest copy: loading; the thumbnail from Supabase; the site's fallback copy when Supabase fails; and both failing, where you may reuse D5's STUDIO typographic cover as the last resort.
- **The list is unavailable** when the server cannot reach the database (Supabase's Free plan pauses a project after a week idle). The copy says so plainly, without guessing why. Say whether the gallery can still show the fallback copies in that state.
- **Order and filter.** Order is Beni's authored order (15.6). Filtering keeps working, and the Generated badge is never filtered away.
- **Drawn** at 360, 390 and about 1000, in the three lenses and both themes.

B. **The watch page.** Clicking a thumbnail opens a view-only player page, like YouTube's watch page and like the Studio's Review screen (D5 frame 12) without its maintenance controls (checklist, Keep, Discard, Regenerate, upload).
- **On the page:**
  - the player: native controls, which give play and pause, the seek bar and time, volume, fullscreen, and picture-in-picture where the browser offers it;
  - the title and the Generated badge;
  - the date generated and the editorial note;
  - provenance under Source & curation;
  - a copy-link action;
  - an Up next list of other videos in authored order.
- **No likes, comments, subscriptions or view counts.** Beni omitted them on 12 Oct; draw no placeholder for them.
- **Autoplay-next** (Beni, 12 Oct). When a video ends, the next one in Up next order starts by itself, like YouTube's autoplay. Only after a Play the reader pressed: nothing ever starts on entry or re-entry. Design:
  - the toggle: its label, its place (beside the player or at the head of Up next), and its default (Q16);
  - whether the toggle's choice is remembered (Q17). Memory only for the visit, or a new browser-storage key, which the privacy page must then list;
  - the countdown before the next video starts, with a Cancel. It sits below or beside the player, never drawn over the picture. It changes text once a second, with no animation, so the motion budget holds. It is announced politely to assistive technology, with focus left where it is;
  - what happens at the end of the list (stop; no loop), after a media error (stop and show the recovery copy; never skip silently past a failure), in theater mode (Q14), and when the reader has paused or left the page;
  - one host and one video element throughout: the next video loads into the same element. Whether every browser allows that play without a fresh press is not verified, and the build will test it (Safari and iOS above all). Draw what the reader sees if the browser refuses: the next video ready, with Play.
- **Keyboard shortcuts.** D5 promised none (D-44). Beni now asks for YouTube's common features, so propose a minimal set (for example Space or K, the arrow keys, F and M) and give each one's accessible discovery and its conflicts with the page, or recommend leaving shortcuts to the browser's native controls. This is question Q13.
- **The URL** of a watch page must sit beside, and never change, `?only=` and `&date=`. Propose its shape.
- **Cinema.** Floodlights Cinema was approved on 25 Sep as an overlay. Propose whether it becomes the watch page's theater mode, like YouTube's, or stays as it is. This is question Q14.
- **States, drawn:** ready, playing, paused, ended with autoplay-next off (Replay; Up next waits for a click), ended with it on (the countdown, then cancelled), the browser refusing the automatic play, media error (D5's hosted recovery copy), video not found or unpublished, and the server unavailable.
- **Drawn** at 390 and about 1000, plus theater mode at 1000.

C. **The Privacy & terms page, rewritten for the pivot.**
- **Remove the YouTube sections.** There is no YouTube API client any more, so the notice at Play, the YouTube source line and Q12's rule fall away.
- **Who sees a visit** now includes:
  - Vercel, which serves the site;
  - Supabase, which serves the gallery's data through the site's server and the thumbnails and videos directly;
  - Google Fonts.
- **Each of those** is a line with what it sees.
- **The storage keys** are unchanged, unless your design adds one; then list it.
- **Terms.** Whether to keep a short Terms of use section now that YouTube's III.A.1 no longer requires one is question Q15, with your recommendation.

D. **The Studio's Publish screen, replacing Export (frame 13).**
- **Publish** uploads the video and its thumbnail to Supabase Storage and marks the record published, and it is live on Kickoff at once. Say that plainly; Beni's A-04 "Disclose" spirit applies.
- **The A-06 gate stays.** No generated clip is published until an explicit answer on EU AI Act Article 50 is recorded. Draw both states.
- **Unpublish**, the withdrawal path that replaces a revert PR, also needs a screen.
- **Q9's `exported`** becomes `published`: a clip is published once, and Publish never lists it again. Draw it in the jobs list.
- **Also draw** what happens to the site's fallback copy of the thumbnail.

E. **What goes.** Mark these as withdrawn in the D6 changelog: D5's YouTube notice (B1, A-01), the YouTube source line and Q12/A-08, the YouTube parts of the privacy page, the GitHub Releases export rows (§10, A-03, A-04's PR wording, verify-media), and the per-state Moments foot lines where the shell foot covers them. A-01, A-03 and A-08 are superseded by the pivot, not overturned for cause; say so.

HONESTY RULES. The same as D1's. Never a confident lie; a state you cannot know is drawn as unknown. Every new colour pair carries its measured contrast in both themes. Copy is written verbatim. Values are labelled ILLUSTRATIVE unless measured. Nothing implies a real club, player or result.

ARTBOARDS WANTED.
1. The gallery grid at 360, 390 and 1000, in three lenses and both themes.
2. Card load states, including the fallback copy and the last-resort cover.
3. The list unavailable.
4. The watch page at 390 and 1000: ready, playing, paused, ended, error, not found, and the server unavailable.
5. Theater mode at 1000.
6. The Up next list with the autoplay-next toggle on and off, the countdown, Cancel, and the end of the list.
7. The watch page's details and provenance, open.
8. The keyboard-shortcut proposal (Q13).
9. The privacy page at 390 and 1000, both themes.
10. The Studio's Publish screen: gate unanswered and answered; publishing; published; partial failure.
11. Unpublish.
12. The jobs list with `published`.
13. Contrast and accessibility receipts, as in D5's H1 and H3.
14. The geometry matrix, at least 360, 390, 760, 761, 887, 888 and 1000.

HANDOFF. The canvas plus a D6 spec an implementation prompt can be written from without the canvas:
1. A component inventory with every state, mapped to its slice. The slices are not numbered yet; use the names watch page, gallery, privacy, studio publish.
2. Tokens reused or added.
3. The copy deck, verbatim.
4. The motion table: no new motion unless you argue for one.
5. The artboard list with measured contrast.
6. Your recommendations.
7. The questions for Beni, each answerable in one word with the recommendation first. They start at Q13: Q13 shortcuts, Q14 theater mode, Q15 terms, Q16 autoplay-next's default, Q17 whether the toggle is remembered, plus any you add.
8. A changelog keyed to D5's IDs, including what the pivot withdraws.
````
