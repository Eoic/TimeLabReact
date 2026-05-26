import Box from '@mui/material/Box';
import { Header } from './components/Header';
import { SecondaryHeader } from './components/SecondaryHeader';
import { WorkspaceLayout } from './components/WorkspaceLayout';
import { ProjectsProvider } from './context/ProjectsProvider';

function App() {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        height: '100svh',
        overflow: 'hidden',
      }}
    >
      <ProjectsProvider>
        <Header />
        <SecondaryHeader />
        <WorkspaceLayout />
      </ProjectsProvider>
    </Box>
  );
}

export default App;
