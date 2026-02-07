'use client';

import { Task, TaskFilters, TaskStatus } from '@/lib/types/task';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  onTaskClick: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskList({ tasks, filters, onFilterChange, onTaskClick, onStatusChange }: TaskListProps) {
  return (
    <div className="space-y-4">
      {/* TODO: フィルターバー */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-slate-500 text-center py-8">タスクがありません</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))
        )}
      </div>
    </div>
  );
}
