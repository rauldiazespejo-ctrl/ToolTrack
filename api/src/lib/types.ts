import type { Context } from 'hono'

export type AuthVariables = {
  userId: string
  orgId: string
  email: string
}

export type AuthedContext = Context<{ Variables: AuthVariables }>
