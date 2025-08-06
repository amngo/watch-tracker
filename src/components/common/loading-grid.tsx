import {
  TVShowCardSkeleton,
  WatchedItemCardSkeleton,
} from '@/components/ui/skeletons'
import { cn } from '@/lib/utils'

interface LoadingGridProps {
  count?: number
  className?: string
  showSelection?: boolean
  variant?: 'tv' | 'movie' | 'media'
}

export function LoadingGrid({
  count = 6,
  className,
  variant = 'media',
}: LoadingGridProps) {
  const SkeletonComponent =
    variant === 'tv' ? TVShowCardSkeleton : WatchedItemCardSkeleton

  return (
    <div className={cn('space-y-4', className)}>
      {[...Array(count)].map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  )
}
