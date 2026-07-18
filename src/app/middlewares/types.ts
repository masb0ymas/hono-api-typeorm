import type { Session } from '~/database/entities/session'

declare module 'hono' {
  interface ContextVariableMap {
    auth: {
      userId: string
      token: string
      session: Session
    }
  }
}
