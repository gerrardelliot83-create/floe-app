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
  const { changeBackground } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home', count: 0 },
    { id: 'upcoming', label: 'Upcoming', count: taskCounts.upcoming },
    { id: 'projects', label: 'Projects', count: 0 }
  ]

  return (
    <nav className={styles.nav}>
      <div className={styles.navLeft}>
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
          <Icon name="target" size={18} />
          <span>Deep Work</span>
        </button>

        <button 
          className={styles.backgroundBtn}
          onClick={changeBackground}
          title="Change Background"
        >
          <Icon name="image" size={20} />
        </button>

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