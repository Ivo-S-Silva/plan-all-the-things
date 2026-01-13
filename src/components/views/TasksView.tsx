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
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TASK_STATE_CONFIG, AREA_COLORS, TaskState } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateTaskDialog } from '@/components/dialogs/CreateTaskDialog';

const STATE_ORDER: TaskState[] = ['in-progress', 'ready', 'waiting', 'qa', 'developed', 'backlog', 'done', 'archived'];

export function TasksView() {
  const { tasks, areas, updateTaskState, deleteTask } = useAppStore();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [expandedStates, setExpandedStates] = useState<TaskState[]>(['in-progress', 'ready', 'waiting', 'backlog']);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = !selectedArea || task.areaId === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [tasks, searchQuery, selectedArea]);

  const tasksByState = useMemo(() => {
    const grouped: Record<TaskState, typeof tasks> = {
      'backlog': [],
      'in-progress': [],
      'waiting': [],
      'qa': [],
      'developed': [],
      'ready': [],
      'done': [],
      'archived': [],
    };
    
    filteredTasks.forEach(task => {
      grouped[task.state].push(task);
    });
    
    return grouped;
  }, [filteredTasks]);

  const toggleState = (state: TaskState) => {
    setExpandedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const getArea = (areaId?: string) => areas.find(a => a.id === areaId);

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

      {/* Task List by State */}
      <div className="flex-1 p-4 md:p-6 overflow-auto space-y-4">
        {STATE_ORDER.map(state => {
          const stateTasks = tasksByState[state];
          const isExpanded = expandedStates.includes(state);
          const stateConfig = TASK_STATE_CONFIG[state];

          if (stateTasks.length === 0 && !['in-progress', 'backlog'].includes(state)) {
            return null;
          }

          return (
            <div key={state} className="space-y-2">
              <button
                onClick={() => toggleState(state)}
                className="flex items-center gap-2 w-full text-left group"
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
                  {stateTasks.length}
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 pl-6"
                  >
                    {stateTasks.length > 0 ? (
                      stateTasks.map((task, index) => {
                        const area = getArea(task.areaId);
                        const completedSubtasks = task.subtasks.filter(s => s.completed).length;

                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="task-card group"
                          >
                            <div className="flex items-start gap-3">
                              <button 
                                onClick={() => updateTaskState(task.id, task.state === 'done' ? 'backlog' : 'done')}
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
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {STATE_ORDER.filter(s => s !== state).map(s => (
                                    <DropdownMenuItem 
                                      key={s}
                                      onClick={() => updateTaskState(task.id, s)}
                                    >
                                      Mover para {TASK_STATE_CONFIG[s].label}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuItem 
                                    onClick={() => deleteTask(task.id)}
                                    className="text-destructive"
                                  >
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground py-2"
                      >
                        Nenhuma tarefa
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
