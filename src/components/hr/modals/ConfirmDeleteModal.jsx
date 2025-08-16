import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography
} from '@mui/material';

/**
 * A reusable modal component for confirming deletion actions.
 * @param {object} props - The props object.
 * @param {boolean} props.isOpen - Controls the modal's open state.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onConfirm - Function to be executed on confirmation.
 * @param {object} props.itemToDelete - The item object to be deleted, containing id, name, and type.
 */
export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemToDelete }) {
    // Determine the type of item being deleted for a dynamic message
    const itemType = itemToDelete?.type?.split('.')[0] || '';
    const itemName = itemToDelete?.name || '';

    // The message is constructed based on the item type and name
    const deletionMessage = itemName 
        ? `Are you sure you want to delete this ${itemType} record for ${itemName}?`
        : `Are you sure you want to delete this ${itemType} record?`;

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ backgroundColor: 'error.main', color: 'white' }}>
                Confirm Deletion
            </DialogTitle>
            <DialogContent dividers>
                <Typography>
                    {deletionMessage} This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" variant="outlined">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
