import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar, BottomNav } from './Sidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar />
      <Sidebar />

      <main className="pt-16 pb-20 md:pb-6 md:ml-16 lg:ml-[228px] transition-all duration-200">
        <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
