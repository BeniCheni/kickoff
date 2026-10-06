// Types for the browser-wide Fetch guard, so the node test project can import the module the
// runner runs. The shapes mirror cdp-network.mjs; a drift there fails the guard tests.
export type GuardRequest = { url(): string; postData(): string; resourceType(): string; method(): string; headers(): Record<string, string> }
export type GuardRoute = { request(): GuardRequest; abort(): Promise<unknown>; continue(): Promise<unknown>; fulfill(response: { contentType: string; body: string }): Promise<unknown> }
export type GuardRedirect = { url: string; status: number | undefined; location: string; action: 'aborted-before-follow'; sessionId: string | null }
export type GuardAudit = { stage: string; url?: string; frameId?: string; status?: number; method?: string; code?: number; message?: string }
export type GuardSession = { on(event: string, listener: (params: never) => void): unknown; send(method: string, params?: object): Promise<unknown>; detach(): Promise<unknown> }
export type GuardBrowser = { newBrowserCDPSession(): Promise<GuardSession>; on(event: 'disconnected', listener: () => void): unknown }
export function guardNetwork(browser: GuardBrowser, routeRequest: (route: GuardRoute) => Promise<unknown>, onRedirect: (redirect: GuardRedirect) => void, onFailure: (error: Error) => void, pending: Set<Promise<unknown>>): Promise<{ close(): void; audit: GuardAudit[] }>
