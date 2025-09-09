'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ThemeMode = 'light' | 'dark' | 'picture'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  currentBackground: string
  changeBackground: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  currentBackground: '',
  changeBackground: () => {}
})

const backgrounds = [
  '/bg/pexels-mo-eid-1268975-11968627.jpg',
  '/bg/pexels-mo-eid-1268975-18533725.jpg',
  '/bg/pexels-mo-eid-1268975-18745884.jpg',
  '/bg/pexels-mo-eid-1268975-19840928.jpg',
  '/bg/pexels-mo-eid-1268975-27647787.jpg',
  '/bg/pexels-mo-eid-1268975-28844362.jpg',
  '/bg/pexels-mo-eid-1268975-28902504.jpg',
  '/bg/pexels-mo-eid-1268975-28902548.jpg',
  '/bg/pexels-mo-eid-1268975-8347501.jpg',
  '/bg/pexels-mo-eid-1268975-8832898.jpg',
  '/bg/pexels-rostislav-5011647.jpg'
]

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('picture')
  const [currentBackground, setCurrentBackground] = useState(backgrounds[0])

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeMode
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Default to picture mode if no saved theme
      setTheme('picture')
    }

    // Set random initial background
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)]
    setCurrentBackground(randomBg)
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const changeBackground = () => {
    const currentIndex = backgrounds.indexOf(currentBackground)
    const nextIndex = (currentIndex + 1) % backgrounds.length
    setCurrentBackground(backgrounds[nextIndex])
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentBackground, changeBackground }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)