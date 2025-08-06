import { cn } from '@/lib/utils'
import {
  GridSkeleton,
  WatchedItemCardSkeleton,
  MediaCardSkeleton,
  StatsCardSkeleton,
  ChartSkeleton,
  EpisodeCardSkeleton,
  NoteCardSkeleton,
  SearchResultsSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
  FormSkeleton,
  TVSeasonPageSkeleton,
} from '@/components/ui/skeletons'

// Dashboard loading states
export function DashboardStatsLoading({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DashboardRecentItemsLoading({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <WatchedItemCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Media library loading states
export function MediaLibraryLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeaderSkeleton />
      <DashboardStatsLoading />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <WatchedItemCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Search page loading states
export function SearchPageLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeaderSkeleton />
      <SearchResultsSkeleton />
    </div>
  )
}

// Stats page loading states
export function StatsPageLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeaderSkeleton />
      <DashboardStatsLoading />

      {/* Chart placeholders */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <ChartSkeleton height="h-[400px]" />
    </div>
  )
}

// TV show/movie detail page loading states
export function MediaDetailLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Hero section */}
      <div className="animate-pulse">
        <div className="flex gap-6">
          <div className="w-48 h-72 bg-muted rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-5 bg-muted rounded-full w-16" />
              <div className="h-5 bg-muted rounded-full w-20" />
              <div className="h-5 bg-muted rounded-full w-12" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-muted rounded w-24" />
              <div className="h-10 bg-muted rounded w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="animate-pulse">
        <div className="flex gap-4 border-b mb-6">
          <div className="h-10 bg-muted rounded w-20" />
          <div className="h-10 bg-muted rounded w-24" />
          <div className="h-10 bg-muted rounded w-16" />
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <EpisodeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Episode tracker loading state
export function EpisodeTrackerLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <EpisodeCardSkeleton key={i} />
      ))}
    </div>
  )
}

// TV Season page loading state
export function TVSeasonLoading({ className }: { className?: string }) {
  return <TVSeasonPageSkeleton className={className} />
}

// Notes page loading state
export function NotesPageLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeaderSkeleton />

      {/* Filter tabs */}
      <div className="animate-pulse">
        <div className="flex gap-4">
          <div className="h-10 bg-muted rounded w-16" />
          <div className="h-10 bg-muted rounded w-20" />
          <div className="h-10 bg-muted rounded w-18" />
        </div>
      </div>

      {/* Notes grid */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <NoteCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Profile page loading state
export function ProfilePageLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeaderSkeleton />

      <div className="grid gap-6 md:grid-cols-2">
        <FormSkeleton fields={5} />
        <div className="space-y-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Generic loading states for common patterns
export function ListLoading({
  items = 5,
  SkeletonComponent = WatchedItemCardSkeleton,
  className,
}: {
  items?: number
  SkeletonComponent?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  )
}

export function CardsGridLoading({
  items = 6,
  SkeletonComponent = MediaCardSkeleton,
  className,
}: {
  items?: number
  SkeletonComponent?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <GridSkeleton
      items={items}
      SkeletonComponent={SkeletonComponent}
      className={className}
    />
  )
}

// Table loading with customizable columns and rows
export function DataTableLoading({
  rows = 10,
  columns = 5,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return <TableSkeleton rows={rows} columns={columns} className={className} />
}
