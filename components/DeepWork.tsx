'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Task, DeepWorkSession } from '@/types/database'
import { useAuth } from './AuthProvider'
import BackgroundImage from './BackgroundImage'
import Icon from './Icon'
import styles from './DeepWork.module.css'

interface DeepWorkProps {
  onBack: () => void
}

export default function DeepWork({ onBack }: DeepWorkProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [sessionActive, setSessionActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [customMode, setCustomMode] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  useEffect(() => {
    if (sessionActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [sessionActive, isPaused, isBreak])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
      .eq('completed', false)
      .order('priority', { ascending: false })

    if (!error && data) {
      setTasks(data)
    }
  }

  const startSession = async () => {
    if (!user) return

    const duration = isBreak ? breakDuration : focusDuration
    setTimeLeft(duration * 60)
    setSessionActive(true)
    setIsPaused(false)

    if (!isBreak && selectedTask) {
      const { data } = await supabase
        .from('deep_work_sessions')
        .insert([{
          user_id: user.id,
          task_id: selectedTask.id,
          duration: focusDuration * 60,
          break_duration: breakDuration * 60,
          started_at: new Date().toISOString(),
          completed: false
        }])
        .select()
        .single()

      if (data) {
        setSessionId(data.id)
      }
    }
  }

  const pauseSession = () => {
    setIsPaused(!isPaused)
  }

  const stopSession = async () => {
    setSessionActive(false)
    setIsPaused(false)
    setTimeLeft(focusDuration * 60)
    
    if (sessionId) {
      await supabase
        .from('deep_work_sessions')
        .update({
          ended_at: new Date().toISOString(),
          completed: false
        })
        .eq('id', sessionId)
      
      setSessionId(null)
    }
  }

  const handleTimerComplete = async () => {
    if (isBreak) {
      setIsBreak(false)
      setTimeLeft(focusDuration * 60)
      playNotification()
      if (window.confirm('Break finished! Ready for another focus session?')) {
        startSession()
      } else {
        setSessionActive(false)
      }
    } else {
      if (sessionId) {
        await supabase
          .from('deep_work_sessions')
          .update({
            ended_at: new Date().toISOString(),
            completed: true
          })
          .eq('id', sessionId)
        
        setSessionId(null)
      }

      setIsBreak(true)
      setTimeLeft(breakDuration * 60)
      playNotification()
      if (window.confirm('Focus session complete! Take a break?')) {
        startSession()
      } else {
        setSessionActive(false)
      }
    }
  }

  const playNotification = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAADmbgAA')
    audio.play().catch(() => {})
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const setPreset = (focus: number, breakTime: number) => {
    setFocusDuration(focus)
    setBreakDuration(breakTime)
    setTimeLeft(focus * 60)
    setCustomMode(false)
  }

  return (
    <>
      <BackgroundImage />
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>
            <Icon name="arrowLeft" size={18} />
            <span>Back to Tasks</span>
          </button>
          <h1 className={styles.title}>Deep Work Mode</h1>
        </header>
        
        <div className={styles.content}>
        <div className={styles.timerSection}>
        <div className={styles.timer}>
          <div className={styles.timerDisplay}>
            <span className={styles.timerText}>{formatTime(timeLeft)}</span>
            <span className={styles.sessionType}>
              {isBreak ? 'Break Time' : 'Focus Time'}
            </span>
          </div>

          <div className={styles.timerControls}>
            {!sessionActive ? (
              <button 
                className="glass-button primary"
                onClick={startSession}
                disabled={!isBreak && !selectedTask}
              >
                Start Session
              </button>
            ) : (
              <>
                <button 
                  className="glass-button"
                  onClick={pauseSession}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button 
                  className="glass-button"
                  onClick={stopSession}
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.presets}>
          <h3>Timer Presets</h3>
          <div className={styles.presetButtons}>
            <button 
              className={`${styles.preset} ${!customMode && focusDuration === 25 ? styles.active : ''}`}
              onClick={() => setPreset(25, 5)}
            >
              <span className={styles.presetTime}>25/5</span>
              <span className={styles.presetLabel}>Classic</span>
            </button>
            <button 
              className={`${styles.preset} ${!customMode && focusDuration === 45 ? styles.active : ''}`}
              onClick={() => setPreset(45, 15)}
            >
              <span className={styles.presetTime}>45/15</span>
              <span className={styles.presetLabel}>Extended</span>
            </button>
            <button 
              className={`${styles.preset} ${customMode ? styles.active : ''}`}
              onClick={() => setCustomMode(true)}
            >
              <span className={styles.presetTime}>Custom</span>
              <span className={styles.presetLabel}>Set your own</span>
            </button>
          </div>

          {customMode && (
            <div className={styles.customInputs}>
              <div className={styles.inputGroup}>
                <label>Focus (min)</label>
                <input
                  type="number"
                  className="glass-input"
                  value={focusDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 25
                    setFocusDuration(val)
                    if (!sessionActive) setTimeLeft(val * 60)
                  }}
                  min="1"
                  max="120"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Break (min)</label>
                <input
                  type="number"
                  className="glass-input"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                  min="1"
                  max="60"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.taskSection}>
        <h3>Select Task for Focus Session</h3>
        <div className={styles.taskList}>
          {tasks.map(task => (
            <div
              key={task.id}
              className={`${styles.taskItem} ${selectedTask?.id === task.id ? styles.selected : ''}`}
              onClick={() => !sessionActive && setSelectedTask(task)}
            >
              <div className={styles.taskInfo}>
                <span className={styles.taskTitle}>{task.title}</span>
                {task.priority && (
                  <span className={`${styles.priority} ${styles[task.priority]}`}>
                    {task.priority}
                  </span>
                )}
              </div>
              {task.due_date && (
                <span className={styles.dueDate}>
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>

        {selectedTask && (
          <div className={styles.selectedTask}>
            <h4>Focusing on:</h4>
            <p>{selectedTask.title}</p>
          </div>
        )}
      </div>
      </div>
      </div>
    </>
  )
}