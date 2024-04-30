import React, { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Box, Card, CardContent, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TextField, MenuItem, Button } from '@mui/material';
import axios from 'axios';
import { DateTime } from 'luxon';
import LoginComponent from '../Login/LoginComponent';

const formatTime12hr = (time) => {
    const [hour, minute] = time.split(':');
    const dt = DateTime.fromObject({ hour: parseInt(hour), minute: parseInt(minute) });
    return dt.toLocaleString(DateTime.TIME_SIMPLE);
};

function PaySheetHourly({ employee_id, period, hourly_wage = 14.0 }) {
    const [editMode, setEditMode] = useState(false);
    const [payrollData, setPayrollData] = useState({
        isAuthenticated: false,
        startDate: '',
        endDate: '',
        startDay: '',
        endDay: '',
        payrollLogs: [],
        totalHours: 0,
        status: '',
    });
    const [updatedLogs, setUpdatedLogs] = useState([]);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const auth = sessionStorage.getItem('isAuthenticated') === 'true';
        setPayrollData(prevState => ({ ...prevState, isAuthenticated: auth }));
        setUserRole(sessionStorage.getItem('role'));
    }, []);

    useEffect(() => {
        const { startDate, endDate, startDay, endDay } = getStartAndEndDates(period);
        setPayrollData(prevState => ({ ...prevState, startDate, endDate, startDay, endDay }));
        fetchPayrollLogs(startDate, endDate);
    }, [period]);

    const getStartAndEndDates = (period) => {
        const currentDate = DateTime.now().setLocale('en-US').setZone('America/Regina');
        let startDate, endDate;

        if (period === 'current_week') {
            startDate = currentDate.startOf('week');
            endDate = startDate.endOf('week');
        } else if (period === 'prev_week') {
            startDate = currentDate.startOf('week').minus({ weeks: 1 });
            endDate = startDate.endOf('week');
        } else if (period === 'next_week') {
            startDate = currentDate.startOf('week').plus({ weeks: 1 });
            endDate = startDate.endOf('week');
        }

        const startDateString = startDate.toISODate();
        const endDateString = endDate.toISODate();

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const startDay = days[startDate.weekday - 1];
        const endDay = days[endDate.weekday - 1];

        return { startDate: startDateString, endDate: endDateString, startDay, endDay };
    };

    const fetchPayrollLogs = async (start, end) => {
        try {
            const response = await axios.get(`http://localhost:8080/payroll-hourly-log?employee_id=${employee_id}&startDate=${start}&endDate=${end}`);
            const { data } = response;
    
            if (data.length > 0) {
                const totalHoursWeek = data.reduce((total, log) => total + log.totalHours, 0);
                let status = data[0].status; // Initialize status with the status of the first log
    
                // Check if all logs have status "Approved"
                const allApproved = data.every(log => log.status === "Approved");
                if (allApproved) {
                    status = "Approved";
                }
    
                setPayrollData(prevState => ({ ...prevState, payrollLogs: data, totalHours: totalHoursWeek, status }));
            } else {
                console.error('Error: No data found in response');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    const handleTimeChange = (index, type, value) => {
        const logsCopy = [...payrollData.payrollLogs];
        const logToUpdate = logsCopy.find(log => log.date === generateDaysOfWeek[index].date);

        if (logToUpdate) {
            logToUpdate[type] = value;
            if (logToUpdate.start_time && logToUpdate.end_time) {
                const [startHour, startMinute] = logToUpdate.start_time.split(':').map(Number);
                const [endHour, endMinute] = logToUpdate.end_time.split(':').map(Number);
                const totalHours = (endHour - startHour) + (endMinute - startMinute) / 60;
                logToUpdate.totalHours = totalHours.toFixed(2);
            } else {
                logToUpdate.totalHours = 0;
            }
        } else {
            const currentDate = generateDaysOfWeek[index].date;
            const defaultLog = {
                date: currentDate,
                start_time: '',
                end_time: '',
                totalHours: 0
            };
            defaultLog[type] = value;
            logsCopy.push(defaultLog);
        }

        setPayrollData(prevState => ({ ...prevState, payrollLogs: logsCopy }));

        const updatedLogIndex = updatedLogs.findIndex(log => log.index === index && log.date === generateDaysOfWeek[index].date);
        if (updatedLogIndex !== -1) {
            const updatedLog = { ...updatedLogs[updatedLogIndex], [type]: value };
            updatedLog.totalHours = logToUpdate.totalHours;
            const updatedLogsCopy = [...updatedLogs];
            updatedLogsCopy[updatedLogIndex] = updatedLog;
            setUpdatedLogs(updatedLogsCopy);
        } else {
            const updatedLog = {
                index,
                date: generateDaysOfWeek[index].date,
                [type]: value,
                totalHours: logToUpdate ? logToUpdate.totalHours : 0
            };
            setUpdatedLogs(prevLogs => [...prevLogs, updatedLog]);
        }
    };

    const toggleEditMode = () => {
        if (period === 'prev_week') { return false } else { setEditMode(prevMode => !prevMode); }
    };

    const handleSave = async () => {
        try {
            for (const log of updatedLogs) {
                const { date, start_time, end_time, totalHours } = log;
                const logToUpdate = payrollData.payrollLogs.find(log => log.date === date);
                const response = await axios.post('http://localhost:8080/payroll-hourly-log-upsert', {
                    employee_id: parseInt(employee_id),
                    date,
                    start_time: start_time || logToUpdate.start_time,
                    end_time: end_time || logToUpdate.end_time,
                    totalHours: parseFloat(totalHours),
                    hourly_wage: hourly_wage,
                    dailyEarning: (parseFloat(totalHours) * hourly_wage).toFixed(2),
                    status: 'pending',
                });
                if (response.status === 200) {
                    console.log('Data upserted successfully');
                } else {
                    console.error('Failed to upsert data');
                }
            }
            setUpdatedLogs([]);
            setEditMode(false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleApprove = async () => {
        try {
            const pyld = {
                employee_id: parseInt(employee_id),
                startDate: payrollData.startDate,
                endDate: payrollData.endDate
            };
            const response = await axios.post('http://localhost:8080/approve-payroll-hourly', pyld);
    
            if (response.status === 200) {
                console.log('Payroll logs approved successfully');
                setPayrollData(prevState => ({
                    ...prevState,
                    status: 'Approved' // Update the status to Approved
                }));
            } else {
                console.error('Failed to approve payroll logs');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    




    const generateDaysOfWeek = useMemo(() => {
        const { startDate, endDate } = payrollData;
        const startDateObj = DateTime.fromISO(startDate).setLocale('en-US').setZone('America/Regina').startOf('day');
        const endDateObj = DateTime.fromISO(endDate).setLocale('en-US').setZone('America/Regina').startOf('day');

        const daysOfWeek = [];

        let currentDate = startDateObj;

        while (currentDate <= endDateObj) {
            daysOfWeek.push({
                dayOfWeek: currentDate.toFormat('EEEE'),
                date: currentDate.toISODate()
            });
            currentDate = currentDate.plus({ days: 1 });
        }

        return daysOfWeek;
    }, [payrollData.startDate, payrollData.endDate]);

    const totalPay = (payrollData.totalHours * hourly_wage).toFixed(2);

    return (
        <Container>
            {payrollData.isAuthenticated ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                    <Card variant="outlined" sx={{ width: '100%', p: 2 }}>
                        <CardContent>
                            <Typography variant="body1" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
                                <span style={{ fontSize: '13px', color: payrollData.status === 'pending' ? 'red' : 'black', marginRight: '10px' }}>
                                    <strong style={{ fontSize: '13px', color: 'black' }}>Status: </strong>
                                    <br />
                                    {payrollData.status === 'pending' ? 'Pending Admin Approval' : payrollData.status}
                                </span>
                                <span style={{ fontSize: '13px', marginRight: 'auto' }}>
                                    <strong>Start Date:</strong>
                                    <br />
                                    {payrollData.startDate} ({payrollData.startDay}) &nbsp;
                                </span>
                                <span style={{ fontSize: '13px', marginRight: 'auto' }}>
                                    <strong>End Date:</strong>
                                    <br />
                                    {payrollData.endDate} ({payrollData.endDay})
                                </span>
                                <span style={{ fontSize: '13px', marginRight: 'auto' }}>
                                    <strong>Hourly Wage:</strong>
                                    <br />
                                    {hourly_wage}
                                </span>
                                <span style={{ fontSize: '13px', marginRight: 'auto' }}>
                                    <strong>Total Hours: </strong>
                                    <br />
                                    {payrollData.totalHours}
                                </span>
                                <span style={{ fontSize: '13px', marginRight: 'auto' }}>
                                    <strong>Total Pay:
                                        <span style={{ fontSize: '18px', border: '1px solid #ccc', color: 'darkgreen', padding: '5px' }}>${totalPay}
                                        </span>
                                    </strong>
                                </span>
                            </Typography>

                            <TableContainer>
                                <Box sx={{ mb: 2 }}>
                                    {editMode ? (
                                        <Button
                                            onClick={handleSave}
                                            sx={{
                                                bgcolor: '#28a745',
                                                color: '#fff',
                                                borderRadius: '5px',
                                                padding: '10px 20px',
                                                '&:hover': {
                                                    bgcolor: '#218838',
                                                },
                                            }}
                                        >
                                            Save
                                        </Button>
                                    ) : period !== 'prev_week' && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Button
                                                onClick={toggleEditMode}
                                                sx={{
                                                    bgcolor: '#007bff',
                                                    color: '#fff',
                                                    borderRadius: '5px',
                                                    padding: '10px 20px',
                                                    '&:hover': {
                                                        bgcolor: '#0056b3',
                                                    },
                                                }}
                                            >
                                                Edit Timesheet
                                            </Button>
                                            {userRole === 'admin' && (
                                                <Button
                                                    onClick={handleApprove}
                                                    sx={{
                                                        bgcolor: '#28a745',
                                                        color: '#fff',
                                                        borderRadius: '5px',
                                                        padding: '10px 20px',
                                                        marginLeft: '10px',
                                                        '&:hover': {
                                                            bgcolor: '#218838',
                                                        },
                                                    }}
                                                >
                                                    Approve Timesheet
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Day</TableCell>
                                            <TableCell>Start Time</TableCell>
                                            <TableCell>End Time</TableCell>
                                            <TableCell>Total Hours</TableCell>
                                            <TableCell>Daily Earning</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {generateDaysOfWeek.map((day, index) => {
                                            const log = payrollData.payrollLogs.find(log => log.date === day.date);
                                            const startTimeOptions = Array.from({ length: 48 }, (_, i) => {
                                                const hour = Math.floor(i / 2);
                                                const minute = (i % 2) * 30;
                                                const time = `${hour}:${minute === 0 ? '00' : minute}`;
                                                return { value: time, label: formatTime12hr(time) };
                                            });

                                            const endTimeOptions = Array.from({ length: 48 }, (_, i) => {
                                                const hour = Math.floor(i / 2);
                                                const minute = (i % 2) * 30;
                                                const time = `${hour}:${minute === 0 ? '00' : minute}`;
                                                return { value: time, label: formatTime12hr(time) };
                                            }).filter(option => {
                                                if (!log || !log.start_time) return false;
                                                const [startHour, startMinute] = log.start_time.split(':').map(Number);
                                                const [endHour] = option.value.split(':').map(Number);
                                                if (startHour < 12 || (startHour === 12 && startMinute === 0)) {
                                                    return endHour > startHour || (endHour === 12 && startMinute === 30);
                                                } else {
                                                    if (startMinute === 0 && endHour === 12) {
                                                        return false;
                                                    } else {
                                                        return endHour > startHour || (endHour === 12 && startMinute === 30);
                                                    }
                                                }
                                            });

                                            return (
                                                <TableRow key={day.date}>
                                                    <TableCell>{day.dayOfWeek} ({day.date})</TableCell>
                                                    <TableCell>
                                                        {editMode ? (
                                                            <TextField
                                                                select
                                                                value={log ? log.start_time : ''}
                                                                onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                                                            >
                                                                <MenuItem value="">-</MenuItem>
                                                                {startTimeOptions.map(option => (
                                                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                                                ))}
                                                            </TextField>
                                                        ) : (
                                                            <span>{log ? (log.start_time === '' ? '-' : formatTime12hr(log.start_time)) : '-'}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {editMode ? (
                                                            <TextField
                                                                select
                                                                value={log ? log.end_time : ''}
                                                                onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                                                                disabled={!log || !log.start_time}
                                                            >
                                                                <MenuItem value="">-</MenuItem>
                                                                {endTimeOptions.map(option => (
                                                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                                                ))}
                                                            </TextField>
                                                        ) : (
                                                            <span>{log ? (log.end_time === '' ? '-' : formatTime12hr(log.end_time)) : '-'}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{log ? (log.totalHours === 0 ? '-' : log.totalHours) : '-'}</TableCell>
                                                    <TableCell>{log ? (log.totalHours !== 0 ? ('$' + (log.totalHours * hourly_wage).toFixed(2)) : '-') : '-'}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Box>
            ) : (
                <LoginComponent />
            )}
        </Container>
    );
}

export default PaySheetHourly;
