import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('TaskFlow App', () => {
  it('renders starter tasks and allows adding, completing, editing, and deleting with undo', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    expect(
      screen.getByText('Review weekly priorities & plan sprint')
    ).toBeInTheDocument();

    // Add a new task
    const addInput = screen.getByLabelText('New task title');
    await user.type(addInput, 'Deploy frontend build');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(screen.getByText('Deploy frontend build')).toBeInTheDocument();

    // Toggle completion on the newly added task
    const completeBtn = screen.getByRole('button', {
      name: 'Mark "Deploy frontend build" as complete',
    });
    await user.click(completeBtn);
    expect(
      screen.getByRole('button', {
        name: 'Mark "Deploy frontend build" as incomplete',
      })
    ).toBeInTheDocument();

    // Edit task via modal
    await user.click(screen.getByRole('button', { name: 'Edit "Deploy frontend build"' }));
    const dialog = screen.getByRole('dialog');
    const titleInput = within(dialog).getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Ship production release');
    await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    expect(screen.getByText('Ship production release')).toBeInTheDocument();
    expect(screen.queryByText('Deploy frontend build')).not.toBeInTheDocument();

    // Delete task and undo via toast
    await user.click(screen.getByRole('button', { name: 'Delete "Ship production release"' }));
    expect(screen.queryByText('Ship production release')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByText('Ship production release')).toBeInTheDocument();
  });

  it('filters tasks by search query and toggles dark mode', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByLabelText('Search tasks');
    await user.type(searchInput, 'coffee');

    expect(screen.getByText('Pick up groceries & coffee beans')).toBeInTheDocument();
    expect(
      screen.queryByText('Review weekly priorities & plan sprint')
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(
      screen.getByText('Review weekly priorities & plan sprint')
    ).toBeInTheDocument();

    const themeBtn = screen.getByRole('button', { name: /Switch to (dark|light) theme/i });
    const initialTheme = document.documentElement.getAttribute('data-theme');
    await user.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).not.toBe(initialTheme);
  });
});
