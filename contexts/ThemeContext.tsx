'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeContextType {
  currentBackground: string
  changeBackground: () => void
}

const ThemeContext = createContext<ThemeContextType>({
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
  const [currentBackground, setCurrentBackground] = useState(backgrounds[0])

  useEffect(() => {
    // Set picture mode as default
    document.documentElement.setAttribute('data-theme', 'picture')
    
    // Set random initial background
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)]
    setCurrentBackground(randomBg)
  }, [])

  const changeBackground = () => {
    const currentIndex = backgrounds.indexOf(currentBackground)
    const nextIndex = (currentIndex + 1) % backgrounds.length
    setCurrentBackground(backgrounds[nextIndex])
  }

  return (
    <ThemeContext.Provider value={{ currentBackground, changeBackground }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)