import AppContainer from './app-container.tsx';
import {
  InputLabel,
  MenuItem,
  Select,
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
import { Course, fetchCourses } from '../hooks/api/use-courses.ts';
import {
  fetchPreferences,
  fetchPreferencesByIds,
  Preference,
  Preferences as PreferencesType,
} from '../hooks/api/use-get-preferences.ts';
import { fetchGroupById, fetchGroups, Group } from '../hooks/api/use-groups.ts';
import * as moment from 'moment';
import { fetchStudentsByIds, Student } from '../hooks/api/use-students.ts';

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
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
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
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type Votes = {
  [key: string]: number; // Klucz: "Dzień-Godzina", wartość: liczba głosów
};

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
          {hours.map(() => (
            //TODO: Dodanie uśrednionych preferencji studentów zamiast siema
            <StyledTh>siema</StyledTh>
          ))}
        </StyledTr>
      ))}
    </table>
  );
};

export const Planner = () => {
  const [votes, setVotes] = useState<Votes>({});
  const [courses, setCourses] = useState<Course[] | []>([]);
  const [currentCourse, setCurrentCourse] = useState<Course['id'] | null>(null);
  const [groups, setGroups] = useState<Group[] | []>([]);
  const [currentGroup, setCurrentGroup] = useState<Group['id'] | null>(null);
  const [users, setUsers] = useState<User[] | []>([]);
  const { user: currentUser } = useUser();

  useEffect(() => {
    fetchCourses().then(data => {
      setCourses(data);
      setCurrentCourse(data[0].id);
    });
    fetchGroups().then(data => {
      setGroups(data);
      setCurrentGroup(data[0].id);
    });
    fetchUsers().then(data => setUsers(data));
  }, []);

  const addVote = (day: string, hour: string): void => {
    const key = `${day}-${hour}`;
    setVotes(prevVotes => ({
      ...prevVotes,
      [key]: (prevVotes[key] || 0) + 1, // Zwiększ licznik dla danego dnia i godziny
    }));
  };

  //TODO: Do zmiany
  const renderVotes = (): JSX.Element[] =>
    Object.entries(votes).map(([key, count]) => (
      <div key={key}>
        {key}: {count} głosów
      </div>
    ));

  // Do użycia w preferenceIdList
  // for (
  //   let hour = Number(pref.startTime.split(':')[0]);
  //   hour < Number(pref.endTime.split(':')[0]);
  //   hour++
  // ) {
  //   addVote(pref.dayOfWeek, moment(hour, 'HH').format('HH:mm'));
  // }
  const handleGetPreferencesFromGroup = async (currentGroup: Group) => {
    currentGroup.studentIdList.map(async () => {
      const students = await fetchStudentsByIds(currentGroup.studentIdList);
      students.map((student: Student) => {
        student.preferenceIdList.map(async () => {
          const preferences = await fetchPreferencesByIds(
            student.preferenceIdList
          );
          preferences.map((pref: Preference) => {
            for (
              let hour = Number(pref.startTime.split(':')[0]);
              hour < Number(pref.endTime.split(':')[0]);
              hour++
            ) {
              addVote(pref.dayOfWeek, moment(hour, 'HH').format('HH:mm'));
            }
          });
        });
      });
    });
  };

  const handleDeleteUser = async (id: number) => {
    deleteUser(id)
      .then(() => setUsers(users.filter(student => student.id !== id)))
      .catch(() => alert('Failed to delete student!'));
  };

  return (
    <AppContainer title='View your users'>
      <InputLabel id='group'>Group</InputLabel>
      <Select
        labelId='group'
        id='group-select'
        value={currentGroup}
        onChange={async e => {
          setCurrentGroup(e.target.value as Group['id']);
          await handleGetPreferencesFromGroup(
            await fetchGroupById(currentGroup || 0)
          );
        }}
        fullWidth
      >
        {groups.map(group => (
          <MenuItem key={group.id} value={group.id}>
            {group.name}
          </MenuItem>
        ))}
      </Select>
      <InputLabel id='course'>Course</InputLabel>
      <Select
        labelId='course'
        id='course-select'
        value={currentCourse}
        onChange={e => setCurrentCourse(e.target.value as Course['id'])}
        fullWidth
      >
        {courses.map(course => (
          <MenuItem key={course.id} value={course.id}>
            {course.name}
          </MenuItem>
        ))}
      </Select>
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
