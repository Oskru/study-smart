import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppContainer from './app-container.tsx';
import { Button, Box } from '@mui/material';

export const Admin = () => {
  const navigate = useNavigate();

  return (
    <AppContainer title="Panel Administratora">
      <Box display="flex" gap={2}>
        <Button onClick={() => navigate('users')} variant="contained">
          Lista Użytkowników
        </Button>
        <Button onClick={() => navigate('add-planner')} variant="contained">
          Dodaj Planistę
        </Button>
      </Box>
      <Outlet /> {/* Renderowanie dzieci (UserList, AddPlanner) */}
    </AppContainer>
  );
};

export default Admin;
