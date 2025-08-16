import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditEmployeeModal from './modals/AddEditEmployeeModal';

export default function EmployeeSection({ employees, handleOpenDeleteConfirmModal, fetchEmployee360View, showNotification, refreshData }) {
  const { hasPrivilege } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(null);
  
  const handleOpenAddModal = () => {
    if (!hasPrivilege('employee.create')) {
        showNotification('Permission denied.', 'error');
        return;
    }
    setEditedEmployee(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    if (!hasPrivilege('employee.update')) {
        showNotification('Permission denied.', 'error');
        return;
    }
    setEditedEmployee(employee);
    setIsEditModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditedEmployee(null);
  };
  
  return (
    <Box>
      {hasPrivilege('employee.create') && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          sx={{ mb: 2 }}
        >
          Add New Employee
        </Button>
      )}

      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>All Employees</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table aria-label="employees table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
              {(hasPrivilege('employee.update') || hasPrivilege('employee.delete') || hasPrivilege('employee.read_360')) && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {employees && employees.length > 0 ? (
                employees.map((employee) => (
                    <TableRow key={employee.staffId} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                        <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.title}</TableCell>
                        {(hasPrivilege('employee.update') || hasPrivilege('employee.delete') || hasPrivilege('employee.read_360')) && (
                            <TableCell>
                                <Stack direction="row" spacing={1}>
                                    {hasPrivilege('employee.update') && (
                                        <IconButton color="primary" onClick={() => handleOpenEditModal(employee)}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                    {hasPrivilege('employee.delete') && (
                                        <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(employee.staffId, `${employee.firstName} ${employee.lastName}`, 'employee')}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                    {hasPrivilege('employee.read_360') && (
                                        <IconButton color="info" onClick={() => fetchEmployee360View(employee.staffId)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    )}
                                </Stack>
                            </TableCell>
                        )}
                    </TableRow>
                ))
            ) : (
                <TableRow><TableCell colSpan={5} align="center">No employees found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <AddEditEmployeeModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={handleCloseModal}
        editedItem={editedEmployee}
        employees={employees}
        showNotification={showNotification}
        refreshData={refreshData}
      />
    </Box>
  );
}
