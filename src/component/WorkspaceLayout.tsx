import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MaterialSymbol } from './MaterialSymbol';
import type { MaterialSymbolName } from './MaterialSymbol';

type PanelHeaderProps = {
  icon: MaterialSymbolName;
  title: string;
};

type WorkspacePanelProps = PanelHeaderProps & {
  children?: React.ReactNode;
  component?: 'aside' | 'section';
};

function PanelHeader({ icon, title }: PanelHeaderProps) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        gap: 1,
        mb: 2,
        minWidth: 0,
      }}
    >
      <Box
        aria-hidden
        sx={{
          color: 'primary.main',
          display: 'flex',
        }}
      >
        <MaterialSymbol name={icon} />
      </Box>
      <Typography component="h2" noWrap variant="subtitle2">
        {title}
      </Typography>
    </Box>
  );
}

function WorkspacePanel({
  children,
  component = 'section',
  icon,
  title,
}: WorkspacePanelProps) {
  return (
    <Box
      component={component}
      sx={{
        bgcolor: 'background.paper',
        height: {
          md: '100%',
          xs: 'auto',
        },
        minHeight: {
          md: 0,
          xs: 'auto',
        },
        minWidth: 0,
        overflow: {
          md: 'auto',
          xs: 'visible',
        },
        p: {
          md: 2,
          xs: 1.5,
        },
      }}
    >
      <PanelHeader icon={icon} title={title} />
      {children}
    </Box>
  );
}

export function WorkspaceLayout() {
  return (
    <Box
      component="main"
      sx={{
        bgcolor: 'background.default',
        display: 'grid',
        flex: '1 1 auto',
        gap: 0,
        gridTemplateAreas: {
          md: '"data center inspector"',
          xs: '"center" "data" "inspector"',
        },
        gridTemplateColumns: {
          md: '360px minmax(0, 1fr) 360px',
          xs: 'minmax(0, 1fr)',
        },
        gridTemplateRows: {
          md: 'minmax(0, 1fr)',
          xs: 'auto auto auto',
        },
        minHeight: 0,
        overflow: {
          md: 'hidden',
          xs: 'auto',
        },
      }}
    >
      <Box
        sx={{
          borderBottomColor: 'divider',
          borderBottomStyle: 'solid',
          borderBottomWidth: {
            md: 0,
            xs: 1,
          },
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          gridArea: 'center',
          minHeight: {
            md: 0,
            xs: 'auto',
          },
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            flex: {
              md: '2 1 0',
              xs: '0 0 auto',
            },
            minHeight: {
              md: 0,
              xs: 320,
            },
          }}
        >
          <WorkspacePanel icon="vital_signs" title="Signal viewer">
            <Typography color="text.secondary" variant="body2">
              Primary time-series visualization panel.
            </Typography>
          </WorkspacePanel>
        </Box>

        <Box
          sx={{
            flex: {
              md: '1 1 0',
              xs: '0 0 auto',
            },
            borderTopColor: 'divider',
            borderTopStyle: 'solid',
            borderTopWidth: 1,
            maxHeight: {
              md: 370,
              xs: 'none',
            },
            minHeight: {
              md: 0,
              xs: 'auto',
            },
          }}
        >
          <WorkspacePanel icon="pending_actions" title="Label timeline">
            <Typography color="text.secondary" variant="body2">
              Label intervals, review states, and annotation context.
            </Typography>
          </WorkspacePanel>
        </Box>
      </Box>

      <Box
        sx={{
          borderBottomColor: 'divider',
          borderBottomStyle: 'solid',
          borderBottomWidth: {
            md: 0,
            xs: 1,
          },
          borderRightColor: 'divider',
          borderRightStyle: 'solid',
          borderRightWidth: {
            md: 1,
            xs: 0,
          },
          gridArea: 'data',
          minHeight: {
            md: 0,
            xs: 'auto',
          },
          minWidth: 0,
        }}
      >
        <WorkspacePanel component="aside" icon="database" title="Data sources">
          <Typography color="text.secondary" variant="body2">
            Project inputs and time-series collections.
          </Typography>
        </WorkspacePanel>
      </Box>

      <Box
        sx={{
          borderLeftColor: 'divider',
          borderLeftStyle: 'solid',
          borderLeftWidth: {
            md: 1,
            xs: 0,
          },
          borderTopColor: 'divider',
          borderTopStyle: 'solid',
          borderTopWidth: {
            md: 0,
            xs: 1,
          },
          gridArea: 'inspector',
          minHeight: {
            md: 0,
            xs: 'auto',
          },
          minWidth: 0,
        }}
      >
        <WorkspacePanel component="aside" icon="grid_view" title="Inspector">
          <Typography color="text.secondary" variant="body2">
            Selection details and labeling tools.
          </Typography>
        </WorkspacePanel>
      </Box>
    </Box>
  );
}
