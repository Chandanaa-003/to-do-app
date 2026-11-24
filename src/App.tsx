import { useEffect, useRef, useState } from 'react';
import { FilterBar } from './components/FilterBar';
import { CheckCircleIcon, MenuIcon } from './components/Icons';
import { QuickAdd } from './components/QuickAdd';
import { Sidebar } from './components/Sidebar';
import { TaskItem } from './components/TaskItem';
import { TaskModal } from './components/TaskModal';
import { Toast } from './components/Toast';
import { useTheme } from './hooks/useTheme';
import { useTodoStore } from './hooks/useTodoStore';
import type { SmartView, Task } from './types/todo';

const VIEW_TITLES: Record<SmartView, { title: string; subtitle: string }> = {
  all: { title: 'All Tasks', subtitle: 'Everything on your plate' },
  today: { title: 'Today', subtitle: 'Due today and overdue items' },
  upcoming: { title: 'Upcoming', subtitle: 'Scheduled for the days ahead' },
  high: { title: 'High Priority', subtitle: 'Your most important work' },
  completed: { title: 'Completed', subtitle: 'Finished tasks & wins' },
};

export function App() {
  const { theme, toggleTheme } = useTheme();
  const {
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
  } = useTodoStore();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const quickAddInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (e.key === 'Escape') {
        if (editingTask) {
          setEditingTask(null);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        } else if (filters.search) {
          setFilters((prev) => ({ ...prev, search: '' }));
        }
        return;
      }

      if (isTyping || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        quickAddInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editingTask, sidebarOpen, filters.search, setFilters]);

  const handleExport = () => {
    const payload = JSON.stringify(tasks, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (jsonText: string) => {
    try {
      setImportError(null);
      importTasks(jsonText, 'merge');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Unable to import JSON file.');
    }
  };

  const activeVisibleIds = visibleTasks.filter((t) => !t.completed).map((t) => t.id);
  const visibleIds = visibleTasks.map((t) => t.id);
  const canReorder = filters.sortBy === 'manual';

  const completionPercent =
    counts.all > 0 ? Math.round((counts.completed / counts.all) * 100) : 0;

  const heading = filters.category
    ? { title: filters.category, subtitle: 'Filtered by category' }
    : VIEW_TITLES[filters.view];

  return (
    <div className="app-shell">
      <Sidebar
        activeView={filters.view}
        activeCategory={filters.category}
        categories={categories}
        counts={counts}
        theme={theme}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectView={(view) => setFilters((prev) => ({ ...prev, view }))}
        onSelectCategory={(category) => setFilters((prev) => ({ ...prev, category }))}
        onToggleTheme={toggleTheme}
        onExport={handleExport}
        onImport={handleImport}
        onResetSample={resetToSample}
      />

      <main className="main-content">
        <header className="page-header">
          <div className="page-header-left">
            <button
              type="button"
              className="icon-btn mobile-only"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <MenuIcon width={20} height={20} />
            </button>
            <div>
              <h2 className="page-title">{heading.title}</h2>
              <p className="page-subtitle">{heading.subtitle}</p>
            </div>
          </div>

          <div className="stats-pill" aria-label="Task completion progress">
            <div className="stats-text">
              <span className="stats-count">
                {counts.completed}/{counts.all} done
              </span>
              {counts.overdue > 0 && (
                <span className="stats-overdue">{counts.overdue} overdue</span>
              )}
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow={completionPercent} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="progress-fill"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </header>

        {importError && (
          <div className="alert-banner" role="alert">
            <span>{importError}</span>
            <button
              type="button"
              className="text-btn"
              onClick={() => setImportError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <QuickAdd
          inputRef={quickAddInputRef}
          categories={categories}
          defaultCategory={filters.category}
          onAdd={(draft) => {
            addTask(draft);
            if (filters.view === 'completed') {
              setFilters((prev) => ({ ...prev, view: 'all' }));
            }
          }}
        />

        <FilterBar
          filters={filters}
          searchInputRef={searchInputRef}
          visibleCount={visibleTasks.length}
          activeVisibleCount={activeVisibleIds.length}
          completedTotalCount={counts.completed}
          onUpdateFilters={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onCompleteAllVisible={() => completeAllVisible(activeVisibleIds)}
          onClearCompleted={clearCompleted}
        />

        {visibleTasks.length === 0 ? (
          <div className="empty-state">
            <CheckCircleIcon width={40} height={40} className="empty-icon" />
            <h3 className="empty-title">No tasks match this view</h3>
            <p className="empty-subtitle">
              {filters.search || filters.priority !== 'all' || filters.category
                ? 'Try clearing your active search or filters, or add a new task above.'
                : 'Add a task above using the quick-add bar to get started.'}
            </p>
            {(filters.search || filters.priority !== 'all' || filters.category || filters.status !== 'all') && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    status: 'all',
                    priority: 'all',
                    category: null,
                    search: '',
                  }))
                }
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <ul className="task-list" aria-label="Tasks">
            {visibleTasks.map((task, idx) => (
              <TaskItem
                key={task.id}
                task={task}
                canReorder={canReorder}
                isFirst={idx === 0}
                isLast={idx === visibleTasks.length - 1}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={setEditingTask}
                onToggleSubtask={toggleSubtask}
                onAddSubtask={addSubtask}
                onDeleteSubtask={deleteSubtask}
                onMoveStep={(id, dir) => moveTaskStep(id, dir, visibleIds)}
                onDragStart={setDraggedId}
                onDropOn={(targetId) => {
                  if (draggedId) {
                    reorderTasks(draggedId, targetId);
                    setDraggedId(null);
                  }
                }}
                isDragging={draggedId === task.id}
              />
            ))}
          </ul>
        )}

        <footer className="shortcuts-footer" aria-label="Keyboard shortcuts">
          <span>
            <kbd>N</kbd> New task
          </span>
          <span>
            <kbd>/</kbd> Search
          </span>
          <span>
            <kbd>Esc</kbd> Clear or close
          </span>
        </footer>
      </main>

      {editingTask && (
        <TaskModal
          task={editingTask}
          categories={categories}
          onSave={updateTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      <Toast toast={toast} onUndo={undoLastAction} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
