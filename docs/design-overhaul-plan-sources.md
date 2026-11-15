# Kickoff design overhaul — the plan's vendor and browser sources (archived Sat 14 Nov 2026, TZ=America/New_York)

The rows that [design-overhaul-plan.md](design-overhaul-plan.md) cites in brackets, such as [A16]. The planning seat (Claude Code, Fable 5.2 Extra High) read every source on Sat 14 Nov 2026 without signing in to anything or calling an account API, and kept each row's verbatim quote in its local notes. The PM seat archived the rows here with the quote column removed, so the public record keeps each claim, where it was read and its tag without copying third-party text.

**Tags.** DOCUMENTED: the page at the source states it. UNVERIFIED: no primary page was found that states it, or the page said something different or could not be reached; the row says which.

**Browser-version rows** name a key in MDN's browser-compat data instead of a page. That data was read from `https://bcd.developer.mozilla.org/bcd/api/v0/current/<key>.json`, the endpoint behind MDN's compatibility tables, on the same date.

## A. Font licences and subsets

| # | Claim | Source read | Tag |
|---|---|---|---|
| A1 | Abril Fatface is licensed under SIL OFL 1.1 (METADATA.pb says `license: "OFL"`; OFL.txt names version 1.1). | https://raw.githubusercontent.com/google/fonts/main/ofl/abrilfatface/OFL.txt and https://raw.githubusercontent.com/google/fonts/main/ofl/abrilfatface/METADATA.pb | DOCUMENTED |
| A2 | Abril Fatface's OFL.txt copyright line (two lines in the file) declares two Reserved Font Names: "Abril" and "Abril Fatface". | https://raw.githubusercontent.com/google/fonts/main/ofl/abrilfatface/OFL.txt | DOCUMENTED |
| A3 | Abril Fatface's METADATA.pb `copyright:` field is not identical to OFL.txt (the year is doubled and an e-mail address is added). | https://raw.githubusercontent.com/google/fonts/main/ofl/abrilfatface/METADATA.pb | DOCUMENTED |
| A4 | Abril Fatface subsets are menu, latin, latin-ext — latin-ext is present. One static file, `AbrilFatface-Regular.ttf`, weight 400. | https://raw.githubusercontent.com/google/fonts/main/ofl/abrilfatface/METADATA.pb | DOCUMENTED |
| A5 | Libre Caslon Text is licensed under SIL OFL 1.1 (METADATA.pb `license: "OFL"`). | https://raw.githubusercontent.com/google/fonts/main/ofl/librecaslontext/OFL.txt and https://raw.githubusercontent.com/google/fonts/main/ofl/librecaslontext/METADATA.pb | DOCUMENTED |
| A6 | Libre Caslon Text's OFL.txt copyright line declares **no** Reserved Font Name. | https://raw.githubusercontent.com/google/fonts/main/ofl/librecaslontext/OFL.txt | DOCUMENTED |
| A7 | Libre Caslon Text's METADATA.pb copyright year (2020) differs from OFL.txt (2018). Two variable files: `LibreCaslonText[wght].ttf` and `LibreCaslonText-Italic[wght].ttf`. | https://raw.githubusercontent.com/google/fonts/main/ofl/librecaslontext/METADATA.pb | DOCUMENTED |
| A8 | Libre Caslon Text subsets are latin, latin-ext, menu — latin-ext is present. | https://raw.githubusercontent.com/google/fonts/main/ofl/librecaslontext/METADATA.pb | DOCUMENTED |
| A9 | Chakra Petch is licensed under SIL OFL 1.1 (METADATA.pb `license: "OFL"`). | https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/OFL.txt and https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/METADATA.pb | DOCUMENTED |
| A10 | Chakra Petch's OFL.txt copyright line declares **no** Reserved Font Name (METADATA.pb carries the same string). | https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/OFL.txt | DOCUMENTED |
| A11 | Chakra Petch subsets are latin, latin-ext, menu, thai, vietnamese — latin-ext is present. Static files, weights 300–700, each with an italic. | https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/METADATA.pb | DOCUMENTED |
| A12 | Oswald is licensed under SIL OFL 1.1 (METADATA.pb `license: "OFL"`). | https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt and https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/METADATA.pb | DOCUMENTED |
| A13 | Oswald's OFL.txt copyright line declares **no** Reserved Font Name (METADATA.pb carries the same string). | https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt | DOCUMENTED |
| A14 | Oswald subsets are cyrillic, cyrillic-ext, latin, latin-ext, menu, vietnamese — latin-ext is present. One variable file, `Oswald[wght].ttf`. | https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/METADATA.pb | DOCUMENTED |
| A15 | IBM Plex Mono is licensed under SIL OFL 1.1 (METADATA.pb `license: "OFL"`). | https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/OFL.txt and https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/METADATA.pb | DOCUMENTED |
| A16 | IBM Plex Mono's OFL.txt copyright line declares the Reserved Font Name "Plex". METADATA.pb's field differs: `"Copyright 2017 IBM Corp. All rights reserved."` | https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/OFL.txt | DOCUMENTED |
| A17 | IBM Plex Mono subsets are cyrillic, cyrillic-ext, latin, latin-ext, menu, symbols2, vietnamese — latin-ext is present. Static files, weights 100–700, each with an italic. | https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/METADATA.pb | DOCUMENTED |
| A18 | Orbitron's subsets are latin and menu only — it **lacks latin-ext**. | https://raw.githubusercontent.com/google/fonts/main/ofl/orbitron/METADATA.pb | DOCUMENTED |
| A19 | Orbitron is OFL 1.1 and declares the Reserved Font Name "Orbitron". | https://raw.githubusercontent.com/google/fonts/main/ofl/orbitron/OFL.txt | DOCUMENTED |
| A20 | OFL 1.1 condition 2: every redistributed copy must contain the copyright notice and the licence. | https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt | DOCUMENTED |
| A21 | OFL 1.1 condition 2: the notice and licence may be separate text files, headers, or metadata fields inside the font file, if easily viewable. | https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt | DOCUMENTED |
| A22 | OFL 1.1 defines a Modified Version to include adding, deleting or substituting components **and changing formats**. | https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt | DOCUMENTED |
| A23 | OFL 1.1 condition 3: a Modified Version may not use a Reserved Font Name without written permission; the restriction covers the primary font name shown to users. | https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt | DOCUMENTED |
| A24 | OFL 1.1 condition 5: the fonts, modified or not, must stay under the OFL (condition 1: they may not be sold by themselves). | https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt | DOCUMENTED |
| A25 | The OFL FAQ read is version 1.1-update8, dated November 2026 on the page. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A26 | FAQ 2.1: serving OFL fonts as webfonts from your own server is allowed, and the FAQ classes it as distribution. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A27 | FAQ 2.10: webfonts are **not** embedding (so the embedding exemption from carrying the licence does not apply). | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A28 | FAQ 1.11: anything other than embedding is distribution and must carry the copyright notices and licensing information from OFL.txt. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A29 | FAQ 1.10: a link to the OFL in font metadata is legally sufficient but discouraged; full text in a file or metadata is preferred. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A30 | FAQ 2.4: the font file's own metadata should carry the copyright and licence information. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A31 | FAQ 2.2: a format change is normally a modification, so Reserved Font Names cannot be used. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A32 | FAQ 2.2.1: a WOFF/WOFF2 version is **not** a modification only if the font data is unchanged apart from compression and the original metadata is omitted or carried over unaltered. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A33 | FAQ 2.2.2: conversion tools do not automatically meet those two requirements. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A34 | FAQ 2.6: **subsetting a webfont is a modification**; permitted, but RFNs normally cannot then be used. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A35 | FAQ 2.5: site-specific optimised versions are Modified Versions and must be renamed where the OFL requires. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A36 | FAQ 2.7: an optimised webfont may keep an RFN only if it preserves Functional Equivalence (same character inventory, same smart behaviour, no visual degradation, metadata kept). | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A37 | FAQ 5.3: the RFN restriction covers the font menu name and other mechanisms that specify a font in a document. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A38 | FAQ 5.8: an RFN may be used on a Modified Version only under a separate written agreement with the copyright holder. | https://openfontlicense.org/ofl-faq/ | DOCUMENTED |
| A39 | *Inference, not a page statement:* A2 + A16 + A34 + A23 together mean a latin-subset WOFF2 of **Abril Fatface** or **IBM Plex Mono** is a Modified Version that may not carry "Abril", "Abril Fatface" or "Plex" as its font name without permission; Libre Caslon Text, Chakra Petch and Oswald declare no RFN. No page read applies the rule to these families by name, and none says how a CSS `font-family` alias is treated. | (derived from A2, A16, A23, A34, A37) | UNVERIFIED (no primary page states the application to these families; searched the OFL text and FAQ only) |

## B. Google Fonts and privacy

| # | Claim | Source read | Tag |
|---|---|---|---|
| B1 | Font requests go to resource-specific domains; the API is unauthenticated and sets and logs no cookies. | https://fonts.google.com/faq#privacy | DOCUMENTED |
| B2 | Each request carries the visitor's IP address, the requested URL, and HTTP headers including user agent and referer. | https://fonts.google.com/faq#privacy | DOCUMENTED |
| B3 | Google says it receives the IP address and processes it to answer the request and for security. | https://fonts.google.com/faq#privacy | DOCUMENTED |
| B4 | Google says it does not profile or target ads from Google Fonts data. | https://fonts.google.com/faq#privacy | DOCUMENTED |
| B5 | Self-hosting the fonts sends Google nothing about site visits. | https://fonts.google.com/faq#privacy | DOCUMENTED |
| B6 | *Expected but not found:* that Google **logs** IP addresses, or for how long. The page as read says "receives" and "processes"; the only use of "log" is the cookie sentence in B1, and no retention period appears. | https://fonts.google.com/faq#privacy | UNVERIFIED (page reached; it does not state logging or retention of IP addresses) |

## C. WCAG 2.2 and ARIA

| # | Claim | Source read | Tag |
|---|---|---|---|
| C1 | SC 2.2.2 Pause, Stop, Hide is Level A. For moving, blinking or scrolling content the three triggers are: starts automatically, lasts more than five seconds, shown in parallel with other content. | https://www.w3.org/TR/WCAG22/#pause-stop-hide | DOCUMENTED |
| C2 | SC 2.2.2: for that content there must be a mechanism to pause, stop or hide it, unless the movement is essential. | https://www.w3.org/TR/WCAG22/#pause-stop-hide | DOCUMENTED |
| C3 | SC 2.2.2: auto-updating content has **no five-second allowance** — starting automatically and running in parallel is enough to require a control (pause, stop, hide, or control the frequency). | https://www.w3.org/TR/WCAG22/#pause-stop-hide | DOCUMENTED |
| C4 | SC 2.2.2 Note 2: this criterion applies to all content on the page (non-interference). | https://www.w3.org/TR/WCAG22/#pause-stop-hide | DOCUMENTED |
| C5 | SC 2.3.1 Three Flashes or Below Threshold is Level A: nothing flashes more than three times in one second, or the flash is below the thresholds. | https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold | DOCUMENTED |
| C6 | Glossary "flash": a pair of opposing changes in relative luminance. | https://www.w3.org/TR/WCAG22/ (glossary, "flash") | DOCUMENTED |
| C7 | Glossary "general flash and red flash thresholds", count condition: at most three general and/or three red flashes per second. | https://www.w3.org/TR/WCAG22/#dfn-general-flash-and-red-flash-thresholds | DOCUMENTED |
| C8 | Same definition, area condition: concurrent flashes cover no more than .006 steradians within any 10-degree visual field (the definition glosses this as 25% of any 10-degree field). | https://www.w3.org/TR/WCAG22/#dfn-general-flash-and-red-flash-thresholds | DOCUMENTED |
| C9 | A general flash is a pair of opposing changes of 10% or more of maximum relative luminance, where the darker image is below 0.80 relative luminance. | https://www.w3.org/TR/WCAG22/#dfn-general-flash-and-red-flash-thresholds | DOCUMENTED |
| C10 | A red flash is any pair of opposing transitions involving a saturated red. | https://www.w3.org/TR/WCAG22/#dfn-general-flash-and-red-flash-thresholds | DOCUMENTED |
| C11 | Note 1 of that definition: a 341 × 256 px rectangle at 1024 × 768 is a good estimate of a 10-degree visual field. | https://www.w3.org/TR/WCAG22/#dfn-general-flash-and-red-flash-thresholds | DOCUMENTED |
| C12 | SC 2.5.8 Target Size (Minimum) is Level AA (new in 2.2): 24 by 24 CSS pixels, with five exceptions (Spacing, Equivalent, Inline, User Agent Control, Essential). | https://www.w3.org/TR/WCAG22/#target-size-minimum | DOCUMENTED |
| C13 | SC 2.5.8 Spacing exception: an undersized target passes if a 24 px circle centred on it intersects no other target or other undersized target's circle. | https://www.w3.org/TR/WCAG22/#target-size-minimum | DOCUMENTED |
| C14 | SC 2.5.5 Target Size (Enhanced) is Level AAA: 44 by 44 CSS pixels, with exceptions (Equivalent, Inline, User Agent Control, Essential). | https://www.w3.org/TR/WCAG22/#target-size-enhanced | DOCUMENTED |
| C15 | SC 1.4.3 Contrast (Minimum) is Level AA: 4.5:1 for text and images of text. | https://www.w3.org/TR/WCAG22/#contrast-minimum | DOCUMENTED |
| C16 | SC 1.4.3: large-scale text needs 3:1. | https://www.w3.org/TR/WCAG22/#contrast-minimum | DOCUMENTED |
| C17 | Glossary "large scale (text)": at least 18 point, or 14 point bold. | https://www.w3.org/TR/WCAG22/#dfn-large-scale | DOCUMENTED |
| C18 | Large-scale Note 3: 14 pt and 18 pt are roughly 1.2 em and 1.5 em of default body text (authors must check the actual font). | https://www.w3.org/TR/WCAG22/#dfn-large-scale | DOCUMENTED |
| C19 | SC 1.4.3 exempts logotypes (and incidental text: inactive components, pure decoration, invisible text, text in a picture with significant other content). | https://www.w3.org/TR/WCAG22/#contrast-minimum | DOCUMENTED |
| C20 | SC 2.3.3 Animation from Interactions is Level AAA. | https://www.w3.org/TR/WCAG22/#animation-from-interactions | DOCUMENTED |
| C21 | Glossary "motion animation" excludes colour, blur and opacity changes that do not change perceived size, shape or position. | https://www.w3.org/TR/WCAG22/#dfn-motion-animation | DOCUMENTED |
| C22 | APG Carousel: the container has role `region` or `group` and `aria-roledescription="carousel"`. | https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ | DOCUMENTED |
| C23 | APG Carousel: each slide is a `group` with `aria-roledescription="slide"` (in the tabbed variant slides are `tabpanel` with no roledescription). | https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ | DOCUMENTED |
| C24 | APG Carousel: an auto-rotating carousel needs a button that stops and restarts rotation; previous and next buttons are needed in all cases. | https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ | DOCUMENTED |
| C25 | APG Carousel: the rotation control comes first in the Tab order inside the carousel, before the rotating content. | https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ | DOCUMENTED |
| C26 | APG Carousel: the rotation control's label changes with the action ("Stop slide rotation" / "Start slide rotation") and therefore it carries **no** `aria-pressed`. | https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ | DOCUMENTED |
| C27 | APG Carousel: the optional live region wrapping the slides is `aria-live="off"` while auto-rotating and `polite` when not; `aria-atomic` is false. | https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ | DOCUMENTED |
| C28 | APG Carousel: rotation stops when keyboard focus enters and does not restart unless the user asks. | https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ | DOCUMENTED |
| C29 | APG Carousel: rotation stops while the mouse hovers over the carousel. | https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ | DOCUMENTED |
| C30 | APG Button: a toggle button uses `aria-pressed`, and its label must **not** change when the state changes. | https://www.w3.org/WAI/ARIA/apg/patterns/button/ | DOCUMENTED |
| C31 | APG Button: the alternative is a label that changes, in which case `aria-pressed` is not used. So it is one or the other, never both (consistent with C26). | https://www.w3.org/WAI/ARIA/apg/patterns/button/ | DOCUMENTED |

## D. Browser platform

| # | Claim | Source read | Tag |
|---|---|---|---|
| D1 | `prefers-reduced-motion` detects an OS-level reduce-motion setting; values are `no-preference` and `reduce`. MDN marks it Baseline Widely available since January 2020. | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion | DOCUMENTED |
| D2 | `prefers-reduced-motion` first versions: Chrome 74, Edge 79, Firefox 63, Safari 10.1, Safari on iOS 10.3. | BCD key `css.at-rules.media.prefers-reduced-motion` | DOCUMENTED |
| D3 | `requestAnimationFrame` is paused in most browsers in background tabs and hidden iframes. | https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame | DOCUMENTED |
| D4 | rAF callback rate generally follows the display refresh rate, so animation must be time-based or it runs faster on high-refresh screens. | https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame | DOCUMENTED |
| D5 | Page Visibility: `visibilitychange` fires on the document when visibility changes; the transition to hidden is the last reliably observable event. | https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event | DOCUMENTED |
| D6 | `visibilitychange` first full versions: Chrome 62, Firefox 56, Safari 14.1, Safari on iOS 14.5. Safari before that is marked partial (did not fire when navigating away; MDN's banner says Baseline since April 2021). | BCD key `api.Document.visibilitychange_event` | DOCUMENTED |
| D7 | IntersectionObserver first versions: Chrome 51, Edge 15, Firefox 55, Safari 12.1, Safari on iOS 12.2 (MDN: Baseline Widely available since March 2019). | https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver and BCD key `api.IntersectionObserver` | DOCUMENTED |
| D8 | `fetchpriority` on `img` is a hint (`high`, `low`, `auto`) for fetch priority relative to other images. MDN marks it Baseline 2024, newly available since October 2024. | https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/fetchPriority | DOCUMENTED |
| D9 | `fetchpriority` on `img` first versions: Chrome 101, Edge 101, Firefox 132, Safari 17.2, Safari on iOS 17.2. | BCD key `html.elements.img.fetchpriority` | DOCUMENTED |
| D10 | AVIF support per MDN's image guide: Chrome 85, Edge 121, Opera 71, Firefox 93, Safari 16.1; Firefox animated AVIF from 113. | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types | DOCUMENTED |
| D11 | AVIF per caniuse: Chrome 85; Firefox 93 (stills; full from 113); Edge 121; Safari macOS 16.1–16.3 partial (stills only, macOS 13 Ventura or later, no noise synthesis), full from 16.4; **Safari on iOS 16.0–16.3 stills without noise synthesis, full from 16.4**. | https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/avif.json | DOCUMENTED |
| D12 | WebP per caniuse: Chrome 32 full (partial 9–31); Firefox 65; Edge 18; Safari macOS 14–15.6 needs macOS 11 Big Sur or later, unconditional from 16.0; Safari on iOS from 14.0. | https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/webp.json | DOCUMENTED |
| D13 | `<picture>`: a `<source>` whose `type` the browser does not support is skipped; if nothing matches, the `<img>` `src` is used. | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture | DOCUMENTED |
| D14 | `<picture>` first versions: Chrome 38, Firefox 38, Edge 13, Safari 9.1, Safari on iOS 9.3. | BCD key `html.elements.picture` | DOCUMENTED |
| D15 | WebGL 1 (`WebGLRenderingContext`) first versions: Chrome 9, Firefox 4, Edge 12, Safari 5.1, Safari on iOS 8 (MDN: Baseline Widely available since July 2015). | https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext and BCD key `api.WebGLRenderingContext` | DOCUMENTED |
| D16 | `webglcontextlost` fires on the canvas when the drawing buffer is lost; same first versions as WebGL 1. | https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event | DOCUMENTED |
| D17 | MDN's WebGL best practices tell pages to handle context loss, which can follow GPU memory exhaustion. | https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices | DOCUMENTED |
| D18 | Chromium caps active WebGL contexts at 16 (8 on Android), 4 on a worker; past the cap the oldest context is lost. The set is per renderer thread, not strictly per page. No documentation page states this. | https://raw.githubusercontent.com/chromium/chromium/main/content/renderer/webgraphicscontext3d_provider_impl.cc | DOCUMENTED (source code) |
| D19 | Chromium's console warning when the cap is hit. | https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/modules/webgl/webgl_rendering_context_base.cc | DOCUMENTED (source code) |
| D20 | WebKit (Safari, including iOS) caps active WebGL contexts at 16 on the main thread, 4 on a worker; past the cap the oldest is recycled and the page cannot force its restoration. No documentation page states this. | https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/html/canvas/WebGLRenderingContextBase.cpp | DOCUMENTED (source code) |
| D21 | A **documentation** page (MDN, webkit.org, developer.chrome.com) stating a WebGL context limit. | Tried: MDN WebGL best practices, MDN `webglcontextlost_event`, MDN `WebGLRenderingContext` | UNVERIFIED (none of the pages read states a number; the numbers in D18–D20 are source code only) |
| D22 | `navigator.vibrate` is not supported in Safari on macOS or iOS. | BCD key `api.Navigator.vibrate` | DOCUMENTED |
| D23 | `navigator.vibrate` elsewhere: Chrome for Android 32+ (needs a user gesture from 60); removed from desktop Firefox in 129; Firefox for Android 79+ returns true but does not vibrate. MDN marks it not Baseline. | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate and BCD key `api.Navigator.vibrate` | DOCUMENTED |
| D24 | `vibrate()` is a no-op where unsupported by the device, and needs sticky user activation. | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate | DOCUMENTED |
| D25 | `background-clip: text` clips the background to the foreground text. Unprefixed first versions: Chrome 120, Edge 120 (legacy Edge 15–18 also), Safari 14, Safari on iOS 14; Firefox 49 (marked partial: breaks with `background-attachment: fixed` and some multi-layer backgrounds). | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/background-clip and BCD key `css.properties.background-clip` (sub-feature `text`) | DOCUMENTED |
| D26 | Before those versions only the `-webkit-` prefix worked for `text`: Chrome 3–119, Safari 4–13.1, Safari on iOS 3.2–13.4. Firefox accepts `-webkit-background-clip` from 49. | BCD key `css.properties.background-clip` (sub-feature `text`) | DOCUMENTED |
| D27 | MDN's accessibility note for `background-clip: text`: provide a fallback `background-color`, and consider `@supports`. | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/background-clip | DOCUMENTED |
| D28 | `font-display: swap` gives an extremely small block period and an infinite swap period. First versions: Chrome 60, Firefox 58, Safari 11.1, Safari on iOS 11.3. | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display and BCD key `css.at-rules.font-face.font-display` | DOCUMENTED |
| D29 | A font preload must carry `crossorigin`, **even for a same-origin font**, because fonts are fetched in anonymous-mode CORS. | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload | DOCUMENTED |
| D30 | Same page, the short form of the rule. `rel=preload` first versions: Chrome 50, Firefox 85, Safari 11.1, Safari on iOS 11.3. | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload and BCD key `html.elements.link.rel.preload` | DOCUMENTED |
| D31 | Reading `window.localStorage` can throw `SecurityError` when a policy decision blocks persistence (for example the user has blocked storage or cookies), or on `file:`/`data:` origins. | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage | DOCUMENTED |
| D32 | Blocking cookies is likely to be treated as blocking storage. | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage | DOCUMENTED |
| D33 | `setItem` can throw `QuotaExceededError`. | https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem | DOCUMENTED |
| D34 | In private browsing some browsers expose a `localStorage` with zero quota, so presence of the object is not proof it works. MDN names no browser or version. | https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API | DOCUMENTED |
| D35 | WebKit throttles rAF to 30 fps in Low Power Mode, by design — per a comment on WebKit's own tracker (bug 215745, resolved INVALID, comment 2, 24 Aug 2020). Not a documentation page. | https://bugs.webkit.org/show_bug.cgi?id=215745 | DOCUMENTED (bug-tracker comment, not a docs page) |
| D36 | WebKit source on `main`: Low Power Mode is one of the "half speed" throttling reasons, and half speed is 30 fps against a full speed of 60. | https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/platform/graphics/AnimationFrameRate.h (and `AnimationFrameRate.cpp` beside it) | DOCUMENTED (source code) |
| D37 | An Apple or webkit.org **documentation** page stating the Low Power Mode rAF throttle. Apple's Low Power Mode support page (published 21 Sep 2026) lists limited features and mentions neither refresh rate nor web animation. | https://support.apple.com/en-us/101604 | UNVERIFIED (page reached; it does not state it. Only D35 and D36 do.) |
| D38 | WebKit source on `main`: the preference "Prefer Page Rendering Updates near 60fps" is `status: stable` and defaults to true on every platform except visionOS, so page rendering updates (rAF included) are held near 60 fps on a 120 Hz display by default. | https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WTF/Scripts/Preferences/UnifiedWebPreferences.yaml | DOCUMENTED (source code) |
| D39 | A documentation or release-notes page stating which shipped iOS Safari versions run rAF above 60 Hz on 120 Hz displays. WebKit bug 173434 "Support for 120Hz requestAnimationFrame" still shows status NEW. | Tried: webkit.org search, https://bugs.webkit.org/show_bug.cgi?id=173434 | UNVERIFIED (no docs page found; only D38's source default) |
| D40 | Chrome DevTools remote debugging for Android: enable USB debugging on the device, then open `chrome://inspect#devices` on the desktop with "Discover USB devices" enabled. | https://developer.chrome.com/docs/devtools/remote-debugging | DOCUMENTED |
| D41 | Safari Web Inspector for iOS (webkit.org): enable Settings → Safari → Advanced → Web Inspector on the device, connect to a Mac, and the device appears in Safari's Develop menu. Page last updated 19 Mar 2025. | https://webkit.org/web-inspector/enabling-web-inspector/ | DOCUMENTED |
| D42 | Safari Web Inspector for iOS (Apple): the path is Settings → Apps → Safari → Advanced → Web Inspector; network inspection is possible after a first cable connection. Read through the page's own data endpoint because the page is client-rendered. | https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios (data: https://developer.apple.com/tutorials/data/documentation/safari-developer-tools/inspecting-ios.json) | DOCUMENTED |
| D43 | The Long Animation Frames API reports rendering updates delayed beyond 50 ms, observed with a `PerformanceObserver` on `long-animation-frame`; the buffer holds 200 entries. | https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Long_animation_frame_timing | DOCUMENTED |
| D44 | LoAF shipped in Chrome 123 (and Edge 123, Samsung Internet 27). **Not supported in Firefox or Safari**, so it cannot measure frames on iOS. | https://developer.chrome.com/docs/web-platform/long-animation-frames and BCD key `api.PerformanceLongAnimationFrameTiming` | DOCUMENTED |
| D45 | The cross-browser way to measure frame time is the rAF callback's timestamp argument; MDN warns to use it rather than assume a rate. | https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame | DOCUMENTED |

## E. Hosting limits

| # | Claim | Source read | Tag |
|---|---|---|---|
| E1 | A published GitHub Pages site may be at most 1 GB. | https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits | DOCUMENTED |
| E2 | GitHub Pages has a soft bandwidth limit of 100 GB per month. | https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits | DOCUMENTED |
| E3 | Pages source repositories have a recommended limit of 1 GB. | https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits | DOCUMENTED |
| E4 | A Pages deployment times out after 10 minutes. | https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits | DOCUMENTED |
| E5 | The soft limit of 10 builds per hour does not apply to a site built and published by a custom GitHub Actions workflow. | https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits | DOCUMENTED |
| E6 | GitHub warns on a file over 50 MiB (the push still succeeds). | https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github | DOCUMENTED |
| E7 | GitHub blocks files over 100 MiB. | https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github | DOCUMENTED |
| E8 | A file added through the browser may be at most 25 MiB. | https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github | DOCUMENTED |
| E9 | Repository size: ideally under 1 GB, under 5 GB strongly recommended. | https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github | DOCUMENTED |
| E10 | Vercel Hobby: source files uploaded by a **CLI** deploy are capped at 100 MB (Pro 1 GB). The limits table labels the row "Static File uploads". | https://vercel.com/docs/limits.md | DOCUMENTED |
| E11 | Vercel: a **CLI** deployment may upload at most 15,000 source files. | https://vercel.com/docs/limits.md | DOCUMENTED |
| E12 | Vercel sets no upper limit on build **output** files; the constraint is the 45-minute build time. | https://vercel.com/docs/limits.md | DOCUMENTED |
| E13 | Vercel Hobby general limits: 200 projects, 100 deployments created per day, 45 minutes build time per deployment. | https://vercel.com/docs/limits.md | DOCUMENTED |
| E14 | Vercel Hobby includes the first 100 GB of Fast Data Transfer (also first 10 GB Fast Origin Transfer and first 1,000,000 CDN requests). The table gives no period on the row itself; the billing section below it speaks of 30 days. | https://vercel.com/docs/plans/hobby.md | DOCUMENTED |
| E15 | Vercel Hobby has no overage billing; exceeding an allotment usually means waiting 30 days. | https://vercel.com/docs/plans/hobby.md | DOCUMENTED |
| E16 | A documented total size limit for static assets in a **Git-triggered** Vercel deployment on Hobby. | Tried: https://vercel.com/docs/limits.md, https://vercel.com/docs/plans/hobby.md, https://vercel.com/docs/limits/fair-use-guidelines.md | UNVERIFIED (the pages read state only the CLI source-upload limits in E10 and E11 and the output-file statement in E12) |

## F. Generated-image rights

| # | Claim | Source read | Tag |
|---|---|---|---|
| F1 | fal Terms of Service (last updated 8 Sep 2026): the customer owns its **input**. | https://fal.ai/legal/terms-of-service | DOCUMENTED |
| F2 | *Expected but not found:* that fal's Terms of Service say the customer **owns Output Content**. Every sentence containing "Output Content" was read: none assigns or attributes ownership of it, and section 11 "Ownership" covers only fal's Services. | https://fal.ai/legal/terms-of-service | UNVERIFIED (page reached; it is silent on who owns outputs) |
| F3 | fal's Terms disclaim that outputs are original or non-infringing, and say outputs may be the same or similar for other users. | https://fal.ai/legal/terms-of-service | DOCUMENTED |
| F4 | fal's Terms grant access to the Services for "personal or internal business use"; they contain no sentence expressly licensing outputs for commercial use. | https://fal.ai/legal/terms-of-service | DOCUMENTED |
| F5 | fal's docs FAQ: commercial use is decided **per model**, shown by a badge on the model page. | https://fal.ai/docs/documentation/model-apis/faq (redirected from https://docs.fal.ai/model-apis/faq) | DOCUMENTED |
| F6 | The fal model pages for FLUX1.1 [pro] ultra, FLUX.1 Kontext [pro], Nano Banana and the Topaz image upscaler each show a "Commercial use" badge; the ultra page adds a licence line. Whether these are the exact endpoints the project used was not checked. | https://fal.ai/models/fal-ai/flux-pro/v1.1-ultra , https://fal.ai/models/fal-ai/flux-pro/kontext , https://fal.ai/models/fal-ai/nano-banana , https://fal.ai/models/fal-ai/topaz/upscale/image | DOCUMENTED |
| F7 | fal's Terms restrict use of third-party models' outputs: no training of competing models, and no content that closely mimics training assets. | https://fal.ai/legal/terms-of-service | DOCUMENTED |
| F8 | Black Forest Labs Developer Terms of Service (last revised 4 Aug 2026), for BFL's **own** API: the developer owns the output. The terms name no individual model (no "Ultra" or "Kontext"); they cover "FLUX AI Models". | https://bfl.ai/legal/developer-terms-of-service | DOCUMENTED |
| F9 | Same terms: outputs may be used for personal or commercial purposes. | https://bfl.ai/legal/developer-terms-of-service | DOCUMENTED |
| F10 | BFL FLUX API Service Terms (last revised 4 Aug 2026): the developer licenses inputs and outputs back to BFL, including for training. | https://bfl.ai/legal/flux-api-service-terms | DOCUMENTED |
| F11 | BFL's general Terms of Service (last revised 1 Aug 2026): BFL claims no ownership of inputs or outputs. | https://bfl.ai/legal/terms-of-service | DOCUMENTED |
| F12 | That BFL's terms govern FLUX output generated **through fal** rather than through BFL's API. BFL's Developer Terms are a contract between the developer and BFL for its FLUX Services; fal's Terms call hosted third-party models "Third-Party Materials" that "may be subject to additional terms". Neither page says which BFL document, if any, binds a fal customer. | https://bfl.ai/legal/developer-terms-of-service , https://fal.ai/legal/terms-of-service | UNVERIFIED (no page read states which terms apply to FLUX output obtained via a reseller) |
| F13 | Gemini API Additional Terms of Service (effective 23 Mar 2026): Google claims no ownership of generated content. Requested URL `https://ai.google.dev/gemini-api/terms` answers 301 to the URL shown. | https://aistudio.google.com/docs/terms | DOCUMENTED |
| F14 | Same terms: Google may generate the same or similar content for others, and the user is responsible for use of generated content. | https://aistudio.google.com/docs/terms | DOCUMENTED |
| F15 | Gemini image generation ("Nano Banana") docs: every generated image carries a SynthID watermark. Requested URL `https://ai.google.dev/gemini-api/docs/image-generation` answers 301 to the URL shown. | https://aistudio.google.com/docs/image-generation | DOCUMENTED |
| F16 | Topaz Labs EULA (PDF; `https://topazlabs.com/eula` answers 301 to it; file name says "Feburary 2026"): the user keeps ownership of their media and Topaz claims no copyright in it. The EULA has no clause that separately assigns ownership of the processed **output**. | https://downloads.topazlabs.com/web-assets/Topaz+-+EULA+-+Feburary+2026.pdf | DOCUMENTED |
| F17 | Topaz EULA: outputs may not be used to train or improve AI/ML models. | https://downloads.topazlabs.com/web-assets/Topaz+-+EULA+-+Feburary+2026.pdf | DOCUMENTED |
| F18 | Topaz EULA: a Personal License bars Commercial Use by employees of organisations with revenue over USD 1,000,000; a Professional License allows it; for web applications it depends on the plan. This governs Topaz's own products, not Topaz reached through a reseller. | https://downloads.topazlabs.com/web-assets/Topaz+-+EULA+-+Feburary+2026.pdf | DOCUMENTED |
| F19 | pen.dev Terms of Use (effective 26 Oct 2026; `https://pen.dev/terms` redirects to the URL shown): the user owns AI-generated outputs, subject to third-party rights. The page does not name a "Generate" tool. | https://www.pen.dev/terms-of-use | DOCUMENTED |
| F20 | pen.dev: image and SVG features run on third-party services (Google Gemini, OpenAI, Quiver AI, Recraft, Unsplash named) whose own terms apply. | https://www.pen.dev/terms-of-use | DOCUMENTED |
| F21 | US Copyright Office, *Copyright and Artificial Intelligence, Part 2: Copyrightability* (January 2025), executive summary: purely AI-generated material is not protected. | https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf | DOCUMENTED |
| F22 | Same report: prompts alone are not enough for authorship with current technology. | https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf | DOCUMENTED |
| F23 | Same report: human authors keep copyright in what they contribute — perceptible human-authored material, creative selection or arrangement, creative modifications. | https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf | DOCUMENTED |
| F24 | The Office's own announcement of Part 2 (29 Jan 2025) states the same conclusion. | https://www.copyright.gov/newsnet/2025/1060.html | DOCUMENTED |
| F25 | Creative Commons (post of 18 Aug 2023): CC licences can be applied to work made with generative AI; the licence covers the human contribution. | https://creativecommons.org/2023/08/18/understanding-cc-licenses-and-generative-ai/ | DOCUMENTED |
| F26 | Same post: CC encourages CC0 for outputs without significant human creativity. | https://creativecommons.org/2023/08/18/understanding-cc-licenses-and-generative-ai/ | DOCUMENTED |
| F27 | Same post: the AI-produced portion may be uncopyrightable even when a CC licence is applied. | https://creativecommons.org/2023/08/18/understanding-cc-licenses-and-generative-ai/ | DOCUMENTED |
| F28 | That the Creative Commons **FAQ** addresses licensing of AI outputs. Its "Artificial intelligence and CC licenses" section covers use of CC-licensed works in AI training, not outputs. | https://creativecommons.org/faq/ | UNVERIFIED (page reached; the section does not address outputs. F25–F27 are the only CC statement found.) |
