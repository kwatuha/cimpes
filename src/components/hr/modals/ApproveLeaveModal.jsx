import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, Typography, Alert, AlertTitle
} from '@mui/material';

export default function ApproveLeaveModal({
    isOpen,
    onClose,
    selectedApplication,
    approvedDates,
    setApprovedDates,
    onApprove,
    leaveBalances
}) {
    const [currentBalanceInfo, setCurrentBalanceInfo] = useState(null);

    useEffect(() => {
        if (selectedApplication && Array.isArray(leaveBalances)) {
            const balance = leaveBalances.find(b => String(b.leaveTypeId) === String(selectedApplication.leaveTypeId));
            setCurrentBalanceInfo(balance);
        } else {
            setCurrentBalanceInfo(null);
        }
    }, [selectedApplication, leaveBalances]);

    if (!selectedApplication) return null;

    // ADDED: Logic to calculate days requested if it's missing from the data
    let daysRequested = selectedApplication.numberOfDays;
    if (!daysRequested || daysRequested <= 0) {
        const start = new Date(selectedApplication.startDate);
        const end = new Date(selectedApplication.endDate);
        if (end >= start) {
            const diffTime = Math.abs(end - start);
            daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
    }

    const projectedBalance = currentBalanceInfo ? currentBalanceInfo.balance - daysRequested : 'N/A';

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setApprovedDates(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                Review Leave Application
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    {selectedApplication.firstName} {selectedApplication.lastName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Leave Type:</strong> {selectedApplication.leaveTypeName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Requested Dates:</strong> {selectedApplication.startDate.slice(0, 10)} to {selectedApplication.endDate.slice(0, 10)}
                </Typography>
                 <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Reason:</strong> {selectedApplication.reason}
                </Typography>

                {currentBalanceInfo && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <AlertTitle>Leave Balance Information</AlertTitle>
                        Current Balance: <strong>{currentBalanceInfo.balance}</strong> days
                        <br />
                        {/* CHANGED: Using the new 'daysRequested' variable */}
                        Days Requested: <strong>{daysRequested}</strong> days
                        <br />
                        Projected Balance After Approval: <strong>{projectedBalance}</strong> days
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            margin="dense"
                            name="startDate"
                            label="Approved Start Date"
                            type="date"
                            value={approvedDates.startDate.slice(0, 10)}
                            onChange={handleDateChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            margin="dense"
                            name="endDate"
                            label="Approved End Date"
                            type="date"
                            value={approvedDates.endDate.slice(0, 10)}
                            onChange={handleDateChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={() => onApprove('Rejected')} variant="outlined" color="error">
                    Reject
                </Button>
                <Button onClick={() => onApprove('Approved')} variant="contained" color="success">
                    Approve
                </Button>
            </DialogActions>
        </Dialog>
    );
}