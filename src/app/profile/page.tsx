'use client'

import { User } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { UserProfileForm } from '@/components/features/profile/user-profile-form'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/trpc/react'
import { useUser } from '@clerk/nextjs'

export default function ProfilePage() {
  const { user: clerkUser } = useUser()
  const { data: stats } = api.user.getStats.useQuery()
  
  // Create user mutation for first-time setup
  const createUser = api.user.create.useMutation()
  
  // Update user mutation
  const updateUser = api.user.updateProfile.useMutation()

  // Mock user data for now - in production this would come from the database
  const mockUser = {
    id: clerkUser?.id || '',
    username: clerkUser?.username || clerkUser?.emailAddresses[0]?.emailAddress.split('@')[0] || '',
    email: clerkUser?.emailAddresses[0]?.emailAddress || '',
    name: clerkUser?.fullName || '',
    avatar: clerkUser?.imageUrl || '',
    isPublic: false,
    profile: {
      isPublic: false,
      showSpoilers: false,
      bio: ''
    }
  }

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateUser.mutateAsync(data)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!clerkUser) {
    return (
      <DashboardLayout stats={stats}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Loading...</h3>
              <p className="text-muted-foreground">
                Please wait while we load your profile
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout stats={stats}>
      <div className="space-y-6">
        <PageHeader
          icon={User}
          title="Profile Settings"
          subtitle="Manage your account information and privacy settings"
        />

        <UserProfileForm
          user={mockUser}
          onUpdate={handleUpdateProfile}
          isLoading={updateUser.isPending}
        />
      </div>
    </DashboardLayout>
  )
}