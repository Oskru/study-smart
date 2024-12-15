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
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import { useUser } from '../hooks/use-user.ts';
import { Course, fetchCourses } from '../hooks/api/use-courses.ts';
import {
  fetchPreferences,
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
import { fetchStudents, Student } from '../hooks/api/use-students.ts';
import Multiselect from 'multiselect-react-dropdown';
import {
  fetchLecturers,
  Lecturer,
  putAddCourseToLecturer,
} from '../hooks/api/use-lecturers.ts';
import { PreferenceVotesTable } from './preference-votes-table.tsx'; // Import from above code
import { useTheme } from '@mui/material/styles';

type Votes = { [key: string]: number };

export const Planner = () => {
  const theme = useTheme();
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

  const selectedItems = useRef();

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

  const handleAddGroupOpen = () => {
    setCurrentGroup({ name: '', studentIdList: [] });
    setAddGroupDialogOpen(true);
  };

  const handleEditGroupOpen = async (id: number) => {
    setEditedGroups(groups);
    setCurrentGroupId(id);
    setCurrentGroup(editedGroups.find(group => group.id === id));
    setEditGroupDialogOpen(true);
  };

  const handleAddGroupConfirm = () => {
    setAddGroupDialogOpen(false);
    const processedStudentIdList = currentGroup?.studentIdList
      ? currentGroup.studentIdList.toString().split(',').map(Number)
      : [];
    const groupToPost = {
      ...currentGroup,
      studentIdList: processedStudentIdList,
    };
    postGroup(groupToPost as Group)
      .then(() => {
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
      .map((student: any) => student.id);

    const groupToEdit = {
      ...editedGroups.find(group => group.id === id),
      studentIdList: processed,
    };

    try {
      await editGroup(id, groupToEdit as Group);
      const newGroups = await fetchGroups();
      setGroups(newGroups);
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
      [key]: (prevVotes[key] || 0) + 1,
    }));
  };

  const handleAddCourseToLecturer = (lecturerId: number, courseId: number) => {
    putAddCourseToLecturer(lecturerId, courseId).catch(error => {
      alert(`Error while adding course to lecturer: ${error}`);
    });
  };

  const handleGetPreferencesFromGroup = async (id: number) => {
    try {
      const myGroup = await fetchGroupById(id);
      setVotes({});
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
      setCurrentCourse(data[0]?.id ?? null);
    });
    fetchGroups().then(data => {
      setGroups(data);
      setCurrentGroupId(data[0]?.id ?? null);
      setCurrentGroup({ name: '', studentIdList: [] });
    });
    fetchStudents().then(data => {
      setStudents(data);
    });
    fetchLecturers().then(data => {
      setLecturers(data);
      setCurrentLecturer(data[0]?.id ?? null);
    });
    fetchPreferences().then(data => {
      setPreferences(data);
    });
  }, []);

  return (
    <AppContainer title='View your users'>
      <div>
        <InputLabel id='group'>Group</InputLabel>
        <Select
          labelId='group'
          id='group-select'
          value={currentGroupId || ''}
          onChange={e => {
            const groupId = e.target.value as number;
            setCurrentGroupId(groupId);
            handleGetPreferencesFromGroup(groupId);
          }}
          fullWidth
          sx={{
            marginBottom: theme.spacing(2),
          }}
        >
          {groups.map(group => (
            <MenuItem key={group.id} value={group.id}>
              {group.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div>
        <InputLabel id='course'>Course</InputLabel>
        <Select
          labelId='course'
          id='course-select'
          value={currentCourse || ''}
          onChange={e => setCurrentCourse(e.target.value as number)}
          fullWidth
          sx={{
            marginBottom: theme.spacing(2),
          }}
        >
          {courses.map(course => (
            <MenuItem key={course.id} value={course.id}>
              {course.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div>
        <InputLabel id='lecturer'>Lecturer</InputLabel>
        <Select
          labelId='lecturer'
          id='lecturer-select'
          value={currentLecturer || ''}
          onChange={e => setCurrentLecturer(e.target.value as number)}
          fullWidth
          sx={{
            marginBottom: theme.spacing(2),
          }}
        >
          {lecturers.map(lecturer => (
            <MenuItem key={lecturer.id} value={lecturer.id}>
              {lecturer.firstName} {lecturer.lastName}
            </MenuItem>
          ))}
        </Select>
      </div>
      {currentLecturer && currentCourse ? (
        <Button
          variant='contained'
          size='large'
          disabled={!currentLecturer || !currentCourse}
          onClick={() => {
            handleAddCourseToLecturer(currentLecturer!, currentCourse!);
          }}
          sx={{ marginBottom: theme.spacing(2) }}
        >
          Add Course To Lecturer
        </Button>
      ) : null}

      {/* Preference Votes Table */}
      <PreferenceVotesTable votes={votes} />

      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddGroupOpen}
      >
        <AddIcon />
      </Fab>

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
              if (editGroupDialogOpen && currentGroupId) {
                return (
                  editedGroups.find(g => g.id === currentGroupId)?.name || ''
                );
              } else {
                return currentGroup ? currentGroup.name : '';
              }
            })()}
            onChange={e => {
              if (editGroupDialogOpen) {
                setCurrentGroup(prev => ({
                  ...prev!,
                  name: e.target.value,
                  studentIdList: prev?.studentIdList || [],
                }));
                setEditedGroups(prevGroups =>
                  prevGroups.map(group =>
                    group.id === currentGroupId
                      ? { ...group, name: e.target.value }
                      : group
                  )
                );
              } else {
                setCurrentGroup(prev => ({
                  ...prev!,
                  name: e.target.value,
                  studentIdList: prev?.studentIdList || [],
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
              multiselectContainer: { height: '500px' },
              option: { color: 'blue' },
            }}
            options={students.map(student => ({
              name: `${student.lastName}, ${student.indexNumber}`,
              id: student.id,
            }))}
            displayValue='name'
            selectedValues={(() => {
              if (editGroupDialogOpen && currentGroupId) {
                const grp = editedGroups.find(g => g.id === currentGroupId);
                if (!grp) return [];
                return students
                  .filter(student => grp.studentIdList.includes(student.id))
                  .map(student => ({
                    name: `${student.lastName}, ${student.indexNumber}`,
                    id: student.id,
                  }));
              } else {
                return [];
              }
            })()}
            showCheckbox
            ref={selectedItems as unknown as LegacyRef<Multiselect>}
          />
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

      {/* Groups Table */}
      <Table
        sx={{
          borderCollapse: 'collapse',
          width: '100%',
          marginTop: theme.spacing(2),
          fontFamily: theme.typography.fontFamily,
          userSelect: 'none',
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              Group ID
            </TableCell>
            <TableCell
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              Group Name
            </TableCell>
            <TableCell
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              List of Students
            </TableCell>
            {currentUser?.userRole === 'ADMIN' && (
              <>
                <TableCell
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  Options
                </TableCell>
                <TableCell
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  Delete
                </TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group: Group) => (
            <TableRow key={group.id}>
              <TableCell
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: 'bold',
                }}
              >
                {group.id}
              </TableCell>
              <TableCell
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: 'bold',
                }}
              >
                {group.name}
              </TableCell>
              <TableCell
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: 'bold',
                }}
              >
                {students
                  .filter(student => group.studentIdList.includes(student.id))
                  .map(student => student.indexNumber)
                  .join(', ')}
              </TableCell>
              {currentUser?.userRole === 'ADMIN' && (
                <TableCell
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    textAlign: 'center',
                    fontSize: '15px',
                    fontWeight: 'bold',
                  }}
                >
                  <IconButton onClick={() => handleEditGroupOpen(group.id)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              )}
              {currentUser?.userRole === 'ADMIN' && (
                <TableCell
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    textAlign: 'center',
                    fontSize: '15px',
                    fontWeight: 'bold',
                  }}
                >
                  <IconButton onClick={() => handleDeleteGroup(group.id)}>
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

export default Planner;
