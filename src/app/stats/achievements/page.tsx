'use client'

import { AchievementsPanel } from '@/components/features/stats/achievements-panel'
import { api } from '@/trpc/react'

export default function AchievementsPage() {
  const { data: achievementsData } = api.stats.achievements.useQuery()

  return (
    <div className="space-y-6">
      <AchievementsPanel
        achievements={achievementsData?.achievements || []}
        nextMilestones={achievementsData?.nextMilestones || []}
      />
    </div>
  )
}