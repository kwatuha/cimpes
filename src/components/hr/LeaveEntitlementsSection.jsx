import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton,
    Autocomplete, TextField, Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api';
import AddEditLeaveEntitlementModal from './modals/AddEditLeaveEntitlementModal';

// CHANGED: Added handleOpenDeleteConfirmModal to the props
export default function LeaveEntitlementsSection({ employees, leaveTypes, showNotification, handleOpenDeleteConfirmModal }) {
    const { hasPrivilege } = useAuth();

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [entitlements, setEntitlements] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const fetchEntitlements = async () => {
        if (!selectedEmployee) return;
        setLoading(true);
        try {
            const data = await apiService.hr.getLeaveEntitlements(selectedEmployee.staffId);
            setEntitlements(data);
        } catch (error) {
            showNotification('Failed to fetch leave entitlements.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntitlements();
    }, [selectedEmployee]);

    const handleOpenAddModal = () => {
        setEditedItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditedItem(null);
    };

    return (
        <Box>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>Leave Entitlements</Typography>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid xs={12} md={6}>
                        <Autocomplete
                            options={employees}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.staffId})`}
                            value={selectedEmployee}
                            onChange={(event, newValue) => setSelectedEmployee(newValue)}
                            renderInput={(params) => <TextField {...params} label="Select Employee to Manage" />}
                            sx={{ minWidth: 300 }}
                        />
                    </Grid>
                    <Grid xs={12} md={6}>
                        {selectedEmployee && hasPrivilege('leave.entitlement.create') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddModal}
                            >
                                Add New Entitlement
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>
            
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Leave Type</TableCell>
                            <TableCell sx={{ color: 'white' }}>Year</TableCell>
                            <TableCell sx={{ color: 'white' }}>Allocated Days</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} align="center">Loading...</TableCell></TableRow>
                        ) : entitlements.length > 0 ? (
                            entitlements.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.leaveTypeName}</TableCell>
                                    <TableCell>{item.year}</TableCell>
                                    <TableCell>{item.allocatedDays}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('leave.entitlement.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(item)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('leave.entitlement.delete') && (
                                                // CHANGED: onClick handler is now active
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(item.id, `Entitlement for ${item.leaveTypeName}`, 'leave.entitlement')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={4} align="center">
                                {selectedEmployee ? 'No leave entitlements found for this employee.' : 'Please select an employee to view their entitlements.'}
                            </TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {isModalOpen && (
                <AddEditLeaveEntitlementModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    editedItem={editedItem}
                    currentEmployeeId={selectedEmployee?.staffId}
                    leaveTypes={leaveTypes}
                    showNotification={showNotification}
                    refreshData={fetchEntitlements}
                />
            )}
        </Box>
    );
}