'use client'

import { useAuth } from './AuthProvider'
import styles from './Navigation.module.css'

export default function Navigation({ activeView, setActiveView }: { 
  activeView: 'tasks' | 'deepwork',
  setActiveView: (view: 'tasks' | 'deepwork') => void 
}) {
  const { user, signOut } = useAuth()

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Floe</div>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeView === 'tasks' ? styles.active : ''}`}
          onClick={() => setActiveView('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`${styles.tab} ${activeView === 'deepwork' ? styles.active : ''}`}
          onClick={() => setActiveView('deepwork')}
        >
          Deep Work
        </button>
      </div>

      <div className={styles.user}>
        {user && (
          <>
            <span className={styles.email}>{user.email}</span>
            <button onClick={signOut} className="glass-button">
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  )
}