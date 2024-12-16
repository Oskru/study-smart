import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { User } from '../hooks/use-user.ts';
import { useEffect, useState } from 'react';
import { Course } from '../hooks/api/use-courses.ts';
import { useCoursesQuery } from '../hooks/api/use-courses.ts';
import { useGroupsQuery } from '../hooks/api/use-groups.ts';

const StyledHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    textAlign: 'center',
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
    fontSize: '1.2rem',
    color: theme.palette.text.primary,
    fontWeight: 500,
}));

const StyledValue = styled(Typography)(({ theme }) => ({
    fontSize: '1.1rem',
    textAlign: 'justify',
    color: theme.palette.text.secondary,
    fontWeight: 400,
}));

const HomeCourses = ({ user }: { user: User | null }) => {
    if (!user) {
        return (
            <Typography variant="body1" color="textSecondary" textAlign="center">
                Brak danych użytkownika.
            </Typography>
        );
    }

    const [courses, setCourses] = useState<Course[] | []>();
    const { data: courseQuery, isLoading: courseLoading} = useCoursesQuery();

    const fetchLecturerCourses = async () => {
        const lecturerCourses = (courseQuery as Course[]).filter(course => course.lecturerId === user.id);
        setCourses(lecturerCourses);
    };

    const {data: groupQuery, isLoading: groupLoading } = useGroupsQuery();

    const fetchStudentCourses = async () => {
        const studentGroups = (groupQuery as any[]).filter(group => group.studentIdList.includes(user.id));
        const studentCourses = (courseQuery as Course[]).filter(course => studentGroups.some(group => group.courseIdList.includes(course.id)));
        setCourses(studentCourses);
    };

    useEffect(() => {
        if(user.userRole === 'LECTURER'){
            fetchLecturerCourses();
        }
        else if(user.userRole === 'STUDENT'){
            fetchStudentCourses();
        }
        
    }, [user, courseQuery, groupQuery]);

    return (
        <>
            <StyledHeader variant='h4'>
                Twoje kursy
            </StyledHeader>
            {courseLoading || groupLoading && <Typography variant='body1' textAlign='center'>
                Ładowanie kursów...
            </Typography>
            }
            {courses?.map(course => (

                <Box>
                    <StyledLabel variant='body1' sx={{ mt: 2, mb: 1 }}>
                        {course.name}
                    </StyledLabel>
                    <StyledValue variant='body2'>
                        {course.description}
                    </StyledValue>
                </Box>

            ))}
            {courses?.length === 0 && <Typography variant='body1' textAlign='center'>
                Brak kursów.
            </Typography>}

        </>

    );
}

export default HomeCourses;