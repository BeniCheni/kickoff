/**
 * Xenova's ONNX export of OpenAI CLIP ViT-B/32.
 * fp32 is the dtype the library asks for on CPU: the unsuffixed
 * `onnx/vision_model.onnx` and `onnx/text_model.onnx`.
 * The weights stay in STUDIO_MODEL_DIR, outside the worktree.
 */
export const CLIP_MODEL = 'Xenova/clip-vit-base-patch32'
export const CLIP_REVISION = 'd15189d7028b43f1d3e65039190477f6af591c2a'
export const CLIP_DTYPE = 'fp32' as const
export const CLIP_DIMS = 512

export const EMBED_REASONS = ['model-absent', 'read-failed', 'embed-failed', 'write-failed'] as const

export type EmbedReason = (typeof EMBED_REASONS)[number]

export class EmbedError extends Error {
  readonly reason: EmbedReason

  constructor(reason: EmbedReason, message: string) {
    super(message)
    this.name = 'EmbedError'
    this.reason = reason
  }
}

export type Embedder = {
  keyframe(localPath: string): Promise<number[]>
  text(value: string): Promise<number[]>
}
