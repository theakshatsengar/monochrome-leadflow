import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TodoTask, TodoTemplate } from '@/types/todo';
import { INTERNS } from '@/types/lead';

interface TodoStore {
  tasks: TodoTask[];
  templates: TodoTemplate[];
  
  // Task management
  addTask: (task: Omit<TodoTask, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<TodoTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string, completedBy?: string) => void;
  
  // Template management
  addTemplate: (template: Omit<TodoTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<TodoTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // Get tasks for specific intern
  getTasksForIntern: (internName: string) => TodoTask[];
  
  // Get tasks created by specific manager/admin
  getTasksByCreator: (creatorName: string) => TodoTask[];
}

// Default templates
const DEFAULT_TEMPLATES: TodoTemplate[] = [
  {
    id: '1',
    title: 'Find 10–15 new leads',
    description: 'Research and identify potential prospects using LinkedIn, company directories, etc.',
    priority: 'high',
    isDefault: true
  },
  {
    id: '2',
    title: 'Submit leads using the form',
    description: 'Add new leads to the system with complete information',
    priority: 'high',
    isDefault: true
  },
  {
    id: '3',
    title: 'Send cold emails to new leads',
    description: 'Initial outreach to prospects using approved templates',
    priority: 'medium',
    isDefault: true
  },
  {
    id: '4',
    title: 'Follow up on pending leads',
    description: 'Check and respond to pending prospects',
    priority: 'medium',
    isDefault: true
  },
  {
    id: '5',
    title: 'Update lead statuses',
    description: 'Keep lead statuses current in the system',
    priority: 'low',
    isDefault: true
  }
];

// Generate some sample tasks
const generateSampleTasks = (): TodoTask[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [
    {
      id: '1',
      title: 'Complete LinkedIn outreach training',
      description: 'Watch the training video and complete the quiz',
      priority: 'high',
      assignedTo: 'all',
      createdBy: 'Manager User',
      createdAt: today,
      dueDate: tomorrow,
      completed: false
    },
    {
      id: '2',
      title: 'Review email templates',
      description: 'Familiarize yourself with the approved cold email templates',
      priority: 'medium',
      assignedTo: 'John Smith',
      createdBy: 'Admin User',
      createdAt: today,
      completed: false
    },
    {
      id: '3',
      title: 'Update CRM data',
      description: 'Clean up lead data and ensure all fields are complete',
      priority: 'low',
      assignedTo: 'Sarah Johnson',
      createdBy: 'Manager User',
      createdAt: today,
      completed: true,
      completedAt: today
    }
  ];
};

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      tasks: generateSampleTasks(),
      templates: DEFAULT_TEMPLATES,

      addTask: (taskData) => {
        const newTask: TodoTask = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date(),
          completed: false
        };
        set(state => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
          )
        }));
      },

      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },

      toggleTaskComplete: (id, completedBy) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date() : undefined
                }
              : task
          )
        }));
      },

      addTemplate: (templateData) => {
        const newTemplate: TodoTemplate = {
          ...templateData,
          id: Date.now().toString()
        };
        set(state => ({ templates: [...state.templates, newTemplate] }));
      },

      updateTemplate: (id, updates) => {
        set(state => ({
          templates: state.templates.map(template =>
            template.id === id ? { ...template, ...updates } : template
          )
        }));
      },

      deleteTemplate: (id) => {
        set(state => ({
          templates: state.templates.filter(template => template.id !== id)
        }));
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
      name: 'todo-storage'
    }
  )
);
