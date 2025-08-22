import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditJobGroupModal from './modals/AddEditJobGroupModal';

export default function JobGroupsSection({ jobGroups, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        // FIX: Corrected permission key to use underscore
        if (!hasPrivilege('job_group.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        // FIX: Corrected permission key to use underscore
        if (!hasPrivilege('job_group.update')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(item);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditedItem(null);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2">Job Groups</Typography>
                {/* FIX: Corrected permission key to use underscore */}
                {hasPrivilege('job_group.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Job Group
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Group Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Salary Scale</TableCell>
                            <TableCell sx={{ color: 'white' }}>Description</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobGroups && jobGroups.length > 0 ? (
                            jobGroups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell>{group.groupName}</TableCell>
                                    <TableCell>{group.salaryScale}</TableCell>
                                    <TableCell>{group.description}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {/* FIX: Corrected permission key to use underscore */}
                                            {hasPrivilege('job_group.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(group)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {/* FIX: Corrected permission key to use underscore */}
                                            {hasPrivilege('job_group.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(group.id, group.groupName, 'job_group')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={4} align="center">No job groups found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditJobGroupModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editedItem={editedItem}
                showNotification={showNotification}
                refreshData={refreshData}
            />
        </Box>
    );
}