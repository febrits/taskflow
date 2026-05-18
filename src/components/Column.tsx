import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import type { Column as ColumnType, Task } from '../types';
import { TaskCard } from './TaskCard';
import { cn } from '../lib/utils';

interface Props {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (columnId: string, title: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  newTaskInput: string;
  onNewTaskChange: (val: string) => void;
  onAddTaskSubmit: () => void;
  editingTask: string | null;
  setEditingTask: (id: string | null) => void;
}

export function Column({
  column,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onDeleteColumn,
  newTaskInput,
  onNewTaskChange,
  onAddTaskSubmit,
  editingTask,
  setEditingTask,
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className={cn(
      'w-72 shrink-0 bg-white/[0.02] rounded-2xl border border-white/[0.06] p-3 flex flex-col max-h-[calc(100vh-220px)]',
      isOver && 'border-indigo-500/30 bg-indigo-500/[0.03]'
    )}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-white/30 hover:text-white/60 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <MoreHorizontal size={14} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 bg-[#1a1a24] border border-white/10 rounded-xl p-1 shadow-xl min-w-[140px]">
                <button
                  onClick={() => { onDeleteColumn(column.id); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={12} />
                  Delete Column
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-2 min-h-[60px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              isEditing={editingTask === task.id}
              setEditing={setEditingTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Task */}
      <div className="mt-3 pt-3 border-t border-white/[0.04]">
        {newTaskInput !== '' ? (
          <div className="space-y-2">
            <input
              autoFocus
              value={newTaskInput}
              onChange={e => onNewTaskChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onAddTaskSubmit();
                if (e.key === 'Escape') onNewTaskChange('');
              }}
              placeholder="Task title..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
            />
            <div className="flex gap-2">
              <button
                onClick={onAddTaskSubmit}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => onNewTaskChange('')}
                className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onNewTaskChange(' ')}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <Plus size={14} />
            Add task
          </button>
        )}
      </div>
    </div>
  );
}
