export type TaskStatus = '未着手' | '進行中' | '完了';
export type TaskPriority = '高' | '中' | '低';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  projectName: string;
  meetingId: string;
  parentTaskId?: string;
  subtaskCount: number;
  completedSubtaskCount: number;
  isOverdue: boolean;
  completionDate?: string;
  notionPageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  assignee?: string;
  dueDate: string;
  priority?: TaskPriority;
  subtasks?: SubTaskCreate[];
}

export interface SubTaskCreate {
  title: string;
  description?: string;
  order: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface ExtractedTask {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  isAbstract: boolean;
  subtasks?: SubTask[];
}

export interface SubTask {
  title: string;
  description?: string;
  order: number;
}

export interface TaskFilters {
  dueDateRange?: 'today' | 'thisWeek' | 'thisMonth' | 'overdue';
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  projectId?: string;
}
