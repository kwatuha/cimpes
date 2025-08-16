import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditContractsModal from './modals/AddEditContractsModal';

export default function ContractsSection({ contracts, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('contracts.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('contracts.update')) {
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
                <Typography variant="h5" component="h2">Employee Contracts</Typography>
                {hasPrivilege('contracts.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Contract
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Type</TableCell>
                            <TableCell sx={{ color: 'white' }}>Start Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>End Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contracts && contracts.length > 0 ? (
                            contracts.map((contract) => (
                                <TableRow key={contract.id}>
                                    <TableCell>{contract.staffFirstName} {contract.staffLastName}</TableCell>
                                    <TableCell>{contract.contractType}</TableCell>
                                    <TableCell>{new Date(contract.contractStartDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{contract.contractEndDate ? new Date(contract.contractEndDate).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>{contract.status}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('contracts.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(contract)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('contracts.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(contract.id, `contract for ${contract.staffFirstName} ${contract.staffLastName}`, 'contracts')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={6} align="center">No contracts found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditContractsModal
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
