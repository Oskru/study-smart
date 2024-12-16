import AppContainer from './app-container.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from '../hooks/use-user.ts';
import { useUsersQuery, useDeleteUserMutation } from '../hooks/api/use-users';
import { useSnackbar } from 'notistack';

export const Students = () => {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const { data: students = [] } = useUsersQuery(true); // onlyStudents = true
  const deleteUserMutation = useDeleteUserMutation();

  const deleteStudent = (id: number) => {
    deleteUserMutation.mutate(id, {
      onSuccess: () => {
        enqueueSnackbar('Student usunięty pomyślnie!', {
          variant: 'success',
        });
      },
      onError: (error: any) => {
        enqueueSnackbar(`Błąd podczas usuwania studenta: ${error}`, {
          variant: 'error',
        });
      },
    });
  };

  return (
    <AppContainer title='Studenci'>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Imię</TableCell>
            <TableCell>Nazwisko</TableCell>
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
              {user?.userRole === 'ADMIN' && (
                <TableCell>
                  <IconButton onClick={() => deleteStudent(student.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AppContainer>
  );
};
