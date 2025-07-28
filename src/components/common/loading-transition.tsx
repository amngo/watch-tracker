'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

interface LoadingTransitionProps {
  isLoading: boolean
  children: ReactNode
  loadingComponent?: ReactNode
  className?: string
}

export function LoadingTransition({ 
  isLoading, 
  children, 
  loadingComponent,
  className = '' 
}: LoadingTransitionProps) {
  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center min-h-32"
          >
            {loadingComponent || <DefaultLoadingComponent />}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' as const }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DefaultLoadingComponent() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
      >
        <Loader2 className="h-6 w-6 text-primary" />
      </motion.div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </motion.div>
  )
}

// Skeleton loading transition
export function SkeletonTransition({ 
  isLoading, 
  children, 
  skeletonCount = 3,
  className = '' 
}: LoadingTransitionProps & { skeletonCount?: number }) {
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Page loading overlay
export function PageLoadingOverlay({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-card border rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
              >
                <Loader2 className="h-5 w-5 text-primary" />
              </motion.div>
              <p className="text-sm font-medium">Loading page...</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}