import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { MaterialSymbol } from '../MaterialSymbol';
import type { Project } from '../../database/models/project';

type ProjectMenuProps = {
  isLoading: boolean;
  projects: readonly Project[];
  selectedProject: Project | null;
  onCreate: VoidFunction;
  onDelete: VoidFunction;
  onRename: VoidFunction;
  onSelect: (id: string) => void;
};

export function ProjectMenu({
  isLoading,
  onCreate,
  onDelete,
  onRename,
  onSelect,
  projects,
  selectedProject,
}: ProjectMenuProps) {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorElement);
  const canDeleteSelectedProject = Boolean(selectedProject) && projects.length > 1;

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorElement(null);
  };

  const runMenuAction = (action: VoidFunction) => {
    closeMenu();
    action();
  };

  return (
    <>
      <Button
        aria-controls={isOpen ? 'project-manager-menu' : undefined}
        aria-expanded={isOpen ? 'true' : undefined}
        aria-haspopup="menu"
        aria-busy={isLoading || undefined}
        disabled={isLoading}
        endIcon={isLoading ? undefined : <MaterialSymbol name="keyboard_arrow_down" />}
        id="project-manager-button"
        onClick={openMenu}
        size="small"
        startIcon={<MaterialSymbol name="folder_open" />}
        sx={{
          justifyContent: 'flex-start',
          minWidth: 0,
          textTransform: 'none',
          width: {
            xs: 148,
            sm: 148,
          },
          '& .MuiButton-endIcon': {
            ml: 'auto',
          },
          '& .MuiButton-startIcon': {
            mr: 1,
          },
        }}
        variant="outlined"
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {isLoading ? 'Loading projects' : selectedProject ? selectedProject.title : 'No project selected'}
        </span>
      </Button>

      <Menu
        anchorEl={anchorElement}
        id="project-manager-menu"
        onClose={closeMenu}
        open={isOpen}
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
              closeMenu();
              onSelect(project.id);
            }}
            selected={project.id === selectedProject?.id}
          >
            {project.title}
          </MenuItem>
        ))}
        <MenuItem onClick={() => runMenuAction(onCreate)}>
          <ListItemIcon>
            <MaterialSymbol name="add" />
          </ListItemIcon>
          New project
        </MenuItem>
        <MenuItem disabled={!selectedProject} onClick={() => runMenuAction(onRename)}>
          <ListItemIcon>
            <MaterialSymbol name="edit" />
          </ListItemIcon>
          Rename project
        </MenuItem>
        <MenuItem disabled={!canDeleteSelectedProject} onClick={() => runMenuAction(onDelete)}>
          <ListItemIcon>
            <MaterialSymbol name="delete" />
          </ListItemIcon>
          Delete project
        </MenuItem>
      </Menu>
    </>
  );
}
