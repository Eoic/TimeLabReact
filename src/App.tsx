import Box from '@mui/material/Box';
import { Header } from './components/Header';
import { SecondaryHeader } from './components/SecondaryHeader';
import { WorkspaceLayout } from './components/WorkspaceLayout';

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
      <Header />
      <SecondaryHeader />
      <WorkspaceLayout />
    </Box>
  );
}

export default App;
