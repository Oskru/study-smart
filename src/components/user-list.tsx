import React, { useEffect, useState } from 'react';
import AppContainer from './app-container.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchUsers, deleteUser, User } from '../hooks/api/use-users.ts';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers().then((data) => {
      setUsers(data);
      setFilteredUsers(data);
    });
  }, []);

  const handleDeleteUser = async (id: number) => {
    deleteUser(id)
      .then(() => {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        setFilteredUsers((prev) => prev.filter((user) => user.id !== id));
      })
      .catch(() => alert('Failed to delete user!'));
  };

  const handleRoleFilterChange = (role: string) => {
    setSelectedRole(role);
    if (role === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.role === role));
    }
  };

  return (
    <AppContainer title="Lista użytkowników">
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Filtruj według roli</InputLabel>
        <Select
          value={selectedRole}
          onChange={(e) => handleRoleFilterChange(e.target.value)}
        >
          <MenuItem value="">Wszystkie</MenuItem>
          <MenuItem value="ADMIN">Admin</MenuItem>
          <MenuItem value="PLANNER">Planner</MenuItem>
          <MenuItem value="STUDENT">Student</MenuItem>
          <MenuItem value="LECTURER">Lecturer</MenuItem>
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
          {filteredUsers.map((user) => (
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
    </AppContainer>
  );
};

export default UserList;
