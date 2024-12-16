import {
  Typography,
  Box,
} from '@mui/material';
import AppContainer from './app-container.tsx';
import { useUser } from '../hooks/use-user.ts';
import { styled } from '@mui/system';
import UserDetails from './home-user-details.tsx';
import { Masonry } from '@mui/lab';
import HomeCourses from './home-courses.tsx';

export default function Home() {
  const user = useUser();

  const LargeTypography = styled(Typography)(({ theme }) => ({
    fontSize: '14px',
    textAlign: 'justify',
    [theme.breakpoints.up('sm')]: {
      fontSize: '16px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '18px',
    },
  }));

  const StyledHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    textAlign: 'center',
  }));

  const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    border: '1px solid',
    borderRadius: '2%',
  }));

  return <AppContainer title='Witaj w aplikacji Study Smart!'>
    <Masonry columns={3} spacing={2}>

      <StyledBox>
        <StyledHeader variant='h4'>
          O aplikacji
        </StyledHeader>
        <LargeTypography variant='body1'>
        Smart Study to nowoczesne rozwiązanie mające na celu uproszczenie procesu tworzenia planów nauki, które będą korzystne dla wszystkich zaangażowanych osób. Niezależnie od tego, czy jesteś studentem, wykładowcą czy planistą, Smart Study zapewnia narzędzia dostosowane do Twoich preferencji, dostępności i potrzeb.
        </LargeTypography>
      </StyledBox>

      {user.user && (user.user.userRole === 'STUDENT' || user.user.userRole === 'LECTURER') && (
          <StyledBox>
            <HomeCourses user={user.user} />
          </StyledBox>
        ) 
      }

      <StyledBox>
        {user.user ? <UserDetails user={user.user} /> : <Typography variant="body1" color="textSecondary" textAlign="center">
          Brak danych użytkownika.
        </Typography>}
      </StyledBox>
      
      <StyledBox>
        <StyledHeader variant='h4'>
          Instrukcja obsługi Study Smart
        </StyledHeader>
        <LargeTypography variant='body1'>
          Jako student możesz przejść do zakładki: <strong>Preferencje</strong>, aby wybrać swoje preferencje dotyczące dni i godzin.
          Zaznacz kiedy i o jakim czasie chciałbyś uczęszczać na zajęcia, aby plan zajęć był lepiej dostosowany do Twojego planu dnia.
          <br />
          <br />
          Jako wykładowca możesz przejść do zakładki: <strong>Dostępność</strong>, aby wybrać dni oraz godziny, w których jesteś dostępny.
          Zaznacz kiedy i o jakim czasie chciałbyś prowadzić zajęcia, aby plan zajęć był jak najlepiej dostosowany do Twoich potrzeb.
        </LargeTypography>
      </StyledBox>

      <StyledBox>
        <StyledHeader variant='h4'>
          Długość zapisów preferencji
        </StyledHeader>
        <LargeTypography variant='body1'>
          Zostało <strong>15</strong> dni do zakończenia zapisów preferencji oraz dostępności.
        </LargeTypography>
      </StyledBox>

    </Masonry>
  </AppContainer>;
}
