import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, LayoutDashboard } from 'lucide-react';
import { useBoard } from './store';
import { TaskCard } from './components/TaskCard';
import { Column } from './components/Column';
import type { Task } from './types';


export default function App() {
  const { board, addTask, updateTask, deleteTask, moveTask, addColumn, deleteColumn, resetBoard } = useBoard();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (e: DragStartEvent) => {
    const task = board.tasks.find(t => t.id === e.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = board.tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Check if over a column
    const overColumn = board.columns.find(c => c.id === overId);
    if (overColumn && activeTask.columnId !== overColumn.id) {
      moveTask(activeId, overColumn.id, board.tasks.filter(t => t.columnId === overColumn.id).length);
      return;
    }

    // Check if over another task
    const overTask = board.tasks.find(t => t.id === overId);
    if (overTask && activeTask.columnId !== overTask.columnId) {
      moveTask(activeId, overTask.columnId, overTask.order);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const activeTask = board.tasks.find(t => t.id === active.id);
    const overTask = board.tasks.find(t => t.id === over.id);
    if (!activeTask || !overTask) return;
    if (activeTask.columnId !== overTask.columnId) return;

    const colTasks = board.tasks.filter(t => t.columnId === activeTask.columnId).sort((a, b) => a.order - b.order);
    const oldIdx = colTasks.findIndex(t => t.id === active.id);
    const newIdx = colTasks.findIndex(t => t.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(colTasks, oldIdx, newIdx);
    reordered.forEach((t, i) => {
      if (t.order !== i) updateTask(t.id, { order: i });
    });
  };

  const handleAddTask = (columnId: string) => {
    const title = newTaskInputs[columnId]?.trim();
    if (!title) return;
    addTask(columnId, title);
    setNewTaskInputs(prev => ({ ...prev, [columnId]: '' }));
  };

  const handleAddColumn = () => {
    const title = newColumnTitle.trim();
    if (!title) return;
    addColumn(title);
    setNewColumnTitle('');
    setShowAddColumn(false);
  };

  const totalTasks = board.tasks.length;
  const doneTasks = board.tasks.filter(t => t.columnId === 'col-4').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">TaskFlow</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Project Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
              <span>{totalTasks} tasks</span>
              <span>·</span>
              <span className="text-emerald-400">{progress}% done</span>
            </div>
            <button
              onClick={resetBoard}
              className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Board Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {board.columns.map(col => {
            const count = board.tasks.filter(t => t.columnId === col.id).length;
            return (
              <div key={col.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-white/60">{col.title}</span>
                <span className="text-white/30">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {board.columns.map(column => {
              const columnTasks = board.tasks
                .filter(t => t.columnId === column.id)
                .sort((a, b) => a.order - b.order);

              return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onDeleteColumn={deleteColumn}
                  newTaskInput={newTaskInputs[column.id] || ''}
                  onNewTaskChange={(val) => setNewTaskInputs(prev => ({ ...prev, [column.id]: val }))}
                  onAddTaskSubmit={() => handleAddTask(column.id)}
                  editingTask={editingTask}
                  setEditingTask={setEditingTask}
                />
              );
            })}

            {/* Add Column */}
            <div className="w-72 shrink-0">
              {showAddColumn ? (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <input
                    autoFocus
                    value={newColumnTitle}
                    onChange={e => setNewColumnTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                    placeholder="Column name..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                  />
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleAddColumn} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                      Add Column
                    </button>
                    <button onClick={() => setShowAddColumn(false)} className="px-3 py-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-white/10 text-white/30 hover:text-white/50 hover:border-white/20 transition-all text-sm"
                >
                  <Plus size={16} />
                  Add Column
                </button>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3">
              <TaskCard task={activeTask} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
