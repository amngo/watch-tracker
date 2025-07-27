import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SpoilerToggleProps {
  isVisible: boolean
  onToggle: () => void
  className?: string
  disabled?: boolean
}

/**
 * Toggle button for showing/hiding spoiler content
 */
export function SpoilerToggle({ 
  isVisible, 
  onToggle, 
  className = '', 
  disabled = false 
}: SpoilerToggleProps) {
  const tooltipText = isVisible ? 'Hide episode spoilers' : 'Show episode spoilers'
  
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onToggle}
      disabled={disabled}
      title={tooltipText}
      className={`h-4 w-4 p-0 text-muted-foreground hover:text-foreground disabled:opacity-50 flex-shrink-0 transition-colors ${className}`}
      aria-label={tooltipText}
    >
      {isVisible ? (
        <EyeOff className="h-3 w-3" />
      ) : (
        <Eye className="h-3 w-3" />
      )}
    </Button>
  )
}