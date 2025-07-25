import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Watch Tracker Dashboard
          </h1>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Welcome to Watch Tracker!
            </h2>
            <p className="text-gray-600">
              Start tracking your favorite movies and TV shows. Add timestamped notes and visualize your viewing progress.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}