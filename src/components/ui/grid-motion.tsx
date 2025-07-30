import { useEffect, useRef, FC, useState } from 'react'
import { gsap } from 'gsap'
import { useImagePreloader } from '@/hooks/useImagePreloader'

interface GridMotionProps {
  items?: string[]
  gradientColor?: string
  onImagesLoaded?: () => void
}

const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = 'black',
  onImagesLoaded,
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseXRef = useRef<number>(window.innerWidth / 2)
  const onImagesLoadedRef = useRef(onImagesLoaded)
  const [isVisible, setIsVisible] = useState(false)

  // Update the ref when onImagesLoaded changes
  useEffect(() => {
    onImagesLoadedRef.current = onImagesLoaded
  }, [onImagesLoaded])

  const totalItems = 28
  const defaultItems = Array.from(
    { length: totalItems },
    (_, index) => `Item ${index + 1}`
  )
  const combinedItems =
    items.length > 0 ? items.slice(0, totalItems) : defaultItems

  // Preload all images
  const { allImagesLoaded, loadingProgress } = useImagePreloader(
    combinedItems.filter(
      item => typeof item === 'string' && item.startsWith('http')
    )
  )

  // Show component only when all images are loaded
  useEffect(() => {
    if (allImagesLoaded && !isVisible) {
      setIsVisible(true)
      onImagesLoadedRef.current?.()
    }
  }, [allImagesLoaded, isVisible])

  useEffect(() => {
    if (!isVisible) return

    gsap.ticker.lagSmoothing(0)

    const handleMouseMove = (e: MouseEvent): void => {
      mouseXRef.current = e.clientX
    }

    const updateMotion = (): void => {
      const maxMoveAmount = 300
      const baseDuration = 0.8
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2]

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1
          const moveAmount =
            ((mouseXRef.current / window.innerWidth) * maxMoveAmount -
              maxMoveAmount / 2) *
            direction

          gsap.to(row, {
            x: moveAmount,
            duration:
              baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto',
          })
        }
      })
    }

    const removeAnimationLoop = gsap.ticker.add(updateMotion)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      removeAnimationLoop()
    }
  }, [isVisible])

  // Don't render anything until images are loaded or if there are no images to load
  if (
    !allImagesLoaded &&
    combinedItems.some(
      item => typeof item === 'string' && item.startsWith('http')
    )
  ) {
    return (
      <div className="h-full w-full overflow-hidden opacity-30 flex items-center justify-center">
        <div className="text-white/50 text-center">
          <div className="animate-pulse mb-2">Loading media...</div>
          <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={gridRef} className="h-full w-full overflow-hidden">
      <section
        className="w-full h-screen overflow-hidden relative flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-[4] bg-[length:250px]"></div>
        <div className="gap-4 flex-none relative w-[150vw] h-[150vh] grid grid-rows-4 grid-cols-1 rotate-[-15deg] origin-center z-[2]">
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 grid-cols-7"
              style={{ willChange: 'transform, filter' }}
              ref={el => {
                if (el) rowRefs.current[rowIndex] = el
              }}
            >
              {Array.from({ length: 7 }, (_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex]
                return (
                  <div key={itemIndex} className="relative">
                    <div className="relative w-full h-full overflow-hidden rounded-[10px] bg-[#111] flex items-center justify-center text-white text-[1.5rem]">
                      {typeof content === 'string' &&
                      content.startsWith('http') ? (
                        <div
                          className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                          style={{ backgroundImage: `url(${content})` }}
                        ></div>
                      ) : (
                        <div className="p-4 text-center z-[1]">{content}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="relative w-full h-full top-0 left-0 pointer-events-none"></div>
      </section>
    </div>
  )
}

export default GridMotion
