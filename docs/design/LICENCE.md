# A notice for the images in `docs/design/`

The images in this folder and its subfolders (every `.webp` file) are **not** covered by the
repository's [MIT licence](../../LICENSE).

- **What they are.** Exports of design boards drawn in pen.dev, and photographs made with
  generative tools: pen.dev's Generate, and models served through fal. Nine of the ten picked
  photographs went through fal, using `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/flux-pro/kontext`,
  `fal-ai/nano-banana-2` and `fal-ai/topaz/upscale/image`; the record also lists the depth,
  texture, upscale and video requests that were tried. Every photograph is ILLUSTRATIVE. None
  shows a real ground, club, crest or person.
- **How each was made.** [`5-handoff/second-edition-handoff.md`](5-handoff/second-edition-handoff.md)
  (section 7) names each photograph's provider, model and prompt, and
  [`5-handoff/fal-provenance.jsonl`](5-handoff/fal-provenance.jsonl) holds every fal request.
  Seven photographs began in pen.dev's Generate, which does not record its model, so their
  model is written as "not recorded".
- **Not offered for reuse.** This notice grants no licence to copy, modify or redistribute them.
- **No copyright claim.** It says nothing about who holds copyright in generated images; the
  providers' own terms may apply. It is not legal advice.

Everything else in this folder, meaning the Markdown and text files, the shaders under
[`shaders/`](shaders/) and `fal-provenance.jsonl`, is covered by the repository's MIT licence.
