import type { Priority, Subtask, Task, ThemeMode } from '../types/todo';
import { addDaysIso, getTodayIso } from './date';

export const TASKS_STORAGE_KEY = 'taskflow.tasks.v1';
export const THEME_STORAGE_KEY = 'taskflow.theme.v1';
export const INITIALIZED_STORAGE_KEY = 'taskflow.initialized.v1';

export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Errands', 'Health', 'Learning'];

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSeedTasks(): Task[] {
  const today = getTodayIso();
  const tomorrow = addDaysIso(1);
  const nextWeek = addDaysIso(4);
  const now = new Date().toISOString();

  return [
    {
      id: generateId(),
      title: 'Review weekly priorities & plan sprint',
      notes: 'Break down deliverables into small, actionable subtasks before standup.',
      completed: false,
      priority: 'high',
      dueDate: today,
      category: 'Work',
      subtasks: [
        { id: generateId(), title: 'Audit open pull requests', completed: true },
        { id: generateId(), title: 'Update project timeline', completed: false },
      ],
      createdAt: now,
      completedAt: null,
    },
    {
      id: generateId(),
      title: 'Pick up groceries & coffee beans',
      notes: 'Whole bean espresso roast, oat milk, fresh berries, and spinach.',
      completed: false,
      priority: 'medium',
      dueDate: today,
      category: 'Errands',
      subtasks: [],
      createdAt: now,
      completedAt: null,
    },
    {
      id: generateId(),
      title: '30-minute evening run or mobility session',
      notes: '',
      completed: false,
      priority: 'low',
      dueDate: tomorrow,
      category: 'Health',
      subtasks: [],
      createdAt: now,
      completedAt: null,
    },
    {
      id: generateId(),
      title: 'Read TypeScript 5.8 release notes',
      notes: 'Focus on isolatedDeclarations and bundler module resolution updates.',
      completed: false,
      priority: 'medium',
      dueDate: nextWeek,
      category: 'Learning',
      subtasks: [],
      createdAt: now,
      completedAt: null,
    },
    {
      id: generateId(),
      title: 'Set up TaskFlow keyboard shortcuts',
      notes: 'Press N to add a task, / to search, and Escape to clear dialogs.',
      completed: true,
      priority: 'low',
      dueDate: null,
      category: 'Personal',
      subtasks: [],
      createdAt: now,
      completedAt: now,
    },
  ];
}

function isPriority(value: unknown): value is Priority {
  return value === 'low' || value === 'medium' || value === 'high';
}

function normalizeSubtasks(raw: unknown): Subtask[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      id: typeof item.id === 'string' && item.id.trim() ? item.id : generateId(),
      title: typeof item.title === 'string' ? item.title.trim() : '',
      completed: Boolean(item.completed),
    }))
    .filter((sub) => sub.title.length > 0);
}

export function normalizeTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const title = typeof obj.title === 'string' ? obj.title.trim() : '';
  if (!title) return null;

  const dueDate =
    typeof obj.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.dueDate)
      ? obj.dueDate
      : null;

  const completed = Boolean(obj.completed);
  const createdAt =
    typeof obj.createdAt === 'string' && obj.createdAt ? obj.createdAt : new Date().toISOString();

  return {
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id : generateId(),
    title,
    notes: typeof obj.notes === 'string' ? obj.notes : '',
    completed,
    priority: isPriority(obj.priority) ? obj.priority : 'medium',
    dueDate,
    category:
      typeof obj.category === 'string' && obj.category.trim() ? obj.category.trim() : 'Personal',
    subtasks: normalizeSubtasks(obj.subtasks),
    createdAt,
    completedAt:
      completed && typeof obj.completedAt === 'string'
        ? obj.completedAt
        : completed
          ? createdAt
          : null,
  };
}

export function loadTasks(): Task[] {
  try {
    const initialized = localStorage.getItem(INITIALIZED_STORAGE_KEY);
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);

    if (!raw) {
      if (!initialized) {
        const seed = createSeedTasks();
        saveTasks(seed);
        localStorage.setItem(INITIALIZED_STORAGE_KEY, '1');
        return seed;
      }
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeTask).filter((task): task is Task => task !== null);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(INITIALIZED_STORAGE_KEY, '1');
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export function parseImportedTasks(jsonText: string): Task[] {
  const parsed: unknown = JSON.parse(jsonText);
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { tasks?: unknown }).tasks)
      ? (parsed as { tasks: unknown[] }).tasks
      : null;

  if (!list) {
    throw new Error('Invalid JSON format. Expected an array of tasks.');
  }

  const normalized = list.map(normalizeTask).filter((task): task is Task => task !== null);
  if (normalized.length === 0 && list.length > 0) {
    throw new Error('No valid tasks were found in the imported file.');
  }

  return normalized;
}

export function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignore
  }

  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}
