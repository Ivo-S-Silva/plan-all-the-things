import { motion } from 'framer-motion';
import { Calendar, CheckSquare, FileText, Folder, Plus } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AREA_COLORS } from '@/types';

const navItems = [
  { id: 'calendar' as const, icon: Calendar, label: 'Calendário' },
  { id: 'tasks' as const, icon: CheckSquare, label: 'Tarefas' },
  { id: 'notes' as const, icon: FileText, label: 'Notas' },
  { id: 'areas' as const, icon: Folder, label: 'Áreas' },
];

export function DesktopSidebar() {
  const { activeView, setActiveView, areas } = useAppStore();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border/50 p-4">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Produtividade</h1>
        <p className="text-sm text-muted-foreground">Organiza o teu dia</p>
      </div>

      <nav className="space-y-1 mb-8">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className="h-5 w-5 relative z-10" />
              <span className="font-medium relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Áreas
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {areas.map((area) => (
            <button
              key={area.id}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
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
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border/50">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Calendar className="h-4 w-4" />
          Ligar Google Calendar
        </Button>
      </div>
    </aside>
  );
}
