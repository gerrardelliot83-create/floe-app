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

interface Label {
  name: string
  color: string
}

const PRESET_COLORS = [
  '#FF4444', // Red
  '#FF6B6B', // Light Red
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#00BCD4', // Cyan
  '#795548', // Brown
  '#9E9E9E', // Grey
  '#F44336', // Material Red
  '#E91E63', // Pink
  '#3F51B5', // Indigo
  '#009688', // Teal
  '#FFC107', // Amber
  '#607D8B', // Blue Grey
]

export default function TaskDetails({ task, onClose, onUpdate }: TaskDetailsProps) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task.priority || 'medium')
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '')
  const [labels, setLabels] = useState<Label[]>(() => {
    // Parse labels from task (could be string array or Label array)
    if (!task.labels || task.labels.length === 0) return []
    if (typeof task.labels[0] === 'string') {
      // Convert string labels to Label objects with default color
      return (task.labels as string[]).map(name => ({ name, color: '#666' }))
    }
    return task.labels as unknown as Label[]
  })
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [showCreateLabel, setShowCreateLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#2196F3')
  const [editorInstance, setEditorInstance] = useState<EditorJS | null>(null)

  // Update state when task prop changes
  useEffect(() => {
    setTitle(task.title)
    setPriority(task.priority || 'medium')
    setDueDate(task.due_date ? task.due_date.split('T')[0] : '')

    // Parse labels from task
    if (!task.labels || task.labels.length === 0) {
      setLabels([])
    } else if (typeof task.labels[0] === 'string') {
      setLabels((task.labels as string[]).map(name => ({ name, color: '#666' })))
    } else {
      setLabels(task.labels as unknown as Label[])
    }

    // Reset picker states
    setShowLabelPicker(false)
    setShowCreateLabel(false)
  }, [task])

  useEffect(() => {
    // Clean up previous editor instance
    if (editorInstance) {
      editorInstance.destroy()
      setEditorInstance(null)
    }

    // Initialize new editor for new task
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
      labels: labels as any, // Store as Label objects
      content
    }

    onUpdate(updatedTask)
  }

  const addLabel = (label: Label) => {
    if (!labels.find(l => l.name === label.name)) {
      setLabels([...labels, label])
      setTimeout(handleSave, 100)
    }
  }

  const removeLabel = (labelName: string) => {
    setLabels(labels.filter(l => l.name !== labelName))
    setTimeout(handleSave, 100)
  }

  const createNewLabel = () => {
    if (newLabelName.trim()) {
      addLabel({ name: newLabelName.trim(), color: newLabelColor })
      setNewLabelName('')
      setNewLabelColor('#2196F3')
      setShowCreateLabel(false)
      setShowLabelPicker(false)
    }
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
                    key={label.name}
                    className={styles.label}
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                    <button
                      className={styles.labelRemove}
                      onClick={() => removeLabel(label.name)}
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
                  <button
                    className={styles.createLabelBtn}
                    onClick={() => {
                      setShowCreateLabel(true)
                      setShowLabelPicker(false)
                    }}
                  >
                    <Icon name="plus" size={14} />
                    Create new label
                  </button>
                  {/* Show existing labels from task history */}
                  {labels.length > 0 && (
                    <div className={styles.labelDivider}>Recent</div>
                  )}
                  {labels.slice(0, 5).map((label) => (
                    <button
                      key={label.name}
                      className={styles.labelOption}
                      onClick={() => setShowLabelPicker(false)}
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

              {showCreateLabel && (
                <div className={styles.createLabelModal}>
                  <div className={styles.createLabelHeader}>
                    <h4>Create Label</h4>
                    <button
                      className={styles.closeLabelModal}
                      onClick={() => {
                        setShowCreateLabel(false)
                        setNewLabelName('')
                      }}
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    className={styles.labelNameInput}
                    placeholder="Label name"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') createNewLabel()
                    }}
                    autoFocus
                  />
                  <div className={styles.colorPickerLabel}>Choose color</div>
                  <div className={styles.colorPicker}>
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`${styles.colorOption} ${newLabelColor === color ? styles.selected : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewLabelColor(color)}
                      />
                    ))}
                  </div>
                  <div className={styles.createLabelActions}>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => {
                        setShowCreateLabel(false)
                        setNewLabelName('')
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.saveBtn}
                      onClick={createNewLabel}
                      disabled={!newLabelName.trim()}
                    >
                      Create
                    </button>
                  </div>
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