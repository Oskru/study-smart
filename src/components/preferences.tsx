import { useState, useEffect } from 'react';
import AppContainer from './app-container.tsx';
import Select from '@mui/material/Select';
import { InputLabel, MenuItem, Box, Button, Typography } from '@mui/material';

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

import { fetchGroups, Group } from '../hooks/api/use-groups.ts'; // Assume we can import this now.

interface SelectedDataProps {
  iden: number;
  dayName: string;
  times: string[];
  timeRanges: [string, string][];
}

function Preferences() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course['id'] | null>(null);
  const [preferences, setPreferences] = useState<SelectedDataProps[]>([]);
  const [preferencesResponse, setPreferencesResponse] =
    useState<PreferencesType>([]);
  const [availabilitiesResponse, setAvailabilitiesResponse] =
    useState<AvailabilitiesType>([]);
  const [pastPreferences, setPastPreferences] = useState<PastSelection[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

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

        // Filter only current user's preferences for pastSelections
        const userPastSelections: PastSelection[] = prefData
          .filter(pref => pref.studentId === user.id)
          .map(pref => ({
            dayName: pref.dayName,
            times: pref.times,
          }));
        setPastPreferences(userPastSelections);

        // Determine which courses the student can see:
        // Find groups that this user is in
        const userGroupNames = groupData
          .filter(g => g.studentIdList.includes(user.id))
          .map(g => g.name);

        // Filter courses by those whose name is in userGroupNames
        const filteredCourses = courseData.filter(c =>
          userGroupNames.includes(c.name)
        );
        setCourses(filteredCourses);
        setCurrentCourse(
          filteredCourses.length > 0 ? filteredCourses[0].id : null
        );
      })
      .finally(() => {
        setDataLoading(false);
      });
  }, [user]);

  const handleSendPreferences = () => {
    if (!preferences || !currentCourse || !user) return;
    const prefsToSend: Omit<Preference, 'id'>[] = preferences.map(pref => ({
      dayId: pref.iden,
      dayName: pref.dayName as Preference['dayName'],
      timeRanges: pref.timeRanges,
      times: pref.times,
      courseId: currentCourse!,
      studentId: Number(user.id),
    }));

    postPreference(prefsToSend)
      .then(() => fetchPreferences())
      .then(data => {
        setPreferencesResponse(data);
        const userPastSelections: PastSelection[] = data
          .filter(pref => pref.studentId === user.id)
          .map(pref => ({
            dayName: pref.dayName,
            times: pref.times,
          }));
        setPastPreferences(userPastSelections);
        setPreferences([]);
      })
      .catch(error => alert(`Error while posting preferences: ${error}`));
  };

  const currentCourseObj = courses.find(c => c.id === currentCourse);
  const minSelections = currentCourseObj?.courseDuration || 0;

  return (
    <AppContainer title='Preferences Management'>
      <Box display='flex' flexDirection='column' gap={4}>
        <Typography variant='body1'>
          Minimum selections required: {minSelections}
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
          <InputLabel id='course'>
            Course* (required to send preference)
          </InputLabel>
          <Select
            labelId='course'
            id='course-select'
            value={currentCourse ?? ''}
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
        {preferences.length > 0 && currentCourse ? (
          <Button
            variant='contained'
            size='large'
            onClick={handleSendPreferences}
          >
            Send preference
          </Button>
        ) : null}
      </Box>
    </AppContainer>
  );
}

export default Preferences;
