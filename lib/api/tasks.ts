import { Task, TaskCreate, TaskUpdate, ExtractedTask, SubTask, TaskFilters } from '../types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getTasks(filters?: TaskFilters, sortBy = 'due_date', sortOrder = 'asc'): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set('project_id', filters.projectId);
  if (filters?.assignee) params.set('assignee', filters.assignee);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priority) params.set('priority', filters.priority);
  params.set('sort_by', sortBy);
  params.set('sort_order', sortOrder);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_URL}/api/tasks${query}`);
  if (!res.ok) throw new Error('タスク一覧の取得に失敗しました');
  return res.json();
}

export async function getTask(taskId: string): Promise<Task> {
  const res = await fetch(`${API_URL}/api/tasks/${taskId}`);
  if (!res.ok) throw new Error('タスク情報の取得に失敗しました');
  return res.json();
}

export async function updateTask(taskId: string, data: TaskUpdate): Promise<Task> {
  const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('タスクの更新に失敗しました');
  return res.json();
}

export async function deleteTask(taskId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('タスクの削除に失敗しました');
}

export async function extractTasks(jobId: string, summary: string, meetingDate: string): Promise<{ job_id: string; tasks: ExtractedTask[] }> {
  const res = await fetch(`${API_URL}/api/tasks/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, summary, meeting_date: meetingDate }),
  });
  if (!res.ok) throw new Error('タスク抽出に失敗しました');
  return res.json();
}

export async function decomposeTasks(taskTitle: string, taskDescription: string | undefined, parentDueDate: string): Promise<{ parent_task: string; subtasks: SubTask[] }> {
  const res = await fetch(`${API_URL}/api/tasks/decompose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_title: taskTitle, task_description: taskDescription, parent_due_date: parentDueDate }),
  });
  if (!res.ok) throw new Error('タスク分解に失敗しました');
  return res.json();
}

export async function registerTasks(jobId: string, projectId: string, tasks: TaskCreate[]): Promise<{ job_id: string; registered_count: number; task_ids: string[] }> {
  const res = await fetch(`${API_URL}/api/tasks/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, project_id: projectId, tasks }),
  });
  if (!res.ok) throw new Error('タスク登録に失敗しました');
  return res.json();
}
