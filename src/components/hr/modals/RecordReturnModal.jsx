import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField
} from '@mui/material';

/**
 * A modal for recording the actual return date from a leave.
 * @param {object} props - The props object.
 * @param {boolean} props.isOpen - Controls the modal's open state.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onRecordReturn - Function to handle the return date submission.
 * @param {object} props.selectedApplication - The leave application object.
 * @param {string} props.actualReturnDate - The actual return date value.
 * @param {function} props.setActualReturnDate - Setter function for the actual return date state.
 */
export default function RecordReturnModal({
    isOpen,
    onClose,
    onRecordReturn,
    selectedApplication,
    actualReturnDate,
    setActualReturnDate,
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onRecordReturn(e);
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                Record Return Date
            </DialogTitle>
            <DialogContent dividers>
                <Typography sx={{ mb: 2 }}>
                    Approved Dates: <Typography component="span" sx={{ fontWeight: 'bold' }}>
                        {selectedApplication?.approvedStartDate} to {selectedApplication?.approvedEndDate}
                    </Typography>
                </Typography>
                <TextField
                    fullWidth
                    margin="dense"
                    name="actualReturnDate"
                    label="Actual Return Date"
                    type="date"
                    value={actualReturnDate?.slice(0, 10) || ''}
                    onChange={(e) => setActualReturnDate(e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" variant="outlined">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="success" variant="contained">
                    Record Return
                </Button>
            </DialogActions>
        </Dialog>
    );
}
