import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { useAuthStore } from '@/store/authStore'

type DbTemplate = Database['public']['Tables']['email_templates']['Row']
type InsertTemplate = Database['public']['Tables']['email_templates']['Insert']

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  createdAt: Date
  updatedAt: Date
  userId: string
  isPublic: boolean
}

export class EmailTemplateService {
  static async findAll(userId?: string): Promise<EmailTemplate[]> {
    let query = supabase.from('email_templates').select('*').order('created_at', { ascending: false })
    if (userId) {
      // Return user's templates plus public templates
      query = query.or(`user_id.eq.${userId},is_public.eq.true`)
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch templates: ${error.message}`)
    return (data || []).map(this.transformFromDb)
  }

  static async findById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase.from('email_templates').select('*').eq('id', id).single()
    if (error || !data) return null
    return this.transformFromDb(data)
  }

  static async create(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const insert: InsertTemplate = {
      name: template.name,
      subject: template.subject,
      body: template.body,
      user_id: template.userId,
      is_public: template.isPublic
    }
    const { data, error } = await supabase.from('email_templates').insert(insert).select().single()
    if (error) throw new Error(`Failed to create template: ${error.message}`)
    return this.transformFromDb(data)
  }

  static async update(id: string, updates: Partial<EmailTemplate>, currentUserId: string, currentUserRole?: string): Promise<EmailTemplate> {
    // Only the owner or admin can update
    const existing = await this.findById(id)
    if (!existing) throw new Error('Template not found')
    if (existing.userId !== currentUserId && currentUserRole !== 'admin') {
      throw new Error('Not authorized to update this template')
    }

  const updateData: Partial<InsertTemplate & { updated_at: string }> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.subject !== undefined) updateData.subject = updates.subject
    if (updates.body !== undefined) updateData.body = updates.body
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from('email_templates').update(updateData).eq('id', id).select().single()
    if (error) throw new Error(`Failed to update template: ${error.message}`)
    return this.transformFromDb(data)
  }

  static async delete(id: string, currentUserRole?: string, currentUserId?: string): Promise<void> {
    // Only admin can delete
    if (currentUserRole !== 'admin') throw new Error('Only admins can delete templates')
    const { error } = await supabase.from('email_templates').delete().eq('id', id)
    if (error) throw new Error(`Failed to delete template: ${error.message}`)
  }

  private static transformFromDb(db: DbTemplate): EmailTemplate {
    return {
      id: db.id,
      name: db.name,
      subject: db.subject,
      body: db.body,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
      userId: db.user_id,
      isPublic: db.is_public
    }
  }
}
