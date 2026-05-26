import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ProjectsProvider } from '../context/ProjectsProvider';

export function renderWithProjects(children: ReactNode) {
  return render(<ProjectsProvider>{children}</ProjectsProvider>);
}
