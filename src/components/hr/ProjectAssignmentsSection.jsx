import React, { useState } from 'react';
import {
    Box, Typography, Button, Stack, IconButton, CircularProgress, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditProjectAssignmentsModal from './modals/AddEditProjectAssignmentsModal';
import { useTheme } from '@mui/material';
import { tokens } from "../../pages/dashboard/theme";

export default function ProjectAssignmentsSection({ projectAssignments, employees, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
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
    
    const columns = [
        { field: 'staff', headerName: 'Staff', flex: 1, minWidth: 200, valueGetter: (params) => `${params.row?.staffFirstName || ''} ${params.row?.staffLastName || ''}` },
        { field: 'projectId', headerName: 'Project ID', flex: 1, minWidth: 150 },
        { field: 'milestoneName', headerName: 'Milestone', flex: 1, minWidth: 200 },
        { field: 'role', headerName: 'Role', flex: 1, minWidth: 150 },
        { field: 'status', headerName: 'Status', flex: 1, minWidth: 150 },
        { field: 'dueDate', headerName: 'Due Date', flex: 1, minWidth: 150, valueGetter: (params) => new Date(params.row?.dueDate).toLocaleDateString() },
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
                    {hasPrivilege('project.assignments.update') && (
                        <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleOpenEditModal(params.row)}><EditIcon /></IconButton></Tooltip>
                    )}
                    {hasPrivilege('project.assignments.delete') && (
                        <Tooltip title="Delete"><IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(params.row.id, `project assignment for ${params.row.staffFirstName} ${params.row.staffLastName}`, 'project.assignments')}><DeleteIcon /></IconButton></Tooltip>
                    )}
                </Stack>
            ),
        },
    ];

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
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                }}
            >
                {projectAssignments && projectAssignments.length > 0 ? (
                    <DataGrid
                        rows={projectAssignments}
                        columns={columns}
                        getRowId={(row) => row.id}
                    />
                ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography variant="h6">No project assignments found.</Typography>
                    </Box>
                )}
            </Box>
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