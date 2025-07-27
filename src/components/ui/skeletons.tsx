import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

// Base skeleton component with better default styling
export function BaseSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton
      className={cn("bg-muted/60", className)}
      {...props}
    />
  )
}

// Media poster skeleton that matches actual poster dimensions
interface MediaPosterSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function MediaPosterSkeleton({ size = 'md', className }: MediaPosterSkeletonProps) {
  const sizeClasses = {
    sm: 'w-12 h-16',   // 3:4 aspect ratio
    md: 'w-16 h-24',   // 3:4 aspect ratio  
    lg: 'w-20 h-30',   // 3:4 aspect ratio
    xl: 'w-32 h-48',   // 3:4 aspect ratio
  }

  return (
    <BaseSkeleton 
      className={cn(sizeClasses[size], 'rounded-md flex-shrink-0', className)} 
    />
  )
}

// Media card skeleton for search results and media grids
export function MediaCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex gap-4 p-4">
        <MediaPosterSkeleton size="md" />
        <div className="flex-1 space-y-3">
          {/* Title */}
          <BaseSkeleton className="h-5 w-3/4" />
          
          {/* Badges row */}
          <div className="flex items-center gap-2">
            <BaseSkeleton className="h-5 w-16 rounded-full" />
            <BaseSkeleton className="h-5 w-20 rounded-full" />
            <BaseSkeleton className="h-5 w-12 rounded-full" />
          </div>
          
          {/* Description lines */}
          <div className="space-y-2">
            <BaseSkeleton className="h-3 w-full" />
            <BaseSkeleton className="h-3 w-2/3" />
          </div>
          
          {/* Action button */}
          <BaseSkeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  )
}

// Watched item card skeleton for dashboard and library pages
export function WatchedItemCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex gap-4 p-4">
        <MediaPosterSkeleton size="md" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Title */}
              <BaseSkeleton className="h-4 w-3/4" />
              
              {/* Badges */}
              <div className="flex items-center gap-2">
                <BaseSkeleton className="h-4 w-12 rounded-full" />
                <BaseSkeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
            
            {/* Menu button */}
            <BaseSkeleton className="h-8 w-8 rounded-md" />
          </div>
          
          {/* Progress bar */}
          <BaseSkeleton className="h-2 w-full rounded-full" />
          
          {/* Rating and notes */}
          <div className="flex items-center gap-2">
            <BaseSkeleton className="h-6 w-16 rounded-full" />
            <BaseSkeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Stats card skeleton for metrics and key numbers
export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse p-6 border rounded-lg', className)}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <BaseSkeleton className="h-4 w-24" />
        <BaseSkeleton className="h-4 w-4 rounded" />
      </div>
      <div className="space-y-2">
        <BaseSkeleton className="h-8 w-16" />
        <BaseSkeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

// Chart skeleton for data visualizations
export function ChartSkeleton({ 
  height = "h-[300px]", 
  className 
}: { 
  height?: string
  className?: string 
}) {
  return (
    <div className={cn('animate-pulse border rounded-lg', className)}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BaseSkeleton className="h-4 w-4" />
          <BaseSkeleton className="h-5 w-32" />
        </div>
        <BaseSkeleton className={cn(height, 'w-full rounded-md')} />
      </div>
    </div>
  )
}

// Form skeleton for input fields and forms
export function FormSkeleton({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <BaseSkeleton className="h-4 w-20" />
          <BaseSkeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <BaseSkeleton className="h-10 w-24 rounded-md mt-6" />
    </div>
  )
}

// Table skeleton for data tables
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex border-b bg-muted/20 p-4">
          {Array.from({ length: columns }).map((_, i) => (
            <BaseSkeleton 
              key={i} 
              className={cn(
                'h-4 mr-4',
                i === 0 ? 'w-32' : i === columns - 1 ? 'w-20' : 'w-24'
              )} 
            />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex border-b p-4">
            {Array.from({ length: columns }).map((_, j) => (
              <BaseSkeleton 
                key={j} 
                className={cn(
                  'h-4 mr-4',
                  j === 0 ? 'w-28' : j === columns - 1 ? 'w-16' : 'w-20'
                )} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Episode card skeleton for TV show episodes
export function EpisodeCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex gap-3 p-3 border rounded-lg">
        {/* Episode thumbnail */}
        <BaseSkeleton className="w-20 h-12 rounded-md flex-shrink-0" />
        
        <div className="flex-1 space-y-2">
          {/* Episode number and title */}
          <BaseSkeleton className="h-4 w-3/4" />
          
          {/* Episode description */}
          <BaseSkeleton className="h-3 w-full" />
          <BaseSkeleton className="h-3 w-2/3" />
          
          {/* Status and actions */}
          <div className="flex items-center justify-between">
            <BaseSkeleton className="h-5 w-16 rounded-full" />
            <BaseSkeleton className="h-6 w-6 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Note card skeleton for notes/reviews
export function NoteCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="p-4 border rounded-lg space-y-3">
        {/* Header with user and date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BaseSkeleton className="h-8 w-8 rounded-full" />
            <BaseSkeleton className="h-4 w-20" />
          </div>
          <BaseSkeleton className="h-3 w-16" />
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <BaseSkeleton className="h-4 w-full" />
          <BaseSkeleton className="h-4 w-full" />
          <BaseSkeleton className="h-4 w-3/4" />
        </div>
        
        {/* Media info if enabled */}
        <div className="flex items-center gap-2">
          <BaseSkeleton className="h-12 w-8 rounded" />
          <div className="space-y-1">
            <BaseSkeleton className="h-3 w-24" />
            <BaseSkeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Grid skeleton for loading grids of items
export function GridSkeleton({ 
  items = 6, 
  SkeletonComponent = MediaCardSkeleton,
  className 
}: { 
  items?: number
  SkeletonComponent?: React.ComponentType<{ className?: string }>
  className?: string 
}) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  )
}

// Search results skeleton
export function SearchResultsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="space-y-4">
        {/* Results header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BaseSkeleton className="h-6 w-32" />
            <BaseSkeleton className="h-5 w-16 rounded-full" />
          </div>
          <BaseSkeleton className="h-8 w-20 rounded-md" />
        </div>
        
        {/* Filter badges */}
        <div className="flex gap-2">
          <BaseSkeleton className="h-6 w-20 rounded-full" />
          <BaseSkeleton className="h-6 w-24 rounded-full" />
        </div>
        
        {/* Results grid */}
        <GridSkeleton items={6} SkeletonComponent={MediaCardSkeleton} />
      </div>
    </div>
  )
}

// Page header skeleton
export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BaseSkeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <BaseSkeleton className="h-8 w-48" />
            <BaseSkeleton className="h-4 w-72" />
          </div>
        </div>
        <BaseSkeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  )
}