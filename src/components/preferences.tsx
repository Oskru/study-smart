import { useState, useEffect, useMemo } from 'react';
import AppContainer from './app-container.tsx';
import Select from '@mui/material/Select';
import {
  InputLabel,
  MenuItem,
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';

import {
  fetchPreferences,
  postPreference,
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [preferences, setPreferences] = useState<SelectedDataProps[]>([]);
  const [preferencesResponse, setPreferencesResponse] =
    useState<PreferencesType>([]);
  const [availabilitiesResponse, setAvailabilitiesResponse] =
    useState<AvailabilitiesType>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  );

  // Filtered past preferences based on selected courses
  const pastPreferences = useMemo(() => {
    if (selectedCourses.length === 0) return [];
    return preferencesResponse
      .filter(
        pref =>
          pref.studentId === user?.id && selectedCourses.includes(pref.courseId)
      )
      .map(pref => ({
        dayName: pref.dayName,
        times: pref.times,
      }));
  }, [preferencesResponse, user, selectedCourses]);

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

        // Determine user's courseIds
        const userGroups = groupData.filter(g =>
          g.studentIdList.includes(user.id)
        );
        const userCourseIds = new Set<number>();
        userGroups.forEach(g => {
          // Assuming g.courseIdList exists as per instructions
          g.courseIdList.forEach(cid => userCourseIds.add(cid));
        });

        const userCourses = courseData.filter(c => userCourseIds.has(c.id));
        setCourses(userCourses);
        // Default state for multi-select: all user courses
        setSelectedCourses(userCourses.map(c => c.id));
      })
      .finally(() => {
        setDataLoading(false);
      });
  }, [user]);

  // Min selections = sum of durations of selected courses
  const minSelections = useMemo(() => {
    const selectedCourseObjects = courses.filter(c =>
      selectedCourses.includes(c.id)
    );
    return selectedCourseObjects.reduce((sum, c) => sum + c.courseDuration, 0);
  }, [courses, selectedCourses]);

  // Currently selected hours = sum of all times.length in preferences
  const currentlySelected = useMemo(() => {
    return preferences.reduce((sum, p) => sum + p.times.length, 0);
  }, [preferences]);

  const handleSendPreferences = () => {
    if (!preferences || selectedCourses.length === 0 || !user) return;
    // Create payloads for each selectedCourse
    const prefsToSendAll: Omit<Preference, 'id'>[][] = selectedCourses.map(
      courseId => {
        return preferences.map(pref => ({
          dayId: pref.iden,
          dayName: pref.dayName as Preference['dayName'],
          timeRanges: pref.timeRanges,
          times: pref.times,
          courseId: courseId,
          studentId: Number(user.id),
        }));
      }
    );

    // Flatten all requests into a single array
    const allRequests = prefsToSendAll.map(batch => postPreference(batch));

    Promise.all(allRequests)
      .then(() => {
        return fetchPreferences().then(data => {
          setPreferencesResponse(data);
          setPreferences([]);
          setSnackbarSeverity('success');
          setSnackbarMsg('Preferences sent successfully!');
          setSnackbarOpen(true);
        });
      })
      .catch(error => {
        setSnackbarSeverity('error');
        setSnackbarMsg(`Error while posting preferences: ${error}`);
        setSnackbarOpen(true);
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCourseChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as number[];
    setSelectedCourses(value);
  };

  return (
    <AppContainer title='Preferences Management'>
      <Box display='flex' flexDirection='column' gap={4}>
        <Typography variant='body1'>
          {currentlySelected}/{minSelections} selections
        </Typography>
        <TimeSelectionTable
          scheduleData={availabilitiesResponse as DaySchedule[]}
          pastSelections={pastPreferences}
          loading={dataLoading}
          onSelect={selectedData => {
            setPreferences(selectedData);
            console.log('Selected data:', selectedData);
          }}
          isLecturer={false} // Student mode
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
        {preferences.length > 0 && selectedCourses.length > 0 ? (
          <Button
            variant='contained'
            size='large'
            onClick={handleSendPreferences}
          >
            Send preference
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

export default Preferences;
