import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, Link2, MoreHorizontal, Trash2, Edit, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AREA_COLORS, Note } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateNoteDialog } from '@/components/dialogs/CreateNoteDialog';
import { NoteDetailDialog } from '@/components/dialogs/NoteDetailDialog';

export function NotesView() {
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const { notes, areas, tasks, deleteNote, toggleNotePin } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = !selectedArea || note.areaId === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [notes, searchQuery, selectedArea]);

  // Sort pinned notes first
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [filteredNotes]);

  const getArea = (areaId?: string) => areas.find(a => a.id === areaId);
  const getTask = (taskId?: string) => tasks.find(t => t.id === taskId);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Notas</h1>
            <p className="text-sm text-muted-foreground">
              {notes.length} notas
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateNoteOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Nota</span>
          </Button>
        </div>

        <CreateNoteDialog open={isCreateNoteOpen} onOpenChange={setIsCreateNoteOpen} />

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Procurar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Area Filters */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          <Button
            variant={selectedArea === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedArea(null)}
            className="flex-shrink-0"
          >
            Todas
          </Button>
          {areas.map(area => (
            <Button
              key={area.id}
              variant={selectedArea === area.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedArea(area.id)}
              className="flex-shrink-0 gap-1.5"
            >
              <span className={cn(
                'w-2 h-2 rounded-full',
                area.color === 'work' && 'bg-area-work',
                area.color === 'personal' && 'bg-area-personal',
                area.color === 'health' && 'bg-area-health',
                area.color === 'learning' && 'bg-area-learning',
                area.color === 'finance' && 'bg-area-finance',
              )} />
              {area.name}
            </Button>
          ))}
        </div>
      </header>

      {/* Notes Grid */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <AnimatePresence mode="popLayout">
          {sortedNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedNotes.map((note, index) => {
                const area = getArea(note.areaId);
                const linkedTask = getTask(note.taskId);

                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "task-card group cursor-pointer",
                      note.isPinned && "ring-1 ring-primary/30"
                    )}
                    onClick={() => handleNoteClick(note)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {note.isPinned && (
                          <Pin className="h-3 w-3 text-primary" />
                        )}
                        {area && (
                          <span className={cn('area-badge border', AREA_COLORS[area.color])}>
                            {area.name}
                          </span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleNoteClick(note);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            toggleNotePin(note.id);
                          }}>
                            <Pin className="h-4 w-4 mr-2" />
                            {note.isPinned ? 'Desafixar' : 'Afixar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-medium text-foreground mb-1">
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {note.content}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {format(note.updatedAt, "d MMM", { locale: pt })}
                      </span>
                      {linkedTask && (
                        <span className="flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          {linkedTask.title}
                        </span>
                      )}
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
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma nota encontrada</p>
              <Button 
                variant="outline" 
                className="mt-4 gap-2"
                onClick={() => setIsCreateNoteOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Criar primeira nota
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NoteDetailDialog
        note={selectedNote}
        open={!!selectedNote}
        onOpenChange={(open) => !open && setSelectedNote(null)}
      />
    </div>
  );
}
