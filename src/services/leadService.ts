import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Lead, LeadStatus } from '@/types/lead'

type DbLead = Database['public']['Tables']['leads']['Row']
type InsertLead = Database['public']['Tables']['leads']['Insert']
type UpdateLead = Database['public']['Tables']['leads']['Update']

export class LeadService {
  static async findAll(userId?: string): Promise<Lead[]> {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch leads: ${error.message}`)

    return data.map(this.transformFromDb)
  }

  static async findById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return this.transformFromDb(data)
  }

  static async findByEmail(email: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('contact_email', email)
      .single()

    if (error || !data) return null

    return this.transformFromDb(data)
  }

  static async findByIntern(internName: string, userId?: string): Promise<Lead[]> {
    let query = supabase
      .from('leads')
      .select('*')
      .eq('assigned_intern', internName)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch leads for intern: ${error.message}`)

    return data.map(this.transformFromDb)
  }

  static async create(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'followupsSent' | 'hasReplies' | 'assignedIntern'>, userId: string): Promise<Lead> {
    // Get the user's name to auto-assign
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    const insertData: InsertLead = {
      company_name: lead.companyName,
      website: lead.website,
      contact_person_name: lead.contactPersonName,
      contact_email: lead.contactEmail,
      linkedin_profile: lead.linkedinProfile,
      assigned_intern: userData.name, // Auto-assign current user
      status: lead.status,
      followups_sent: 0,
      has_replies: false,
      user_id: userId
    }

    const { data, error } = await supabase
      .from('leads')
      .insert(insertData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create lead: ${error.message}`)

    return this.transformFromDb(data)
  }

  static async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    const updateData: UpdateLead = {
      updated_at: new Date().toISOString()
    }

    if (updates.companyName) updateData.company_name = updates.companyName
    if (updates.website) updateData.website = updates.website
    if (updates.contactPersonName) updateData.contact_person_name = updates.contactPersonName
    if (updates.contactEmail) updateData.contact_email = updates.contactEmail
    if (updates.linkedinProfile !== undefined) updateData.linkedin_profile = updates.linkedinProfile
    if (updates.assignedIntern) updateData.assigned_intern = updates.assignedIntern
    if (updates.status) updateData.status = updates.status
    if (updates.followupsSent !== undefined) updateData.followups_sent = updates.followupsSent
    if (updates.hasReplies !== undefined) updateData.has_replies = updates.hasReplies

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update lead: ${error.message}`)

    return this.transformFromDb(data)
  }

  static async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return this.update(id, { status })
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete lead: ${error.message}`)
  }

  static async getStats(userId?: string) {
    let query = supabase.from('leads').select('status, has_replies')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch lead stats: ${error.message}`)

    const stats = {
      total: data.length,
      new: 0,
      emailSent: 0,
      followup1: 0,
      followup2: 0,
      replied: 0,
      booked: 0,
      converted: 0,
      hasReplies: 0
    }

    data.forEach(lead => {
      switch (lead.status) {
        case 'new': stats.new++; break
        case 'email-sent': stats.emailSent++; break
        case 'followup-1': stats.followup1++; break
        case 'followup-2': stats.followup2++; break
        case 'replied': stats.replied++; break
        case 'booked': stats.booked++; break
        case 'converted': stats.converted++; break
      }
      if (lead.has_replies) stats.hasReplies++
    })

    return stats
  }

  private static transformFromDb(dbLead: DbLead): Lead {
    return {
      id: dbLead.id,
      companyName: dbLead.company_name,
      website: dbLead.website,
      contactPersonName: dbLead.contact_person_name,
      contactEmail: dbLead.contact_email,
      linkedinProfile: dbLead.linkedin_profile || undefined,
      assignedIntern: dbLead.assigned_intern,
      status: dbLead.status,
      createdAt: new Date(dbLead.created_at),
      updatedAt: new Date(dbLead.updated_at),
      followupsSent: dbLead.followups_sent,
      hasReplies: dbLead.has_replies
    }
  }
}
