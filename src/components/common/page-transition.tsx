'use client'

import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

// Different transition variants for different page types
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
}

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4,
}

// Slide transition for navigation
const slideVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  in: {
    x: 0,
    opacity: 1,
  },
  out: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
}

const slideTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.3,
}

export function PageTransition({
  children,
  className = '',
}: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Alternative slide transition for specific use cases
export function SlidePageTransition({
  children,
  className = '',
  direction = 1,
}: PageTransitionProps & { direction?: number }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      custom={direction}
      initial="initial"
      animate="in"
      exit="out"
      variants={slideVariants}
      transition={slideTransition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger animation for page content
export function StaggeredPageTransition({
  children,
  className = '',
  delay = 0,
}: PageTransitionProps & { delay?: number }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Layout transition that doesn't re-mount between similar pages
export function LayoutTransition({
  children,
  className = '',
}: PageTransitionProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        layout: { duration: 0.3 },
        opacity: { duration: 0.2 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
