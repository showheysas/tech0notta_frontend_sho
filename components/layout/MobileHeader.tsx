'use client';

import React from 'react';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

/**
 * ==========================================
 * モバイルヘッダー (MobileHeader)
 * ==========================================
 * 
 * 【概要】
 * スマートフォンやタブレットなどの狭い画面でのみ表示されるヘッダーコンポーネントです。
 * `lg:hidden` クラスにより、デスクトップ画面では自動的に非表示になります。
 * 
 * 【主な機能】
 * - サイドバーを開くためのハンバーガーメニューボタン
 * - アプリケーションロゴ/タイトルの表示
 * - 簡易的なユーザーアイコンの表示
 */
export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                {/* ハンバーガーメニューボタン */}
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="メニューを開く"
                >
                    <Menu size={24} />
                </button>
                <span className="text-lg font-bold text-slate-900 tracking-tight">Tech Notta</span>
            </div>

            {/* 右側のアクションが必要ならここに追加（例：ユーザーアイコンなど） */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                山田
            </div>
        </header>
    );
};
