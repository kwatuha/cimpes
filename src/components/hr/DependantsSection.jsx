import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditDependantsModal from './modals/AddEditDependantsModal';

export default function DependantsSection({ dependants, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('dependants.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('dependants.update')) {
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
                <Typography variant="h5" component="h2">Employee Dependants</Typography>
                {hasPrivilege('dependants.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Dependant
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Dependant Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Relationship</TableCell>
                            <TableCell sx={{ color: 'white' }}>Date of Birth</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dependants && dependants.length > 0 ? (
                            dependants.map((dependant) => (
                                <TableRow key={dependant.id}>
                                    <TableCell>{dependant.staffFirstName} {dependant.staffLastName}</TableCell>
                                    <TableCell>{dependant.dependantName}</TableCell>
                                    <TableCell>{dependant.relationship}</TableCell>
                                    <TableCell>{new Date(dependant.dateOfBirth).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('dependants.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(dependant)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('dependants.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(dependant.id, `dependant for ${dependant.staffFirstName} ${dependant.staffLastName}`, 'dependants')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} align="center">No dependants found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditDependantsModal
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
