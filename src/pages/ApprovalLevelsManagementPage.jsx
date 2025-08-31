import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, IconButton,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, Stack, useTheme,
  Tooltip, Tabs, Tab, Paper
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid'; // Added DataGrid import
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../api';
import PropTypes from 'prop-types';
import { tokens } from './dashboard/theme'; // Added for consistent styling

const DeleteConfirmDialog = ({ open, onClose, onConfirm, itemToDeleteName, itemType }) => (
  <Dialog open={open} onClose={onClose} aria-labelledby="delete-dialog-title">
    <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
    <DialogContent>
      <Typography>Are you sure you want to delete this {itemType} "{itemToDeleteName}"? This action cannot be undone.</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
    </DialogActions>
  </Dialog>
);

const ApprovalLevelsManagementPage = () => {
  const { hasPrivilege } = useAuth();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [approvalLevels, setApprovalLevels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [mainTabValue, setMainTabValue] = useState(0);

  const [openLevelDialog, setOpenLevelDialog] = useState(false);
  const [currentLevelToEdit, setCurrentLevelToEdit] = useState(null);
  const [levelFormData, setLevelFormData] = useState({
    levelName: '',
    roleId: '',
    approvalOrder: '',
  });
  const [levelFormErrors, setLevelFormErrors] = useState({});

  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [currentStatusToEdit, setCurrentStatusToEdit] = useState(null);
  const [statusFormData, setStatusFormData] = useState({
    statusName: '',
    description: '',
  });
  const [statusFormErrors, setStatusFormErrors] = useState({});

  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (hasPrivilege('approval_levels.read')) {
        const approvalData = await apiService.approval.getApprovalLevels();
        setApprovalLevels(approvalData);
      } else {
        setError("You do not have permission to view approval levels.");
        setApprovalLevels([]);
      }

      if (hasPrivilege('payment_status_definitions.read')) {
        const statusData = await apiService.approval.getPaymentStatusDefinitions();
        setPaymentStatuses(statusData);
      } else {
        setPaymentStatuses([]);
      }
      
      const rolesData = await apiService.users.getRoles();
      setRoles(rolesData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || "Failed to load management data.");
      setSnackbar({ open: true, message: `Failed to load data: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [hasPrivilege]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleMainTabChange = (event, newValue) => {
    setMainTabValue(newValue);
  };

  // --- Approval Level Handlers ---
  const handleOpenCreateLevelDialog = () => {
    if (!hasPrivilege('approval_levels.create')) {
      setSnackbar({ open: true, message: "Permission denied to create approval levels.", severity: 'error' });
      return;
    }
    setCurrentLevelToEdit(null);
    setLevelFormData({ levelName: '', roleId: '', approvalOrder: '' });
    setLevelFormErrors({});
    setOpenLevelDialog(true);
  };

  const handleOpenEditLevelDialog = (level) => {
    if (!hasPrivilege('approval_levels.update')) {
      setSnackbar({ open: true, message: "Permission denied to update approval levels.", severity: 'error' });
      return;
    }
    setCurrentLevelToEdit(level);
    setLevelFormData({
      levelName: level.levelName || '',
      roleId: level.roleId || '',
      approvalOrder: level.approvalOrder || '',
    });
    setLevelFormErrors({});
    setOpenLevelDialog(true);
  };

  const handleCloseLevelDialog = () => {
    setOpenLevelDialog(false);
    setCurrentLevelToEdit(null);
    setLevelFormErrors({});
  };

  const handleLevelFormChange = (e) => {
    const { name, value } = e.target;
    setLevelFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateLevelForm = () => {
    let errors = {};
    if (!levelFormData.levelName) errors.levelName = 'Level name is required.';
    if (!levelFormData.roleId) errors.roleId = 'Role is required.';
    if (!levelFormData.approvalOrder) errors.approvalOrder = 'Approval order is required.';
    setLevelFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLevelSubmit = async () => {
    if (!validateLevelForm()) {
      setSnackbar({ open: true, message: 'Please correct the form errors.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      if (currentLevelToEdit) {
        await apiService.approval.updateApprovalLevel(currentLevelToEdit.levelId, levelFormData);
        setSnackbar({ open: true, message: 'Approval level updated successfully!', severity: 'success' });
      } else {
        await apiService.approval.createApprovalLevel(levelFormData);
        setSnackbar({ open: true, message: 'Approval level created successfully!', severity: 'success' });
      }
      handleCloseLevelDialog();
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save approval level.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Payment Status Handlers ---
  const handleOpenCreateStatusDialog = () => {
    if (!hasPrivilege('payment_status_definitions.create')) {
        setSnackbar({ open: true, message: "Permission denied to create statuses.", severity: 'error' });
        return;
    }
    setCurrentStatusToEdit(null);
    setStatusFormData({ statusName: '', description: '' });
    setStatusFormErrors({});
    setOpenStatusDialog(true);
  };
  
  const handleOpenEditStatusDialog = (status) => {
    if (!hasPrivilege('payment_status_definitions.update')) {
        setSnackbar({ open: true, message: "Permission denied to update statuses.", severity: 'error' });
        return;
    }
    setCurrentStatusToEdit(status);
    setStatusFormData({
        statusName: status.statusName || '',
        description: status.description || '',
    });
    setStatusFormErrors({});
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setCurrentStatusToEdit(null);
    setStatusFormErrors({});
  };

  const handleStatusFormChange = (e) => {
    const { name, value } = e.target;
    setStatusFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStatusForm = () => {
    let errors = {};
    if (!statusFormData.statusName.trim()) errors.statusName = 'Status name is required.';
    setStatusFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStatusSubmit = async () => {
    if (!validateStatusForm()) {
      setSnackbar({ open: true, message: 'Please correct the form errors.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      if (currentStatusToEdit) {
        await apiService.approval.updatePaymentStatusDefinition(currentStatusToEdit.statusId, statusFormData);
        setSnackbar({ open: true, message: 'Payment status updated successfully!', severity: 'success' });
      } else {
        await apiService.approval.createPaymentStatusDefinition(statusFormData);
        setSnackbar({ open: true, message: 'Payment status created successfully!', severity: 'success' });
      }
      handleCloseStatusDialog();
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save payment status.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Handlers ---
  const handleOpenDeleteConfirm = (item, type) => {
    if (type === 'level' && !hasPrivilege('approval_levels.delete')) {
      setSnackbar({ open: true, message: "Permission denied to delete approval levels.", severity: 'error' });
      return;
    }
    if (type === 'status' && !hasPrivilege('payment_status_definitions.delete')) {
      setSnackbar({ open: true, message: "Permission denied to delete statuses.", severity: 'error' });
      return;
    }
    setItemToDelete({ id: item.levelId || item.statusId, name: item.levelName || item.statusName, type });
    setOpenDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    setOpenDeleteConfirmDialog(false);
    try {
      if (itemToDelete.type === 'level') {
        await apiService.approval.deleteApprovalLevel(itemToDelete.id);
        setSnackbar({ open: true, message: 'Approval level deleted successfully!', severity: 'success' });
        fetchData();
      } else if (itemToDelete.type === 'status') {
        await apiService.approval.deletePaymentStatusDefinition(itemToDelete.id);
        setSnackbar({ open: true, message: 'Payment status deleted successfully!', severity: 'success' });
        fetchData();
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || `Failed to delete ${itemToDelete.type}.`, severity: 'error' });
    } finally {
      setLoading(false);
      setItemToDelete(null);
    }
  };

  // DataGrid column definitions for Approval Levels
// DataGrid column definitions for Approval Levels
const levelColumns = [
  { field: 'levelName', headerName: 'Level Name', flex: 1.5, minWidth: 200 },
  {
    field: 'roleId',
    headerName: 'Assigned Role',
    flex: 1,
    minWidth: 150,
    valueGetter: (params) => {
      // Safely access row properties using optional chaining
      const role = roles.find(r => r.roleId === params.row?.roleId);
      return role ? role.roleName : 'N/A';
    },
  },
  { field: 'approvalOrder', headerName: 'Approval Order', type: 'number', flex: 1, minWidth: 150 },
  {
    field: 'actions',
    headerName: 'Actions',
    type: 'actions',
    flex: 1,
    minWidth: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        {hasPrivilege('approval_levels.update') && (
          <Tooltip title="Edit Level">
            <IconButton color="primary" onClick={() => handleOpenEditLevelDialog(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {hasPrivilege('approval_levels.delete') && (
          <Tooltip title="Delete Level">
            <IconButton color="error" onClick={() => handleOpenDeleteConfirm(params.row, 'level')}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  },
];
  // DataGrid column definitions for Payment Statuses
  const statusColumns = [
    { field: 'statusId', headerName: 'ID', flex: 0.5, minWidth: 50 },
    { field: 'statusName', headerName: 'Status Name', flex: 1.5, minWidth: 200 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {hasPrivilege('payment_status_definitions.update') && (
            <Tooltip title="Edit Status">
              <IconButton color="primary" onClick={() => handleOpenEditStatusDialog(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {hasPrivilege('payment_status_definitions.delete') && (
            <Tooltip title="Delete Status">
              <IconButton color="error" onClick={() => handleOpenDeleteConfirm(params.row, 'status')}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 3 }}>
        Approval & Status Management
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={mainTabValue} onChange={handleMainTabChange} aria-label="approval and status tabs">
          <Tab label="APPROVAL LEVELS" sx={{ fontWeight: 'bold' }} />
          <Tab label="PAYMENT STATUSES" sx={{ fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      {mainTabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Manage your multi-stage approval hierarchy.</Typography>
              {hasPrivilege('approval_levels.create') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateLevelDialog}
                  sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' }, color: 'white', fontWeight: 'semibold' }}
                >
                  Add New Level
                </Button>
              )}
            </Box>
            {approvalLevels.length === 0 ? (
              <Alert severity="info">No approval levels found. Add a new level to get started.</Alert>
            ) : (
                <Box
                  sx={{
                    height: 400,
                    width: '100%',
                    "& .MuiDataGrid-root": {
                        border: "none",
                        color: theme.palette.text.primary,
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                        color: theme.palette.text.primary,
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
                    rows={approvalLevels}
                    columns={levelColumns}
                    getRowId={(row) => row.levelId}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                  />
                </Box>
            )}
          </Box>
      )}
      
      {mainTabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Manage the list of available payment statuses.</Typography>
              {hasPrivilege('payment_status_definitions.create') && (
                  <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreateStatusDialog}
                      sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' }, color: 'white', fontWeight: 'semibold' }}
                  >
                      Add New Status
                  </Button>
              )}
            </Box>
            {paymentStatuses.length === 0 ? (
              <Alert severity="info">No payment statuses found. Add a new one to get started.</Alert>
            ) : (
                <Box
                    sx={{
                        height: 400,
                        width: '100%',
                        "& .MuiDataGrid-root": {
                            border: "none",
                            color: theme.palette.text.primary,
                        },
                        "& .MuiDataGrid-cell": {
                            borderBottom: "none",
                            color: theme.palette.text.primary,
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
                    rows={paymentStatuses}
                    columns={statusColumns}
                    getRowId={(row) => row.statusId}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                  />
                </Box>
            )}
          </Box>
      )}

      {/* Add/Edit Approval Level Dialog */}
      <Dialog open={openLevelDialog} onClose={handleCloseLevelDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
          {currentLevelToEdit ? 'Edit Approval Level' : 'Add New Approval Level'}
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default }}>
          <TextField
            autoFocus
            margin="dense"
            name="levelName"
            label="Level Name"
            type="text"
            fullWidth
            variant="outlined"
            value={levelFormData.levelName}
            onChange={handleLevelFormChange}
            error={!!levelFormErrors.levelName}
            helperText={levelFormErrors.levelName}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" variant="outlined" error={!!levelFormErrors.roleId} sx={{ minWidth: 200, mb: 2 }}>
            <InputLabel>Assigned Role</InputLabel>
            <Select
              name="roleId"
              label="Assigned Role"
              value={levelFormData.roleId}
              onChange={handleLevelFormChange}
            >
              {roles.map(role => (
                <MenuItem key={role.roleId} value={role.roleId}>{role.roleName}</MenuItem>
              ))}
            </Select>
            {levelFormErrors.roleId && <Alert severity="error">{levelFormErrors.roleId}</Alert>}
          </FormControl>
          <TextField
            margin="dense"
            name="approvalOrder"
            label="Approval Order"
            type="number"
            fullWidth
            variant="outlined"
            value={levelFormData.approvalOrder}
            onChange={handleLevelFormChange}
            error={!!levelFormErrors.approvalOrder}
            helperText={levelFormErrors.approvalOrder}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseLevelDialog} color="primary" variant="outlined">Cancel</Button>
          <Button onClick={handleLevelSubmit} color="primary" variant="contained">{currentLevelToEdit ? 'Update Level' : 'Create Level'}</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add/Edit Payment Status Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
          {currentStatusToEdit ? 'Edit Payment Status' : 'Add New Payment Status'}
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default }}>
          <TextField
            autoFocus
            margin="dense"
            name="statusName"
            label="Status Name"
            type="text"
            fullWidth
            variant="outlined"
            value={statusFormData.statusName}
            onChange={handleStatusFormChange}
            error={!!statusFormErrors.statusName}
            helperText={statusFormErrors.statusName}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={statusFormData.description}
            onChange={handleStatusFormChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseStatusDialog} color="primary" variant="outlined">Cancel</Button>
          <Button onClick={handleStatusSubmit} color="primary" variant="contained">{currentStatusToEdit ? 'Update Status' : 'Create Status'}</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={openDeleteConfirmDialog}
        onClose={() => setOpenDeleteConfirmDialog(false)}
        onConfirm={handleConfirmDelete}
        itemToDeleteName={itemToDelete?.name || ''}
        itemType={itemToDelete?.type || ''}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

ApprovalLevelsManagementPage.propTypes = {
    // No props for this page component
};

export default ApprovalLevelsManagementPage;