import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Calendar } from 'lucide-react';
import type { Task } from '../types';
import { cn, priorityColor } from '../lib/utils';

interface Props {
  task: Task;
  isDragging?: boolean;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  isEditing?: boolean;
  setEditing?: (id: string | null) => void;
}

export function TaskCard({ task, isDragging, onUpdate, onDelete, isEditing, setEditing }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl shadow-indigo-500/10 min-h-[80px]">
        <p className="font-medium text-sm">{task.title}</p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white/[0.03] hover:bg-white/[0.06] rounded-xl p-3.5 border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-default',
        isSortDragging && 'opacity-50 shadow-lg shadow-indigo-500/10 border-indigo-500/30'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              defaultValue={task.title}
              onBlur={e => {
                if (onUpdate && e.target.value.trim() !== task.title) {
                  onUpdate(task.id, { title: e.target.value.trim() });
                }
                setEditing?.(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') setEditing?.(null);
              }}
              className="w-full bg-white/5 border border-indigo-500/30 rounded px-2 py-1 text-sm focus:outline-none"
            />
          ) : (
            <p
              className="font-medium text-sm leading-snug cursor-pointer"
              onDoubleClick={() => setEditing?.(task.id)}
            >
              {task.title}
            </p>
          )}
          {task.description && (
            <p className="text-xs text-white/30 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2.5">
            <span className={cn('text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded', priorityColor(task.priority))}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="text-[10px] text-white/30 flex items-center gap-1">
                <Calendar size={10} />
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all shrink-0 mt-0.5"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
