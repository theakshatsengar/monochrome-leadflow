import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { User } from '@/types/auth'

type DbUser = Database['public']['Tables']['users']['Row']
type InsertUser = Database['public']['Tables']['users']['Insert']
type UpdateUser = Database['public']['Tables']['users']['Update']

export class UserService {
  static async findByEmailOrName(identifier: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${identifier},name.eq.${identifier}`)
      .single()

    if (error || !data) return null

    return this.transformFromDb(data)
  }

  static async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return this.transformFromDb(data)
  }

  static async create(user: Omit<User, 'id'>): Promise<User> {
    const insertData: InsertUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }

    const { data, error } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create user: ${error.message}`)

    return this.transformFromDb(data)
  }

  static async update(id: string, updates: Partial<User>): Promise<User> {
    const updateData: UpdateUser = {}
    
    if (updates.name) updateData.name = updates.name
    if (updates.email) updateData.email = updates.email
    if (updates.role) updateData.role = updates.role
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar
    
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update user: ${error.message}`)

    return this.transformFromDb(data)
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete user: ${error.message}`)
  }

  static async list(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch users: ${error.message}`)

    return data.map(this.transformFromDb)
  }

  private static transformFromDb(dbUser: DbUser): User {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatar: dbUser.avatar || undefined
    }
  }
}
