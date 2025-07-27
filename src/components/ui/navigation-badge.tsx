import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NavigationBadgeProps {
  count: number
  isActive?: boolean
  className?: string
}

export function NavigationBadge({ count, isActive = false, className }: NavigationBadgeProps) {
  if (count === 0) return null

  return (
    <Badge
      variant={isActive ? "secondary" : "outline"}
      className={cn(
        'ml-auto text-xs px-2 py-1 h-5 min-w-[20px] flex items-center justify-center',
        isActive 
          ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30' 
          : 'bg-background text-muted-foreground',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  )
}