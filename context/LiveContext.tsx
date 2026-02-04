'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { TranscriptSegment } from '@/lib/types';
import { MOCK_TRANSCRIPT } from '@/lib/constants/mockData';

/**
 * LiveContextType
 * 
 * ライブコンテキストが提供する値と関数の型定義です。
 */
interface LiveContextType {
    // 現在ライブ（書き起こし中）かどうか
    isLive: boolean;
    // 現在までに書き起こされた発言セグメントのリスト
    segments: TranscriptSegment[];
    // ライブを開始する関数
    startLive: () => void;
    // ライブを停止する関数
    stopLive: () => void;
    // ライブ状態をリセットし、セグメントを空にする関数
    resetLive: () => void;
}

const LiveContext = createContext<LiveContextType | undefined>(undefined);

/**
 * LiveProvider
 * 
 * アプリケーション全体でライブ書き起こしの状態を管理・共有するためのプロバイダーコンポーネント。
 * モックデータを使用して、リアルタイムに書き起こしテキストが追加されていく様子をシミュレーションします。
 */
export const LiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ライブ状態のフラグ
    const [isLive, setIsLive] = useState(false);
    // 表示すべき発言セグメントの配列
    const [segments, setSegments] = useState<TranscriptSegment[]>([]);
    // タイマー管理用のRef (setTimeoutのIDを保持)
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * ライブ書き起こしシミュレーションを開始します。
     * 既にライブ中の場合は何もしません。
     */
    const startLive = useCallback(() => {
        if (isLive) return;
        setIsLive(true);
        // セグメントが空の場合は、最初のデータを入れて開始感を演出
        if (segments.length === 0) {
            setSegments(MOCK_TRANSCRIPT.slice(0, 1));
        }
    }, [isLive, segments.length]);

    /**
     * ライブ書き起こしを一時停止/終了します。
     * 進行中のタイマー処理があればクリアします。
     */
    const stopLive = useCallback(() => {
        setIsLive(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    /**
     * ライブ状態を完全にリセットします。
     * 停止し、表示済みセグメントも全て消去します。
     */
    const resetLive = useCallback(() => {
        stopLive();
        setSegments([]);
    }, [stopLive]);

    // --- ライブシミュレーションのメインロジック ---
    // isLiveがtrueの間、一定間隔でモックデータをsegmentsに追加していきます。
    useEffect(() => {
        // ライブ中でない場合は何もしない
        if (!isLive) return;

        // 全てのモックデータが表示されたら、少し待ってから自動終了
        if (segments.length >= MOCK_TRANSCRIPT.length) {
            timerRef.current = setTimeout(() => {
                stopLive();
            }, 3000); // 3秒後に終了
            return;
        }

        // 次のセグメントを追加
        timerRef.current = setTimeout(() => {
            setSegments(prev => {
                const nextIndex = prev.length;
                if (nextIndex < MOCK_TRANSCRIPT.length) {
                    return [...prev, MOCK_TRANSCRIPT[nextIndex]];
                }
                return prev;
            });
        }, 2500);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isLive, segments, stopLive]);

    return (
        <LiveContext.Provider value={{ isLive, segments, startLive, stopLive, resetLive }}>
            {children}
        </LiveContext.Provider>
    );
};

/**
 * useLiveContext
 * 
 * コンポーネントからLiveContextを利用するためのカスタムフック。
 * LiveProviderの配下でのみ使用可能です。
 */
export const useLiveContext = () => {
    const context = useContext(LiveContext);
    if (!context) {
        throw new Error('useLiveContext must be used within a LiveProvider');
    }
    return context;
};
