import { createContext } from 'react';
import type { Project } from '../database/models/project';
import type { ProjectFormData } from '../forms/project';
import type { UpdateProjectData } from '../repository/projects';

type ResourceState<T> = {
  data: T | null;
  error: unknown | null;
  isLoading: boolean;
};

export type ProjectsContextValue = ResourceState<Project[]> & {
  createProject: (data: ProjectFormData) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  selectProject: (id: string) => Promise<boolean>;
  selectedProject: Project | null;
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project>;
};

export const ProjectsContext = createContext<ProjectsContextValue | null>(null);
