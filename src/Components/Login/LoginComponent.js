import React, { useState } from 'react';
import { TextField, Button, Container, Grid, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function LoginComponent() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate input (you can add more validation logic)
    if (!formData.username.trim() || !formData.password.trim()) {
      setLoginError(true);
      return;
    }

    try {
      // Assuming you're using fetch or axios for making the API call
      const response = await fetch("http://localhost:8080/loginSubmit", {
        method: "POST",
        body: JSON.stringify(formData), // Your login request data
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setLoginError(true);
        throw new Error("Network response was not OK");
      }

      const data = await response.json(); // Parse the response body as JSON
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('id', data.id);
      sessionStorage.setItem('role', data.role);
      navigate('/home');
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error cases (e.g., invalid credentials)
    }
  };

  const handleGoToSignup = () => {
    navigate('/signup'); // Navigate to /signup route
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '2rem', margin: '2rem auto' }}>
        <form onSubmit={handleSubmit}>
          <h1>LOGIN</h1>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Log in
              </Button>
            </Grid>
            {loginError && (
              <Grid item xs={12}>
                <Typography variant="body2" color="error">
                  Incorrect username or password. Please try again.
                </Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button variant="outlined" color="primary" fullWidth onClick={handleGoToSignup}>
                Sign Up
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default LoginComponent;

