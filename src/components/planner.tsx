import AppContainer from './app-container.tsx';
import { Button, InputLabel, MenuItem, Select, Box } from '@mui/material';
import { useState, useRef } from 'react';
import Multiselect from 'multiselect-react-dropdown';
import { useCoursesQuery } from '../hooks/api/use-courses';
import { useGroupsQuery, Group } from '../hooks/api/use-groups';
import { useStudentsQuery } from '../hooks/api/use-students';
import {
  useLecturersQuery,
  usePutAddCourseToLecturerMutation,
} from '../hooks/api/use-lecturers';
import { usePreferencesQuery } from '../hooks/api/use-preferences';
import { useSnackbar } from 'notistack';
import { PreferenceVotesTable } from './preference-votes-table.tsx';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

type Votes = { [key: string]: number };

export const Planner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const { enqueueSnackbar } = useSnackbar();

  const { data: coursesData = [] } = useCoursesQuery();
  const { data: groupsData = [] } = useGroupsQuery();
  const { data: studentsData = [] } = useStudentsQuery();
  const { data: lecturersData = [] } = useLecturersQuery();
  const { data: preferencesData = [] } = usePreferencesQuery();

  const [votes, setVotes] = useState<Votes>({});
  const [currentLecturerId, setCurrentLecturerId] = useState<number | null>(
    null
  );
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);

  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  const selectedItems = useRef<any>();

  // Mutations
  const addCourseToLecturerMutation = usePutAddCourseToLecturerMutation();

  // Methods
  const addVote = (day: string, hour: string): void => {
    const key = `${day}-${hour}`;
    setVotes(prevVotes => ({
      ...prevVotes,
      [key]: (prevVotes[key] || 0) + 1,
    }));
  };

  const handleAddCourseToLecturer = (lecturerId: number, courseId: number) => {
    addCourseToLecturerMutation.mutate(
      { lecturerId, courseId },
      {
        onSuccess: () => {
          enqueueSnackbar('Kurs przypisany do wykładowcy pomyślnie!', {
            variant: 'success',
          });
        },
        onError: (error: any) => {
          enqueueSnackbar(
            `Błąd podczas przypisywania kursu do wykładowcy: ${error}`,
            {
              variant: 'error',
            }
          );
        },
      }
    );
  };

  const handleGetPreferencesFromGroupAndCourse = (groupId: number) => {
    setVotes({});
    const myGroup = groupsData.find(g => g.id === groupId);
    if (!myGroup) return;

    const courseIds = selectedItems.current
      ?.getSelectedItems()
      .map(item => item.id);
    console.log(courseIds);
    if (!courseIds) return;
    const filteredStudents = studentsData.filter(student =>
      myGroup.studentIdList.includes(student.id)
    );

    filteredStudents.forEach(student => {
      const studentPreferences = preferencesData.filter(preference =>
        student.preferenceIdList.includes(preference.id)
      );
      const courseStudentPreferences = studentPreferences.filter(preference =>
        courseIds.includes(preference.courseId)
      );
      courseStudentPreferences.forEach(preference => {
        preference.times.forEach(time => {
          addVote(preference.dayName, time);
        });
      });
    });
  };

  return (
    <AppContainer title='Planowanie'>
      {/* WYBÓR GRUPY DO PREFERENCJI */}
      <div>
        <InputLabel id='group'>Grupa</InputLabel>
        <Select
          labelId='group'
          id='group-select'
          value={currentGroup?.id || ''}
          onChange={e => {
            const groupId = e.target.value as number;
            const group = groupsData.find(g => g.id === groupId);
            if (!group) return;
            setCurrentGroup({
              id: groupId,
              name: group.name,
              studentIdList: group.studentIdList,
              courseIdList: group.courseIdList,
            });
            selectedItems.current?.resetSelectedValues();
            handleGetPreferencesFromGroupAndCourse(groupId);
          }}
          fullWidth
        >
          {groupsData.map(group => (
            <MenuItem key={group.id} value={group.id}>
              {group.name}
            </MenuItem>
          ))}
        </Select>
      </div>

      {/* WYBÓR KURSÓW DO PREFERENCJI */}
      <Multiselect
        style={{
          option: { color: 'black' },
        }}
        options={coursesData
          .filter(course => currentGroup?.courseIdList.includes(course.id))
          .map(course => ({
            name: `${course.name}`,
            id: course.id,
          }))}
        displayValue='name'
        onSelect={() =>
          handleGetPreferencesFromGroupAndCourse(currentGroup!.id)
        }
        onRemove={() =>
          handleGetPreferencesFromGroupAndCourse(currentGroup!.id)
        }
        showCheckbox
        ref={selectedItems}
      />

      {/* TABELKA PREFERENCJI */}
      <PreferenceVotesTable votes={votes} />

      {/* PRZYDZIELANIE KURSU DO WYKŁADOWCY */}
      <div>
        <InputLabel id='course'>Przedmiot</InputLabel>
        <Select
          labelId='course'
          id='course-select'
          value={currentCourseId || ''}
          onChange={e => {
            const courseId = e.target.value as number;
            setCurrentCourseId(courseId);
          }}
          fullWidth
        >
          {coursesData.map(course => (
            <MenuItem key={course.id} value={course.id}>
              {course.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div>
        <InputLabel id='lecturer'>Wykładowca</InputLabel>
        <Select
          labelId='lecturer'
          id='lecturer-select'
          value={currentLecturerId || ''}
          onChange={e => setCurrentLecturerId(e.target.value as number)}
          fullWidth
        >
          {lecturersData.map(lecturer => (
            <MenuItem key={lecturer.id} value={lecturer.id}>
              {lecturer.firstName} {lecturer.lastName}
            </MenuItem>
          ))}
        </Select>
      </div>

      {currentLecturerId && currentCourseId ? (
        <Button
          variant='contained'
          size='large'
          disabled={!currentLecturerId || !currentCourseId}
          onClick={() => {
            handleAddCourseToLecturer(currentLecturerId!, currentCourseId!);
          }}
        >
          Przypisz kurs do wykładowcy
        </Button>
      ) : null}

      {/* LISTY */}
      <Box display='flex' flexDirection='column' gap={4}>
        <Box display='flex' gap={4}>
          <Button
            onClick={() => {
              pathname === '/planner/groups'
                ? navigate('')
                : navigate('groups');
            }}
            variant='contained'
          >
            Lista Grup
          </Button>
          <Button
            onClick={() => {
              pathname === '/planner/courses'
                ? navigate('')
                : navigate('courses');
            }}
            variant='contained'
          >
            Lista Kursów
          </Button>
        </Box>
        <Outlet /> {/* Renderowanie dzieci (Groups, Courses) */}
      </Box>
    </AppContainer>
  );
};
