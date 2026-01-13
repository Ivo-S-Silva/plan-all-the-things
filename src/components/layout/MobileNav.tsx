import { motion } from 'framer-motion';
import { Calendar, CheckSquare, FileText, Folder } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'calendar' as const, icon: Calendar, label: 'Calendário' },
  { id: 'tasks' as const, icon: CheckSquare, label: 'Tarefas' },
  { id: 'notes' as const, icon: FileText, label: 'Notas' },
  { id: 'areas' as const, icon: Folder, label: 'Áreas' },
];

export function MobileNav() {
  const { activeView, setActiveView } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 px-2 pb-safe md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                'nav-item relative flex-1 max-w-[80px]',
                isActive && 'nav-item-active'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className={cn(
                'h-5 w-5 relative z-10 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-[10px] relative z-10 transition-colors',
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
