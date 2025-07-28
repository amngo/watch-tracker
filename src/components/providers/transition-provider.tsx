'use client'

import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface TransitionProviderProps {
  children: ReactNode
}

export function TransitionProvider({ children }: TransitionProviderProps) {
  const pathname = usePathname()

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={pathname}>{children}</motion.div>
      </AnimatePresence>
    </MotionConfig>
  )
}

// Navigation transition wrapper for smooth page changes
export function NavigationTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}>{children}</motion.div>
    </AnimatePresence>
  )
}
