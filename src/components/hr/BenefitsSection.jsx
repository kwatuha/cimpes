import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditBenefitsModal from './modals/AddEditBenefitsModal';

export default function BenefitsSection({ benefits, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('benefits.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('benefits.update')) {
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
                <Typography variant="h5" component="h2">Employee Benefits</Typography>
                {hasPrivilege('benefits.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Benefit
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Benefit Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Enrollment Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {benefits && benefits.length > 0 ? (
                            benefits.map((benefit) => (
                                <TableRow key={benefit.id}>
                                    <TableCell>{benefit.staffFirstName} {benefit.staffLastName}</TableCell>
                                    <TableCell>{benefit.benefitName}</TableCell>
                                    <TableCell>{new Date(benefit.enrollmentDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{benefit.status}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('benefits.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(benefit)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('benefits.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(benefit.id, `benefit for ${benefit.staffFirstName} ${benefit.staffLastName}`, 'benefits')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} align="center">No benefits found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditBenefitsModal
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
