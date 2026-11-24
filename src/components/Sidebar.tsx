import { useRef, type ChangeEvent } from 'react';
import type { SmartView, TaskCounts, ThemeMode } from '../types/todo';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  DownloadIcon,
  FlagIcon,
  InboxIcon,
  MoonIcon,
  RotateCcwIcon,
  SunIcon,
  TagIcon,
  UploadIcon,
} from './Icons';

interface SidebarProps {
  activeView: SmartView;
  activeCategory: string | null;
  categories: string[];
  counts: TaskCounts;
  theme: ThemeMode;
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: SmartView) => void;
  onSelectCategory: (category: string | null) => void;
  onToggleTheme: () => void;
  onExport: () => void;
  onImport: (jsonText: string) => void;
  onResetSample: () => void;
}

const VIEW_ITEMS: Array<{
  id: SmartView;
  label: string;
  icon: typeof InboxIcon;
}> = [
  { id: 'all', label: 'All Tasks', icon: InboxIcon },
  { id: 'today', label: 'Today', icon: CalendarIcon },
  { id: 'upcoming', label: 'Upcoming', icon: ClockIcon },
  { id: 'high', label: 'High Priority', icon: FlagIcon },
  { id: 'completed', label: 'Completed', icon: CheckCircleIcon },
];

export function Sidebar({
  activeView,
  activeCategory,
  categories,
  counts,
  theme,
  isOpen,
  onClose,
  onSelectView,
  onSelectCategory,
  onToggleTheme,
  onExport,
  onImport,
  onResetSample,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImport(reader.result);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getCount = (view: SmartView): number => {
    switch (view) {
      case 'all':
        return counts.active;
      case 'today':
        return counts.today;
      case 'upcoming':
        return counts.upcoming;
      case 'high':
        return counts.high;
      case 'completed':
        return counts.completed;
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
        aria-label="Task navigation and filters"
      >
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <CheckCircleIcon width={20} height={20} />
            </span>
            <div>
              <h1 className="brand-title">TaskFlow</h1>
              <p className="brand-subtitle">Stay focused &amp; organized</p>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <nav className="sidebar-section" aria-label="Smart views">
          <h2 className="sidebar-heading">Views</h2>
          <ul className="nav-list">
            {VIEW_ITEMS.map(({ id, label, icon: Icon }) => {
              const isSelected = activeView === id && activeCategory === null;
              const badge = getCount(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`nav-item ${isSelected ? 'nav-item--active' : ''}`}
                    onClick={() => {
                      onSelectView(id);
                      onSelectCategory(null);
                      onClose();
                    }}
                    aria-current={isSelected ? 'page' : undefined}
                  >
                    <span className="nav-item-label">
                      <Icon width={16} height={16} />
                      <span>{label}</span>
                    </span>
                    {badge > 0 && (
                      <span
                        className={`nav-badge ${
                          id === 'today' && counts.overdue > 0 ? 'nav-badge--alert' : ''
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-section">
          <div className="sidebar-heading-row">
            <h2 className="sidebar-heading">Categories</h2>
            {activeCategory && (
              <button
                type="button"
                className="text-btn"
                onClick={() => onSelectCategory(null)}
              >
                Clear
              </button>
            )}
          </div>
          <ul className="nav-list">
            {categories.map((category) => {
              const isSelected = activeCategory === category;
              const count = counts.byCategory[category] ?? 0;
              return (
                <li key={category}>
                  <button
                    type="button"
                    className={`nav-item ${isSelected ? 'nav-item--active' : ''}`}
                    onClick={() => {
                      onSelectCategory(isSelected ? null : category);
                      if (activeView === 'completed') onSelectView('all');
                      onClose();
                    }}
                  >
                    <span className="nav-item-label">
                      <TagIcon width={15} height={15} />
                      <span>{category}</span>
                    </span>
                    {count > 0 && <span className="nav-badge">{count}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-action-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="sidebar-data-actions">
            <button
              type="button"
              className="sidebar-action-btn"
              onClick={onExport}
              title="Export tasks as JSON"
            >
              <DownloadIcon width={15} height={15} />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="sidebar-action-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Import tasks from JSON"
            >
              <UploadIcon width={15} height={15} />
              <span>Import</span>
            </button>

            <button
              type="button"
              className="sidebar-action-btn"
              onClick={onResetSample}
              title="Restore sample starter tasks"
            >
              <RotateCcwIcon width={15} height={15} />
              <span>Reset</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Import tasks JSON file"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
