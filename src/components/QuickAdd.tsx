import { useState, type FormEvent, type RefObject } from 'react';
import type { Priority, TaskDraft } from '../types/todo';
import { addDaysIso, getTodayIso } from '../utils/date';
import { CalendarIcon, FlagIcon, PlusIcon, TagIcon } from './Icons';

interface QuickAddProps {
  inputRef: RefObject<HTMLInputElement | null>;
  categories: string[];
  defaultCategory: string | null;
  onAdd: (draft: TaskDraft) => void;
}

export function QuickAdd({
  inputRef,
  categories,
  defaultCategory,
  onAdd,
}: QuickAddProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [category, setCategory] = useState<string>(defaultCategory || 'Personal');
  const [expanded, setExpanded] = useState(false);

  const today = getTodayIso();
  const tomorrow = addDaysIso(1);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    onAdd({
      title: trimmed,
      notes,
      priority,
      dueDate: dueDate || null,
      category: category.trim() || 'Personal',
    });

    setTitle('');
    setNotes('');
    setPriority('medium');
    setDueDate('');
    setExpanded(false);
  };

  return (
    <form className="quick-add" onSubmit={handleSubmit} aria-label="Add a new task">
      <div className="quick-add-main">
        <span className="quick-add-icon" aria-hidden="true">
          <PlusIcon width={18} height={18} />
        </span>
        <input
          ref={inputRef}
          type="text"
          className="quick-add-input"
          placeholder="Add a task… (Press N to focus)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          aria-label="New task title"
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? 'Less' : 'Details'}
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={!title.trim()}
        >
          Add Task
        </button>
      </div>

      {expanded && (
        <div className="quick-add-details">
          <textarea
            className="quick-add-notes"
            placeholder="Optional notes or context…"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label="New task notes"
          />

          <div className="quick-add-controls">
            <div className="control-group">
              <label className="control-label" htmlFor="quick-priority">
                <FlagIcon width={13} height={13} />
                <span>Priority</span>
              </label>
              <select
                id="quick-priority"
                className="control-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="control-group">
              <label className="control-label" htmlFor="quick-category">
                <TagIcon width={13} height={13} />
                <span>Category</span>
              </label>
              <input
                id="quick-category"
                list="quick-category-options"
                className="control-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
              />
              <datalist id="quick-category-options">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="control-group">
              <label className="control-label" htmlFor="quick-due-date">
                <CalendarIcon width={13} height={13} />
                <span>Due</span>
              </label>
              <input
                id="quick-due-date"
                type="date"
                className="control-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <div className="quick-date-chips">
                <button
                  type="button"
                  className={`chip-btn ${dueDate === today ? 'chip-btn--active' : ''}`}
                  onClick={() => setDueDate(dueDate === today ? '' : today)}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`chip-btn ${dueDate === tomorrow ? 'chip-btn--active' : ''}`}
                  onClick={() => setDueDate(dueDate === tomorrow ? '' : tomorrow)}
                >
                  Tomorrow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
