import 'server-only'

import { createCaller } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { cache } from 'react'

const createContext = cache(() => {
  return createTRPCContext({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: {} as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res: {} as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: {} as any,
  })
})

export const api = createCaller(createContext)