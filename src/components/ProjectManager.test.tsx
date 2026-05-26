import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IDBObjectStore as FakeIDBObjectStore } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectManager } from './ProjectManager';
import { renderWithProjects } from '../test/renderWithProjects';

function makeFailingRequest(error: DOMException | null): IDBRequest {
  const request = {
    error,
    onerror: null,
    onsuccess: null,
    result: undefined,
  } as unknown as IDBRequest;

  queueMicrotask(() => {
    request.onerror?.call(request, new Event('error'));
  });

  return request;
}

describe('ProjectManager', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a disabled loading selector while projects are loading', () => {
    renderWithProjects(<ProjectManager />);

    const projectSelector = screen.getByRole('button', { name: 'Loading projects' });

    expect(projectSelector).toBeDisabled();
    expect(projectSelector).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('creates a project and selects it', async () => {
    const user = userEvent.setup();
    renderWithProjects(<ProjectManager />);

    await user.click(await screen.findByRole('button', { name: 'Untitled' }));
    await user.click(screen.getByRole('menuitem', { name: 'New project' }));
    await user.type(screen.getByLabelText(/^Title/), 'Client work');
    await user.type(screen.getByLabelText('Description'), 'Monthly reporting');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('button', { name: 'Client work' })).toBeInTheDocument();
  });

  it('deletes the selected project and selects the remaining project', async () => {
    const user = userEvent.setup();
    renderWithProjects(<ProjectManager />);

    await user.click(await screen.findByRole('button', { name: 'Untitled' }));
    await user.click(screen.getByRole('menuitem', { name: 'New project' }));
    await user.type(screen.getByLabelText(/^Title/), 'Client work');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await user.click(await screen.findByRole('button', { name: 'Client work' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete project' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByRole('button', { name: 'Untitled' })).toBeInTheDocument();
  });

  it('shows the selected project name in the delete confirmation', async () => {
    const user = userEvent.setup();
    renderWithProjects(<ProjectManager />);

    await user.click(await screen.findByRole('button', { name: 'Untitled' }));
    await user.click(screen.getByRole('menuitem', { name: 'New project' }));
    await user.type(screen.getByLabelText(/^Title/), 'Client work');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await user.click(await screen.findByRole('button', { name: 'Client work' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete project' }));

    expect(screen.getByText('Delete Client work? This removes the project from this session.')).toBeInTheDocument();
  });

  it('renames the selected project', async () => {
    const user = userEvent.setup();
    renderWithProjects(<ProjectManager />);

    await user.click(await screen.findByRole('button', { name: 'Untitled' }));
    await user.click(screen.getByRole('menuitem', { name: 'New project' }));
    await user.type(screen.getByLabelText(/^Title/), 'Client work');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await user.click(await screen.findByRole('button', { name: 'Client work' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename project' }));
    await user.clear(screen.getByLabelText(/^Title/));
    await user.type(screen.getByLabelText(/^Title/), 'Research');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('button', { name: 'Research' })).toBeInTheDocument();
  });

  it('persists project selection across remounts', async () => {
    const user = userEvent.setup();
    const view = renderWithProjects(<ProjectManager />);

    await user.click(await screen.findByRole('button', { name: 'Untitled' }));
    await user.click(screen.getByRole('menuitem', { name: 'New project' }));
    await user.type(screen.getByLabelText(/^Title/), 'Client work');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('button', { name: 'Client work' });

    await user.click(screen.getByRole('button', { name: 'Client work' }));
    await user.click(screen.getByRole('menuitem', { name: 'Untitled' }));
    await screen.findByRole('button', { name: 'Untitled' });

    view.unmount();
    renderWithProjects(<ProjectManager />);

    expect(await screen.findByRole('button', { name: 'Untitled' })).toBeInTheDocument();
  });

  it('shows project errors to the user', async () => {
    const user = userEvent.setup();
    renderWithProjects(<ProjectManager />);

    await user.click(await screen.findByRole('button', { name: 'Untitled' }));
    await user.click(screen.getByRole('menuitem', { name: 'New project' }));
    await user.type(screen.getByLabelText(/^Title/), 'Client work');

    vi.spyOn(FakeIDBObjectStore.prototype, 'add').mockImplementationOnce(() => makeFailingRequest(null));

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to create project.');
  });

  it('keeps the project dialog open when create fails', async () => {
    const user = userEvent.setup();
    renderWithProjects(<ProjectManager />);

    await user.click(await screen.findByRole('button', { name: 'Untitled' }));
    await user.click(screen.getByRole('menuitem', { name: 'New project' }));
    await user.type(screen.getByLabelText(/^Title/), 'Client work');

    vi.spyOn(FakeIDBObjectStore.prototype, 'add').mockImplementationOnce(() => makeFailingRequest(null));

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to create project.');
    expect(screen.getByRole('heading', { name: 'New project' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Title/)).toHaveValue('Client work');
  });

  it('keeps the delete dialog open when delete fails', async () => {
    const user = userEvent.setup();
    renderWithProjects(<ProjectManager />);

    await user.click(await screen.findByRole('button', { name: 'Untitled' }));
    await user.click(screen.getByRole('menuitem', { name: 'New project' }));
    await user.type(screen.getByLabelText(/^Title/), 'Client work');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await user.click(await screen.findByRole('button', { name: 'Client work' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete project' }));

    vi.spyOn(FakeIDBObjectStore.prototype, 'delete').mockImplementationOnce(() => makeFailingRequest(null));

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to delete project');
    expect(screen.getByRole('heading', { name: 'Delete project' })).toBeInTheDocument();
    expect(screen.getByText('Delete Client work? This removes the project from this session.')).toBeInTheDocument();
  });

  it('keeps project error text visible while the snackbar closes', async () => {
    const user = userEvent.setup();
    renderWithProjects(<ProjectManager />);

    await user.click(await screen.findByRole('button', { name: 'Untitled' }));
    await user.click(screen.getByRole('menuitem', { name: 'New project' }));
    await user.type(screen.getByLabelText(/^Title/), 'Client work');

    vi.spyOn(FakeIDBObjectStore.prototype, 'add').mockImplementationOnce(() => makeFailingRequest(null));

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getAllByText('Failed to create project.')).not.toHaveLength(0);
  });
});
