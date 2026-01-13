import { AppLayout } from '@/components/layout/AppLayout';
import { CalendarView } from '@/components/views/CalendarView';
import { TasksView } from '@/components/views/TasksView';
import { NotesView } from '@/components/views/NotesView';
import { AreasView } from '@/components/views/AreasView';
import { useAppStore } from '@/stores/appStore';

const Index = () => {
  const { activeView } = useAppStore();

  const renderView = () => {
    switch (activeView) {
      case 'calendar':
        return <CalendarView />;
      case 'tasks':
        return <TasksView />;
      case 'notes':
        return <NotesView />;
      case 'areas':
        return <AreasView />;
      default:
        return <CalendarView />;
    }
  };

  return (
    <AppLayout>
      {renderView()}
    </AppLayout>
  );
};

export default Index;
