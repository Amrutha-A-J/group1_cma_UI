import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Card, CardContent, Stack, Button, styled } from '@mui/material';
import LoginComponent from '../Login/LoginComponent';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Styled component for the card with hover effect
const ClickableCard = styled(Card)({
  cursor: 'pointer',
  transition: 'transform 0.2s',
});

const HoverEffectCard = styled(ClickableCard)({
  '&:hover': {
    transform: 'scale(1.03)',
  },
});

function HomeComponent() {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const [searchParams, setSearchParams] = useState({ id: '', firstName: '', lastName: '', phone: '' });
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchChange = (event) => {
    setSearchParams({ ...searchParams, [event.target.name]: event.target.value });
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    // Filter out parameters that don't have values
    const filteredSearchParams = Object.fromEntries(
      Object.entries(searchParams).filter(([key, value]) => value)
    );

    const response = await axios.post('http://localhost:8080/search', filteredSearchParams);
    setSearchResults(response.data.slice(0, 6)); // Limit to top 5 results
  };

  const navigate = useNavigate();

  const handleCardClick = (id, status) => {
    if (status === 'Approved') {
      navigate(`/profile/${id}`);
    }
  };

  if (isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            Employee Search
          </Typography>
          <form onSubmit={handleSearchSubmit}>
            <Stack spacing={2}>
              <TextField name="id" label="Employee ID" value={searchParams.id} onChange={handleSearchChange} variant="outlined" />
              <TextField name="firstName" label="First Name" value={searchParams.firstName} onChange={handleSearchChange} variant="outlined" />
              <TextField name="lastName" label="Last Name" value={searchParams.lastName} onChange={handleSearchChange} variant="outlined" />
              <TextField name="phone" label="Phone Number" value={searchParams.phone} onChange={handleSearchChange} variant="outlined" />
              <Button type="submit" variant="contained" color="primary">Search</Button>
            </Stack>
          </form>
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
            {searchResults.length > 0 ? searchResults.map((employee) => (
              <Box sx={{ width: 'auto', flex: '1 1 auto' }} key={employee.id}>
                {employee.status === 'Approved' ? (
                  <HoverEffectCard variant="outlined" onClick={() => handleCardClick(employee.id, employee.status)}>
                    <CardContent>
                      <Typography variant="h6">
                        ID: {employee.id}
                      </Typography>
                      <Typography variant="body1">
                        Name: {employee.firstName} {employee.lastName}
                      </Typography>
                      <Typography variant="body2">
                        Phone: {employee.phoneNumber}
                      </Typography>
                      <Typography variant="body2">
                        Position: {employee.role}
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'green' }}>
                        {employee.status.toUpperCase()}
                      </Typography>
                    </CardContent>
                  </HoverEffectCard>
                ) : (
                  <ClickableCard variant="outlined" onClick={() => handleCardClick(employee.id, employee.status)}>
                    <CardContent>
                      <Typography variant="h6">
                        ID: {employee.id}
                      </Typography>
                      <Typography variant="body1">
                        Name: {employee.firstName} {employee.lastName}
                      </Typography>
                      <Typography variant="body2">
                        Phone: {employee.phoneNumber}
                      </Typography>
                      <Typography variant="body2">
                        Position: {employee.role}
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'red' }}>
                        {employee.status.toUpperCase()}
                      </Typography>
                    </CardContent>
                  </ClickableCard>
                )}
              </Box>
            )) : <Typography variant="body1">No matching results found.</Typography>}
          </Box>
        </Box>
      </Container>
    );
  } else {
    return <LoginComponent/>
  }
}

export default HomeComponent;
