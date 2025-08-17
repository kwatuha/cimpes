import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';


export default function AttendanceSection({ employees, attendanceRecords, handleAttendance, showNotification }) {
  const { hasPrivilege } = useAuth();
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const getAttendanceButtonState = () => {
    if (!selectedStaffId) {
      return 'Check In/Out';
    }
    const todayRecords = attendanceRecords.filter(rec => String(rec.staffId) === String(selectedStaffId));
    const latestRecord = todayRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    return latestRecord && !latestRecord.checkOutTime ? 'Check Out' : 'Check In';
  };

  const handleAttendanceClick = () => {
    if (!selectedStaffId) {
      showNotification('Please select an employee first.', 'warning');
      return;
    }
    handleAttendance(selectedStaffId);
  };

  return (
    <Box>
      {hasPrivilege('attendance.create') && (
        <>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>Attendance Management</Typography>
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Select Employee</InputLabel>
                <Select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} label="Select Employee">
                  <MenuItem value=""><em>Select an employee...</em></MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                onClick={handleAttendanceClick}
                variant="contained"
                sx={{ minWidth: '150px' }}
                disabled={!selectedStaffId}
              >
                {getAttendanceButtonState()}
              </Button>
            </Stack>
          </Paper>
        </>
      )}

      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>Today's Attendance</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table aria-label="attendance table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-In Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-Out Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hasPrivilege('attendance.read_all') && attendanceRecords.length > 0 ? (
              attendanceRecords.map((record) => (
                <TableRow key={record.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{employees.find(e => String(e.staffId) === String(record.staffId))?.firstName || 'N/A'} {employees.find(e => String(e.staffId) === String(record.staffId))?.lastName || 'N/A'}</TableCell>
                  <TableCell>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A'}</TableCell>
                  <TableCell>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow><TableCell colSpan={3} align="center">No attendance records found for today.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
