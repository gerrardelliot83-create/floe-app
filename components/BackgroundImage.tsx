'use client'

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function BackgroundImage() {
  const { theme, currentBackground } = useTheme()

  useEffect(() => {
    if (theme === 'picture' && currentBackground) {
      document.body.style.backgroundImage = `url(${currentBackground})`
    } else {
      document.body.style.backgroundImage = ''
    }

    return () => {
      document.body.style.backgroundImage = ''
    }
  }, [theme, currentBackground])

  return null
}