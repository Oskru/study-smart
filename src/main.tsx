import { createRoot } from 'react-dom/client';
import App from './app.tsx';
import { AuthContext } from './context/auth/auth-context.ts';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
// @ts-ignore
import '@fontsource/inter';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './login.tsx';
import SignUp from './copied-material/sign-up/SignUp.tsx';
import AppTheme from './copied-material/shared-theme/AppTheme.tsx';
import CssBaseline from '@mui/material/CssBaseline';
import ColorModeSelect from './copied-material/shared-theme/ColorModeSelect.tsx';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Preferences from './preferences.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <SignUp />,
  },
  {
    path: '/preferences',
    element: <Preferences />,
  },
]);

const StyledPage = styled(Stack)(() => ({
  padding: '10px',
}));

createRoot(document.getElementById('root')!).render(
  <AuthContext.Provider value={{ user: null, setUser: () => {} }}>
    <AppTheme>
      <StyledPage>
        <CssBaseline enableColorScheme />
        <RouterProvider router={router} />
        <ColorModeSelect
          sx={{ position: 'fixed', top: '1rem', right: '1rem' }}
        />
      </StyledPage>
    </AppTheme>
  </AuthContext.Provider>
);
