import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/auth/auth-context.tsx';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
// @ts-ignore
import '@fontsource/inter';
import AppTheme from './copied-material/shared-theme/AppTheme.tsx';
import CssBaseline from '@mui/material/CssBaseline';
import ColorModeSelect from './copied-material/shared-theme/ColorModeSelect.tsx';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Routes from './components/routes.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

const StyledPage = styled(Stack)(() => ({
  padding: '20px',
}));

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppTheme>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <StyledPage>
            <CssBaseline enableColorScheme />
            <Routes />
            <ColorModeSelect
              sx={{ position: 'fixed', top: '1rem', right: '1rem' }}
            />
          </StyledPage>
        </SnackbarProvider>
      </AppTheme>
    </AuthProvider>
  </QueryClientProvider>
);
