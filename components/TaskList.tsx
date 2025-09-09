'use client'

import { useState } from 'react'
import { Task } from '@/types/database'
import Icon from './Icon'
import styles from './TaskList.module.css'

interface TaskListProps {
  title: string
  tasks: Task[]
  selectedTask: Task | null
  onToggleTask: (task: Task) => void
  onSelectTask: (task: Task) => void
  onCreateTask: (title: string) => void
  onDeleteTask: (taskId: string) => void
}

export default function TaskList({
  title,
  tasks,
  selectedTask,
  onToggleTask,
  onSelectTask,
  onCreateTask,
  onDeleteTask
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showNewTask, setShowNewTask] = useState(false)

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle)
      setNewTaskTitle('')
      setShowNewTask(false)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffTime = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const formatDueDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dueDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    
    if (dueDate.getTime() === today.getTime()) return 'Today'
    if (dueDate.getTime() === today.getTime() + 86400000) return 'Tomorrow'
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    if (d.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric'
    }
    return d.toLocaleDateString('en-US', options)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.headerActions}>
          <button className={styles.shareBtn}>Share</button>
          <button className={styles.moreBtn}>
            <Icon name="moreHorizontal" size={18} />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {showNewTask ? (
          <div className={styles.newTaskForm}>
            <div className={styles.newTaskCheckbox} />
            <input
              type="text"
              className={styles.newTaskInput}
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCreateTask()
                if (e.key === 'Escape') {
                  setNewTaskTitle('')
                  setShowNewTask(false)
                }
              }}
              onBlur={() => !newTaskTitle && setShowNewTask(false)}
              autoFocus
            />
          </div>
        ) : (
          <button 
            className={styles.addTaskBtn}
            onClick={() => setShowNewTask(true)}
          >
            <span className={styles.plusIcon}>
              <Icon name="plus" size={14} />
            </span>
            Add task
          </button>
        )}

        <div className={styles.taskList}>
          {tasks.map(task => (
            <div 
              key={task.id}
              className={`${styles.taskItem} ${selectedTask?.id === task.id ? styles.selected : ''}`}
            >
              <div 
                className={`checkbox ${task.completed ? 'checked' : ''}`}
                onClick={() => onToggleTask(task)}
              />
              
              <div 
                className={styles.taskContent}
                onClick={() => onSelectTask(task)}
              >
                <span className={`${styles.taskTitle} ${task.completed ? styles.completed : ''}`}>
                  {task.title}
                </span>
                
                <div className={styles.taskMeta}>
                  {task.due_date && (
                    <span className={`${styles.dueDate} ${
                      new Date(task.due_date) < new Date() && !task.completed ? styles.overdue : ''
                    }`}>
                      <Icon name="calendar" size={12} />
                      {formatDueDate(task.due_date)}
                    </span>
                  )}
                  
                  {task.priority === 'high' && (
                    <span className={`tag red`}>High</span>
                  )}
                  
                  <span className="timestamp">
                    {formatDate(task.created_at)}
                  </span>
                </div>
              </div>

              <button 
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteTask(task.id)
                }}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}