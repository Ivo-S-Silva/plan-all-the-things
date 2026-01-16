import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  Flag, 
  Folder, 
  Plus, 
  Check,
  Trash2,
  Timer
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TASK_STATE_CONFIG, TaskState, AREA_COLORS, Task } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
  { value: 240, label: '4 horas' },
];

export function TaskDetailDialog({ task: taskProp, open, onOpenChange }: TaskDetailDialogProps) {
  const { tasks, updateTask, areas, toggleSubtask, addSubtask, deleteSubtask, deleteTask } = useAppStore();
  const [newSubtask, setNewSubtask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Get live task data from store to ensure subtasks updates are reflected
  const task = taskProp ? tasks.find(t => t.id === taskProp.id) || taskProp : null;
  
  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState<TaskState>('backlog');
  const [areaId, setAreaId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [duration, setDuration] = useState<number | undefined>();

  // Update local state when task changes
  const initializeForm = () => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setState(task.state);
      setAreaId(task.areaId || '');
      setScheduledDate(task.scheduledDate);
      setScheduledTime(task.scheduledTime || '');
      setDueDate(task.dueDate);
      setDuration(task.duration);
    }
  };

  // Initialize form when dialog opens or task changes
  useEffect(() => {
    if (open && task) {
      initializeForm();
      setIsEditing(false);
    }
  }, [open, task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    if (!task) return;
    
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      state,
      areaId: areaId || undefined,
      scheduledDate,
      scheduledTime: scheduledTime || undefined,
      dueDate,
      duration,
    });
    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    if (task && newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleDelete = () => {
    if (task) {
      deleteTask(task.id);
      onOpenChange(false);
    }
  };

  if (!task) return null;

  const area = areas.find(a => a.id === task.areaId);
  const stateConfig = TASK_STATE_CONFIG[task.state];
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {isEditing ? 'Editar Tarefa' : 'Detalhes da Tarefa'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              ) : (
                <Button size="sm" onClick={handleSave}>
                  Guardar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title & Description */}
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold">{task.title}</h3>
              {task.description && (
                <p className="text-muted-foreground">{task.description}</p>
              )}
            </>
          )}

          {/* State & Area */}
          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <>
                <Select value={state} onValueChange={(v) => setState(v as TaskState)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={areaId || "__none__"} onValueChange={(v) => setAreaId(v === "__none__" ? "" : v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <span className={cn('state-badge', stateConfig.color)}>
                  {stateConfig.label}
                </span>
                {area && (
                  <span className={cn('area-badge border', AREA_COLORS[area.color])}>
                    {area.name}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Schedule, Time, Duration, Due Date */}
          <div className="grid grid-cols-2 gap-3">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Agendar
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-sm">
                        {scheduledDate ? format(scheduledDate, 'd MMM', { locale: pt }) : 'Selecionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Hora
                  </Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5" /> Duração
                  </Label>
                  <Select 
                    value={duration?.toString() || "__none__"} 
                    onValueChange={(v) => setDuration(v === "__none__" ? undefined : parseInt(v))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Sem duração</SelectItem>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5" /> Prazo
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-sm">
                        {dueDate ? format(dueDate, 'd MMM', { locale: pt }) : 'Selecionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            ) : (
              <>
                {task.scheduledDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(task.scheduledDate, "d 'de' MMMM", { locale: pt })}</span>
                  </div>
                )}
                {task.scheduledTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{task.scheduledTime}</span>
                  </div>
                )}
                {task.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>{task.duration >= 60 ? `${Math.floor(task.duration / 60)}h${task.duration % 60 > 0 ? ` ${task.duration % 60}min` : ''}` : `${task.duration}min`}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Flag className="h-4 w-4" />
                    <span>Prazo: {format(task.dueDate, "d MMM", { locale: pt })}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Subtasks */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Subtarefas ({completedSubtasks}/{task.subtasks.length})
              </Label>
            </div>
            
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {task.subtasks.map((subtask) => (
                  <motion.div
                    key={subtask.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 group"
                  >
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                    />
                    <span className={cn(
                      'flex-1 text-sm',
                      subtask.completed && 'text-muted-foreground line-through'
                    )}>
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => deleteSubtask(task.id, subtask.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Adicionar subtarefa..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  className="text-sm"
                />
                <Button size="icon" variant="ghost" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Delete */}
          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Tarefa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
