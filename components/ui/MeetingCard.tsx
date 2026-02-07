'use client';

import { Loader2, ExternalLink, Eye, CheckCircle } from 'lucide-react';
import { Meeting, MeetingStatus } from '@/lib/types/meeting';

interface MeetingCardProps {
  meeting: Meeting;
  onAction: (meetingId: string, action: 'review' | 'view' | 'notion') => void;
}

const PROCESSING_STATUSES: MeetingStatus[] = [
  MeetingStatus.UPLOADING,
  MeetingStatus.UPLOADED,
  MeetingStatus.EXTRACTING_AUDIO,
  MeetingStatus.TRANSCRIBING,
  MeetingStatus.SUMMARIZING,
  MeetingStatus.CREATING_NOTION,
  MeetingStatus.PROCESSING,
];

function isProcessing(status: MeetingStatus): boolean {
  return PROCESSING_STATUSES.includes(status);
}

function getStatusLabel(status: MeetingStatus): string {
  if (isProcessing(status)) return '処理中...';
  if (status === MeetingStatus.PENDING) return 'レビュー待ち';
  if (status === MeetingStatus.SYNCED) return '同期済み';
  if (status === MeetingStatus.FAILED) return '失敗';
  if (status === MeetingStatus.LIVE) return 'ライブ中';
  return status;
}

export default function MeetingCard({ meeting, onAction }: MeetingCardProps) {
  const processing = isProcessing(meeting.status);

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      {/* Meeting info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate">{meeting.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{meeting.date}</p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mx-4">
        {processing && <Loader2 className="w-4 h-4 animate-spin text-gray-400" aria-label="処理中" />}
        {meeting.status === MeetingStatus.SYNCED && <CheckCircle className="w-4 h-4 text-green-500" />}
        <span className={`text-xs ${processing ? 'text-gray-400' : 'text-gray-600'}`}>
          {getStatusLabel(meeting.status)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {processing && (
          <span className="text-xs text-gray-400">処理中...</span>
        )}

        {meeting.status === MeetingStatus.PENDING && (
          <button
            onClick={() => onAction(meeting.id, 'review')}
            className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            aria-label="確認と同期"
          >
            確認と同期
          </button>
        )}

        {meeting.status === MeetingStatus.SYNCED && (
          <>
            <button
              onClick={() => onAction(meeting.id, 'view')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="閲覧"
            >
              <Eye className="w-3 h-3" />
              閲覧
            </button>
            {meeting.notionPageUrl && (
              <a
                href={meeting.notionPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800"
                aria-label="Notionで表示"
              >
                <ExternalLink className="w-3 h-3" />
                Notion
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { isProcessing, getStatusLabel, PROCESSING_STATUSES };
