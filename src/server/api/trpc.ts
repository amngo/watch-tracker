import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { auth } from '@clerk/nextjs/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { db } from '@/server/db'

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

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    })
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, userId: ctx.session.userId },
      db: ctx.db,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)