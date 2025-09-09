'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase'
import styles from './HomeScreen.module.css'

export default function HomeScreen() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ tasksCompleted: 0, timeSpent: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
    // Trigger animation after component mounts
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const loadStats = async () => {
    if (!user) return

    // Get completed tasks count
    const { count: tasksCompleted } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true)

    // Get total time from deep work sessions
    const { data: sessions } = await supabase
      .from('deep_work_sessions')
      .select('duration')
      .eq('user_id', user.id)

    const totalMinutes = sessions?.reduce((acc, session) => acc + (session.duration || 0), 0) || 0

    setStats({
      tasksCompleted: tasksCompleted || 0,
      timeSpent: totalMinutes
    })
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} ${mins === 1 ? 'minute' : 'minutes'}`
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        <h1 className={styles.greeting}>
          We've completed <span className={styles.highlight}>{stats.tasksCompleted}</span> tasks together
        </h1>
        <p className={styles.timeSpent}>
          in {formatTime(stats.timeSpent)}
        </p>
        <h2 className={styles.question}>
          What are we doing today?
        </h2>
      </div>
    </div>
  )
}