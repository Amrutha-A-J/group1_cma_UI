import React, { useState } from 'react';
import { TextField, Button, Container, Grid, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function SignUpComponent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');

  const navigate = useNavigate(); // Initialize useNavigate
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate input
    if (!username.trim() || !password.trim() || password !== confirmPassword) {
      setSignUpError('Please fill in all fields and ensure passwords match.');
      return;
    }

    try {
      // Make an API call to your backend
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          middleName,
          street,
          city,
          province,
          postalCode,
          phoneNumber,
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json(); // Parse the response body as JSON
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('id', data.userId);
        sessionStorage.setItem('role', 'user');

        // Set authentication status in session storage
        navigate('/home');
      } else {
        setSignUpError('Error signing up. Please try again.');
      }
    } catch (error) {
      console.error('Error while making API call:', error);
      setSignUpError('Error signing up. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '2rem', margin: '2rem auto' }}>
        <h1>SIGN UP</h1>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Middle Name (optional)"
                variant="outlined"
                fullWidth
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Street Address"
                variant="outlined"
                fullWidth
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                variant="outlined"
                fullWidth
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Province"
                variant="outlined"
                fullWidth
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                variant="outlined"
                fullWidth
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm Password"
                variant="outlined"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Sign Up
              </Button>
            </Grid>
            {signUpError && (
              <Grid item xs={12}>
                <Typography variant="body2" color="error">
                  Passwords do not match. Please try again.
                </Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default SignUpComponent;