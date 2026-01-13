import { useState, useEffect } from 'react';
import { Edit, Pin, PinOff, Trash2, Link2, Folder, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AREA_COLORS, Note } from '@/types';
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

interface NoteDetailDialogProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteDetailDialog({ note, open, onOpenChange }: NoteDetailDialogProps) {
  const { updateNote, deleteNote, toggleNotePin, areas, tasks } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [areaId, setAreaId] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');

  useEffect(() => {
    if (note && open) {
      setTitle(note.title);
      setContent(note.content);
      setAreaId(note.areaId || '');
      setTaskId(note.taskId || '');
      setIsEditing(false);
    }
  }, [note, open]);

  const handleSave = () => {
    if (!note) return;
    
    updateNote(note.id, {
      title: title.trim(),
      content: content.trim(),
      areaId: areaId || undefined,
      taskId: taskId || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (note) {
      deleteNote(note.id);
      onOpenChange(false);
    }
  };

  const handleTogglePin = () => {
    if (note) {
      toggleNotePin(note.id);
    }
  };

  if (!note) return null;

  const area = areas.find(a => a.id === note.areaId);
  const linkedTask = tasks.find(t => t.id === note.taskId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {isEditing ? 'Editar Nota' : 'Nota'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTogglePin}
                className={cn(note.isPinned && 'text-primary')}
              >
                {note.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </Button>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Guardar
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <Textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Área</Label>
                  <Select value={areaId || "__none__"} onValueChange={(v) => setAreaId(v === "__none__" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhuma</SelectItem>
                      {areas.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tarefa relacionada</Label>
                  <Select value={taskId || "__none__"} onValueChange={(v) => setTaskId(v === "__none__" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tarefa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhuma</SelectItem>
                      {tasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                {area && (
                  <span className={cn('area-badge border', AREA_COLORS[area.color])}>
                    <Folder className="h-3 w-3" />
                    {area.name}
                  </span>
                )}
                {linkedTask && (
                  <span className="area-badge bg-secondary/50 text-secondary-foreground">
                    <Link2 className="h-3 w-3" />
                    {linkedTask.title}
                  </span>
                )}
                {note.isPinned && (
                  <span className="area-badge bg-primary/10 text-primary">
                    <Pin className="h-3 w-3" />
                    Afixada
                  </span>
                )}
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-2">{note.title}</h2>
                <div className="whitespace-pre-wrap text-foreground">{note.content}</div>
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                <p>Criada: {format(note.createdAt, "d 'de' MMMM 'às' HH:mm", { locale: pt })}</p>
                <p>Atualizada: {format(note.updatedAt, "d 'de' MMMM 'às' HH:mm", { locale: pt })}</p>
              </div>
            </>
          )}

          {/* Delete */}
          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Nota
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
