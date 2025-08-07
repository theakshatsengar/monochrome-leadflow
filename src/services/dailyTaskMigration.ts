/**
 * Migration script to move existing daily tasks from localStorage to database
 * Run this in the browser console or as part of the app initialization
 */

import { dailyTaskService } from '@/services/dailyTaskService';
import { supabase } from '@/lib/supabase';

interface LocalStorageDailyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  targetCount?: number;
  currentCount?: number;
  icon: string;
  userId?: string;
}

interface LocalStorageData {
  state: {
    tasks: LocalStorageDailyTask[];
    lastResetDate: string;
    currentUserId: string | null;
  };
}

export async function migrateDailyTasksFromLocalStorage(): Promise<void> {
  try {
    console.log('Starting daily tasks migration from localStorage to database...');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('No authenticated user found, skipping migration');
      return;
    }

    // Check if localStorage has daily tasks data
    const localStorageKey = 'daily-tasks-storage';
    const localData = localStorage.getItem(localStorageKey);
    
    if (!localData) {
      console.log('No localStorage data found for daily tasks');
      return;
    }

    let parsedData: LocalStorageData;
    try {
      parsedData = JSON.parse(localData);
    } catch (error) {
      console.error('Failed to parse localStorage data:', error);
      return;
    }

    const { tasks, lastResetDate } = parsedData.state;
    
    if (!tasks || tasks.length === 0) {
      console.log('No tasks found in localStorage');
      return;
    }

    // Filter tasks for current user
    const userTasks = tasks.filter(task => task.userId === user.id);
    
    if (userTasks.length === 0) {
      console.log('No tasks found for current user in localStorage');
      return;
    }

    console.log(`Found ${userTasks.length} tasks for user ${user.id} in localStorage`);

    // Check if we already have daily tasks in the database for today
    const today = new Date().toISOString().split('T')[0];
    const existingTasks = await dailyTaskService.getDailyTasks(user.id, today);
    
    if (existingTasks.length > 0) {
      console.log('Daily tasks already exist in database for today, skipping migration');
      return;
    }

    // Determine the date for migration
    let migrationDate = today;
    if (lastResetDate) {
      try {
        const resetDate = new Date(lastResetDate);
        if (!isNaN(resetDate.getTime())) {
          migrationDate = resetDate.toISOString().split('T')[0];
        }
      } catch (error) {
        console.warn('Failed to parse lastResetDate, using today:', error);
      }
    }

    // Prepare tasks for database insertion
    const tasksToInsert = userTasks.map(task => ({
      task_id: task.id, // Use the original id as task_id
      title: task.title,
      description: task.description,
      completed: task.completed,
      target_count: task.targetCount,
      current_count: task.currentCount || 0,
      icon: task.icon,
      user_id: user.id,
      date: migrationDate,
    }));

    // Insert tasks into database
    const { data, error } = await supabase
      .from('daily_tasks')
      .insert(tasksToInsert)
      .select();

    if (error) {
      console.error('Failed to migrate tasks to database:', error);
      return;
    }

    console.log(`Successfully migrated ${data?.length || 0} daily tasks to database`);

    // Create backup of localStorage data before clearing
    const backupKey = `${localStorageKey}-backup-${Date.now()}`;
    localStorage.setItem(backupKey, localData);
    console.log(`Created backup of localStorage data at key: ${backupKey}`);

    // Clear the localStorage data
    localStorage.removeItem(localStorageKey);
    console.log('Cleared localStorage daily tasks data');

    console.log('Daily tasks migration completed successfully!');

  } catch (error) {
    console.error('Failed to migrate daily tasks from localStorage:', error);
    throw error;
  }
}

/**
 * Cleanup old backup localStorage data (optional)
 */
export function cleanupOldBackups(daysToKeep: number = 7): void {
  const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('daily-tasks-storage-backup-')) {
      const timestamp = parseInt(key.split('-').pop() || '0');
      if (timestamp < cutoffTime) {
        keysToRemove.push(key);
      }
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Cleaned up old backup: ${key}`);
  });
}
