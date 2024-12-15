import { useState, useEffect, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import AppContainer from './app-container.tsx';
import { Box, Button, Switch, FormControlLabel } from '@mui/material';
import { useUser } from '../hooks/use-user.ts';
import { Course, fetchCourses } from '../hooks/api/use-courses.ts';
import { SelectedDataProps } from '@marinos33/react-week-time-range-picker';
import {
  Availabilities as AvailabilitiesType,
  Availability,
  fetchAvailabilities,
  postAvailability,
  deleteAvailability,
} from '../hooks/api/use-availabilities.ts';
import {
  DaySchedule,
  PastSelection,
  TimeSelectionTable,
} from './time-selection-table.tsx';
import { useSnackbar } from 'notistack';

function Availabilities() {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();

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

  const [mode, setMode] = useState<'add' | 'delete'>('add');
  const [selectedForDeletion, setSelectedForDeletion] = useState<number[]>([]);

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

  const minSelections = useMemo(() => {
    return courses.reduce((sum, c) => sum + c.courseDuration, 0);
  }, [courses]);

  const currentlySelected = useMemo(() => {
    if (!availabilities) return 0;
    return availabilities.reduce((sum, p) => sum + p.times.length, 0);
  }, [availabilities]);

  const deletionMap = useMemo(() => {
    const map: Record<string, { id: number; allTimes: string[] }> = {};
    availabilitiesResponse.forEach(a => {
      const { id, dayName, times } = a;
      if (id == null) return;
      times.forEach(t => {
        const key = `${dayName}-${t}`;
        map[key] = { id, allTimes: times };
      });
    });
    return map;
  }, [availabilitiesResponse]);

  const onDeleteSelectionChange = (ids: number[]) => {
    setSelectedForDeletion(ids);
  };

  const handleSendAvailabilities = () => {
    if (!availabilities || !user) return;
    if (currentlySelected < minSelections) return;

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
        setAvailabilities(undefined);
        enqueueSnackbar('Availabilities sent successfully!', {
          variant: 'success',
        });
      })
      .catch(err => {
        enqueueSnackbar(`Error sending availabilities: ${err}`, {
          variant: 'error',
        });
      });
  };

  const handleDelete = () => {
    const deletes = selectedForDeletion.map(id => deleteAvailability(id));
    Promise.all(deletes)
      .then(() => fetchAvailabilities())
      .then(availData => {
        setAvailabilitiesResponse(availData);
        setSelectedForDeletion([]);
        enqueueSnackbar('Availabilities deleted successfully!', {
          variant: 'success',
        });
      })
      .catch(error => {
        enqueueSnackbar(`Error deleting availabilities: ${error}`, {
          variant: 'error',
        });
      });
  };

  return (
    <AppContainer title='Availabilities Management'>
      <Box display='flex' flexDirection='column' gap={4}>
        <FormControlLabel
          control={
            <Switch
              checked={mode === 'delete'}
              onChange={() => {
                setMode(mode === 'add' ? 'delete' : 'add');
                setAvailabilities(undefined);
                setSelectedForDeletion([]);
              }}
            />
          }
          label='Delete mode'
        />
        <Typography variant='body1'>
          {currentlySelected}/{minSelections} selections
        </Typography>
        <TimeSelectionTable
          onSelect={selectedData => {
            if (mode === 'add') {
              setAvailabilities(selectedData);
            }
          }}
          pastSelections={pastAvailabilities}
          loading={dataLoading}
          isLecturer={true}
          mode={mode}
          deletionMap={deletionMap}
          selectedForDeletion={selectedForDeletion}
          onDeleteSelectionChange={onDeleteSelectionChange}
        />
        {mode === 'add' &&
          availabilities &&
          availabilities.length > 0 &&
          currentlySelected >= minSelections && (
            <Button
              variant='contained'
              size='large'
              onClick={handleSendAvailabilities}
            >
              Send availability
            </Button>
          )}
        {mode === 'delete' && selectedForDeletion.length > 0 && (
          <Button
            variant='contained'
            size='large'
            color='error'
            onClick={handleDelete}
          >
            Delete selected
          </Button>
        )}
      </Box>
    </AppContainer>
  );
}

export default Availabilities;
