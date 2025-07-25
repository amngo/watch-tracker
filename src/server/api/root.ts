import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'
import { userRouter } from '@/server/api/routers/user'
import { watchedItemRouter } from '@/server/api/routers/watchedItem'
import { noteRouter } from '@/server/api/routers/note'

export const appRouter = createTRPCRouter({
  user: userRouter,
  watchedItem: watchedItemRouter,
  note: noteRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)