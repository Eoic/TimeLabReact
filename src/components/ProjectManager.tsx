import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { useId, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { ProjectDialog } from './ProjectDialog';
import type { Project } from '../database/entities';
import type { CreateProjectFormData } from '../forms/project';
import { useProjects } from '../hooks/useProjects';

type ProjectDialogMode = 'create' | 'rename';

type ProjectDialogState = {
  title: string;
  isOpen: boolean;
  mode: ProjectDialogMode;
};

type ErrorSnackbarState = {
  isOpen: boolean;
  message: string | null;
};

type DeleteDialogState = {
  isOpen: boolean;
  project: Project | null;
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}

export function ProjectManager() {
  const nameInputId = useId();
  const projects = useProjects();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [projectDialog, setProjectDialog] = useState<ProjectDialogState | null>(null);
  const [draftState, setDraftState] = useState<CreateProjectFormData>({ title: '', description: '' });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ isOpen: false, project: null });
  const [errorSnackbar, setErrorSnackbar] = useState<ErrorSnackbarState>({
    isOpen: false,
    message: null,
  });

  const selectedProject = useMemo(() => {
    if (projects.isLoading) {
      return null;
    }

    const availableProjects = projects.data ?? [];

    return availableProjects.find((project) => project.isSelected) ?? availableProjects[0] ?? null;
  }, [projects.data, projects.isLoading]);

  const canDeleteSelectedProject = Boolean(selectedProject && (projects.data?.length ?? 0) > 1);
  const isProjectMenuOpen = !projects.isLoading && Boolean(anchorElement);

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
      message: null,
    }));
  };

  const closeProjectMenu = () => {
    setAnchorElement(null);
  };

  const openProjectMenu = (event: MouseEvent<HTMLButtonElement>) => {
    if (projects.isLoading) {
      return;
    }

    setAnchorElement(event.currentTarget);
  };

  const openCreateDialog = () => {
    setDraftState({ title: '', description: '' });

    setProjectDialog({
      isOpen: true,
      mode: 'create',
      title: 'New project',
    });

    closeProjectMenu();
  };

  const openRenameDialog = () => {
    if (!selectedProject) {
      return;
    }

    setDraftState({
      title: selectedProject.title,
      description: selectedProject.description,
    });

    setProjectDialog({
      isOpen: true,
      mode: 'rename',
      title: 'Rename project',
    });

    closeProjectMenu();
  };

  const openDeleteDialog = () => {
    if (!canDeleteSelectedProject || !selectedProject) {
      return;
    }

    setDeleteDialog({
      isOpen: true,
      project: selectedProject,
    });
    closeProjectMenu();
  };

  const closeProjectDialog = () => {
    setProjectDialog((currentDialog) =>
      currentDialog === null
        ? currentDialog
        : {
            ...currentDialog,
            isOpen: false,
          },
    );
  };

  const resetProjectDialog = () => {
    setProjectDialog(null);
    setDraftState({ title: '', description: '' });
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

  const saveProjectDialog = () => {
    const title = draftState.title.trim();
    const description = draftState.description;

    if (!title) {
      return;
    }

    if (!projectDialog?.mode) {
      return;
    }

    const projectData: CreateProjectFormData = {
      title,
      description,
    };

    switch (projectDialog.mode) {
      case 'create': {
        void projects.createProject(projectData).catch((error) => {
          showError(error, 'Failed to create project.');
        });

        break;
      }
      case 'rename': {
        if (!selectedProject) {
          break;
        }

        void projects.updateProject(selectedProject.id, projectData).catch((error) => {
          showError(error, 'Failed to rename project.');
        });

        break;
      }
      default:
        break;
    }

    closeProjectDialog();
  };

  const deleteSelectedProject = () => {
    if (!deleteDialog.project) {
      return;
    }

    void projects
      .deleteProject(deleteDialog.project.id)
      .then((deleted) => {
        if (deleted) {
          closeDeleteDialog();
        }
      })
      .catch((error) => {
        showError(error, 'Failed to delete project.');
      });
  };

  return (
    <>
      <Button
        aria-controls={isProjectMenuOpen ? 'project-manager-menu' : undefined}
        aria-expanded={isProjectMenuOpen ? 'true' : undefined}
        aria-haspopup="menu"
        aria-busy={projects.isLoading || undefined}
        disabled={projects.isLoading}
        endIcon={projects.isLoading ? undefined : <MaterialSymbol name="keyboard_arrow_down" />}
        id="project-manager-button"
        onClick={openProjectMenu}
        size="small"
        startIcon={
          projects.isLoading ? <CircularProgress color="inherit" size={18} /> : <MaterialSymbol name="folder" />
        }
        sx={{
          justifyContent: 'space-between',
          maxWidth: {
            sm: 280,
            xs: 180,
          },
          minWidth: 0,
        }}
        variant="outlined"
      >
        <Typography component="span" noWrap variant="button">
          {projects.isLoading ? 'Loading projects' : selectedProject ? selectedProject.title : 'No project selected'}
        </Typography>
      </Button>

      <Menu
        anchorEl={anchorElement}
        id="project-manager-menu"
        onClose={closeProjectMenu}
        open={isProjectMenuOpen}
        slotProps={{
          list: {
            'aria-labelledby': 'project-manager-button',
          },
          paper: {
            sx: {
              minWidth: 260,
            },
          },
        }}
      >
        {(projects.data ?? []).map((project) => (
          <MenuItem
            key={project.id}
            onClick={() => {
              void projects.selectProject(project.id).catch((error) => {
                showError(error, 'Failed to select project.');
              });
              closeProjectMenu();
            }}
            selected={project.id === selectedProject?.id}
          >
            {project.title}
          </MenuItem>
        ))}

        <MenuItem onClick={openCreateDialog}>
          <ListItemIcon>
            <MaterialSymbol name="add" />
          </ListItemIcon>
          New project
        </MenuItem>
        <MenuItem onClick={openRenameDialog}>
          <ListItemIcon>
            <MaterialSymbol name="edit" />
          </ListItemIcon>
          Rename project
        </MenuItem>
        <MenuItem disabled={!canDeleteSelectedProject} onClick={openDeleteDialog}>
          <ListItemIcon>
            <MaterialSymbol name="delete" />
          </ListItemIcon>
          Delete project
        </MenuItem>
      </Menu>

      <ProjectDialog
        id={nameInputId}
        isOpen={projectDialog?.isOpen ?? false}
        onChange={(event) =>
          setDraftState({
            ...draftState,
            [event.target.name]: event.target.value,
          })
        }
        values={draftState}
        onClose={closeProjectDialog}
        onExited={resetProjectDialog}
        onSave={saveProjectDialog}
        title={projectDialog?.title ?? ''}
      />

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={closeDeleteDialog}
        open={deleteDialog.isOpen}
        disableAutoFocus
        slotProps={{
          transition: {
            onExited: resetDeleteDialog,
          },
        }}
      >
        <DialogTitle>Delete project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete {deleteDialog.project?.title}? This removes the project from this session.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button color="error" onClick={deleteSelectedProject} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        autoHideDuration={6000}
        onClose={closeErrorSnackbar}
        open={errorSnackbar.isOpen}
        slotProps={{
          transition: {
            onExited: resetErrorSnackbar,
          },
        }}
      >
        <Alert onClose={closeErrorSnackbar} severity="error" variant="filled">
          {errorSnackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
