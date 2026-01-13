import { useState } from 'react';
import { X, FileText, Link2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AREA_COLORS } from '@/types';
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

interface CreateNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNoteDialog({ open, onOpenChange }: CreateNoteDialogProps) {
  const { addNote, areas, tasks } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [areaId, setAreaId] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addNote({
      title: title.trim(),
      content: content.trim(),
      areaId: areaId || undefined,
      taskId: taskId || undefined,
    });

    // Reset form
    setTitle('');
    setContent('');
    setAreaId('');
    setTaskId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Nota</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="note-title">Título</Label>
            <Input
              id="note-title"
              placeholder="Título da nota..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Conteúdo</Label>
            <Textarea
              id="note-content"
              placeholder="Escreve a tua nota aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Área</Label>
              <Select value={areaId || "__none__"} onValueChange={(v) => setAreaId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhuma</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          area.color === 'work' && 'bg-area-work',
                          area.color === 'personal' && 'bg-area-personal',
                          area.color === 'health' && 'bg-area-health',
                          area.color === 'learning' && 'bg-area-learning',
                          area.color === 'finance' && 'bg-area-finance',
                        )} />
                        {area.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ligar a tarefa</Label>
              <Select value={taskId || "__none__"} onValueChange={(v) => setTaskId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhuma</SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      <span className="truncate">{task.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim()}>
              Criar Nota
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
