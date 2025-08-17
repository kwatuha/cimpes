import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditAssignedAssetsModal from './modals/AddEditAssignedAssetsModal';

export default function AssignedAssetsSection({ assignedAssets, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('assigned.assets.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('assigned.assets.update')) {
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
                <Typography variant="h5" component="h2">Assigned Assets</Typography>
                {hasPrivilege('assigned.assets.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Assign Asset
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Asset Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Serial Number</TableCell>
                            <TableCell sx={{ color: 'white' }}>Assignment Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Return Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignedAssets && assignedAssets.length > 0 ? (
                            assignedAssets.map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell>{asset.staffFirstName} {asset.staffLastName}</TableCell>
                                    <TableCell>{asset.assetName}</TableCell>
                                    <TableCell>{asset.serialNumber}</TableCell>
                                    <TableCell>{new Date(asset.assignmentDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{asset.returnDate ? new Date(asset.returnDate).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('assigned.assets.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(asset)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('assigned.assets.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(asset.id, 'assignedAsset', `asset for ${asset.staffFirstName} ${asset.staffLastName}`)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={6} align="center">No assets assigned.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditAssignedAssetsModal
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
