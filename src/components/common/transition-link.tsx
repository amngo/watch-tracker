'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransitionLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  prefetch?: boolean
}

export function TransitionLink({ 
  href, 
  children, 
  className, 
  onClick,
  prefetch = true 
}: TransitionLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.()
    
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      prefetch={prefetch}
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="flex items-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        {/* Loading indicator */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
          </motion.div>
        )}
        
        {/* Hover effect background */}
        <motion.div
          className="absolute inset-0 bg-accent/20 rounded-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8 
          }}
          transition={{ duration: 0.2 }}
        />
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </Link>
  )
}

// Enhanced navigation item with transition effects
export function NavigationTransitionLink({
  href,
  children,
  className,
  isActive,
  onClick,
}: TransitionLinkProps & { isActive?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.()
    
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 relative',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        isPending && 'opacity-75',
        className
      )}
    >
      <motion.div
        className="flex items-center w-full"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.1 }}
      >
        {children}
        
        {/* Loading spinner */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
            className="ml-auto"
          >
            <Loader2 className="h-3 w-3" />
          </motion.div>
        )}
      </motion.div>
    </Link>
  )
}