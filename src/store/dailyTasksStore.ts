import { create } from 'zustand';
import { dailyTaskService } from '@/services/dailyTaskService';
import type { Database } from '@/types/database';

type DailyTaskRow = Database['public']['Tables']['daily_tasks']['Row'];

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  targetCount?: number;
  currentCount?: number;
  icon: string;
  userId?: string;
  taskId: string; // The predefined task ID
}

// Convert database row to store format
const convertFromDbTask = (dbTask: DailyTaskRow): DailyTask => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || '',
  completed: dbTask.completed,
  targetCount: dbTask.target_count || undefined,
  currentCount: dbTask.current_count || 0,
  icon: dbTask.icon,
  userId: dbTask.user_id,
  taskId: dbTask.task_id,
});

interface DailyTasksStore {
  tasks: DailyTask[];
  loading: boolean;
  error: string | null;
  currentUserId: string | null;
  initializeDailyTasks: (userId: string) => Promise<void>;
  toggleTask: (taskId: string, userId: string) => Promise<void>;
  updateTaskProgress: (taskId: string, currentCount: number, userId: string) => Promise<void>;
  incrementTaskProgress: (taskId: string, userId: string) => Promise<void>;
  resetTasksIfNewDay: (userId: string) => Promise<void>;
  getTaskProgress: (userId: string) => { completed: number; total: number };
  setCurrentUser: (userId: string) => void;
  refreshTasks: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useDailyTasksStore = create<DailyTasksStore>()((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  currentUserId: null,

  setCurrentUser: (userId: string) => {
    set({ currentUserId: userId });
  },

  clearError: () => {
    set({ error: null });
  },

  refreshTasks: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const dbTasks = await dailyTaskService.getDailyTasks(userId);
      const tasks = dbTasks.map(convertFromDbTask);
      set({ tasks, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh tasks';
      set({ error: errorMessage, loading: false });
      console.error('Error refreshing tasks:', error);
    }
  },

  initializeDailyTasks: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const dbTasks = await dailyTaskService.initializeDailyTasks(userId);
      const tasks = dbTasks.map(convertFromDbTask);
      set({ 
        tasks, 
        currentUserId: userId, 
        loading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize daily tasks';
      set({ error: errorMessage, loading: false });
      console.error('Error initializing daily tasks:', error);
    }
  },

  resetTasksIfNewDay: async (userId: string) => {
    // For database implementation, we just refresh the tasks
    // The service will handle creating new tasks if needed
    await get().refreshTasks(userId);
  },

  toggleTask: async (taskId: string, userId: string) => {
    try {
      set({ loading: true, error: null });
      
      // Find the task by id (database ID, not taskId)
      const task = get().tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const updatedDbTask = await dailyTaskService.toggleTask(taskId, userId);
      if (updatedDbTask) {
        const updatedTask = convertFromDbTask(updatedDbTask);
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId ? updatedTask : t
          ),
          loading: false
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle task';
      set({ error: errorMessage, loading: false });
      console.error('Error toggling task:', error);
    }
  },

  updateTaskProgress: async (taskId: string, currentCount: number, userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const updatedDbTask = await dailyTaskService.updateTaskProgress(taskId, currentCount, userId);
      if (updatedDbTask) {
        const updatedTask = convertFromDbTask(updatedDbTask);
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId ? updatedTask : t
          ),
          loading: false
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task progress';
      set({ error: errorMessage, loading: false });
      console.error('Error updating task progress:', error);
    }
  },

  incrementTaskProgress: async (taskId: string, userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const updatedDbTask = await dailyTaskService.incrementTaskProgress(taskId, userId);
      if (updatedDbTask) {
        const updatedTask = convertFromDbTask(updatedDbTask);
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId ? updatedTask : t
          ),
          loading: false
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to increment task progress';
      set({ error: errorMessage, loading: false });
      console.error('Error incrementing task progress:', error);
    }
  },

  getTaskProgress: (userId: string) => {
    const { tasks } = get();
    const userTasks = tasks.filter(task => task.userId === userId);
    const completed = userTasks.filter(task => task.completed).length;
    const total = userTasks.length;
    return { completed, total };
  },
}));
