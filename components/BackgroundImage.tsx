'use client'

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function BackgroundImage() {
  const { currentBackground } = useTheme()

  useEffect(() => {
    if (currentBackground) {
      document.body.style.backgroundImage = `url(${currentBackground})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundAttachment = 'fixed'
    }

    return () => {
      document.body.style.backgroundImage = ''
      document.body.style.backgroundSize = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundRepeat = ''
      document.body.style.backgroundAttachment = ''
    }
  }, [currentBackground])

  return null
}