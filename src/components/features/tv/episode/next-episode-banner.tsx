import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TMDBEpisodeItem } from '@/types'

interface NextEpisodeBannerProps {
  nextEpisode: TMDBEpisodeItem
  onStartWatching: (episodeNumber: number) => void
}

export function NextEpisodeBanner({ nextEpisode, onStartWatching }: NextEpisodeBannerProps) {
  return (
    <div className="mb-4 p-3 bg-primary/5 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <Play className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">Up Next</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Episode {nextEpisode.episode_number}: {nextEpisode.name}
      </p>
      <Button
        size="sm"
        className="mt-2"
        onClick={() => onStartWatching(nextEpisode.episode_number)}
      >
        Start Watching
      </Button>
    </div>
  )
}