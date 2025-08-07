import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type DailyTaskRow = Database['public']['Tables']['daily_tasks']['Row'];
type DailyTaskInsert = Database['public']['Tables']['daily_tasks']['Insert'];
type DailyTaskUpdate = Database['public']['Tables']['daily_tasks']['Update'];

export interface DailyTaskWithProgress extends DailyTaskRow {
  progress?: number;
}

// Predefined mandatory daily tasks template
export const MANDATORY_DAILY_TASKS_TEMPLATE = [
  {
    task_id: 'find-leads',
    title: 'Find 10–15 new leads',
    description: 'Research and identify potential prospects',
    target_count: 12,
    icon: 'search',
  },
  {
    task_id: 'submit-leads',
    title: 'Submit leads using the form',
    description: 'Add discovered leads to the system',
    target_count: 5,
    icon: 'plus',
  },
  {
    task_id: 'send-emails',
    title: 'Send cold emails to new leads',
    description: 'Reach out to new prospects with initial emails',
    target_count: 8,
    icon: 'mail',
  },
  {
    task_id: 'follow-up',
    title: 'Follow up on pending leads',
    description: 'Send follow-up emails to existing leads',
    target_count: 10,
    icon: 'repeat',
  },
  {
    task_id: 'update-statuses',
    title: 'Update statuses',
    description: 'Update lead statuses based on responses',
    target_count: 5,
    icon: 'edit',
  },
];

class DailyTaskService {
  /**
   * Get daily tasks for a specific user and date
   */
  async getDailyTasks(userId: string, date?: string): Promise<DailyTaskRow[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching daily tasks:', error);
      throw new Error(`Failed to fetch daily tasks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Initialize daily tasks for a user for today if they don't exist
   */
  async initializeDailyTasks(userId: string, date?: string): Promise<DailyTaskRow[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Check if tasks already exist for this date
    const existingTasks = await this.getDailyTasks(userId, targetDate);
    
    if (existingTasks.length > 0) {
      return existingTasks;
    }

    // Create new tasks from template
    const tasksToInsert: DailyTaskInsert[] = MANDATORY_DAILY_TASKS_TEMPLATE.map(template => ({
      task_id: template.task_id,
      title: template.title,
      description: template.description,
      target_count: template.target_count,
      current_count: 0,
      icon: template.icon,
      user_id: userId,
      date: targetDate,
      completed: false,
    }));

    const { data, error } = await supabase
      .from('daily_tasks')
      .insert(tasksToInsert)
      .select();

    if (error) {
      console.error('Error initializing daily tasks:', error);
      throw new Error(`Failed to initialize daily tasks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Toggle task completion status
   */
  async toggleTask(taskId: string, userId: string): Promise<DailyTaskRow | null> {
    // First get the current task to toggle its status
    const { data: currentTask, error: fetchError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentTask) {
      console.error('Error fetching task for toggle:', fetchError);
      throw new Error(`Failed to fetch task: ${fetchError?.message}`);
    }

    const { data, error } = await supabase
      .from('daily_tasks')
      .update({ 
        completed: !currentTask.completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling task:', error);
      throw new Error(`Failed to toggle task: ${error.message}`);
    }

    return data;
  }

  /**
   * Update task progress count
   */
  async updateTaskProgress(
    taskId: string, 
    currentCount: number, 
    userId: string
  ): Promise<DailyTaskRow | null> {
    // Get the task to check target count
    const { data: currentTask, error: fetchError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentTask) {
      console.error('Error fetching task for progress update:', fetchError);
      throw new Error(`Failed to fetch task: ${fetchError?.message}`);
    }

    // Auto-complete if target is reached
    const shouldComplete = currentTask.target_count && currentCount >= currentTask.target_count;

    const { data, error } = await supabase
      .from('daily_tasks')
      .update({ 
        current_count: currentCount,
        completed: shouldComplete || currentTask.completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task progress:', error);
      throw new Error(`Failed to update task progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Increment task progress by 1
   */
  async incrementTaskProgress(taskId: string, userId: string): Promise<DailyTaskRow | null> {
    // Get current count first
    const { data: currentTask, error: fetchError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentTask) {
      console.error('Error fetching task for increment:', fetchError);
      throw new Error(`Failed to fetch task: ${fetchError?.message}`);
    }

    const newCount = (currentTask.current_count || 0) + 1;
    return this.updateTaskProgress(taskId, newCount, userId);
  }

  /**
   * Get task progress summary for a user
   */
  async getTaskProgress(userId: string, date?: string): Promise<{ completed: number; total: number }> {
    const tasks = await this.getDailyTasks(userId, date);
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    
    return { completed, total };
  }

  /**
   * Reset or cleanup old daily tasks (optional cleanup function)
   */
  async cleanupOldTasks(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .lt('date', cutoffDateString);

    if (error) {
      console.error('Error cleaning up old tasks:', error);
      throw new Error(`Failed to cleanup old tasks: ${error.message}`);
    }
  }

  /**
   * Get tasks for a specific task_id across multiple dates (for analytics)
   */
  async getTaskHistory(
    userId: string, 
    taskId: string, 
    fromDate: string, 
    toDate: string
  ): Promise<DailyTaskRow[]> {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching task history:', error);
      throw new Error(`Failed to fetch task history: ${error.message}`);
    }

    return data || [];
  }
}

export const dailyTaskService = new DailyTaskService();
