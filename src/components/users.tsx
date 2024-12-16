import { useState } from 'react';
import AppContainer from './app-container.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useUsersQuery,
  useDeleteUserMutation,
} from '../hooks/api/use-users.ts';
import { useSnackbar } from 'notistack';

const UserList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: users = [] } = useUsersQuery(); // fetch all users
  const deleteUserMutation = useDeleteUserMutation();

  const [selectedRole, setSelectedRole] = useState<string>('');

  const filteredUsers =
    selectedRole === ''
      ? users
      : users.filter(user => user.role === selectedRole);

  const handleDeleteUser = (id: number) => {
    deleteUserMutation.mutate(id, {
      onSuccess: () => {
        enqueueSnackbar('User deleted successfully!', { variant: 'success' });
      },
      onError: (error: any) => {
        enqueueSnackbar(`Failed to delete user: ${error}`, {
          variant: 'error',
        });
      },
    });
  };

  return (
    <Box
      display={'flex'}
      flexDirection='column'
      gap={2}
      component={AppContainer}
      title='User List'
    >
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Filtruj według roli</InputLabel>
        <Select
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
        >
          <MenuItem value=''>Wszystkie</MenuItem>
          <MenuItem value='ADMIN'>Admin</MenuItem>
          <MenuItem value='PLANNER'>Planner</MenuItem>
          <MenuItem value='STUDENT'>Student</MenuItem>
          <MenuItem value='LECTURER'>Lecturer</MenuItem>
        </Select>
      </FormControl>

      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Imię</TableCell>
            <TableCell>Nazwisko</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rola</TableCell>
            <TableCell>Opcje</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDeleteUser(user.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default UserList;
