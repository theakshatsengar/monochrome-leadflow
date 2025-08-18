import React, { useEffect, useState } from 'react'
import { useEmailTemplateStore } from '@/store/emailTemplateStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Copy, Edit, Trash2, Plus } from 'lucide-react'
import { EmailTemplate } from '@/services/emailTemplateService'

export default function EmailTemplatesPage() {
  const { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplateStore()
  const { user } = useAuthStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const openCreate = () => {
    setEditingId(null)
    setSubject('')
    setBody('')
    setOpen(true)
  }

  const openEdit = (id: string) => {
    const t = templates.find(x => x.id === id)
    if (!t) return
    setEditingId(id)
    setSubject(t.subject)
    setBody(t.body)
    setOpen(true)
  }

  const onSave = async () => {
    if (!user) return
    if (editingId) {
      await updateTemplate(editingId, { subject, body })
    } else {
      // create: set name to current user's name and set public true
      await createTemplate({ name: user.name, subject, body, isPublic: true })
    }
    await fetchTemplates()
    setOpen(false)
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    await deleteTemplate(id)
    await fetchTemplates()
  }

  const onCopy = async (t: EmailTemplate) => {
    try {
      await navigator.clipboard.writeText(`${t.subject}\n\n${t.body}`)
      // optional: show toast
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Email Templates</h2>
        <div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Template</Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Template' : 'New Template'}</DialogTitle>
            <DialogDescription>{editingId ? 'Edit subject and body' : 'Create a new public template'}</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Input placeholder="Subject" value={subject} onChange={(e) => setSubject((e.target as HTMLInputElement).value)} />
          </div>
          <div className="mt-4">
            <Textarea placeholder="Body" value={body} onChange={(e) => setBody((e.target as HTMLTextAreaElement).value)} />
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button onClick={onSave} disabled={loading || !subject}>Save</Button>
              <DialogClose>
                <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {templates.map(t => (
          <Card key={t.id} className="p-4 relative flex flex-col h-full">
            <button aria-label="Copy template" title="Copy template" onClick={() => onCopy(t)} className="absolute right-3 top-3 p-1 rounded hover:bg-muted">
              <Copy className="h-4 w-4" />
            </button>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t.subject}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{t.body}</p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-transparent">
              <p className="text-xs text-muted-foreground">Added by: {t.name}</p>
              <div className="flex items-center gap-2">
                {(t.userId === user?.id || user?.role === 'admin') && (
                  <button aria-label="Edit template" title="Edit template" onClick={() => openEdit(t.id)} className="p-1 rounded hover:bg-muted"><Edit className="h-4 w-4" /></button>
                )}
                {user?.role === 'admin' && (
                  <button aria-label="Delete template" title="Delete template" onClick={() => onDelete(t.id)} className="p-1 rounded hover:bg-red-50 text-destructive"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
