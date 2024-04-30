import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, ThemeProvider, createTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff', // Customize your primary color
    },
  },
});

function NavbarComponent() {
  const navigate = useNavigate(); // Initialize useNavigate within the component

  const handleSignout = () => {
    // Correct the logic for setting the session variable
    sessionStorage.setItem('isAuthenticated', 'false');
    sessionStorage.setItem('role', 'undefined');
    sessionStorage.setItem('id', 'undefined');
    navigate('/'); // Redirect to the specified route
  };

  const shouldShowMemberOptions = sessionStorage.getItem('isAuthenticated') === 'true';
  const isAdmin = sessionStorage.getItem('role') === 'admin'; // Check if user is an admin

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GROUP_O CMA
          </Typography>
          {shouldShowMemberOptions && (
            <Button>
              <Link to="/home" style={{ textDecoration: 'none', color: 'white', marginLeft: theme.spacing(2) }}>
                Home
              </Link>
            </Button>
          )}
          {shouldShowMemberOptions && (
            <Button onClick={handleSignout} color="inherit" component={Link} to="/">
              Sign Out
            </Button>
          )}
          {shouldShowMemberOptions && isAdmin && ( // Display the link only if user is an admin
            <Button>
              <Link to="/approve-new-staff" style={{ textDecoration: 'none', color: 'white', marginLeft: theme.spacing(2) }}>
                Approve New Staff
              </Link>
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default NavbarComponent;
