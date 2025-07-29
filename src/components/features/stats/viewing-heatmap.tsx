import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface HeatmapData {
  day: string
  hour: number
  activity: number
  dayIndex: number
}

interface ViewingHeatmapProps {
  data: HeatmapData[]
}

export function ViewingHeatmap({ data }: ViewingHeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Viewing Pattern Heatmap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your viewing activity by day of week and time of day
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-8 gap-1 text-xs">
            <div></div>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center p-1 font-medium">
                {day}
              </div>
            ))}

            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="contents">
                <div className="text-right p-1 text-muted-foreground">
                  {hour.toString().padStart(2, '0')}
                </div>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
                  const activity =
                    data.find(d => d.day === day && d.hour === hour)
                      ?.activity || 0

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={cn(
                        'aspect-square rounded-sm border border-border',
                        activity === 0 && 'bg-muted/20',
                        activity === 1 && 'bg-primary/20',
                        activity === 2 && 'bg-primary/40',
                        activity === 3 && 'bg-primary/60',
                        activity >= 4 && 'bg-primary/80'
                      )}
                      title={`${day} ${hour}:00 - Activity: ${activity}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/20" />
              <div className="w-3 h-3 rounded-sm bg-primary/20" />
              <div className="w-3 h-3 rounded-sm bg-primary/40" />
              <div className="w-3 h-3 rounded-sm bg-primary/60" />
              <div className="w-3 h-3 rounded-sm bg-primary/80" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
