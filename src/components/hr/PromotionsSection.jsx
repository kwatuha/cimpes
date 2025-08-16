import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditPromotionsModal from './modals/AddEditPromotionsModal';

export default function PromotionsSection({ promotions, employees, jobGroups, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('promotions.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('promotions.update')) {
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
                <Typography variant="h5" component="h2">Promotions</Typography>
                {hasPrivilege('promotions.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Promotion
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Previous Job Group</TableCell>
                            <TableCell sx={{ color: 'white' }}>New Job Group</TableCell>
                            <TableCell sx={{ color: 'white' }}>Promotion Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {promotions && promotions.length > 0 ? (
                            promotions.map((promotion) => (
                                <TableRow key={promotion.id}>
                                    <TableCell>{promotion.staffFirstName} {promotion.staffLastName}</TableCell>
                                    <TableCell>{promotion.oldJobGroupName}</TableCell>
                                    <TableCell>{promotion.newJobGroupName}</TableCell>
                                    <TableCell>{new Date(promotion.promotionDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('promotions.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(promotion)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('promotions.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(promotion.id, `promotion for ${promotion.staffFirstName} ${promotion.staffLastName}`, 'promotions')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} align="center">No promotions found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditPromotionsModal
                isOpen={isAddModalOpen || isEditModalOpen}
                onClose={handleCloseModal}
                editedItem={editedItem}
                employees={employees}
                jobGroups={jobGroups}
                showNotification={showNotification}
                refreshData={refreshData}
            />
        </Box>
    );
}
