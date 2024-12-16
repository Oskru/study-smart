import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
  CircularProgress,
  Box,
} from '@mui/material';

export interface DaySchedule {
  id: number;
  dayId: number;
  dayName: string;
  times: string[];
  timeRanges: [string, string][];
  lecturerId: number;
}

export interface PastSelection {
  dayName: string;
  times: string[];
}

interface SelectedDataProps {
  iden: number;
  dayName: string;
  times: string[];
  timeRanges: [string, string][];
}

interface TimeSelectionTableProps {
  scheduleData?: DaySchedule[];
  pastSelections?: PastSelection[];
  onSelect: (selectedData: SelectedDataProps[]) => void;
  loading?: boolean;
  isLecturer?: boolean;
  mode: 'add' | 'delete';
  deletionMap?: Record<string, { id: number; allTimes: string[] }>;
  selectedForDeletion?: number[];
  onDeleteSelectionChange?: (ids: number[]) => void;
}

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
  '22:00',
];

const days = [
  ['Monday', 'Poniedziałek'],
  ['Tuesday', 'Wtorek'],
  ['Wednesday', 'Środa'],
  ['Thursday', 'Czwartek'],
  ['Friday', 'Piątek'],
  ['Saturday', 'Sobota'],
  ['Sunday', 'Niedziela'],
];

const dayIdMap: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

export const TimeSelectionTable: React.FC<TimeSelectionTableProps> = ({
  scheduleData = [],
  pastSelections = [],
  onSelect,
  loading = false,
  isLecturer = false,
  mode = 'add',
  deletionMap = {},
  selectedForDeletion = [],
  onDeleteSelectionChange,
}) => {
  const theme = useTheme();

  const scheduleByDay = useMemo(() => {
    const map: Record<string, DaySchedule> = {};
    scheduleData.forEach(curr => {
      map[curr.dayName] = curr;
    });
    return map;
  }, [scheduleData]);

  const isHourInSchedule = (dayName: string, hour: string) => {
    const daySchedule = scheduleByDay[dayName];
    if (!daySchedule) return false;
    return daySchedule.times.includes(hour);
  };

  const pastSet = useMemo(() => {
    const s = new Set<string>();
    pastSelections.forEach(sel => {
      sel.times.forEach(t => s.add(`${sel.dayName}-${t}`));
    });
    return s;
  }, [pastSelections]);

  const [selectedCells, setSelectedCells] = useState<Record<string, string[]>>(
    {}
  );
  const prevSelectedDataRef = useRef<SelectedDataProps[] | null>(null);

  const buildTimeRangesFromSortedTimes = (
    times: string[]
  ): [string, string][] => {
    if (times.length === 0) return [];
    const ranges: [string, string][] = [];
    let start = times[0];
    let end = start;
    for (let i = 1; i < times.length; i++) {
      const current = times[i];
      if (isConsecutive(end, current)) {
        end = current;
      } else {
        ranges.push([start, end]);
        start = current;
        end = current;
      }
    }
    ranges.push([start, end]);
    return ranges;
  };

  const isConsecutive = (a: string, b: string) => {
    const ha = parseInt(a.split(':')[0], 10);
    const hb = parseInt(b.split(':')[0], 10);
    return hb === ha + 1;
  };

  const handleCellClick = (day: string, hour: string) => {
    const key = `${day}-${hour}`;
    if (mode === 'add') {
      const inSchedule = isHourInSchedule(day, hour);
      const past = pastSet.has(key);
      const clickable = isLecturer || past || inSchedule;
      if (!clickable) return;

      setSelectedCells(prev => {
        const currentSelection = prev[day] || [];
        if (currentSelection.includes(hour)) {
          // Deselect
          const newSelection = currentSelection.filter(h => h !== hour);
          const updated = { ...prev, [day]: newSelection };
          if (newSelection.length === 0) delete updated[day];
          return updated;
        } else {
          // Select
          const newSelection = [...currentSelection, hour].sort();
          return { ...prev, [day]: newSelection };
        }
      });
    } else {
      // Delete mode
      const entry = deletionMap[key];
      if (!entry || !onDeleteSelectionChange) return;
      const { id } = entry;
      if (selectedForDeletion.includes(id)) {
        onDeleteSelectionChange(selectedForDeletion.filter(x => x !== id));
      } else {
        onDeleteSelectionChange([...selectedForDeletion, id]);
      }
    }
  };

  useEffect(() => {
    const selectedData: SelectedDataProps[] = Object.keys(selectedCells).map(
      day => {
        const daySchedule = scheduleByDay[day];
        const sortedTimes = [...selectedCells[day]].sort();
        const timeRanges = buildTimeRangesFromSortedTimes(sortedTimes);

        let finalDayId = daySchedule?.dayId;
        if (!finalDayId || finalDayId === 0) {
          finalDayId = dayIdMap[day] || 0;
        }

        return {
          iden: finalDayId,
          dayName: day,
          times: sortedTimes,
          timeRanges,
        };
      }
    );

    const prevData = prevSelectedDataRef.current;
    const dataChanged =
      !prevData ||
      prevData.length !== selectedData.length ||
      !areArraysEqual(prevData, selectedData);

    if (dataChanged) {
      prevSelectedDataRef.current = selectedData;
      onSelect(selectedData);
    }
  }, [selectedCells, onSelect, scheduleByDay]);

  const areArraysEqual = (
    arr1: SelectedDataProps[],
    arr2: SelectedDataProps[]
  ) => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      const a = arr1[i];
      const b = arr2[i];
      if (
        a.iden !== b.iden ||
        a.dayName !== b.dayName ||
        a.times.length !== b.times.length ||
        !a.times.every((t, idx) => t === b.times[idx])
      ) {
        return false;
      }
    }
    return true;
  };

  const getBaseColor = (day: string, hour: string) => {
    const key = `${day}-${hour}`;
    const past = pastSet.has(key);
    if (isLecturer) {
      if (past) return 'orange';
      return 'none';
    } else {
      if (past) return 'orange';
      if (isHourInSchedule(day, hour)) return 'green';
      return 'none';
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          position: 'relative',
          filter: loading ? 'blur(1px)' : 'none',
        }}
      >
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
                Dzień/Godzina
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
            {days.map(day => {
              const daySelection = selectedCells[day[0]] || [];
              return (
                <TableRow key={day[0]}>
                  <TableCell
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    {day[1]}
                  </TableCell>
                  {hours.map(hour => {
                    const isSelected = daySelection.includes(hour);
                    const baseColor = getBaseColor(day[0], hour);
                    const key = `${day[0]}-${hour}`;
                    const entry = deletionMap[key]; // Safe to define here
                    const inSchedule = isHourInSchedule(day[0], hour);
                    const past = pastSet.has(key);
                    const clickable = isLecturer || past || inSchedule;

                    let bgColor: string;
                    if (mode === 'add') {
                      bgColor = isSelected
                        ? theme.palette.info.main
                        : baseColor === 'orange'
                          ? theme.palette.warning.light
                          : baseColor === 'green'
                            ? theme.palette.success.light
                            : theme.palette.background.default;
                    } else {
                      // Delete mode
                      bgColor =
                        entry && selectedForDeletion.includes(entry.id)
                          ? theme.palette.error.light
                          : baseColor === 'orange'
                            ? theme.palette.warning.light
                            : baseColor === 'green'
                              ? theme.palette.success.light
                              : theme.palette.background.default;
                    }

                    return (
                      <TableCell
                        key={key}
                        onClick={() => handleCellClick(day[0], hour)}
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          textAlign: 'center',
                          fontSize: theme.typography.body2.fontSize,
                          fontWeight: theme.typography.body2.fontWeight,
                          cursor: clickable ? 'pointer' : 'default',
                          backgroundColor: bgColor,
                          '&:hover': {
                            backgroundColor: clickable
                              ? mode === 'add'
                                ? isSelected
                                  ? theme.palette.info.dark
                                  : baseColor === 'orange'
                                    ? theme.palette.warning.main
                                    : baseColor === 'green'
                                      ? theme.palette.success.main
                                      : theme.palette.action.hover
                                : // Delete mode hover
                                  entry &&
                                    selectedForDeletion.includes(entry.id)
                                  ? theme.palette.error.main
                                  : baseColor === 'orange'
                                    ? theme.palette.warning.main
                                    : baseColor === 'green'
                                      ? theme.palette.success.main
                                      : theme.palette.action.hover
                              : theme.palette.background.default,
                          },
                        }}
                      >
                        {hour}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};
