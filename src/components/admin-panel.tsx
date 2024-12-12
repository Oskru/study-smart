import AppContainer from './app-container.tsx';
import { Fab } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchUsers, User } from '../hooks/api/use-users.ts';
import { useUser } from '../hooks/use-user.ts';
import AddIcon from '@mui/icons-material/Add';

export const Admin = () => {
  const [users, setUsers] = useState<User[] | []>([]);
  const { user: currentUser } = useUser();

  useEffect(() => {
    fetchUsers().then(data => setUsers(data));
  }, []);

  return (
    <AppContainer title='Admin Panel'>
      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>
    </AppContainer>
  );
};
