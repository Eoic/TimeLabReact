import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useId, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

type Project = {
  id: string;
  name: string;
};

type ProjectDialogMode = 'create' | 'rename';

const defaultProject: Project = {
  id: 'default',
  name: 'Untitled',
};

export function ProjectManager() {
  const nameInputId = useId();
  const [projects, setProjects] = useState<Project[]>([defaultProject]);
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProject.id);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [dialogMode, setDialogMode] = useState<ProjectDialogMode | null>(null);
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
    setDialogMode('create');
    closeProjectMenu();
  };

  const openRenameDialog = () => {
    setDraftName(selectedProject.name);
    setDialogMode('rename');
    closeProjectMenu();
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
    closeProjectMenu();
  };

  const closeProjectDialog = () => {
    setDialogMode(null);
    setDraftName('');
  };

  const saveProjectDialog = () => {
    const trimmedName = draftName.trim();

    if (!trimmedName) {
      return;
    }

    if (dialogMode === 'create') {
      const newProject = {
        id: crypto.randomUUID(),
        name: trimmedName,
      };

      setProjects((currentProjects) => [...currentProjects, newProject]);
      setSelectedProjectId(newProject.id);
    }

    if (dialogMode === 'rename') {
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === selectedProject.id ? { ...project, name: trimmedName } : project,
        ),
      );
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
        startIcon={<MaterialSymbol name="folder" />}
        variant="outlined"
      >
        {selectedProject.name}
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

      <Dialog fullWidth maxWidth="xs" onClose={closeProjectDialog} open={dialogMode !== null}>
        <DialogTitle>{dialogMode === 'create' ? 'New project' : 'Rename project'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            id={nameInputId}
            label="Project name"
            margin="dense"
            onChange={(event) => {
              setDraftName(event.target.value);
            }}
            value={draftName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProjectDialog}>Cancel</Button>
          <Button disabled={!draftName.trim()} onClick={saveProjectDialog} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
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
