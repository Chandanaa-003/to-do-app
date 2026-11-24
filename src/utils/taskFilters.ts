import type { FilterState, Priority, SortBy, Task, TaskCounts } from '../types/todo';
import { getTodayIso, isOverdue } from './date';

const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function computeTaskCounts(tasks: Task[], todayIso: string = getTodayIso()): TaskCounts {
  const byCategory: Record<string, number> = {};
  let today = 0;
  let upcoming = 0;
  let high = 0;
  let completed = 0;
  let active = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed += 1;
    } else {
      active += 1;
      if (task.priority === 'high') high += 1;
      if (task.dueDate) {
        if (task.dueDate <= todayIso) today += 1;
        else upcoming += 1;
        if (task.dueDate < todayIso) overdue += 1;
      }
    }

    if (!task.completed && task.category) {
      byCategory[task.category] = (byCategory[task.category] ?? 0) + 1;
    }
  }

  return {
    all: tasks.length,
    today,
    upcoming,
    high,
    completed,
    active,
    overdue,
    byCategory,
  };
}

export function filterTasks(
  tasks: Task[],
  filters: FilterState,
  todayIso: string = getTodayIso()
): Task[] {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    // Smart view filter
    switch (filters.view) {
      case 'today':
        if (task.completed) return false;
        if (!task.dueDate || task.dueDate > todayIso) return false;
        break;
      case 'upcoming':
        if (task.completed) return false;
        if (!task.dueDate || task.dueDate <= todayIso) return false;
        break;
      case 'high':
        if (task.completed || task.priority !== 'high') return false;
        break;
      case 'completed':
        if (!task.completed) return false;
        break;
      case 'all':
      default:
        break;
    }

    // Status tab filter (applies when not already locked by 'completed' view)
    if (filters.view !== 'completed') {
      if (filters.status === 'active' && task.completed) return false;
      if (filters.status === 'completed' && !task.completed) return false;
    }

    // Category filter
    if (filters.category && task.category !== filters.category) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Search query
    if (query) {
      const inTitle = task.title.toLowerCase().includes(query);
      const inNotes = task.notes.toLowerCase().includes(query);
      const inCategory = task.category.toLowerCase().includes(query);
      const inSubtasks = task.subtasks.some((s) => s.title.toLowerCase().includes(query));
      if (!inTitle && !inNotes && !inCategory && !inSubtasks) {
        return false;
      }
    }

    return true;
  });
}

export function sortTasks(tasks: Task[], sortBy: SortBy, todayIso: string = getTodayIso()): Task[] {
  if (sortBy === 'manual') {
    return tasks;
  }

  return [...tasks].sort((a, b) => {
    // Keep completed tasks after active tasks in non-manual sorts
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    switch (sortBy) {
      case 'dueDate': {
        if (!a.dueDate && !b.dueDate) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const aOverdue = isOverdue(a.dueDate, a.completed, todayIso);
        const bOverdue = isOverdue(b.dueDate, b.completed, todayIso);
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      }
      case 'priority': {
        const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (diff !== 0) return diff;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.createdAt.localeCompare(a.createdAt);
      }
      case 'title':
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      case 'createdAt':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}
