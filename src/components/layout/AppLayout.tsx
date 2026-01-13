import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { DesktopSidebar } from './DesktopSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <DesktopSidebar />
      <main className="flex-1 pb-20 md:pb-0 overflow-auto">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
