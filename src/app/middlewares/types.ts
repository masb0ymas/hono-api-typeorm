import type { Session } from '~/database/entities/sessions'

declare module 'hono' {
  interface ContextVariableMap {
    auth: {
      userId: string
      token: string
      session: Session
    }
  }
}
