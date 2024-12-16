import { Box, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { User } from '../hooks/use-user.ts';
import { useEffect, useState } from 'react';
import { useStudentsQuery } from '../hooks/api/use-students.ts';
import { useLecturersQuery } from '../hooks/api/use-lecturers.ts';

const StyledHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    textAlign: 'center',
}));

const StyledValue = styled(Typography)(({ theme }) => ({
    fontSize: '1.2rem',
    color: theme.palette.text.primary,
    fontWeight: 500,
    wordBreak: 'break-word',
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
    fontSize: '1.1rem',
    color: theme.palette.text.secondary,
    textAlign: 'justify',
    fontWeight: 400,
    wordBreak: 'break-word',
}));


const UserDetails = ({ user }: { user: User | null }) => {
    if (!user) {
        return (
            <Typography variant="body1" color="textSecondary" textAlign="center">
                Brak danych użytkownika.
            </Typography>
        );
    }

    const [additionalData, setAdditionalData] = useState<any>(null);
    const { data: studentsQuery, isLoading: studentLoading }  = useStudentsQuery();
    const { data: lecturersQuery, isLoading: lecturerLoading } = useLecturersQuery();

    const fetchUserDetails = async () => {
        if(user.userRole === 'STUDENT') {
            setAdditionalData((studentsQuery as any[]).find((student) => student.id === user.id));
        }
        else if(user.userRole === 'LECTURER') {
            setAdditionalData((lecturersQuery as any[]).find((lecturer) => lecturer.id === user.id));
        }
    };
    
    useEffect(() => {
        fetchUserDetails();
    }, [user, studentsQuery, lecturersQuery]);


    const roleTranslations: Record<string, string> = {
        STUDENT: 'Student',
        LECTURER: 'Wykładowca',
        ADMIN: 'Administrator',
        PLANNER: 'Planista',
    };

    return (
        <Box>
            <StyledHeader variant="h4">Twoje dane</StyledHeader>

            <Grid container spacing={2}>
                {/* Imię */}
                <Grid item xs={4}>
                    <StyledLabel>Imię</StyledLabel>
                </Grid>
                <Grid item xs={8}>
                    <StyledValue>{user.firstName || 'Brak danych'}</StyledValue>
                </Grid>

                {/* Nazwisko */}
                <Grid item xs={4}>
                    <StyledLabel>Nazwisko</StyledLabel>
                </Grid>
                <Grid item xs={8}>
                    <StyledValue>{user.lastName || 'Brak danych'}</StyledValue>
                </Grid>

                {/* Rola */}
                <Grid item xs={4}>
                    <StyledLabel>Rola</StyledLabel>
                </Grid>
                <Grid item xs={8}>
                    <StyledValue>{user.userRole ? roleTranslations[user.userRole] : 'Brak roli'}</StyledValue>
                </Grid>

                {/* Email */}
                <Grid item xs={4}>
                    <StyledLabel>Email</StyledLabel>
                </Grid>
                <Grid item xs={8}>
                    <StyledValue>{user.email || 'Brak danych'}</StyledValue>
                </Grid>

                {/* Dodatkowe dane */}
                {studentLoading || lecturerLoading && (
                    <Grid item xs={12}>
                        <Typography variant="body1" textAlign="center">
                            Ładowanie dodatkowych danych...
                        </Typography>
                    </Grid>
                )}
                {additionalData && (
                    <>
                        {user.userRole === 'STUDENT' && (
                            <>
                                {/* Numer indeksu */}
                                <Grid item xs={4}>
                                    <StyledLabel>Nr indeksu</StyledLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <StyledValue>{additionalData.indexNumber || 'Brak danych'}</StyledValue>
                                </Grid>    
                                {/* Kierunek */}
                                <Grid item xs={4}>
                                    <StyledLabel>Kierunek</StyledLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <StyledValue>{additionalData.major || 'Brak danych'}</StyledValue>
                                </Grid>
                            </>
                        )}
                        {user.userRole === 'LECTURER' && (
                            <>
                                {/* Tytuł */}
                                <Grid item xs={4}>
                                    <StyledLabel>Tytuł</StyledLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <StyledValue>{additionalData.title || 'Brak danych'}</StyledValue>
                                    
                                </Grid>
                                {/* Katedra */}
                                <Grid item xs={4}>
                                    <StyledLabel>Wydział</StyledLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <StyledValue>{additionalData.department || 'Brak danych'}</StyledValue>
                                </Grid>
                                <Grid item xs={4}>
                                    <StyledLabel>Nr gabinetu</StyledLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <StyledValue>{additionalData.officeNumber || 'Brak danych'}</StyledValue>
                                </Grid>
                            </>
                        )}
                    </>
                )}
            </Grid>
        </Box>
    );
};

export default UserDetails;
