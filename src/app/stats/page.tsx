'use client'

import { redirect } from 'next/navigation'

export default function StatisticsPage() {
  // Redirect to overview tab by default
  redirect('/stats/overview')
}
