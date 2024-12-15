import { useState, useEffect, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import AppContainer from './app-container.tsx';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import { useUser } from '../hooks/use-user.ts';
import { Course, fetchCourses } from '../hooks/api/use-courses.ts';
import { SelectedDataProps } from '@marinos33/react-week-time-range-picker';
import {
  Availabilities as AvailabilitiesType,
  Availability,
  fetchAvailabilities,
  postAvailability,
} from '../hooks/api/use-availabilities.ts';
import {
  DaySchedule,
  PastSelection,
  TimeSelectionTable,
} from './time-selection-table.tsx';

function Availabilities() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [availabilities, setAvailabilities] = useState<
    SelectedDataProps[] | undefined
  >(undefined);
  const [availabilitiesResponse, setAvailabilitiesResponse] =
    useState<AvailabilitiesType>([]);
  const [pastAvailabilities, setPastAvailabilities] = useState<PastSelection[]>(
    []
  );
  const [dataLoading, setDataLoading] = useState(true);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  );

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    Promise.all([fetchAvailabilities(), fetchCourses()])
      .then(([availData, courseData]) => {
        setAvailabilitiesResponse(availData);
        setCourses(courseData);
        const userPastSelections: PastSelection[] = availData
          .filter(pref => pref.lecturerId === user.id)
          .map(pref => ({
            dayName: pref.dayName,
            times: pref.times,
          }));
        setPastAvailabilities(userPastSelections);
      })
      .finally(() => setDataLoading(false));
  }, [user]);

  // Min selections = sum of durations of all lecturer's courses
  const minSelections = useMemo(() => {
    return courses.reduce((sum, c) => sum + c.courseDuration, 0);
  }, [courses]);

  const currentlySelected = useMemo(() => {
    if (!availabilities) return 0;
    return availabilities.reduce((sum, p) => sum + p.times.length, 0);
  }, [availabilities]);

  const handleSendAvailabilities = () => {
    if (!availabilities || !user) return;
    const toSend: Availability[] = availabilities.map(availability => ({
      dayId: Number(availability.iden),
      dayName: availability.dayName as Availability['dayName'],
      timeRanges: availability.timeRanges,
      times: availability.times,
      lecturerId: Number(user.id),
    }));

    postAvailability(toSend)
      .then(() => fetchAvailabilities())
      .then(availData => {
        setAvailabilitiesResponse(availData);
        const userPastSelections: PastSelection[] = availData
          .filter(pref => pref.lecturerId === user.id)
          .map(pref => ({
            dayName: pref.dayName,
            times: pref.times,
          }));
        setPastAvailabilities(userPastSelections);
        setSnackbarSeverity('success');
        setSnackbarMsg('Availabilities sent successfully!');
        setSnackbarOpen(true);
      })
      .catch(err => {
        setSnackbarSeverity('error');
        setSnackbarMsg(`Error sending availabilities: ${err}`);
        setSnackbarOpen(true);
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <AppContainer title='Availabilities Management'>
      <Box display='flex' flexDirection='column' gap={4}>
        <Typography variant='body1'>
          {currentlySelected}/{minSelections} selections
        </Typography>
        <TimeSelectionTable
          onSelect={selectedData => setAvailabilities(selectedData)}
          pastSelections={pastAvailabilities}
          loading={dataLoading}
          isLecturer={true}
        />
        {availabilities && availabilities.length > 0 ? (
          <Button
            variant='contained'
            size='large'
            onClick={handleSendAvailabilities}
          >
            Send availability
          </Button>
        ) : null}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant='filled'
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </AppContainer>
  );
}

export default Availabilities;
