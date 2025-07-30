import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Play,
  TrendingUp,
  Users,
  Smartphone,
  Database,
  Star,
} from 'lucide-react'
import {
  AnimatedSection,
  FadeInCard,
} from '@/components/common/animated-section'

export function FeaturesSection() {
  const features = [
    {
      icon: Play,
      title: 'Progress Tracking',
      description: 'Track movies by runtime and TV shows by episodes. Automatic progress calculation and episode-by-episode tracking.',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.1,
    },
    {
      icon: Star,
      title: 'Timestamped Notes',
      description: 'Add detailed notes with specific timestamps. Perfect for theories, favorite moments, and thoughts.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.2,
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Visualize your viewing habits with beautiful charts and statistics. Track your streaks and achievements.',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.3,
    },
    {
      icon: Users,
      title: 'Public Profiles',
      description: 'Share your watch list with friends. Control spoiler visibility and showcase your viewing journey.',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.4,
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Fully responsive design with focus mode. Track your progress anywhere, anytime.',
      gradient: 'from-pink-500 to-rose-500',
      delay: 0.5,
    },
    {
      icon: Database,
      title: 'TMDB Integration',
      description: 'Rich metadata from The Movie Database. Search, discover, and get detailed information about any title.',
      gradient: 'from-indigo-500 to-purple-500',
      delay: 0.6,
    },
  ]

  return (
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
          {features.map((feature) => (
            <FadeInCard key={feature.title} delay={feature.delay}>
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 h-full">
                <CardHeader>
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.gradient}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeInCard>
          ))}
        </div>
      </div>
    </section>
  )
}