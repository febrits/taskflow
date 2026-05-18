export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
  columnId: string;
  order: number;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  tasks: Task[];
  createdAt: string;
}
