import { Play } from 'lucide-react'

export function Footer() {
  return (
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
  )
}