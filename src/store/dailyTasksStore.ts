import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  targetCount?: number;
  currentCount?: number;
  icon: string;
  userId?: string; // Add userId to track ownership
}

interface DailyTasksStore {
  tasks: DailyTask[];
  lastResetDate: string;
  currentUserId: string | null;
  initializeDailyTasks: (userId: string) => void;
  toggleTask: (taskId: string, userId: string) => void;
  updateTaskProgress: (taskId: string, currentCount: number, userId: string) => void;
  incrementTaskProgress: (taskId: string, userId: string) => void;
  resetTasksIfNewDay: (userId: string) => void;
  getTaskProgress: (userId: string) => { completed: number; total: number };
  setCurrentUser: (userId: string) => void;
}

const MANDATORY_DAILY_TASKS: Omit<DailyTask, 'completed' | 'currentCount'>[] = [
  {
    id: 'find-leads',
    title: 'Find 10–15 new leads',
    description: 'Research and identify potential prospects',
    targetCount: 12,
    icon: 'search',
  },
  {
    id: 'submit-leads',
    title: 'Submit leads using the form',
    description: 'Add discovered leads to the system',
    targetCount: 5,
    icon: 'plus',
  },
  {
    id: 'send-emails',
    title: 'Send cold emails to new leads',
    description: 'Reach out to new prospects with initial emails',
    targetCount: 8,
    icon: 'mail',
  },
  {
    id: 'follow-up',
    title: 'Follow up on pending leads',
    description: 'Send follow-up emails to existing leads',
    targetCount: 10,
    icon: 'repeat',
  },
  {
    id: 'update-statuses',
    title: 'Update statuses',
    description: 'Update lead statuses based on responses',
    targetCount: 5,
    icon: 'edit',
  },
];

export const useDailyTasksStore = create<DailyTasksStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      lastResetDate: '',
      currentUserId: null,

      setCurrentUser: (userId: string) => {
        set({ currentUserId: userId });
      },

      initializeDailyTasks: (userId: string) => {
        const today = new Date().toDateString();
        const { lastResetDate, tasks } = get();
        
        // Check if we need to reset for this user
        const userTasks = tasks.filter(task => task.userId === userId);
        
        if (lastResetDate !== today || userTasks.length === 0) {
          // Reset tasks for new day or initialize for new user
          const initialTasks: DailyTask[] = MANDATORY_DAILY_TASKS.map(task => ({
            ...task,
            completed: false,
            currentCount: 0,
            userId: userId,
          }));
          
          // Remove old tasks for this user and add new ones
          const otherUserTasks = tasks.filter(task => task.userId !== userId);
          
          set({
            tasks: [...otherUserTasks, ...initialTasks],
            lastResetDate: today,
            currentUserId: userId,
          });
        }
      },

      resetTasksIfNewDay: (userId: string) => {
        const today = new Date().toDateString();
        const { lastResetDate } = get();
        
        if (lastResetDate !== today) {
          get().initializeDailyTasks(userId);
        }
      },

      toggleTask: (taskId: string, userId: string) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId && task.userId === userId
              ? { ...task, completed: !task.completed }
              : task
          ),
        }));
      },

      updateTaskProgress: (taskId: string, currentCount: number, userId: string) => {
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id === taskId && task.userId === userId) {
              const updated = { ...task, currentCount };
              // Auto-complete if target is reached
              if (task.targetCount && currentCount >= task.targetCount) {
                updated.completed = true;
              }
              return updated;
            }
            return task;
          }),
        }));
      },

      incrementTaskProgress: (taskId: string, userId: string) => {
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id === taskId && task.userId === userId) {
              const newCount = (task.currentCount || 0) + 1;
              const updated = { ...task, currentCount: newCount };
              // Auto-complete if target is reached
              if (task.targetCount && newCount >= task.targetCount) {
                updated.completed = true;
              }
              return updated;
            }
            return task;
          }),
        }));
      },

      getTaskProgress: (userId: string) => {
        const { tasks } = get();
        const userTasks = tasks.filter(task => task.userId === userId);
        const completed = userTasks.filter(task => task.completed).length;
        const total = userTasks.length;
        return { completed, total };
      },
    }),
    {
      name: 'daily-tasks-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        lastResetDate: state.lastResetDate,
        currentUserId: state.currentUserId,
      }),
    }
  )
);
