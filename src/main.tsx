import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { MuiThemeBridge } from './theme/MuiThemeBridge';
import { ThemeProvider } from './theme/ThemeProvider';
import './styles/main.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <MuiThemeBridge>
        <App />
      </MuiThemeBridge>
    </ThemeProvider>
  </StrictMode>,
);
