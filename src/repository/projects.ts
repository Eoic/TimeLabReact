import type { Project } from '../database/entities';
import { TimeLabError } from '../database/errors';
import { insertRecord, STORE_PROJECTS } from '../database/storage';
import { err, type Result } from '../shared/result';

export type CreateProjectData = {
  title: string;
  description: string;
};

export class ProjectRepositoryError extends TimeLabError {
  override name = 'ProjectRepositoryError';
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
