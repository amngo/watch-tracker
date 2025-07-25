import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              📺 Watch Tracker
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Track your movie and TV show progress with timestamped notes. 
              Never lose track of where you left off or forget your thoughts about what you&apos;re watching.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <SignUpButton>
              <Button size="lg">Get Started</Button>
            </SignUpButton>
            <SignInButton>
              <Button variant="outline" size="lg">Sign In</Button>
            </SignInButton>
          </div>

          <div className="grid gap-8 mx-auto mt-16 max-w-4xl sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎬 Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track movies by runtime and TV shows by episodes. Never lose your place again.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📝 Timestamped Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Add detailed notes with specific timestamps. Capture your thoughts as you watch.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Personal Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualize your viewing habits and see your progress over time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌐 Public Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Share your watch list with friends. Control spoiler visibility.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 Mobile Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fully responsive design with focus mode for distraction-free tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎭 TMDB Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Rich metadata from The Movie Database for comprehensive information.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
