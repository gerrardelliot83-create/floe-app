'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import TaskManager from '@/components/TaskManager'
import DeepWork from '@/components/DeepWork'
import AuthScreen from '@/components/AuthScreen'

export default function Home() {
  const [activeView, setActiveView] = useState<'tasks' | 'deepwork'>('tasks')
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-box">
          <h2>Loading Floe...</h2>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  if (activeView === 'deepwork') {
    return <DeepWork onBack={() => setActiveView('tasks')} />
  }

  return <TaskManager onNavigate={setActiveView} onSignOut={signOut} />
}
