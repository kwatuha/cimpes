import React, { useState } from 'react';
import {
    Box, Typography, Button, Stack, IconButton, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditJobGroupModal from './modals/AddEditJobGroupModal';
import { useTheme } from '@mui/material';
import { tokens } from "../../pages/dashboard/theme";

export default function JobGroupsSection({ jobGroups, showNotification, refreshData, handleOpenDeleteConfirmModal }) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { hasPrivilege } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const handleOpenAddModal = () => {
        if (!hasPrivilege('job_group.create')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        if (!hasPrivilege('job_group.update')) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setEditedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditedItem(null);
    };

    const columns = [
        { field: 'groupName', headerName: 'Group Name', flex: 1, minWidth: 200 },
        { field: 'salaryScale', headerName: 'Salary Scale', flex: 1, minWidth: 150 },
        { field: 'description', headerName: 'Description', flex: 2, minWidth: 300 },
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
                    {hasPrivilege('job_group.update') && (
                        <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleOpenEditModal(params.row)}><EditIcon /></IconButton></Tooltip>
                    )}
                    {hasPrivilege('job_group.delete') && (
                        <Tooltip title="Delete"><IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(params.row.id, params.row.groupName, 'job_group')}><DeleteIcon /></IconButton></Tooltip>
                    )}
                </Stack>
            ),
        },
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>Job Groups</Typography>
                {hasPrivilege('job_group.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Job Group
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
                    rows={jobGroups}
                    columns={columns}
                    getRowId={(row) => row.id}
                    loading={!jobGroups.length}
                />
            </Box>
            <AddEditJobGroupModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editedItem={editedItem}
                showNotification={showNotification}
                refreshData={refreshData}
            />
        </Box>
    );
}
