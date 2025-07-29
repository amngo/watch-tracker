import { useState } from 'react'
import { ChevronDown, ChevronRight, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QuickEditForm } from './quick-edit-form'
import type { TMDBSeasonDetailsItem, WatchedItem } from '@/types'

interface SeasonProgressHeaderProps {
  seasonDetails: TMDBSeasonDetailsItem
  watchedItem: WatchedItem
  isExpanded: boolean
  watchedEpisodesInSeason: number
  seasonProgress: number
  onToggleExpanded: () => void
  onUpdateProgress: (data: { currentSeason: number; currentEpisode: number }) => void
}

export function SeasonProgressHeader({
  seasonDetails,
  watchedItem,
  isExpanded,
  watchedEpisodesInSeason,
  seasonProgress,
  onToggleExpanded,
  onUpdateProgress,
}: SeasonProgressHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <CardHeader 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onToggleExpanded}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <CardTitle className="text-lg">
            {seasonDetails.name}
          </CardTitle>
          <Badge variant="outline">
            {watchedEpisodesInSeason}/{seasonDetails.episodes.length} episodes
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{Math.round(seasonProgress)}%</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Quick Edit
              </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Update Progress</DialogTitle>
                <DialogDescription>
                  Set your current season and episode progress for {watchedItem.title}
                </DialogDescription>
              </DialogHeader>
              <QuickEditForm
                watchedItem={watchedItem}
                onUpdateProgress={onUpdateProgress}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Progress value={seasonProgress} className="h-2" />
    </CardHeader>
  )
}