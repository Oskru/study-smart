import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import AppContainer from './app-container';
import { Fireworks } from '@fireworks-js/react';

export const About: React.FC = () => {
  return (
    <AppContainer title='About the Smart Study'>
      <Box>
        <Typography variant='h5' gutterBottom>
          What is Smart Study?
        </Typography>
        <Typography variant='body1' paragraph>
          Smart Study is a modern solution designed to simplify the process of
          creating study plans that work for everyone involved. Whether you're a
          student, a lecturer, or a planner, Smart Study provides tools to
          accommodate your preferences, availability, and needs.
        </Typography>

        <Typography variant='h6' gutterBottom>
          Key Features
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary='Student Preferences'
              secondary='Students can send their course and schedule preferences to ensure the plan suits their learning needs.'
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary='Planner Availabilities'
              secondary='Planners can set available times and resources to create efficient and balanced schedules.'
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary='Lecturer Insights'
              secondary='Lecturers can see voting data for different days and courses to better align their teaching plans.'
            />
          </ListItem>
        </List>

        <Typography variant='h6' gutterBottom>
          Why Smart Study?
        </Typography>
        <Typography variant='body1' paragraph>
          By using Smart Study, educational institutions can create study plans
          that:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary='Enhance Collaboration'
              secondary='Encourage input from all stakeholders to build a schedule that works for everyone.'
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary='Save Time'
              secondary='Automate complex scheduling tasks and reduce manual effort.'
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary='Promote Fairness'
              secondary='Address the preferences of students and lecturers to create balanced schedules.'
            />
          </ListItem>
        </List>

        <Typography variant='body1' paragraph>
          Smart Study brings modern tools to educational planning, making the
          process efficient, inclusive, and transparent.
        </Typography>
      </Box>
      <Fireworks
        options={{
          hue: {
            min: 0,
            max: 0,
          },
        }}
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
        }}
      />
    </AppContainer>
  );
};
