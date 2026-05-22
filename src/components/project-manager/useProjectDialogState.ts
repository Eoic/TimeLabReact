import { useState } from 'react';
import type { ChangeEventHandler } from 'react';
import type { Project } from '../../database/entities';
import type { CreateProjectFormData } from '../../forms/project';

export type ProjectDialogMode = 'create' | 'rename';

export type ProjectDialogState = {
  isOpen: boolean;
  mode: ProjectDialogMode;
  title: string;
};

const EMPTY_PROJECT_FORM: CreateProjectFormData = {
  title: '',
  description: '',
};

export function useProjectDialogState() {
  const [dialog, setDialog] = useState<ProjectDialogState | null>(null);
  const [draft, setDraft] = useState<CreateProjectFormData>(EMPTY_PROJECT_FORM);

  const openCreateDialog = () => {
    setDraft(EMPTY_PROJECT_FORM);

    setDialog({
      isOpen: true,
      mode: 'create',
      title: 'New project',
    });
  };

  const openRenameDialog = (project: Project | null) => {
    if (!project) {
      return;
    }

    setDraft({
      title: project.title,
      description: project.description,
    });

    setDialog({
      isOpen: true,
      mode: 'rename',
      title: 'Rename project',
    });
  };

  const closeDialog = () => {
    setDialog((currentDialog) => {
      if (!currentDialog) {
        return null;
      }

      return {
        ...currentDialog,
        isOpen: false,
      };
    });
  };

  const resetDialog = () => {
    setDialog(null);
    setDraft(EMPTY_PROJECT_FORM);
  };

  const updateDraft: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [event.target.name]: event.target.value,
    }));
  };

  return {
    closeDialog,
    dialog,
    draft,
    openCreateDialog,
    openRenameDialog,
    resetDialog,
    updateDraft,
  };
}
