import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Folder, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  CheckSquare,
  FileText
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AREA_COLORS, Area } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AreaDetailView } from '@/components/views/AreaDetailView';

const COLOR_OPTIONS: { value: Area['color']; label: string; class: string }[] = [
  { value: 'work', label: 'Trabalho', class: 'bg-area-work' },
  { value: 'personal', label: 'Pessoal', class: 'bg-area-personal' },
  { value: 'health', label: 'Saúde', class: 'bg-area-health' },
  { value: 'learning', label: 'Aprendizagem', class: 'bg-area-learning' },
  { value: 'finance', label: 'Finanças', class: 'bg-area-finance' },
];

export function AreasView() {
  const { areas, tasks, notes, addArea, deleteArea } = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaColor, setNewAreaColor] = useState<Area['color']>('work');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const getAreaStats = (areaId: string) => {
    const areaTasks = tasks.filter(t => t.areaId === areaId);
    const areaNotes = notes.filter(n => n.areaId === areaId);
    const completedTasks = areaTasks.filter(t => t.state === 'done').length;
    
    return {
      totalTasks: areaTasks.length,
      completedTasks,
      totalNotes: areaNotes.length,
    };
  };

  const handleCreateArea = () => {
    if (newAreaName.trim()) {
      addArea({
        name: newAreaName.trim(),
        color: newAreaColor,
      });
      setNewAreaName('');
      setNewAreaColor('work');
      setIsDialogOpen(false);
    }
  };

  const handleAreaClick = (area: Area) => {
    setSelectedArea(area);
  };

  if (selectedArea) {
    return (
      <AreaDetailView 
        area={selectedArea} 
        onBack={() => setSelectedArea(null)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Áreas</h1>
            <p className="text-sm text-muted-foreground">
              {areas.length} áreas • Organiza os teus projetos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Área</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Área</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Projeto X"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setNewAreaColor(color.value)}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all',
                          color.class,
                          newAreaColor === color.value && 'ring-2 ring-offset-2 ring-primary'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateArea} className="w-full">
                  Criar Área
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Areas Grid */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <AnimatePresence mode="popLayout">
          {areas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((area, index) => {
                const stats = getAreaStats(area.id);
                const progressPercent = stats.totalTasks > 0 
                  ? (stats.completedTasks / stats.totalTasks) * 100 
                  : 0;

                return (
                  <motion.div
                    key={area.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'task-card border-l-4 cursor-pointer',
                      area.color === 'work' && 'border-l-area-work',
                      area.color === 'personal' && 'border-l-area-personal',
                      area.color === 'health' && 'border-l-area-health',
                      area.color === 'learning' && 'border-l-area-learning',
                      area.color === 'finance' && 'border-l-area-finance',
                    )}
                    onClick={() => handleAreaClick(area)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          AREA_COLORS[area.color]
                        )}>
                          <Folder className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {area.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {stats.totalTasks} tarefas • {stats.totalNotes} notas
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleAreaClick(area);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteArea(area.id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Progress Bar */}
                    {stats.totalTasks > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
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
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CheckSquare className="h-4 w-4" />
                        <span>{stats.completedTasks}/{stats.totalTasks}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{stats.totalNotes}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Folder className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma área criada</p>
              <Button variant="outline" className="gap-2" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Criar primeira área
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
