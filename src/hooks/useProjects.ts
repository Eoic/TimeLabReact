import { useCallback, useEffect, useState } from 'react';
import * as projectApi from '../repository/projects';
import type { Project } from '../database/entities';
import type { CreateProjectFormData } from '../forms/project';

const LOADING_DELAY_MS = 300;

type ResourceState<T> = {
  data: T | null;
  error: unknown;
  isLoading: boolean;
  isRefreshing: boolean;
};

export function useProjects() {
  const [state, setState] = useState<ResourceState<Project[]>>({
    data: null,
    error: null,
    isLoading: true,
    isRefreshing: false,
  });

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'refresh') {
      setState((previous) => ({
        ...previous,
        error: null,
        isRefreshing: true,
      }));
    }

    try {
      const projects = await projectApi.getAllProjects();

      if (!projects.ok) {
        throw projects.error;
      }

      setState({
        data: projects.value,
        error: null,
        isLoading: false,
        isRefreshing: false,
      });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        error,
        isLoading: false,
        isRefreshing: false,
      }));
    }
  }, []);

  const createProject = useCallback(
    async (data: CreateProjectFormData) => {
      const result = await projectApi.createProject(data);

      if (!result.ok) {
        setState((previous) => ({
          ...previous,
          error: result.error,
        }));

        throw result.error;
      }

      const selectResult = await projectApi.setSelectedProject(result.value.id);

      if (!selectResult.ok) {
        setState((previous) => ({
          ...previous,
          error: selectResult.error,
        }));

        throw selectResult.error;
      }

      await load('refresh');

      return {
        ...result.value,
        isSelected: true,
      };
    },
    [load],
  );

  const updateProject = useCallback(
    async (id: string, data: CreateProjectFormData) => {
      const result = await projectApi.updateProject(id, data);

      if (!result.ok) {
        setState((previous) => ({
          ...previous,
          error: result.error,
        }));

        throw result.error;
      }

      await load('refresh');

      return result.value;
    },
    [load],
  );

  const selectProject = useCallback(
    async (id: string) => {
      const result = await projectApi.setSelectedProject(id);

      if (!result.ok) {
        setState((previous) => ({
          ...previous,
          error: result.error,
        }));

        throw result.error;
      }

      await load('refresh');

      return true;
    },
    [load],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const result = await projectApi.deleteProject(id);

      if (!result.ok) {
        setState((previous) => ({
          ...previous,
          error: result.error,
        }));

        throw result.error;
      }

      await load('refresh');

      return result.value.deleted;
    },
    [load],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      await projectApi.bootstrap();
      await new Promise((resolve, _reject) => setTimeout(resolve, LOADING_DELAY_MS));

      try {
        const projects = await projectApi.getAllProjects();

        if (!projects.ok) {
          throw projects.error;
        }

        if (!cancelled) {
          setState({
            data: projects.value,
            error: null,
            isLoading: false,
            isRefreshing: false,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            error,
            isLoading: false,
            isRefreshing: false,
          });
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...state,
    reload: () => load('refresh'),
    createProject,
    updateProject,
    selectProject,
    deleteProject,
  };
}
