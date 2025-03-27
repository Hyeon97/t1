import { AsyncLocalStorage } from "async_hooks"

interface RequestContext {
  requestId: string
  startTime: number
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>()
