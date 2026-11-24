
# TaskFlow — Smart To-Do App

A complete, responsive, and accessible frontend To-Do application built with **React 19**, **TypeScript**, and **Vite**. Designed for fast daily task capture with smart views, priorities, due dates, subtasks, drag-and-drop reordering, dark/light themes, and offline `localStorage` persistence.

---

## Features

- **Full Task CRUD**: Create tasks quickly from the Quick Add bar, or expand details to set notes, priority (`High`, `Medium`, `Low`), category/tag, and due date (`Today`, `Tomorrow`, or custom date).
- **Subtasks & Checklists**: Add, toggle, and remove subtasks inline on any task card or inside the task edit modal, with live subtask completion counts.
- **Smart Views**:
  - **All Tasks** — full workspace view
  - **Today** — tasks due today plus overdue items (highlighted with an alert badge)
  - **Upcoming** — scheduled tasks due after today
  - **High Priority** — active high-priority tasks
  - **Completed** — finished tasks
- **Categories / Tags**: Filter tasks by built-in or custom categories (`Work`, `Personal`, `Errands`, `Health`, `Learning`, or any custom tag you enter).
- **Search, Filter & Sort**:
  - Live search across task titles, notes, categories, and subtask titles
  - Status tabs (`All`, `Active`, `Completed`)
  - Priority filter (`All`, `High`, `Medium`, `Low`)
  - Sort modes: `Manual order`, `Due date`, `Priority`, `Newest`, and `Alphabetical`
- **Drag-and-Drop & Accessible Reordering**: Drag task cards in `Manual order` mode or use the accessible Up/Down reorder buttons.
- **Bulk Actions & Undo Toast**: Mark all visible tasks complete, clear completed tasks, and restore deleted/cleared tasks via the Undo notification toast.
- **Offline Persistence + JSON Backup**:
  - Automatically saves tasks and theme preference to `localStorage`
  - **Export** tasks to a `.json` backup file, **Import** from JSON (merge mode), or **Reset** to sample starter tasks.
- **Light & Dark Theme**: Respects `prefers-color-scheme` on first launch and persists manual toggles.
- **Keyboard Shortcuts**:
  - `N` — Focus the Quick Add input
  - `/` — Focus the Search bar
  - `Esc` — Close open modals/drawers or clear active search

---

## Tech Stack

- **Framework**: React 19 + TypeScript (strict mode)
- **Build Tool**: Vite 6
- **Styling**: Custom CSS with CSS custom properties (no external runtime CSS/icon dependencies)
- **Testing**: Vitest + React Testing Library + jsdom

---

## Project Structure

```text
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx                  # Root layout, keyboard shortcuts, and view coordination
    ├── App.test.tsx             # Component & user-flow integration tests
    ├── main.tsx                 # React entry point
    ├── components/
    │   ├── FilterBar.tsx        # Search, status tabs, priority/sort selects, bulk actions
    │   ├── Icons.tsx            # Inline SVG icon components
    │   ├── QuickAdd.tsx         # Quick task creation bar with expandable metadata
    │   ├── Sidebar.tsx          # Smart views, categories, theme toggle, export/import/reset
    │   ├── TaskItem.tsx         # Task card with subtasks, drag-and-drop, and inline actions
    │   ├── TaskModal.tsx        # Accessible dialog for editing full task details
    │   └── Toast.tsx            # Undo notification toast
    ├── hooks/
    │   ├── useTheme.ts          # Light/dark theme state and persistence
    │   └── useTodoStore.ts      # Task state, undo snapshots, filtering, and CRUD actions
    ├── styles/
    │   └── index.css            # Design tokens, light/dark themes, and responsive layout
    ├── test/
    │   └── setup.ts             # Testing Library & localStorage cleanup setup
    ├── types/
    │   └── todo.ts              # Core TypeScript interfaces and filter types
    └── utils/
        ├── date.ts              # Local-time date formatting and due-status helpers
        ├── storage.ts           # localStorage persistence, seed data, and JSON validation
        ├── taskFilters.ts       # Task counting, filtering, and sorting logic
        └── taskFilters.test.ts  # Unit tests for dates, counts, filters, sorting, and import
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (tested with Node v26)
- **npm** 9+

### Installation & Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Typecheck with `tsc -b` and build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript typechecking (`tsc --noEmit`) |
| `npm test` | Run unit and integration tests once with Vitest |
| `npm run test:watch` | Run Vitest in watch mode |

---

## JSON Import / Export Format

Exported backups are standard JSON arrays of task objects. You can also import a JSON array (or `{ "tasks": [...] }`) where each task only requires a `title`:

```json
[
  {
    "title": "Prepare release notes",
    "notes": "Highlight dark mode and JSON backup support",
    "priority": "high",
    "dueDate": "2026-11-30",
    "category": "Work",
    "completed": false,
    "subtasks": [
      { "title": "Review changelog", "completed": true }
    ]
  }
]
```
=======
# to-do-app
A simple and user-friendly To-Do App to add, edit, delete, and manage daily tasks. Helps users stay organized and improve productivity.

