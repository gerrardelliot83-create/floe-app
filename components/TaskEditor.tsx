'use client'

import { useEffect, useRef, useState } from 'react'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import Checklist from '@editorjs/checklist'
import ImageTool from '@editorjs/image'
import AttachesTool from '@editorjs/attaches'
import { createClient } from '@/lib/supabase'
import { Task } from '@/types/database'
import styles from './TaskEditor.module.css'

interface TaskEditorProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
}

export default function TaskEditor({ task, onClose, onUpdate }: TaskEditorProps) {
  const editorRef = useRef<EditorJS | null>(null)
  const [saving, setSaving] = useState(false)
  const [priority, setPriority] = useState(task.priority || 'medium')
  const [dueDate, setDueDate] = useState(task.due_date || '')
  const supabase = createClient()

  useEffect(() => {
    initEditor()
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [task.id])

  const initEditor = () => {
    const editor = new EditorJS({
      holder: 'editorjs',
      data: task.content || { blocks: [] },
      tools: {
        header: {
          class: Header,
          config: {
            levels: [1, 2, 3],
            defaultLevel: 2
          }
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true
        },
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                const formData = new FormData()
                formData.append('files', file)
                
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData
                })
                
                const data = await response.json()
                return {
                  success: 1,
                  file: {
                    url: data.url
                  }
                }
              }
            }
          }
        },
        attaches: {
          class: AttachesTool,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                const formData = new FormData()
                formData.append('files', file)
                
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData
                })
                
                const data = await response.json()
                return {
                  success: 1,
                  file: {
                    url: data.url,
                    name: file.name,
                    size: file.size
                  }
                }
              }
            }
          }
        }
      },
      placeholder: 'Add task details...'
    })

    editorRef.current = editor
  }

  const saveTask = async () => {
    if (!editorRef.current) return
    
    setSaving(true)
    const content = await editorRef.current.save()
    
    const { data, error } = await supabase
      .from('tasks')
      .update({
        content,
        priority,
        due_date: dueDate || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id)
      .select()
      .single()

    if (!error && data) {
      onUpdate(data)
    }
    
    setSaving(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{task.title}</h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>

      <div className={styles.metadata}>
        <div className={styles.field}>
          <label>Priority</label>
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="glass-input"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="glass-input"
          />
        </div>
      </div>

      <div className={styles.editor}>
        <div id="editorjs"></div>
      </div>

      <div className={styles.actions}>
        <button 
          onClick={saveTask} 
          className="glass-button primary"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}