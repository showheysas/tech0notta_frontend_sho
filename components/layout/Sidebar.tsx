'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Settings, HelpCircle, X, Search } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItemClass = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
      isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
    }`;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40 shadow-xl lg:shadow-sm
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tech Notta</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="mb-6 px-0 pt-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="検索..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <Link href="/" className={navItemClass('/')}>
            <Home size={20} /> ホーム
          </Link>
          <Link href="#" className={navItemClass('/history')}>
            <History size={20} /> 会議履歴
          </Link>
          <Link href="#" className={navItemClass('/settings')}>
            <Settings size={20} /> 設定
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link href="#" className={navItemClass('/help')}>
            <HelpCircle size={20} /> ヘルプセンター
          </Link>
          <div className="mt-4 flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              山田
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 leading-none">山田 太郎</span>
              <span className="text-xs text-slate-500 mt-1">管理者</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
