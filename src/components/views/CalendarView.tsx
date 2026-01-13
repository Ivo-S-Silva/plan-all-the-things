import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TASK_STATE_CONFIG, AREA_COLORS } from '@/types';
import { CreateTaskDialog } from '@/components/dialogs/CreateTaskDialog';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WEEKDAYS_DESKTOP = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarView() {
  const { selectedDate, setSelectedDate, tasks, areas } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const selectedDayTasks = useMemo(() => {
    return tasks.filter(task => 
      task.scheduledDate && isSameDay(task.scheduledDate, selectedDate)
    );
  }, [tasks, selectedDate]);

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => 
      task.scheduledDate && isSameDay(task.scheduledDate, day)
    );
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const getArea = (areaId?: string) => areas.find(a => a.id === areaId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: pt })}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
            </p>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex">
              Hoje
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Weekday headers */}
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
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Tarefas para {format(selectedDate, "d 'de' MMMM", { locale: pt })}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-primary"
              onClick={() => setIsCreateTaskOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {selectedDayTasks.length > 0 ? (
              <div className="space-y-2">
                {selectedDayTasks.map((task, index) => {
                  const area = getArea(task.areaId);
                  const stateConfig = TASK_STATE_CONFIG[task.state];
                  
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="task-card"
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
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                            <Clock className="h-3 w-3" />
                            {format(task.dueDate, 'HH:mm')}
                          </div>
                        )}
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
                  onClick={() => setIsCreateTaskOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Criar tarefa
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CreateTaskDialog 
        open={isCreateTaskOpen} 
        onOpenChange={setIsCreateTaskOpen}
        defaultDate={selectedDate}
      />
    </div>
  );
}
