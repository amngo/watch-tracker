import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SpoilerToggleProps {
  isVisible: boolean
  onToggle: () => void
  className?: string
}

/**
 * Toggle button for showing/hiding spoiler content
 */
export function SpoilerToggle({ isVisible, onToggle, className = '' }: SpoilerToggleProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onToggle}
      className={`h-4 w-4 p-0 text-muted-foreground hover:text-foreground flex-shrink-0 ${className}`}
      aria-label={isVisible ? 'Hide spoilers' : 'Show spoilers'}
    >
      {isVisible ? (
        <EyeOff className="h-3 w-3" />
      ) : (
        <Eye className="h-3 w-3" />
      )}
    </Button>
  )
}