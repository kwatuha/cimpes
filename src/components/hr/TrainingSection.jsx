import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditTrainingModal from './modals/AddEditTrainingModal';

export default function TrainingSection({ trainings, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('training.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('training.update')) {
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
                <Typography variant="h5" component="h2">Training</Typography>
                {hasPrivilege('training.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Training
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Course Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Institution</TableCell>
                            <TableCell sx={{ color: 'white' }}>Completion Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trainings && trainings.length > 0 ? (
                            trainings.map((training) => (
                                <TableRow key={training.id}>
                                    <TableCell>{training.staffFirstName} {training.staffLastName}</TableCell>
                                    <TableCell>{training.courseName}</TableCell>
                                    <TableCell>{training.institution}</TableCell>
                                    <TableCell>{new Date(training.completionDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('training.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(training)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('training.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(training.id, `training record for ${training.staffFirstName} ${training.staffLastName}`, 'training')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} align="center">No training records found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditTrainingModal
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
