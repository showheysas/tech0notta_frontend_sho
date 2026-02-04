/**
 * 型定義
 */

// ビューモード（ナビゲーション用）
export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  RECOVERY = 'RECOVERY',
  LIVE = 'LIVE',
  REVIEW = 'REVIEW'
}

// 会議ステータス
export enum MeetingStatus {
  PENDING = 'PENDING',       // レビュー待ち
  SYNCED = 'SYNCED',         // 同期済み
  PROCESSING = 'PROCESSING', // 処理中
  LIVE = 'LIVE',             // ライブ中
  FAILED = 'FAILED'          // 失敗
}

// 会議データ
export interface Meeting {
  id: string;
  title: string;
  date: string;
  status: MeetingStatus;
  duration?: string;
}

// 文字起こしセグメント
export interface TranscriptSegment {
  id: string;
  speaker: string;
  time: string;
  text: string;
  initials: string;
  colorClass: string;
}

// アクションアイテム
export interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  checked: boolean;
}

// ナビゲーション用 props
export interface NavigationProps {
  currentView?: ViewMode;
  onNavigate?: (view: ViewMode) => void;
}
