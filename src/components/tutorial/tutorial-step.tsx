// TutorialStep.tsx
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useTutorial } from '../providers/tutorial-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

interface TutorialStepProps {
  id: string
  message: string
  order?: number
  children: React.ReactNode
}

export const TutorialStep: React.FC<TutorialStepProps> = ({
  id,
  message,
  order,
  children,
}) => {
  const {
    currentStep,
    isLastStep,
    isFirstStep,
    registerStep,
    nextStep,
    prevStep,
    endTutorial,
  } = useTutorial()

  const ref = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const isActive = currentStep?.id === id

  useEffect(() => {
    // Ensures code only runs in the browser
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    registerStep({ id, message, order })
  }, [id, message, order, registerStep])

  useLayoutEffect(() => {
    if (isActive && ref.current) setRect(ref.current.getBoundingClientRect())
  }, [isActive])

  return (
    <>
      <div ref={ref} className="inline-block relative">
        {children}
      </div>

      {mounted &&
        typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <AnimatePresence>
            {isActive && rect && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className="fixed z-[1001] pointer-events-none border-2 border-yellow-400 rounded-md"
                  style={{
                    top: rect.top - 2,
                    left: rect.left - 2,
                    width: rect.width + 4,
                    height: rect.height + 4,
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                />

                <div
                  className="fixed z-[1000] pointer-events-none"
                  style={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                  }}
                >
                  <div className="w-full h-full">{children}</div>
                </div>

                <motion.div
                  className="fixed z-[1002]"
                  style={{
                    top: rect.bottom + 12,
                    left: rect.left,
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="relative max-w-xs shadow-lg">
                    {/* Corner Close Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={endTutorial}
                      className="absolute right-2 top-2 h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <CardHeader>
                      <CardTitle className="text-base font-medium">
                        Tutorial
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{currentStep.message}</p>

                      {/* Footer Buttons */}
                      <div className="flex gap-2">
                        {!isFirstStep && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={prevStep}
                          >
                            Previous
                          </Button>
                        )}

                        {isLastStep ? (
                          <Button size="sm" onClick={endTutorial}>
                            Finish
                          </Button>
                        ) : (
                          <Button size="sm" onClick={nextStep}>
                            Next
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
