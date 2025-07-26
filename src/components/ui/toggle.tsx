'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed = false, onPressedChange, size = 'md', variant = 'default', children, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPressedChange?.(!pressed)
      onClick?.(event)
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'hover:bg-muted hover:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          // Size variants
          {
            'h-8 px-2 text-xs': size === 'sm',
            'h-10 px-3': size === 'md',
            'h-11 px-5': size === 'lg',
          },
          // Variant styles
          {
            'bg-transparent': variant === 'default' && !pressed,
            'bg-accent text-accent-foreground': variant === 'default' && pressed,
            'border border-input bg-transparent hover:bg-accent': variant === 'outline' && !pressed,
            'border border-input bg-accent text-accent-foreground': variant === 'outline' && pressed,
          },
          className
        )}
        onClick={handleClick}
        aria-pressed={pressed}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Toggle.displayName = 'Toggle'

export { Toggle }