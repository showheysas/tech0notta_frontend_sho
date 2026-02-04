'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StopCircle, CheckCircle, Gavel, Star, Activity, Clock, AlertCircle, Users, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { TranscriptSegment } from '@/lib/types';

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * ==========================================
 * ライブモニター画面 (LiveMonitorPage)
 * ==========================================
 * 
 * 【概要】
 * 現在進行中の会議の音声をリアルタイムでテキスト化し、表示するメイン画面です。
 * ユーザーはこの画面を見ながら会議に参加し、議事録の生成状況を確認したり、
 * 重要な発言に対してその場でマーキング（タグ付け）を行うことができます。
 * 
 * 【主な構成要素】
 * 1. ヘッダー: 会議情報の表示と終了コントロール
 * 2. タイムライン: 書き起こされたテキストが流れるメインエリア
 * 3. サイドパネル: 音声波形やアクションボタン（決定事項メモなど）
 */

interface SessionInfo {
    session_id: string;
    meeting_id: string;
    meeting_topic: string;
    started_at: string;
    participant_count: number;
    segment_count: number;
}

interface SpeakerInfo {
    speaker_id: string;
    label: string;
    mapped_name: string;
}

export default function LiveMonitorPage() {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    // セッション情報
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
    const [segments, setSegments] = useState<TranscriptSegment[]>([]);
    const [lastSegmentId, setLastSegmentId] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 話者設定
    const [speakers, setSpeakers] = useState<SpeakerInfo[]>([]);
    const [speakerMapping, setSpeakerMapping] = useState<Record<string, string>>({});
    const [showSpeakerSettings, setShowSpeakerSettings] = useState(false);
    const [savingSpeakers, setSavingSpeakers] = useState(false);

    /**
     * アクティブなセッションを取得
     * 1. まずBotセッションを確認
     * 2. なければライブセッションを確認
     * 3. どちらもなければデモセッションを作成
     */
    const fetchActiveSession = useCallback(async () => {
        try {
            // 1. Botセッションを確認
            const botResponse = await fetch(`${API_BASE_URL}/api/bot/sessions`);
            if (botResponse.ok) {
                const botSessions = await botResponse.json();
                if (botSessions.length > 0) {
                    setSessionId(botSessions[0].id);
                    setIsConnected(true);
                    setError(null);
                    return;
                }
            }

            // 2. ライブセッションを確認
            const liveResponse = await fetch(`${API_BASE_URL}/api/live/sessions`);
            if (liveResponse.ok) {
                const liveSessions = await liveResponse.json();
                if (liveSessions.length > 0) {
                    setSessionId(liveSessions[0].session_id);
                    setIsConnected(true);
                    setError(null);
                    return;
                }
            }

            // 3. デモセッションを自動作成（開発用）
            console.log('No active sessions found, creating demo session...');
            const demoResponse = await fetch(
                `${API_BASE_URL}/api/live/segments/demo-session/init?meeting_id=demo123&meeting_topic=デモ会議`,
                { method: 'POST' }
            );

            if (demoResponse.ok) {
                setSessionId('demo-session');
                setIsConnected(true);
                setError(null);
                console.log('Demo session created');
            } else {
                setError('セッションの作成に失敗しました');
                setIsConnected(false);
            }
        } catch (e) {
            console.error('Failed to fetch sessions', e);
            setError('セッション取得に失敗しました');
            setIsConnected(false);
        }
    }, []);

    /**
     * セグメントを取得（差分取得）
     */
    const fetchSegments = useCallback(async () => {
        if (!sessionId) return;

        try {
            const params = new URLSearchParams();
            if (lastSegmentId) {
                params.set('since_id', lastSegmentId);
            }

            const response = await fetch(
                `${API_BASE_URL}/api/live/segments/${sessionId}?${params.toString()}`
            );

            if (response.ok) {
                const data = await response.json();

                // セッション情報を更新
                setSessionInfo(data.session);

                // 新しいセグメントがあれば追加
                if (data.segments && data.segments.length > 0) {
                    setSegments(prev => {
                        // 既存のIDと重複しないセグメントのみ追加
                        const existingIds = new Set(prev.map(s => s.id));
                        const newSegments = data.segments.filter(
                            (s: TranscriptSegment) => !existingIds.has(s.id)
                        );
                        return [...prev, ...newSegments];
                    });

                    // 最後のセグメントIDを更新
                    const lastSeg = data.segments[data.segments.length - 1];
                    setLastSegmentId(lastSeg.id);
                }

                setIsConnected(true);
                setError(null);
            } else if (response.status === 404) {
                // セッションが見つからない場合は再取得
                setSessionId(null);
                fetchActiveSession();
            }
        } catch (e) {
            console.error('Failed to fetch segments', e);
        }
    }, [sessionId, lastSegmentId, fetchActiveSession]);

    /**
     * 話者一覧を取得
     */
    const fetchSpeakers = useCallback(async () => {
        if (!sessionId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/live/speakers/${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setSpeakers(data.speakers || []);
                setSpeakerMapping(data.mapping || {});
            }
        } catch (e) {
            console.error('Failed to fetch speakers', e);
        }
    }, [sessionId]);

    /**
     * 話者マッピングを保存
     */
    const saveSpeakerMapping = async () => {
        if (!sessionId) return;

        setSavingSpeakers(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/live/speakers/${sessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mapping: speakerMapping })
            });

            if (response.ok) {
                // セグメントを再取得して話者名を更新
                setLastSegmentId(null);
                setSegments([]);
                fetchSegments();
                alert('話者設定を保存しました');
            }
        } catch (e) {
            console.error('Failed to save speaker mapping', e);
            alert('話者設定の保存に失敗しました');
        } finally {
            setSavingSpeakers(false);
        }
    };

    /**
     * 経過時間を計算
     */
    const calculateElapsedTime = useCallback(() => {
        if (!sessionInfo?.started_at) return;

        // UTCとして解釈させるためにZを付与（すでにTimeZone情報がある場合を除く）
        const startedAtStr = sessionInfo.started_at;
        const startedAt = new Date(startedAtStr.endsWith('Z') || startedAtStr.includes('+') ? startedAtStr : `${startedAtStr}Z`);
        const now = new Date();
        const diff = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        setElapsedTime(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
    }, [sessionInfo?.started_at]);

    /**
     * Botセッション状態を監視して会議終了を検知
     * completed/error状態になったらレビュー画面に遷移
     */
    const checkBotSessionStatus = useCallback(async () => {
        if (!sessionId) return;
        // デモセッションはスキップ
        if (sessionId === 'demo-session') return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/bot/${sessionId}/status`);
            if (response.ok) {
                const session = await response.json();
                if (session.status === 'completed' || session.status === 'error') {
                    console.log(`会議終了検知: status=${session.status}, ホーム画面へ遷移`);
                    router.push('/');
                }
            } else if (response.status === 404) {
                // セッションが見つからない場合もホームへ
                console.log('セッションが見つかりません、ホーム画面へ遷移');
                router.push('/');
            }
        } catch (e) {
            console.error('Failed to check bot session status', e);
        }
    }, [sessionId, router]);

    /**
     * 初期化処理
     */
    useEffect(() => {
        fetchActiveSession();
    }, [fetchActiveSession]);

    /**
     * セグメントのポーリングとセッション状態監視
     */
    useEffect(() => {
        if (!sessionId) return;

        // 初回取得
        fetchSegments();
        fetchSpeakers();
        checkBotSessionStatus();

        // 1秒ごとにポーリング
        const interval = setInterval(() => {
            fetchSegments();
            checkBotSessionStatus();
        }, 1000);

        // 話者一覧は5秒ごと
        const speakerInterval = setInterval(fetchSpeakers, 5000);

        return () => {
            clearInterval(interval);
            clearInterval(speakerInterval);
        };
    }, [sessionId, fetchSegments, fetchSpeakers, checkBotSessionStatus]);

    /**
     * 経過時間の更新
     */
    useEffect(() => {
        const interval = setInterval(calculateElapsedTime, 1000);
        return () => clearInterval(interval);
    }, [calculateElapsedTime]);

    /**
     * オートスクロール制御
     */
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [segments]);

    const handleStop = () => {
        router.push('/');
    };

    // 会議トピック（セッション情報から取得、なければデフォルト）
    const meetingTopic = sessionInfo?.meeting_topic || '会議';
    const participantCount = sessionInfo?.participant_count || 0;


    return (
        <div className="flex-1 flex flex-col h-screen bg-white overflow-hidden animate-fade-in">

            {/* 
                === ヘッダーエリア ===
            */}
            {/* Top Bar */}
            <div className="flex-none px-4 py-3 sm:px-8 sm:py-5 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
                <div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-none">
                            {meetingTopic}
                        </h2>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shrink-0 ${isConnected
                            ? 'bg-red-50 border-red-100'
                            : 'bg-slate-50 border-slate-200'
                            }`}>
                            <span className="relative flex h-2.5 w-2.5">
                                {isConnected ? (
                                    <>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                    </>
                                ) : (
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
                                )}
                            </span>
                            <span className={`text-xs font-bold uppercase tracking-wide hidden sm:inline ${isConnected ? 'text-red-600' : 'text-slate-500'
                                }`}>
                                {isConnected ? 'ライブ' : '待機中'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs sm:text-sm">
                        <Clock size={14} />
                        <span>{elapsedTime} <span className="hidden sm:inline">経過</span></span>
                        <span>•</span>
                        <span>参加者 {participantCount}名</span>
                    </div>
                </div>

                <button
                    onClick={handleStop}
                    className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 text-slate-900 group transition-all shadow-sm shrink-0"
                >
                    <StopCircle className="text-red-500 group-hover:scale-110 transition-transform" size={20} />
                    <span className="text-xs sm:text-sm font-semibold hidden sm:inline">停止して処理</span>
                    <span className="text-xs font-semibold sm:hidden">停止</span>
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* Main Transcript Area */}
                <div className="flex-1 bg-slate-50 relative order-2 lg:order-1 h-full overflow-hidden">
                    <div className="absolute inset-0 overflow-y-auto p-4 sm:p-8" ref={scrollRef}>
                        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-40 lg:pb-20">

                            {/* エラー表示 */}
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* セグメントがない場合のプレースホルダー */}
                            {segments.length === 0 && !error && (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Activity size={48} className="mb-4 animate-pulse" />
                                    <p className="text-lg font-medium">音声を待機中...</p>
                                    <p className="text-sm mt-2">会議の音声が認識されると、ここに表示されます</p>
                                </div>
                            )}

                            {/* セグメント一覧 */}
                            {segments.map((segment) => (
                                <div key={segment.id} className="flex gap-3 sm:gap-4 group animate-slide-in-from-bottom">
                                    <div className="flex-none flex flex-col items-center gap-2 pt-1">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-white shadow-sm ${segment.colorClass}`}>
                                            {segment.initials}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-slate-900">{segment.speaker}</span>
                                            <span className="text-xs text-slate-400 font-medium">{segment.time}</span>
                                        </div>
                                        <div className="bg-white p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 text-slate-800 leading-relaxed text-sm sm:text-base">
                                            {segment.text}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* 認識中インジケーター */}
                            {isConnected && segments.length > 0 && (
                                <div className="flex gap-3 sm:gap-4 opacity-50">
                                    <div className="flex-none flex flex-col items-center gap-2 pt-1">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                                            <Activity size={16} className="text-slate-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 flex items-center gap-2">
                                            <span className="text-slate-400 text-sm">音声認識中</span>
                                            <div className="flex gap-1 items-center h-4">
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Gradient Fade at bottom */}
                        <div className="sticky bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 h-auto lg:h-full border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-4 sm:p-6 flex flex-col gap-6 sm:gap-8 shadow-[-4px_0_24px_rgba(0,0,0,0.01)] z-10 order-1 lg:order-2 shrink-0 overflow-y-auto max-h-[30vh] lg:max-h-none">

                    {/* Voice Activity Visualization */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">音声アクティビティ</h3>
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${isConnected
                                ? 'text-action-600 bg-action-50'
                                : 'text-slate-500 bg-slate-100'
                                }`}>
                                <Activity size={10} /> {isConnected ? '受信中' : '待機中'}
                            </span>
                        </div>
                        <div className="h-16 sm:h-24 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center gap-1 px-4 overflow-hidden">
                            {[...Array(16)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 rounded-full wave-bar ${isConnected ? 'bg-action-500' : 'bg-slate-300'}`}
                                    style={{
                                        animationDelay: `${(i * 0.03) % 0.5}s`,
                                        height: isConnected ? `${20 + ((i * 17) % 60)}%` : '20%',
                                        animationPlayState: isConnected ? 'running' : 'paused'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Markers */}
                    <div className="flex-1 min-h-0">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">クイックマーカー</h3>
                        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                            <button className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 w-full p-3 lg:p-4 rounded-xl border border-slate-200 hover:border-action-500/50 hover:bg-slate-50 transition-all text-center lg:text-left group">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-blue-100 text-action-600 flex items-center justify-center group-hover:bg-action-600 group-hover:text-white transition-colors shrink-0">
                                    <CheckCircle size={18} className="lg:w-5 lg:h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs lg:text-sm font-bold text-slate-900 leading-tight">アクション</span>
                                    <span className="text-[10px] lg:text-[11px] text-slate-500 hidden lg:inline">タスクとして追跡</span>
                                </div>
                            </button>

                            <button className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 w-full p-3 lg:p-4 rounded-xl border border-slate-200 hover:border-amber-400/50 hover:bg-slate-50 transition-all text-center lg:text-left group">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
                                    <Gavel size={18} className="lg:w-5 lg:h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs lg:text-sm font-bold text-slate-900 leading-tight">決定事項</span>
                                    <span className="text-[10px] lg:text-[11px] text-slate-500 hidden lg:inline">合意を記録</span>
                                </div>
                            </button>

                            <button className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 w-full p-3 lg:p-4 rounded-xl border border-slate-200 hover:border-purple-400/50 hover:bg-slate-50 transition-all text-center lg:text-left group">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors shrink-0">
                                    <Star size={18} className="lg:w-5 lg:h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs lg:text-sm font-bold text-slate-900 leading-tight">重要</span>
                                    <span className="text-[10px] lg:text-[11px] text-slate-500 hidden lg:inline">重要箇所をマーク</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 話者設定パネル */}
                    <div className="border-t border-slate-100 pt-4">
                        <button
                            onClick={() => setShowSpeakerSettings(!showSpeakerSettings)}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-slate-400" />
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">話者設定</h3>
                            </div>
                            {showSpeakerSettings ? (
                                <ChevronUp size={16} className="text-slate-400" />
                            ) : (
                                <ChevronDown size={16} className="text-slate-400" />
                            )}
                        </button>

                        {showSpeakerSettings && (
                            <div className="mt-4 space-y-3">
                                {speakers.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-2">話者が検出されるとここに表示されます</p>
                                ) : (
                                    <>
                                        {speakers.map((speaker) => (
                                            <div key={speaker.speaker_id || speaker.label} className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 w-16 truncate">{speaker.label}</span>
                                                <span className="text-slate-300">→</span>
                                                <input
                                                    type="text"
                                                    placeholder="名前を入力"
                                                    value={speakerMapping[speaker.speaker_id] || ''}
                                                    onChange={(e) => setSpeakerMapping(prev => ({
                                                        ...prev,
                                                        [speaker.speaker_id]: e.target.value
                                                    }))}
                                                    className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-100 focus:border-action-500"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={saveSpeakerMapping}
                                            disabled={savingSpeakers}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-action-600 hover:bg-action-700 disabled:bg-slate-300 text-white text-xs font-medium rounded-lg transition-colors"
                                        >
                                            {savingSpeakers ? (
                                                <>
                                                    <span className="animate-spin">⟳</span>
                                                    保存中...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={14} />
                                                    話者設定を保存
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Connected Status */}
                    <div className="hidden lg:block mt-auto pt-6 border-t border-slate-100">
                        <div className={`flex items-center gap-2.5 p-3 rounded-lg border ${isConnected
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-slate-50 border-slate-200'
                            }`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}>
                                <CheckCircle className="text-white" size={12} />
                            </div>
                            <span className={`text-xs font-semibold ${isConnected ? 'text-emerald-800' : 'text-slate-600'
                                }`}>
                                {isConnected
                                    ? `接続中: ${meetingTopic}`
                                    : 'セッション待機中...'
                                }
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
