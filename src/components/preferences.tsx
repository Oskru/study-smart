import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import AppContainer from './app-container.tsx';
import Select from '@mui/material/Select';
import {
  InputLabel,
  MenuItem,
  Box,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Fab,
} from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  deletePreference,
  fetchPreferences,
  postPreference,
  Preference,
  Preferences as PreferencesType,
  useGetPreferences,
} from '../hooks/api/use-get-preferences.ts';
import { useUser } from '../hooks/use-user.ts';
import { Course, fetchCourses } from '../hooks/api/use-courses.ts';
import {
  ReactWeekTimeRangePicker,
  SelectedDataProps,
} from '@marinos33/react-week-time-range-picker';

// Styled component for each time slot
const TimeSlot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  margin: theme.spacing(1, 0),
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
}));

function Preferences() {
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [courses, setCourses] = useState<Course[] | []>([]);
  const [currentCourse, setCurrentCourse] = useState<Course['id'] | null>(null);
  const [preferences, setPreferences] = useState<PreferencesType>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentPreference, setCurrentPreference] = useState<Omit<
    Preference,
    'id'
  > | null>(null);
  const { user } = useUser();

  // Populate preferences once data is fetched
  useEffect(() => {
    fetchPreferences().then(data => setPreferences(data));
    fetchCourses().then(data => {
      setCourses(data);
      setCurrentCourse(data[0].id);
    });
  }, []);

  // Filter preferences based on selected day
  const filteredPreferences = preferences.filter(
    preference => preference.dayOfWeek === dayOfWeek
  );

  // Dialog handlers remain similar with adjustments for dynamic data
  const handleDeleteOpen = preference => {
    setCurrentPreference(preference);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async (id: number) => {
    deletePreference(id)
      .then(() => {
        setPreferences(
          preferences.filter(preference => {
            return preference.id !== id;
          })
        );
      })
      .catch(error => alert(`Error while deleting preference: ${error}`));
    setDeleteDialogOpen(false);
    setCurrentPreference(null);
  };

  const handleAddOpen = () => {
    setCurrentPreference({
      dayOfWeek: 'Monday',
      startTime: '00:00',
      endTime: '00:00',
      studentId: user!.id,
      courseId: currentCourse!,
    });
    setAddDialogOpen(true);
  };

  const handleAddConfirm = () => {
    setAddDialogOpen(false);
    postPreference(currentPreference as Preference)
      .then(() => {
        setPreferences(prev => [...prev, currentPreference]);
      })
      .catch(error => {
        alert(`Error while posting preference: ${error}`);
      });
  };

  const handleSelectTimeRange = (selectedData: SelectedDataProps[]) => {
    console.log(selectedData);
  };

  return (
    <AppContainer title='Preferences Management'>
      <ReactWeekTimeRangePicker selectTimeRange={handleSelectTimeRange} />
      <InputLabel id='day-of-week'>Day of week</InputLabel>
      <Select
        labelId='day-of-week'
        id='day-of-week-select'
        value={dayOfWeek}
        onChange={e => setDayOfWeek(e.target.value)}
        fullWidth
      >
        {[
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ].map(day => (
          <MenuItem key={day} value={day}>
            {day}
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

      <Box sx={{ mt: 4 }}>
        <Typography variant='h6'>
          Availabilities for {dayOfWeek || '...'}
        </Typography>
        {filteredPreferences.length > 0 ? (
          filteredPreferences.map(preference => (
            <TimeSlot key={preference.id} elevation={3}>
              <Typography variant='body1'>
                {`${preference.startTime.hour}:${String(preference.startTime.minute).padStart(2, '0')} - ${preference.endTime.hour}:${String(preference.endTime.minute).padStart(2, '0')}`}
              </Typography>
              <Typography variant='caption'>
                {preference.student
                  ? `${preference.student.firstName} ${preference.student.lastName}`
                  : `${preference.lecturer?.firstName} ${preference.lecturer?.lastName}`}
              </Typography>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  onClick={() => handleDeleteOpen(preference)}
                  size='small'
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </Box>
            </TimeSlot>
          ))
        ) : (
          <Typography variant='body2' color='textSecondary'>
            No availabilities for this day.
          </Typography>
        )}
      </Box>

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
            label='Day of Week'
            value={currentPreference?.dayOfWeek || ''}
            onChange={e =>
              setCurrentPreference(prev => ({
                ...prev,
                dayOfWeek: e.target.value,
              }))
            }
            fullWidth
            margin='dense'
          />
          <TextField
            label='Start Time (HH:mm)'
            value={currentPreference?.startTime || ''}
            onChange={e =>
              setCurrentPreference(prev => ({
                ...prev,
                startTime: e.target.value,
              }))
            }
            fullWidth
            margin='dense'
          />
          <TextField
            label='End Time (HH:mm)'
            value={currentPreference?.endTime || ''}
            onChange={e =>
              setCurrentPreference(prev => ({
                ...prev,
                endTime: e.target.value,
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this preference?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => {}} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AppContainer>
  );
}

export default Preferences;
