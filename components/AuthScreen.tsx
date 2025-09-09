'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import styles from './AuthScreen.module.css'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage('')

    try {
      await signIn(email)
      setMessage('Check your email for the magic link!')
    } catch (error: any) {
      setMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <div className={styles.header}>
          <h1 className={styles.logo}>Floe</h1>
          <p className={styles.tagline}>Deep Work & Productivity</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>

          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}
        </form>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✓</span>
            <span>Minimalist task management</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✓</span>
            <span>Deep work with Pomodoro timer</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✓</span>
            <span>Distraction-free interface</span>
          </div>
        </div>
      </div>
    </div>
  )
}