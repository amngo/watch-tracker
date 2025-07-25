import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { auth } from '@clerk/nextjs/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { db } from '@/server/db'
import { toTRPCError, logError } from '@/lib/errors'

type CreateContextOptions = {
  session: Awaited<ReturnType<typeof auth>>
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  }
}

export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
  // Get the session from the server using Clerk auth()
  const session = await auth()

  return createInnerTRPCContext({
    session,
  })
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Log all errors for debugging
    logError(error.cause || error, 'tRPC')
    
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createCallerFactory = t.createCallerFactory

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    })
  }

  // Ensure user exists in database - use upsert to handle race conditions
  const user = await ctx.db.user.upsert({
    where: { clerkId: ctx.session.userId },
    update: {}, // Don't update existing users automatically
    create: {
      clerkId: ctx.session.userId,
      username: `user_${ctx.session.userId}`, // Better temporary username
      email: `${ctx.session.userId}@temp.com`, // Use temporary email for now
      name: null, // Will be updated when user profile is available
      avatar: null, // Will be updated when user profile is available
    },
  })

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, userId: ctx.session.userId },
      user, // Add user to context
      db: ctx.db,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)