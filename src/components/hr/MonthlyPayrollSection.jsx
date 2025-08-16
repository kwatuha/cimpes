import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditPayrollModal from './modals/AddEditPayrollModal';

export default function MonthlyPayrollSection({ payrolls, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('payroll.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('payroll.update')) {
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
                <Typography variant="h5" component="h2">Monthly Payroll</Typography>
                {hasPrivilege('payroll.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Payroll Record
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Staff</TableCell>
                            <TableCell sx={{ color: 'white' }}>Pay Period</TableCell>
                            <TableCell sx={{ color: 'white' }}>Gross Salary</TableCell>
                            <TableCell sx={{ color: 'white' }}>Net Salary</TableCell>
                            <TableCell sx={{ color: 'white' }}>Deductions</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payrolls && payrolls.length > 0 ? (
                            payrolls.map((payroll) => (
                                <TableRow key={payroll.id}>
                                    <TableCell>{payroll.staffFirstName} {payroll.staffLastName}</TableCell>
                                    <TableCell>{new Date(payroll.payPeriod).toLocaleDateString()}</TableCell>
                                    <TableCell>{payroll.grossSalary}</TableCell>
                                    <TableCell>{payroll.netSalary}</TableCell>
                                    <TableCell>{payroll.deductions}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('payroll.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(payroll)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('payroll.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(payroll.id, `payroll record for ${payroll.staffFirstName} ${payroll.staffLastName}`, 'payroll')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={6} align="center">No payroll records found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <AddEditPayrollModal
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
