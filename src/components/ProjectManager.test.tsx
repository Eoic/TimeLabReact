import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectManager } from './ProjectManager';

describe('ProjectManager', () => {
  it('shows a disabled loading selector while projects are loading', () => {
    render(<ProjectManager isLoading />);

    const projectSelector = screen.getByRole('button', { name: 'Loading projects' });

    expect(projectSelector).toBeDisabled();
    expect(projectSelector).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
