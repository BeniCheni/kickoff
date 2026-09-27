type Pending = {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}

type CdpEvent = {
  method?: string
  params?: unknown
  sessionId?: string
}

/**
 * A small Chrome DevTools Protocol client on Node's global WebSocket.
 * Flattened sessions share this socket; pass `sessionId` on page commands.
 */
export class CdpConnection {
  private next = 0
  private readonly pending = new Map<number, Pending>()
  private readonly listeners = new Set<(event: CdpEvent) => void>()
  private closed = false

  private constructor(private readonly ws: WebSocket) {
    ws.addEventListener('message', (event) => {
      void messageText(event.data).then((text) => {
        this.dispatch(text)
      }).catch(() => {})
    })
    ws.addEventListener('close', () => {
      this.closed = true
      for (const waiter of this.pending.values()) waiter.reject(new Error('DevTools socket closed'))
      this.pending.clear()
    })
  }

  private dispatch(text: string): void {
    let message: { id?: number; result?: unknown; error?: { message?: string }; method?: string; params?: unknown; sessionId?: string }
    try {
      message = JSON.parse(text) as typeof message
    } catch {
      return
    }
    if (message.id !== undefined && this.pending.has(message.id)) {
      const waiter = this.pending.get(message.id)
      this.pending.delete(message.id)
      if (!waiter) return
      if (message.error) waiter.reject(new Error(message.error.message || 'CDP error'))
      else waiter.resolve(message.result)
      return
    }
    if (message.method) {
      const cdpEvent: CdpEvent = { method: message.method, params: message.params, sessionId: message.sessionId }
      for (const listener of this.listeners) listener(cdpEvent)
    }
  }

  static async connect(url: string): Promise<CdpConnection> {
    const ws = new WebSocket(url)
    await new Promise<void>((resolve, reject) => {
      const fail = () => reject(new Error(`DevTools socket failed: ${url}`))
      ws.addEventListener('open', () => resolve(), { once: true })
      ws.addEventListener('error', fail, { once: true })
    })
    return new CdpConnection(ws)
  }

  send(method: string, params: object = {}, sessionId?: string): Promise<unknown> {
    if (this.closed) return Promise.reject(new Error(`DevTools socket closed before ${method}`))
    const id = ++this.next
    const payload: { id: number; method: string; params: object; sessionId?: string } = { id, method, params }
    if (sessionId) payload.sessionId = sessionId
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`CDP timeout: ${method}`))
      }, 30_000)
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer)
          resolve(value)
        },
        reject: (error) => {
          clearTimeout(timer)
          reject(error)
        },
      })
      this.ws.send(JSON.stringify(payload))
    })
  }

  on(method: string, handler: (params: unknown, sessionId?: string) => void): () => void {
    const listener = (event: CdpEvent) => {
      if (event.method === method) handler(event.params, event.sessionId)
    }
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  waitFor(method: string, sessionId: string, timeoutMs: number): { promise: Promise<unknown>; cancel: () => void } {
    let cancel = () => {}
    const promise = new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        stop()
        reject(new Error(`timeout waiting for ${method}`))
      }, timeoutMs)
      const stop = this.on(method, (params, eventSession) => {
        if (eventSession !== sessionId) return
        clearTimeout(timer)
        stop()
        resolve(params)
      })
      cancel = () => {
        clearTimeout(timer)
        stop()
        reject(new Error(`cancelled wait for ${method}`))
      }
    })
    return { promise, cancel }
  }

  close(): void {
    this.ws.close()
  }
}

async function messageText(data: unknown): Promise<string> {
  if (typeof data === 'string') return data
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('utf8')
  if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString('utf8')
  if (data && typeof data === 'object' && 'text' in data && typeof data.text === 'function') {
    return data.text()
  }
  return String(data)
}
