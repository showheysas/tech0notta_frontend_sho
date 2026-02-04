import React, { ReactNode } from 'react';

/**
 * ツールチップコンポーネントのプロパティ定義
 * @property content - ツールチップ内に表示するテキストまたは要素
 * @property children - ツールチップを表示するトリガーとなる要素（ホバーされる要素）
 * @property position - ツールチップの表示位置（top, bottom, left, right）。デフォルトは top。
 */
interface TooltipProps {
    content: string | ReactNode;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Tooltip（ツールチップ）コンポーネント
 * 
/**
 * ==========================================
 * ツールチップ (Tooltip)
 * ==========================================
 * 
 * 【概要】
 * 要素にマウスホバーした際に、補足情報をポップアップ表示するコンポーネントです。
 * CSSの group-hover を使用して、JavaScriptを使わずに表示切り替えを実現しています。
 * 
 * @param {TooltipProps} props - プロパティ
 * @returns {JSX.Element} ツールチップのJSX要素
 */
export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
    // 表示位置ごとのCSSクラス定義
    // 各位置に合わせて絶対配置（absolute）の基準点を設定しています。
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2', // 要素の上に表示
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2', // 要素の下に表示
        left: 'right-full top-1/2 -translate-y-1/2 mr-2', // 要素の左に表示
        right: 'left-full top-1/2 -translate-y-1/2 ml-2', // 要素の右に表示
    };

    return (
        // group/tooltip: この親要素にホバーしたことを検知するためのグループ名
        // relative: 子要素（ツールチップ）の絶対配置の基準点となる
        <div className="group/tooltip relative inline-flex">
            {/* トリガーとなる要素（常に表示） */}
            {children}

            {/* ツールチップ本体（初期状態は透明で非表示） */}
            <div
                // absolute: 親要素を基準に配置
                // z-50: 最前面に表示
                // opacity-0: 透明（見えない）
                // group-hover/tooltip:opacity-100: 親グループがホバーされたら不透明（見える）にする
                // pointer-events-none: ツールチップ自体がマウスイベントを邪魔しないようにする
                className={`absolute z-50 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white shadow-lg opacity-0 transition-opacity duration-200 pointer-events-none group-hover/tooltip:opacity-100 ${positionClasses[position]}`}
            >
                {content}

                {/* 吹き出しの矢印（三角形） */}
                {/* 45度回転させた小さな正方形を配置して矢印に見せています */}
                <div
                    className={`absolute w-2 h-2 bg-slate-800 rotate-45 
            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
            `}
                />
            </div>
        </div>
    );
}
