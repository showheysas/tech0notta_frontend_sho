/**
 * Meeting status enum representing all possible states of a meeting/job
 */
export enum MeetingStatus {
  UPLOADING = 'UPLOADING',           // アップロード中
  UPLOADED = 'UPLOADED',             // アップロード完了
  EXTRACTING_AUDIO = 'EXTRACTING_AUDIO', // 音声抽出中
  TRANSCRIBING = 'TRANSCRIBING',     // 文字起こし中
  SUMMARIZING = 'SUMMARIZING',       // 要約生成中
  CREATING_NOTION = 'CREATING_NOTION', // Notion作成中
  PENDING = 'PENDING',               // レビュー待ち
  SYNCED = 'SYNCED',                 // 同期済み
  PROCESSING = 'PROCESSING',         // 処理中（汎用）
  LIVE = 'LIVE',                     // ライブ中
  FAILED = 'FAILED'                  // 失敗
}

/**
 * Meeting interface representing a meeting/job in the system
 */
export interface Meeting {
  id: string;
  title: string;
  date: string;
  status: MeetingStatus;
  duration?: string;
  originalFileType?: 'audio' | 'video';
  audioFileUrl?: string;
  notionPageUrl?: string;
}

/**
 * Response from the upload API endpoint
 */
export interface UploadResponse {
  job_id: string;
  filename: string;
  status: MeetingStatus;
  original_file_type: 'audio' | 'video';
}

/**
 * Error response from the upload API endpoint
 */
export interface UploadError {
  detail: string;
  code?: string;
}
