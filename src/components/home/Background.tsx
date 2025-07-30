'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { popularMediaCache } from '@/lib/popular-media'
import { motion } from 'motion/react'

const GridMotion = dynamic(() => import('../ui/grid-motion'), {
  ssr: false,
})

export default function Background() {
  const [items, setItems] = useState<string[]>([])
  const [isGridReady, setIsGridReady] = useState(false)

  useEffect(() => {
    async function loadPopularPosters() {
      try {
        const posters = await popularMediaCache.get(25) // Get 25 popular movie/TV posters
        if (posters.length > 0) {
          setItems(posters)
        }
      } catch (error) {
        console.error('Failed to load popular media posters:', error)
        // Show grid anyway with default items if API fails
        setIsGridReady(true)
      }
    }

    loadPopularPosters()
  }, [])

  const handleImagesLoaded = () => {
    setIsGridReady(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isGridReady ? 0.25 : 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute inset-0"
    >
      <GridMotion items={items} onImagesLoaded={handleImagesLoaded} />
    </motion.div>
  )
}
