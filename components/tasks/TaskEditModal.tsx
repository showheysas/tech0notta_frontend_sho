'use client';

import { useState } from 'react';
import { Task, TaskUpdate, TaskStatus, TaskPriority } from '@/lib/types/task';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskUpdate) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export default function TaskEditModal({ task, isOpen, onClose, onSave, onDelete }: TaskEditModalProps) {
  const [form, setForm] = useState<TaskUpdate>({
    title: task?.title,
    description: task?.description,
    assignee: task?.assignee,
    dueDate: task?.dueDate,
    status: task?.status,
    priority: task?.priority,
  });

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
        <h3 className="text-lg font-bold">タスク編集</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700">タイトル *</label>
          <input type="text" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">ステータス</label>
          <select value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="未着手">未着手</option>
            <option value="進行中">進行中</option>
            <option value="完了">完了</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">優先度</label>
          <select value={form.priority || ''} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">期限 *</label>
          <input type="date" value={form.dueDate || ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div className="flex justify-between">
          <button onClick={() => onDelete(task.id)} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">削除</button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">キャンセル</button>
            <button onClick={() => onSave(form)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
