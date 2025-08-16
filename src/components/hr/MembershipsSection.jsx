import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditMembershipsModal from './modals/AddEditMembershipsModal';

export default function MembershipsSection({ memberships, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('memberships.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('memberships.update')) {
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
                <Typography variant="h5" component="h2">Employee Memberships</Typography>
                {hasPrivilege('memberships.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Membership
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Organization</TableCell>
                            <TableCell sx={{ color: 'white' }}>Membership No.</TableCell>
                            <TableCell sx={{ color: 'white' }}>Start Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>End Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {memberships && memberships.length > 0 ? (
                            memberships.map((membership) => (
                                <TableRow key={membership.id}>
                                    <TableCell>{membership.staffFirstName} {membership.staffLastName}</TableCell>
                                    <TableCell>{membership.organizationName}</TableCell>
                                    <TableCell>{membership.membershipNumber}</TableCell>
                                    <TableCell>{new Date(membership.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{membership.endDate ? new Date(membership.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('memberships.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(membership)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('memberships.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(membership.id, `membership record for ${membership.staffFirstName} ${membership.staffLastName}`, 'memberships')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={6} align="center">No memberships found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditMembershipsModal
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
