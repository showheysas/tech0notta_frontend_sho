'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLiveContext } from '@/context/LiveContext';

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * lucide-reactからアイコンをインポート
 *  
 * Home: ホーム
 * History: 履歴
 * HelpCircle: ヘルプ
 * Settings: 設定
 * Activity: ライブ活動状態
 */
import { Home, History, HelpCircle, Settings, Activity, X, Search } from 'lucide-react';

/**
 * ==========================================
 * サイドバー (Sidebar)
 * ==========================================
 * 
 * 【概要】
 * アプリケーションの左側に常時表示されるメインナビゲーションメニューです。
 * デスクトップでは左側に固定、モバイルではドロワー（引き出し）として動作します。
 * 
 * 【主な機能】
 * - ページ間のナビゲーション（ホーム、履歴など）
 * - ライブモード時の状態表示
 * - 検索機能
 */
interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    // 現在のブラウザのパス（URLのパス部分）を取得します
    const pathname = usePathname();
    const { isLive } = useLiveContext();

    // バックエンドのアクティブセッション（Bot自動入室時にも検出可能）
    const [hasActiveSession, setHasActiveSession] = useState(false);

    // バックエンドのセッション状態をポーリング
    useEffect(() => {
        const checkActiveSession = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/bot/sessions`);
                if (response.ok) {
                    const sessions = await response.json();
                    setHasActiveSession(sessions.length > 0);
                }
            } catch (e) {
                console.error('Failed to fetch sessions', e);
            }
        };

        // 初期実行とポーリング
        checkActiveSession();
        const interval = setInterval(checkActiveSession, 5000);
        return () => clearInterval(interval);
    }, []);

    // パスに基づいて特定のモードであるかを判定します
    // (例：ライブ画面では特定のメニューを目立たせるなど)

    // '/live' ページにいる場合はライブモード
    const isLivePage = pathname === '/live';

    // ライブ状態の判定：フロントエンドのisLive または バックエンドのアクティブセッションがある場合
    const showLiveMonitoring = isLive || hasActiveSession;

    /**
     * ナビゲーション項目のためのCSSクラスを生成するヘルパー関数
     * 
     * @param href リンク先のパス
     * @returns 現在のページと一致する場合はアクティブなスタイル、そうでない場合は通常スタイルを返します
     */
    const navItemClass = (href: string) => {
        // 現在のパスがこのリンクと一致するかチェック（完全一致）
        const isActive = pathname === href;

        // baseStyles: 共通のスタイル（配置、パディング、角丸、トランジションなど）
        // isActive ? ... : ... : アクティブ状態に応じた色分け
        // - アクティブ時: 背景色を薄いアクセントカラー(bg-action-50)、テキストを濃い色(text-action-600)に
        // - 非アクティブ時: 通常の文字色、ホバー時に薄い背景色を表示
        return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${isActive
            ? 'bg-action-50 text-action-600'
            : 'text-slate-600 hover:bg-slate-100'
            }`;
    };

    return (
        <>
            {/* モバイル用オーバーレイ */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in-overlay"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* サイドバーのコンテナ */}
            {/* fixed: 画面に固定, left-0 top-0: 左上に配置, h-full: 全画面の高さ */}
            {/* w-64: 幅256px, border-r: 右側に境界線, z-40: オーバーレイより手前 */}
            {/* lg:translate-x-0: デスクトップでは常時表示 */}
            <aside className={`
                fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40 shadow-xl lg:shadow-sm
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>

                {/* 
                    === ロゴヘッダーエリア ===
                    アプリ名を表示し、モバイル時には「閉じる」ボタンもここに配置されます
                */}
                {/* --- ロゴエリア --- */}
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tech Notta</h1>

                        {/* ライブモード時にのみ表示されるインジケーター */}
                        {isLive && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ライブモード</span>
                            </div>
                        )}
                    </div>

                    {/* モバイル用閉じるボタン */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 
                    === メインナビゲーション ===
                    主要なページへのリンクを配置するスクロール可能エリア
                */}
                {/* --- メインナビゲーション --- */}
                {/* flex-1: 残りの高さを埋める */}
                <nav className="flex-1 px-4 space-y-1">

                    {/* 検索バー */}
                    <div className="mb-6 px-0 pt-2">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-action-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="検索..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-action-500/20 focus:border-action-500 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* --- コンテキストに応じた特別メニュー --- */}

                    {/* ライブページ専用の表示（またはライブ中なら表示して戻れるようにする） */}
                    {/* Bot自動入室時にも表示されるよう、バックエンドセッションもチェック */}
                    {showLiveMonitoring && (
                        <Link
                            href="/live"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-4 animate-pulse transition-colors ${isLivePage
                                ? 'bg-red-50 text-red-600'
                                : 'bg-red-50/50 text-red-500 hover:bg-red-50'
                                }`}
                        >
                            <Activity size={18} />
                            ライブモニタリング
                        </Link>
                    )}

                    {/* --- 標準メニュー --- */}

                    {/* ホーム */}
                    <Link href="/" className={navItemClass('/')}>
                        <Home size={20} />
                        ホーム
                    </Link>

                    {/* 会議履歴 */}
                    <Link href="/history" className={navItemClass('/history')}>
                        <History size={20} />
                        会議履歴
                    </Link>

                    {/* 設定（モックリンク） */}
                    <Link href="#" className={navItemClass('/settings')}>
                        <Settings size={20} />
                        設定
                    </Link>
                </nav>

                {/* 
                    === フッターエリア ===
                    ヘルプリンクやログインユーザーのアカウント情報を固定表示します
                */}
                {/* --- 下部アクション（ヘルプ・ユーザー情報） --- */}
                <div className="p-4 border-t border-slate-100">
                    <Link href="#" className={navItemClass('/help')}>
                        <HelpCircle size={20} />
                        ヘルプセンター
                    </Link>

                    {/* ユーザープロファイル情報（固定表示のサンプル） */}
                    <div className="mt-4 flex items-center gap-3 px-3 py-2">
                        {/* アバター（イニシャルアイコン） */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            山田
                        </div>

                        {/* ユーザー名と役職 */}
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 leading-none">山田 太郎</span>
                            <span className="text-xs text-slate-500 mt-1">管理者</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
