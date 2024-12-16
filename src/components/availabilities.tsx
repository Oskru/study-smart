import { useState, useMemo } from 'react';
import AppContainer from './app-container.tsx';
import {
  Box,
  Button,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { useUser } from '../hooks/use-user.ts';
import { DaySchedule, TimeSelectionTable } from './time-selection-table.tsx';
import {
  useAvailabilitiesQuery,
  usePostAvailabilityMutation,
  useDeleteAvailabilityMutation,
} from '../hooks/api/use-availabilities';
import { useCoursesQuery } from '../hooks/api/use-courses';
import { useSnackbar } from 'notistack';
import { WeekDayName } from '../hooks/api/use-preferences.ts';

interface SelectedDataProps {
  iden: number;
  dayName: string;
  times: string[];
  timeRanges: [string, string][];
}

const Availabilities = () => {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: availabilitiesData = [],
    isLoading: isAvailabilitiesDataLoading,
  } = useAvailabilitiesQuery();
  const { data: coursesData = [], isLoading: isCoursesDataLoading } =
    useCoursesQuery();

  const [availabilities, setAvailabilities] = useState<
    SelectedDataProps[] | undefined
  >(undefined);
  const [mode, setMode] = useState<'add' | 'delete'>('add');
  const [selectedForDeletion, setSelectedForDeletion] = useState<number[]>([]);

  // Past availabilities
  const pastAvailabilities = availabilitiesData
    .filter(a => a.lecturerId === user?.id)
    .map(a => ({ dayName: a.dayName, times: a.times }));

  const lecturerCourses = coursesData.filter(c => c.lecturerId === user?.id);
  const minSelections = lecturerCourses.reduce(
    (sum, c) => sum + c.courseDuration,
    0
  );

  const pastCount = pastAvailabilities.reduce(
    (sum, p) => sum + p.times.length,
    0
  );
  const newCount = (availabilities || []).reduce(
    (sum, p) => sum + p.times.length,
    0
  );
  const currentlySelected = pastCount + newCount;

  const postAvailabilityMutation = usePostAvailabilityMutation();
  const deleteAvailabilityMutation = useDeleteAvailabilityMutation();

  // Build deletionMap for delete mode: map each dayName-hour to {id, allTimes} of an availability
  const deletionMap = useMemo(() => {
    const map: Record<string, { id: number; allTimes: string[] }> = {};
    availabilitiesData
      .filter(a => a.lecturerId === user?.id)
      .forEach(a => {
        a.times.forEach(t => {
          const key = `${a.dayName}-${t}`;
          map[key] = { id: a.id, allTimes: a.times };
        });
      });
    return map;
  }, [availabilitiesData, user]);

  const handleSendAvailabilities = () => {
    if (!availabilities || !user) return;
    if (currentlySelected < minSelections) return;

    const toSend = availabilities.map(a => ({
      dayId: Number(a.iden),
      dayName: a.dayName as WeekDayName,
      timeRanges: a.timeRanges,
      times: a.times,
      lecturerId: Number(user.id),
    }));

    postAvailabilityMutation.mutate(toSend, {
      onSuccess: () => {
        setAvailabilities(undefined);
        enqueueSnackbar('Godziny dostępności dodane pomyślnie!', {
          variant: 'success',
        });
      },
      onError: (error: any) => {
        enqueueSnackbar(`Błąd podczas dodawania godzin dostępności: ${error}`, {
          variant: 'error',
        });
      },
    });
  };

  const handleDelete = () => {
    selectedForDeletion.forEach(id => {
      deleteAvailabilityMutation.mutate(id, {
        onSuccess: () => {
          setSelectedForDeletion(prev => prev.filter(x => x !== id));
          enqueueSnackbar('Godziny dostępności usunięte pomyślnie!', {
            variant: 'success',
          });
        },
        onError: (error: any) => {
          enqueueSnackbar(
            `Błąd podczas usuwania godzin dostępności: ${error}`,
            {
              variant: 'error',
            }
          );
        },
      });
    });
  };

  return (
    <AppContainer title='Zarządzanie godzinami dostępności'>
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
          label='Tryb usuwania'
        />
        <Typography variant='body1'>
          {currentlySelected}/{minSelections} zaznaczone
        </Typography>
        <TimeSelectionTable
          onSelect={selectedData => {
            if (mode === 'add') {
              setAvailabilities(selectedData);
            }
          }}
          pastSelections={pastAvailabilities}
          loading={
            postAvailabilityMutation.isLoading ||
            deleteAvailabilityMutation.isLoading ||
            isAvailabilitiesDataLoading ||
            isCoursesDataLoading
          }
          isLecturer={true}
          mode={mode}
          scheduleData={availabilitiesData as DaySchedule[]}
          deletionMap={deletionMap}
          selectedForDeletion={selectedForDeletion}
          onDeleteSelectionChange={ids => setSelectedForDeletion(ids)}
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
              Dodaj godziny dostępności
            </Button>
          )}
        {mode === 'delete' && selectedForDeletion.length > 0 && (
          <Button
            variant='contained'
            size='large'
            color='error'
            onClick={handleDelete}
          >
            Usuń zaznaczone
          </Button>
        )}
      </Box>
    </AppContainer>
  );
};

export default Availabilities;
