import { Button } from '@/components/ui/button'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'
import { AnimatedSection } from '@/components/common/animated-section'

export function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl text-center">
        <AnimatedSection>
          <h2 className="mb-6 text-4xl font-bold">Start tracking today</h2>
          <p className="mb-12 text-xl text-gray-400">
            Join thousands of users who never lose track of their favorite shows
            and movies.
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignUpButton>
              <Button
                size="lg"
                className="group font-semibold hover:scale-105 transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button
                variant="outline"
                size="lg"
                className="hover:scale-105 transition-all duration-200"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
