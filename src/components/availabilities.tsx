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
  Button,
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from '../hooks/use-user.ts';
import { Course, fetchCourses } from '../hooks/api/use-courses.ts';
import {
  ReactWeekTimeRangePicker,
  SelectedDataProps,
} from '@marinos33/react-week-time-range-picker';
import {
  Availabilities as AvailabilitiesType,
  Availability,
  deleteAvailability,
  fetchAvailabilities,
  postAvailability,
} from '../hooks/api/use-availabilities.ts';

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

function Availabilities() {
  const [courses, setCourses] = useState<Course[] | []>([]);
  const [currentCourse, setCurrentCourse] = useState<Course['id'] | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [availabilities, setAvailabilities] = useState<
    SelectedDataProps[] | undefined
  >(undefined);
  const [availabilitiesResponse, setAvailabilitiesResponse] =
    useState<AvailabilitiesType>([]);
  const { user } = useUser();

  // Populate preferences once data is fetched
  useEffect(() => {
    fetchAvailabilities().then(data => setAvailabilitiesResponse(data));
    fetchCourses().then(data => {
      setCourses(data);
      setCurrentCourse(data[0].id);
    });
  }, []);

  const filteredAvailabilities = availabilitiesResponse.filter(
    preference =>
      preference.dayName === dayOfWeek && preference.courseId === currentCourse
  );

  const handleSelectTimeRange = (selectedData: SelectedDataProps[]) => {
    setAvailabilities(selectedData);
    console.log(selectedData);
  };

  const handleDeleteAvailability = (availabilityToDelete: Availability) => {
    deleteAvailability(availabilityToDelete.id!)
      .then(() => {
        setAvailabilitiesResponse(
          availabilitiesResponse.filter(preference => {
            return preference.id !== availabilityToDelete.id;
          })
        );
      })
      .catch(error => alert(`Error while deleting preference: ${error}`));
  };

  const handleSendAvailabilities = () => {
    postAvailability(
      availabilities!.map(availability => {
        return {
          dayId: Number(availability.iden),
          dayName: availability.dayName as Availability['dayName'],
          timeRanges: availability.timeRanges,
          times: availability.times!,
          lecturerId: Number(user?.id),
        } as unknown as Availability;
      })
    );
  };

  return (
    <AppContainer title='Availabilities Management'>
      <Box display='flex' flexDirection='column' gap={4}>
        <ReactWeekTimeRangePicker selectTimeRange={handleSelectTimeRange} />
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
        {availabilities && Object.keys(availabilities).length !== 0 ? (
          <Button
            variant='contained'
            size='large'
            disabled={!availabilities}
            onClick={handleSendAvailabilities}
          >
            Send availability
          </Button>
        ) : null}
        <Typography variant='h6'>
          Availabilities for {dayOfWeek || '...'}
        </Typography>
        {filteredAvailabilities.length > 0 ? (
          filteredAvailabilities.map(preference => (
            <TimeSlot key={preference.id} elevation={3}>
              <Typography variant='body1'>
                {`${preference.times[0]} - ${preference.times[preference.times.length - 1]}`}
              </Typography>
              <Typography variant='caption'>
                {`${preference.dayName} ${courses.find(course => course.id === preference.courseId)?.name}`}
              </Typography>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  onClick={() => handleDeleteAvailability(preference)}
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

export default Availabilities;
