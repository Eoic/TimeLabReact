import type { PlotConfig, Project } from '../database/models/project';
import { TimeLabError } from '../database/errors';
import {
  deleteRecord,
  getAllRecords,
  getRecord,
  insertRecord,
  STORE_PROJECTS,
  updateRecord,
} from '../database/storage';
import { err, ok, type Result } from '../shared/result';

const DEFAULT_PROJECT = {
  title: 'Untitled',
  description: '',
};

function createDefaultPlotConfig(): PlotConfig {
  return {
    axes: {
      x: 'time',
      y: 'amplitude',
    },

    appearance: {
      downsampling: 'none',
      isAreaFillEnabled: true,
      isShowPointsEnabled: true,
      isSmoothLineEnabled: true,
      isShowGridlinesEnabled: true,
      lineWidth: 2,
    },

    guides: {
      thresholds: [],
    },
  };
}

export type CreateProjectData = {
  title: string;
  description: string;
};

export type UpdateProjectData = {
  title?: string;
  description?: string;
  plotConfig?: PlotConfig;
};

export class ProjectRepositoryError extends TimeLabError {
  override name = 'ProjectRepositoryError';
}

let bootstrapPromise: Promise<Result<void, ProjectRepositoryError>> | null = null;

async function runBootstrap(): Promise<Result<void, ProjectRepositoryError>> {
  const projectsResult = await getAllProjects();

  if (!projectsResult.ok) {
    return err(new ProjectRepositoryError('Failed while fetching projects', projectsResult.error));
  }

  if (projectsResult.value.some((project) => project.isSelected)) {
    return ok(undefined);
  }

  const projectToSelect = projectsResult.value[0];

  if (projectToSelect) {
    return setSelectedProject(projectToSelect.id);
  }

  const createResult = await createProject(DEFAULT_PROJECT);

  if (!createResult.ok) {
    return err(new ProjectRepositoryError('Failed to create initial project', createResult.error));
  }

  return setSelectedProject(createResult.value.id);
}

export function bootstrap(): Promise<Result<void, ProjectRepositoryError>> {
  bootstrapPromise ??= runBootstrap().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}

export async function getProjectById(id: string): Promise<Result<Project, ProjectRepositoryError>> {
  const result = await getRecord<Project>(id, STORE_PROJECTS);

  if (!result.ok) {
    return err(new ProjectRepositoryError('Failed to fetch project', result.error));
  }

  return ok(result.value);
}

export async function getAllProjects(): Promise<Result<Project[], ProjectRepositoryError>> {
  const result = await getAllRecords<Project>(STORE_PROJECTS);

  if (!result.ok) {
    return err(new ProjectRepositoryError('Failed to fetch projects', result.error));
  }

  return ok(result.value);
}

export async function setSelectedProject(id: string): Promise<Result<void, ProjectRepositoryError>> {
  const projects = await getAllProjects();

  if (!projects.ok) {
    return err(new ProjectRepositoryError('Failed to fetch project', projects.error));
  }

  if (!projects.value.some((project) => project.id === id)) {
    return err(new ProjectRepositoryError('Cannot select missing project.'));
  }

  for (const project of projects.value) {
    const updateResult = await updateRecord(
      {
        ...project,
        isSelected: project.id === id,
      },
      STORE_PROJECTS,
    );

    if (!updateResult.ok) {
      return err(new ProjectRepositoryError('Failed to select project', updateResult.error));
    }
  }

  return ok(undefined);
}

export async function createProject(data: CreateProjectData): Promise<Result<Project, ProjectRepositoryError>> {
  const trimmedTitle = data.title.trim();

  if (trimmedTitle.length === 0) {
    return err(new ProjectRepositoryError('Title is required.'));
  }

  const project: Project = {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    description: data.description,
    createdAt: Date.now(),
    isSelected: false,
    updatedAt: null,
    plotConfig: createDefaultPlotConfig(),
  };

  const result = await insertRecord(project, STORE_PROJECTS);

  if (!result.ok) {
    return err(new ProjectRepositoryError('Failed to create project.', result.error));
  }

  return ok(result.value);
}

export async function updateProject(
  id: string,
  data: UpdateProjectData,
): Promise<Result<Project, ProjectRepositoryError>> {
  const existingResult = await getRecord<Project>(id, STORE_PROJECTS);

  if (!existingResult.ok) {
    return err(new ProjectRepositoryError('Failed to retrieve project.', existingResult.error));
  }

  const title = data.title === undefined ? existingResult.value.title : data.title.trim();

  if (title.length === 0) {
    return err(new ProjectRepositoryError('Title is required.'));
  }

  const project: Project = {
    ...existingResult.value,
    title,
    description: data.description ?? existingResult.value.description,
    plotConfig: data.plotConfig ?? existingResult.value.plotConfig,
    updatedAt: Date.now(),
  };

  const updateResult = await updateRecord(project, STORE_PROJECTS);

  if (!updateResult.ok) {
    return err(new ProjectRepositoryError('Failed to update project.', updateResult.error));
  }

  return updateResult;
}

export async function deleteProject(id: string): Promise<Result<{ deleted: boolean }, ProjectRepositoryError>> {
  const project = await getProjectById(id);

  if (!project.ok) {
    return err(new ProjectRepositoryError('Failed to delete project', project.error));
  }

  const allProjects = await getAllProjects();

  if (!allProjects.ok) {
    return err(new ProjectRepositoryError('Failed to delete project', allProjects.error));
  }

  const remainingProjects = allProjects.value.filter((project) => project.id !== id);

  if (remainingProjects.length === 0) {
    return err(new ProjectRepositoryError('Cannot delete the last project.'));
  }

  const result = await deleteRecord(id, STORE_PROJECTS);

  if (!result.ok) {
    return err(new ProjectRepositoryError('Failed to delete project', result.error));
  }

  if (project.value.isSelected) {
    const selectResult = await setSelectedProject(remainingProjects[0]?.id ?? '');

    if (!selectResult.ok) {
      return err(new ProjectRepositoryError('Failed to select replacement project', selectResult.error));
    }
  }

  return ok({ deleted: true });
}
