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
import { LegacyRef, useEffect, useRef, useState } from 'react';
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
import {
  fetchStudents,
  fetchStudentsByIds,
  Student,
} from '../hooks/api/use-students.ts';
import Multiselect from 'multiselect-react-dropdown';
import {
  fetchLecturers,
  Lecturer,
  putAddCourseToLecturer,
} from '../hooks/api/use-lecturers.ts';

const StyledTh = styled.th`
  border: 1px solid lightgray;
  font-weight: bold;
`;

const StyledTr = styled.tr`
  border: 1px solid lightgray;
  font-weight: bold;
`;

// Funkcja do obliczania koloru tła na podstawie liczby głosów
const getBackgroundColor = (votes: number) => {
  // Przekształcamy liczbę głosów na wartość od 0 do 1 (możesz dostosować zakres w zależności od maksymalnej liczby głosów)
  const maxVotes = 8; // Załóżmy, że maksymalna liczba głosów to 10
  const intensity = Math.min(votes / maxVotes, 1); // Skaluje od 0 do 1

  // Interpolacja między żółtym (rgb(255, 255, 0)) a czerwonym (rgb(255, 0, 0))
  const r = Math.round(255 * intensity + 255 * (1 - intensity)); // Czerwony
  const g = Math.round(255 * (1 - intensity)); // Zielony
  const b = 150; // Brak niebieskiego, zmienia się od żółtego do czerwonego

  return `rgb(${r}, ${g}, ${b})`; // Zwraca kolor RGB
};

const StyledTd = styled.td<{ votes: number }>`
  background-color: ${({ votes }) => getBackgroundColor(votes)};
  color: black;
  padding: 10px;
  text-align: center;
  font-size: 15px;
  font-weight: bold;
  border: 1px solid #ddd;
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

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type Votes = {
  [key: string]: number; // Klucz: "Dzień-Godzina", wartość: liczba głosów
};

interface PreferenceTableProps {
  votes: { [key: string]: number };
}

const PreferenceTable: React.FC<PreferenceTableProps> = ({ votes }) => {
  const renderCell = (day: string, hour: string) => {
    const key = `${day}-${hour}`;
    const votesForCell = votes[key] || 0; // Jeśli nie ma głosów, domyślnie 0

    return (
      <StyledTd key={key} votes={votesForCell}>
        {votesForCell}
      </StyledTd>
    );
  };

  return (
    <table>
      <thead>
        <StyledTr>
          <StyledTh>Dzień / Godzina</StyledTh>
          {hours.map(hour => (
            <StyledTh key={hour}>{hour}</StyledTh>
          ))}
        </StyledTr>
      </thead>
      <tbody>
        {days.map(day => (
          <StyledTr key={day}>
            <td>{day}</td>
            {hours.map(hour => renderCell(day, hour))}
          </StyledTr>
        ))}
      </tbody>
    </table>
  );
};

export default PreferenceTable;

export const Planner = () => {
  const [votes, setVotes] = useState<Votes>({});
  const [students, setStudents] = useState<Student[] | []>([]);
  const [preferences, setPreferences] = useState<Preference[] | []>([]);
  const [courses, setCourses] = useState<Course[] | []>([]);
  const [currentLecturer, setCurrentLecturer] = useState<Lecturer['id'] | null>(
    null
  );
  const [lecturers, setLecturers] = useState<Lecturer[] | []>([]);
  const [currentCourse, setCurrentCourse] = useState<Course['id'] | null>(null);
  const { user: currentUser } = useUser();
  //REF
  const selectedItems = useRef();

  //GROUPS
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Groups>([]);
  const [editedGroups, setEditedGroups] = useState<Groups>([]);
  const [currentGroup, setCurrentGroup] = useState<Omit<Group, 'id'> | null>(
    null
  );
  const [currentGroupId, setCurrentGroupId] = useState<Group['id'] | null>(
    null
  );

  //GROUP METHODS
  const handleAddGroupOpen = () => {
    setCurrentGroup({
      name: '',
      studentIdList: [],
    });
    setAddGroupDialogOpen(true);
  };

  const handleEditGroupOpen = async (id: number) => {
    try {
      setEditedGroups(groups);
      setCurrentGroupId(id);
      setCurrentGroup(editedGroups.find(group => group.id === id));

      setEditGroupDialogOpen(true); // Wywołanie dopiero po ustawieniu danych
      console.log(currentGroupId);
    } catch (error) {
      alert('Failed to fetch group data!');
      console.error(error);
    }
  };

  const handleAddGroupConfirm = () => {
    setAddGroupDialogOpen(false);
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

  const handleEditGroupConfirm = async (id: number) => {
    setEditGroupDialogOpen(false);

    const processed = selectedItems.current
      ?.getSelectedItems()
      .map(student => student.id);

    const groupToEdit = {
      ...editedGroups.find(group => group.id === id),
      studentIdList: processed, // Ustaw przetworzony studentIdList
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

  const handleDeleteGroup = async (id: number) => {
    deleteGroup(id)
      .then(() => setGroups(groups.filter(group => group.id !== id)))
      .catch(() => alert('Failed to delete group!'));
  };

  const addVote = (day: string, hour: string): void => {
    const key = `${day}-${hour}`;
    setVotes(prevVotes => ({
      ...prevVotes,
      [key]: (prevVotes[key] || 0) + 1, // Zwiększ licznik dla danego dnia i godziny
    }));
  };

  const handleAddCourseToLecturer = (lecturerId: number, courseId: number) => {
    putAddCourseToLecturer(lecturerId, courseId).catch(error => {
      alert(`Error while adding course to lecturer: ${error}`);
    });
  };

  const handleGetPreferencesFromGroup = async (id: number) => {
    try {
      // Pobierz grupę
      const myGroup = await fetchGroupById(id);
      setVotes({}); // Wyczyszczenie głosów
      console.log('myGroup:', myGroup);

      const filteredStudents = students.filter(student =>
        myGroup.studentIdList.includes(student.id)
      );
      filteredStudents.forEach(student => {
        const studentPreferences = preferences.filter(preference =>
          student.preferenceIdList.includes(preference.id)
        );
        studentPreferences.forEach(preference => {
          preference.times.forEach(time => {
            addVote(preference.dayName, time);
          });
        });
      });
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
    fetchStudents().then(data => {
      setStudents(data);
    });
    fetchLecturers().then(data => {
      setLecturers(data);
      setCurrentLecturer(data[0].id);
    });
    fetchPreferences().then(data => {
      setPreferences(data);
    });
  }, []);

  return (
    <AppContainer title='View your users'>
      {/* Group Select */}
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

      {/* Course Select */}
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
            {course.name} {course.id}
          </MenuItem>
        ))}
      </Select>

      {/* Lecturer Select */}
      <InputLabel id='lecturer'>Lecturer</InputLabel>
      <Select
        labelId='lecturer'
        id='lecturer-select'
        value={currentLecturer}
        onChange={e => setCurrentLecturer(e.target.value as Lecturer['id'])}
        fullWidth
      >
        {lecturers.map(lecturer => (
          <MenuItem key={lecturer.id} value={lecturer.id}>
            {lecturer.firstName} {lecturer.lastName} {lecturer.id}
          </MenuItem>
        ))}
      </Select>

      {currentLecturer && currentCourse ? (
        <Button
          variant='contained'
          size='large'
          disabled={!currentLecturer || !currentCourse}
          onClick={() => {
            handleAddCourseToLecturer(currentLecturer, currentCourse as number);
          }}
        >
          Add Course To Lecturer
        </Button>
      ) : null}
      {/* Preference Table ================================================*/}
      <PreferenceTable votes={votes} />
      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddGroupOpen}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog
        open={editGroupDialogOpen || addGroupDialogOpen}
        onClose={() =>
          editGroupDialogOpen
            ? setEditGroupDialogOpen(false)
            : setAddGroupDialogOpen(false)
        }
      >
        <DialogTitle>
          {editGroupDialogOpen ? 'Edit Group' : 'Add Group'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label='Name'
            value={(() => {
              if (editGroupDialogOpen) {
                return currentGroupId
                  ? editedGroups.find(g => g.id === currentGroupId)?.name || ''
                  : 'xd';
              } else {
                return currentGroup ? currentGroup.name : '';
              }
            })()}
            onChange={e => {
              if (editGroupDialogOpen) {
                setCurrentGroup(prev => ({
                  ...prev,
                  name: e.target.value,
                  studentIdList: prev?.studentIdList || [], // Dodajemy domyślną pustą tablicę, jeśli studentIdList jest undefined
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
                  studentIdList: prev?.studentIdList || [], // Zapewniamy, że studentIdList nie będzie undefined
                }));
              }
            }}
            fullWidth
            margin='dense'
          />
          <Button
            onClick={() =>
              console.log(selectedItems.current?.getSelectedItems())
            }
          >
            Get selected
          </Button>
          <Multiselect
            style={{
              multiselectContainer: {
                // To change css for multiselect (Width,height,etc..)
                height: '500px',
              },
              option: {
                // To change css for dropdown options
                color: 'blue',
              },
            }}
            options={students.map(student => ({
              name: `${student.lastName}, ${student.indexNumber}`,
              id: student.id,
            }))}
            displayValue='name'
            selectedValues={students
              .filter(student =>
                editedGroups
                  .find(g => g.id === currentGroupId)
                  ?.studentIdList.includes(student.id)
              )
              .map(student => ({
                name: `${student.lastName}, ${student.indexNumber}`,
                id: student.id,
              }))}
            showCheckbox
            ref={selectedItems as unknown as LegacyRef<Multiselect>}
          />
          {/* Additional fields for role-specific data can be added here */}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              editGroupDialogOpen
                ? setEditGroupDialogOpen(false)
                : setAddGroupDialogOpen(false)
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              editGroupDialogOpen
                ? handleEditGroupConfirm(currentGroupId ?? -1)
                : handleAddGroupConfirm()
            }
            color='primary'
          >
            {editGroupDialogOpen ? 'Save' : 'Add'}
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
              <TableCell>
                {students
                  .filter(student => group.studentIdList.includes(student.id)) // Filtrujemy studentów na podstawie group.studentIdList
                  .map(student => student.indexNumber) // Pobieramy indexNumber każdego studenta
                  .join(', ')}{' '}
                {/* Łączymy je w jeden ciąg tekstowy, oddzielając przecinkiem */}
              </TableCell>
              {currentUser?.userRole === 'ADMIN' ? (
                <TableCell>
                  <IconButton onClick={() => handleEditGroupOpen(group.id)}>
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
