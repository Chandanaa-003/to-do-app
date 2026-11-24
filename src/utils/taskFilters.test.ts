import { describe, expect, it } from 'vitest';
import type { FilterState, Task } from '../types/todo';
import { formatDueDate, getDueStatus } from './date';
import { parseImportedTasks } from './storage';
import { computeTaskCounts, filterTasks, sortTasks } from './taskFilters';

const TODAY = '2026-11-24';

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Submit quarterly report',
    notes: 'Include Q4 projections',
    completed: false,
    priority: 'high',
    dueDate: '2026-11-23', // overdue
    category: 'Work',
    subtasks: [{ id: 's1', title: 'Export metrics', completed: true }],
    createdAt: '2026-11-20T10:00:00.000Z',
    completedAt: null,
  },
  {
    id: '2',
    title: 'Buy coffee beans',
    notes: '',
    completed: false,
    priority: 'medium',
    dueDate: TODAY,
    category: 'Errands',
    subtasks: [],
    createdAt: '2026-11-21T10:00:00.000Z',
    completedAt: null,
  },
  {
    id: '3',
    title: 'Book dentist appointment',
    notes: 'Call morning desk',
    completed: false,
    priority: 'low',
    dueDate: '2026-11-27',
    category: 'Health',
    subtasks: [],
    createdAt: '2026-11-22T10:00:00.000Z',
    completedAt: null,
  },
  {
    id: '4',
    title: 'Clean desk setup',
    notes: '',
    completed: true,
    priority: 'low',
    dueDate: '2026-11-20',
    category: 'Personal',
    subtasks: [],
    createdAt: '2026-11-19T10:00:00.000Z',
    completedAt: '2026-11-20T12:00:00.000Z',
  },
];

const BASE_FILTERS: FilterState = {
  view: 'all',
  status: 'all',
  category: null,
  priority: 'all',
  search: '',
  sortBy: 'manual',
};

describe('date helpers', () => {
  it('computes due status relative to today', () => {
    expect(getDueStatus('2026-11-23', false, TODAY)).toBe('overdue');
    expect(getDueStatus('2026-11-23', true, TODAY)).toBe('upcoming');
    expect(getDueStatus(TODAY, false, TODAY)).toBe('today');
    expect(getDueStatus('2026-11-25', false, TODAY)).toBe('tomorrow');
    expect(getDueStatus('2026-11-29', false, TODAY)).toBe('upcoming');
    expect(getDueStatus(null, false, TODAY)).toBe('none');
  });

  it('formats relative dates cleanly', () => {
    expect(formatDueDate(TODAY, TODAY)).toBe('Today');
    expect(formatDueDate('2026-11-25', TODAY)).toBe('Tomorrow');
    expect(formatDueDate('2026-11-23', TODAY)).toBe('Yesterday');
  });
});

describe('computeTaskCounts', () => {
  it('aggregates view, overdue, and category counts', () => {
    const counts = computeTaskCounts(SAMPLE_TASKS, TODAY);
    expect(counts.all).toBe(4);
    expect(counts.active).toBe(3);
    expect(counts.completed).toBe(1);
    expect(counts.today).toBe(2); // overdue + due today
    expect(counts.upcoming).toBe(1);
    expect(counts.high).toBe(1);
    expect(counts.overdue).toBe(1);
    expect(counts.byCategory).toEqual({
      Work: 1,
      Errands: 1,
      Health: 1,
    });
  });
});

describe('filterTasks & sortTasks', () => {
  it('filters by smart view and search text across title, notes, and subtasks', () => {
    expect(
      filterTasks(SAMPLE_TASKS, { ...BASE_FILTERS, view: 'today' }, TODAY).map((t) => t.id)
    ).toEqual(['1', '2']);

    expect(
      filterTasks(SAMPLE_TASKS, { ...BASE_FILTERS, view: 'upcoming' }, TODAY).map((t) => t.id)
    ).toEqual(['3']);

    expect(
      filterTasks(SAMPLE_TASKS, { ...BASE_FILTERS, search: 'metrics' }, TODAY).map((t) => t.id)
    ).toEqual(['1']);

    expect(
      filterTasks(SAMPLE_TASKS, { ...BASE_FILTERS, category: 'Errands' }, TODAY).map((t) => t.id)
    ).toEqual(['2']);
  });

  it('sorts by priority and due date while keeping completed tasks last', () => {
    const byPriority = sortTasks(SAMPLE_TASKS, 'priority', TODAY);
    expect(byPriority.map((t) => t.id)).toEqual(['1', '2', '3', '4']);

    const byTitle = sortTasks(SAMPLE_TASKS, 'title', TODAY);
    expect(byTitle.map((t) => t.id)).toEqual(['3', '2', '1', '4']);
  });
});

describe('parseImportedTasks', () => {
  it('normalizes valid JSON arrays and rejects invalid payloads', () => {
    const parsed = parseImportedTasks(
      JSON.stringify([{ title: 'New task', priority: 'high', dueDate: '2026-12-01' }])
    );
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('New task');
    expect(parsed[0].priority).toBe('high');
    expect(parsed[0].category).toBe('Personal');

    expect(() => parseImportedTasks('{"notAnArray": true}')).toThrow();
  });
});
