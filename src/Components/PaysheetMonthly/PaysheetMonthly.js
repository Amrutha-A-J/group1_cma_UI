import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, TextField } from '@mui/material';
import LoginComponent from '../Login/LoginComponent';
import axios from 'axios';
import { DateTime } from 'luxon';

function PaySheetMonthly({ employee_id, period, salary = 2000 }) {
    const [payrollData, setPayrollData] = useState({
        isAuthenticated: false,
        monthStartDate: '',
        status: '',
        no_leaves: 0,
        payable_salary: 0,
    });
    const [editMode, setEditMode] = useState(false);
    const [editedno_leaves, setEditedno_leaves] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const auth = sessionStorage.getItem('isAuthenticated') === 'true';
            const admin = sessionStorage.getItem('role') === 'admin';
            setIsAdmin(admin);
            setPayrollData(prevState => ({ ...prevState, isAuthenticated: auth }));

            const monthStartDate = getMonthStartDate(period);
            setPayrollData(prevState => ({ ...prevState, monthStartDate }));

            try {
                const response = await axios.get(`http://localhost:8080/payroll-monthly-log?employee_id=${employee_id}&monthStartDate=${monthStartDate}`);
                if (response.data.length > 0) {
                    const { status, no_leaves, payable_salary } = response.data[0];
                    setPayrollData(prevState => ({
                        ...prevState,
                        status,
                        no_leaves: no_leaves,
                        payable_salary: payable_salary
                    }));
                    setEditedno_leaves(no_leaves); // Set editedno_leaves to the fetched value
                } else {
                    // If no data is fetched, set default values
                    setPayrollData(prevState => ({
                        ...prevState,
                        status: 'pending',
                        no_leaves: 0,
                        payable_salary: salary
                    }));
                }
            } catch (error) {
                console.error('Error fetching payroll data:', error);
            }
        };

        fetchData();
    }, [employee_id, period, salary]);

    const getMonthStartDate = (period) => {
        const currentDate = DateTime.now().setLocale('en-US').setZone('America/Regina');
        let monthStartDate;

        if (period === 'current_month') {
            monthStartDate = currentDate.startOf('month').toISODate();
        } else if (period === 'prev_month') {
            monthStartDate = currentDate.minus({ months: 1 }).startOf('month').toISODate();
        } else if (period === 'next_month') {
            monthStartDate = currentDate.plus({ months: 1 }).startOf('month').toISODate();
        }

        return monthStartDate;
    };

    const handleApprove = async () => {
        try {
            const response = await axios.post('http://localhost:8080/approve-payroll-monthly', {
                employee_id: parseInt(employee_id),
                monthStartDate: payrollData.monthStartDate.toString(),
            });
            
            // If approval is successful, update status in payrollData state
            if (response.status === 200) {
                setPayrollData(prevState => ({
                    ...prevState,
                    status: 'Approved'
                }));
            }
        } catch (error) {
            console.error('Error approving payroll:', error);
        }
    };
    

    const handleSave = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/payroll-monthly-log`, {
                employee_id,
                monthStartDate: payrollData.monthStartDate,
                no_leaves: editedno_leaves,
                salary: parseFloat(salary),
                status: 'pending',
                payable_salary: payrollData.payable_salary
            });
            setEditMode(false);
            setPayrollData(prevState => ({
                ...prevState,
                status: 'Approved'
            }));
        } catch (error) {
            console.error('Error saving payroll log:', error);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditedno_leaves(payrollData.no_leaves);
    };

    const handleno_leavesChange = (event) => {
        const value = parseInt(event.target.value);
        if (value >= 0) {
            setEditedno_leaves(value);
            const payable_salary = calculatepayable_salary(value, salary, payrollData.monthStartDate);
            setPayrollData(prevState => ({ ...prevState, no_leaves: value, payable_salary }));
        }
    };

    const calculatepayable_salary = (no_leaves, salary, monthStartDate) => {
        const workingDaysInMonth = calculateWorkingDaysInMonth(monthStartDate);
        const dailyPayment = salary / workingDaysInMonth;
        const deduction = no_leaves * dailyPayment;
        const payable_salary = (salary - deduction).toFixed(2);
        return parseFloat(payable_salary);
    };

    const calculateWorkingDaysInMonth = (monthStartDate) => {
        const startDate = DateTime.fromISO(monthStartDate).startOf('month');
        const endDate = DateTime.fromISO(monthStartDate).endOf('month');
        let count = 0;
        let currentDate = startDate;
        while (currentDate <= endDate) {
            if (currentDate.weekday !== 6 && currentDate.weekday !== 7) {
                count++;
            }
            currentDate = currentDate.plus({ days: 1 });
        }
        return count;
    };

    return (
        <Container>
            {payrollData.isAuthenticated ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                    <Card variant="outlined" sx={{ width: '100%', p: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Button variant="contained" onClick={editMode ? handleSave : handleEdit}>
                                    {editMode ? 'Save' : 'Edit'}
                                </Button>
                                {!editMode && isAdmin && (
                                    <Button variant="contained" onClick={handleApprove}>Approve</Button>
                                )}
                            </Box>
                            <Typography variant="h5" gutterBottom>
                                Selected Month: {DateTime.fromISO(payrollData.monthStartDate).toLocaleString(DateTime.DATE_FULL)}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Status: <span style={{ color: payrollData.status === 'pending' ? 'red' : 'darkgreen' }}>{payrollData.status}</span>
                            </Typography>

                            <Typography variant="body1" gutterBottom>
                                Salary: ${salary}
                            </Typography>
                            {editMode ? (
                                <TextField
                                    label="Unpaid Leaves"
                                    type="number"
                                    value={editedno_leaves >= 0 ? editedno_leaves : 0}
                                    onChange={handleno_leavesChange}
                                    fullWidth
                                    inputProps={{ min: 0 }}
                                />

                            ) : (
                                <>
                                    <Typography variant="body1" gutterBottom>
                                        No of Unpaid Leaves: {payrollData.no_leaves}
                                    </Typography>
                                </>
                            )}
                            <Typography variant="body1" gutterBottom>
                                Net Payable Salary: ${payrollData.payable_salary}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            ) : (
                <LoginComponent />
            )}
        </Container>
    );
}

export default PaySheetMonthly;
