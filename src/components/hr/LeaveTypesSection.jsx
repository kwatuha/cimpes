import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditLeaveTypeModal from './modals/AddEditLeaveTypeModal';

export default function LeaveTypesSection({ leaveTypes, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
  const { hasPrivilege } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedItem, setEditedItem] = useState(null);

  const handleOpenAddModal = () => {
    if (!hasPrivilege('leave.type.create')) {
        showNotification('Permission denied.', 'error');
        return;
    }
    setEditedItem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    if (!hasPrivilege('leave.type.update')) {
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
      {hasPrivilege('leave.type.create') && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          sx={{ mb: 2 }}
        >
          Add New Leave Type
        </Button>
      )}

      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>Available Leave Types</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table aria-label="leave types table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Number of Days</TableCell>
              {(hasPrivilege('leave.type.update') || hasPrivilege('leave.type.delete')) && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveTypes && leaveTypes.length > 0 ? (
                leaveTypes.map((type) => (
                    <TableRow key={type.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                        <TableCell>{type.name}</TableCell>
                        <TableCell>{type.description}</TableCell>
                        <TableCell>{type.numberOfDays}</TableCell>
                        {(hasPrivilege('leave.type.update') || hasPrivilege('leave.type.delete')) && (
                            <TableCell>
                                <Stack direction="row" spacing={1}>
                                    {hasPrivilege('leave.type.update') && (
                                        <IconButton color="primary" onClick={() => handleOpenEditModal(type)}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                    {hasPrivilege('leave.type.delete') && (
                                        <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(type.id, type.name, 'leave.type')}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Stack>
                            </TableCell>
                        )}
                    </TableRow>
                ))
            ) : (
                <TableRow><TableCell colSpan={4} align="center">No leave types found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <AddEditLeaveTypeModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={handleCloseModal}
        editedItem={editedItem}
        showNotification={showNotification}
        refreshData={refreshData}
      />
    </Box>
  );
}
