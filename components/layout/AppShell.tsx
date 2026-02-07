'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50/50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 min-w-0 transition-all duration-300">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 flex flex-col relative overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
