import AppContainer from './app-container.tsx';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchUsers, deleteUser, User } from '../hooks/api/use-users.ts';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
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
import {
  deleteGroup,
  editGroup,
  fetchGroupById,
  fetchGroups,
  Group,
  Groups,
  postGroup,
} from '../hooks/api/use-groups.ts';
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
  const { user: currentUser } = useUser();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Groups>([]);
  const [currentGroup, setCurrentGroup] = useState<Group['id'] | null>(null);

  const handleEditOpen = async (id: number) => {
    try {
      const data = await fetchGroupById(id);

      setCurrentGroup({
        name: data ? data.name : 'Coś nie poszło',
        studentIdList: data ? data.studentIdList : [],
      });

      setEditDialogOpen(true); // Wywołanie dopiero po ustawieniu danych
    } catch (error) {
      alert('Failed to fetch group data!');
      console.error(error);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    deleteGroup(id)
      .then(() => setGroups(groups.filter(group => group.id !== id)))
      .catch(() => alert('Failed to delete group!'));
  };

  const handleAddOpen = () => {
    setCurrentGroup({
      name: '',
      studentIdList: [],
    });
    setAddDialogOpen(true);
  };

  const handleAddConfirm = () => {
    setAddDialogOpen(false);
    postGroup(currentGroup as Group)
      .then(() => {
        setGroups(prev => [...prev, currentGroup]);
      })
      .catch(error => {
        alert(`Error while posting preference: ${error}`);
      });
  };

  const handleEditConfirm = async (id: number) => {
    setAddDialogOpen(false);
    editGroup(id, currentGroup as Group)
      .then(() => {
        setGroups(prev => [...prev, currentGroup]);
      })
      .catch(error => {
        alert(`Error while posting preference: ${error}`);
      });
  };

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

  return (
    <AppContainer title='View your users'>
      <InputLabel id='group'>Group</InputLabel>
      <Select
        labelId='group'
        id='group-select'
        value={currentGroup || ''}
        onChange={async e => {
          const selectedId = Number(e.target.value); // Pobierz ID jako liczbę
          setCurrentGroup(selectedId); // Ustaw nowe ID
          const group = groups.find(g => g.id === selectedId); // Pobierz pełny obiekt grupy
          if (group) {
            await handleGetPreferencesFromGroup(group); // Wywołaj funkcję z grupą
          }
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
      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddOpen}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog
        open={editDialogOpen || addDialogOpen}
        onClose={() =>
          editDialogOpen ? setEditDialogOpen(false) : setAddDialogOpen(false)
        }
      >
        <DialogTitle>
          {editDialogOpen ? 'Edit Preference' : 'Add Preference'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label='Name'
            value={
              currentGroup
                ? groups.find(g => g.id === currentGroup)?.name || ''
                : ''
            }
            onChange={e =>
              setCurrentGroup(prev => ({
                ...prev,
                name: e.target.value,
              }))
            }
            fullWidth
            margin='dense'
          />
          <TextField
            label='Student Id List'
            value={currentGroup ? currentGroup.studentIdList : ''}
            onChange={e =>
              setCurrentGroup(prev => ({
                ...prev,
                studentIdList: e.target.value,
              }))
            }
            fullWidth
            margin='dense'
          />
          {/* Additional fields for role-specific data can be added here */}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              editDialogOpen
                ? setEditDialogOpen(false)
                : setAddDialogOpen(false)
            }
          >
            Cancel
          </Button>
          <Button onClick={handleAddConfirm} color='primary'>
            {editDialogOpen ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      {/*Group List*/}
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Group ID</TableCell>
            <TableCell>Group Name</TableCell>
            <TableCell>List of Students</TableCell>
            {currentUser?.userRole === 'ADMIN' ? (
              <TableCell>Options</TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group: Group) => (
            <TableRow
              key={group.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{group.id}</TableCell>
              <TableCell>{group.name}</TableCell>
              <TableCell>{group.studentIdList}</TableCell>
              {currentUser?.userRole === 'ADMIN' ? (
                <TableCell>
                  <IconButton onClick={() => handleEditOpen(group.id)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              ) : null}
              {currentUser?.userRole === 'ADMIN' ? (
                <TableCell>
                  <IconButton onClick={() => handleDeleteGroup(group.id)}>
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
