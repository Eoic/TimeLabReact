import { describe, expect, it } from 'vitest';
import type { Project } from '../database/entities';
import { getRecord, STORE_PROJECTS } from '../database/storage';
import { createProject, deleteProject, getAllProjects, updateProject, type CreateProjectData } from './projects';
import { unwrapErr, unwrapOk } from '../shared/result';

describe('projects repository', async () => {
  it('can create a new project from valid data', async () => {
    const projectData: CreateProjectData = {
      title: '    Project #1    ',
      description: 'A new project',
    };

    const project = unwrapOk(await createProject(projectData));
    const storedProject = unwrapOk(await getRecord<Project>(project.id, STORE_PROJECTS));

    expect(projectData.title.trim()).equal('Project #1');
    expect(projectData.title.trim()).equal(storedProject.title);
    expect(storedProject.isDefault).toBe(false);
    expect(storedProject.updatedAt).toBeNull();
    expect(storedProject.description).equal('A new project');
    expect(storedProject.createdAt).not.toBeNull();
  });

  it('fails to create a project with no title', async () => {
    const projectData: CreateProjectData = {
      title: '      ',
      description: 'An example project.',
    };

    const error = unwrapErr(await createProject(projectData));

    expect(error.name).toBe('ProjectRepositoryError');
    expect(error.message).contain('Title is required');
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

    const project = unwrapOk(await createProject(originalProjectData));

    expect(project.title).toEqual(originalProjectData.title);
    expect(project.description).toEqual(originalProjectData.description);

    const updatedProject = unwrapOk(await updateProject(project.id, newProjectData));

    expect(updatedProject.title).toEqual(newProjectData.title);
    expect(updatedProject.description).toEqual(newProjectData.description);
    expect(project.id).toEqual(updatedProject.id);
  });

  it('can delete project successfully', async () => {
    const projectData = {
      title: 'Project #1',
      description: 'An example project',
    };

    const createdProject = unwrapOk(await createProject(projectData));
    const allProjects = unwrapOk(await getAllProjects());

    expect(allProjects.length).toBe(1);

    const deleteResult = unwrapOk(await deleteProject(createdProject.id));

    expect(deleteResult.deleted).toBe(true);
    expect(unwrapOk(await getAllProjects()).length).toBe(0);
  });

  it('fails gracefully when deleting project that does not exist', async () => {
    const result = unwrapErr(await deleteProject('some-project-id-1'));
    expect(result.message).toContain('Failed to delete project');
  });
});
