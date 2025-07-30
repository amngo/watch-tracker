import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/home/Navigation'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { Footer } from '@/components/home/Footer'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      {/* <StatsSection /> */}
      <Footer />
    </div>
  )
}
