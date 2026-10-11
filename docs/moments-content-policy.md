# Moments — content policy

Written by the PM seat (Claude Code, Opus 5.5) on Wed 7 Oct 2026 (`TZ=America/New_York`),
after Beni's rulings of the same day. Beni ruled on 5 Oct 2026 (15.11, in
`docs/moments-studio-architecture-review.md`) that Moments has **one content policy with two
sections**: real sources, and generated content. Section one is slice 4's S5.5, the one-page
first-edition source policy he asked for on 1 Oct (ask 5 of `docs/moments-slice-4-spec.md`),
which precedes the edition ids. Section two is written before the first generated edition
(the review's PUB slice). This page assigns no version number; `policy.version` names it.

## Section one — real sources (slice 4, S5.5)

It governs the first published edition: at most five YouTube items played through the
existing player. It does not govern thumbnails, stills or hosted video.

### Beni's rulings, 7 Oct 2026

| Question | Ruling |
|---|---|
| Which uploaders may supply an item? | **Official only.** |
| How long does an embed permission last? | **90 days** from its `checkedAt`. |
| How does publication meet YouTube's privacy-policy requirement? | **A privacy page and a notice at Play**, shipped at S7. Counsel only if Beni wants the wording checked. |
| How is Made For Kids status checked? | **Exclude unverifiable.** No API key of Beni's; an item without a recorded lookup is out. |

### Which items qualify

- **Source.** The rights holder's own YouTube channel for that match: the club, the league or
  competition organiser, or the broadcaster licensed for it in the item's market. The channel
  is identified by a link to it from that organisation's own website, recorded in the item's
  proposal. Not a re-upload, a fan compilation, a reaction or commentary channel, or an
  aggregator, however popular.
- **Video.** One match's highlights, a standalone moment or celebration from it, or the
  source's own preview of it, as the source published it (`content.scope` `highlights`,
  `standalone-moment`, `celebration` or `preview`; never `compilation`, `commentary-reaction`
  or `unknown`). Landscape:
  no Shorts. Not age-restricted. Not Made For Kids, by a recorded lookup (below).
- **Fixture.** From committed snapshot history only, through the edition tool, never typed
  (Beni, 2 Oct 2026). It kicks off before the draft date minus 30 days and is absent from the
  merge-day snapshot, checked at S6c and again at S7 (spec Amendment A5), so no sync can turn
  `verify` red over it.
- **Playable here.** Its own per-id observation run, under the S6c approval as Beni's written
  authority (Amendment A3), recorded `played`. Error 150 (the owner disabled embedding) or
  a stop on that id excludes it from the draft.

### What Beni records for each item

- **Watched in full** (`content.verification` `watched`) and described from that viewing.
- **A spoiler-light title** and `neutralTitle`; nothing the video does not show.
- **The embed permission:** `use` `embed`, `status` `permitted`, `checkedAt` the instant of
  the item's own observation, `expiresAt` 90 days later, and a `basis` in this shape: *"Official
  channel of <organisation>, linked from <official site>. Embedding enabled by the uploader and
  observed played on <date>, loopback, Chrome <version>. YouTube Terms of Service (effective 15
  Dec 2023), License to Other Users: uploaders license other users to use their content 'only as
  enabled by a feature of the Service (such as video playback or embeds)'. Made For Kids:
  false, looked up <date> by <route>."*
- **Made For Kids.** YouTube requires each embedding site to look up the status of every video
  it embeds (Developer Policies III.E.4.j), through the Data API's `videos.list` with
  `part=id,status`, reading `status.madeForKids`. Beni ruled no key of his own. The one keyless
  route on Google's own pages is the APIs Explorer ("Try it") on the `videos.list` reference;
  whether it returns the field without sign-in, for a video the caller does not own, is
  **unverified**, and S6b tries it on one id first. If no route Beni accepts produces a
  recorded `false`, no item is verifiable and the first edition waits for a new ruling.

A permission lapses on its own: past `expiresAt` the player parks and the item stays a link.
Renewal is a fresh per-id observation and a small PR moving `checkedAt` and `expiresAt`. No
test or build reads the wall clock against these dates (Amendment A7).

### Removal

If an observation, a reader or the source shows an item gone, owner-blocked, no longer
embeddable, re-labelled Made For Kids, or its owner asks: its permission becomes `revoked`, or
the item is removed, in a PR the same day. Any S8 stop is met by the staged revert to `[]`
(Amendment A10).

### What publishing an embed binds Kickoff to

Read on 7 Oct 2026 from the primary sources: the YouTube Terms of Service (effective 15 Dec
2023), and the YouTube API Services Terms, Developer Policies and Required Minimum
Functionality (each last updated 14 Sep 2026). The API Terms define "YouTube API Services"
as the services made available by YouTube, "including those YouTube API services made
available on the YouTube Developer Site", plus the documentation and the data provided
through them; the IFrame Player API that Moments loads is documented there and its reference
points to all three. Kickoff becomes an "API Client" at publication on that reading.

- **A privacy policy users agree to** before using the client's features, linking Google's
  Privacy Policy (III.A.2). Kickoff has none today. Ruled: S7 ships a short privacy page,
  written from what Kickoff does (browser storage only, the player loads only after Play,
  YouTube and Google may set cookies and serve ads), and a one-line notice at the first Play.
- **YouTube shown as the source** of what it displays (III.F.2.a): the player's own branding,
  and the card's source name and watch link.
- **The player untouched:** at least 200 × 200 px, nothing drawn in front of any part of it,
  no modification beyond the documented API (Required Minimum Functionality, and the
  Developer Policies' player rules). The 200px boxes (Beni, 29 Sep) and the Cinema repair
  (#159) meet the first two.
- **No autoplay on entry** (Kickoff never autoplays), and never more than one playing player.
- **Nothing that promotes unlawful online gambling.** Moments carries no odds, no betting
  link and no sportsbook name, and the edition copy keeps it that way.

### When to ask counsel (Beni's 15.12 approach: a primary-source read, not counsel by default)

Before the S7 merge, if any of these holds: an item's source is not plainly the rights
holder's official channel; any takedown, claim or contact from a rights holder; Kickoff
starts earning money; a betting link, odds or sportsbook name would sit near Moments; Beni
wants the privacy page's wording or its "agree" mechanism checked; or YouTube's terms change
before S7 in a way this page does not cover.

## Section two — generated content (Moments Studio)

Not yet written. It is written before the first generated edition merges, from the primary
read Beni ruled on 5 Oct (15.12: fal's Terms of Service on outputs and licence, and EU AI Act
Article 50 with the Act's definition of a deep fake, read at source and quoted here; counsel
only on the trigger the review names). Its content is set out in the review's section 11.6,
item 4 (fictional players only; no real person's name, face, voice or number-and-name
pairing; no real crest, kit, sponsor mark, competition branding or broadcaster graphics; no
claimed real result; the Generated label always visible; provenance kept) and item 7 (the
per-clip human review checklist). Until it exists, no generated item may be exported.
