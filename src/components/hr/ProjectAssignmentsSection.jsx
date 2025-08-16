import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditProjectAssignmentsModal from './modals/AddEditProjectAssignmentsModal';

export default function ProjectAssignmentsSection({ projectAssignments, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('project.assignments.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('project.assignments.update')) {
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
                <Typography variant="h5" component="h2">Project Assignments</Typography>
                {hasPrivilege('project.assignments.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Project Assignment
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Project ID</TableCell>
                            <TableCell sx={{ color: 'white' }}>Milestone</TableCell>
                            <TableCell sx={{ color: 'white' }}>Role</TableCell>
                            <TableCell sx={{ color: 'white' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white' }}>Due Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projectAssignments && projectAssignments.length > 0 ? (
                            projectAssignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell>{assignment.staffFirstName} {assignment.staffLastName}</TableCell>
                                    <TableCell>{assignment.projectId}</TableCell>
                                    <TableCell>{assignment.milestoneName}</TableCell>
                                    <TableCell>{assignment.role}</TableCell>
                                    <TableCell>{assignment.status}</TableCell>
                                    <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('project.assignments.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(assignment)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('project.assignments.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(assignment.id, `project assignment for ${assignment.staffFirstName} ${assignment.staffLastName}`, 'project.assignments')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={7} align="center">No project assignments found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditProjectAssignmentsModal
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
