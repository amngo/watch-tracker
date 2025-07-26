import { Calendar, Clock, Star } from 'lucide-react'
import { formatAirDate, formatRuntime, formatVoteAverage } from '@/lib/format'
import type { TMDBEpisodeItem } from '@/types'

interface EpisodeMetadataProps {
  episode: TMDBEpisodeItem
  className?: string
}

/**
 * Component displaying episode metadata (air date, runtime, rating)
 */
export function EpisodeMetadata({ episode, className = '' }: EpisodeMetadataProps) {
  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      {episode.air_date && (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatAirDate(episode.air_date)}</span>
        </div>
      )}
      {episode.runtime && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatRuntime(episode.runtime)}</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3" />
        <span>{formatVoteAverage(episode.vote_average)}</span>
      </div>
    </div>
  )
}