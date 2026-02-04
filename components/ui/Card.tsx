import React from 'react';

/**
 * カードコンポーネントのプロパティ定義
 * 
 * @property children - カードの中に表示するコンテンツ
 * @property className - 追加のスタイルクラス（任意）
 * @property variant - カードの見た目（デザイン）のバリエーション
 *   - default: 標準（枠線のみ）
 *   - accent: 左側にアクセントカラーの線を表示
 *   - highlight: 緑色の背景で強調表示
 *   - success: 成功を示す緑色の線を表示
 * @property padding - 内側の余白のサイズ（sm, md, lg）
 */
interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'accent' | 'highlight' | 'success';
    padding?: 'sm' | 'md' | 'lg';
}

/**
 * Card（カード）コンポーネント
 * 
/**
 * ==========================================
 * カード (Card)
 * ==========================================
 * 
 * 【概要】
 * コンテンツをグループ化して表示するための枠組みとなるコンポーネントです。
 * 白背景、角丸、影付きのデザインが適用されます。
 * 
 * @param {CardProps} props - プロパティ
 * @returns {JSX.Element} カードのJSX要素
 */
export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default', // デフォルトは標準デザイン
    padding = 'md',      // デフォルトは中くらいの余白
}) => {
    // 基本スタイル
    // bg-white: 白背景
    // rounded-2xl: 角を大きく丸くする
    // shadow-sm: 軽い影をつける
    // min-w-0: Flexbox内での幅の縮小を防ぐためのハック
    // overflow-hidden: 丸い角からはみ出した中身を切り取る
    const baseStyles = 'bg-white rounded-2xl shadow-sm min-w-0 overflow-hidden';

    // バリアント（種類）ごとのスタイル定義
    const variantStyles = {
        default: 'border border-slate-200', // 薄いグレーの枠線
        accent: 'border-l-4 border-action-600', // 左側にアクセント色の太い線
        highlight: 'border border-emerald-200 bg-emerald-50/50', // 全体を薄い緑色にする
        success: 'border-l-4 border-emerald-500', // 左側に緑色の太い線
    };

    // パディング（内側の余白）のサイズ定義
    const paddingStyles = {
        sm: 'p-4',  // 小さい余白
        md: 'p-6',  // 標準の余白
        lg: 'p-8',  // 大きい余白
    };

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
            {children}
        </div>
    );
};
