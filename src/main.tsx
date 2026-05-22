import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { MuiThemeBridge } from './theme/MuiThemeBridge';
import { ThemeProvider } from './theme/ThemeProvider';
import './styles/main.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <MuiThemeBridge>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </MuiThemeBridge>
    </ThemeProvider>
  </StrictMode>,
);
