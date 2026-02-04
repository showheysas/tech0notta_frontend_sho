'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X, Plus, Edit2, CloudUpload, ArrowLeft, Send, Bot, User } from 'lucide-react';
import { INITIAL_SUMMARY, INITIAL_TAGS } from '@/lib/constants/mockData';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

/**
 * ReviewSyncPage (レビュー & 同期ページ)
 *
 * 会議の要約、タグを確認・編集し、
 * 最終的にNotionなどの外部ツールへ同期するためのページです。
 *
 * 主な機能:
 * - エグゼクティブサマリーの編集
 * - インサイトタグの管理（削除・追加）
 * - AIチャットによる議事録の修正依頼
 * - Notionへの同期実行
 */
export default function ReviewSyncPage() {
    const router = useRouter();

    // --- 状態管理 (State) ---
    // summary: 会議の要約テキスト
    const [summary, setSummary] = useState(INITIAL_SUMMARY);
    // tags: 会議から抽出されたキーワードやタグ
    const [tags, setTags] = useState(INITIAL_TAGS);
    // syncing: 同期処理中かどうかのフラグ
    const [syncing, setSyncing] = useState(false);
    // chatMessages: AIとのチャット履歴
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'assistant', content: '議事録ドラフトを確認しました。修正や追加のご要望があればお知らせください。' }
    ]);
    // chatInput: チャット入力欄の値
    const [chatInput, setChatInput] = useState('');
    // isTyping: AIが応答中かどうか
    const [isTyping, setIsTyping] = useState(false);
    // チャットエリアのスクロール用ref
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 新しいメッセージが追加されたら自動スクロール
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    /**
     * チャットメッセージを送信する関数
     */
    const sendMessage = () => {
        if (!chatInput.trim() || isTyping) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput.trim()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsTyping(true);

        // モック: AIの応答をシミュレート
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'ご要望を承りました。議事録を修正いたします。上記のサマリーを更新しましたのでご確認ください。'
            };
            setChatMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    /**
     * タグをリストから削除する関数
     * @param tagToRemove 削除するタグの文字列
     */
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    /**
     * 同期ボタンクリック時の処理
     * 現在はモック実装として、1.2秒後にホーム画面へ遷移します。
     */
    const handleSync = async () => {
        setSyncing(true);
        try {
            // バックエンドAPIを呼び出す
            const response = await fetch('http://127.0.0.1:8000/api/sync/notion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: "プロジェクトアルファ キックオフ",
                    summary: summary,
                    tags: tags,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '同期に失敗しました');
            }

            const data = await response.json();
            // 本来はトースト通知などが望ましいが、簡易的にアラートで表示
            alert('Notionへの同期が完了しました！');
            console.log('Synced to:', data.url);

            router.push('/');
        } catch (error) {
            console.error('Sync failed:', error);
            alert(`同期エラー: ${error instanceof Error ? error.message : '不明なエラーが発生しました'}`);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white animate-slide-in-from-right">

            {/* 
              ヘッダーセクション:
              - 戻るボタン
              - ページタイトル (レビュー & Notion同期)
              - 会議名表示
              - AI信頼度バッジ
            */}
            <div className="flex-none px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white z-10 gap-4 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-action-50 rounded-lg text-action-600 shrink-0">
                                <Sparkles size={18} />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">レビュー & Notion同期</h2>
                        </div>
                        <p className="text-slate-500 text-xs sm:text-sm pl-0 sm:pl-10 mt-1 truncate">
                            会議: <span className="font-medium text-slate-900">プロジェクトアルファ キックオフ</span>
                        </p>
                    </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ml-10 sm:ml-0">
                    <Sparkles size={12} />
                    AI信頼度: 高
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* 
                  左カラム: 要約とインサイト (タグ)
                  PCサイズ(lg)以上では左側に表示、それ以下では下段に配置
                */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 order-2 lg:order-1 h-full">
                    <div className="max-w-3xl mx-auto flex flex-col gap-6 sm:gap-8 pb-10">

                        {/* 
                          エグゼクティブサマリー編集エリア
                          テキストエリアをクリックして編集可能
                        */}
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-end">
                                エグゼクティブサマリー
                                <span className="text-[10px] normal-case font-normal text-slate-400">クリックして編集</span>
                            </label>
                            <div className="w-full p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-action-300 hover:bg-white focus-within:ring-2 focus-within:ring-action-100 focus-within:border-action-500 transition-all group">
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    className="w-full bg-transparent border-0 p-0 text-sm sm:text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus:ring-0 resize-none h-[200px] sm:h-[240px] focus:outline-none"
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                        {/* 
                          タグ管理エリア
                          主要なインサイトをタグとして表示・削除
                        */}
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">主要インサイト</label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <div key={tag} className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 shadow-sm hover:border-action-300 hover:shadow-md transition-all cursor-default">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500 rounded-full p-0.5 hover:bg-red-50 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:text-action-600 hover:border-action-400 hover:bg-action-50 transition-all">
                                    <Plus size={16} />
                                    タグ追加
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/*
                  右カラム: AIチャット & 同期ボタン
                  PCサイズ(lg)以上では右側のサイドバーとして表示
                */}
                <div className="w-full lg:w-96 bg-slate-50 flex flex-col shrink-0 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-slate-200 lg:h-full max-h-[50vh] lg:max-h-none overflow-hidden">
                    <div className="p-4 sm:p-8 flex flex-col h-full gap-6 sm:gap-8 overflow-y-auto">

                        {/*
                          AIチャットエリア
                          議事録の修正依頼をAIに送信可能
                        */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI修正アシスタント</label>
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                    <Bot size={14} />
                                    <span className="text-[10px] font-medium">オンライン</span>
                                </div>
                            </div>

                            {/* チャットメッセージ表示エリア */}
                            <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 p-3 mb-3 min-h-[200px] max-h-[300px]">
                                <div className="flex flex-col gap-3">
                                    {chatMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-action-100 text-action-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                            </div>
                                            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${message.role === 'user' ? 'bg-action-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                                {message.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex gap-2">
                                            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-600">
                                                <Bot size={14} />
                                            </div>
                                            <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-sm">
                                                <span className="inline-flex gap-1">
                                                    <span className="animate-bounce">.</span>
                                                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                                                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            </div>

                            {/* チャット入力エリア */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="修正内容を入力..."
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-action-100 focus:border-action-500 transition-all"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!chatInput.trim() || isTyping}
                                    className="px-3 py-2 bg-action-600 hover:bg-action-700 disabled:bg-slate-300 text-white rounded-xl transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>

                        {/* 
                          下部同期エリア
                          Notionへの同期先情報の表示と実行ボタン
                        */}
                        <div className="mt-auto pt-6 border-t border-slate-200">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">同期先</label>
                            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 mb-6 shadow-sm">
                                <div className="w-8 h-8 rounded bg-white flex items-center justify-center shrink-0 border border-slate-200">
                                    <span className="text-sm font-bold font-serif">N</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] text-slate-500 font-medium leading-none mb-1">Notionデータベース</span>
                                    <span className="text-sm font-bold text-slate-900 truncate leading-none">TechNotta DB / プロジェクトアルファ</span>
                                </div>
                                <button className="ml-auto text-slate-400 hover:text-action-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                                    <Edit2 size={16} />
                                </button>
                            </div>

                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className="w-full py-3.5 sm:py-4 px-4 bg-action-600 hover:bg-action-700 disabled:bg-action-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                            >
                                {syncing ? (
                                    <>
                                        <span className="animate-spin">⟳</span>
                                        同期中...
                                    </>
                                ) : (
                                    <>
                                        <CloudUpload size={20} />
                                        承認してNotionに同期
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
