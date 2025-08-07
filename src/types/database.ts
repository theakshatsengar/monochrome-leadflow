export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'manager' | 'intern'
          avatar?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'admin' | 'manager' | 'intern'
          avatar?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'manager' | 'intern'
          avatar?: string
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          company_name: string
          website: string
          contact_person_name: string
          contact_email: string
          linkedin_profile?: string
          assigned_intern: string
          status: 'new' | 'email-sent' | 'followup-1' | 'followup-2' | 'replied' | 'booked' | 'converted'
          created_at: string
          updated_at: string
          followups_sent: number
          has_replies: boolean
          user_id: string
        }
        Insert: {
          id?: string
          company_name: string
          website: string
          contact_person_name: string
          contact_email: string
          linkedin_profile?: string
          assigned_intern: string
          status?: 'new' | 'email-sent' | 'followup-1' | 'followup-2' | 'replied' | 'booked' | 'converted'
          created_at?: string
          updated_at?: string
          followups_sent?: number
          has_replies?: boolean
          user_id: string
        }
        Update: {
          id?: string
          company_name?: string
          website?: string
          contact_person_name?: string
          contact_email?: string
          linkedin_profile?: string
          assigned_intern?: string
          status?: 'new' | 'email-sent' | 'followup-1' | 'followup-2' | 'replied' | 'booked' | 'converted'
          created_at?: string
          updated_at?: string
          followups_sent?: number
          has_replies?: boolean
          user_id?: string
        }
      }
      todo_tasks: {
        Row: {
          id: string
          title: string
          description?: string
          priority: 'low' | 'medium' | 'high'
          assigned_to: string
          created_by: string
          created_at: string
          due_date?: string
          completed: boolean
          completed_at?: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          priority: 'low' | 'medium' | 'high'
          assigned_to: string
          created_by: string
          created_at?: string
          due_date?: string
          completed?: boolean
          completed_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string
          created_by?: string
          created_at?: string
          due_date?: string
          completed?: boolean
          completed_at?: string
          user_id?: string
        }
      }
      todo_templates: {
        Row: {
          id: string
          title: string
          description?: string
          priority: 'low' | 'medium' | 'high'
          is_default: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          priority: 'low' | 'medium' | 'high'
          is_default?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          is_default?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'intern'
      lead_status: 'new' | 'email-sent' | 'followup-1' | 'followup-2' | 'replied' | 'booked' | 'converted'
      task_priority: 'low' | 'medium' | 'high'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
