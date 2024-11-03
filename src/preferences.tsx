import Typography from '@mui/material/Typography';
import AppContainer from './app-container.tsx';
import Select from '@mui/material/Select';
import { InputLabel, MenuItem } from '@mui/material';
import { useState } from 'react';

function Preferences() {
  const [dayOfWeek, setDayOfWeek] = useState('');
  return (
    <AppContainer title='Here you can access your availability preferences'>
      <InputLabel id='day-of-week'>Day of week</InputLabel>
      <Select
        labelId='demo-simple-select-label'
        id='demo-simple-select'
        value={dayOfWeek}
        label='Age'
        onChange={e => setDayOfWeek(e.target.value)}
      >
        <MenuItem value={'Monday'}>Monday</MenuItem>
        <MenuItem value={'Tuesday'}>Tuesday</MenuItem>
        <MenuItem value={'Wednesday'}>Wednesday</MenuItem>
        <MenuItem value={'Thursday'}>Thursday</MenuItem>
        <MenuItem value={'Friday'}>Friday</MenuItem>
        <MenuItem value={'Saturday'}>Saturday</MenuItem>
        <MenuItem value={'Sunday'}>Sunday</MenuItem>
      </Select>
    </AppContainer>
  );
}

export default Preferences;
