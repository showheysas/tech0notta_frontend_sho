'use client';

import React, { useState } from 'react';
import { Clock, Star, User, Users, FileText, Trash2, ChevronDown, Video, Mic } from 'lucide-react';

// フィルターカテゴリの型定義
type FilterCategory = 'recent' | 'favorites' | 'mine' | 'others' | 'all' | 'trash';

// 会議データの型定義
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 会議データの型定義 (APIレスポンス用)
interface Job {
  id: number;
  job_id: string;
  filename: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
  duration?: number; // 秒単位
  last_viewed_at?: string;
  // TODO: 作成者情報は認証機能実装後に追加
  creator?: {
    name: string;
    initial: string;
  };
}

const API_BASE_URL = 'http://127.0.0.1:8000';

// フィルターメニューアイテム
const FILTER_ITEMS = [
  { id: 'recent' as FilterCategory, label: '最近のアクセス', icon: Clock },
  { id: 'favorites' as FilterCategory, label: 'お気に入り', icon: Star },
  { id: 'mine' as FilterCategory, label: '自分が作成者', icon: User },
  { id: 'others' as FilterCategory, label: '自分以外が作成者', icon: Users },
  { id: 'all' as FilterCategory, label: 'すべてのノート', icon: FileText },
  { id: 'trash' as FilterCategory, label: 'ゴミ箱', icon: Trash2 },
];

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('recent');
  const activeFilterItem = FILTER_ITEMS.find(item => item.id === activeFilter);
  const [jobs, setJobs] = useState<Job[]>([]);

  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        // 現在はすべてのジョブを取得するが、将来的にはフィルタリングパラメータを追加
        // TODO: フィルタリングの実装
        const response = await fetch(`${API_BASE_URL}/api/jobs?limit=50`);
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        }
      } catch (e) {
        console.error("Failed to fetch history", e);
      }
    };

    fetchJobs();
  }, [activeFilter]);

  // 秒数をフォーマットする関数 (例: 125 -> 2分5秒)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}秒`;
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 日時フォーマット
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    // UTCとして解釈させるためにZを付与（すでにTimeZone情報がある場合を除く）
    const date = new Date(dateString.endsWith('Z') || dateString.includes('+') ? dateString : `${dateString}Z`);
    return format(date, 'yyyy/MM/dd HH:mm', { locale: ja });
  };

  // 会議タイプに応じたアイコンを返す
  // 会議タイプに応じたアイコンを返す (現状は判別不能なためデフォルトを返すロジック等は要検討)
  // 仮実装: すべて recording 扱い、あるいはファイル名等で判断
  const getMeetingIcon = (job: Job) => {
    // 簡易的な判別ロジック
    if (job.filename.toLowerCase().includes('zoom')) {
      return <Video size={16} className="text-action-600" />;
    } else if (job.filename.toLowerCase().includes('meet')) {
      return <Video size={16} className="text-emerald-600" />;
    }
    return <Mic size={16} className="text-slate-500" />;
  };

  return (
    <div className="flex h-full animate-fade-in">
      {/* フィルターサイドバー */}
      <div className="w-56 border-r border-slate-200 bg-white p-4 hidden md:block">
        <nav className="space-y-1">
          {FILTER_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveFilter(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-action-50 text-action-600'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 p-6 overflow-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          {activeFilterItem && (
            <>
              <activeFilterItem.icon size={24} className="text-slate-400" />
              <h1 className="text-xl font-bold text-slate-900">{activeFilterItem.label}</h1>
            </>
          )}
        </div>

        {/* フィルタードロップダウン */}
        <div className="mb-4">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            すべての種類
            <ChevronDown size={16} />
          </button>
        </div>

        {/* 会議リストテーブル */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* テーブルヘッダー */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-100 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div className="col-span-5"></div>
            <div className="col-span-2 text-center">長さ</div>
            <div className="col-span-3 text-center">自分の最終閲覧</div>
            <div className="col-span-2 text-center">作成者</div>
          </div>

          {/* テーブルボディ */}
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {/* タイトル */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    {getMeetingIcon(job)}
                  </div>
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {job.filename}
                  </span>
                </div>

                {/* 長さ */}
                <div className="col-span-2 text-center text-sm text-slate-500">
                  {formatDuration(job.duration)}
                </div>

                {/* 最終閲覧 (現状は created_at を代用、本来は last_viewed_at) */}
                <div className="col-span-3 text-center text-sm text-slate-500">
                  {formatDate(job.last_viewed_at || job.created_at)}
                </div>

                {/* 作成者 (ダミー) */}
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">
                    あ
                  </div>
                  <span className="text-sm text-slate-600">あゆ</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 空状態 */}
        {jobs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <p>会議履歴がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
