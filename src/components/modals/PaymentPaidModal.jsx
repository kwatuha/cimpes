import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Alert, Snackbar
} from '@mui/material';
import PropTypes from 'prop-types';

const PaymentPaidModal = ({ open, onClose, requestId, onPaid }) => {
    const [formData, setFormData] = useState({
        paymentMode: '',
        bankName: '',
        accountNumber: '',
        transactionId: '',
        notes: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (open) {
            setFormData({
                paymentMode: '',
                bankName: '',
                accountNumber: '',
                transactionId: '',
                notes: '',
            });
            setFormErrors({});
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.paymentMode) errors.paymentMode = 'Payment mode is required.';
        if (!formData.transactionId) errors.transactionId = 'Transaction ID is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            await onPaid(requestId, formData);
        } catch (error) {
            setSnackbar({ open: true, message: error.message || 'Failed to record payment.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Mark Request as Paid</DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>
                    Finalize payment details for Request ID: {requestId}.
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <FormControl fullWidth error={!!formErrors.paymentMode}>
                        <InputLabel>Payment Mode</InputLabel>
                        <Select
                            name="paymentMode"
                            value={formData.paymentMode}
                            onChange={handleChange}
                            label="Payment Mode"
                        >
                            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                            <MenuItem value="Cheque">Cheque</MenuItem>
                            <MenuItem value="Mobile Money">Mobile Money</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        {formErrors.paymentMode && <Typography color="error" variant="caption">{formErrors.paymentMode}</Typography>}
                    </FormControl>
                    <TextField
                        name="bankName"
                        label="Bank Name"
                        value={formData.bankName}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        name="accountNumber"
                        label="Account Number"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        name="transactionId"
                        label="Transaction ID"
                        value={formData.transactionId}
                        onChange={handleChange}
                        fullWidth
                        error={!!formErrors.transactionId}
                        helperText={formErrors.transactionId}
                    />
                    <TextField
                        name="notes"
                        label="Notes"
                        multiline
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleSubmit} color="success" variant="contained" disabled={submitting}>
                    {submitting ? <CircularProgress size={24} /> : 'Mark as Paid'}
                </Button>
            </DialogActions>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

PaymentPaidModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    requestId: PropTypes.number,
    onPaid: PropTypes.func.isRequired,
};

export default PaymentPaidModal;