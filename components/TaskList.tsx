'use client'

import { useState } from 'react'
import { Task, Project } from '@/types/database'
import Icon from './Icon'
import styles from './TaskList.module.css'

interface TaskListProps {
  title: string
  tasks: Task[]
  selectedTask: Task | null
  projects?: Project[]
  currentView?: string
  onToggleTask: (task: Task) => void
  onSelectTask: (task: Task) => void
  onCreateTask: (title: string, projectId?: string | null) => void
  onCreateProject?: (name: string) => Promise<string | null>
  onDeleteTask: (taskId: string) => void
}

export default function TaskList({
  title,
  tasks,
  selectedTask,
  projects,
  currentView,
  onToggleTask,
  onSelectTask,
  onCreateTask,
  onCreateProject,
  onDeleteTask
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showNewTask, setShowNewTask] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showProjectSelector, setShowProjectSelector] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  const handleCreateTask = async () => {
    if (newTaskTitle.trim()) {
      // For Upcoming view, use selected project if any
      const projectId = currentView === 'upcoming' ? selectedProjectId : null
      onCreateTask(newTaskTitle, projectId)
      setNewTaskTitle('')
      setSelectedProjectId(null)
      setShowNewTask(false)
      setShowProjectSelector(false)
    }
  }

  const handleCreateProject = async () => {
    if (newProjectName.trim() && onCreateProject) {
      const newProjectId = await onCreateProject(newProjectName)
      if (newProjectId) {
        setSelectedProjectId(newProjectId)
        setNewProjectName('')
        setIsCreatingProject(false)
      }
    }
  }

  const getProjectName = (projectId: string | null) => {
    if (!projectId || !projects) return 'No Project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'No Project'
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
          <div className={styles.newTaskWrapper}>
            <div className={styles.newTaskForm}>
              <div className={styles.newTaskCheckbox} />
              <input
                type="text"
                className={styles.newTaskInput}
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !showProjectSelector) handleCreateTask()
                  if (e.key === 'Escape') {
                    setNewTaskTitle('')
                    setShowNewTask(false)
                    setShowProjectSelector(false)
                  }
                }}
                autoFocus
              />
              {currentView === 'upcoming' && projects && (
                <button
                  className={styles.projectSelectorBtn}
                  onClick={() => setShowProjectSelector(!showProjectSelector)}
                  title="Select Project"
                >
                  <Icon name="folder" size={14} />
                  <span>{getProjectName(selectedProjectId)}</span>
                  <Icon name="chevronDown" size={12} />
                </button>
              )}
            </div>

            {showProjectSelector && currentView === 'upcoming' && projects && (
              <div className={styles.projectDropdown}>
                {!isCreatingProject ? (
                  <>
                    <button
                      className={styles.projectOption}
                      onClick={() => {
                        setSelectedProjectId(null)
                        setShowProjectSelector(false)
                      }}
                    >
                      <Icon name="inbox" size={14} />
                      <span>No Project (Inbox)</span>
                    </button>

                    {projects.map(project => (
                      <button
                        key={project.id}
                        className={styles.projectOption}
                        onClick={() => {
                          setSelectedProjectId(project.id)
                          setShowProjectSelector(false)
                        }}
                      >
                        <Icon name="circleFilled" size={8} color={project.color || '#666'} />
                        <span>{project.name}</span>
                      </button>
                    ))}

                    <div className={styles.divider} />

                    <button
                      className={styles.createProjectBtn}
                      onClick={() => setIsCreatingProject(true)}
                    >
                      <Icon name="plus" size={14} />
                      <span>Create New Project</span>
                    </button>
                  </>
                ) : (
                  <div className={styles.createProjectForm}>
                    <input
                      type="text"
                      className={styles.projectNameInput}
                      placeholder="Project name..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleCreateProject()
                        if (e.key === 'Escape') {
                          setNewProjectName('')
                          setIsCreatingProject(false)
                        }
                      }}
                      autoFocus
                    />
                    <div className={styles.createProjectActions}>
                      <button
                        className={styles.cancelBtn}
                        onClick={() => {
                          setNewProjectName('')
                          setIsCreatingProject(false)
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.saveBtn}
                        onClick={handleCreateProject}
                        disabled={!newProjectName.trim()}
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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