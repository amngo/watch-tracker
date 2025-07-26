import { useState, useEffect } from 'react'

/**
 * Custom hook for managing state that persists to localStorage
 * @param key - localStorage key
 * @param defaultValue - default value if localStorage is empty
 * @returns [value, setValue] tuple
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(defaultValue)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        setState(JSON.parse(stored))
      }
    } catch (error) {
      console.warn(`Failed to load state from localStorage key "${key}":`, error)
    }
  }, [key])

  // Save to localStorage when state changes
  const setValue = (value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value
      
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.warn(`Failed to save state to localStorage key "${key}":`, error)
      }
      
      return newValue
    })
  }

  return [state, setValue]
}