'use client'

import { useState } from 'react'
import { Project } from '@/types/database'
import Icon from './Icon'
import styles from './ProjectSidebar.module.css'

interface ProjectSidebarProps {
  projects: Project[]
  selectedProject: string | null
  onSelectProject: (projectId: string) => void
  onCreateProject: (name: string) => void
  taskCounts: { [key: string]: number }
}

export default function ProjectSidebar({ 
  projects, 
  selectedProject, 
  onSelectProject, 
  onCreateProject,
  taskCounts 
}: ProjectSidebarProps) {
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName)
      setNewProjectName('')
      setShowNewProject(false)
    }
  }

  return (
    <aside className={styles.container}>
      <div className={styles.header}>
        <h3>Projects</h3>
        <button 
          className={styles.addBtn}
          onClick={() => setShowNewProject(!showNewProject)}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>

      {showNewProject && (
        <div className={styles.newProject}>
          <input
            type="text"
            className={styles.newProjectInput}
            placeholder="Project name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            onBlur={() => !newProjectName && setShowNewProject(false)}
            autoFocus
          />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.projectList}>
        {projects.map(project => (
          <div
            key={project.id}
            className={`${styles.projectItem} ${selectedProject === project.id ? styles.active : ''}`}
            onClick={() => onSelectProject(project.id)}
          >
            <span className={styles.projectIcon}>
              <Icon name="circleFilled" size={8} color={project.color || 'var(--text-secondary)'} />
            </span>
            <span className={styles.projectName}>{project.name}</span>
            {taskCounts[project.id] > 0 && (
              <span className={styles.count}>{taskCounts[project.id]}</span>
            )}
          </div>
        ))}
        </div>
      </div>
    </aside>
  )
}