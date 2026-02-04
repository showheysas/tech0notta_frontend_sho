import React from 'react';
import { MeetingStatus } from '@/lib/types';

/**
 * バッジコンポーネントのプロパティ定義
 * @property status - 表示するミーティングのステータス (MeetingStatus型)
 */
interface BadgeProps {
    status: MeetingStatus;
}

/**
 * ステータスごとの表示設定
 * MeetingStatusの値に応じて、ラベル名とCSSクラス（色とスタイル）を定義しています。
 *
 * - label: 画面に表示されるテキスト
 * - className: Tailwind CSSのクラス名（背景色や文字色を設定）
 */
const statusConfig: Record<MeetingStatus, { label: string; className: string }> = {
    [MeetingStatus.PENDING]: {
        label: 'レビュー待ち',
        className: 'bg-blue-100 text-blue-800', // 青系の背景と文字
    },
    [MeetingStatus.SYNCED]: {
        label: '同期済み',
        className: 'bg-emerald-100 text-emerald-800', // 緑系の背景と文字
    },
    [MeetingStatus.PROCESSING]: {
        label: '処理中',
        className: 'bg-slate-100 text-slate-600', // グレー系の背景と文字
    },
    [MeetingStatus.LIVE]: {
        label: 'ライブ',
        className: 'bg-red-100 text-red-800', // 赤系の背景と文字
    },
    [MeetingStatus.FAILED]: {
        label: 'エラー',
        className: 'bg-red-100 text-red-800', // 赤系の背景と文字
    },
};

/**
 * Badge（バッジ）コンポーネント
 *
/**
 * ==========================================
 * バッジ (Badge)
 * ==========================================
 *
 * 【概要】
 * ミーティングのステータス（例：レビュー待ち、同期済みなど）を
 * 視覚的に分かりやすく表示するための小さなラベルコンポーネントです。
 *
 * @param {BadgeProps} props - コンポーネントに渡されるプロパティ
 * @returns {JSX.Element} バッジのJSX要素
 */
export const Badge: React.FC<BadgeProps> = ({ status }) => {
    // 受け取ったstatusに対応する設定（ラベルとスタイル）を取得
    const config = statusConfig[status];

    return (
        <span
            // inline-flex: インライン要素のように並びつつ、Flexboxの機能を使う
            // items-center: 中身を垂直方向の中央に配置
            // px-2.5 py-0.5: 横と縦のパディング（余白）
            // rounded-full: 両端を丸くする
            // text-xs: 文字サイズを小さく
            // font-medium: 文字の太さを中くらいに
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
};
