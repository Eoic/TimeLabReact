import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import * as projectApi from '../repository/projects';
import type { Project } from '../database/models/project';
import type { ProjectFormData } from '../forms/project';
import type { UpdateProjectData } from '../repository/projects';
import type { Result } from '../shared/result';
import { ProjectsContext, type ProjectsContextValue } from './projectsContext';

const LOADING_DELAY_MS = 300;

type ResourceState<T> = {
  data: T | null;
  error: unknown | null;
  isLoading: boolean;
};

type ResourceAction<T> =
  | { type: 'load-start'; mode: 'initial' | 'refresh' }
  | { type: 'load-success'; data: T }
  | { type: 'load-failure'; error: unknown }
  | { type: 'mutation-failure'; error: unknown };

type ProjectsProviderProps = {
  children: ReactNode;
};

const initialState: ResourceState<Project[]> = {
  data: null,
  error: null,
  isLoading: true,
};

function resourceReducer<T>(state: ResourceState<T>, action: ResourceAction<T>): ResourceState<T> {
  switch (action.type) {
    case 'load-start':
      return {
        ...state,
        error: null,
        isLoading: action.mode === 'initial',
      };
    case 'load-success':
      return {
        data: action.data,
        error: null,
        isLoading: false,
      };
    case 'load-failure':
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };
    case 'mutation-failure':
      return {
        ...state,
        error: action.error,
      };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function ProjectsProvider({ children }: ProjectsProviderProps) {
  const [state, dispatch] = useReducer(resourceReducer<Project[]>, initialState);

  const load = useCallback(async (mode: 'initial' | 'refresh', shouldCommit: () => boolean = () => true) => {
    dispatch({ type: 'load-start', mode });

    try {
      if (mode === 'initial') {
        const bootstrapResult = await projectApi.bootstrap();

        if (!bootstrapResult.ok) {
          throw bootstrapResult.error;
        }

        await delay(LOADING_DELAY_MS);
      }

      const projects = await projectApi.getAllProjects();

      if (!projects.ok) {
        throw projects.error;
      }

      if (shouldCommit()) {
        dispatch({ type: 'load-success', data: projects.value });
      }
    } catch (error) {
      if (shouldCommit()) {
        dispatch({ type: 'load-failure', error });
      }
    }
  }, []);

  const refreshAfterMutation = useCallback(
    async <T,>(operation: () => Promise<Result<T, Error>>) => {
      const result = await operation();

      if (!result.ok) {
        dispatch({ type: 'mutation-failure', error: result.error });
        throw result.error;
      }

      await load('refresh');

      return result.value;
    },
    [load],
  );

  const createProject = useCallback(
    async (data: ProjectFormData) => {
      const project = await refreshAfterMutation(async () => {
        const result = await projectApi.createProject(data);

        if (!result.ok) {
          return result;
        }

        const selectResult = await projectApi.setSelectedProject(result.value.id);

        if (!selectResult.ok) {
          return selectResult;
        }

        return {
          ok: true as const,
          value: {
            ...result.value,
            isSelected: true,
          },
        };
      });

      return project;
    },
    [refreshAfterMutation],
  );

  const updateProject = useCallback(
    async (id: string, data: UpdateProjectData) => refreshAfterMutation(() => projectApi.updateProject(id, data)),
    [refreshAfterMutation],
  );

  const selectProject = useCallback(
    async (id: string) => {
      await refreshAfterMutation(() => projectApi.setSelectedProject(id));

      return true;
    },
    [refreshAfterMutation],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const result = await refreshAfterMutation(() => projectApi.deleteProject(id));

      return result.deleted;
    },
    [refreshAfterMutation],
  );

  const refresh = useCallback(() => load('refresh'), [load]);
  const selectedProject = useMemo(() => state.data?.find((project) => project.isSelected) ?? null, [state.data]);

  useEffect(() => {
    let cancelled = false;

    void load('initial', () => !cancelled);

    return () => {
      cancelled = true;
    };
  }, [load]);

  const value = useMemo<ProjectsContextValue>(
    () => ({
      ...state,
      createProject,
      deleteProject,
      refresh,
      selectProject,
      selectedProject,
      updateProject,
    }),
    [createProject, deleteProject, refresh, selectProject, selectedProject, state, updateProject],
  );

  return <ProjectsContext value={value}>{children}</ProjectsContext>;
}
