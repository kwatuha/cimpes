import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Stack, IconButton, CircularProgress, Tooltip, Paper,Grid,Autocomplete,TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api';
import AddEditLeaveEntitlementModal from './modals/AddEditLeaveEntitlementModal';
import { useTheme } from '@mui/material';
import { tokens } from "../../pages/dashboard/theme";

export default function LeaveEntitlementsSection({ employees, leaveTypes, showNotification, handleOpenDeleteConfirmModal }) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
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

    const columns = [
        { field: 'leaveTypeName', headerName: 'Leave Type', flex: 1, minWidth: 200 },
        { field: 'year', headerName: 'Year', flex: 1, minWidth: 150 },
        { field: 'allocatedDays', headerName: 'Allocated Days', flex: 1, minWidth: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    {hasPrivilege('leave.entitlement.update') && (
                        <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleOpenEditModal(params.row)}><EditIcon /></IconButton></Tooltip>
                    )}
                    {hasPrivilege('leave.entitlement.delete') && (
                        <Tooltip title="Delete"><IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(params.row.id, `Entitlement for ${params.row.leaveTypeName}`, 'leave.entitlement')}><DeleteIcon /></IconButton></Tooltip>
                    )}
                </Stack>
            ),
        },
    ];

    return (
        <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>Leave Entitlements</Typography>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={employees}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.staffId})`}
                            value={selectedEmployee}
                            onChange={(event, newValue) => setSelectedEmployee(newValue)}
                            renderInput={(params) => <TextField {...params} label="Select Employee to Manage" />}
                            sx={{ minWidth: 300 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
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

            <Box
                m="20px 0 0 0"
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                    },
                                "& .MuiDataGrid-columnHeaders": {
                backgroundColor: `${colors.blueAccent[700]} !important`,
                borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: `${colors.blueAccent[700]} !important`,
            },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                }}
            >
                <DataGrid
                    rows={entitlements}
                    columns={columns}
                    getRowId={(row) => row.id}
                    loading={loading}
                    autoPageSize
                />
            </Box>

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
