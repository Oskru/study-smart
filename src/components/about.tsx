import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import AppContainer from './app-container';
import { Fireworks } from '@fireworks-js/react';

export const About: React.FC = () => {
  return (
    <AppContainer title='O Smart Study'>
      <Box>
        <Typography variant='h5' gutterBottom>
          Czym jest Smart Study?
        </Typography>
        <Typography variant='body1' paragraph>
          Smart Study to nowoczesne rozwiązanie zaprojektowane, aby uprościć
          proces tworzenia planów zajęć, które odpowiadają potrzebom wszystkich
          zaangażowanych. Niezależnie od tego, czy jesteś studentem, wykładowcą
          czy organizatorem, Smart Study oferuje narzędzia dostosowane do Twoich
          preferencji, dostępności i potrzeb.
        </Typography>

        <Typography variant='h6' gutterBottom>
          Kluczowe funkcje
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary='Preferencje studentów'
              secondary='Studenci mogą przesyłać swoje preferencje dotyczące kursów i harmonogramów, aby plan odpowiadał ich potrzebom edukacyjnym.'
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary='Dostępność organizatorów'
              secondary='Organizatorzy mogą określać dostępne terminy i zasoby, aby tworzyć efektywne i zrównoważone harmonogramy.'
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary='Wskazówki dla wykładowców'
              secondary='Wykładowcy mogą przeglądać dane głosowania dotyczące różnych dni i kursów, aby lepiej dostosować swoje plany nauczania.'
            />
          </ListItem>
        </List>

        <Typography variant='h6' gutterBottom>
          Dlaczego Smart Study?
        </Typography>
        <Typography variant='body1' paragraph>
          Korzystając z Smart Study, instytucje edukacyjne mogą tworzyć plany
          zajęć, które:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary='Wspierają współpracę'
              secondary='Zachęcają do udziału wszystkich zainteresowanych stron w tworzeniu harmonogramu, który odpowiada wszystkim.'
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary='Oszczędzają czas'
              secondary='Automatyzują skomplikowane zadania związane z tworzeniem harmonogramów i zmniejszają nakład pracy ręcznej.'
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary='Promują sprawiedliwość'
              secondary='Uwzględniają preferencje studentów i wykładowców, aby tworzyć zrównoważone harmonogramy.'
            />
          </ListItem>
        </List>

        <Typography variant='body1' paragraph>
          Smart Study wprowadza nowoczesne narzędzia do planowania edukacyjnego,
          czyniąc ten proces efektywnym, inkluzywnym i przejrzystym.
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
