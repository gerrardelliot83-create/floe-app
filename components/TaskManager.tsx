'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Project, Task } from '@/types/database'
import { useAuth } from './AuthProvider'
import TopNavigation from './TopNavigation'
import ProjectSidebar from './ProjectSidebar'
import TaskList from './TaskList'
import TaskDetails from './TaskDetails'
import BackgroundImage from './BackgroundImage'
import HomeScreen from './HomeScreen'
import styles from './TaskManager.module.css'

interface TaskManagerProps {
  onNavigate: (view: 'tasks' | 'deepwork') => void
  onSignOut: () => void
}

export default function TaskManager({ onNavigate, onSignOut }: TaskManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedView, setSelectedView] = useState<string | null>('home')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showProjects, setShowProjects] = useState(false)
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

    const maxOrder = Math.max(...tasks.map(t => t.order), 0)

    // Determine project and due date based on current view
    let projectId: string | null = null
    let dueDate: string | undefined = undefined

    if (selectedView === 'today') {
      // Tasks created in Today view get today's date
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      dueDate = today.toISOString()
    } else if (selectedView === 'upcoming') {
      // Tasks created in Upcoming view get tomorrow's date by default
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 59, 999)
      dueDate = tomorrow.toISOString()
    } else if (selectedView === 'projects' && selectedProject) {
      // Tasks created in Projects view belong to that project
      projectId = selectedProject
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        project_id: projectId,
        user_id: user.id,
        completed: false,
        order: maxOrder + 1,
        due_date: dueDate
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
    
    // If projects view is selected, show project tasks
    if (selectedView === 'projects' && selectedProject) {
      return tasks.filter(t => t.project_id === selectedProject)
    }
    
    switch(selectedView) {
      case 'home':
        return [] // Home view doesn't show tasks
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
        return tasks.filter(t => !t.project_id && !t.completed)
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
    if (selectedView === 'projects' && selectedProject) {
      return projects.find(p => p.id === selectedProject)?.name || 'Project'
    }
    
    switch(selectedView) {
      case 'home': return 'Home'
      case 'today': return 'Today'
      case 'upcoming': return 'Upcoming'
      case 'projects': return 'Projects'
      default: return 'Tasks'
    }
  }
  
  const handleViewSelect = (view: string | null) => {
    setSelectedView(view)
    if (view === 'projects') {
      setShowProjects(true)
      if (projects.length > 0 && !selectedProject) {
        setSelectedProject(projects[0].id)
      }
    } else {
      setShowProjects(false)
      setSelectedProject(null)
    }
  }

  return (
    <>
      <BackgroundImage />
      <div className={styles.container}>
        <TopNavigation
          selectedView={selectedView}
          onSelectView={handleViewSelect}
          onNavigateToDeepWork={() => onNavigate('deepwork')}
          onSignOut={onSignOut}
          taskCounts={{
            inbox: taskCounts.inbox,
            today: taskCounts.today,
            upcoming: tasks.filter(t => {
              if (t.completed || !t.due_date) return false
              const dueDate = new Date(t.due_date)
              const today = new Date()
              return dueDate > today
            }).length
          }}
        />
        
        <div className={styles.mainContent}>
          {selectedView === 'home' ? (
            <HomeScreen />
          ) : (
            <div className={styles.contentWrapper}>
              <div className={styles.glassmorphicPanel}>
                {showProjects && (
                  <ProjectSidebar
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelectProject={setSelectedProject}
                    onCreateProject={createProject}
                    taskCounts={taskCounts}
                  />
                )}
                
                <div className={styles.taskContainer}>
                  <TaskList
                    title={getViewTitle()}
                    tasks={filteredTasks}
                    onToggleTask={toggleTask}
                    onSelectTask={setSelectedTask}
                    onCreateTask={createTask}
                    onDeleteTask={deleteTask}
                    selectedTask={selectedTask}
                  />
                </div>
                
                {selectedTask && (
                  <TaskDetails
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={updateTask}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}