import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
} from '@mui/material';

const hours = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface PreferenceTableProps {
  votes: { [key: string]: number };
}

const getBackgroundColor = (votes: number) => {
  const maxVotes = 8;
  const intensity = Math.min(votes / maxVotes, 1);
  const r = Math.round(255 * intensity + 255 * (1 - intensity));
  const g = Math.round(255 * (1 - intensity));
  const b = 150;
  return `rgb(${r}, ${g}, ${b})`;
};

export const PreferenceVotesTable: React.FC<PreferenceTableProps> = ({
  votes,
}) => {
  const theme = useTheme();

  const renderCell = (day: string, hour: string) => {
    const key = `${day}-${hour}`;
    const votesForCell = votes[key] || 0;
    return (
      <TableCell
        key={key}
        sx={{
          backgroundColor: getBackgroundColor(votesForCell),
          color: 'black',
          textAlign: 'center',
          fontSize: '15px',
          fontWeight: 'bold',
          border: '1px solid #ddd',
          padding: 0,
        }}
      >
        {votesForCell}
      </TableCell>
    );
  };

  return (
    <Table
      sx={{
        borderCollapse: 'collapse',
        width: '100%',
        marginTop: theme.spacing(2),
        fontFamily: theme.typography.fontFamily,
        userSelect: 'none',
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              fontWeight: 'bold',
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            Day/Hour
          </TableCell>
          {hours.map(hour => (
            <TableCell
              key={hour}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              {hour}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {days.map(day => (
          <TableRow key={day}>
            <TableCell
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {day}
            </TableCell>
            {hours.map(hour => renderCell(day, hour))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
