import AppContainer from './app-container.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { deleteUser, fetchUsers, User } from '../hooks/api/use-users.ts';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from '../hooks/use-user.ts';

export const Students = () => {
  const [students, setStudents] = useState<User[] | []>([]);
  const { user } = useUser();

  const deleteStudent = async (id: number) => {
    deleteUser(id)
      .then(() => setStudents(students.filter(student => student.id !== id)))
      .catch(() => alert('Failed to delete student!'));
  };

  useEffect(() => {
    fetchUsers(true).then(data => setStudents(data));
  }, []);

  return (
    <AppContainer title='View your students'>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>First name</TableCell>
            <TableCell>Last name</TableCell>
            <TableCell>Email</TableCell>
            {user?.userRole === 'ADMIN' ? <TableCell>Options</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map(student => (
            <TableRow
              key={student.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{student.firstName}</TableCell>
              <TableCell>{student.lastName}</TableCell>
              <TableCell>{student.email}</TableCell>
              {user?.userRole === 'ADMIN' ? (
                <TableCell>
                  <IconButton onClick={() => deleteStudent(student.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AppContainer>
  );
};
