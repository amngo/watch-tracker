'use client'

import { Suspense } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { QueuePageContent } from './queue-page-content'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { ListOrdered } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useMedia } from '@/hooks/use-media'

export default function QueuePage() {
  const { stats } = useMedia()
  return (
    <DashboardLayout stats={stats || undefined}>
      <div className="space-y-8">
        <PageHeader
          title="Watch Queue"
          subtitle="Manage your watch queue and track your viewing progress"
          icon={ListOrdered}
        />

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          }
        >
          <QueuePageContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
