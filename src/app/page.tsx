import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  Play,
  TrendingUp,
  Users,
  Smartphone,
  Database,
  Shield,
  ArrowRight,
  Star,
  CheckCircle,
} from 'lucide-react'
import {
  AnimatedSection,
  FadeInCard,
  GradientGlow,
} from '@/components/common/animated-section'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2">
              <Play className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Watch Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            <SignInButton>
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-white text-black hover:bg-gray-100">
                Get Started Free
              </Button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <AnimatedSection delay={0.1}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/50 px-4 py-2 backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Free & Open Source</span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
              Track What You
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Watch
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-gray-300">
              Never lose track of your movies and TV shows again. Add
              timestamped notes, track progress, and share your viewing journey
              with friends.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignUpButton>
                <Button
                  size="lg"
                  className="group h-12 px-8 bg-white text-black font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
                >
                  Start Tracking Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignUpButton>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-900 hover:scale-105 transition-all duration-200"
              >
                View Demo
              </Button>
            </div>
          </AnimatedSection>

          {/* Hero Image/Dashboard Preview */}
          <AnimatedSection delay={0.5}>
            <GradientGlow className="mx-auto max-w-4xl">
              <div className="rounded-xl border border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 p-1 shadow-2xl">
                <div className="rounded-lg bg-black p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-8 rounded bg-gradient-to-b from-blue-500 to-purple-600"></div>
                        <div>
                          <div className="h-4 w-32 rounded bg-gray-700"></div>
                          <div className="mt-2 h-3 w-20 rounded bg-gray-800"></div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">
                        Watching
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-8 rounded bg-gradient-to-b from-red-500 to-orange-600"></div>
                        <div>
                          <div className="h-4 w-40 rounded bg-gray-700"></div>
                          <div className="mt-2 h-3 w-24 rounded bg-gray-800"></div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        Completed
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </GradientGlow>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold">
                Everything you need to track
              </h2>
              <p className="text-xl text-gray-400">
                Powerful features for serious watchers
              </p>
            </div>
          </AnimatedSection>

          <div className="grid gap-8 lg:grid-cols-3">
            <FadeInCard delay={0.1}>
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">
                    Progress Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Track movies by runtime and TV shows by episodes. Automatic
                    progress calculation and episode-by-episode tracking.
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInCard>

            <FadeInCard delay={0.2}>
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">
                    Timestamped Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Add detailed notes with specific timestamps. Perfect for
                    theories, favorite moments, and thoughts.
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInCard>

            <FadeInCard delay={0.3}>
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">
                    Analytics & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Visualize your viewing habits with beautiful charts and
                    statistics. Track your streaks and achievements.
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInCard>

            <FadeInCard delay={0.4}>
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Public Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Share your watch list with friends. Control spoiler
                    visibility and showcase your viewing journey.
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInCard>

            <FadeInCard delay={0.5}>
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-rose-500">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Mobile Optimized</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Fully responsive design with focus mode. Track your progress
                    anywhere, anytime.
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInCard>

            <FadeInCard delay={0.6}>
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">TMDB Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Rich metadata from The Movie Database. Search, discover, and
                    get detailed information about any title.
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInCard>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedSection>
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              <FadeInCard delay={0.1}>
                <div className="hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <div className="mb-2 text-4xl font-bold text-white">100%</div>
                  <div className="text-gray-400">Free to Use</div>
                </div>
              </FadeInCard>
              <FadeInCard delay={0.2}>
                <div className="hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <div className="mb-2 text-4xl font-bold text-white">∞</div>
                  <div className="text-gray-400">Movies & Shows</div>
                </div>
              </FadeInCard>
              <FadeInCard delay={0.3}>
                <div className="hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <div className="mb-2 text-4xl font-bold text-white">📱</div>
                  <div className="text-gray-400">Mobile Ready</div>
                </div>
              </FadeInCard>
              <FadeInCard delay={0.4}>
                <div className="hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <div className="mb-2 text-4xl font-bold text-white">🔒</div>
                  <div className="text-gray-400">Secure & Private</div>
                </div>
              </FadeInCard>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedSection>
            <h2 className="mb-6 text-4xl font-bold">Start tracking today</h2>
            <p className="mb-12 text-xl text-gray-400">
              Join thousands of users who never lose track of their favorite
              shows and movies.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignUpButton>
                <Button
                  size="lg"
                  className="group h-12 px-8 bg-white text-black font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignUpButton>
              <SignInButton>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-900 hover:scale-105 transition-all duration-200"
                >
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2">
                <Play className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Watch Tracker
              </span>
            </div>
            <div className="text-center text-gray-400 lg:text-right">
              <p>
                &copy; 2024 Watch Tracker. Built with Next.js, TypeScript & ❤️
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
