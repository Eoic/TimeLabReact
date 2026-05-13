import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useId, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { ProjectDialog } from './ProjectDialog';

type Project = {
  id: string;
  name: string;
};

type ProjectDialogMode = 'create' | 'rename';

type ProjectDialogState = {
  title: string;
  isOpen: boolean;
  mode: ProjectDialogMode;
};

const defaultProject: Project = {
  id: 'default',
  name: 'Untitled',
};

export function ProjectManager() {
  const nameInputId = useId();
  const [projects, setProjects] = useState<Project[]>([defaultProject]);
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProject.id);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [projectDialog, setProjectDialog] = useState<ProjectDialogState | null>(null);
  const [draftName, setDraftName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? defaultProject,
    [projects, selectedProjectId],
  );

  const canDeleteSelectedProject = projects.length > 1;
  const isProjectMenuOpen = Boolean(anchorElement);

  const closeProjectMenu = () => {
    setAnchorElement(null);
  };

  const openProjectMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const openCreateDialog = () => {
    setDraftName('');

    setProjectDialog({
      isOpen: true,
      mode: 'create',
      title: 'New project'
    });

    closeProjectMenu();
  };

  const openRenameDialog = () => {
    setDraftName(selectedProject.name);

    setProjectDialog({
      isOpen: true,
      mode: 'rename',
      title: 'Rename project'
    });

    closeProjectMenu();
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
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
    setDraftName('');
  };

  const saveProjectDialog = () => {
    const trimmedName = draftName.trim();

    if (!trimmedName) {
      return;
    }

    if (!projectDialog?.mode){
      return;
    }

    switch (projectDialog.mode) {
      case 'create': {
        const newProject = {
          id: crypto.randomUUID(),
          name: trimmedName,
        };

        setProjects((currentProjects) => [...currentProjects, newProject]);
        setSelectedProjectId(newProject.id);
        break;
      }
      case 'rename': {
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === selectedProject.id ? { ...project, name: trimmedName } : project,
          ),
        );

        break;
      }
      default:
        break;
    }

    closeProjectDialog();
  };

  const deleteSelectedProject = () => {
    if (!canDeleteSelectedProject) {
      return;
    }

    setProjects((currentProjects) => {
      const nextProjects = currentProjects.filter((project) => project.id !== selectedProject.id);
      setSelectedProjectId(nextProjects[0]?.id ?? defaultProject.id);

      return nextProjects.length > 0 ? nextProjects : [defaultProject];
    });

    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Button
        aria-controls={isProjectMenuOpen ? 'project-manager-menu' : undefined}
        aria-expanded={isProjectMenuOpen ? 'true' : undefined}
        aria-haspopup="menu"
        endIcon={<MaterialSymbol name="keyboard_arrow_down" />}
        id="project-manager-button"
        onClick={openProjectMenu}
        size="small"
        startIcon={<MaterialSymbol name="folder" />}
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
          {selectedProject.name}
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
        {projects.map((project) => (
          <MenuItem
            key={project.id}
            onClick={() => {
              setSelectedProjectId(project.id);
              closeProjectMenu();
            }}
            selected={project.id === selectedProject.id}
          >
            {project.name}
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
        value={draftName}
        isOpen={projectDialog?.isOpen ?? false}
        onChange={(event) => setDraftName(event.target.value)}
        onClose={closeProjectDialog}
        onExited={resetProjectDialog}
        onSave={saveProjectDialog}
        title={projectDialog?.title ?? ''}
      />

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        disableAutoFocus
      >
        <DialogTitle>Delete project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete {selectedProject.name}? This removes the project from this session.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={deleteSelectedProject} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
