import { useState, useEffect, useCallback, useMemo } from 'react'

interface UseImagePreloaderResult {
  allImagesLoaded: boolean
  loadedCount: number
  totalCount: number
  loadingProgress: number
}

export function useImagePreloader(imageSources: string[]): UseImagePreloaderResult {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  
  // Memoize the image sources string to prevent unnecessary effect runs
  const imageSourcesKey = useMemo(() => imageSources.join(','), [imageSources])
  
  const totalCount = imageSources.length
  const loadedCount = loadedImages.size + failedImages.size
  const allImagesLoaded = loadedCount === totalCount && totalCount > 0
  const loadingProgress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image()
      
      img.onload = () => {
        setLoadedImages(prev => {
          if (prev.has(src)) return prev // Already loaded, avoid unnecessary update
          return new Set(prev).add(src)
        })
        resolve()
      }
      
      img.onerror = () => {
        setFailedImages(prev => {
          if (prev.has(src)) return prev // Already failed, avoid unnecessary update
          return new Set(prev).add(src)
        })
        resolve() // Resolve anyway to continue loading other images
      }
      
      img.src = src
    })
  }, []) // Remove state dependencies

  useEffect(() => {
    if (imageSources.length === 0) return

    // Reset state when image sources change
    setLoadedImages(new Set())
    setFailedImages(new Set())

    // Filter out non-URL strings and preload all images
    const validUrls = imageSources.filter(src => 
      typeof src === 'string' && src.startsWith('http')
    )

    const loadAllImages = async () => {
      const loadPromises = validUrls.map(src => preloadImage(src))
      await Promise.all(loadPromises)
    }

    loadAllImages()
  }, [imageSourcesKey, preloadImage])

  return {
    allImagesLoaded,
    loadedCount,
    totalCount,
    loadingProgress
  }
}