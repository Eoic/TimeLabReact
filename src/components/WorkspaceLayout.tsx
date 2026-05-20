import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MaterialSymbol } from './MaterialSymbol';
import { PlotConfiguration } from './PlotConfiguration';
import type { MaterialSymbolName } from './MaterialSymbol';

type PanelHeaderProps = {
  icon: MaterialSymbolName;
  title: string;
};

type WorkspacePanelProps = PanelHeaderProps & {
  children?: React.ReactNode;
  component?: 'aside' | 'section';
  hasToolbarGutters?: boolean;
};

function PanelHeader({ icon, title }: PanelHeaderProps) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        gap: 1,
        mb: 1,
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
  hasToolbarGutters = false,
  icon,
  title,
}: WorkspacePanelProps) {
  return (
    <Box
      component={component}
      sx={{
        bgcolor: 'background.paper',
        height: {
          lg: '100%',
          xs: 'auto',
        },
        minHeight: {
          lg: 0,
          xs: 'auto',
        },
        minWidth: 0,
        overflow: {
          lg: 'auto',
          xs: 'visible',
        },
        px: hasToolbarGutters
          ? {
              sm: 3,
              xs: 2,
            }
          : {
              sm: 3,
              lg: 2,
              xs: 2,
            },
        py: {
          lg: 2,
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
          lg: '"data center inspector"',
          xs: '"center" "data" "inspector"',
        },
        gridTemplateColumns: {
          lg: '300px minmax(600px, 1fr) 300px',
          xs: 'minmax(0, 1fr)',
        },
        gridTemplateRows: {
          lg: 'minmax(0, 1fr)',
          xs: 'auto auto auto',
        },
        minHeight: 0,
        overflow: {
          lg: 'hidden',
          xs: 'auto',
        },
      }}
    >
      <Box
        sx={{
          borderBottomColor: 'divider',
          borderBottomStyle: 'solid',
          borderBottomWidth: {
            lg: 0,
            xs: 1,
          },
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          gridArea: 'center',
          minHeight: {
            lg: 0,
            xs: 'auto',
          },
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            flex: {
              lg: '2 1 0',
              xs: '0 0 auto',
            },
            minHeight: {
              lg: 0,
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
              lg: '1 1 0',
              xs: '0 0 auto',
            },
            borderTopColor: 'divider',
            borderTopStyle: 'solid',
            borderTopWidth: 1,
            maxHeight: {
              lg: 370,
              xs: 'none',
            },
            minHeight: {
              lg: 0,
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
            lg: 0,
            xs: 1,
          },
          borderRightColor: 'divider',
          borderRightStyle: 'solid',
          borderRightWidth: {
            lg: 1,
            xs: 0,
          },
          gridArea: 'data',
          minHeight: {
            lg: 0,
            xs: 'auto',
          },
          minWidth: 0,
        }}
      >
        <WorkspacePanel component="aside" hasToolbarGutters icon="tune" title="Plot configuration">
          <PlotConfiguration />
        </WorkspacePanel>
      </Box>

      <Box
        sx={{
          borderLeftColor: 'divider',
          borderLeftStyle: 'solid',
          borderLeftWidth: {
            lg: 1,
            xs: 0,
          },
          borderTopColor: 'divider',
          borderTopStyle: 'solid',
          borderTopWidth: {
            lg: 0,
            xs: 1,
          },
          gridArea: 'inspector',
          minHeight: {
            lg: 0,
            xs: 'auto',
          },
          minWidth: 0,
        }}
      >
        <WorkspacePanel component="aside" icon="label" title="Labels">
          <Typography color="text.secondary" variant="body2">
            Selection details and labeling tools.
          </Typography>
        </WorkspacePanel>
      </Box>
    </Box>
  );
}
