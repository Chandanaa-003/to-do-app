import type { RefObject } from 'react';
import type { FilterState, Priority, SortBy, StatusFilter } from '../types/todo';
import { CloseIcon, SearchIcon } from './Icons';

interface FilterBarProps {
  filters: FilterState;
  searchInputRef: RefObject<HTMLInputElement | null>;
  visibleCount: number;
  activeVisibleCount: number;
  completedTotalCount: number;
  onUpdateFilters: (patch: Partial<FilterState>) => void;
  onCompleteAllVisible: () => void;
  onClearCompleted: () => void;
}

const STATUS_TABS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export function FilterBar({
  filters,
  searchInputRef,
  visibleCount,
  activeVisibleCount,
  completedTotalCount,
  onUpdateFilters,
  onCompleteAllVisible,
  onClearCompleted,
}: FilterBarProps) {
  return (
    <section className="filter-bar" aria-label="Search, filter, and sort tasks">
      <div className="search-box">
        <SearchIcon className="search-icon" width={16} height={16} />
        <input
          ref={searchInputRef}
          type="search"
          className="search-input"
          placeholder="Search tasks, notes, tags… (/)"
          value={filters.search}
          onChange={(e) => onUpdateFilters({ search: e.target.value })}
          aria-label="Search tasks"
        />
        {filters.search && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onUpdateFilters({ search: '' })}
            aria-label="Clear search"
          >
            <CloseIcon width={14} height={14} />
          </button>
        )}
      </div>

      <div className="filter-controls">
        {filters.view !== 'completed' && (
          <div className="segmented-tabs" role="tablist" aria-label="Task status filter">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filters.status === tab.id}
                className={`segmented-tab ${filters.status === tab.id ? 'segmented-tab--active' : ''}`}
                onClick={() => onUpdateFilters({ status: tab.id })}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="filter-selects">
          <select
            className="control-select"
            aria-label="Filter by priority"
            value={filters.priority}
            onChange={(e) =>
              onUpdateFilters({ priority: e.target.value as Priority | 'all' })
            }
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>

          <select
            className="control-select"
            aria-label="Sort tasks by"
            value={filters.sortBy}
            onChange={(e) => onUpdateFilters({ sortBy: e.target.value as SortBy })}
          >
            <option value="manual">Sort: Manual order</option>
            <option value="dueDate">Sort: Due date</option>
            <option value="priority">Sort: Priority</option>
            <option value="createdAt">Sort: Newest</option>
            <option value="title">Sort: Alphabetical</option>
          </select>
        </div>

        <div className="bulk-actions">
          {visibleCount > 0 && activeVisibleCount > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={onCompleteAllVisible}
            >
              Complete all ({activeVisibleCount})
            </button>
          )}
          {completedTotalCount > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-danger-text"
              onClick={onClearCompleted}
            >
              Clear completed ({completedTotalCount})
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
