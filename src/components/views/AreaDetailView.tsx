import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Folder, 
  Edit, 
  CheckSquare, 
  FileText,
  Pin,
  PinOff,
  Clock,
  AlertCircle,
  ChevronRight,
  Trash2,
  Save
} from 'lucide-react';
import { format, isPast, isToday, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AREA_COLORS, Area, Task, Note } from '@/types';
import { NoteDetailDialog } from '@/components/dialogs/NoteDetailDialog';
import { TaskDetailDialog } from '@/components/dialogs/TaskDetailDialog';

interface AreaDetailViewProps {
  area: Area;
  onBack: () => void;
}

const COLOR_OPTIONS: { value: Area['color']; label: string; class: string }[] = [
  { value: 'work', label: 'Trabalho', class: 'bg-area-work' },
  { value: 'personal', label: 'Pessoal', class: 'bg-area-personal' },
  { value: 'health', label: 'Saúde', class: 'bg-area-health' },
  { value: 'learning', label: 'Aprendizagem', class: 'bg-area-learning' },
  { value: 'finance', label: 'Finanças', class: 'bg-area-finance' },
];

export function AreaDetailView({ area, onBack }: AreaDetailViewProps) {
  const { tasks, notes, updateArea, deleteArea, setActiveView, toggleNotePin } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(area.name);
  const [description, setDescription] = useState(area.description || '');
  const [color, setColor] = useState<Area['color']>(area.color);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const areaTasks = tasks.filter(t => t.areaId === area.id);
  const areaNotes = notes.filter(n => n.areaId === area.id);
  const pinnedNotes = areaNotes.filter(n => n.isPinned);
  const completedTasks = areaTasks.filter(t => t.state === 'done').length;

  // Get urgent tasks (due soon, overdue, or in-progress)
  const urgentTasks = areaTasks
    .filter(t => {
      if (t.state === 'done' || t.state === 'archived') return false;
      if (t.state === 'in-progress') return true;
      if (t.dueDate) {
        return isPast(t.dueDate) || isToday(t.dueDate) || t.dueDate <= addDays(new Date(), 3);
      }
      return false;
    })
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    })
    .slice(0, 5);

  const handleSave = () => {
    updateArea(area.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteArea(area.id);
    onBack();
  };

  const progressPercent = areaTasks.length > 0 ? (completedTasks / areaTasks.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {isEditing ? (
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="text-xl font-semibold"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  AREA_COLORS[area.color]
                )}>
                  <Folder className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">{area.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {areaTasks.length} tarefas • {areaNotes.length} notas
                  </p>
                </div>
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Guardar
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
        </div>

        {/* Color picker when editing */}
        {isEditing && (
          <div className="space-y-2 mb-4">
            <Label>Cor</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setColor(opt.value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    opt.class,
                    color === opt.value && 'ring-2 ring-offset-2 ring-primary'
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {isEditing ? (
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adiciona uma descrição para esta área..."
              rows={2}
            />
          </div>
        ) : area.description ? (
          <p className="text-muted-foreground">{area.description}</p>
        ) : null}
      </header>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
        {/* Progress */}
        {areaTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="task-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-muted-foreground">
                {completedTasks}/{areaTasks.length} tarefas concluídas
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'h-full rounded-full',
                  area.color === 'work' && 'bg-area-work',
                  area.color === 'personal' && 'bg-area-personal',
                  area.color === 'health' && 'bg-area-health',
                  area.color === 'learning' && 'bg-area-learning',
                  area.color === 'finance' && 'bg-area-finance',
                )}
              />
            </div>
          </motion.div>
        )}

        {/* Urgent Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-state-waiting" />
              Tarefas Urgentes
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setActiveView('tasks')}
            >
              Ver todas
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {urgentTasks.length > 0 ? (
            <div className="space-y-2">
              {urgentTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="task-card cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {task.dueDate && (
                          <span className={cn(
                            'text-xs flex items-center gap-1',
                            isPast(task.dueDate) && !isToday(task.dueDate) && 'text-destructive',
                            isToday(task.dueDate) && 'text-state-waiting'
                          )}>
                            <Clock className="h-3 w-3" />
                            {isPast(task.dueDate) && !isToday(task.dueDate) 
                              ? 'Atrasada' 
                              : format(task.dueDate, "d MMM", { locale: pt })}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma tarefa urgente 🎉
            </p>
          )}
        </motion.div>

        {/* Pinned Notes */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Pin className="h-4 w-4 text-primary" />
              Notas Afixadas
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setActiveView('notes')}
            >
              Ver todas
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {pinnedNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pinnedNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="task-card cursor-pointer"
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNotePin(note.id);
                      }}
                    >
                      <PinOff className="h-3 w-3" />
                    </Button>
                  </div>
                  <h4 className="font-medium truncate">{note.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {note.content}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma nota afixada. Afixa notas importantes para acesso rápido.
            </p>
          )}
        </motion.div>

        {/* Delete Area */}
        {isEditing && (
          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Área
            </Button>
          </div>
        )}
      </div>

      <NoteDetailDialog 
        note={selectedNote} 
        open={!!selectedNote} 
        onOpenChange={(open) => !open && setSelectedNote(null)} 
      />
      <TaskDetailDialog 
        task={selectedTask} 
        open={!!selectedTask} 
        onOpenChange={(open) => !open && setSelectedTask(null)} 
      />
    </div>
  );
}
