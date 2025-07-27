import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'
import { userRouter } from '@/server/api/routers/user'
import { watchedItemRouter } from '@/server/api/routers/watchedItem'
import { noteRouter } from '@/server/api/routers/note'
import { searchRouter } from '@/server/api/routers/search'
import { statsRouter } from '@/server/api/routers/stats'
import { queueRouter } from '@/server/api/routers/queue'

export const appRouter = createTRPCRouter({
  user: userRouter,
  watchedItem: watchedItemRouter,
  note: noteRouter,
  search: searchRouter,
  stats: statsRouter,
  queue: queueRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)