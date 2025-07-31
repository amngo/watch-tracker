import { Button } from '@/components/ui/button'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Github, Play } from 'lucide-react'
import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="relative z-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl items-center justify-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2">
            <Play className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Watch Tracker</span>
        </div>
        <div className="items-center gap-4 hidden sm:flex">
          <SignInButton>
            <Button variant="ghost">Sign In</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Get Started Free</Button>
          </SignUpButton>
          <Button variant="outline" size="lg" asChild>
            <Link href="https://github.com/amngo/watch-tracker" target="_blank">
              <Github /> Source Code
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
