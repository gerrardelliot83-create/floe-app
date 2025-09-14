export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  color?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  user_id: string
  title: string
  content?: any
  completed: boolean
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
  labels?: string[]
  created_at: string
  updated_at: string
  order: number
}

export interface DeepWorkSession {
  id: string
  user_id: string
  task_id?: string
  duration: number
  break_duration: number
  started_at: string
  ended_at?: string
  completed: boolean
}