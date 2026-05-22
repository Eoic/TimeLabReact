import type { Project } from '../database/entities';
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

export type CreateProjectData = {
  title: string;
  description: string;
};

export type UpdateProjectData = {
  title?: string;
  description?: string;
};

export class ProjectRepositoryError extends TimeLabError {
  override name = 'ProjectRepositoryError';
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
    isDefault: false,
    updatedAt: null,
  };

  const result = await insertRecord(project, STORE_PROJECTS);

  if (!result.ok) {
    return err(new ProjectRepositoryError('Failed to create project.', result.error));
  }

  return result;
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

  if (project.value.isDefault) {
    return err(new ProjectRepositoryError('Cannot delete default project.'));
  }

  const result = await deleteRecord(id, STORE_PROJECTS);

  if (!result.ok) {
    return err(new ProjectRepositoryError('Failed to delete project', result.error));
  }

  return ok({ deleted: true });
}
