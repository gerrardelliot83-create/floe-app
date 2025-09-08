'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import TaskManager from '@/components/TaskManager'
import DeepWork from '@/components/DeepWork'
import AuthScreen from '@/components/AuthScreen'

export default function Home() {
  const [activeView, setActiveView] = useState<'tasks' | 'deepwork'>('tasks')
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="glass-container" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Loading Floe...</h2>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <div className="app">
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        {activeView === 'tasks' ? <TaskManager /> : <DeepWork />}
      </main>
    </div>
  )
}
