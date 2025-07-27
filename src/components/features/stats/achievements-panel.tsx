import { Trophy, Target, Award, Film, Tv, Clock, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
}

interface Milestone {
  title: string
  description: string
  current: number
  target: number
}

interface AchievementsPanelProps {
  achievements: Achievement[]
  nextMilestones: Milestone[]
}

export function AchievementsPanel({
  achievements,
  nextMilestones,
}: AchievementsPanelProps) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Unlocked Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.length ? (
              achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <Badge variant="secondary">Unlocked</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Achievements Yet
                </h3>
                <p className="text-muted-foreground">
                  Start watching to unlock your first achievement!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Next Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextMilestones.map((milestone, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{milestone.title}</span>
                  <span className="text-muted-foreground">
                    {milestone.current}/{milestone.target}
                  </span>
                </div>
                <Progress
                  value={(milestone.current / milestone.target) * 100}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {milestone.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Achievement Categories */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Film className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h4 className="font-semibold">Movie Buff</h4>
            <p className="text-sm text-muted-foreground">
              Complete movie milestones
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Tv className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h4 className="font-semibold">Series Veteran</h4>
            <p className="text-sm text-muted-foreground">
              Finish TV show seasons
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h4 className="font-semibold">Time Master</h4>
            <p className="text-sm text-muted-foreground">
              Reach watch time goals
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h4 className="font-semibold">Critic</h4>
            <p className="text-sm text-muted-foreground">
              Rate and review content
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}