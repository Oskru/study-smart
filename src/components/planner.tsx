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
import { useUser } from '../hooks/use-user.ts';
import { useState, useRef } from 'react';
import Multiselect from 'multiselect-react-dropdown';
import { useCoursesQuery } from '../hooks/api/use-courses';
import {
  useGroupsQuery,
  usePostGroupMutation,
  useEditGroupMutation,
  useDeleteGroupMutation,
} from '../hooks/api/use-groups';
import { useStudentsQuery } from '../hooks/api/use-students';
import {
  useLecturersQuery,
  usePutAddCourseToLecturerMutation,
} from '../hooks/api/use-lecturers';
import { usePreferencesQuery } from '../hooks/api/use-preferences';
import { useSnackbar } from 'notistack';
import { PreferenceVotesTable } from './preference-votes-table.tsx';

type Votes = { [key: string]: number };

export const Planner = () => {
  const { user: currentUser } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const { data: coursesData = [] } = useCoursesQuery();
  const { data: groupsData = [] } = useGroupsQuery();
  const { data: studentsData = [] } = useStudentsQuery();
  const { data: lecturersData = [] } = useLecturersQuery();
  const { data: preferencesData = [] } = usePreferencesQuery();

  const [votes, setVotes] = useState<Votes>({});
  const [currentLecturer, setCurrentLecturer] = useState<number | null>(null);
  const [currentCourse, setCurrentCourse] = useState<number | null>(null);

  const selectedItems = useRef<any>();

  // group dialog states
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<{
    name: string;
    studentIdList: number[];
  } | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);

  // Mutations
  const postGroupMutation = usePostGroupMutation();
  const editGroupMutation = useEditGroupMutation();
  const deleteGroupMutation = useDeleteGroupMutation();
  const addCourseToLecturerMutation = usePutAddCourseToLecturerMutation();

  // Methods
  const handleAddGroupOpen = () => {
    setCurrentGroup({ name: '', studentIdList: [] });
    setAddGroupDialogOpen(true);
  };

  const handleEditGroupOpen = (id: number) => {
    const grp = groupsData.find(g => g.id === id);
    if (!grp) return;
    setCurrentGroupId(id);
    setCurrentGroup({ name: grp.name, studentIdList: grp.studentIdList });
    setEditGroupDialogOpen(true);
  };

  const handleAddGroupConfirm = () => {
    setAddGroupDialogOpen(false);
    const processedStudentIdList = currentGroup?.studentIdList || [];
    postGroupMutation.mutate(
      { ...currentGroup!, studentIdList: processedStudentIdList },
      {
        onSuccess: () => {
          enqueueSnackbar('Group added successfully!', { variant: 'success' });
        },
        onError: (error: any) => {
          enqueueSnackbar(`Error while adding group: ${error}`, {
            variant: 'error',
          });
        },
      }
    );
  };

  const handleEditGroupConfirm = (id: number) => {
    setEditGroupDialogOpen(false);

    const processed = selectedItems.current
      ?.getSelectedItems()
      .map((student: any) => student.id);

    editGroupMutation.mutate(
      { id, data: { studentIdList: processed, name: currentGroup?.name } },
      {
        onSuccess: () => {
          enqueueSnackbar('Group edited successfully!', { variant: 'success' });
        },
        onError: (error: any) => {
          enqueueSnackbar(`Error while editing group: ${error}`, {
            variant: 'error',
          });
        },
      }
    );
  };

  const handleDeleteGroup = (id: number) => {
    deleteGroupMutation.mutate(id, {
      onSuccess: () => {
        enqueueSnackbar('Group deleted successfully!', { variant: 'success' });
      },
      onError: (error: any) => {
        enqueueSnackbar(`Error deleting group: ${error}`, { variant: 'error' });
      },
    });
  };

  const addVote = (day: string, hour: string): void => {
    const key = `${day}-${hour}`;
    setVotes(prevVotes => ({
      ...prevVotes,
      [key]: (prevVotes[key] || 0) + 1,
    }));
  };

  const handleAddCourseToLecturer = (lecturerId: number, courseId: number) => {
    addCourseToLecturerMutation.mutate(
      { lecturerId, courseId },
      {
        onSuccess: () => {
          enqueueSnackbar('Course added to lecturer successfully!', {
            variant: 'success',
          });
        },
        onError: (error: any) => {
          enqueueSnackbar(`Error adding course to lecturer: ${error}`, {
            variant: 'error',
          });
        },
      }
    );
  };

  const handleGetPreferencesFromGroupAndCourse = (
    groupId: number,
    courseId: number
  ) => {
    setVotes({});
    const myGroup = groupsData.find(g => g.id === groupId);
    if (!myGroup) return;

    const myCourse = coursesData.find(c => c.id === courseId);
    if (!myCourse) return;

    const filteredStudents = studentsData.filter(student =>
      myGroup.studentIdList.includes(student.id)
    );

    filteredStudents.forEach(student => {
      const studentPreferences = preferencesData.filter(preference =>
        student.preferenceIdList.includes(preference.id)
      );
      const courseStudentPreferences = studentPreferences.filter(
        preference => preference.courseId == courseId
      );
      courseStudentPreferences.forEach(preference => {
        preference.times.forEach(time => {
          addVote(preference.dayName, time);
        });
      });
    });
  };

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
            handleGetPreferencesFromGroupAndCourse(groupId, currentCourse ?? 1);
          }}
          fullWidth
        >
          {groupsData.map(group => (
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
          value={currentCourse || coursesData[0]?.id || ''}
          onChange={e => {
            const courseId = e.target.value as number;
            setCurrentCourse(courseId);
            handleGetPreferencesFromGroupAndCourse(
              currentGroupId ?? 1,
              courseId
            );
          }}
          fullWidth
        >
          {coursesData.map(course => (
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
          value={currentLecturer || lecturersData[0]?.id || ''}
          onChange={e => setCurrentLecturer(e.target.value as number)}
          fullWidth
        >
          {lecturersData.map(lecturer => (
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
        >
          Add Course To Lecturer
        </Button>
      ) : null}

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
            value={currentGroup?.name || ''}
            onChange={e =>
              setCurrentGroup(prev => ({ ...prev!, name: e.target.value }))
            }
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
            options={studentsData.map(student => ({
              name: `${student.lastName}, ${student.indexNumber}`,
              id: student.id,
            }))}
            displayValue='name'
            selectedValues={
              editGroupDialogOpen && currentGroupId
                ? studentsData
                    .filter(student =>
                      groupsData
                        .find(g => g.id === currentGroupId)
                        ?.studentIdList.includes(student.id)
                    )
                    .map(student => ({
                      name: `${student.lastName}, ${student.indexNumber}`,
                      id: student.id,
                    }))
                : []
            }
            showCheckbox
            ref={selectedItems}
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

      <Table sx={{ minWidth: 650, marginTop: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Group ID</TableCell>
            <TableCell>Group Name</TableCell>
            <TableCell>List of Students</TableCell>
            {currentUser?.userRole === 'ADMIN' ? (
              <TableCell>Options</TableCell>
            ) : null}
            {currentUser?.userRole === 'ADMIN' ? (
              <TableCell>Delete</TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {groupsData.map(group => (
            <TableRow key={group.id}>
              <TableCell>{group.id}</TableCell>
              <TableCell>{group.name}</TableCell>
              <TableCell>
                {studentsData
                  .filter(student => group.studentIdList.includes(student.id))
                  .map(student => student.indexNumber)
                  .join(', ')}
              </TableCell>
              {currentUser?.userRole === 'ADMIN' && (
                <TableCell>
                  <IconButton onClick={() => handleEditGroupOpen(group.id)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              )}
              {currentUser?.userRole === 'ADMIN' && (
                <TableCell>
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
