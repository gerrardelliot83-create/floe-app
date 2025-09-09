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

export default function TaskDetails({ task, onClose, onUpdate }: TaskDetailsProps) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task.priority || 'medium')
  const [dueDate, setDueDate] = useState(task.due_date || '')
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
      due_date: dueDate || undefined,
      content
    }

    onUpdate(updatedTask)
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
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Assignee</span>
            <button className={styles.metaValue}>
              <span className={styles.avatar}>A</span>
              <span>Assign to me</span>
            </button>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Due date</span>
            <input
              type="date"
              className={styles.dateInput}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={handleSave}
            />
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Priority</span>
            <select
              className={styles.prioritySelect}
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              onBlur={handleSave}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Label</span>
            <button className={styles.metaValue}>
              <span>+ Add label</span>
            </button>
          </div>
        </div>

        <div className="divider" />

        <div className={styles.editorSection}>
          <h3 className={styles.sectionTitle}>Description & Notes</h3>
          <div id="task-editor" className={styles.editor} />
        </div>

        <div className="divider" />

        <div className={styles.activity}>
          <h3 className={styles.sectionTitle}>Activity</h3>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>
              <Icon name="check" size={12} />
            </span>
            <div>
              <p className={styles.activityText}>Task created</p>
              <span className="timestamp">{formatDate(task.created_at)}</span>
            </div>
          </div>
          {task.updated_at && task.updated_at !== task.created_at && (
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>
                <Icon name="edit" size={12} />
              </span>
              <div>
                <p className={styles.activityText}>Task updated</p>
                <span className="timestamp">{formatDate(task.updated_at)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}