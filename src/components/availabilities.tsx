import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import AppContainer from './app-container.tsx';
import { Box, Button } from '@mui/material';
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

  const handleSendAvailabilities = () => {
    if (!availabilities || !user) return;
    const toSend: Omit<Availability, 'id'>[] = availabilities.map(
      availability => ({
        dayId: Number(availability.iden),
        dayName: availability.dayName as Availability['dayName'],
        timeRanges: availability.timeRanges!,
        times: availability.times!,
        lecturerId: Number(user.id),
      })
    );

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
      })
      .catch(err => alert(`Error sending availabilities: ${err}`));
  };

  const minSelections = courses.reduce(
    (sum, c) => (c.id === user?.id ? sum + c.courseDuration : 0),
    0
  );

  return (
    <AppContainer title='Availabilities Management'>
      <Box display='flex' flexDirection='column' gap={4}>
        <Typography variant='body1'>
          Minimum selections required: {minSelections}
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
    </AppContainer>
  );
}

export default Availabilities;
