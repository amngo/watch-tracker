'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { popularMediaCache } from '@/lib/popular-media'
import { AnimatePresence } from 'motion/react'
import { FadeInSection } from '../common/staggered-animation'

const GridMotion = dynamic(() => import('../ui/grid-motion'), {
  ssr: false,
})

export default function Background() {
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    async function loadPopularPosters() {
      try {
        const posters = await popularMediaCache.get(25) // Get 25 popular movie/TV posters
        if (posters.length > 0) {
          setItems(posters)
        }
      } catch (error) {
        console.error('Failed to load popular media posters:', error)
      }
    }

    loadPopularPosters()
  }, [])
  return (
    <AnimatePresence>
      {items.length > 0 && (
        <FadeInSection className="absolute inset-0">
          <GridMotion items={items} />
        </FadeInSection>
      )}
    </AnimatePresence>
  )
}
