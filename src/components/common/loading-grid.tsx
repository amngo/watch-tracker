import { LoadingCard } from './loading-spinner'

interface LoadingGridProps {
  count?: number
  className?: string
}

export function LoadingGrid({ count = 6, className = "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }: LoadingGridProps) {
  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}