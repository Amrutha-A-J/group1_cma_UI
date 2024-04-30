import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, MenuItem } from '@mui/material';
import axios from 'axios';
import PaySheetHourly from '../PaysheetHourly/PaysheetHourly';
import PaySheetMonthly from '../PaysheetMonthly/PaysheetMonthly';

function PayrollComponent() {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [payrollPeriod, setPayrollPeriod] = useState('');

    useEffect(() => {
        fetchEmployeeInfo();
    }, []);

    useEffect(() => {
        if (employee) {
            // Set the initial payroll period based on employee type
            setPayrollPeriod('current_' + (employee.employee_type === "hourly" ? 'week' : 'month'));
        }
    }, [employee]);

    const fetchEmployeeInfo = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/employee_info?id=${id}`);
            setEmployee(response.data);
        } catch (error) {
            console.error('Error fetching employee:', error);
        }
    };

    const handlePayrollPeriodChange = (event) => {
        setPayrollPeriod(event.target.value);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, m: 4 }}>
            <Card variant="outlined" sx={{ width: '80%', p: 2, mt: 2 }}>
                <CardContent>
                    {employee && (
                        <>
                            <Typography variant="h5" gutterBottom>
                                {`${employee.firstName.toUpperCase()} ${employee.lastName.toUpperCase()}`} <Typography variant="body2" sx={{ color: 'text.secondary' }}>{employee.emp_role.toUpperCase()} - {employee.employee_type.toUpperCase()}</Typography>
                            </Typography>
                            {employee.employee_type === "hourly" ? (
                                <TextField
                                    select
                                    label="Payroll Period"
                                    value={payrollPeriod}
                                    onChange={handlePayrollPeriodChange}
                                    variant="outlined"
                                    fullWidth
                                >
                                    {["prev_week", "current_week", "next_week"].map(period => (
                                        <MenuItem key={period} value={period}>{period === "prev_week" ? "Previous Week" : period === "current_week" ? "Current Week" : "Next Week"}</MenuItem>
                                    ))}
                                </TextField>
                            ) : (
                                <TextField
                                    select
                                    label="Salary Period"
                                    value={payrollPeriod}
                                    onChange={handlePayrollPeriodChange}
                                    variant="outlined"
                                    fullWidth
                                >
                                    {["prev_month", "current_month", "next_month"].map(period => (
                                        <MenuItem key={period} value={period}>{period === "prev_month" ? "Previous Month" : period === "current_month" ? "Current Month" : "Next Month"}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                            {employee && payrollPeriod && (
                                <>
                                    {employee.employee_type === "hourly" ? (
                                        <PaySheetHourly employee_id={employee.id} period={payrollPeriod} hourly_wage={employee.emp_base_pay} /> // Changed from emp_base_Pay to emp_base_pay
                                    ) : (
                                        <PaySheetMonthly employee_id={employee.id} period={payrollPeriod} salary={employee.emp_base_pay} /> // Changed from emp_base_Pay to emp_base_pay
                                    )}
                                </>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

export default PayrollComponent;
