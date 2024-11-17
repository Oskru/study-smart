import SideMenu from './copied-material/dashboard/components/SideMenu.tsx';
import Box from '@mui/material/Box';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function AppContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode | React.ReactNode[];
}) {
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
