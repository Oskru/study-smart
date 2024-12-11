import AppContainer from './app-container.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchUsers, deleteUser, User } from '../hooks/api/use-users.ts';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from '../hooks/use-user.ts';
import styled from '@emotion/styled';

const StyledTh = styled.th`
  border: 1px solid lightgray;
`;

const StyledTr = styled.tr`
  border: 1px solid lightgray;
`;

const StyledTd = styled.td`
  border: 1px solid lightgray;
`;

const hours = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const PreferenceTable = () => {
  return (
    <table>
      <StyledTr>
        <StyledTh>Day</StyledTh>
        {hours.map(item => (
          <StyledTh>{item}</StyledTh>
        ))}
      </StyledTr>
      {days.map(item => (
        <StyledTr>
          <StyledTd>{item}</StyledTd>
          {hours.map(item => (
            //TODO: Dodanie uśrednionych preferencji studentów zamiast siema
            <StyledTh>siema</StyledTh>
          ))}
        </StyledTr>
      ))}
    </table>
  );
};

export const Planner = () => {
  const [users, setUsers] = useState<User[] | []>([]);
  const { user: currentUser } = useUser();

  const handleDeleteUser = async (id: number) => {
    deleteUser(id)
      .then(() => setUsers(users.filter(student => student.id !== id)))
      .catch(() => alert('Failed to delete student!'));
  };

  useEffect(() => {
    fetchUsers().then(data => setUsers(data));
  }, []);

  return (
    <AppContainer title='View your users'>
      <PreferenceTable />
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>First name</TableCell>
            <TableCell>Last name</TableCell>
            <TableCell>Email</TableCell>
            {currentUser?.userRole === 'ADMIN' ? (
              <TableCell>Options</TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow
              key={user.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              {currentUser?.userRole === 'ADMIN' ? (
                <TableCell>
                  <IconButton onClick={() => handleDeleteUser(user.id)}>
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
