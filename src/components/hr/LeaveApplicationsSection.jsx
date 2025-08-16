import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditLeaveApplicationModal from './modals/AddEditLeaveApplicationModal';

export default function LeaveApplicationsSection({ leaveApplications, employees, leaveTypes, handleUpdateLeaveStatus, setSelectedApplication, setIsApprovalModalOpen, setIsReturnModalOpen, setApprovedDates, setActualReturnDate, handleOpenDeleteConfirmModal, showNotification, refreshData }) {
  const { hasPrivilege } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedItem, setEditedItem] = useState(null);

  const handleOpenAddModal = () => {
    if (!hasPrivilege('leave.application.create')) {
      showNotification('Permission denied.', 'error');
      return;
    }
    setEditedItem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    if (!hasPrivilege('leave.application.update')) {
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
    // Set approved dates to requested dates by default
    setApprovedDates({ startDate: app.startDate, endDate: app.endDate });
  };
  
  const showReturnModal = (app) => {
    setSelectedApplication(app);
    setIsReturnModalOpen(true);
    setActualReturnDate('');
  };

  return (
    <Box>
      {hasPrivilege('leave.application.create') && (
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
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table aria-label="leave applications table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Leave Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Requested Dates</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>No. of Days</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Approved Dates</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actual Return</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Handover</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              {(hasPrivilege('leave.approve') || hasPrivilege('leave.application.update') || hasPrivilege('leave.application.delete')) && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveApplications && leaveApplications.length > 0 ? (
                leaveApplications.map((app) => (
                    <TableRow key={app.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                        <TableCell>{app.firstName} {app.lastName}</TableCell>
                        <TableCell>{app.leaveTypeName}</TableCell>
                        <TableCell>{app.startDate} to {app.endDate}</TableCell>
                        <TableCell>{app.numberOfDays}</TableCell>
                        <TableCell>{app.approvedStartDate ? `${app.approvedStartDate} to ${app.approvedEndDate}` : 'N/A'}</TableCell>
                        <TableCell>{app.actualReturnDate || 'N/A'}</TableCell>
                        <TableCell>{app.handoverFirstName ? `${app.handoverFirstName} ${app.handoverLastName}` : 'N/A'}</TableCell>
                        <TableCell>
                            <Typography
                                component="span"
                                sx={{
                                    p: 1, borderRadius: '4px',
                                    bgcolor: app.status === 'Pending' ? 'warning.main' : app.status === 'Approved' ? 'success.main' : app.status === 'Completed' ? 'primary.main' : 'error.main',
                                    color: 'white', fontWeight: 'bold', fontSize: '0.75rem'
                                }}
                            >
                                {app.status}
                            </Typography>
                        </TableCell>
                        {(hasPrivilege('leave.approve') || hasPrivilege('leave.application.update') || hasPrivilege('leave.application.delete')) && (
                            <TableCell>
                                <Stack direction="row" spacing={1}>
                                    {app.status === 'Pending' && hasPrivilege('leave.approve') && (
                                        <>
                                            <Button size="small" variant="contained" color="success" onClick={() => showApprovalModal(app)}>Approve</Button>
                                            <Button size="small" variant="contained" color="error" onClick={() => handleUpdateLeaveStatus('Rejected')}>Reject</Button>
                                        </>
                                    )}
                                    {app.status === 'Approved' && !app.actualReturnDate && hasPrivilege('leave.complete') && (
                                        <Button size="small" variant="contained" color="primary" onClick={() => showReturnModal(app)}>Record Return</Button>
                                    )}
                                    {app.status === 'Pending' && hasPrivilege('leave.application.update') && (
                                        <IconButton color="primary" onClick={() => handleOpenEditModal(app)}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                    {(app.status === 'Pending' || app.status === 'Rejected') && hasPrivilege('leave.application.delete') && (
                                        <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(app.id, `Leave Application for ${app.firstName} ${app.lastName}`, 'leaveApplication')}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Stack>
                            </TableCell>
                        )}
                    </TableRow>
                ))
            ) : (
                <TableRow><TableCell colSpan={9} align="center">No leave applications found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
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
