import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Clock,
  Timer,
  GripVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TASK_STATE_CONFIG, AREA_COLORS, TaskState, Task } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateTaskDialog } from '@/components/dialogs/CreateTaskDialog';
import { TaskDetailDialog } from '@/components/dialogs/TaskDetailDialog';

import type { Area } from '@/types';

interface SortableTaskCardProps {
  task: Task;
  areas: Area[];
  onTaskClick: (task: Task) => void;
  onStateChange: (taskId: string, state: TaskState) => void;
  onDelete: (taskId: string) => void;
  stateOrder: TaskState[];
}

function SortableTaskCard({ task, areas, onTaskClick, onStateChange, onDelete, stateOrder }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const area = areas.find(a => a.id === task.areaId);
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'task-card group cursor-pointer',
        isDragging && 'opacity-50 ring-2 ring-primary'
      )}
      onClick={() => onTaskClick(task)}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onStateChange(task.id, task.state === 'done' ? 'backlog' : 'done');
          }}
          className="mt-0.5 flex-shrink-0"
        >
          {task.state === 'done' ? (
            <CheckCircle2 className="h-5 w-5 text-state-done" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-medium truncate',
            task.state === 'done' && 'text-muted-foreground line-through'
          )}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {area && (
              <span className={cn('area-badge border', AREA_COLORS[area.color])}>
                {area.name}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs text-muted-foreground">
                {format(task.dueDate, "d MMM", { locale: pt })}
              </span>
            )}
            {task.scheduledTime && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.scheduledTime}
              </span>
            )}
            {task.duration && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {task.duration >= 60 ? `${Math.floor(task.duration / 60)}h` : `${task.duration}m`}
              </span>
            )}
            {task.subtasks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {completedSubtasks}/{task.subtasks.length}
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {stateOrder.filter(s => s !== task.state).map(s => (
              <DropdownMenuItem 
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  onStateChange(task.id, s);
                }}
              >
                Mover para {TASK_STATE_CONFIG[s].label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-destructive"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface SortableStateColumnProps {
  state: TaskState;
  tasks: Task[];
  isExpanded: boolean;
  onToggle: () => void;
  areas: Area[];
  onTaskClick: (task: Task) => void;
  onStateChange: (taskId: string, state: TaskState) => void;
  onDelete: (taskId: string) => void;
  stateOrder: TaskState[];
}

function SortableStateColumn({
  state,
  tasks,
  isExpanded,
  onToggle,
  areas,
  onTaskClick,
  onStateChange,
  onDelete,
  stateOrder,
}: SortableStateColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `column-${state}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stateConfig = TASK_STATE_CONFIG[state];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('space-y-2', isDragging && 'opacity-50')}
    >
      <div className="flex items-center gap-2">
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 text-left group"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={cn('state-badge', stateConfig.color)}>
            {stateConfig.label}
          </span>
          <span className="text-sm text-muted-foreground">
            {tasks.length}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 pl-6"
          >
            <SortableContext
              items={tasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    areas={areas}
                    onTaskClick={onTaskClick}
                    onStateChange={onStateChange}
                    onDelete={onDelete}
                    stateOrder={stateOrder}
                  />
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground py-2"
                >
                  Nenhuma tarefa
                </motion.p>
              )}
            </SortableContext>
            
            {/* Drop zone indicator */}
            <div 
              className="h-2 border-2 border-dashed border-muted-foreground/20 rounded-md transition-colors"
              data-state={state}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TasksView() {
  const { 
    tasks, 
    areas, 
    updateTaskState, 
    deleteTask, 
    stateOrder, 
    setStateOrder,
    taskOrder,
    reorderTasksInState,
    moveTaskToState,
  } = useAppStore();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [expandedStates, setExpandedStates] = useState<TaskState[]>(['in-progress', 'ready', 'waiting', 'backlog']);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = !selectedArea || task.areaId === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [tasks, searchQuery, selectedArea]);

  // Get tasks by state, sorted by taskOrder
  const tasksByState = useMemo(() => {
    const grouped: Record<TaskState, Task[]> = {
      'backlog': [],
      'in-progress': [],
      'waiting': [],
      'qa': [],
      'developed': [],
      'ready': [],
      'done': [],
      'archived': [],
    };
    
    // Create a map for quick lookup
    const taskMap = new Map(filteredTasks.map(t => [t.id, t]));
    
    // For each state, order tasks by taskOrder, then add any not in order
    Object.keys(grouped).forEach((state) => {
      const stateKey = state as TaskState;
      const orderIds = taskOrder[stateKey] || [];
      const orderedTasks: Task[] = [];
      const addedIds = new Set<string>();
      
      // Add tasks in order
      orderIds.forEach(id => {
        const task = taskMap.get(id);
        if (task && task.state === stateKey) {
          orderedTasks.push(task);
          addedIds.add(id);
        }
      });
      
      // Add any tasks not in the order (newly created, etc.)
      filteredTasks.forEach(task => {
        if (task.state === stateKey && !addedIds.has(task.id)) {
          orderedTasks.push(task);
        }
      });
      
      grouped[stateKey] = orderedTasks;
    });
    
    return grouped;
  }, [filteredTasks, taskOrder]);

  const toggleState = (state: TaskState) => {
    setExpandedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (!id.startsWith('column-')) {
      setActiveTaskId(id);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // We'll handle all logic in dragEnd to avoid conflicts
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Handle column reordering
    if (activeId.startsWith('column-') && overId.startsWith('column-')) {
      const activeState = activeId.replace('column-', '') as TaskState;
      const overState = overId.replace('column-', '') as TaskState;
      
      if (activeState !== overState) {
        const oldIndex = stateOrder.indexOf(activeState);
        const newIndex = stateOrder.indexOf(overState);
        setStateOrder(arrayMove(stateOrder, oldIndex, newIndex));
      }
      return;
    }

    // Handle task reordering within same state or moving to different state
    if (!activeId.startsWith('column-')) {
      const activeTask = tasks.find(t => t.id === activeId);
      if (!activeTask) return;

      // Dropping on another task
      if (!overId.startsWith('column-')) {
        const overTask = tasks.find(t => t.id === overId);
        if (!overTask) return;

        if (activeTask.state === overTask.state) {
          // Reorder within same state
          const currentOrder = taskOrder[activeTask.state] || [];
          const oldIndex = currentOrder.indexOf(activeId);
          const newIndex = currentOrder.indexOf(overId);
          
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            reorderTasksInState(activeTask.state, arrayMove(currentOrder, oldIndex, newIndex));
          }
        } else {
          // Move to different state at specific position
          const targetOrder = taskOrder[overTask.state] || [];
          const newIndex = targetOrder.indexOf(overId);
          moveTaskToState(activeId, activeTask.state, overTask.state, newIndex);
        }
      } else {
        // Dropping on a state column
        const targetState = overId.replace('column-', '') as TaskState;
        if (activeTask.state !== targetState) {
          moveTaskToState(activeId, activeTask.state, targetState);
        }
      }
    }
  };

  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Tarefas</h1>
            <p className="text-sm text-muted-foreground">
              {tasks.length} tarefas • {tasks.filter(t => t.state === 'done').length} concluídas
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>
        </div>

        <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />

        {/* Search and Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Procurar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedArea(null)}>
                Todas as áreas
              </DropdownMenuItem>
              {areas.map(area => (
                <DropdownMenuItem key={area.id} onClick={() => setSelectedArea(area.id)}>
                  <span className={cn(
                    'w-2 h-2 rounded-full mr-2',
                    area.color === 'work' && 'bg-area-work',
                    area.color === 'personal' && 'bg-area-personal',
                    area.color === 'health' && 'bg-area-health',
                    area.color === 'learning' && 'bg-area-learning',
                    area.color === 'finance' && 'bg-area-finance',
                  )} />
                  {area.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Task List by State with DnD */}
      <div className="flex-1 p-4 md:p-6 overflow-auto space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stateOrder.map(s => `column-${s}`)}
            strategy={verticalListSortingStrategy}
          >
            {stateOrder.map(state => {
              const stateTasks = tasksByState[state];
              const isExpanded = expandedStates.includes(state);

              if (stateTasks.length === 0 && !['in-progress', 'backlog'].includes(state)) {
                return null;
              }

              return (
                <SortableStateColumn
                  key={state}
                  state={state}
                  tasks={stateTasks}
                  isExpanded={isExpanded}
                  onToggle={() => toggleState(state)}
                  areas={areas}
                  onTaskClick={handleTaskClick}
                  onStateChange={updateTaskState}
                  onDelete={deleteTask}
                  stateOrder={stateOrder}
                />
              );
            })}
          </SortableContext>

          <DragOverlay>
            {activeTask && (
              <div className="task-card opacity-90 shadow-lg ring-2 ring-primary">
                <div className="flex items-start gap-3">
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{activeTask.title}</h4>
                  </div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}
