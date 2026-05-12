import Box from '@mui/material/Box';
import { Header } from './component/Header';
import { SecondaryHeader } from './component/SecondaryHeader';

function App() {
  return (
    <Box
      component="main"
      sx={{
        bgcolor: 'background.default',
        minHeight: '100svh',
      }}
    >
      <Header />
      <SecondaryHeader />
    </Box>
  );
}

export default App;
