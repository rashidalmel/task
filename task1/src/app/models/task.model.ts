export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  selected?: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: 'High' | 'Medium' | 'Low';
  archived?: boolean;
} 