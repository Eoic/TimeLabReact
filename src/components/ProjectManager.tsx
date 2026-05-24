import { useId, useMemo, useState } from 'react';
import { ProjectDialog } from './ProjectDialog';
import { DeleteProjectDialog } from './project-manager/DeleteProjectDialog';
import { ErrorSnackbar, type ErrorSnackbarState } from './project-manager/ErrorSnackbar';
import { ProjectMenu } from './project-manager/ProjectMenu';
import { useProjectDialogState } from './project-manager/useProjectDialogState';
import { useProjects } from '../hooks/useProjects';
import type { Project } from '../database/models/project';
import type { ProjectFormData } from '../forms/project';

type DeleteDialogState = {
  isOpen: boolean;
  project: Project | null;
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function ProjectManager() {
  const nameInputId = useId();
  const projects = useProjects();

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    project: null,
  });

  const [errorSnackbar, setErrorSnackbar] = useState<ErrorSnackbarState>({
    isOpen: false,
    message: '',
  });

  const projectDialog = useProjectDialogState();
  const projectList = useMemo(() => projects.data ?? [], [projects.data]);
  const selectedProject = useMemo(() => projectList.find((project) => project.isSelected) ?? null, [projectList]);

  const showError = (error: unknown, fallbackMessage: string) => {
    setErrorSnackbar({
      isOpen: true,
      message: getErrorMessage(error, fallbackMessage),
    });
  };

  const closeErrorSnackbar = () => {
    setErrorSnackbar((currentSnackbar) => ({
      ...currentSnackbar,
      isOpen: false,
    }));
  };

  const resetErrorSnackbar = () => {
    setErrorSnackbar((currentSnackbar) => ({
      ...currentSnackbar,
      message: currentSnackbar.isOpen ? currentSnackbar.message : '',
    }));
  };

  const openDeleteDialog = () => {
    if (!selectedProject) {
      return;
    }

    setDeleteDialog({
      isOpen: true,
      project: selectedProject,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog((currentDialog) => ({
      ...currentDialog,
      isOpen: false,
    }));
  };

  const resetDeleteDialog = () => {
    setDeleteDialog((currentDialog) => ({
      ...currentDialog,
      project: null,
    }));
  };

  const selectProject = (id: string) => {
    void projects.selectProject(id).catch((error) => {
      showError(error, 'Failed to select project.');
    });
  };

  const saveProjectDialog = async () => {
    const title = projectDialog.draft.title.trim();
    const description = projectDialog.draft.description;

    if (!title || !projectDialog.dialog?.mode) {
      return;
    }

    const projectData: ProjectFormData = {
      title,
      description,
    };

    try {
      switch (projectDialog.dialog.mode) {
        case 'create':
          await projects.createProject(projectData);
          break;
        case 'rename':
          if (!selectedProject) {
            return;
          }

          await projects.updateProject(selectedProject.id, projectData);
          break;
      }

      projectDialog.closeDialog();
    } catch (error) {
      showError(
        error,
        projectDialog.dialog.mode === 'create' ? 'Failed to create project.' : 'Failed to rename project.',
      );
    }
  };

  const deleteSelectedProject = async () => {
    if (!deleteDialog.project) {
      return;
    }

    try {
      const deleted = await projects.deleteProject(deleteDialog.project.id);

      if (deleted) {
        setDeleteDialog((currentDialog) => ({
          ...currentDialog,
          isOpen: false,
        }));
      }
    } catch (error) {
      showError(error, 'Failed to delete project.');
    }
  };

  return (
    <>
      <ProjectMenu
        isLoading={projects.isLoading}
        projects={projectList}
        selectedProject={selectedProject}
        onCreate={projectDialog.openCreateDialog}
        onDelete={openDeleteDialog}
        onRename={() => projectDialog.openRenameDialog(selectedProject)}
        onSelect={selectProject}
      />

      <ProjectDialog
        errorMessage={projectDialog.dialog?.isOpen ? errorSnackbar.message : ''}
        id={nameInputId}
        isOpen={projectDialog.dialog?.isOpen ?? false}
        onChange={projectDialog.updateDraft}
        onClose={projectDialog.closeDialog}
        onErrorClose={closeErrorSnackbar}
        onExited={projectDialog.resetDialog}
        onSave={() => void saveProjectDialog()}
        title={projectDialog.dialog?.title ?? ''}
        values={projectDialog.draft}
      />

      <DeleteProjectDialog
        errorMessage={deleteDialog.isOpen ? errorSnackbar.message : ''}
        isOpen={deleteDialog.isOpen}
        project={deleteDialog.project}
        onClose={closeDeleteDialog}
        onDelete={() => void deleteSelectedProject()}
        onErrorClose={closeErrorSnackbar}
        onExited={resetDeleteDialog}
      />

      <ErrorSnackbar state={errorSnackbar} onClose={closeErrorSnackbar} onExited={resetErrorSnackbar} />
    </>
  );
}
