import { create } from 'zustand'
import { EmailTemplateService, EmailTemplate } from '@/services/emailTemplateService'
import { useAuthStore } from '@/store/authStore'

type State = {
  templates: EmailTemplate[]
  loading: boolean
  error?: string | null
  fetchTemplates: () => Promise<void>
  createTemplate: (t: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
}

export const useEmailTemplateStore = create<State>((set, get) => ({
  templates: [],
  loading: false,
  error: null,
  fetchTemplates: async () => {
    set({ loading: true, error: null })
    const user = useAuthStore.getState().user
    try {
      const data = await EmailTemplateService.findAll(user?.id)
      set({ templates: data, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false })
    }
  },
  createTemplate: async (t) => {
    set({ loading: true, error: null })
    const user = useAuthStore.getState().user
    try {
      const created = await EmailTemplateService.create({ ...t, userId: user!.id })
      set(state => ({ templates: [created, ...state.templates], loading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false })
    }
  },
  updateTemplate: async (id, updates) => {
    set({ loading: true, error: null })
    const user = useAuthStore.getState().user
    try {
      const updated = await EmailTemplateService.update(id, updates, user!.id, user?.role)
      set(state => ({ templates: state.templates.map(t => t.id === id ? updated : t), loading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false })
    }
  },
  deleteTemplate: async (id) => {
    set({ loading: true, error: null })
    const user = useAuthStore.getState().user
    try {
      await EmailTemplateService.delete(id, user?.role, user?.id)
      set(state => ({ templates: state.templates.filter(t => t.id !== id), loading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false })
    }
  }
}))
