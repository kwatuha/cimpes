import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Stack, IconButton, CircularProgress, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api';
import AddEditPublicHolidayModal from './modals/AddEditPublicHolidayModal';
import { useTheme } from '@mui/material';
import { tokens } from "../../pages/dashboard/theme";

export default function PublicHolidaysSection({ showNotification, handleOpenDeleteConfirmModal }) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { hasPrivilege } = useAuth();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedItem, setEditedItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await apiService.hr.getPublicHolidays();
            setHolidays(data);
        } catch (error) {
            showNotification('Failed to fetch public holidays.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
    { field: 'holidayName', headerName: 'Holiday Name', flex: 1, minWidth: 200 },
    { field: 'holidayDate', headerName: 'Date', flex: 1, minWidth: 150, valueGetter: (params) => params.row?.holidayDate?.slice(0, 10) || 'N/A' },
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
                {hasPrivilege('holiday.update') && (
                    <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleOpenEditModal(params.row)}><EditIcon /></IconButton></Tooltip>
                )}
                {hasPrivilege('holiday.delete') && (
                    <Tooltip title="Delete"><IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(params.row.id, params.row.holidayName, 'holiday')}><DeleteIcon /></IconButton></Tooltip>
                )}
            </Stack>
        ),
    },
];
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2">Public Holidays</Typography>
                {hasPrivilege('holiday.create') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                        Add Holiday
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
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>
                ) : (
                    <DataGrid
                        rows={holidays}
                        columns={columns}
                        getRowId={(row) => row.id}
                    />
                )}
            </Box>

            <AddEditPublicHolidayModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editedItem={editedItem}
                showNotification={showNotification}
                refreshData={fetchData}
            />
        </Box>
    );
}