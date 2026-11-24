export type Priority = 'low' | 'medium' | 'high';

export type SmartView = 'all' | 'today' | 'upcoming' | 'high' | 'completed';

export type StatusFilter = 'all' | 'active' | 'completed';

export type SortBy = 'manual' | 'dueDate' | 'priority' | 'createdAt' | 'title';

export type ThemeMode = 'light' | 'dark';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null; // YYYY-MM-DD in local time
  category: string;
  subtasks: Subtask[];
  createdAt: string; // ISO timestamp
  completedAt: string | null;
}

export interface TaskDraft {
  title: string;
  notes?: string;
  priority?: Priority;
  dueDate?: string | null;
  category?: string;
  subtasks?: Subtask[];
}

export interface FilterState {
  view: SmartView;
  status: StatusFilter;
  category: string | null;
  priority: Priority | 'all';
  search: string;
  sortBy: SortBy;
}

export interface TaskCounts {
  all: number;
  today: number;
  upcoming: number;
  high: number;
  completed: number;
  active: number;
  overdue: number;
  byCategory: Record<string, number>;
}
