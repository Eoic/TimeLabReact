import { describe, expect, it } from 'vitest';
import type { Project } from '../database/entities';
import { getRecord, STORE_PROJECTS } from '../database/storage';
import { createProject, updateProject, type CreateProjectData } from './projects';

describe('projects repository', async () => {
  it('can create a new project from valid data', async () => {
    const projectData: CreateProjectData = {
      title: '    Project #1    ',
      description: 'A new project',
    };

    const result = await createProject(projectData);

    if (!result.ok) {
      throw new Error('Project creation failed.');
    }

    const storedProject = await getRecord<Project>(result.value.id, STORE_PROJECTS);

    if (!storedProject.ok) {
      throw new Error('Failed to create project.');
    }

    expect(projectData.title.trim()).equal('Project #1');
    expect(projectData.title.trim()).equal(storedProject.value!.title);
    expect(storedProject.value).not.toBeNull();
    expect(storedProject.value!.isDefault).toBe(false);
    expect(storedProject.value!.updatedAt).toBeNull();
    expect(storedProject.value!.description).equal('A new project');
    expect(storedProject.value!.createdAt).not.toBeNull();
  });

  it('fails to create a project with no title', async () => {
    const projectData: CreateProjectData = {
      title: '      ',
      description: 'An example project.',
    };

    const result = await createProject(projectData);

    if (result.ok) {
      throw new Error('Project creation should have failed.');
    }

    expect(result.error.name).toBe('ProjectRepositoryError');
    expect(result.error.message).contain('Title is required');
  });

  it('can update existing project', async () => {
    const originalProjectData = {
      title: 'Project 1',
      description: 'An initial project',
    };

    const newProjectData = {
      title: 'Project #1',
      description: 'Updated project',
    };

    const result = await createProject(originalProjectData);

    if (!result.ok) {
      throw new Error('Project creation failed.');
    }

    expect(result.value.title).toEqual(originalProjectData.title);
    expect(result.value.description).toEqual(originalProjectData.description);

    const updateResult = await updateProject(result.value.id, newProjectData);

    if (!updateResult.ok) {
      throw new Error('Failed to update project.');
    }

    expect(updateResult.value.title).toEqual(newProjectData.title);
    expect(updateResult.value.description).toEqual(newProjectData.description);
    expect(result.value.id).toEqual(updateResult.value.id);
  });
});
