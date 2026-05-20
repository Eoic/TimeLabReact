import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LabelToggle } from './LabelToggle';

describe('LabelToggle', () => {
  it('shows wide toggle in its default state (unlabeled)', () => {
    render(<LabelToggle />);
    expect(screen.getByRole('button', { name: 'Unlabeled' })).toBeInTheDocument();
    expect(screen.getByText('pending_actions')).toBeInTheDocument();
    expect(screen.queryByText('done_all')).toBeNull();
  });

  it('toggle can change state', async () => {
    for (const isCompact of [true, false]) {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<LabelToggle compact={isCompact} onClick={onClick} />);
      await user.click(screen.getByRole('button', { name: 'Unlabeled' }));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Labeled' })).toBeInTheDocument();
      expect(screen.getByText('done_all')).toBeInTheDocument();
      expect(screen.queryByText('pending_actions')).toBeNull();
      cleanup();
    }
  });

  it('shows compact toggle button in default state', () => {
    render(<LabelToggle compact />);
    expect(screen.getByRole('button', { name: 'Unlabeled' })).toBeInTheDocument();
    expect(screen.getByText('pending_actions')).toBeInTheDocument();
    expect(screen.queryByText('done_all')).toBeNull();
  });
});
