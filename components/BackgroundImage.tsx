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

  return (
    <>
      {/* Dark overlay for better readability */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      {/* Gradient overlay for depth */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </>
  )
}