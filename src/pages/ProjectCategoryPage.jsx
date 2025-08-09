import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton,
  Alert, Snackbar, Stack, Collapse, Accordion, AccordionSummary, AccordionDetails,
  Grid, useTheme
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../api/metaDataService.js';
import useProjectCategoryData from '../hooks/useProjectCategoryData.jsx'; // NEW: Custom hook for data logic

// Reusable Delete Confirmation Dialog
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

const ProjectCategoryPage = () => {
  const { hasPrivilege } = useAuth();
  const theme = useTheme();
  
  // Custom hook for data fetching and state
  const {
    projectCategories, loading, setLoading, snackbar, setSnackbar,
    fetchCategoriesAndMilestones,
  } = useProjectCategoryData();

  // Centralized State for Dialogs and Forms
  const [dialogState, setDialogState] = useState({
    openCategoryDialog: false,
    openMilestoneDialog: false,
    openDeleteConfirmDialog: false,
    currentCategoryToEdit: null,
    currentMilestoneToEdit: null,
    categoryFormData: { categoryName: '', description: '' },
    milestoneFormData: { categoryId: null, milestoneName: '', description: '', sequenceOrder: '' },
    itemToDelete: null, // { id, name, type: 'category' | 'milestone' }
    categoryFormErrors: {},
    milestoneFormErrors: {}
  });

  const {
    openCategoryDialog, openMilestoneDialog, openDeleteConfirmDialog,
    currentCategoryToEdit, currentMilestoneToEdit,
    categoryFormData, milestoneFormData, itemToDelete,
    categoryFormErrors, milestoneFormErrors
  } = dialogState;

  const setDialogStateValue = (key, value) => {
    setDialogState(prev => ({ ...prev, [key]: value }));
  };

  // --- Category Handlers ---
  const handleOpenCreateCategoryDialog = () => {
    if (!hasPrivilege('projectcategory.create')) {
      setSnackbar({ open: true, message: "Permission denied to create categories.", severity: 'error' });
      return;
    }
    setDialogStateValue('currentCategoryToEdit', null);
    setDialogStateValue('categoryFormData', { categoryName: '', description: '' });
    setDialogStateValue('categoryFormErrors', {});
    setDialogStateValue('openCategoryDialog', true);
  };

  const handleOpenEditCategoryDialog = (category) => {
    if (!hasPrivilege('projectcategory.update')) {
      setSnackbar({ open: true, message: "Permission denied to update categories.", severity: 'error' });
      return;
    }
    setDialogStateValue('currentCategoryToEdit', category);
    setDialogStateValue('categoryFormData', { categoryName: category.categoryName, description: category.description });
    setDialogStateValue('categoryFormErrors', {});
    setDialogStateValue('openCategoryDialog', true);
  };

  const handleCategoryFormChange = (e) => {
    setDialogState(prev => ({ ...prev, categoryFormData: { ...prev.categoryFormData, [e.target.name]: e.target.value } }));
  };

  const validateCategoryForm = () => {
    let errors = {};
    if (!categoryFormData.categoryName) errors.categoryName = 'Category Name is required.';
    setDialogStateValue('categoryFormErrors', errors);
    return Object.keys(errors).length === 0;
  };

  const handleCategorySubmit = async () => {
    if (!validateCategoryForm()) {
      setSnackbar({ open: true, message: 'Please correct the form errors.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      if (currentCategoryToEdit) {
        await apiService.projectCategories.updateCategory(currentCategoryToEdit.categoryId, categoryFormData);
        setSnackbar({ open: true, message: 'Category updated successfully!', severity: 'success' });
      } else {
        await apiService.projectCategories.createCategory(categoryFormData);
        setSnackbar({ open: true, message: 'Category created successfully!', severity: 'success' });
      }
      setDialogStateValue('openCategoryDialog', false);
      fetchCategoriesAndMilestones();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to save category.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Milestone Handlers ---
  const handleOpenCreateMilestoneDialog = (categoryId) => {
    if (!hasPrivilege('categorymilestone.create')) {
      setSnackbar({ open: true, message: "Permission denied to create milestones.", severity: 'error' });
      return;
    }
    setDialogStateValue('currentMilestoneToEdit', null);
    setDialogStateValue('milestoneFormData', { categoryId, milestoneName: '', description: '', sequenceOrder: '' });
    setDialogStateValue('milestoneFormErrors', {});
    setDialogStateValue('openMilestoneDialog', true);
  };
  
  const handleOpenEditMilestoneDialog = (milestone) => {
    if (!hasPrivilege('categorymilestone.update')) {
      setSnackbar({ open: true, message: "Permission denied to update milestones.", severity: 'error' });
      return;
    }
    setDialogStateValue('currentMilestoneToEdit', milestone);
    setDialogStateValue('milestoneFormData', {
      categoryId: milestone.categoryId,
      milestoneName: milestone.milestoneName,
      description: milestone.description,
      sequenceOrder: milestone.sequenceOrder
    });
    setDialogStateValue('milestoneFormErrors', {});
    setDialogStateValue('openMilestoneDialog', true);
  };

  // NEW: Function to close the milestone dialog and reset its state
  const handleCloseMilestoneDialog = () => {
    setDialogStateValue('openMilestoneDialog', false);
    setDialogStateValue('currentMilestoneToEdit', null);
    setDialogStateValue('milestoneFormErrors', {});
  };
  
  const handleMilestoneFormChange = (e) => {
      const { name, value } = e.target;
      setDialogState(prev => ({ ...prev, milestoneFormData: { ...prev.milestoneFormData, [name]: value } }));
  };

  const validateMilestoneForm = () => {
    let errors = {};
    if (!milestoneFormData.milestoneName) errors.milestoneName = 'Milestone Name is required.';
    if (!milestoneFormData.sequenceOrder) errors.sequenceOrder = 'Sequence Order is required.';
    setDialogStateValue('milestoneFormErrors', errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleMilestoneSubmit = async () => {
    if (!validateMilestoneForm()) {
      setSnackbar({ open: true, message: 'Please correct the form errors.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const { categoryId, ...milestoneDataToSubmit } = milestoneFormData;
      if (currentMilestoneToEdit) {
        await apiService.projectCategories.updateMilestone(categoryId, currentMilestoneToEdit.milestoneId, milestoneDataToSubmit);
        setSnackbar({ open: true, message: 'Milestone updated successfully!', severity: 'success' });
      } else {
        await apiService.projectCategories.createMilestone(categoryId, milestoneDataToSubmit);
        setSnackbar({ open: true, message: 'Milestone created successfully!', severity: 'success' });
      }
      handleCloseMilestoneDialog();
      fetchCategoriesAndMilestones();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to save milestone.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Handlers ---
  const handleOpenDeleteConfirm = (item, type) => {
    if (type === 'category' && !hasPrivilege('projectcategory.delete')) {
      setSnackbar({ open: true, message: "Permission denied to delete categories.", severity: 'error' });
      return;
    }
    if (type === 'milestone' && !hasPrivilege('categorymilestone.delete')) {
      setSnackbar({ open: true, message: "Permission denied to delete milestones.", severity: 'error' });
      return;
    }
    setDialogStateValue('itemToDelete', { id: item.categoryId || item.milestoneId, name: item.categoryName || item.milestoneName, type });
    setDialogStateValue('openDeleteConfirmDialog', true);
  };
  
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    setDialogStateValue('openDeleteConfirmDialog', false);
    try {
      if (itemToDelete.type === 'category') {
        await apiService.projectCategories.deleteCategory(itemToDelete.id);
        setSnackbar({ open: true, message: 'Category deleted successfully!', severity: 'success' });
      } else if (itemToDelete.type === 'milestone') {
        await apiService.projectCategories.deleteMilestone(currentMilestoneToEdit.categoryId, itemToDelete.id);
        setSnackbar({ open: true, message: 'Milestone deleted successfully!', severity: 'success' });
      }
      fetchCategoriesAndMilestones();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || `Failed to delete ${itemToDelete.type}.`, severity: 'error' });
    } finally {
      setLoading(false);
      setDialogStateValue('itemToDelete', null);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading && projectCategories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          Project Category Management
        </Typography>
        {hasPrivilege('projectcategory.create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateCategoryDialog}
            sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' }, color: 'white', fontWeight: 'semibold', borderRadius: '8px' }}
          >
            Add New Category
          </Button>
        )}
      </Box>

      {projectCategories.length === 0 ? (
        <Alert severity="info">No categories found. Add a new category to get started.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden', boxShadow: theme.shadows[2] }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectCategories.map((category) => (
                <TableRow key={category.categoryId}>
                  <TableCell colSpan={2} sx={{ p: 0, borderBottom: 'none' }}>
                    <Accordion sx={{ boxShadow: 'none', '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover } }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Grid container alignItems="center">
                          <Grid item xs={8}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{category.categoryName}</Typography>
                              <Typography variant="caption" color="text.secondary">{category.description}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {hasPrivilege('projectcategory.update') && (
                              <IconButton onClick={(e) => { e.stopPropagation(); handleOpenEditCategoryDialog(category); }} color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {hasPrivilege('projectcategory.delete') && (
                              <IconButton onClick={(e) => { e.stopPropagation(); handleOpenDeleteConfirm(category, 'category'); }} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      </AccordionSummary>
                      <AccordionDetails sx={{ py: 1 }}>
                        <Box sx={{ pl: 4, pr: 2, pt: 2, pb: 4 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Milestone Templates for {category.categoryName}</Typography>
                            {hasPrivilege('categorymilestone.create') && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() => handleOpenCreateMilestoneDialog(category.categoryId)}
                                >
                                  Add Milestone
                                </Button>
                            )}
                          </Box>
                          <TableContainer component={Paper} sx={{ mb: 2, boxShadow: theme.shadows[1] }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: theme.palette.secondary.main }}>
                                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Order</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Milestone Name</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Description</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {category.milestones.map((milestone) => (
                                  <TableRow key={milestone.milestoneId}>
                                    <TableCell>{milestone.sequenceOrder}</TableCell>
                                    <TableCell>{milestone.milestoneName}</TableCell>
                                    <TableCell>{milestone.description}</TableCell>
                                    <TableCell align="right">
                                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        {hasPrivilege('categorymilestone.update') && (
                                          <IconButton onClick={() => handleOpenEditMilestoneDialog(milestone)} color="primary">
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        )}
                                        {hasPrivilege('categorymilestone.delete') && (
                                          <IconButton onClick={() => handleOpenDeleteConfirm(milestone, 'milestone')} color="error">
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        )}
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setDialogStateValue('openCategoryDialog', false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
          {currentCategoryToEdit ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default }}>
          <TextField
            autoFocus
            margin="dense"
            name="categoryName"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={categoryFormData.categoryName}
            onChange={handleCategoryFormChange}
            error={!!categoryFormErrors.categoryName}
            helperText={categoryFormErrors.categoryName}
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
            value={categoryFormData.description}
            onChange={handleCategoryFormChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setDialogStateValue('openCategoryDialog', false)} color="primary" variant="outlined">Cancel</Button>
          <Button onClick={handleCategorySubmit} color="primary" variant="contained">{currentCategoryToEdit ? 'Update Category' : 'Create Category'}</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Milestone Dialog */}
      <Dialog open={openMilestoneDialog} onClose={handleCloseMilestoneDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
          {currentMilestoneToEdit ? 'Edit Milestone Template' : 'Add New Milestone Template'}
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default }}>
          <TextField
            autoFocus
            margin="dense"
            name="milestoneName"
            label="Milestone Name"
            type="text"
            fullWidth
            variant="outlined"
            value={milestoneFormData.milestoneName}
            onChange={handleMilestoneFormChange}
            error={!!milestoneFormErrors.milestoneName}
            helperText={milestoneFormErrors.milestoneName}
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
            value={milestoneFormData.description}
            onChange={handleMilestoneFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="sequenceOrder"
            label="Sequence Order"
            type="number"
            fullWidth
            variant="outlined"
            value={milestoneFormData.sequenceOrder}
            onChange={handleMilestoneFormChange}
            error={!!milestoneFormErrors.sequenceOrder}
            helperText={milestoneFormErrors.sequenceOrder}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleCloseMilestoneDialog} color="primary" variant="outlined">Cancel</Button>
          <Button onClick={handleMilestoneSubmit} color="primary" variant="contained">{currentMilestoneToEdit ? 'Update Milestone' : 'Create Milestone'}</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={openDeleteConfirmDialog}
        onClose={() => setDialogStateValue('openDeleteConfirmDialog', false)}
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

export default ProjectCategoryPage;
