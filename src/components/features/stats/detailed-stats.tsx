import { Film, Tv } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface DetailedStatsProps {
  movies: number
  tvShows: number
  totalNotes: number
  itemsWithRatings: number
  episodesWatched: number
  completionRate: number
}

export function DetailedStats({
  movies,
  tvShows,
  totalNotes,
  itemsWithRatings,
  episodesWatched,
  completionRate,
}: DetailedStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              <span>Movies</span>
            </div>
            <Badge variant="outline">{movies}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              <span>TV Shows</span>
            </div>
            <Badge variant="outline">{tvShows}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Total Notes</span>
            <Badge variant="outline">{totalNotes}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Rated Items</span>
            <Badge variant="outline">{itemsWithRatings}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Episodes Watched</span>
            <Badge variant="outline">{episodesWatched}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}