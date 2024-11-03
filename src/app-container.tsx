import SideMenu from './copied-material/dashboard/components/SideMenu.tsx';
import Box from '@mui/material/Box';
import * as React from 'react';
import { useAuth } from './hooks/use-auth.ts';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function AppContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode | React.ReactNode[];
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // TODO: uncomment when backend works with no cors errors
  // useEffect(() => {
  //   if (!user) {
  //     navigate('/login');
  //   }
  // }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <Stack gap={1}>
        <Typography variant='h3' sx={{ mb: 5 }}>
          {title}
        </Typography>
        {children}
      </Stack>
    </Box>
  );
}

export default AppContainer;
