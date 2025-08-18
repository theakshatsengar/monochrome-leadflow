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
  followup3: 0,
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
        case 'followup-3': stats.followup3++; break
        case 'replied': stats.replied++; break
        case 'booked': stats.booked++; break
        case 'converted': stats.converted++; break
      }
      if (lead.has_replies) stats.hasReplies++
    })

    return stats
  }

  // Auto-advance follow-up workflow based on updated_at and followups_sent
  // Rules:
  // - Day 0: New -> email-sent (reminder - keep as 'new' until user sends email; here we only mark a reminder payload by returning items)
  // - +3 days from email-sent -> followup-1
  // - +4 days from followup-1 -> followup-2
  // - +7 days from followup-2 -> followup-3
  // Each automatic change will set updated_at to now and increment followups_sent
  static async autoAdvanceFollowups(userId?: string): Promise<{ advanced: string[] }> {
    // Fetch leads that are candidates for auto-advance
    let query = supabase.from('leads').select('*')
    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch leads for auto-advance: ${error.message}`)

    const now = new Date()
    const toAdvance: { id: string; newStatus: string }[] = []

    data.forEach((l) => {
      if (!l.updated_at) return
      if (l.has_replies) return // don't auto-advance if there's a reply
      const updatedAt = new Date(l.updated_at)
      const daysAgo = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))

      switch (l.status) {
        case 'email-sent':
          if (daysAgo >= 3) toAdvance.push({ id: l.id, newStatus: 'followup-1' })
          break
        case 'followup-1':
          if (daysAgo >= 4) toAdvance.push({ id: l.id, newStatus: 'followup-2' })
          break
        case 'followup-2':
          if (daysAgo >= 7) toAdvance.push({ id: l.id, newStatus: 'followup-3' })
          break
        default:
          break
      }
    })

    const advancedIds: string[] = []

    // Apply updates sequentially
    for (const item of toAdvance) {
      const update: UpdateLead = {
  status: item.newStatus as LeadStatus,
        updated_at: new Date().toISOString(),
        followups_sent: undefined
      }

      // Increment followups_sent by 1
      try {
        const { data: current } = await supabase.from('leads').select('followups_sent').eq('id', item.id).single()
        if (current) update.followups_sent = (current.followups_sent || 0) + 1

        const { error: upErr } = await supabase.from('leads').update(update).eq('id', item.id)
        if (!upErr) advancedIds.push(item.id)
      } catch (e) {
        console.error('Failed to auto-advance lead', item.id, e)
      }
    }

    return { advanced: advancedIds }
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
