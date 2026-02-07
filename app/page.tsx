'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, FileCheck, CheckCircle2, Edit3, ExternalLink, RefreshCw, Star, MoreVertical, Video } from 'lucide-react';
import UploadButton from '@/components/upload/UploadButton';
import { MeetingStatus } from '@/lib/types/meeting';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface Job {
  id: number;
  job_id: string;
  filename: string;
  status: string;
  created_at: string;
  updated_at: string;
  notion_page_url?: string;
}

interface JobStats {
  total_meetings: number;
  pending_approval: number;
  synced_notion: number;
}

function getBadgeStatus(status: string): MeetingStatus {
  switch (status) {
    case 'completed': return MeetingStatus.SYNCED;
    case 'summarized':
    case 'transcribed': return MeetingStatus.PENDING;
    case 'uploading':
    case 'uploaded':
    case 'extracting_audio':
    case 'transcribing':
    case 'summarizing':
    case 'creating_notion': return MeetingStatus.PROCESSING;
    case 'failed': return MeetingStatus.FAILED;
    default: return MeetingStatus.PROCESSING;
  }
}

function getBadgeLabel(status: MeetingStatus): string {
  switch (status) {
    case MeetingStatus.PENDING: return 'レビュー待ち';
    case MeetingStatus.SYNCED: return '同期済み';
    case MeetingStatus.PROCESSING: return '処理中';
    case MeetingStatus.FAILED: return 'エラー';
    default: return status;
  }
}

function getBadgeClass(status: MeetingStatus): string {
  switch (status) {
    case MeetingStatus.PENDING: return 'bg-blue-100 text-blue-800';
    case MeetingStatus.SYNCED: return 'bg-emerald-100 text-emerald-800';
    case MeetingStatus.PROCESSING: return 'bg-slate-100 text-slate-600';
    case MeetingStatus.FAILED: return 'bg-red-100 text-red-800';
    default: return 'bg-slate-100 text-slate-600';
  }
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats>({ total_meetings: 0, pending_approval: 0, synced_notion: 0 });

  // 処理中のジョブを自動的に進める
  const processJobs = useCallback(async (jobList: Job[]) => {
    for (const job of jobList) {
      try {
        // uploadedステータスのジョブは文字起こしを開始
        if (job.status === 'uploaded') {
          await fetch(`${API_URL}/api/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job_id: job.job_id })
          });
        }
        // transcribingステータスのジョブはステータスをチェック（バックエンドが更新する）
        else if (job.status === 'transcribing') {
          await fetch(`${API_URL}/api/transcribe/status?job_id=${job.job_id}`);
        }
      } catch (e) {
        console.error(`Failed to process job ${job.job_id}:`, e);
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/jobs?limit=10`),
        fetch(`${API_URL}/api/jobs/stats`)
      ]);
      if (jobsRes.ok) {
        const jobList = await jobsRes.json();
        setJobs(jobList);
        // 処理中のジョブを自動的に進める
        await processJobs(jobList);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    }
  }, [processJobs]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-fade-in overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">ホーム</h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">議事録作成ステータス、Notion同期状況を確認できます。</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <UploadButton onUploadComplete={() => fetchData()} />
          <Link
            href="/join"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            <Video size={18} />
            Tech Botを会議に参加させる
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600"><Users size={20} /></div>
            <span className="text-sm font-medium text-slate-500">総会議数</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.total_meetings}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><FileCheck size={20} /></div>
            <span className="text-sm font-medium text-slate-500">議事録 承認待ち</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.pending_approval}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 size={20} /></div>
            <span className="text-sm font-medium text-slate-500">Notion 同期済み</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{stats.synced_notion}</p>
        </div>
      </div>

      {/* Recent meetings table */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">最近の会議</h3>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">会議名</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"></th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">日時</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">ステータス</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => {
                const status = getBadgeStatus(job.status);
                return (
                  <tr key={job.job_id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <span>{job.filename}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors" title="名前を変更"><Edit3 size={16} /></button>
                        <button className="p-1.5 text-slate-500 hover:text-yellow-500 hover:bg-slate-200 rounded-md transition-colors" title="お気に入り"><Star size={16} /></button>
                        <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors" title="その他"><MoreVertical size={16} /></button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {(() => {
                        const dateStr = job.created_at;
                        const date = new Date(dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`);
                        return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(status)}`}>
                        {getBadgeLabel(status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {status === MeetingStatus.PENDING && (
                          <Link href={`/review/${job.job_id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg text-xs transition-colors">
                            <Edit3 size={14} /> 確認と同期
                          </Link>
                        )}
                        {status === MeetingStatus.SYNCED && (
                          <>
                            <Link href={`/review/${job.job_id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition-colors">
                              <Edit3 size={14} /> 閲覧
                            </Link>
                            {job.notion_page_url && (
                              <a href={job.notion_page_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-medium text-xs transition-colors">
                                <ExternalLink size={14} /> Notion
                              </a>
                            )}
                          </>
                        )}
                        {status === MeetingStatus.PROCESSING && (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs animate-pulse">
                            <RefreshCw size={14} className="animate-spin" /> 処理中...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">全{stats.total_meetings}件中 {jobs.length > 0 ? 1 : 0}-{jobs.length}件を表示</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>前へ</button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">次へ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
