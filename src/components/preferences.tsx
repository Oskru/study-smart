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
import { Group } from '../hooks/api/use-groups.ts';
import { array } from 'zod';

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
  const [courses, setCourses] = useState<Course[] | []>([]);
  const [currentCourse, setCurrentCourse] = useState<Course['id'] | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [preferences, setPreferences] = useState<
    SelectedDataProps[] | undefined
  >(undefined);
  const [preferencesResponse, setPreferencesResponse] =
    useState<PreferencesType>([]);
  const { user } = useUser();

  // Populate preferences once data is fetched
  useEffect(() => {
    fetchPreferences().then(data => setPreferencesResponse(data));
    fetchCourses().then(data => {
      setCourses(data);
      setCurrentCourse(data[0].id);
    });
  }, []);

  const filteredPreferences = preferencesResponse.filter(
    preference => preference.dayName === dayOfWeek
  );

  const handleSelectTimeRange = (selectedData: SelectedDataProps[]) => {
    setPreferences(selectedData);
    console.log(selectedData);
  };

  const handleDeletePreference = (preferenceToDelete: Preference) => {
    deletePreference(preferenceToDelete.id!)
      .then(() => {
        setPreferencesResponse(
          preferencesResponse.filter(preference => {
            return preference.id !== preferenceToDelete.id;
          })
        );
      })
      .catch(error => alert(`Error while deleting preference: ${error}`));
  };

  const handleSendPreferences = () => {
    const preferencePosts = [];
    for (let preference of preferences!) {
      const flattenedPreferences: string[] = preference.timeRanges!.reduce(
        (acc, curr) => acc.concat(curr),
        []
      );
      preferencePosts.push(
        postPreference({
          dayId: Number(preference.iden),
          dayName: preference.dayName as Preference['dayName'],
          timeRanges: flattenedPreferences,
          times: preference.times!,
          courseId: 0,
          studentId: Number(user?.id),
        })
      );
    }

    Promise.all(preferencePosts)
      .then(() => alert('Successfully added preferences!'))
      .catch(() => alert('Failed to add preferences'));
  };

  return (
    <AppContainer title='Preferences Management'>
      <Box display='flex' flexDirection='column' gap={4}>
        <ReactWeekTimeRangePicker selectTimeRange={handleSelectTimeRange} />
        {preferences && Object.keys(preferences).length !== 0 ? (
          <Button
            variant='contained'
            size='large'
            disabled={!preferences}
            onClick={handleSendPreferences}
          >
            Send preference
          </Button>
        ) : null}

        <div>
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
        </div>
        <div>
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
        </div>

        <Typography variant='h6'>
          Availabilities for {dayOfWeek || '...'}
        </Typography>
        {filteredPreferences.length > 0 ? (
          filteredPreferences.map(preference => (
            <TimeSlot key={preference.id} elevation={3}>
              <Typography variant='body1'>
                {`${preference.times[0]} - ${preference.times[preference.times.length - 1]}`}
              </Typography>
              <Typography variant='caption'>
                {`${preference.dayName} ${preference.courseId}`}
              </Typography>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  onClick={() => handleDeletePreference(preference)}
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
    </AppContainer>
  );
}

export default Preferences;
