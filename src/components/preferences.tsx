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
import styled from '@emotion/styled';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  DayNames,
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

import React from 'react';
import {
  Availabilities as AvailabilitiesType,
  fetchAvailabilities,
} from '../hooks/api/use-availabilities.ts';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
} from '@mui/material';

interface DaySchedule {
  id: number;
  dayId: number;
  dayName: string;
  times: string[];
  timeRanges: [string, string][];
  lecturerId: number;
}

interface PreferenceTableProps {
  scheduleData: DaySchedule[];
}

const hours = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const PreferenceTable: React.FC<PreferenceTableProps> = ({
  scheduleData,
}) => {
  const theme = useTheme();

  const scheduleByDay = scheduleData.reduce(
    (acc: Record<string, DaySchedule>, curr) => {
      acc[curr.dayName] = curr;
      return acc;
    },
    {}
  );

  const isHourTaken = (dayName: string, hour: string) => {
    const daySchedule = scheduleByDay[dayName];
    if (!daySchedule) return false;
    // Check if the hour is explicitly listed in `times`
    return daySchedule.times.includes(hour);
  };

  return (
    <Table
      sx={{
        borderCollapse: 'collapse',
        width: '100%',
        marginTop: theme.spacing(2),
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              fontWeight: 'bold',
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            Day/Hour
          </TableCell>
          {hours.map(hour => (
            <TableCell
              key={hour}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              {hour}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {days.map(day => (
          <TableRow key={day}>
            <TableCell
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {day}
            </TableCell>
            {hours.map(hour => {
              const taken = isHourTaken(day, hour);
              return (
                <TableCell
                  key={`${day}-${hour}`}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    textAlign: 'center',
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: theme.typography.body2.fontWeight,
                    backgroundColor: taken
                      ? theme.palette.success.light
                      : theme.palette.background.default,
                    '&:hover': {
                      backgroundColor: taken
                        ? theme.palette.success.main
                        : theme.palette.action.hover,
                    },
                  }}
                >
                  {hour}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

function Preferences() {
  const [courses, setCourses] = useState<Course[] | []>([]);
  const [currentCourse, setCurrentCourse] = useState<Course['id'] | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [preferences, setPreferences] = useState<
    SelectedDataProps[] | undefined
  >(undefined);
  const [preferencesResponse, setPreferencesResponse] =
    useState<PreferencesType>([]);
  const [availabilitiesResponse, setAvailabilitiesResponse] =
    useState<AvailabilitiesType>([]);
  const { user } = useUser();

  // Populate preferences once data is fetched
  useEffect(() => {
    fetchPreferences().then(data => setPreferencesResponse(data));
    fetchAvailabilities().then(data => setAvailabilitiesResponse(data));

    fetchCourses().then(data => {
      setCourses(data);
      setCurrentCourse(data[0].id);
    });
  }, []);

  const filteredPreferences = preferencesResponse.filter(
    preference =>
      preference.dayName === dayOfWeek && preference.courseId === currentCourse
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
    postPreference(
      preferences!.map(preference => {
        return {
          dayId: Number(preference.iden),
          dayName: preference.dayName as Preference['dayName'],
          timeRanges: preference.timeRanges,
          times: preference.times!,
          courseId: currentCourse,
          studentId: Number(user?.id),
        } as unknown as Preference;
      })
    );
  };

  return (
    <AppContainer title='Preferences Management'>
      <Box display='flex' flexDirection='column' gap={4}>
        <PreferenceTable
          scheduleData={availabilitiesResponse as DaySchedule[]}
        />
        <ReactWeekTimeRangePicker selectTimeRange={handleSelectTimeRange} />
        <div>
          <InputLabel id='course'>
            Course* (required to send preference)
          </InputLabel>
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
        {preferences &&
        Object.keys(preferences).length !== 0 &&
        currentCourse ? (
          <Button
            variant='contained'
            size='large'
            disabled={!preferences}
            onClick={handleSendPreferences}
          >
            Send preference
          </Button>
        ) : null}
        <Typography variant='h6'>
          Availabilities for{' '}
          {courses.find(course => course.id === currentCourse)?.name}
          {', '}
          {dayOfWeek || '...'}
        </Typography>
        {filteredPreferences.length > 0 ? (
          filteredPreferences.map(preference => (
            <TimeSlot key={preference.id} elevation={3}>
              <Typography variant='body1'>
                {`${preference.times[0]} - ${preference.times[preference.times.length - 1]}`}
              </Typography>
              <Typography variant='caption'>
                {`${preference.dayName} ${courses.find(course => course.id === preference.courseId)?.name}`}
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
