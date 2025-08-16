import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditBankDetailsModal from './modals/AddEditBankDetailsModal';

export default function BankDetailsSection({ bankDetails, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('bank.details.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('bank.details.update')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(item);
        setIsEditModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setEditedItem(null);
    };
    
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2">Bank Details</Typography>
                {hasPrivilege('bank.details.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Bank Details
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Bank Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Account Number</TableCell>
                            <TableCell sx={{ color: 'white' }}>Is Primary?</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bankDetails && bankDetails.length > 0 ? (
                            bankDetails.map((details) => (
                                <TableRow key={details.id}>
                                    <TableCell>{details.staffFirstName} {details.staffLastName}</TableCell>
                                    <TableCell>{details.bankName}</TableCell>
                                    <TableCell>{details.accountNumber}</TableCell>
                                    <TableCell>{details.isPrimary ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('bank.details.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(details)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('bank.details.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(details.id, `bank details for ${details.staffFirstName} ${details.staffLastName}`, 'bank.details')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} align="center">No bank details found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditBankDetailsModal
                isOpen={isAddModalOpen || isEditModalOpen}
                onClose={handleCloseModal}
                editedItem={editedItem}
                employees={employees}
                showNotification={showNotification}
                refreshData={refreshData}
            />
        </Box>
    );
}
