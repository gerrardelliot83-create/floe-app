'use client'

import { useState } from 'react'
import { Project } from '@/types/database'
import Icon from './Icon'
import styles from './Sidebar.module.css'

interface SidebarProps {
  projects: Project[]
  selectedProject: string | null
  onSelectProject: (projectId: string | null) => void
  onCreateProject: (name: string) => void
  taskCounts: { [key: string]: number }
  onNavigate: (view: 'tasks' | 'deepwork') => void
  onSignOut: () => void
}

export default function Sidebar({ 
  projects, 
  selectedProject, 
  onSelectProject, 
  onCreateProject,
  taskCounts,
  onNavigate,
  onSignOut
}: SidebarProps) {
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [expandedSections, setExpandedSections] = useState<string[]>(['favorites', 'projects'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName)
      setNewProjectName('')
      setShowNewProject(false)
    }
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <nav className={styles.navigation}>
          <div className={styles.navItem} onClick={() => onSelectProject('inbox')}>
            <span className={styles.navIcon}>
              <Icon name="inbox" size={18} />
            </span>
            <span className={styles.navLabel}>Inbox</span>
            {taskCounts['inbox'] > 0 && (
              <span className={styles.count}>{taskCounts['inbox']}</span>
            )}
          </div>
          
          <div className={`${styles.navItem} ${styles.today}`} onClick={() => onSelectProject('today')}>
            <span className={styles.navIcon}>
              <Icon name="calendar" size={18} />
            </span>
            <span className={styles.navLabel}>Today</span>
            {taskCounts['today'] > 0 && (
              <span className={styles.count}>{taskCounts['today']}</span>
            )}
          </div>

          <div className={styles.navItem} onClick={() => onSelectProject('upcoming')}>
            <span className={styles.navIcon}>
              <Icon name="calendarDays" size={18} />
            </span>
            <span className={styles.navLabel}>Upcoming</span>
          </div>

          <div className={styles.divider} />
          
          <div className={styles.navItem} onClick={() => onNavigate('deepwork')}>
            <span className={styles.navIcon}>
              <Icon name="target" size={18} />
            </span>
            <span className={styles.navLabel}>Deep Work</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('favorites')}>
              <span className={styles.sectionTitle}>Favorites</span>
              <span className={styles.chevron}>
                <Icon 
                  name={expandedSections.includes('favorites') ? 'chevronDown' : 'chevronRight'} 
                  size={12} 
                />
              </span>
            </div>
            
            {expandedSections.includes('favorites') && (
              <div className={styles.sectionContent}>
                {projects.filter(p => p.color === '#FF4444').map(project => (
                  <div
                    key={project.id}
                    className={`${styles.projectItem} ${selectedProject === project.id ? styles.active : ''}`}
                    onClick={() => onSelectProject(project.id)}
                  >
                    <span className={styles.projectIcon}>
                      <Icon name="circleFilled" size={8} color={project.color || '#666666'} />
                    </span>
                    <span className={styles.projectName}>{project.name}</span>
                    {taskCounts[project.id] > 0 && (
                      <span className={styles.count}>{taskCounts[project.id]}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('projects')}>
              <span className={styles.sectionTitle}>Projects</span>
              <span className={styles.chevron}>
                <Icon 
                  name={expandedSections.includes('projects') ? 'chevronDown' : 'chevronRight'} 
                  size={12} 
                />
              </span>
            </div>
            
            {expandedSections.includes('projects') && (
              <div className={styles.sectionContent}>
                {projects.filter(p => p.color !== '#FF4444').map(project => (
                  <div
                    key={project.id}
                    className={`${styles.projectItem} ${selectedProject === project.id ? styles.active : ''}`}
                    onClick={() => onSelectProject(project.id)}
                  >
                    <span className={styles.projectIcon}>
                      <Icon name="circleFilled" size={8} color={project.color || '#666666'} />
                    </span>
                    <span className={styles.projectName}>{project.name}</span>
                    {taskCounts[project.id] > 0 && (
                      <span className={styles.count}>{taskCounts[project.id]}</span>
                    )}
                  </div>
                ))}
                
                {showNewProject ? (
                  <div className={styles.newProjectForm}>
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
                ) : (
                  <button 
                    className={styles.addProject}
                    onClick={() => setShowNewProject(true)}
                  >
                    + New Project
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
      
      <div className={styles.sidebarFooter}>
        <button className={styles.upgradeBtn} onClick={onSignOut}>
          Sign Out
        </button>
        <div className={styles.userAvatar}>
          <span>A</span>
        </div>
      </div>
    </aside>
  )
}