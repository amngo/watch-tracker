import { TVShowCardSkeleton } from '@/components/ui/skeletons'
import { cn } from '@/lib/utils'

interface LoadingGridProps {
  count?: number
  className?: string
  showSelection?: boolean
}

export function LoadingGrid({ count = 6, className }: LoadingGridProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {[...Array(count)].map((_, i) => (
        <TVShowCardSkeleton key={i} />
      ))}
    </div>
  )
}
