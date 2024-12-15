import { useState, useEffect, useMemo } from 'react';
import AppContainer from './app-container.tsx';
import {
  InputLabel,
  MenuItem,
  Box,
  Button,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Select from '@mui/material/Select';
import { useSnackbar } from 'notistack';

import {
  fetchPreferences,
  postPreference,
  deletePreference,
  Preference,
  Preferences as PreferencesType,
} from '../hooks/api/use-get-preferences.ts';
import { useUser } from '../hooks/use-user.ts';
import { Course, fetchCourses } from '../hooks/api/use-courses.ts';
import {
  Availabilities as AvailabilitiesType,
  fetchAvailabilities,
} from '../hooks/api/use-availabilities.ts';
import {
  DaySchedule,
  PastSelection,
  TimeSelectionTable,
} from './time-selection-table.tsx';
import { fetchGroups, Group } from '../hooks/api/use-groups.ts';

interface SelectedDataProps {
  iden: number;
  dayName: string;
  times: string[];
  timeRanges: [string, string][];
}

function Preferences() {
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [preferences, setPreferences] = useState<SelectedDataProps[]>([]);
  const [preferencesResponse, setPreferencesResponse] =
    useState<PreferencesType>([]);
  const [availabilitiesResponse, setAvailabilitiesResponse] =
    useState<AvailabilitiesType>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [mode, setMode] = useState<'add' | 'delete'>('add');
  const [selectedForDeletion, setSelectedForDeletion] = useState<number[]>([]);

  const pastPreferences = useMemo(() => {
    if (!user || selectedCourses.length === 0) return [];
    return preferencesResponse
      .filter(
        pref =>
          pref &&
          pref.studentId === user.id &&
          selectedCourses.includes(pref.courseId)
      )
      .map(pref => ({
        dayName: pref.dayName,
        times: pref.times,
      }));
  }, [preferencesResponse, user, selectedCourses]);

  const deletionMap = useMemo(() => {
    const map: Record<string, { id: number; allTimes: string[] }> = {};
    preferencesResponse.forEach(p => {
      const { id, dayName, times } = p;
      if (id == null) return;
      times.forEach(t => {
        const key = `${dayName}-${t}`;
        map[key] = { id, allTimes: times };
      });
    });
    return map;
  }, [preferencesResponse]);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);

    Promise.all([
      fetchPreferences(),
      fetchAvailabilities(),
      fetchCourses(),
      fetchGroups(),
    ])
      .then(([prefData, availData, courseData, groupData]) => {
        setPreferencesResponse(prefData);
        setAvailabilitiesResponse(availData);
        setGroups(groupData);

        const userGroups = groupData.filter(g =>
          g.studentIdList.includes(user.id)
        );
        const userCourseIds = new Set<number>();
        userGroups.forEach(g => {
          g.courseIdList.forEach(cid => userCourseIds.add(cid));
        });

        const userCourses = courseData.filter(c => userCourseIds.has(c.id));
        setCourses(userCourses);
        setSelectedCourses(userCourses.map(c => c.id));
      })
      .finally(() => {
        setDataLoading(false);
      });
  }, [user]);

  const minSelections = useMemo(() => {
    const selectedCourseObjects = courses.filter(c =>
      selectedCourses.includes(c.id)
    );
    return selectedCourseObjects.reduce((sum, c) => sum + c.courseDuration, 0);
  }, [courses, selectedCourses]);

  // Count hours from pastPreferences
  const pastCount = useMemo(() => {
    return pastPreferences.reduce((sum, p) => sum + p.times.length, 0);
  }, [pastPreferences]);

  // Count hours from new preferences
  const newCount = useMemo(
    () => preferences.reduce((sum, p) => sum + p.times.length, 0),
    [preferences]
  );

  // Combine past + new
  const currentlySelected = pastCount + newCount;

  const handleSendPreferences = () => {
    if (!preferences || selectedCourses.length === 0 || !user) return;
    if (currentlySelected < minSelections) return;

    const prefsToSendAll = selectedCourses.map(courseId =>
      preferences.map(pref => ({
        dayId: pref.iden,
        dayName: pref.dayName as Preference['dayName'],
        timeRanges: pref.timeRanges,
        times: pref.times,
        courseId: courseId,
        studentId: Number(user.id),
      }))
    );

    const allRequests = prefsToSendAll.map(batch => postPreference(batch));

    Promise.all(allRequests)
      .then(() => {
        // Refetch preferences to ensure data integrity
        return fetchPreferences().then(data => {
          setPreferencesResponse(data);
          setPreferences([]);
          enqueueSnackbar('Preferences sent successfully!', {
            variant: 'success',
          });
        });
      })
      .catch(error => {
        enqueueSnackbar(`Error while posting preferences: ${error}`, {
          variant: 'error',
        });
      });
  };

  const handleCourseChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as number[];
    setSelectedCourses(value);
  };

  const onDeleteSelectionChange = (ids: number[]) => {
    setSelectedForDeletion(ids);
  };

  const handleDelete = () => {
    const deletes = selectedForDeletion.map(id => deletePreference(id));
    Promise.all(deletes)
      .then(() => fetchPreferences())
      .then(data => {
        setPreferencesResponse(data);
        setSelectedForDeletion([]);
        enqueueSnackbar('Preferences deleted successfully!', {
          variant: 'success',
        });
      })
      .catch(error => {
        enqueueSnackbar(`Error deleting preferences: ${error}`, {
          variant: 'error',
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
          <InputLabel id='course'>Courses* (required)</InputLabel>
          <Select
            labelId='course'
            id='course-select'
            multiple
            value={selectedCourses}
            onChange={handleCourseChange}
            fullWidth
            renderValue={selected => {
              const ids = selected as number[];
              const names = courses
                .filter(c => ids.includes(c.id))
                .map(c => c.name);
              return names.join(', ');
            }}
          >
            {courses.map(course => (
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
            scheduleData={availabilitiesResponse as DaySchedule[]}
            pastSelections={pastPreferences}
            loading={dataLoading}
            onSelect={selectedData => {
              if (mode === 'add') {
                setPreferences(selectedData);
              }
            }}
            isLecturer={false}
            mode={mode}
            deletionMap={deletionMap}
            selectedForDeletion={selectedForDeletion}
            onDeleteSelectionChange={onDeleteSelectionChange}
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
