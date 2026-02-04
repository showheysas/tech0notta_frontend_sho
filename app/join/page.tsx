'use client';

// ReactとNext.jsのフック、アイコンコンポーネントをインポート
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Info, ArrowRight, Check, Lock, Hourglass, ShieldCheck, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * 参加ページ (JoinPage) コンポーネント
 * ユーザーが会議URLを手動で入力して、ボットを会議に参加させるための画面です。
 * 接続プロセスをステップ（0〜3）で管理し、視覚的に進捗を表示します。
 */
export default function JoinPage() {
    const router = useRouter();
    // 入力された会議URLを管理するステート
    const [url, setUrl] = useState('');
    // 接続プロセスの現在のステップを管理するステート
    // 0: 入力待ち, 1: 準備完了, 2: 認証中, 3: 待機室（完了）
    const [step, setStep] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 「今すぐ参加」ボタンがクリックされた時の処理
    const handleJoin = async () => {
        if (!url) return; // URLが空の場合は何もしない
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/bot/dispatch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ meeting_id: url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Botの派遣に失敗しました');
            }

            const data = await response.json();
            setSessionId(data.session.id);
            setStep(1); // ステップを1（準備完了）に進めてプロセスを開始
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
            setStep(0);
        }
    };

    // ステータスポーリング
    useEffect(() => {
        if (!sessionId || step >= 3) return;

        const pollStatus = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/bot/${sessionId}/status`);
                if (!response.ok) return;

                const data = await response.json();
                const status = data.status;

                // ステータスに基づいてステップを更新
                if (status === 'joining') {
                    setStep(2);
                } else if (status === 'in_meeting' || status === 'recording') {
                    setStep(3);
                } else if (status === 'error') {
                    setError(data.error_message || 'Botにエラーが発生しました');
                    setSessionId(null);
                    setStep(0);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        const intervalId = setInterval(pollStatus, 2000); // 2秒ごとにポーリング

        return () => clearInterval(intervalId);
    }, [sessionId, step]);

    // ステップ3: 待機室 -> 1.5秒後にライブ画面（/live）へ遷移
    useEffect(() => {
        if (step === 3) {
            const timer = setTimeout(() => {
                router.push('/live');
            }, 1500);
            return () => clearTimeout(timer); // クリーンアップ関数
        }
    }, [step, router]);

    return (
        // 全体のレイアウトコンテナ（画面中央寄せ、背景色設定）
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50 min-h-screen animate-zoom-in">
            {/* メインのカードコンポーネント */}
            <div className="w-full max-w-[800px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-6 sm:p-12 flex flex-col gap-6 sm:gap-8">
                    {/* ヘッダーセクション：タイトル */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">ボットを会議に参加させる</h2>
                            <p className="text-slate-500 text-sm sm:text-lg">
                                Zoom 会議の招待URLを貼り付けると、Tech Botが自動入室して会議の音声を録音・リアルタイムで文字起こしします。
                                <br className="hidden sm:inline" />
                                <span className="text-slate-400 text-base block mt-2">
                                    ※ 基本的にボットは自動で参加しますが、参加しなかった場合の予備機能としてご利用ください。
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* エラー表示 */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                            <AlertCircle size={20} />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    {/* 入力エリア：会議URLの入力フォーム */}
                    <div className="flex flex-col gap-4">

                        <div className="flex flex-col gap-2">
                            <label htmlFor="meeting-url" className="text-slate-900 text-sm font-bold uppercase tracking-wider">Web会議の招待URLを入力</label>
                        </div>

                        <div className="relative w-full">
                            <div className="flex flex-col sm:flex-row items-stretch shadow-sm rounded-xl gap-3 sm:gap-0 h-auto sm:h-16 w-full">

                                {/* URL入力フィールド */}
                                <input
                                    id="meeting-url"
                                    type="text"
                                    autoFocus
                                    placeholder="https://zoom.us/j/123456789..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={step > 0} // 接続プロセス開始後は編集不可
                                    className="flex-1 rounded-xl sm:rounded-r-none border border-slate-200 sm:border-r-0 bg-slate-50 px-5 py-4 sm:py-0 text-base focus:ring-2 focus:ring-action-500 focus:outline-none disabled:opacity-50"
                                />

                                {/* アクションボタン（参加 / 接続中） */}
                                <button
                                    onClick={handleJoin}
                                    disabled={!url || step > 0} // URL未入力または接続中は無効化
                                    className="px-8 py-4 sm:py-0 bg-action-600 hover:bg-action-700 disabled:bg-slate-300 text-white font-bold text-base tracking-wide rounded-xl sm:rounded-l-none transition-colors flex items-center justify-center gap-2 group min-w-[160px]"
                                >
                                    {step === 0 ? (
                                        <>
                                            今すぐ参加
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    ) : (
                                        '接続中...'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ここは実装可能か要確認 → Zoom Web SDK使えばできる */}
                    {/* ステッパーステータス表示：接続進捗を視覚化 */}
                    <div className="mt-4 pt-4">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-slate-900 text-sm font-medium">接続ステータス</span>
                            {/* 接続中のみ表示されるアニメーションテキスト */}
                            {step > 0 && step < 3 && <span className="text-action-600 text-sm font-bold animate-pulse">セキュアリンクを確立中...</span>}
                        </div>

                        <div className="relative flex items-center justify-between w-full px-4 sm:px-8">
                            {/* プログレスバーの背景（グレーの線） */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 mx-4 sm:mx-8"></div>
                            {/* プログレスバーの進行部分（色付きの線） */}
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-action-500 -z-10 mx-4 sm:mx-8 transition-all duration-1000 ease-out"
                                // ステップに応じて幅を変える
                                style={{ width: `${step === 0 ? 0 : step === 1 ? 0 : step === 2 ? 50 : 100}%` }}
                            ></div>

                            {/* ステップ1: 準備完了 */}
                            <div className="flex flex-col items-center gap-3 relative z-10">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-4 ring-white transition-colors duration-500 ${step >= 1 ? 'bg-action-600 text-white shadow-lg shadow-action-500/30' : 'bg-slate-200 text-slate-400'}`}>
                                    <Check size={16} className="sm:w-5 sm:h-5" />
                                </div>
                                <span className={`text-[10px] sm:text-xs font-semibold absolute -bottom-8 w-max ${step >= 1 ? 'text-action-600' : 'text-slate-400'}`}>1. 準備完了</span>
                            </div>

                            {/* ステップ2: 認証中 */}
                            <div className="flex flex-col items-center gap-3 relative z-10">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-4 ring-white transition-colors duration-500 ${step >= 2 ? 'bg-action-600 text-white shadow-lg shadow-action-500/30' : 'bg-slate-200 text-slate-400'}`}>
                                    <Lock size={14} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <span className={`text-[10px] sm:text-xs font-medium absolute -bottom-8 w-max ${step >= 2 ? 'text-action-600' : 'text-slate-400'}`}>2. 認証中</span>
                            </div>

                            {/* ステップ3: 待機室 */}
                            <div className="flex flex-col items-center gap-3 relative z-10">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-4 ring-white transition-colors duration-500 ${step >= 3 ? 'bg-action-600 text-white shadow-lg shadow-action-500/30' : 'bg-slate-200 text-slate-400'}`}>
                                    <Hourglass size={14} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <span className={`text-[10px] sm:text-xs font-medium absolute -bottom-8 w-max ${step >= 3 ? 'text-action-600' : 'text-slate-400'}`}>3. 待機室</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
