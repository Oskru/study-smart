import { useState } from 'react';
import AppContainer from './app-container.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Fab,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { useUser } from '../hooks/use-user.ts';
import { useLecturersQuery } from '../hooks/api/use-lecturers.ts';
import {
  Course,
  useCoursesQuery,
  useDeleteCourseMutation,
  useEditCourseMutation,
  usePostCourseMutation,
} from '../hooks/api/use-courses.ts';
import { useGroupsQuery } from '../hooks/api/use-groups.ts';

const CourseList = () => {
  const { user: currentUser } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const { data: coursesData = [] } = useCoursesQuery();
  const { data: groupsData = [] } = useGroupsQuery();
  const { data: lecturersData = [] } = useLecturersQuery();
  const [currentLecturer, setCurrentLecturer] = useState<number | null>(null);
  const [currentGroup, setCurrentGroup] = useState<number | null>(null);

  // Course Mutations
  const postCourseMutation = usePostCourseMutation();
  const editCourseMutation = useEditCourseMutation();
  const deleteCourseMutation = useDeleteCourseMutation();

  // course dialog states
  const [editCourseDialogOpen, setEditCourseDialogOpen] = useState(false);
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  const handleShowLecturer = (course: Course) => {
    const lecturer = lecturersData.find(l => course.lecturerId === l.id);
    if (lecturer) {
      return (
        <TableCell>
          {lecturer.firstName} {lecturer.lastName}
        </TableCell>
      );
    } else {
      return <TableCell sx={{ color: 'red' }}>Nie przydzielono</TableCell>;
    }
  };

  const handleShowGroup = (course: Course) => {
    const group = groupsData.find(l => course.groupId === l.id);
    if (group) {
      return <TableCell>{group.name}</TableCell>;
    } else {
      return <TableCell sx={{ color: 'red' }}>Nie przydzielono</TableCell>;
    }
  };

  const handleAddCourseOpen = () => {
    setCurrentCourse({
      id: -1,
      name: '',
      description: '',
      courseDuration: 0,
      lecturerId: 1,
      groupId: 1,
      scheduled: false,
    });
    setAddCourseDialogOpen(true);
  };

  const handleEditCourseOpen = (id: number) => {
    const crs = coursesData.find(c => c.id === id);
    console.log(crs);
    if (!crs) return;
    setCurrentCourse({
      id: crs.id,
      name: crs.name,
      description: crs.description,
      courseDuration: crs.courseDuration,
      lecturerId: crs.lecturerId,
      groupId: crs.groupId,
      scheduled: crs.scheduled,
    });
    setEditCourseDialogOpen(true);
  };

  const handleAddCourseConfirm = () => {
    setAddCourseDialogOpen(false);
    postCourseMutation.mutate(
      { ...currentCourse! },
      {
        onSuccess: () => {
          enqueueSnackbar('Course added successfully!', { variant: 'success' });
        },
        onError: (error: any) => {
          enqueueSnackbar(`Error while adding Course: ${error}`, {
            variant: 'error',
          });
        },
      }
    );
  };

  const handleEditCourseConfirm = (id: number) => {
    setEditCourseDialogOpen(false);

    editCourseMutation.mutate(
      {
        id,
        data: {
          name: currentCourse?.name,
          description: currentCourse?.description,
          courseDuration: currentCourse?.courseDuration,
          lecturerId: currentCourse?.lecturerId,
          groupId: currentCourse?.groupId,
          scheduled: currentCourse?.scheduled,
        },
      },
      {
        onSuccess: () => {
          enqueueSnackbar('Course edited successfully!', {
            variant: 'success',
          });
        },
        onError: (error: any) => {
          enqueueSnackbar(`Error while editing Course: ${error}`, {
            variant: 'error',
          });
        },
      }
    );
  };

  const handleDeleteCourse = (id: number) => {
    deleteCourseMutation.mutate(id, {
      onSuccess: () => {
        enqueueSnackbar('Course deleted successfully!', { variant: 'success' });
      },
      onError: (error: any) => {
        enqueueSnackbar(`Error deleting Course: ${error}`, {
          variant: 'error',
        });
      },
    });
  };

  return (
    <Box
      display={'flex'}
      flexDirection='column'
      gap={2}
      component={AppContainer}
      title='Course List'
    >
      <Table sx={{ minWidth: 650, marginTop: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nazwa</TableCell>
            <TableCell>Opis</TableCell>
            <TableCell>Czas trwania</TableCell>
            <TableCell>Wykładowca</TableCell>
            <TableCell>Grupa</TableCell>
            <TableCell>Zaplanowany</TableCell>
            {currentUser?.userRole === 'ADMIN' ? (
              <TableCell>Options</TableCell>
            ) : null}
            {currentUser?.userRole === 'ADMIN' ? (
              <TableCell>Delete</TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {coursesData.map(course => (
            <TableRow key={course.id}>
              <TableCell>{course.id}</TableCell>
              <TableCell>{course.name}</TableCell>
              <TableCell>{course.description}</TableCell>
              <TableCell>{course.courseDuration}</TableCell>
              {handleShowLecturer(course)}
              {handleShowGroup(course)}
              <TableCell>{course.scheduled}</TableCell>
              <TableCell>{course.name}</TableCell>
              {currentUser?.userRole === 'ADMIN' && (
                <TableCell>
                  <IconButton onClick={() => handleEditCourseOpen(course.id)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              )}
              {currentUser?.userRole === 'ADMIN' && (
                <TableCell>
                  <IconButton onClick={() => handleDeleteCourse(course.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ADD/EDIT COURSE DIALOG */}
      <Dialog
        open={editCourseDialogOpen || addCourseDialogOpen}
        onClose={() =>
          editCourseDialogOpen
            ? setEditCourseDialogOpen(false)
            : setAddCourseDialogOpen(false)
        }
      >
        <DialogTitle>
          {editCourseDialogOpen ? 'Edit Course' : 'Add Course'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label='Nazwa'
            value={currentCourse?.name || ''}
            onChange={e =>
              setCurrentCourse({
                ...currentCourse!,
                name: e.target.value,
              })
            }
            fullWidth
            margin='dense'
          />
          <TextField
            label='Opis'
            value={currentCourse?.description || ''}
            onChange={e =>
              setCurrentCourse({
                ...currentCourse!,
                description: e.target.value,
              })
            }
            fullWidth
            margin='dense'
          />
          <TextField
            label='Czas trwania'
            type='number'
            value={currentCourse?.courseDuration || ''}
            onChange={e =>
              setCurrentCourse({
                ...currentCourse!,
                courseDuration: parseInt(e.target.value),
              })
            }
            fullWidth
            margin='dense'
          />
          <InputLabel id='lecturer'>Wykładowca</InputLabel>
          <Select
            labelId='lecturer'
            id='lecturer-select'
            value={currentLecturer || currentCourse?.lecturerId || ''}
            onChange={e => {
              setCurrentLecturer(e.target.value as number);
              setCurrentCourse({
                ...currentCourse!,
                lecturerId: e.target.value as number,
              });
            }}
            fullWidth
          >
            {lecturersData.map(lecturer => (
              <MenuItem key={lecturer.id} value={lecturer.id}>
                {lecturer.firstName} {lecturer.lastName}
              </MenuItem>
            ))}
          </Select>
          <InputLabel id='group'>Grupa</InputLabel>
          <Select
            labelId='group'
            id='group-select'
            value={currentGroup || currentCourse?.lecturerId || ''}
            onChange={e => {
              setCurrentGroup(e.target.value as number);
              setCurrentCourse({
                ...currentCourse!,
                groupId: e.target.value as number,
              });
            }}
            fullWidth
          >
            {groupsData.map(group => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              editCourseDialogOpen
                ? setEditCourseDialogOpen(false)
                : setAddCourseDialogOpen(false)
            }
          >
            Anuluj
          </Button>
          <Button
            onClick={() =>
              editCourseDialogOpen
                ? handleEditCourseConfirm(currentCourse?.id ?? -1)
                : handleAddCourseConfirm()
            }
            color='primary'
          >
            {editCourseDialogOpen ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color='primary'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        aria-label='add'
        onClick={handleAddCourseOpen}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default CourseList;
