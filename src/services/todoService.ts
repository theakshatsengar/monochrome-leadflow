import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { TodoTask, TodoTemplate } from '@/types/todo'

type DbTask = Database['public']['Tables']['todo_tasks']['Row']
type InsertTask = Database['public']['Tables']['todo_tasks']['Insert']
type UpdateTask = Database['public']['Tables']['todo_tasks']['Update']

type DbTemplate = Database['public']['Tables']['todo_templates']['Row']
type InsertTemplate = Database['public']['Tables']['todo_templates']['Insert']
type UpdateTemplate = Database['public']['Tables']['todo_templates']['Update']

export class TodoService {
  // Task methods
  static async findAllTasks(userId?: string): Promise<TodoTask[]> {
    let query = supabase
      .from('todo_tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch tasks: ${error.message}`)

    return data.map(this.transformTaskFromDb)
  }

  static async findTaskById(id: string): Promise<TodoTask | null> {
    const { data, error } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return this.transformTaskFromDb(data)
  }

  static async findTasksForIntern(internName: string, userId?: string): Promise<TodoTask[]> {
    let query = supabase
      .from('todo_tasks')
      .select('*')
      .or(`assigned_to.eq.${internName},assigned_to.eq.all`)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch tasks for intern: ${error.message}`)

    return data.map(this.transformTaskFromDb)
  }

  static async findTasksByCreator(creatorName: string, userId?: string): Promise<TodoTask[]> {
    let query = supabase
      .from('todo_tasks')
      .select('*')
      .eq('created_by', creatorName)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch tasks by creator: ${error.message}`)

    return data.map(this.transformTaskFromDb)
  }

  static async createTask(task: Omit<TodoTask, 'id' | 'createdAt' | 'completed'>, userId: string): Promise<TodoTask> {
    const insertData: InsertTask = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigned_to: task.assignedTo,
      created_by: task.createdBy,
      due_date: task.dueDate?.toISOString(),
      completed: false,
      user_id: userId
    }

    const { data, error } = await supabase
      .from('todo_tasks')
      .insert(insertData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create task: ${error.message}`)

    return this.transformTaskFromDb(data)
  }

  static async updateTask(id: string, updates: Partial<TodoTask>): Promise<TodoTask> {
    const updateData: UpdateTask = {}

    if (updates.title) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.priority) updateData.priority = updates.priority
    if (updates.assignedTo) updateData.assigned_to = updates.assignedTo
    if (updates.createdBy) updateData.created_by = updates.createdBy
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString()
    if (updates.completed !== undefined) updateData.completed = updates.completed
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString()

    const { data, error } = await supabase
      .from('todo_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update task: ${error.message}`)

    return this.transformTaskFromDb(data)
  }

  static async toggleTaskComplete(id: string, completedBy?: string): Promise<TodoTask> {
    const task = await this.findTaskById(id)
    if (!task) throw new Error('Task not found')

    const updates: Partial<TodoTask> = {
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : undefined
    }

    return this.updateTask(id, updates)
  }

  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('todo_tasks')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete task: ${error.message}`)
  }

  // Template methods
  static async findAllTemplates(userId?: string): Promise<TodoTemplate[]> {
    let query = supabase
      .from('todo_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`)

    return data.map(this.transformTemplateFromDb)
  }

  static async createTemplate(template: Omit<TodoTemplate, 'id'>, userId: string): Promise<TodoTemplate> {
    const insertData: InsertTemplate = {
      title: template.title,
      description: template.description,
      priority: template.priority,
      is_default: template.isDefault,
      user_id: userId
    }

    const { data, error } = await supabase
      .from('todo_templates')
      .insert(insertData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create template: ${error.message}`)

    return this.transformTemplateFromDb(data)
  }

  static async updateTemplate(id: string, updates: Partial<TodoTemplate>): Promise<TodoTemplate> {
    const updateData: UpdateTemplate = {
      updated_at: new Date().toISOString()
    }

    if (updates.title) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.priority) updateData.priority = updates.priority
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault

    const { data, error } = await supabase
      .from('todo_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update template: ${error.message}`)

    return this.transformTemplateFromDb(data)
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('todo_templates')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete template: ${error.message}`)
  }

  private static transformTaskFromDb(dbTask: DbTask): TodoTask {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || undefined,
      priority: dbTask.priority,
      assignedTo: dbTask.assigned_to,
      createdBy: dbTask.created_by,
      createdAt: new Date(dbTask.created_at),
      dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
      completed: dbTask.completed,
      completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined
    }
  }

  private static transformTemplateFromDb(dbTemplate: DbTemplate): TodoTemplate {
    return {
      id: dbTemplate.id,
      title: dbTemplate.title,
      description: dbTemplate.description || undefined,
      priority: dbTemplate.priority,
      isDefault: dbTemplate.is_default
    }
  }
}
