export type Deployment = { url: string; sha: string; ref: string | null }
export type SmokeInput = Deployment & { project: string; mainSha: string; bypass?: string }
export function deploymentUrl(raw: string, project: string): string
export function readDeployment(eventName: string, event: unknown, project: string): Deployment
export function digestAt(sha: string, cwd?: string): string
export function smoke(input: SmokeInput, options?: { fetchImpl?: typeof fetch; cwd?: string }): Promise<{
  checks: string[]; sha: string; snapshotDigest: string; latestMain: boolean; gallery: string
}>
