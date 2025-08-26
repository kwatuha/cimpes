import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, Stack, useTheme,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../api';
import PropTypes from 'prop-types';

const ApprovalLevelsManagementPage = () => {
  const { hasPrivilege } = useAuth();
  const theme = useTheme();

  const [approvalLevels, setApprovalLevels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Approval Level States
  const [openLevelDialog, setOpenLevelDialog] = useState(false);
  const [currentLevelToEdit, setCurrentLevelToEdit] = useState(null);
  const [levelFormData, setLevelFormData] = useState({
    levelName: '',
    roleId: '',
    approvalOrder: '',
  });
  const [levelFormErrors, setLevelFormErrors] = useState({});

  // Delete Confirmation Dialog States
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchApprovalLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (hasPrivilege('approval_levels.read')) {
        const data = await apiService.approval.getApprovalLevels();
        setApprovalLevels(data);
      } else {
        setError("You do not have permission to view approval levels.");
        setApprovalLevels([]);
      }
    } catch (err) {
      console.error('Error fetching approval levels:', err);
      setError(err.message || "Failed to load approval levels.");
    } finally {
      setLoading(false);
    }
  }, [hasPrivilege]);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await apiService.users.getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setSnackbar({ open: true, message: `Failed to load roles: ${err.message}`, severity: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchApprovalLevels();
    fetchRoles();
  }, [fetchApprovalLevels, fetchRoles]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
      fetchApprovalLevels();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save approval level.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteConfirm = (item) => {
    if (!hasPrivilege('approval_levels.delete')) {
      setSnackbar({ open: true, message: "Permission denied to delete approval levels.", severity: 'error' });
      return;
    }
    setItemToDelete({ id: item.levelId, name: item.levelName });
    setOpenDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    setOpenDeleteConfirmDialog(false);
    try {
      await apiService.approval.deleteApprovalLevel(itemToDelete.id);
      setSnackbar({ open: true, message: 'Approval level deleted successfully!', severity: 'success' });
      fetchApprovalLevels();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || `Failed to delete approval level "${itemToDelete.name}".`, severity: 'error' });
    } finally {
      setLoading(false);
      setItemToDelete(null);
    }
  };

  if (loading && approvalLevels.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading data...</Typography>
      </Box>
    );
  }

  if (error && !hasPrivilege('approval_levels.read')) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "You do not have sufficient privileges to view this page."}</Alert>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          Approval Levels Management
        </Typography>
        {hasPrivilege('approval_levels.create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateLevelDialog}
            sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' }, color: 'white', fontWeight: 'semibold', borderRadius: '8px' }}
          >
            Add New Level
          </Button>
        )}
      </Box>

      {approvalLevels.length === 0 ? (
        <Alert severity="info">No approval levels found. Add a new level to get started.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden', boxShadow: theme.shadows[2] }}>
          <Table aria-label="approval levels table">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Level Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Assigned Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Approval Order</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvalLevels.map((level) => (
                <TableRow key={level.levelId} sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover } }}>
                  <TableCell>{level.levelName}</TableCell>
                  <TableCell>{roles.find(r => r.roleId === level.roleId)?.roleName || 'N/A'}</TableCell>
                  <TableCell>{level.approvalOrder}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {hasPrivilege('approval_levels.update') && (
                        <Tooltip title="Edit Level">
                          <IconButton color="primary" onClick={() => handleOpenEditLevelDialog(level)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {hasPrivilege('approval_levels.delete') && (
                        <Tooltip title="Delete Level">
                          <IconButton color="error" onClick={() => handleOpenDeleteConfirm(level)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
          <FormControl fullWidth margin="dense" variant="outlined" error={!!levelFormErrors.roleId} sx={{ mb: 2 }}>
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

      <DeleteConfirmDialog
        open={openDeleteConfirmDialog}
        onClose={() => setOpenDeleteConfirmDialog(false)}
        onConfirm={handleConfirmDelete}
        itemToDeleteName={itemToDelete?.name || ''}
        itemType="Approval Level"
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

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

ApprovalLevelsManagementPage.propTypes = {
    // No props for this page component
};

export default ApprovalLevelsManagementPage;