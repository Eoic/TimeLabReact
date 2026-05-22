import { useCallback, useEffect, useReducer } from 'react';
import * as projectApi from '../repository/projects';
import type { Project } from '../database/entities';
import type { CreateProjectFormData } from '../forms/project';
import type { Result } from '../shared/result';

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

export function useProjects() {
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
    async <T>(operation: () => Promise<Result<T, Error>>) => {
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
    async (data: CreateProjectFormData) => {
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
    async (id: string, data: CreateProjectFormData) => refreshAfterMutation(() => projectApi.updateProject(id, data)),
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

  useEffect(() => {
    let cancelled = false;

    void load('initial', () => !cancelled);

    return () => {
      cancelled = true;
    };
  }, [load]);

  return {
    ...state,
    createProject,
    deleteProject,
    refresh: () => load('refresh'),
    selectProject,
    updateProject,
  };
}
