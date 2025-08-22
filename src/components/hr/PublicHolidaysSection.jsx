import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api';
import AddEditPublicHolidayModal from './modals/AddEditPublicHolidayModal';

export default function PublicHolidaysSection({ showNotification, handleOpenDeleteConfirmModal }) {
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
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Holiday Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                             <TableRow><TableCell colSpan={3} align="center">Loading...</TableCell></TableRow>
                        ) : holidays.length > 0 ? (
                            holidays.map((holiday) => (
                                <TableRow key={holiday.id}>
                                    <TableCell>{holiday.holidayName}</TableCell>
                                    <TableCell>{holiday.holidayDate.slice(0, 10)}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {hasPrivilege('holiday.update') && (
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(holiday)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {hasPrivilege('holiday.delete') && (
                                                <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(holiday.id, holiday.holidayName, 'holiday')}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={3} align="center">No public holidays found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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