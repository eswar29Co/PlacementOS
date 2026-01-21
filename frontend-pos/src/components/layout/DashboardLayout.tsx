import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  return (
    <div className="bg-slate-50/50 text-slate-900 transition-all duration-500">
      <AppSidebar />
      <div className={cn(
        "transition-all duration-500 ease-in-out min-h-screen flex flex-col relative",
        sidebarCollapsed ? "pl-24" : "pl-72"
      )}>
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 lg:p-10 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
