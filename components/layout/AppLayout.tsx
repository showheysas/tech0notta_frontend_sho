'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { LiveProvider } from '@/context/LiveContext';

/**
 * ==========================================
 * アプリケーションレイアウト (AppLayout)
 * ==========================================
 * 
 * 【概要】
 * アプリケーション全体の基本構造を定義するラッパーコンポーネントです。
 * 全ページ共通のレイアウト要素（サイドバー、モバイル用ヘッダー、メインコンテンツエリア）を管理します。
 * 
 * 【主な機能】
 * - レスポンシブ対応: PCではサイドバー常時表示、モバイルではハンバーガーメニューで開閉
 * - LiveContextの提供: アプリ全体でライブ状態を共有するためのプロバイダーでラップ
 */
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <LiveProvider>
            <div className="flex bg-slate-50/50 min-h-screen">
                {/* 
                    === サイドバー ===
                    PC: 左側に固定表示 (lg:block)
                    Mobile: 通常は非表示、stateに応じてオーバーレイ表示
                */}
                {/* Sidebar (Desktop: Fixed, Mobile: Overlay) */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col min-h-screen lg:ml-64 min-w-0 transition-all duration-300">
                    {/* 
                        === モバイル用ヘッダー ===
                        PC画面(lg以上)では非表示になります。
                        ハンバーガーメニューボタンを提供し、サイドバーの開閉を制御します。
                    */}
                    {/* Mobile Header */}
                    <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

                    {/* 
                        === メインコンテンツエリア ===
                        各ページのコンテンツがここに挿入されます (children)。
                        サイドバーの幅分だけ左にマージンを取り(lg:ml-64)、
                        はみ出した分はスクロール可能にします。
                    */}
                    <main className="flex-1 flex flex-col relative overflow-x-hidden overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </LiveProvider>
    );
};
