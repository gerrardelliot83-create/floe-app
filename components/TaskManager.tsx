'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Project, Task } from '@/types/database'
import { useAuth } from './AuthProvider'
import styles from './TaskManager.module.css'
import TaskEditor from './TaskEditor'

export default function TaskManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchProjects()
      fetchTasks()
    }
  }, [user])

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProjects(data)
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id)
      }
    }
  }

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
      .order('order', { ascending: true })

    if (!error && data) {
      setTasks(data)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim() || !user) return

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: newProjectName,
        user_id: user.id
      }])
      .select()
      .single()

    if (!error && data) {
      setProjects([data, ...projects])
      setNewProjectName('')
      setShowNewProject(false)
      setSelectedProject(data.id)
    }
  }

  const createTask = async () => {
    if (!newTaskTitle.trim() || !user || !selectedProject) return

    const maxOrder = Math.max(...tasks.filter(t => t.project_id === selectedProject).map(t => t.order), 0)

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: newTaskTitle,
        project_id: selectedProject,
        user_id: user.id,
        completed: false,
        order: maxOrder + 1
      }])
      .select()
      .single()

    if (!error && data) {
      setTasks([...tasks, data])
      setNewTaskTitle('')
    }
  }

  const toggleTask = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)

    if (!error) {
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ))
    }
  }

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (!error) {
      setTasks(tasks.filter(t => t.id !== taskId))
      if (selectedTask?.id === taskId) {
        setSelectedTask(null)
      }
    }
  }

  const projectTasks = tasks.filter(t => t.project_id === selectedProject)

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Projects</h2>
          <button 
            className="glass-button"
            onClick={() => setShowNewProject(!showNewProject)}
          >
            +
          </button>
        </div>

        {showNewProject && (
          <div className={styles.newProject}>
            <input
              type="text"
              className="glass-input"
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createProject()}
            />
            <button 
              className="glass-button primary"
              onClick={createProject}
            >
              Create
            </button>
          </div>
        )}

        <div className={styles.projectList}>
          {projects.map(project => (
            <div
              key={project.id}
              className={`${styles.projectItem} ${selectedProject === project.id ? styles.active : ''}`}
              onClick={() => setSelectedProject(project.id)}
            >
              <div className={styles.projectColor} style={{ 
                background: project.color || 'var(--primary-color)' 
              }} />
              <span>{project.name}</span>
              <span className={styles.taskCount}>
                {tasks.filter(t => t.project_id === project.id).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.taskList}>
          <div className={styles.taskHeader}>
            <h2>{projects.find(p => p.id === selectedProject)?.name || 'Select a project'}</h2>
          </div>

          {selectedProject && (
            <div className={styles.newTask}>
              <input
                type="text"
                className="glass-input"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTask()}
              />
              <button 
                className="glass-button primary"
                onClick={createTask}
              >
                Add Task
              </button>
            </div>
          )}

          <div className={styles.tasks}>
            {projectTasks.map(task => (
              <div 
                key={task.id} 
                className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  className={styles.checkbox}
                />
                <div 
                  className={styles.taskContent}
                  onClick={() => setSelectedTask(task)}
                >
                  <span className={styles.taskTitle}>{task.title}</span>
                  {task.due_date && (
                    <span className={styles.dueDate}>
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button 
                  className={styles.deleteButton}
                  onClick={() => deleteTask(task.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedTask && (
          <div className={styles.taskDetails}>
            <TaskEditor 
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdate={(updatedTask) => {
                setTasks(tasks.map(t => 
                  t.id === updatedTask.id ? updatedTask : t
                ))
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}