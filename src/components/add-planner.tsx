import React, { useState } from 'react';
import AppContainer from './app-container.tsx';
import { Box, TextField, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPlanner = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    description: '',
    officeNumber: '',
  });
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    axios
      .post('/api/auth/addPlanner', formData)
      .then(() => {
        alert('Planista został dodany!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          description: '',
          officeNumber: '',
        });
        navigate('/admin-panel'); // Przekierowanie po dodaniu
      })
      .catch(() => alert('Błąd podczas dodawania planisty'));
  };

  return (
    <AppContainer title="Dodaj Planistę">
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Imię"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
        />
        <TextField
          label="Nazwisko"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
        />
        <TextField
          label="Email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        <TextField
          label="Hasło"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
        />
        <TextField
          label="Opis"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        <TextField
          label="Numer Biura"
          value={formData.officeNumber}
          onChange={(e) => handleChange('officeNumber', e.target.value)}
        />
        <Box display="flex" gap={2}>
          <Button
            color="error"
            onClick={() => navigate('/admin-panel')}
          >
            Anuluj
          </Button>
          <Button color="primary" onClick={handleSubmit}>
            Dodaj
          </Button>
        </Box>
      </Box>
    </AppContainer>
  );
};

export default AddPlanner;
