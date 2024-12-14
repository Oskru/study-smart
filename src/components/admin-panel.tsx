import { Outlet, useNavigate } from 'react-router-dom';
import AppContainer from './app-container.tsx';
import { Button, Box } from '@mui/material';

export const Admin = () => {
  const navigate = useNavigate();

  return (
    <AppContainer title='Panel Administratora'>
      <Box display='flex' flexDirection='column' gap={4}>
        <Box display='flex' gap={4}>
          <Button onClick={() => navigate('users')} variant='contained'>
            Lista Użytkowników
          </Button>
          <Button onClick={() => navigate('add-planner')} variant='contained'>
            Dodaj Planistę
          </Button>
        </Box>
        <Outlet /> {/* Renderowanie dzieci (UserList, AddPlanner) */}
      </Box>
    </AppContainer>
  );
};

export default Admin;
