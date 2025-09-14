'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/database'
import Icon from './Icon'
import styles from './TaskDetails.module.css'
import type EditorJS from '@editorjs/editorjs'

interface TaskDetailsProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
}

const PRESET_LABELS = [
  { name: 'bug', color: '#FF4444' },
  { name: 'feature', color: '#4CAF50' },
  { name: 'enhancement', color: '#2196F3' },
  { name: 'documentation', color: '#9C27B0' },
  { name: 'help wanted', color: '#FF9800' },
  { name: 'question', color: '#00BCD4' },
  { name: 'wontfix', color: '#9E9E9E' },
  { name: 'duplicate', color: '#795548' }
]

export default function TaskDetails({ task, onClose, onUpdate }: TaskDetailsProps) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task.priority || 'medium')
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '')
  const [labels, setLabels] = useState<string[]>(task.labels || [])
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [editorInstance, setEditorInstance] = useState<EditorJS | null>(null)

  useEffect(() => {
    initEditor()
    return () => {
      if (editorInstance) {
        editorInstance.destroy()
      }
    }
  }, [task.id])

  const initEditor = async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const Checklist = (await import('@editorjs/checklist')).default

    const editor = new EditorJS({
      holder: 'task-editor',
      data: task.content || { blocks: [] },
      tools: {
        header: {
          class: Header,
          config: {
            levels: [2, 3],
            defaultLevel: 2
          }
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true
        }
      },
      placeholder: 'Add notes, checklists, and more...'
    })

    setEditorInstance(editor)
  }

  const handleSave = async () => {
    if (!editorInstance) return

    const content = await editorInstance.save()

    const updatedTask = {
      ...task,
      title,
      priority: priority as 'low' | 'medium' | 'high',
      due_date: dueDate ? new Date(dueDate + 'T23:59:59').toISOString() : undefined,
      labels,
      content
    }

    onUpdate(updatedTask)
  }

  const toggleLabel = (label: string) => {
    if (labels.includes(label)) {
      setLabels(labels.filter(l => l !== label))
    } else {
      setLabels([...labels, label])
    }
    setTimeout(handleSave, 100)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityIcon = () => {
    switch(priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>
          <Icon name="x" size={20} />
        </button>
        <div className={styles.headerActions}>
          <button className={styles.actionBtn}>
            <Icon name="pin" size={16} />
          </button>
          <button className={styles.actionBtn}>
            <Icon name="moreVertical" size={16} />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.taskHeader}>
          <div className={`checkbox ${task.completed ? 'checked' : ''}`} />
          <input
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
          />
        </div>

        <div className={styles.metadata}>
          {/* Due Date */}
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>
              <Icon name="calendar" size={14} />
              Due date
            </span>
            <div className={styles.metaValue}>
              <input
                type="date"
                className={styles.dateInput}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onBlur={handleSave}
              />
            </div>
          </div>

          {/* Priority */}
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>
              <Icon name="flag" size={14} />
              Priority
            </span>
            <div className={styles.priorityPicker}>
              <button
                className={`${styles.priorityBtn} ${priority === 'low' ? styles.active : ''}`}
                onClick={() => { setPriority('low'); setTimeout(handleSave, 100) }}
              >
                🟢 Low
              </button>
              <button
                className={`${styles.priorityBtn} ${priority === 'medium' ? styles.active : ''}`}
                onClick={() => { setPriority('medium'); setTimeout(handleSave, 100) }}
              >
                🟡 Medium
              </button>
              <button
                className={`${styles.priorityBtn} ${priority === 'high' ? styles.active : ''}`}
                onClick={() => { setPriority('high'); setTimeout(handleSave, 100) }}
              >
                🔴 High
              </button>
            </div>
          </div>

          {/* Labels */}
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>
              <Icon name="tag" size={14} />
              Labels
            </span>
            <div className={styles.metaValue}>
              <div className={styles.labelContainer}>
                {labels.map((label) => (
                  <span
                    key={label}
                    className={styles.label}
                    style={{
                      backgroundColor: PRESET_LABELS.find(l => l.name === label)?.color || '#666'
                    }}
                  >
                    {label}
                    <button
                      className={styles.labelRemove}
                      onClick={() => toggleLabel(label)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  className={styles.addLabelBtn}
                  onClick={() => setShowLabelPicker(!showLabelPicker)}
                >
                  + Add label
                </button>
              </div>

              {showLabelPicker && (
                <div className={styles.labelPicker}>
                  {PRESET_LABELS.filter(l => !labels.includes(l.name)).map((label) => (
                    <button
                      key={label.name}
                      className={styles.labelOption}
                      onClick={() => {
                        toggleLabel(label.name)
                        setShowLabelPicker(false)
                      }}
                    >
                      <span
                        className={styles.labelDot}
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.editorSection}>
          <h3 className={styles.sectionTitle}>Description & Notes</h3>
          <div id="task-editor" className={styles.editor} />
        </div>

        <div className={styles.divider} />

        <div className={styles.activity}>
          <h3 className={styles.sectionTitle}>Activity</h3>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>
              <Icon name="check" size={12} />
            </span>
            <div>
              <p className={styles.activityText}>Task created</p>
              <span className={styles.timestamp}>{formatDate(task.created_at)}</span>
            </div>
          </div>
          {task.updated_at && task.updated_at !== task.created_at && (
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>
                <Icon name="edit" size={12} />
              </span>
              <div>
                <p className={styles.activityText}>Task updated</p>
                <span className={styles.timestamp}>{formatDate(task.updated_at)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}