import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Board, Column, Task } from './types';

const DEFAULT_COLUMNS: Column[] = [
  { id: 'col-1', title: 'To Do', color: '#6366f1', order: 0 },
  { id: 'col-2', title: 'In Progress', color: '#f59e0b', order: 1 },
  { id: 'col-3', title: 'Review', color: '#8b5cf6', order: 2 },
  { id: 'col-4', title: 'Done', color: '#10b981', order: 3 },
];

const SAMPLE_TASKS: Task[] = [
  { id: uuidv4(), title: 'Design system setup', description: 'Create color palette, typography scale, and component library foundations', priority: 'high', dueDate: null, createdAt: new Date().toISOString(), columnId: 'col-1', order: 0 },
  { id: uuidv4(), title: 'API integration', description: 'Connect frontend to Supabase backend for real-time data sync', priority: 'high', dueDate: null, createdAt: new Date().toISOString(), columnId: 'col-2', order: 0 },
  { id: uuidv4(), title: 'User authentication', description: 'Implement login, signup, and password reset flows', priority: 'medium', dueDate: null, createdAt: new Date().toISOString(), columnId: 'col-1', order: 1 },
  { id: uuidv4(), title: 'Write documentation', description: 'Document all API endpoints and component props', priority: 'low', dueDate: null, createdAt: new Date().toISOString(), columnId: 'col-3', order: 0 },
  { id: uuidv4(), title: 'Landing page design', description: 'Create responsive landing page with hero, features, and CTA sections', priority: 'medium', dueDate: null, createdAt: new Date().toISOString(), columnId: 'col-4', order: 0 },
];

const STORAGE_KEY = 'taskflow-data';

function loadBoard(): Board {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    id: uuidv4(),
    title: 'My Board',
    columns: DEFAULT_COLUMNS,
    tasks: SAMPLE_TASKS,
    createdAt: new Date().toISOString(),
  };
}

function saveBoard(board: Board) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

export function useBoard() {
  const [board, setBoard] = useState<Board>(loadBoard);

  const update = useCallback((updater: (b: Board) => Board) => {
    setBoard(prev => {
      const next = updater(prev);
      saveBoard(next);
      return next;
    });
  }, []);

  const addTask = useCallback((columnId: string, title: string) => {
    update(b => {
      const colTasks = b.tasks.filter(t => t.columnId === columnId);
      const task: Task = {
        id: uuidv4(),
        title,
        description: '',
        priority: 'medium',
        dueDate: null,
        createdAt: new Date().toISOString(),
        columnId,
        order: colTasks.length,
      };
      return { ...b, tasks: [...b.tasks, task] };
    });
  }, [update]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    update(b => ({
      ...b,
      tasks: b.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
    }));
  }, [update]);

  const deleteTask = useCallback((taskId: string) => {
    update(b => ({ ...b, tasks: b.tasks.filter(t => t.id !== taskId) }));
  }, [update]);

  const moveTask = useCallback((taskId: string, toColumnId: string, toIndex: number) => {
    update(b => {
      const task = b.tasks.find(t => t.id === taskId);
      if (!task) return b;
      const updated = b.tasks.map(t => {
        if (t.id === taskId) return { ...t, columnId: toColumnId, order: toIndex };
        if (t.columnId === toColumnId && t.order >= toIndex) return { ...t, order: t.order + 1 };
        return t;
      });
      return { ...b, tasks: updated };
    });
  }, [update]);

  const addColumn = useCallback((title: string) => {
    update(b => {
      const col: Column = {
        id: uuidv4(),
        title,
        color: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'][b.columns.length % 6],
        order: b.columns.length,
      };
      return { ...b, columns: [...b.columns, col] };
    });
  }, [update]);

  const deleteColumn = useCallback((columnId: string) => {
    update(b => ({
      ...b,
      columns: b.columns.filter(c => c.id !== columnId),
      tasks: b.tasks.filter(t => t.columnId !== columnId),
    }));
  }, [update]);

  const resetBoard = useCallback(() => {
    const fresh: Board = {
      id: uuidv4(),
      title: 'My Board',
      columns: DEFAULT_COLUMNS,
      tasks: [],
      createdAt: new Date().toISOString(),
    };
    saveBoard(fresh);
    setBoard(fresh);
  }, []);

  return { board, addTask, updateTask, deleteTask, moveTask, addColumn, deleteColumn, resetBoard };
}
