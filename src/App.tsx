import Box from '@mui/material/Box';
import { Header } from './component/Header';

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
    </Box>
  );
}

export default App;
