'use client';

import { useState, useEffect } from 'react';
import { Task, TaskFilters } from '@/lib/types/task';
import { getTasks } from '@/lib/api/tasks';
import TaskList from '@/components/tasks/TaskList';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks(filters)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <div className="p-8 text-slate-500">読み込み中...</div>;

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">プロジェクトタスク</h2>
        <p className="text-slate-500 mt-1 text-sm">プロジェクト全体のタスク管理</p>
      </div>
      <TaskList tasks={tasks} filters={filters} onFilterChange={setFilters} onTaskClick={() => {}} onStatusChange={() => {}} />
    </div>
  );
}
