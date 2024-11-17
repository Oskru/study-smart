import { useState } from 'react';
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
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Mock data for availability preferences
const initialPreferences = [
  {
    id: 1,
    dayOfWeek: 'Monday',
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 11, minute: 30 },
    student: { firstName: 'John', lastName: 'Doe' },
  },
  {
    id: 2,
    dayOfWeek: 'Monday',
    startTime: { hour: 14, minute: 0 },
    endTime: { hour: 16, minute: 0 },
    student: { firstName: 'Jane', lastName: 'Smith' },
  },
];

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

function Preferences() {
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [preferences, setPreferences] = useState(initialPreferences);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentPreference, setCurrentPreference] = useState(null);

  // Filter preferences based on selected day
  const filteredPreferences = preferences.filter(
    preference => preference.dayOfWeek === dayOfWeek
  );

  // Handle delete dialog
  const handleDeleteOpen = preference => {
    setCurrentPreference(preference);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    setPreferences(prev =>
      prev.filter(preference => preference.id !== currentPreference.id)
    );
    setDeleteDialogOpen(false);
    setCurrentPreference(null);
  };

  // Handle edit dialog
  const handleEditOpen = preference => {
    setCurrentPreference(preference);
    setEditDialogOpen(true);
  };
  const handleEditConfirm = () => {
    setPreferences(prev =>
      prev.map(preference =>
        preference.id === currentPreference.id ? currentPreference : preference
      )
    );
    setEditDialogOpen(false);
    setCurrentPreference(null);
  };

  // Handle add dialog
  const handleAddOpen = () => {
    setCurrentPreference({
      dayOfWeek: '',
      startTime: { hour: 0, minute: 0 },
      endTime: { hour: 1, minute: 0 },
      student: { firstName: 'New', lastName: 'User' },
    });
    setAddDialogOpen(true);
  };

  const handleAddConfirm = () => {
    setPreferences(prev => [...prev, currentPreference]);
    setAddDialogOpen(false);
    setCurrentPreference(null);
  };

  return (
    <AppContainer title='Here you can access your availability preferences'>
      <InputLabel id='day-of-week'>Day of week</InputLabel>
      <Select
        labelId='day-of-week'
        id='day-of-week-select'
        value={dayOfWeek}
        onChange={e => setDayOfWeek(e.target.value)}
        fullWidth
      >
        <MenuItem value={'Monday'}>Monday</MenuItem>
        <MenuItem value={'Tuesday'}>Tuesday</MenuItem>
        <MenuItem value={'Wednesday'}>Wednesday</MenuItem>
        <MenuItem value={'Thursday'}>Thursday</MenuItem>
        <MenuItem value={'Friday'}>Friday</MenuItem>
        <MenuItem value={'Saturday'}>Saturday</MenuItem>
        <MenuItem value={'Sunday'}>Sunday</MenuItem>
      </Select>

      <Box sx={{ mt: 4 }}>
        <Typography variant='h6'>
          Availabilities for {dayOfWeek || '...'}
        </Typography>
        {filteredPreferences.length > 0 ? (
          filteredPreferences.map(preference => (
            <TimeSlot key={preference.id} elevation={3}>
              <Typography variant='body1'>
                {`${preference.startTime.hour}:${preference.startTime.minute
                  .toString()
                  .padStart(
                    2,
                    '0'
                  )} - ${preference.endTime.hour}:${preference.endTime.minute
                  .toString()
                  .padStart(2, '0')}`}
              </Typography>
              <Typography variant='caption'>
                {`${preference.student.firstName} ${preference.student.lastName}`}
              </Typography>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  onClick={() => handleEditOpen(preference)}
                  size='small'
                >
                  <EditIcon fontSize='small' />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteOpen(preference)}
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

      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddOpen}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog
        open={editDialogOpen || addDialogOpen}
        onClose={() =>
          editDialogOpen ? setEditDialogOpen(false) : setAddDialogOpen(false)
        }
      >
        <DialogTitle>
          {editDialogOpen ? 'Edit Availability' : 'Add Availability'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label='Day of Week'
            value={currentPreference?.dayOfWeek || ''}
            onChange={e =>
              setCurrentPreference(prev => ({
                ...prev,
                dayOfWeek: e.target.value,
              }))
            }
            fullWidth
            margin='dense'
          />
          <TextField
            label='Start Hour'
            type='number'
            value={currentPreference?.startTime?.hour || ''}
            onChange={e =>
              setCurrentPreference(prev => ({
                ...prev,
                startTime: {
                  ...prev.startTime,
                  hour: parseInt(e.target.value) || 0,
                },
              }))
            }
            fullWidth
            margin='dense'
          />
          <TextField
            label='End Hour'
            type='number'
            value={currentPreference?.endTime?.hour || ''}
            onChange={e =>
              setCurrentPreference(prev => ({
                ...prev,
                endTime: {
                  ...prev.endTime,
                  hour: parseInt(e.target.value) || 0,
                },
              }))
            }
            fullWidth
            margin='dense'
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              editDialogOpen
                ? setEditDialogOpen(false)
                : setAddDialogOpen(false)
            }
          >
            Cancel
          </Button>
          <Button
            onClick={editDialogOpen ? handleEditConfirm : handleAddConfirm}
            color='primary'
          >
            {editDialogOpen ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this availability?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AppContainer>
  );
}

export default Preferences;
