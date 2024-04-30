import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Button, TextField } from '@mui/material';
import axios from 'axios';

function EmployeeProfileLink() {
    const { id: profileId } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState({});
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Retrieve user information from session storage
        const id = sessionStorage.getItem('id');
        const role = sessionStorage.getItem('role');
        setLoggedInUser({ id, role });

        axios.get(`http://localhost:8080/employee_info?id=${profileId}`)
            .then(response => {
                setEmployee(response.data);
                setEditedEmployee({ ...response.data });
            })
            .catch(error => {
                setError('Error fetching employee data');
                console.error('Error:', error);
            });
    }, [profileId]);

    const toggleEditMode = () => {
        if (editMode) {
            setEditedEmployee({ ...employee });
        }
        setEditMode(!editMode);
    };

    const handleSave = () => {
        // Exclude the 'id' field from the request body
        const { id, ...updates } = editedEmployee;

        axios.put(`http://localhost:8080/employee_info?id=${id}`, updates)
            .then(() => {
                setEmployee(editedEmployee);
                setEditMode(false);
            })
            .catch(error => {
                setError('Error saving employee data');
                console.error('Error:', error);
            });
    };

    const handleViewPayroll = () => {
        navigate(`/profile/${profileId}/payroll`);
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!employee) {
        return <div>Loading...</div>;
    }

    // Check if the logged-in user is viewing their own profile or is an admin
    const isAdmin = loggedInUser.role === 'admin';
    const isOwnProfile = parseInt(loggedInUser.id) === parseInt(profileId);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, m: 4 }}>
            <Card variant="outlined" sx={{ width: '80%', p: 2, mt: 2 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {`${employee.firstName.toUpperCase()} ${employee.lastName.toUpperCase()}`} <Typography variant="body2" sx={{ color: 'text.secondary' }}>{employee.emp_role.toUpperCase()} - {employee.employee_type.toUpperCase()}</Typography>
                    </Typography>
                    {((isAdmin || isOwnProfile) && !editMode) && (
                        <>
                            {!editMode && (
                                <Button variant="contained" onClick={toggleEditMode} sx={{ mr: 2 }}>
                                    Edit Profile Information
                                </Button>
                            )}
                            <Button variant="contained" onClick={handleViewPayroll}>
                                View Payroll
                            </Button>
                        </>
                    )}
                    {editMode && (
                        <>
                            <Button variant="contained" onClick={handleSave} sx={{ mr: 2 }}>Save</Button>
                            <Button variant="contained" onClick={toggleEditMode}>Discard</Button>
                        </>
                    )}
                    <TableContainer>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>{employee.id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>First Name</TableCell>
                                    <TableCell>{editMode ? <TextField value={editedEmployee.firstName} onChange={(e) => setEditedEmployee({ ...editedEmployee, firstName: e.target.value })} /> : employee.firstName}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Last Name</TableCell>
                                    <TableCell>{editMode ? <TextField value={editedEmployee.lastName} onChange={(e) => setEditedEmployee({ ...editedEmployee, lastName: e.target.value })} /> : employee.lastName}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Middle Name</TableCell>
                                    <TableCell>{editMode ? <TextField value={editedEmployee.middleName} onChange={(e) => setEditedEmployee({ ...editedEmployee, middleName: e.target.value })} /> : employee.middleName}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Street</TableCell>
                                    <TableCell>{editMode ? <TextField value={editedEmployee.street} onChange={(e) => setEditedEmployee({ ...editedEmployee, street: e.target.value })} /> : employee.street}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>City</TableCell>
                                    <TableCell>{editMode ? <TextField value={editedEmployee.city} onChange={(e) => setEditedEmployee({ ...editedEmployee, city: e.target.value })} /> : employee.city}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Province</TableCell>
                                    <TableCell>{editMode ? <TextField value={editedEmployee.province} onChange={(e) => setEditedEmployee({ ...editedEmployee, province: e.target.value })} /> : employee.province}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Postal Code</TableCell>
                                    <TableCell>{editMode ? <TextField value={editedEmployee.postalCode} onChange={(e) => setEditedEmployee({ ...editedEmployee, postalCode: e.target.value })} /> : employee.postalCode}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Phone Number</TableCell>
                                    <TableCell>{editMode ? <TextField value={editedEmployee.phoneNumber} onChange={(e) => setEditedEmployee({ ...editedEmployee, phoneNumber: e.target.value })} /> : employee.phoneNumber}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}

export default EmployeeProfileLink;
