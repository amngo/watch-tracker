import { WatchedItemCardSkeleton } from '@/components/ui/skeletons'

interface LoadingGridProps {
  count?: number
  className?: string
  variant?: 'media' | 'watched-items' | 'episodes'
}

export function LoadingGrid({ 
  count = 6, 
  className = "space-y-4",
  variant: _variant = 'watched-items' 
}: LoadingGridProps) {
  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <WatchedItemCardSkeleton key={i} />
      ))}
    </div>
  )
}