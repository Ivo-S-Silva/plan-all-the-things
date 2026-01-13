import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Timer,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TASK_STATE_CONFIG, AREA_COLORS, Task } from '@/types';
import { CreateTaskDialog } from '@/components/dialogs/CreateTaskDialog';
import { TaskDetailDialog } from '@/components/dialogs/TaskDetailDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WEEKDAYS_DESKTOP = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

type ViewMode = 'month' | 'week';

export function CalendarView() {
  const { selectedDate, setSelectedDate, tasks, areas } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    return eachDayOfInterval({ 
      start: currentWeekStart, 
      end: addDays(currentWeekStart, 6) 
    });
  }, [currentWeekStart]);

  const selectedDayTasks = useMemo(() => {
    return tasks.filter(task => 
      task.scheduledDate && isSameDay(task.scheduledDate, selectedDate)
    ).sort((a, b) => {
      if (!a.scheduledTime && !b.scheduledTime) return 0;
      if (!a.scheduledTime) return 1;
      if (!b.scheduledTime) return -1;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [tasks, selectedDate]);

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => 
      task.scheduledDate && isSameDay(task.scheduledDate, day)
    );
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  
  const goToToday = () => {
    setCurrentMonth(new Date());
    setCurrentWeekStart(startOfWeek(new Date()));
    setSelectedDate(new Date());
  };

  const getArea = (areaId?: string) => areas.find(a => a.id === areaId);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground capitalize">
              {viewMode === 'month' 
                ? format(currentMonth, 'MMMM yyyy', { locale: pt })
                : `${format(currentWeekStart, "d MMM", { locale: pt })} - ${format(addDays(currentWeekStart, 6), "d MMM", { locale: pt })}`
              }
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
            </p>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="month" className="text-xs px-2">Mês</TabsTrigger>
                <TabsTrigger value="week" className="text-xs px-2">Semana</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex">
              Hoje
            </Button>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={viewMode === 'month' ? goToPreviousMonth : goToPreviousWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={viewMode === 'month' ? goToNextMonth : goToNextWeek}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Weekday headers */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1 md:hidden">
                {day}
              </div>
            ))}
            {WEEKDAYS_DESKTOP.map((day, i) => (
              <div key={i} className="hidden md:block text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        {viewMode === 'month' ? (
          // Month View
          <>
            <div className="grid grid-cols-7 gap-1 mb-6">
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.005 }}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'relative aspect-square p-0.5 md:p-1 rounded-lg md:rounded-xl transition-all duration-200 flex flex-col items-center justify-center',
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50',
                      isSelected && 'bg-primary text-primary-foreground',
                      !isSelected && isTodayDate && 'bg-primary/10 text-primary',
                      !isSelected && !isTodayDate && 'hover:bg-secondary'
                    )}
                  >
                    <span className={cn(
                      'text-xs md:text-sm font-medium',
                      isSelected && 'text-primary-foreground'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayTasks.slice(0, 3).map((task, i) => {
                          const area = getArea(task.areaId);
                          return (
                            <span
                              key={i}
                              className={cn(
                                'w-1 h-1 rounded-full',
                                isSelected ? 'bg-primary-foreground/70' : 
                                area?.color === 'work' ? 'bg-area-work' :
                                area?.color === 'personal' ? 'bg-area-personal' :
                                area?.color === 'health' ? 'bg-area-health' :
                                area?.color === 'learning' ? 'bg-area-learning' :
                                'bg-primary'
                              )}
                            />
                          );
                        })}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Day Tasks */}
            <SelectedDayTasks 
              tasks={selectedDayTasks}
              selectedDate={selectedDate}
              onCreateTask={() => setIsCreateTaskOpen(true)}
              onTaskClick={handleTaskClick}
              getArea={getArea}
            />
          </>
        ) : (
          // Week View
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-2"
                  >
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'w-full p-2 rounded-lg transition-all text-center',
                        isSelected && 'bg-primary text-primary-foreground',
                        !isSelected && isTodayDate && 'bg-primary/10 text-primary',
                        !isSelected && !isTodayDate && 'hover:bg-secondary'
                      )}
                    >
                      <p className="text-xs text-muted-foreground">{WEEKDAYS_FULL[index].slice(0, 3)}</p>
                      <p className={cn('text-lg font-semibold', isSelected && 'text-primary-foreground')}>
                        {format(day, 'd')}
                      </p>
                    </button>

                    <div className="space-y-1 min-h-[100px]">
                      {dayTasks.slice(0, 3).map((task) => {
                        const area = getArea(task.areaId);
                        return (
                          <button
                            key={task.id}
                            onClick={() => handleTaskClick(task)}
                            className={cn(
                              'w-full text-left p-1.5 rounded text-xs truncate transition-colors',
                              area?.color === 'work' && 'bg-area-work/15 text-area-work hover:bg-area-work/25',
                              area?.color === 'personal' && 'bg-area-personal/15 text-area-personal hover:bg-area-personal/25',
                              area?.color === 'health' && 'bg-area-health/15 text-area-health hover:bg-area-health/25',
                              area?.color === 'learning' && 'bg-area-learning/15 text-area-learning hover:bg-area-learning/25',
                              area?.color === 'finance' && 'bg-area-finance/15 text-area-finance hover:bg-area-finance/25',
                              !area && 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            )}
                          >
                            {task.scheduledTime && (
                              <span className="font-medium">{task.scheduledTime} </span>
                            )}
                            {task.title}
                          </button>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{dayTasks.length - 3} mais
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Day Tasks for Week View */}
            <SelectedDayTasks 
              tasks={selectedDayTasks}
              selectedDate={selectedDate}
              onCreateTask={() => setIsCreateTaskOpen(true)}
              onTaskClick={handleTaskClick}
              getArea={getArea}
            />
          </div>
        )}
      </div>

      <CreateTaskDialog 
        open={isCreateTaskOpen} 
        onOpenChange={setIsCreateTaskOpen}
        defaultDate={selectedDate}
      />
      
      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}

interface SelectedDayTasksProps {
  tasks: Task[];
  selectedDate: Date;
  onCreateTask: () => void;
  onTaskClick: (task: Task) => void;
  getArea: (areaId?: string) => { id: string; name: string; color: string } | undefined;
}

function SelectedDayTasks({ tasks, selectedDate, onCreateTask, onTaskClick, getArea }: SelectedDayTasksProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Tarefas para {format(selectedDate, "d 'de' MMMM", { locale: pt })}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-primary"
          onClick={onCreateTask}
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task, index) => {
              const area = getArea(task.areaId);
              const stateConfig = TASK_STATE_CONFIG[task.state];
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="task-card cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={cn('state-badge', stateConfig.color)}>
                          {stateConfig.label}
                        </span>
                        {area && (
                          <span className={cn('area-badge border', AREA_COLORS[area.color])}>
                            {area.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {task.scheduledTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.scheduledTime}
                        </div>
                      )}
                      {task.duration && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          {task.duration >= 60 ? `${Math.floor(task.duration / 60)}h` : `${task.duration}m`}
                        </div>
                      )}
                    </div>
                  </div>
                  {task.subtasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtarefas
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <p className="text-sm">Nenhuma tarefa agendada</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 gap-1"
              onClick={onCreateTask}
            >
              <Plus className="h-4 w-4" />
              Criar tarefa
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
