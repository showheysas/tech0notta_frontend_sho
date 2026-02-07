'use client';

import { ExtractedTask } from '@/lib/types/task';

interface TaskExtractPreviewProps {
  extractedTasks: ExtractedTask[];
  onApprove: (tasks: ExtractedTask[]) => Promise<void>;
  onEdit: (index: number, task: ExtractedTask) => void;
  onRemove: (index: number) => void;
  onAddTask: () => void;
}

export default function TaskExtractPreview({ extractedTasks, onApprove, onEdit, onRemove, onAddTask }: TaskExtractPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900">抽出されたタスク ({extractedTasks.length}件)</h3>
        <button onClick={onAddTask} className="text-sm text-blue-600 hover:text-blue-700">+ タスク追加</button>
      </div>
      <div className="space-y-2">
        {extractedTasks.map((task, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-900">{task.title}</p>
                {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
                <div className="flex gap-3 mt-2 text-xs text-slate-500">
                  <span>担当: {task.assignee || '未割り当て'}</span>
                  <span>期限: {task.dueDate || '未設定'}</span>
                  {task.isAbstract && <span className="text-amber-600">分解対象</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(i, task)} className="text-xs text-blue-600 hover:text-blue-700">編集</button>
                <button onClick={() => onRemove(i)} className="text-xs text-red-600 hover:text-red-700">削除</button>
              </div>
            </div>
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-3 pl-4 border-l-2 border-slate-200 space-y-1">
                {task.subtasks.map((st, j) => (
                  <p key={j} className="text-sm text-slate-600">{st.order}. {st.title}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => onApprove(extractedTasks)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">
        タスクを承認して登録
      </button>
    </div>
  );
}
