'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Project, Task } from '@/types/database'
import { useAuth } from './AuthProvider'
import Sidebar from './Sidebar'
import TaskList from './TaskList'
import TaskDetails from './TaskDetails'
import styles from './TaskManager.module.css'

interface TaskManagerProps {
  onNavigate: (view: 'tasks' | 'deepwork') => void
  onSignOut: () => void
}

export default function TaskManager({ onNavigate, onSignOut }: TaskManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>('inbox')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
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

  const createProject = async (name: string) => {
    if (!name.trim() || !user) return

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name,
        user_id: user.id,
        color: '#666666'
      }])
      .select()
      .single()

    if (!error && data) {
      setProjects([...projects, data])
      setSelectedProject(data.id)
    }
  }

  const createTask = async (title: string) => {
    if (!title.trim() || !user) return

    // For special views like 'inbox', 'today', create without project
    const projectId = ['inbox', 'today', 'upcoming'].includes(selectedProject || '') 
      ? null 
      : selectedProject

    const maxOrder = Math.max(...tasks.map(t => t.order), 0)

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        project_id: projectId,
        user_id: user.id,
        completed: false,
        order: maxOrder + 1
      }])
      .select()
      .single()

    if (!error && data) {
      setTasks([...tasks, data])
    }
  }

  const toggleTask = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        completed: !task.completed,
        updated_at: new Date().toISOString()
      })
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

  const updateTask = async (updatedTask: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        ...updatedTask,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedTask.id)

    if (!error) {
      setTasks(tasks.map(t => 
        t.id === updatedTask.id ? updatedTask : t
      ))
    }
  }

  // Filter tasks based on selected view
  const getFilteredTasks = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch(selectedProject) {
      case 'inbox':
        return tasks.filter(t => !t.project_id && !t.completed)
      case 'today':
        return tasks.filter(t => {
          if (t.completed) return false
          if (!t.due_date) return false
          const dueDate = new Date(t.due_date)
          return dueDate.toDateString() === today.toDateString()
        })
      case 'upcoming':
        return tasks.filter(t => {
          if (t.completed) return false
          if (!t.due_date) return false
          const dueDate = new Date(t.due_date)
          return dueDate > today
        }).sort((a, b) => 
          new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
        )
      default:
        return tasks.filter(t => t.project_id === selectedProject)
    }
  }

  const filteredTasks = getFilteredTasks()

  // Calculate task counts for sidebar
  const taskCounts = {
    inbox: tasks.filter(t => !t.project_id && !t.completed).length,
    today: tasks.filter(t => {
      if (t.completed || !t.due_date) return false
      const today = new Date()
      const dueDate = new Date(t.due_date)
      return dueDate.toDateString() === today.toDateString()
    }).length,
    ...projects.reduce((acc, project) => ({
      ...acc,
      [project.id]: tasks.filter(t => t.project_id === project.id && !t.completed).length
    }), {})
  }

  // Get view title
  const getViewTitle = () => {
    switch(selectedProject) {
      case 'inbox': return 'Inbox'
      case 'today': return 'Today'
      case 'upcoming': return 'Upcoming'
      default: return projects.find(p => p.id === selectedProject)?.name || 'Tasks'
    }
  }

  return (
    <div className={styles.container}>
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onCreateProject={createProject}
        taskCounts={taskCounts}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
      />
      
      <TaskList
        title={getViewTitle()}
        tasks={filteredTasks}
        onToggleTask={toggleTask}
        onSelectTask={setSelectedTask}
        onCreateTask={createTask}
        onDeleteTask={deleteTask}
        selectedTask={selectedTask}
      />
      
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
        />
      )}
    </div>
  )
}