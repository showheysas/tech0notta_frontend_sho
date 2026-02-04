'use client';

import React from 'react';

/**
 * ボタンコンポーネントのプロパティ定義
 * Reactの標準的なボタン属性（ButtonHTMLAttributes）を継承しているため、
 * onClickやtypeなどの標準的なプロパティもそのまま使えます。
 * 
 * @property variant - ボタンの見た目の種類（primary: 主要, secondary: 白背景, outline: 枠線のみ, ghost: 透明, danger: 危険・削除など）
 * @property size - ボタンのサイズ（sm: 小, md: 中, lg: 大）
 * @property children - ボタンの中に表示する内容（テキストやアイコンなど）
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

/**
 * Button（ボタン）コンポーネント
 * 
/**
 * ==========================================
 * ボタン (Button)
 * ==========================================
 * 
 * 【概要】
 * アプリケーション全体で統一されたデザインのボタンを提供します。
 * バリアント（種類）とサイズを指定するだけで、適切なスタイルが適用されます。
 * 
 * @param {ButtonProps} props - プロパティ
 * @returns {JSX.Element} ボタンのJSX要素
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary', // デフォルトはprimary
    size = 'md',         // デフォルトはmd（中サイズ）
    children,
    className = '',      // 追加のクラス名（上書き用）
    disabled,            // 無効化フラグ
    ...props             // その他の標準的なボタンプロパティ（onClickなど）
}) => {
    // 全てのボタンに共通する基本スタイル
    // inline-flex: アイコンとテキストを横並びにするため
    // items-center justify-center: 中身を中央揃え
    // transition-all: ホバー時のアニメーションを滑らかに
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all';

    // バリアント（種類）ごとのスタイル定義
    const variantStyles = {
        primary: 'bg-action-600 hover:bg-action-700 text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5', // メインのアクション（少し浮き上がるエフェクト付き）
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900', // サブのアクション（薄いグレー背景）
        outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-900', // 枠線のみ
        ghost: 'text-slate-600 hover:bg-slate-100', // 背景なし（ホバー時のみ背景）
        danger: 'border border-red-200 hover:bg-red-50 hover:border-red-300 text-slate-900', // 削除などの危険なアクション
    };

    // サイズごとのスタイル定義（パディングと文字サイズ）
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    // 無効化（disabled）時のスタイル
    // opacity-50: 半透明にする
    // cursor-not-allowed: マウスカーソルを禁止マークに
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : '';

    return (
        <button
            // button要素として描画
            // クラス名を組み合わせて最終的なスタイルを決定
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
            disabled={disabled}
            {...props} // onClickなどを展開
        >
            {children}
        </button>
    );
};
