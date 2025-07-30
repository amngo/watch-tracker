import { Button } from '@/components/ui/button'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Play } from 'lucide-react'

export function Navigation() {
  return (
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
  )
}