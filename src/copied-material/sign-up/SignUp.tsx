import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/use-auth.ts';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%)',
    }),
  },
}));

export default function SignUp() {
  const [userType, setUserType] = React.useState<'student' | 'lecturer'>(
    'student'
  );

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [lastNameError, setLastNameError] = React.useState(false);
  const [lastNameErrorMessage, setLastNameErrorMessage] = React.useState('');

  // Additional fields for student
  const [indexNumberError, setIndexNumberError] = React.useState(false);
  const [indexNumberErrorMessage, setIndexNumberErrorMessage] =
    React.useState('');
  const [majorError, setMajorError] = React.useState(false);
  const [majorErrorMessage, setMajorErrorMessage] = React.useState('');

  // Additional fields for lecturer
  const [departmentError, setDepartmentError] = React.useState(false);
  const [departmentErrorMessage, setDepartmentErrorMessage] =
    React.useState('');
  const [titleError, setTitleError] = React.useState(false);
  const [titleErrorMessage, setTitleErrorMessage] = React.useState('');
  const [classRoomError, setClassRoomError] = React.useState(false);
  const [classRoomErrorMessage, setClassRoomErrorMessage] = React.useState('');
  const [officeNumberError, setOfficeNumberError] = React.useState(false);
  const [officeNumberErrorMessage, setOfficeNumberErrorMessage] =
    React.useState('');

  const { registerStudent, registerLecturer } = useAuth();

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const name = document.getElementById('name') as HTMLInputElement;
    const lastName = document.getElementById('lastname') as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage('Name is required.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!lastName.value || lastName.value.length < 1) {
      setLastNameError(true);
      setLastNameErrorMessage('Last name is required.');
      isValid = false;
    } else {
      setLastNameError(false);
      setLastNameErrorMessage('');
    }

    if (userType === 'student') {
      const indexNumber = document.getElementById(
        'indexNumber'
      ) as HTMLInputElement;
      const major = document.getElementById('major') as HTMLInputElement;

      if (!indexNumber.value || indexNumber.value.length < 1) {
        setIndexNumberError(true);
        setIndexNumberErrorMessage('Index number is required.');
        isValid = false;
      } else {
        setIndexNumberError(false);
        setIndexNumberErrorMessage('');
      }

      if (!major.value || major.value.length < 1) {
        setMajorError(true);
        setMajorErrorMessage('Major is required.');
        isValid = false;
      } else {
        setMajorError(false);
        setMajorErrorMessage('');
      }
    }

    if (userType === 'lecturer') {
      const department = document.getElementById(
        'department'
      ) as HTMLInputElement;
      const title = document.getElementById('title') as HTMLInputElement;
      const classRoom = document.getElementById(
        'classRoom'
      ) as HTMLInputElement;
      const officeNumber = document.getElementById(
        'officeNumber'
      ) as HTMLInputElement;

      if (!department.value || department.value.length < 1) {
        setDepartmentError(true);
        setDepartmentErrorMessage('Department is required.');
        isValid = false;
      } else {
        setDepartmentError(false);
        setDepartmentErrorMessage('');
      }

      if (!title.value || title.value.length < 1) {
        setTitleError(true);
        setTitleErrorMessage('Title is required.');
        isValid = false;
      } else {
        setTitleError(false);
        setTitleErrorMessage('');
      }

      if (!classRoom.value || classRoom.value.length < 1) {
        setClassRoomError(true);
        setClassRoomErrorMessage('Class room is required.');
        isValid = false;
      } else {
        setClassRoomError(false);
        setClassRoomErrorMessage('');
      }

      if (!officeNumber.value || officeNumber.value.length < 1) {
        setOfficeNumberError(true);
        setOfficeNumberErrorMessage('Office number is required.');
        isValid = false;
      } else {
        setOfficeNumberError(false);
        setOfficeNumberErrorMessage('');
      }
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const firstname = data.get('name') as string;
    const lastname = data.get('lastname') as string;
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    if (validateInputs()) {
      if (userType === 'student') {
        const indexNumber = data.get('indexNumber') as string;
        const major = data.get('major') as string;
        await registerStudent({
          firstName: firstname,
          lastName: lastname,
          email: email,
          password: password,
          indexNumber,
          major,
        });
      } else {
        // userType === 'lecturer'
        const department = data.get('department') as string;
        const title = data.get('title') as string;
        const classRoom = data.get('classRoom') as string;
        const officeNumber = data.get('officeNumber') as string;

        await registerLecturer({
          firstName: firstname,
          lastName: lastname,
          email: email,
          password: password,
          department,
          title,
          classRoom,
          officeNumber,
        });
      }
    }
  };

  return (
    <>
      <SignUpContainer direction='column' justifyContent='space-between'>
        <Card variant='outlined'>
          <Typography
            component='h1'
            variant='h4'
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl component='fieldset'>
              <FormLabel>User Type</FormLabel>
              <RadioGroup
                row
                aria-label='user-type'
                name='userType'
                value={userType}
                onChange={e =>
                  setUserType(e.target.value as 'student' | 'lecturer')
                }
              >
                <FormControlLabel
                  value='student'
                  control={<Radio />}
                  label='Student'
                />
                <FormControlLabel
                  value='lecturer'
                  control={<Radio />}
                  label='Lecturer'
                />
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor='name'>First name</FormLabel>
              <TextField
                autoComplete='name'
                name='name'
                required
                fullWidth
                id='name'
                placeholder='John'
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='lastname'>Last name</FormLabel>
              <TextField
                autoComplete='lastname'
                name='lastname'
                required
                fullWidth
                id='lastname'
                placeholder='Snow'
                error={lastNameError}
                helperText={lastNameErrorMessage}
                color={lastNameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='email'>Email</FormLabel>
              <TextField
                required
                fullWidth
                id='email'
                placeholder='your@email.com'
                name='email'
                autoComplete='email'
                variant='outlined'
                error={emailError}
                helperText={emailErrorMessage}
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='password'>Password</FormLabel>
              <TextField
                required
                fullWidth
                name='password'
                placeholder='••••••'
                type='password'
                id='password'
                autoComplete='new-password'
                variant='outlined'
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>

            {userType === 'student' && (
              <>
                <FormControl>
                  <FormLabel htmlFor='indexNumber'>Index Number</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name='indexNumber'
                    id='indexNumber'
                    placeholder='S123456'
                    error={indexNumberError}
                    helperText={indexNumberErrorMessage}
                    color={indexNumberError ? 'error' : 'primary'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='major'>Major</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name='major'
                    id='major'
                    placeholder='Computer Science'
                    error={majorError}
                    helperText={majorErrorMessage}
                    color={majorError ? 'error' : 'primary'}
                  />
                </FormControl>
              </>
            )}

            {userType === 'lecturer' && (
              <>
                <FormControl>
                  <FormLabel htmlFor='department'>Department</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name='department'
                    id='department'
                    placeholder='Computer Science Dept.'
                    error={departmentError}
                    helperText={departmentErrorMessage}
                    color={departmentError ? 'error' : 'primary'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='title'>Title</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name='title'
                    id='title'
                    placeholder='Professor / Dr.'
                    error={titleError}
                    helperText={titleErrorMessage}
                    color={titleError ? 'error' : 'primary'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='classRoom'>Class Room</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name='classRoom'
                    id='classRoom'
                    placeholder='Room 101'
                    error={classRoomError}
                    helperText={classRoomErrorMessage}
                    color={classRoomError ? 'error' : 'primary'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='officeNumber'>Office Number</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name='officeNumber'
                    id='officeNumber'
                    placeholder='Office 202'
                    error={officeNumberError}
                    helperText={officeNumberErrorMessage}
                    color={officeNumberError ? 'error' : 'primary'}
                  />
                </FormControl>
              </>
            )}

            <FormControlLabel
              control={<Checkbox value='allowExtraEmails' color='primary' />}
              label='I want to receive updates via email.'
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              onClick={validateInputs}
            >
              Sign up
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>or</Typography>
          </Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href='/login' variant='body2' sx={{ alignSelf: 'center' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </>
  );
}
