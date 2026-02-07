'use client';

import { Task } from '@/lib/types/task';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityColors = { '高': 'text-red-600 bg-red-50', '中': 'text-yellow-600 bg-yellow-50', '低': 'text-slate-600 bg-slate-50' };
const statusColors = { '未着手': 'bg-slate-100 text-slate-700', '進行中': 'bg-blue-100 text-blue-700', '完了': 'bg-emerald-100 text-emerald-700' };

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const progress = task.subtaskCount > 0 ? Math.round((task.completedSubtaskCount / task.subtaskCount) * 100) : 0;

  return (
    <div onClick={onClick} className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-shadow ${task.isOverdue ? 'border-red-300' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-slate-900">{task.title}</p>
          <p className="text-xs text-slate-500 mt-1">{task.projectName} · {task.assignee || '未割り当て'}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>{task.status}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <span className={task.isOverdue ? 'text-red-600 font-medium' : ''}>期限: {task.dueDate}</span>
        {task.subtaskCount > 0 && <span>進捗: {progress}% ({task.completedSubtaskCount}/{task.subtaskCount})</span>}
      </div>
    </div>
  );
}
