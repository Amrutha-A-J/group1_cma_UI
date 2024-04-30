import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import axios from 'axios';
import LoginComponent from '../Login/LoginComponent';

function NewStaffComponent() {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [employeeDetails, setEmployeeDetails] = useState({});

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/new-staff');
        setPendingUsers(response.data);
      } catch (error) {
        console.error('Error fetching pending users:', error);
      }
    };
    fetchPendingUsers();
  }, []);

  const handleTypeChange = (userId, type) => {
    setSelectedTypes((prevTypes) => ({ ...prevTypes, [userId]: type }));
  };

  const handleInputChange = (userId, field, value) => {
    setEmployeeDetails((prevDetails) => ({
      ...prevDetails,
      [userId]: { ...prevDetails[userId], [field]: value }
    }));
  };

  const handleSubmit = async (userId) => {
    const selectedType = selectedTypes[userId];
    const employeeDetail = employeeDetails[userId];
    if (!selectedType || !employeeDetail || !employeeDetail.emp_role || !employeeDetail.emp_base_pay) {
      setPendingUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.employee_id === userId) {
            return { ...user, showWarning: true };
          }
          return user;
        })
      );
      return;
    }
  
    try {
      await axios.post('http://localhost:8080/save-employee-details', {
        employee_id: userId,
        employee_type: selectedType,
        emp_role: employeeDetail.emp_role,
        emp_base_pay: employeeDetail.emp_base_pay
      });
      setPendingUsers((prevUsers) => prevUsers.filter((user) => user.employee_id !== userId));
    } catch (error) {
      console.error('Error saving employee details:', error);
    }
  };
  

  if (isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            Approve New Staff
          </Typography>
        </Box>
        {pendingUsers.length > 0 ? (
          pendingUsers.map((user) => (
            <Card key={user.employee_id} variant="outlined" sx={{ my: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  Employee ID: {user.employee_id}
                </Typography>
                <Typography>
                  Name: {user.firstName} {user.lastName}
                </Typography>
                <Typography>
                  Phone Number: {user.phoneNumber}
                </Typography>
                <TextField
                  fullWidth
                  label="Employee Role"
                  placeholder="Example: Chef, Waitress, etc."
                  value={employeeDetails[user.employee_id]?.emp_role || ''}
                  onChange={(e) => handleInputChange(user.employee_id, 'emp_role', e.target.value)}
                  sx={{ mt: 2 }}
                />
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedTypes[user.employee_id] || ''}
                    onChange={(e) => handleTypeChange(user.employee_id, e.target.value)}
                    sx={{ minWidth: '120px' }}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="salaried">Salaried</MenuItem>
                  </Select>
                </FormControl>
                {selectedTypes[user.employee_id] === 'hourly' && (
                  <TextField
                    fullWidth
                    type="number"
                    label="Hourly Wage"
                    value={employeeDetails[user.employee_id]?.emp_base_pay || ''}
                    onChange={(e) => handleInputChange(user.employee_id, 'emp_base_pay', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
                {selectedTypes[user.employee_id] === 'salaried' && (
                  <TextField
                    fullWidth
                    type="number"
                    label="Monthly Salary"
                    value={employeeDetails[user.employee_id]?.emp_base_pay || ''}
                    onChange={(e) => handleInputChange(user.employee_id, 'emp_base_pay', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
                {user.showWarning && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    Please select an employee type, provide employee role, and base pay.
                  </Typography>
                )}
                <Button variant="contained" color="primary" onClick={() => handleSubmit(user.employee_id)} sx={{ mt: 2 }}>
                  Submit
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              All users approved!
            </Typography>
            <Button variant="contained" color="primary" href="/home">
              Home
            </Button>
          </Box>
        )}
      </Container>
    );
  } else {
    return <LoginComponent />;
  }
}

export default NewStaffComponent;
