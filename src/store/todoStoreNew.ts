import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TodoTask, TodoTemplate } from '@/types/todo';
import { TodoService } from '@/services/todoService';

interface TodoStore {
  tasks: TodoTask[];
  templates: TodoTemplate[];
  isLoading: boolean;
  error: string | null;
  
  // Task management
  addTask: (task: Omit<TodoTask, 'id' | 'createdAt' | 'completed'>, userId: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<TodoTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string, completedBy?: string) => Promise<void>;
  
  // Template management
  addTemplate: (template: Omit<TodoTemplate, 'id'>, userId: string) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<TodoTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  
  // Get tasks for specific intern
  getTasksForIntern: (internName: string) => TodoTask[];
  
  // Get tasks created by specific manager/admin
  getTasksByCreator: (creatorName: string) => TodoTask[];

  // Fetch data
  fetchTasks: (userId?: string) => Promise<void>;
  fetchTemplates: (userId?: string) => Promise<void>;
  
  // Utils
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      templates: [],
      isLoading: false,
      error: null,

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      fetchTasks: async (userId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await TodoService.findAllTasks(userId);
          set({ tasks, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch tasks', isLoading: false });
        }
      },

      fetchTemplates: async (userId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const templates = await TodoService.findAllTemplates(userId);
          set({ templates, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch templates', isLoading: false });
        }
      },

      addTask: async (taskData, userId) => {
        set({ isLoading: true, error: null });
        try {
          const newTask = await TodoService.createTask(taskData, userId);
          set(state => ({ 
            tasks: [newTask, ...state.tasks],
            isLoading: false 
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add task', isLoading: false });
        }
      },

      updateTask: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTask = await TodoService.updateTask(id, updates);
          set(state => ({
            tasks: state.tasks.map(task =>
              task.id === id ? updatedTask : task
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update task', isLoading: false });
        }
      },

      deleteTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await TodoService.deleteTask(id);
          set(state => ({
            tasks: state.tasks.filter(task => task.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete task', isLoading: false });
        }
      },

      toggleTaskComplete: async (id, completedBy) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTask = await TodoService.toggleTaskComplete(id, completedBy);
          set(state => ({
            tasks: state.tasks.map(task =>
              task.id === id ? updatedTask : task
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to toggle task completion', isLoading: false });
        }
      },

      addTemplate: async (templateData, userId) => {
        set({ isLoading: true, error: null });
        try {
          const newTemplate = await TodoService.createTemplate(templateData, userId);
          set(state => ({ 
            templates: [newTemplate, ...state.templates],
            isLoading: false 
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add template', isLoading: false });
        }
      },

      updateTemplate: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTemplate = await TodoService.updateTemplate(id, updates);
          set(state => ({
            templates: state.templates.map(template =>
              template.id === id ? updatedTemplate : template
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update template', isLoading: false });
        }
      },

      deleteTemplate: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await TodoService.deleteTemplate(id);
          set(state => ({
            templates: state.templates.filter(template => template.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete template', isLoading: false });
        }
      },

      getTasksForIntern: (internName) => {
        const { tasks } = get();
        return tasks.filter(
          task => task.assignedTo === internName || task.assignedTo === 'all'
        );
      },

      getTasksByCreator: (creatorName) => {
        const { tasks } = get();
        return tasks.filter(task => task.createdBy === creatorName);
      }
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({ 
        tasks: state.tasks,
        templates: state.templates,
        // Don't persist loading states and errors
      }),
    }
  )
);
