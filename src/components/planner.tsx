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
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from '../hooks/use-user.ts';
import styled from '@emotion/styled';
import { Course, fetchCourses } from '../hooks/api/use-courses.ts';
import {
  fetchPreferencesByIds,
  Preference,
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
import moment from 'moment';
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
  const [editedGroups, setEditedGroups] = useState<Groups>([]);
  const [currentGroup, setCurrentGroup] = useState<Omit<Group, 'id'> | null>(
    null
  );
  const [currentGroupId, setCurrentGroupId] = useState<Group['id'] | null>(
    null
  );

  const handleEditOpen = async (id: number) => {
    try {
      setEditedGroups(groups);
      setCurrentGroupId(id);
      setCurrentGroup(editedGroups.find(g => g.id === id));

      setEditDialogOpen(true); // Wywołanie dopiero po ustawieniu danych
      console.log(currentGroupId);
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
    console.log(currentGroup?.studentIdList);
    const processedStudentIdList = currentGroup?.studentIdList
      ? currentGroup.studentIdList.toString().split(',').map(Number)
      : [];
    const groupToPost = {
      ...currentGroup,
      studentIdList: processedStudentIdList, // Ustaw przetworzony studentIdList
    };
    console.log(processedStudentIdList);

    postGroup(groupToPost as Group)
      .then(() => {
        // Aktualizacja grup w stanie
        setGroups(prev => [...prev, groupToPost]);
      })
      .catch(error => {
        alert(`Error while posting group: ${error}`);
      });
  };

  const handleEditConfirm = async (id: number) => {
    setEditDialogOpen(false);

    // Przygotowanie obiektu grupy do edycji
    const processedStudentIdList = currentGroup?.studentIdList
      ? currentGroup.studentIdList
          .toString() // Upewnij się, że to ciąg znaków
          .split(',') // Podziel po przecinkach
          .map(Number) // Zamień na liczby
      : [];

    const groupToEdit = {
      ...currentGroup,
      studentIdList: processedStudentIdList, // Ustaw przetworzony studentIdList
    };

    try {
      await editGroup(id, groupToEdit as Group);

      // Zaktualizowanie stanu `groups` po pomyślnej edycji
      setGroups(prevGroups =>
        prevGroups.map(
          group =>
            group.id === id
              ? { ...group, ...groupToEdit } // Aktualizacja grupy w stanie
              : group // Pozostałe grupy bez zmian
        )
      );
    } catch (error) {
      alert(`Error while updating group: ${error}`);
    }
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
  const handleGetPreferencesFromGroup = async (id: number) => {
    try {
      // Pobierz grupę
      const myGroup = await fetchGroupById(id);
      setVotes({}); // Wyczyszczenie głosów
      console.log('myGroup:', myGroup);

      // Iteruj po studentach
      for (const studentId of myGroup.studentIdList) {
        const students = await fetchStudentsByIds([studentId]); // Pobierz konkretnego studenta
        console.log('students:', students);

        for (const student of students) {
          // Iteruj po preferencjach studenta
          const preferences = await fetchPreferencesByIds(
            student.preferenceIdList
          );
          console.log('preferences:', preferences);

          for (const pref of preferences) {
            // Dodaj głosy dla każdego zakresu godzin
            for (
              let hour = Number(pref.startTime.split(':')[0]);
              hour <= Number(pref.endTime.split(':')[0]);
              hour++
            ) {
              addVote(pref.dayOfWeek, moment(hour, 'HH').format('HH:mm'));
            }
          }
        }
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  useEffect(() => {
    fetchCourses().then(data => {
      setCourses(data);
      setCurrentCourse(data[0].id);
    });
    fetchGroups().then(data => {
      setGroups(data);
      setCurrentGroupId(data[0].id);
      setCurrentGroup({
        name: '',
        studentIdList: [],
      });
    });
  }, []);

  return (
    <AppContainer title='View your users'>
      <InputLabel id='group'>Group</InputLabel>
      <Select
        labelId='group'
        id='group-select'
        value={currentGroupId}
        onChange={e => {
          setCurrentGroupId(e.target.value as Group['id']);
          handleGetPreferencesFromGroup(e.target.value as Group['id']);
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
      {renderVotes()}
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
        <DialogTitle>{editDialogOpen ? 'Edit Group' : 'Add Group'}</DialogTitle>
        <DialogContent>
          <TextField
            label='Name'
            value={(() => {
              if (editDialogOpen) {
                return currentGroupId
                  ? editedGroups.find(g => g.id === currentGroupId)?.name ||
                      'lol'
                  : 'xd';
              } else {
                return currentGroup ? currentGroup.name : '';
              }
            })()}
            onChange={e => {
              if (editDialogOpen) {
                setCurrentGroup(prev => ({
                  ...prev,
                  name: e.target.value,
                }));
                setEditedGroups(prevGroups =>
                  prevGroups.map(
                    group =>
                      group.id === currentGroupId
                        ? { ...group, name: e.target.value } // Zmodyfikowany element
                        : group // Pozostaw pozostałe elementy bez zmian
                  )
                );
              } else {
                setCurrentGroup(prev => ({
                  ...prev,
                  name: e.target.value,
                }));
              }
            }}
            fullWidth
            margin='dense'
          />
          <TextField
            label='Student Id List'
            value={(() => {
              if (editDialogOpen) {
                return currentGroupId
                  ? editedGroups.find(g => g.id === currentGroupId)
                      ?.studentIdList || 'lol'
                  : 'xd';
              } else {
                return currentGroup ? currentGroup.studentIdList : '';
              }
            })()}
            onChange={e => {
              const newStudentIdList = e.target.value
                .split(',')
                .map(id => id.trim())
                .filter(id => id !== '') // Usuwamy puste elementy
                .map(Number); // Konwertujemy na liczby

              if (editDialogOpen) {
                setCurrentGroup(prev => ({
                  ...prev,
                  studentIdList: e.target.value,
                }));
                setEditedGroups(prevGroups =>
                  prevGroups.map(
                    group =>
                      group.id === currentGroupId
                        ? { ...group, studentIdList: newStudentIdList || '' } // Zmodyfikowany element
                        : group // Pozostaw pozostałe elementy bez zmian
                  )
                );
              } else {
                setCurrentGroup(prev => ({
                  ...prev,
                  studentIdList: e.target.value,
                }));
              }
            }}
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
          <Button
            onClick={() =>
              editDialogOpen
                ? handleEditConfirm(currentGroupId)
                : handleAddConfirm()
            }
            color='primary'
          >
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
