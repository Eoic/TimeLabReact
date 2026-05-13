import Box from '@mui/material/Box';
import { Header } from './component/Header';
import { SecondaryHeader } from './component/SecondaryHeader';
import { WorkspaceLayout } from './component/WorkspaceLayout';

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
