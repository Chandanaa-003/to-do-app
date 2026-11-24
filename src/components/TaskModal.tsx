import { useEffect, useState, type FormEvent } from 'react';
import type { Priority, Subtask, Task } from '../types/todo';
import { generateId } from '../utils/storage';
import { CheckIcon, CloseIcon, PlusIcon, TrashIcon } from './Icons';

interface TaskModalProps {
  task: Task;
  categories: string[];
  onSave: (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onClose: () => void;
}

export function TaskModal({ task, categories, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');
  const [category, setCategory] = useState(task.category);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAddSubtask = () => {
    const trimmed = newSubtask.trim();
    if (!trimmed) return;
    setSubtasks((prev) => [
      ...prev,
      { id: generateId(), title: trimmed, completed: false },
    ]);
    setNewSubtask('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(task.id, {
      title: title.trim(),
      notes: notes.trim(),
      priority,
      dueDate: dueDate || null,
      category: category.trim() || 'Personal',
      subtasks,
    });
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-heading"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="edit-task-heading" className="modal-title">
            Edit Task
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="edit-title">
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="edit-notes">
              Notes
            </label>
            <textarea
              id="edit-notes"
              className="field-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details, links, or checklist context…"
            />
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="field-label" htmlFor="edit-priority">
                Priority
              </label>
              <select
                id="edit-priority"
                className="field-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="edit-due-date">
                Due Date
              </label>
              <input
                id="edit-due-date"
                type="date"
                className="field-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="edit-category">
                Category
              </label>
              <input
                id="edit-category"
                list="modal-category-options"
                className="field-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <datalist id="modal-category-options">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="field">
            <span className="field-label">Subtasks</span>
            {subtasks.length > 0 && (
              <ul className="modal-subtasks">
                {subtasks.map((sub) => (
                  <li key={sub.id} className="subtask-item">
                    <button
                      type="button"
                      className={`subtask-checkbox ${sub.completed ? 'subtask-checkbox--checked' : ''}`}
                      onClick={() =>
                        setSubtasks((prev) =>
                          prev.map((item) =>
                            item.id === sub.id
                              ? { ...item, completed: !item.completed }
                              : item
                          )
                        )
                      }
                      aria-label={`Toggle subtask "${sub.title}"`}
                    >
                      {sub.completed && <CheckIcon width={10} height={10} />}
                    </button>
                    <input
                      type="text"
                      className="subtask-edit-input"
                      value={sub.title}
                      onChange={(e) =>
                        setSubtasks((prev) =>
                          prev.map((item) =>
                            item.id === sub.id ? { ...item, title: e.target.value } : item
                          )
                        )
                      }
                      aria-label="Subtask title"
                    />
                    <button
                      type="button"
                      className="subtask-delete-btn"
                      onClick={() =>
                        setSubtasks((prev) => prev.filter((item) => item.id !== sub.id))
                      }
                      aria-label={`Remove subtask "${sub.title}"`}
                    >
                      <TrashIcon width={13} height={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="modal-subtask-add">
              <input
                type="text"
                className="field-input"
                placeholder="Add a subtask…"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleAddSubtask}
                disabled={!newSubtask.trim()}
              >
                <PlusIcon width={14} height={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
