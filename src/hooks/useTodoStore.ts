import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FilterState, Subtask, Task, TaskDraft } from '../types/todo';
import {
  DEFAULT_CATEGORIES,
  createSeedTasks,
  generateId,
  loadTasks,
  parseImportedTasks,
  saveTasks,
} from '../utils/storage';
import { computeTaskCounts, filterTasks, sortTasks } from '../utils/taskFilters';

export interface ToastNotice {
  id: string;
  message: string;
  canUndo: boolean;
}

const INITIAL_FILTERS: FilterState = {
  view: 'all',
  status: 'all',
  category: null,
  priority: 'all',
  search: '',
  sortBy: 'manual',
};

export function useTodoStore() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [undoSnapshot, setUndoSnapshot] = useState<Task[] | null>(null);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast(null);
      setUndoSnapshot(null);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, snapshot: Task[] | null = null) => {
    setUndoSnapshot(snapshot);
    setToast({
      id: generateId(),
      message,
      canUndo: snapshot !== null,
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
    setUndoSnapshot(null);
  }, []);

  const undoLastAction = useCallback(() => {
    if (!undoSnapshot) return;
    setTasks(undoSnapshot);
    setUndoSnapshot(null);
    setToast(null);
  }, [undoSnapshot]);

  const addTask = useCallback((draft: TaskDraft): Task | null => {
    const title = draft.title.trim();
    if (!title) return null;

    const newTask: Task = {
      id: generateId(),
      title,
      notes: draft.notes?.trim() ?? '',
      completed: false,
      priority: draft.priority ?? 'medium',
      dueDate: draft.dueDate ?? null,
      category: draft.category?.trim() || 'Personal',
      subtasks: draft.subtasks ?? [],
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const nextCompleted = patch.completed ?? task.completed;
        let nextCompletedAt = task.completedAt;
        if (patch.completed !== undefined && patch.completed !== task.completed) {
          nextCompletedAt = patch.completed ? new Date().toISOString() : null;
        }
        return {
          ...task,
          ...patch,
          title: patch.title !== undefined ? patch.title.trim() || task.title : task.title,
          category:
            patch.category !== undefined
              ? patch.category.trim() || 'Personal'
              : task.category,
          completed: nextCompleted,
          completedAt: nextCompletedAt,
        };
      })
    );
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        };
      })
    );
  }, []);

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;
        showToast(`Deleted "${target.title}"`, prev);
        return prev.filter((t) => t.id !== id);
      });
    },
    [showToast]
  );

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((sub) =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          ),
        };
      })
    );
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    const sub: Subtask = { id: generateId(), title: clean, completed: false };
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, subtasks: [...task.subtasks, sub] } : task
      )
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, subtasks: task.subtasks.filter((s) => s.id !== subtaskId) }
          : task
      )
    );
  }, []);

  const reorderTasks = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setTasks((prev) => {
      const fromIndex = prev.findIndex((t) => t.id === sourceId);
      const toIndex = prev.findIndex((t) => t.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const moveTaskStep = useCallback((id: string, direction: -1 | 1, visibleIds: string[]) => {
    const visibleIndex = visibleIds.indexOf(id);
    if (visibleIndex === -1) return;
    const neighborId = visibleIds[visibleIndex + direction];
    if (!neighborId) return;

    setTasks((prev) => {
      const idxA = prev.findIndex((t) => t.id === id);
      const idxB = prev.findIndex((t) => t.id === neighborId);
      if (idxA === -1 || idxB === -1) return prev;
      const next = [...prev];
      [next[idxA], next[idxB]] = [next[idxB], next[idxA]];
      return next;
    });
  }, []);

  const completeAllVisible = useCallback((visibleIds: string[]) => {
    if (visibleIds.length === 0) return;
    const idSet = new Set(visibleIds);
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) =>
        idSet.has(task.id) && !task.completed
          ? { ...task, completed: true, completedAt: now }
          : task
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => {
      const completedCount = prev.filter((t) => t.completed).length;
      if (completedCount === 0) return prev;
      showToast(
        `Cleared ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}`,
        prev
      );
      return prev.filter((t) => !t.completed);
    });
  }, [showToast]);

  const resetToSample = useCallback(() => {
    setTasks((prev) => {
      showToast('Restored sample tasks', prev);
      return createSeedTasks();
    });
    setFilters(INITIAL_FILTERS);
  }, [showToast]);

  const importTasks = useCallback(
    (jsonText: string, mode: 'replace' | 'merge' = 'merge') => {
      const imported = parseImportedTasks(jsonText);
      setTasks((prev) => {
        showToast(
          `Imported ${imported.length} ${imported.length === 1 ? 'task' : 'tasks'}`,
          prev
        );
        if (mode === 'replace') return imported;
        const existingIds = new Set(prev.map((t) => t.id));
        const deduplicated = imported.map((t) =>
          existingIds.has(t.id) ? { ...t, id: generateId() } : t
        );
        return [...deduplicated, ...prev];
      });
    },
    [showToast]
  );

  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    for (const task of tasks) {
      if (task.category) set.add(task.category);
    }
    return Array.from(set);
  }, [tasks]);

  const counts = useMemo(() => computeTaskCounts(tasks), [tasks]);

  const visibleTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filters);
    return sortTasks(filtered, filters.sortBy);
  }, [tasks, filters]);

  return {
    tasks,
    visibleTasks,
    filters,
    setFilters,
    counts,
    categories,
    toast,
    dismissToast,
    undoLastAction,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    reorderTasks,
    moveTaskStep,
    completeAllVisible,
    clearCompleted,
    resetToSample,
    importTasks,
  };
}
