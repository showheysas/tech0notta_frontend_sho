/**
 * ホーム画面
 * 
 * アプリケーションのトップページです。ユーザーはここで以下のことができます：
 * 1. 会議ステータスの概況（統計）の確認
 * 2. Botを会議に参加させる
 * 3. 過去の会議履歴の確認と管理
 */
'use client';

import Link from 'next/link';
import { Users, FileCheck, CheckCircle2, Search, Filter, Video, Edit3, ExternalLink, RefreshCw, Star, MoreVertical, Activity } from 'lucide-react';
import { Card, Badge, Tooltip } from '@/components/ui';
import { MOCK_MEETINGS } from '@/lib/constants/mockData';
import { MeetingStatus } from '@/lib/types';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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

export default function DashboardPage() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats>({ total_meetings: 0, pending_approval: 0, synced_notion: 0 });

  // JobStatus mapping to MeetingStatus for Badge component
  const getBadgeStatus = (status: string): MeetingStatus => {
    switch (status) {
      case 'completed': return MeetingStatus.SYNCED;
      case 'summarized': return MeetingStatus.PENDING; // Treat summarized as pending review per plan
      case 'transcribing':
      case 'summarizing':
      case 'uploading':
      case 'creating_notion': return MeetingStatus.PROCESSING;
      case 'failed': return MeetingStatus.FAILED;
      default: return MeetingStatus.PENDING;
    }
  };

  const fetchJobsAndStats = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/jobs?limit=5`),
        fetch(`${API_BASE_URL}/api/jobs/stats`)
      ]);

      if (jobsRes.ok && statsRes.ok) {
        const jobsData = await jobsRes.json();
        const statsData = await statsRes.json();
        setJobs(jobsData);
        setStats(statsData);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    }
  };

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bot/sessions`);
        if (response.ok) {
          const sessions = await response.json();
          if (sessions.length > 0) {
            // 最初のアクティブなセッションを使用
            setActiveSession(sessions[0].id);
          } else {
            setActiveSession(null);
          }
        }
      } catch (e) {
        console.error('Failed to fetch sessions', e);
      }
    };

    // 初期実行とポーリング
    checkActiveSession();
    // 初期実行とポーリング
    checkActiveSession();
    fetchJobsAndStats();
    const interval = setInterval(() => {
      checkActiveSession();
      fetchJobsAndStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-fade-in overflow-hidden">

      {/* 
        ヘッダーエリア 
        - 左側: ページタイトルと説明
        - 右側: 「Botを会議に参加させる」ボタン (/join へ遷移)
      */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">ホーム</h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">議事録作成ステータス、Notion同期状況を確認できます。</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* アクティブなセッションがある場合のライブモニタリング表示 */}
          {activeSession && (
            <Link
              href="/live"
              className="px-4 py-2 bg-red-50 text-red-600 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-colors animate-pulse border border-red-100"
            >
              <Activity size={16} />
              ライブモニタリング
            </Link>
          )}

          <Link
            href="/join"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-action-600 hover:bg-action-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            <Video size={18} />
            Tech Botを会議に参加させる
          </Link>
        </div>
      </div>


      {/* 
        統計カードエリア (Stats Cards)
        - 3つの重要指標を表示します
        1. 総会議数
        2. 議事録承認待ち（アクションが必要なもの）
        3. Notion同期済み（完了したもの）
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* カード1: 総会議数 */}
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Users size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">総会議数</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.total_meetings}</p>
        </Card>

        {/* カード2: 議事録承認待ち */}
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50 text-action-600">
              <FileCheck size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">議事録 承認待ち</span>
          </div>
          <p className="text-3xl font-bold text-action-600">{stats.pending_approval}</p>
        </Card>

        {/* カード3: Notion同期済み */}
        <Card className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Notion 同期済み</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{stats.synced_notion}</p>
        </Card>
      </div>


      {/* 
        テーブルエリア  
        - 最近行われた会議の一覧を表示するカードコンポーネント。
      */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <h3 className="font-bold text-slate-900 w-full sm:w-auto text-left">最近の会議</h3>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* テーブル */}
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

              {/* 
                会議データのリストレンダリング
                MOCK_MEETINGS配列をループして、各行（tr）を生成します。
              */}
              {jobs.map((job) => {
                const status = getBadgeStatus(job.status);
                return (
                  <tr key={job.job_id} className="group hover:bg-slate-50 transition-colors">

                    {/* 会議名カラム */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <span>{job.filename}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip content="名前を変更">
                          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors">
                            <Edit3 size={16} />
                          </button>
                        </Tooltip >
                        <Tooltip content="お気に入り">
                          <button className="p-1.5 text-slate-500 hover:text-yellow-500 hover:bg-slate-200 rounded-md transition-colors">
                            <Star size={16} />
                          </button>
                        </Tooltip>
                        <Tooltip content="その他">
                          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>

                    {/* 日時カラム */}
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {(() => {
                        const dateStr = job.created_at;
                        // UTCとして解釈させるためにZを付与（すでにTimeZone情報がある場合を除く）
                        const date = new Date(dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`);
                        return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
                      })()}
                    </td>

                    {/* ステータスカラム */}
                    <td className="px-6 py-4"><Badge status={status} /></td>

                    {/* アクションカラム */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 
                         ステータス別の条件分岐レンダリング (Conditional Rendering)
                      */}

                        {/* ステータス: 承認待ち (PENDING) -> 確認画面へのリンクを表示 */}
                        {status === MeetingStatus.PENDING && (
                          <Link
                            href={`/review/${job.job_id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-action-50 hover:bg-action-100 text-action-700 font-medium rounded-lg text-xs transition-colors"
                          >
                            <Edit3 size={14} />
                            確認と同期
                          </Link>
                        )}

                        {/* ステータス: 同期完了 (SYNCED) -> Notionへのリンクを表示 */}
                        {status === MeetingStatus.SYNCED && job.notion_page_url && (
                          <a
                            href={job.notion_page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-medium text-xs transition-colors"
                          >
                            <ExternalLink size={14} />
                            Notionで表示
                          </a>
                        )}

                        {/* ステータス: 処理中 (PROCESSING) -> ローディング表示 */}
                        {status === MeetingStatus.PROCESSING && (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs animate-pulse">
                            <RefreshCw size={14} className="animate-spin" />
                            解析中...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            全{stats.total_meetings}件中 {jobs.length > 0 ? 1 : 0}-{jobs.length}件を表示
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>前へ</button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">次へ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
