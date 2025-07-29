'use client'

import { CalendarDays } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ReleasesCalendar } from '@/components/features/releases/releases-calendar'
import { UpcomingReleases } from '@/components/features/releases/upcoming-releases'
import { PageHeader } from '@/components/common/page-header'
import { api } from '@/trpc/react'

export default function ReleasesPage() {
  const { data: stats } = api.user.getStats.useQuery()

  return (
    <DashboardLayout stats={stats}>
      <div className="space-y-8">
        <PageHeader
          title="Release Calendar"
          subtitle="Track upcoming episodes and movie releases from your watchlist"
          icon={CalendarDays}
        />

        {/* Calendar View */}
        <div className="space-y-6">
          <ReleasesCalendar />
        </div>

        {/* Upcoming Releases List */}
        <div className="space-y-6">
          <UpcomingReleases />
        </div>
      </div>
    </DashboardLayout>
  )
}