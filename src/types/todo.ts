export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string; // intern name or 'all'
  createdBy: string; // admin/manager name
  createdAt: Date;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface TodoTemplate {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  isDefault: boolean;
}
