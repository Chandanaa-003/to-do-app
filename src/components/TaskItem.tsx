import { useState, type DragEvent, type FormEvent } from 'react';
import type { Task } from '../types/todo';
import { formatDueDate, getDueStatus } from '../utils/date';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  EditIcon,
  GripIcon,
  PlusIcon,
  TrashIcon,
} from './Icons';

interface TaskItemProps {
  task: Task;
  canReorder: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onMoveStep: (id: string, direction: -1 | 1) => void;
  onDragStart: (id: string) => void;
  onDropOn: (targetId: string) => void;
  isDragging: boolean;
}

const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} as const;

export function TaskItem({
  task,
  canReorder,
  isFirst,
  isLast,
  onToggle,
  onDelete,
  onEdit,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onMoveStep,
  onDragStart,
  onDropOn,
  isDragging,
}: TaskItemProps) {
  const [subtasksExpanded, setSubtasksExpanded] = useState(task.subtasks.length > 0);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const dueStatus = getDueStatus(task.dueDate, task.completed);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleSubtaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  const handleDragStart = (e: DragEvent<HTMLLIElement>) => {
    if (!canReorder) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    onDragStart(task.id);
  };

  const handleDragOver = (e: DragEvent<HTMLLIElement>) => {
    if (!canReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLLIElement>) => {
    if (!canReorder) return;
    e.preventDefault();
    setIsDragOver(false);
    onDropOn(task.id);
  };

  return (
    <li
      className={[
        'task-card',
        task.completed ? 'task-card--completed' : '',
        isDragging ? 'task-card--dragging' : '',
        isDragOver ? 'task-card--drag-over' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable={canReorder}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={() => setIsDragOver(false)}
    >
      <div className="task-row">
        {canReorder && (
          <span className="drag-handle" title="Drag to reorder" aria-hidden="true">
            <GripIcon width={16} height={16} />
          </span>
        )}

        <button
          type="button"
          className={`task-checkbox ${task.completed ? 'task-checkbox--checked' : ''}`}
          onClick={() => onToggle(task.id)}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as incomplete`
              : `Mark "${task.title}" as complete`
          }
          aria-pressed={task.completed}
        >
          {task.completed && <CheckIcon width={13} height={13} />}
        </button>

        <div className="task-body">
          <div className="task-title-line">
            <span className="task-title">{task.title}</span>
          </div>

          {task.notes && <p className="task-notes">{task.notes}</p>}

          <div className="task-meta">
            <span className={`priority-badge priority-badge--${task.priority}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>

            {task.category && <span className="category-pill">{task.category}</span>}

            {task.dueDate && (
              <span className={`due-pill due-pill--${dueStatus}`}>
                <CalendarIcon width={12} height={12} />
                <span>
                  {dueStatus === 'overdue'
                    ? `Overdue (${formatDueDate(task.dueDate)})`
                    : formatDueDate(task.dueDate)}
                </span>
              </span>
            )}

            {task.subtasks.length > 0 && (
              <button
                type="button"
                className="subtask-toggle-pill"
                onClick={() => setSubtasksExpanded((prev) => !prev)}
                aria-expanded={subtasksExpanded}
              >
                <span>
                  Subtasks {completedSubtasks}/{task.subtasks.length}
                </span>
                <ChevronDownIcon
                  width={12}
                  height={12}
                  className={subtasksExpanded ? 'rotate-180' : ''}
                />
              </button>
            )}
          </div>
        </div>

        <div className="task-actions">
          {canReorder && (
            <>
              <button
                type="button"
                className="icon-btn"
                onClick={() => onMoveStep(task.id, -1)}
                disabled={isFirst}
                aria-label={`Move "${task.title}" up`}
                title="Move up"
              >
                <ArrowUpIcon width={15} height={15} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => onMoveStep(task.id, 1)}
                disabled={isLast}
                aria-label={`Move "${task.title}" down`}
                title="Move down"
              >
                <ArrowDownIcon width={15} height={15} />
              </button>
            </>
          )}

          <button
            type="button"
            className="icon-btn"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
            title="Edit task"
          >
            <EditIcon width={15} height={15} />
          </button>

          <button
            type="button"
            className="icon-btn icon-btn--danger"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete "${task.title}"`}
            title="Delete task"
          >
            <TrashIcon width={15} height={15} />
          </button>
        </div>
      </div>

      {subtasksExpanded && (
        <div className="subtasks-panel">
          {task.subtasks.length > 0 && (
            <ul className="subtasks-list">
              {task.subtasks.map((sub) => (
                <li key={sub.id} className="subtask-item">
                  <button
                    type="button"
                    className={`subtask-checkbox ${sub.completed ? 'subtask-checkbox--checked' : ''}`}
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                    aria-label={
                      sub.completed
                        ? `Mark subtask "${sub.title}" incomplete`
                        : `Mark subtask "${sub.title}" complete`
                    }
                    aria-pressed={sub.completed}
                  >
                    {sub.completed && <CheckIcon width={10} height={10} />}
                  </button>
                  <span
                    className={`subtask-title ${sub.completed ? 'subtask-title--completed' : ''}`}
                  >
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    className="subtask-delete-btn"
                    onClick={() => onDeleteSubtask(task.id, sub.id)}
                    aria-label={`Remove subtask "${sub.title}"`}
                  >
                    <TrashIcon width={12} height={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form className="subtask-add-form" onSubmit={handleSubtaskSubmit}>
            <input
              type="text"
              className="subtask-add-input"
              placeholder="Add a subtask…"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              aria-label={`Add subtask to ${task.title}`}
            />
            <button
              type="submit"
              className="btn btn-ghost btn-xs"
              disabled={!newSubtaskTitle.trim()}
            >
              <PlusIcon width={13} height={13} />
              <span>Add</span>
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
