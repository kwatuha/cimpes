import React, { useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField
} from '@mui/material';

/**
 * A modal for approving a leave application, allowing the user to specify approved dates.
 * @param {object} props - The props object.
 * @param {boolean} props.isOpen - Controls the modal's open state.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onApprove - Function to handle the approval logic.
 * @param {object} props.selectedApplication - The leave application object.
 * @param {object} props.approvedDates - An object containing the approved start and end dates.
 * @param {function} props.setApprovedDates - Setter function for the approved dates state.
 */
export default function ApproveLeaveModal({
    isOpen,
    onClose,
    onApprove,
    selectedApplication,
    approvedDates,
    setApprovedDates,
}) {
    // Set default approved dates to the requested dates when the modal opens
    useEffect(() => {
        if (isOpen && selectedApplication) {
            setApprovedDates({
                startDate: selectedApplication.startDate,
                endDate: selectedApplication.endDate,
            });
        }
    }, [isOpen, selectedApplication, setApprovedDates]);

    const handleApprove = () => {
        onApprove('Approved');
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ backgroundColor: 'success.main', color: 'white' }}>
                Approve Leave Application
            </DialogTitle>
            <DialogContent dividers>
                <Typography sx={{ mb: 2 }}>
                    Requested Dates: <Typography component="span" sx={{ fontWeight: 'bold' }}>
                        {selectedApplication?.startDate} to {selectedApplication?.endDate}
                    </Typography>
                </Typography>
                <TextField
                    fullWidth
                    margin="dense"
                    name="approvedStartDate"
                    label="Approved Start Date"
                    type="date"
                    value={approvedDates.startDate?.slice(0, 10) || ''}
                    onChange={(e) => setApprovedDates({ ...approvedDates, startDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    name="approvedEndDate"
                    label="Approved End Date"
                    type="date"
                    value={approvedDates.endDate?.slice(0, 10) || ''}
                    onChange={(e) => setApprovedDates({ ...approvedDates, endDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" variant="outlined">
                    Cancel
                </Button>
                <Button onClick={handleApprove} color="success" variant="contained">
                    Approve
                </Button>
            </DialogActions>
        </Dialog>
    );
}
