import { useContext } from 'react';
import { ProjectsContext } from '../context/projectsContext';

export function useProjects() {
  const context = useContext(ProjectsContext);

  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider.');
  }

  return context;
}
