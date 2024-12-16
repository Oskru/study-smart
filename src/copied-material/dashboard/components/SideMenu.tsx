import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';
import { UserRole, useUser } from '../../../hooks/use-user.ts';
import { useEffect, useState } from 'react';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

function capitalizeFirstLetter(val: string) {
  return (
    String(val).charAt(0).toUpperCase() + String(val).slice(1).toLowerCase()
  );
}

const getPolishRoleName = (role: UserRole): string => {
  if (role === 'ADMIN') return 'Administrator';
  if (role === 'LECTURER') return 'Wykładowca';
  if (role === 'PLANNER') return 'Planista';
  if (role === 'STUDENT') return 'Student';
  return 'Użytkownik';
};

export default function SideMenu() {
  const { user } = useUser();
  const [userAvatarUrl, setUserAvatarUrl] = useState(
    `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`
  );

  useEffect(() => {
    setUserAvatarUrl(
      `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`
    );
  }, [user]);

  return (
    <Drawer
      variant='permanent'
      sx={{
        // display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Divider />
      <MenuContent />
      <Stack
        direction='row'
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes='small'
          alt={user?.firstName + ' ' + user?.lastName}
          src={userAvatarUrl}
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto' }}>
          <Typography
            variant='body2'
            sx={{ fontWeight: 500, lineHeight: '16px' }}
          >
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {capitalizeFirstLetter(getPolishRoleName(user?.userRole))}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
