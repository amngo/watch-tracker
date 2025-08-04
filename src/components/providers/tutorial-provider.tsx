'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface Step {
  id: string
  message: string
  order?: number
  index: number
}

interface TutorialContextType {
  currentStep: Step | null
  isLastStep: boolean
  isFirstStep: boolean
  registerStep: (step: Omit<Step, 'index'>) => void
  nextStep: () => void
  prevStep: () => void
  endTutorial: () => void
  restartTutorial: () => void // NEW
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
)

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [steps, setSteps] = useState<Step[]>([])
  const [index, setIndex] = useState(0)

  const registerStep = useCallback((step: Omit<Step, 'index'>) => {
    setSteps(prev => {
      if (prev.find(s => s.id === step.id)) return prev
      const newStep: Step = { ...step, index: prev.length }
      const updated = [...prev, newStep].sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER
        if (orderA !== orderB) return orderA - orderB
        return a.index - b.index
      })
      return updated
    })
  }, [])

  const nextStep = () =>
    setIndex(prev => (prev + 1 < steps.length ? prev + 1 : prev))
  const prevStep = () => setIndex(prev => (prev - 1 >= 0 ? prev - 1 : prev))
  const endTutorial = () => setIndex(steps.length)
  const restartTutorial = () => setIndex(0) // reset to first step

  const currentStep = index < steps.length ? steps[index] : null
  const isFirstStep = index === 0
  const isLastStep = index === steps.length - 1

  return (
    <TutorialContext.Provider
      value={{
        currentStep,
        isLastStep,
        isFirstStep,
        registerStep,
        nextStep,
        prevStep,
        endTutorial,
        restartTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export const useTutorial = () => {
  const ctx = useContext(TutorialContext)
  if (!ctx) throw new Error('useTutorial must be used inside TutorialProvider')
  return ctx
}
