import React, { useState } from 'react';
import {
    Box, Typography, Button, Stack, IconButton, CircularProgress, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditLeaveApplicationModal from './modals/AddEditLeaveApplicationModal';
import { useTheme } from '@mui/material';
import { tokens } from "../../pages/dashboard/theme";

export default function LeaveApplicationsSection({
    leaveApplications,
    employees,
    leaveTypes,
    handleUpdateLeaveStatus,
    setSelectedApplication,
    setIsApprovalModalOpen,
    setIsReturnModalOpen,
    setApprovedDates,
    setActualReturnDate,
    handleOpenDeleteConfirmModal,
    showNotification,
    refreshData
}) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { hasPrivilege } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('leave.apply')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('leave.update')) {
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

    const showApprovalModal = (app) => {
        setSelectedApplication(app);
        setIsApprovalModalOpen(true);
        setApprovedDates({ startDate: app.startDate, endDate: app.endDate });
    };

    const showReturnModal = (app) => {
        setSelectedApplication(app);
        setIsReturnModalOpen(true);
        setActualReturnDate('');
    };

    const columns = [
        { field: 'employeeName', headerName: 'Employee', flex: 1, minWidth: 150, valueGetter: (params) => `${params?.row?.firstName} ${params?.row?.lastName}` },
        { field: 'leaveTypeName', headerName: 'Leave Type', flex: 1, minWidth: 150 },
        { field: 'requestedDates', headerName: 'Requested Dates', flex: 1, minWidth: 200, valueGetter: (params) => `${params?.row?.startDate} to ${params?.row?.endDate}` },
        { field: 'numberOfDays', headerName: 'No. of Days', flex: 1, minWidth: 120 },
        { field: 'approvedDates', headerName: 'Approved Dates', flex: 1, minWidth: 200, valueGetter: (params) => params?.row?.approvedStartDate ? `${params?.row?.approvedStartDate} to ${params?.row?.approvedEndDate}` : 'N/A' },
        { field: 'actualReturnDate', headerName: 'Actual Return', flex: 1, minWidth: 150, valueGetter: (params) => params?.row?.actualReturnDate || 'N/A' },
        { field: 'handoverName', headerName: 'Handover', flex: 1, minWidth: 150, valueGetter: (params) => params?.row?.handoverFirstName ? `${params?.row?.handoverFirstName} ${params?.row?.handoverLastName}` : 'N/A' },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Typography
                    component="span"
                    sx={{
                        p: 1, borderRadius: '4px',
                        bgcolor: params.value === 'Pending' ? 'warning.main' : params.value === 'Approved' ? 'success.main' : params.value === 'Completed' ? 'primary.main' : 'error.main',
                        color: 'white', fontWeight: 'bold', fontSize: '0.75rem'
                    }}
                >
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            flex: 1,
            minWidth: 300,
            renderCell: (params) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    {params?.row?.status === 'Pending' && hasPrivilege('leave.approve') && (
                        <>
                            <Button size="small" variant="contained" color="success" onClick={() => showApprovalModal(params.row)}>Approve</Button>
                            <Button size="small" variant="contained" color="error" onClick={() => handleUpdateLeaveStatus('Rejected')}>Reject</Button>
                        </>
                    )}
                    {params?.row?.status === 'Approved' && !params?.row?.actualReturnDate && hasPrivilege('leave.complete') && (
                        <Button size="small" variant="contained" color="primary" onClick={() => showReturnModal(params.row)}>Record Return</Button>
                    )}
                    {params?.row?.status === 'Pending' && hasPrivilege('leave.update') && (
                        <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleOpenEditModal(params.row)}><EditIcon /></IconButton></Tooltip>
                    )}
                    {(params?.row?.status === 'Pending' || params?.row?.status === 'Rejected') && hasPrivilege('leave.delete') && (
                        <Tooltip title="Delete"><IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(params.row.id, `Leave Application for ${params.row.firstName} ${params.row.lastName}`, 'leave.application')}><DeleteIcon /></IconButton></Tooltip>
                    )}
                </Stack>
            ),
        },
    ];

    return (
        <Box>
            {hasPrivilege('leave.apply') && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddModal}
                    sx={{ mb: 2 }}
                >
                    Apply for Leave
                </Button>
            )}

            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>Leave Applications</Typography>
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
                    rows={leaveApplications}
                    columns={columns}
                    getRowId={(row) => row.id}
                    loading={!leaveApplications.length}
                />
            </Box>
            <AddEditLeaveApplicationModal
                isOpen={isAddModalOpen || isEditModalOpen}
                onClose={handleCloseModal}
                editedItem={editedItem}
                employees={employees}
                leaveTypes={leaveTypes}
                showNotification={showNotification}
                refreshData={refreshData}
            />
        </Box>
    );
}
