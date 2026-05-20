import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProjectDialog } from './ProjectDialog';

const defaultProps = {
  id: 'project-name',
  isOpen: true,
  onChange: vi.fn(),
  onClose: vi.fn(),
  onExited: vi.fn(),
  onSave: vi.fn(),
  title: 'New project',
  value: 'Client work',
};

describe('ProjectDialog', () => {
  it('shows the title and current project name', () => {
    render(<ProjectDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'New project' })).toBeInTheDocument();
    expect(screen.getByLabelText('Project name')).toHaveValue('Client work');
  });

  it('disables save when the project name is blank', () => {
    render(<ProjectDialog {...defaultProps} value="   " />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('calls onChange when the user edits the project name', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProjectDialog {...defaultProps} onChange={onChange} value="" />);
    await user.type(screen.getByLabelText('Project name'), 'Roadmap');

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onSave when the user clicks save', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ProjectDialog {...defaultProps} onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onSave on Enter keydown event', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ProjectDialog {...defaultProps} onSave={onSave} />);
    await user.keyboard('{Enter>}{/Enter}');

    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
