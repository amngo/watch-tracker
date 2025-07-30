import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SignUpButton } from '@clerk/nextjs'
import { ArrowRight, CheckCircle } from 'lucide-react'
import {
  AnimatedSection,
  GradientGlow,
} from '@/components/common/animated-section'
import Background from './Background'

export function HeroSection() {
  return (
    <section className="relative py-12 lg:py-24">
      <div className="px-6 mx-auto max-w-6xl text-center z-10 relative">
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
            Never lose track of your movies and TV shows again. Add timestamped
            notes, track progress, and share your viewing journey with friends.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignUpButton>
              <Button
                size="lg"
                className="group font-semibold hover:scale-105 transition-all duration-200"
              >
                Start Tracking Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </SignUpButton>
            <Button
              variant="secondary"
              size="lg"
              className="hover:scale-105 transition-all duration-200"
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
      <Background />
    </section>
  )
}
