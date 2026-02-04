/**
 * TechNotta AI - モックデータ
 * 
 * 将来的にはAPI経由でデータを取得するように置き換え予定
 */

import { Meeting, MeetingStatus, TranscriptSegment, ActionItem } from '../types';

// 会議一覧のモックデータ
export const MOCK_MEETINGS: Meeting[] = [
    {
        id: '1',
        title: 'プロジェクトアルファ キックオフ',
        date: '今日 10:00',
        status: MeetingStatus.PENDING,
    },
    {
        id: '2',
        title: '週次デザインレビュー',
        date: '昨日 15:30',
        status: MeetingStatus.SYNCED,
    },
    {
        id: '3',
        title: 'Q4 予算策定ミーティング',
        date: '昨日 11:00',
        status: MeetingStatus.PROCESSING,
    },
    {
        id: '4',
        title: 'マーケティング定例',
        date: '10月20日 14:00',
        status: MeetingStatus.SYNCED,
    },
];

// 文字起こしのモックデータ
export const MOCK_TRANSCRIPT: TranscriptSegment[] = [
    {
        id: 't1',
        speaker: '田中 (PM)',
        time: '10:00 AM',
        text: 'おはようございます。本日はプロジェクトアルファのキックオフにご参加いただきありがとうございます。まずは参加メンバーの確認から始めましょう。',
        initials: '田中',
        colorClass: 'bg-indigo-100 text-indigo-700'
    },
    {
        id: 't2',
        speaker: '佐藤 (Dev)',
        time: '10:01 AM',
        text: 'お疲れ様です。アジェンダを確認しました。最初の項目は今四半期のマイルストーン設定についてですね？',
        initials: '佐藤',
        colorClass: 'bg-emerald-100 text-emerald-700'
    },
    {
        id: 't3',
        speaker: '田中 (PM)',
        time: '10:02 AM',
        text: 'はい、その通りです。特に開発フェーズのリソース配分について認識を合わせたいと考えています。皆さんの意見を聞かせてください。',
        initials: '田中',
        colorClass: 'bg-indigo-100 text-indigo-700'
    },
];

// エグゼクティブサマリーの初期値
export const INITIAL_SUMMARY = `本日のキックオフミーティングでは、プロジェクトアルファの主要目標とタイムラインが策定されました。チームは来週までに初期要件定義を完了させることに合意しました。

主な決定事項として、開発フェーズにはアジャイル手法を採用し、隔週でスプリントレビューを実施することが決定しました。また、デザインチームはステークホルダーへの共有用として、今月末までにプロトタイプを作成する予定です。

リスク要因として、外部API仕様の変更の可能性が挙げられており、技術チームによる予備調査が必要とされています。`;

// アクションアイテムの初期値
export const INITIAL_ACTION_ITEMS: ActionItem[] = [
    { id: 'a1', text: '要件定義書のドラフト作成', assignee: '@幸雄', checked: false },
    { id: 'a2', text: '競合分析レポートの共有', assignee: '@沙羅', checked: false },
    { id: 'a3', text: 'API仕様の最終確認', assignee: '未割り当て', checked: false },
];

// タグの初期値
export const INITIAL_TAGS = ['コラボレーション', '競合情報', 'リソース配分'];
