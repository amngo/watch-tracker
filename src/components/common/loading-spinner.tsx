import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('animate-spin rounded-full border-2 border-primary border-t-transparent', sizeClasses[size], className)} />
  )
}

/**
 * @deprecated Use specific skeleton components from @/components/ui/skeletons or @/components/common/loading-states instead
 * This generic LoadingCard will be removed in a future version
 */
export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex gap-4 p-4">
        <div className="h-24 w-16 bg-muted rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-2 bg-muted rounded w-full" />
          <div className="h-2 bg-muted rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

export function LoadingText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            'h-4 bg-muted rounded', 
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )} 
        />
      ))}
    </div>
  )
}

// Re-export specific loading states for easier migration
export {
  MediaCardSkeleton,
  WatchedItemCardSkeleton,
  StatsCardSkeleton,
  ChartSkeleton,
  EpisodeCardSkeleton,
  NoteCardSkeleton,
  GridSkeleton,
} from '@/components/ui/skeletons'

export {
  DashboardStatsLoading,
  DashboardRecentItemsLoading,
  MediaLibraryLoading,
  SearchPageLoading,
  StatsPageLoading,
  MediaDetailLoading,
  EpisodeTrackerLoading,
  NotesPageLoading,
  ProfilePageLoading,
  ListLoading,
  CardsGridLoading,
  DataTableLoading,
} from '@/components/common/loading-states'