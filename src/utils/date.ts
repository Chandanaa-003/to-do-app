/**
 * Formats a Date object as a local YYYY-MM-DD string.
 */
export function toLocalIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayIso(): string {
  return toLocalIsoDate(new Date());
}

export function addDaysIso(days: number, base: Date = new Date()): string {
  const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
  return toLocalIsoDate(next);
}

export type DueStatus = 'none' | 'overdue' | 'today' | 'tomorrow' | 'upcoming';

export function getDueStatus(
  dueDate: string | null,
  completed: boolean,
  todayIso: string = getTodayIso()
): DueStatus {
  if (!dueDate) return 'none';
  if (!completed && dueDate < todayIso) return 'overdue';
  if (dueDate === todayIso) return 'today';

  const [y, m, d] = todayIso.split('-').map(Number);
  const tomorrowIso = addDaysIso(1, new Date(y, m - 1, d));
  if (dueDate === tomorrowIso) return 'tomorrow';

  return 'upcoming';
}

export function isOverdue(
  dueDate: string | null,
  completed: boolean,
  todayIso: string = getTodayIso()
): boolean {
  return getDueStatus(dueDate, completed, todayIso) === 'overdue';
}

export function formatDueDate(
  dueDate: string | null,
  todayIso: string = getTodayIso()
): string {
  if (!dueDate) return '';
  if (dueDate === todayIso) return 'Today';

  const [ty, tm, td] = todayIso.split('-').map(Number);
  const tomorrowIso = addDaysIso(1, new Date(ty, tm - 1, td));
  if (dueDate === tomorrowIso) return 'Tomorrow';

  const yesterdayIso = addDaysIso(-1, new Date(ty, tm - 1, td));
  if (dueDate === yesterdayIso) return 'Yesterday';

  const [y, m, d] = dueDate.split('-').map(Number);
  if (!y || !m || !d) return dueDate;

  const parsed = new Date(y, m - 1, d);
  const sameYear = y === ty;
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}
