import { useState, useEffect, useMemo } from 'react';
import AppContainer from './app-container.tsx';
import {
  InputLabel,
  MenuItem,
  Box,
  Button,
  Typography,
  Select,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useUser } from '../hooks/use-user.ts';
import { DaySchedule, TimeSelectionTable } from './time-selection-table.tsx';
import {
  usePreferencesQuery,
  usePostPreferenceMutation,
  useDeletePreferenceMutation,
  WeekDayName,
} from '../hooks/api/use-preferences';
import { useCoursesQuery } from '../hooks/api/use-courses';
import { useAvailabilitiesQuery } from '../hooks/api/use-availabilities';
import { useGroupsQuery } from '../hooks/api/use-groups';
import { useSnackbar } from 'notistack';

interface SelectedDataProps {
  iden: number;
  dayName: string;
  times: string[];
  timeRanges: [string, string][];
}

function Preferences() {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const { data: preferencesData = [], isLoading: isPreferencesDataLoading } =
    usePreferencesQuery();
  const {
    data: availabilitiesData = [],
    isLoading: isAvailabilitiesDataLoading,
  } = useAvailabilitiesQuery();
  const { data: coursesData = [], isLoading: isCoursesDataLoading } =
    useCoursesQuery();
  const { data: groupsData = [], isLoading: isGroupsDataLoading } =
    useGroupsQuery();

  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [preferences, setPreferences] = useState<SelectedDataProps[]>([]);
  const [mode, setMode] = useState<'add' | 'delete'>('add');
  const [selectedForDeletion, setSelectedForDeletion] = useState<number[]>([]);

  // Derive user's courses
  const userGroups = useMemo(
    () => groupsData.filter(g => g.studentIdList.includes(user?.id ?? -1)),
    [groupsData, user]
  );

  const userCourseIds = useMemo(() => {
    const set = new Set<number>();
    userGroups.forEach(g => {
      g.courseIdList.forEach(cid => set.add(cid));
    });
    return set;
  }, [userGroups]);

  const userCourses = useMemo(() => {
    return coursesData.filter(c => userCourseIds.has(c.id));
  }, [coursesData, userCourseIds]);

  // Set selectedCourses only when needed to avoid infinite loops
  useEffect(() => {
    const userCourseIdsArr = userCourses.map(c => c.id);
    // Only update if different
    if (
      selectedCourses.length !== userCourseIdsArr.length ||
      !selectedCourses.every(id => userCourseIdsArr.includes(id))
    ) {
      setSelectedCourses(userCourseIdsArr);
    }
  }, [userCourses, selectedCourses]);

  // Past selections
  const pastPreferences = useMemo(() => {
    return preferencesData
      .filter(
        pref =>
          pref.studentId === user?.id && selectedCourses.includes(pref.courseId)
      )
      .map(pref => ({
        dayName: pref.dayName,
        times: pref.times,
      }));
  }, [preferencesData, user, selectedCourses]);

  const minSelections = useMemo(() => {
    return userCourses
      .filter(c => selectedCourses.includes(c.id))
      .reduce((sum, c) => sum + c.courseDuration, 0);
  }, [userCourses, selectedCourses]);

  const pastCount = pastPreferences.reduce((sum, p) => sum + p.times.length, 0);
  const newCount = preferences.reduce((sum, p) => sum + p.times.length, 0);
  const currentlySelected = pastCount + newCount;

  const postPreferenceMutation = usePostPreferenceMutation();
  const deletePreferenceMutation = useDeletePreferenceMutation();

  // Build deletionMap for delete mode
  const deletionMap = useMemo(() => {
    const map: Record<string, { id: number; allTimes: string[] }> = {};
    preferencesData
      .filter(
        pref =>
          pref.studentId === user?.id && selectedCourses.includes(pref.courseId)
      )
      .forEach(pref => {
        pref.times.forEach(t => {
          const key = `${pref.dayName}-${t}`;
          map[key] = { id: pref.id, allTimes: pref.times };
        });
      });
    return map;
  }, [preferencesData, user, selectedCourses]);

  const handleSendPreferences = async () => {
    if (currentlySelected < minSelections) return;
    if (!user || selectedCourses.length === 0) return;

    const requests = selectedCourses.map(courseId => {
      const prefsForCourse = preferences.map(pref => ({
        dayId: pref.iden,
        dayName: pref.dayName as WeekDayName,
        timeRanges: pref.timeRanges,
        times: pref.times,
        courseId,
        studentId: Number(user.id),
      }));
      return postPreferenceMutation.mutateAsync(prefsForCourse);
    });

    try {
      await Promise.all(requests);
      setPreferences([]);
      enqueueSnackbar('Preferences sent successfully!', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(`Error while posting preferences: ${error}`, {
        variant: 'error',
      });
    }
  };

  const handleDelete = () => {
    selectedForDeletion.forEach(id => {
      deletePreferenceMutation.mutate(id, {
        onSuccess: () => {
          setSelectedForDeletion(prev => prev.filter(pid => pid !== id));
          enqueueSnackbar('Preferences deleted successfully!', {
            variant: 'success',
          });
        },
        onError: (error: any) => {
          enqueueSnackbar(`Error deleting preferences: ${error}`, {
            variant: 'error',
          });
        },
      });
    });
  };

  return (
    <AppContainer title='Preferences Management'>
      <Box display='flex' flexDirection='column' gap={4}>
        <FormControlLabel
          control={
            <Switch
              checked={mode === 'delete'}
              onChange={() => {
                setMode(mode === 'add' ? 'delete' : 'add');
                setPreferences([]);
                setSelectedForDeletion([]);
              }}
            />
          }
          label='Delete mode'
        />
        <div>
          <InputLabel id='course'>Courses</InputLabel>
          <Select
            labelId='course'
            id='course-select'
            multiple
            value={selectedCourses}
            onChange={e => setSelectedCourses(e.target.value as number[])}
            fullWidth
          >
            {userCourses.map(course => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div>
          <Typography variant='body1'>
            {currentlySelected}/{minSelections} selections
          </Typography>
          <TimeSelectionTable
            scheduleData={availabilitiesData as DaySchedule[]}
            pastSelections={pastPreferences}
            loading={
              postPreferenceMutation.isLoading ||
              deletePreferenceMutation.isLoading ||
              isAvailabilitiesDataLoading ||
              isCoursesDataLoading ||
              isGroupsDataLoading ||
              isPreferencesDataLoading
            }
            onSelect={selectedData => {
              if (mode === 'add') {
                setPreferences(selectedData);
              }
            }}
            isLecturer={false}
            mode={mode}
            deletionMap={deletionMap}
            selectedForDeletion={selectedForDeletion}
            onDeleteSelectionChange={ids => setSelectedForDeletion(ids)}
          />
        </div>
        {mode === 'add' &&
          preferences.length > 0 &&
          selectedCourses.length > 0 &&
          currentlySelected >= minSelections && (
            <Button
              variant='contained'
              size='large'
              onClick={handleSendPreferences}
            >
              Send preference
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

export default Preferences;
