'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Icon from './Icon'
import styles from './TopNavigation.module.css'

interface TopNavigationProps {
  selectedView: string | null
  onSelectView: (view: string | null) => void
  onNavigateToDeepWork: () => void
  onSignOut: () => void
  taskCounts: {
    inbox: number
    today: number
    upcoming: number
  }
}

export default function TopNavigation({ 
  selectedView, 
  onSelectView, 
  onNavigateToDeepWork,
  onSignOut,
  taskCounts 
}: TopNavigationProps) {
  const { theme, setTheme, changeBackground } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home', count: 0 },
    { id: 'today', label: 'Today', count: taskCounts.today },
    { id: 'upcoming', label: 'Upcoming', count: taskCounts.upcoming },
    { id: 'projects', label: 'Projects', count: 0 }
  ]

  return (
    <nav className={styles.nav}>
      <div className={styles.navLeft}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Floe</span>
        </div>
        
        <div className={styles.navItems}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${selectedView === item.id ? styles.active : ''}`}
              onClick={() => onSelectView(item.id)}
            >
              <span className={styles.navLabel}>{item.label}</span>
              {item.count > 0 && (
                <span className={styles.navCount}>{item.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.navRight}>
        <button 
          className={styles.deepWorkBtn}
          onClick={onNavigateToDeepWork}
        >
          <span className={styles.deepWorkIcon}>
            <Icon name="target" size={18} />
          </span>
          <span>Deep Work</span>
        </button>

        <div className={styles.themeSelector}>
          <button 
            className={styles.themeTrigger}
            onClick={() => setShowThemeMenu(!showThemeMenu)}
          >
            {theme === 'light' && <Icon name="sun" size={20} />}
            {theme === 'dark' && <Icon name="moon" size={20} />}
            {theme === 'picture' && <Icon name="image" size={20} />}
          </button>
          
          {showThemeMenu && (
            <div className={styles.themeMenu}>
              <button 
                className={`${styles.themeOption} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => {
                  setTheme('light')
                  setShowThemeMenu(false)
                }}
              >
                <Icon name="sun" size={16} />
                Light
              </button>
              <button 
                className={`${styles.themeOption} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => {
                  setTheme('dark')
                  setShowThemeMenu(false)
                }}
              >
                <Icon name="moon" size={16} />
                Dark
              </button>
              <button 
                className={`${styles.themeOption} ${theme === 'picture' ? styles.active : ''}`}
                onClick={() => {
                  setTheme('picture')
                  setShowThemeMenu(false)
                }}
              >
                <Icon name="image" size={16} />
                Picture
              </button>
              {theme === 'picture' && (
                <>
                  <div className={styles.divider} />
                  <button 
                    className={styles.themeOption}
                    onClick={changeBackground}
                  >
                    <Icon name="refresh" size={16} />
                    Change Background
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className={styles.profileMenu}>
          <button 
            className={styles.profileTrigger}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span className={styles.profileAvatar}>A</span>
          </button>
          
          {showProfileMenu && (
            <div className={styles.profileDropdown}>
              <button className={styles.profileOption}>
                <Icon name="settings" size={16} />
                Settings
              </button>
              <button 
                className={styles.profileOption}
                onClick={onSignOut}
              >
                <Icon name="logout" size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}