import type { MiddlewareHandler } from 'hono'
import { createClerkClient, verifyToken } from '@clerk/backend'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { users, organizations } from '../db/schema'
import type { AuthVariables } from '../lib/types'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
})

/**
 * Verifies Clerk JWT and ensures (org, user) exist locally.
 * On success, sets c.var.userId / orgId / email.
 */
export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing Authorization header' }, 401)
  }
  const token = auth.slice('Bearer '.length)

  let payload: { sub: string }
  try {
    payload = (await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    })) as { sub: string }
  } catch (e) {
    console.warn('[auth] token verify failed:', (e as Error).message)
    return c.json({ error: 'Invalid token' }, 401)
  }

  const clerkUserId = payload.sub

  // Find or create local user
  const existing = (await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1)) as Array<typeof users.$inferSelect>
  let row: typeof users.$inferSelect | undefined = existing[0]
  if (!row) {
    const clerkUser = await clerk.users.getUser(clerkUserId)
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? ''
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email

    // Create a personal organization on first sign-in
    const orgRows = (await db.insert(organizations).values({ name: fullName + "'s org" }).returning()) as Array<typeof organizations.$inferSelect>
    const org = orgRows[0]
    const createdRows = (await db.insert(users).values({
      clerkId: clerkUserId,
      orgId: org.id,
      email,
      fullName,
      role: 'owner',
    }).returning()) as Array<typeof users.$inferSelect>
    row = createdRows[0]
  }

  c.set('userId', row.id)
  c.set('orgId', row.orgId)
  c.set('email', row.email)

  await next()
}
