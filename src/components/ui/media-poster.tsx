import { Film, Tv } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaPosterProps {
  src?: string | null
  alt: string
  mediaType?: 'MOVIE' | 'TV' | 'movie' | 'tv' | 'person'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeConfig = {
  sm: { container: 'h-16 w-12', iconSize: 'h-6 w-6' },
  md: { container: 'h-24 w-16', iconSize: 'h-8 w-8' },
  lg: { container: 'h-32 w-20', iconSize: 'h-10 w-10' },
}

const posterSizes = {
  sm: 'w92',
  md: 'w154',
  lg: 'w185',
}

export function MediaPoster({
  src,
  alt,
  mediaType,
  size = 'md',
  className,
}: MediaPosterProps) {
  const config = sizeConfig[size]
  const isMovie = mediaType === 'MOVIE' || mediaType === 'movie'
  const posterSize = posterSizes[size]

  return (
    <div
      className={cn(
        'relative rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden',
        config.container,
        className
      )}
    >
      {src ? (
        <img
          src={`https://image.tmdb.org/t/p/${posterSize}${src}`}
          alt={alt}
          sizes={`(max-width: 768px) ${config.container.split(' ')[1]}, ${config.container.split(' ')[1]}`}
          className="object-cover h-full w-full"
          loading="lazy"
          onError={e => {
            // Fallback to placeholder on error
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            target.parentElement?.classList.add('bg-muted')
          }}
        />
      ) : (
        <div className="text-muted-foreground flex flex-col items-center justify-center p-1">
          {isMovie ? (
            <Film className={config.iconSize} />
          ) : (
            <Tv className={config.iconSize} />
          )}
          <span className="text-xs mt-1 text-center leading-tight">
            No Image
          </span>
        </div>
      )}
    </div>
  )
}
