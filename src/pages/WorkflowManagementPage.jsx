import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, Stack, useTheme,
  OutlinedInput, Chip, List, ListItem, ListItemText, Tooltip
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Settings as SettingsIcon, Reorder as ReorderIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { DataGrid } from '@mui/x-data-grid'; // Added DataGrid import
import apiService from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import PropTypes from 'prop-types';
import { tokens } from './dashboard/theme'; // Added tokens import for dark mode consistency

const snakeToCamelCase = (obj) => {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(v => snakeToCamelCase(v));
    }
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            newObj[camelKey] = snakeToCamelCase(obj[key]);
        }
    }
    return newObj;
};

function WorkflowManagementPage() {
    const { hasPrivilege } = useAuth();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [workflows, setWorkflows] = useState([]);
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Workflow Management States
    const [openWorkflowDialog, setOpenWorkflowDialog] = useState(false);
    const [currentWorkflowToEdit, setCurrentWorkflowToEdit] = useState(null);
    const [workflowFormData, setWorkflowFormData] = useState({
        workflowName: '',
        description: '',
    });
    const [workflowFormErrors, setWorkflowFormErrors] = useState({});

    // Stages Management States
    const [openStageDialog, setOpenStageDialog] = useState(false);
    const [openAddEditStageDialog, setOpenAddEditStageDialog] = useState(false);
    const [currentStageToEdit, setCurrentStageToEdit] = useState(null);
    const [stageFormData, setStageFormData] = useState({
        stageName: '',
        description: '',
    });
    const [stageFormErrors, setStageFormErrors] = useState({});

    // Workflow Steps Management States
    const [openStepsDialog, setOpenStepsDialog] = useState(false);
    const [currentWorkflowSteps, setCurrentWorkflowSteps] = useState([]);
    const [selectedWorkflowForSteps, setSelectedWorkflowForSteps] = useState(null);

    const fetchWorkflows = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (hasPrivilege('project_workflow.read')) {
                const data = await apiService.workflow.getAllWorkflows();
                setWorkflows(data);
            } else {
                setError("You do not have permission to view workflows.");
                setWorkflows([]);
            }
        } catch (err) {
            console.error('Error fetching workflows:', err);
            setError(err.message || "Failed to load workflows.");
        } finally {
            setLoading(false);
        }
    }, [hasPrivilege]);

    const fetchStages = useCallback(async () => {
        try {
            if (hasPrivilege('project_stage.read')) {
                const data = await apiService.workflow.getAllStages();
                setStages(data);
            } else {
                setStages([]);
            }
        } catch (err) {
            console.error('Error fetching stages:', err);
            setSnackbar({ open: true, message: `Failed to load stages: ${err.message}`, severity: 'error' });
        }
    }, [hasPrivilege]);

    useEffect(() => {
        fetchWorkflows();
        fetchStages();
    }, [fetchWorkflows, fetchStages]);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // --- Workflow Handlers ---
    const handleOpenCreateWorkflowDialog = () => {
        setCurrentWorkflowToEdit(null);
        setWorkflowFormData({ workflowName: '', description: '' });
        setWorkflowFormErrors({});
        setOpenWorkflowDialog(true);
    };

    const handleOpenEditWorkflowDialog = (workflow) => {
        setCurrentWorkflowToEdit(workflow);
        setWorkflowFormData({
            workflowName: workflow.workflowName || '',
            description: workflow.description || '',
        });
        setWorkflowFormErrors({});
        setOpenWorkflowDialog(true);
    };

    const handleCloseWorkflowDialog = () => {
        setOpenWorkflowDialog(false);
        setCurrentWorkflowToEdit(null);
        setWorkflowFormErrors({});
    };

    const handleWorkflowFormChange = (e) => {
        const { name, value } = e.target;
        setWorkflowFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateWorkflowForm = () => {
        let errors = {};
        if (!workflowFormData.workflowName.trim()) errors.workflowName = 'Workflow name is required.';
        setWorkflowFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleWorkflowSubmit = async () => {
        if (!validateWorkflowForm()) {
            setSnackbar({ open: true, message: 'Please correct the form errors.', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            if (currentWorkflowToEdit) {
                if (!hasPrivilege('project_workflow.update')) {
                    setSnackbar({ open: true, message: 'Permission denied to update workflow.', severity: 'error' });
                    return;
                }
                await apiService.workflow.updateWorkflow(currentWorkflowToEdit.workflowId, workflowFormData);
                setSnackbar({ open: true, message: 'Workflow updated successfully!', severity: 'success' });
            } else {
                if (!hasPrivilege('project_workflow.create')) {
                    setSnackbar({ open: true, message: 'Permission denied to create workflow.', severity: 'error' });
                    return;
                }
                await apiService.workflow.createWorkflow(workflowFormData);
                setSnackbar({ open: true, message: 'Workflow created successfully!', severity: 'success' });
            }
            handleCloseWorkflowDialog();
            fetchWorkflows();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save workflow.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWorkflow = async (workflowId, workflowName) => {
        if (!hasPrivilege('project_workflow.delete')) {
            setSnackbar({ open: true, message: 'Permission denied to delete workflows.', severity: 'error' });
            return;
        }
        if (window.confirm(`Are you sure you want to delete workflow "${workflowName}"? This action cannot be undone.`)) {
            setLoading(true);
            try {
                await apiService.workflow.deleteWorkflow(workflowId);
                setSnackbar({ open: true, message: 'Workflow deleted successfully!', severity: 'success' });
                fetchWorkflows();
            } catch (err) {
                setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete workflow.', severity: 'error' });
            } finally {
                setLoading(false);
            }
        }
    };

    // --- Stages Handlers ---
    const handleOpenCreateStageDialog = () => {
        setCurrentStageToEdit(null);
        setStageFormData({ stageName: '', description: '' });
        setStageFormErrors({});
        setOpenAddEditStageDialog(true);
    };

    const handleOpenEditStageDialog = (stage) => {
        setCurrentStageToEdit(stage);
        setStageFormData({
            stageName: stage.stageName || '',
            description: stage.description || '',
        });
        setStageFormErrors({});
        setOpenAddEditStageDialog(true);
    };

    const handleCloseAddEditStageDialog = () => {
        setOpenAddEditStageDialog(false);
        setCurrentStageToEdit(null);
        setStageFormErrors({});
    };

    const handleCloseMainStageDialog = () => {
        setOpenStageDialog(false);
    };

    const handleStageFormChange = (e) => {
        const { name, value } = e.target;
        setStageFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStageForm = () => {
        let errors = {};
        if (!stageFormData.stageName.trim()) errors.stageName = 'Stage name is required.';
        setStageFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleStageSubmit = async () => {
        if (!validateStageForm()) {
            setSnackbar({ open: true, message: 'Please correct the form errors.', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            if (currentStageToEdit) {
                if (!hasPrivilege('project_stage.update')) {
                    setSnackbar({ open: true, message: 'Permission denied to update stage.', severity: 'error' });
                    return;
                }
                await apiService.workflow.updateStage(currentStageToEdit.stageId, stageFormData);
                setSnackbar({ open: true, message: 'Stage updated successfully!', severity: 'success' });
            } else {
                if (!hasPrivilege('project_stage.create')) {
                    setSnackbar({ open: true, message: 'Permission denied to create stage.', severity: 'error' });
                    return;
                }
                await apiService.workflow.createStage(stageFormData);
                setSnackbar({ open: true, message: 'Stage created successfully!', severity: 'success' });
            }
            handleCloseAddEditStageDialog();
            fetchStages();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save stage.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStage = async (stageId, stageName) => {
        if (!hasPrivilege('project_stage.delete')) {
            setSnackbar({ open: true, message: 'Permission denied to delete stages.', severity: 'error' });
            return;
        }
        if (window.confirm(`Are you sure you want to delete stage "${stageName}"? This will also remove it from any workflows.`)) {
            setLoading(true);
            try {
                await apiService.workflow.deleteStage(stageId);
                setSnackbar({ open: true, message: 'Stage deleted successfully!', severity: 'success' });
                fetchStages();
            } catch (err) {
                setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete stage.', severity: 'error' });
            } finally {
                setLoading(false);
            }
        }
    };

    // --- Workflow Steps Handlers ---
    const handleOpenStepsDialog = async (workflow) => {
        setSelectedWorkflowForSteps(workflow);
        setLoading(true);
        try {
            const data = await apiService.workflow.getWorkflowById(workflow.workflowId);
            const camelCaseSteps = data.steps.map(step => snakeToCamelCase(step));
            setCurrentWorkflowSteps(camelCaseSteps);
        } catch (err) {
            setSnackbar({ open: true, message: `Failed to load workflow steps: ${err.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
        setOpenStepsDialog(true);
    };

    const handleCloseStepsDialog = () => {
        setOpenStepsDialog(false);
        setSelectedWorkflowForSteps(null);
        setCurrentWorkflowSteps([]);
    };

    const handleAddStageToWorkflow = async (stageId) => {
        const nextOrder = currentWorkflowSteps.length > 0 ? Math.max(...currentWorkflowSteps.map(s => s.stepOrder)) + 1 : 1;
        setLoading(true);
        try {
            await apiService.workflow.addStepToWorkflow(selectedWorkflowForSteps.workflowId, { stageId, stepOrder: nextOrder });
            setSnackbar({ open: true, message: 'Stage added to workflow successfully!', severity: 'success' });
            const data = await apiService.workflow.getWorkflowById(selectedWorkflowForSteps.workflowId);
            const camelCaseSteps = data.steps.map(step => snakeToCamelCase(step));
            setCurrentWorkflowSteps(camelCaseSteps);
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to add step to workflow.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWorkflowStep = async (stepId) => {
        if (!hasPrivilege('project_workflow.delete')) {
            setSnackbar({ open: true, message: 'Permission denied to delete steps.', severity: 'error' });
            return;
        }
        setLoading(true);
        try {
            await apiService.workflow.deleteWorkflowStep(selectedWorkflowForSteps.workflowId, stepId);
            setSnackbar({ open: true, message: 'Workflow step deleted successfully!', severity: 'success' });
            const data = await apiService.workflow.getWorkflowById(selectedWorkflowForSteps.workflowId);
            const camelCaseSteps = data.steps.map(step => snakeToCamelCase(step));
            setCurrentWorkflowSteps(camelCaseSteps);
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete workflow step.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOnDragEnd = async (result) => {
        if (!result.destination) return;
        const items = Array.from(currentWorkflowSteps);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const newSteps = items.map((step, index) => ({ ...step, stepOrder: index + 1 }));
        setCurrentWorkflowSteps(newSteps);

        setLoading(true);
        try {
            await Promise.all(newSteps.map(step =>
                apiService.workflow.updateWorkflowStep(selectedWorkflowForSteps.workflowId, step.stepId, { stepOrder: step.stepOrder })
            ));
            setSnackbar({ open: true, message: 'Workflow order saved successfully!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to reorder workflow steps.', severity: 'error' });
            fetchWorkflows();
        } finally {
            setLoading(false);
        }
    };

    // DataGrid column definitions
    const workflowColumns = [
        { field: 'workflowId', headerName: 'ID', flex: 0.5, minWidth: 50 },
        { field: 'workflowName', headerName: 'Workflow Name', flex: 1.5, minWidth: 200 },
        { field: 'description', headerName: 'Description', flex: 2, minWidth: 250 },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Manage Steps">
                        <IconButton color="primary" onClick={() => handleOpenStepsDialog(params.row)}>
                            <ReorderIcon />
                        </IconButton>
                    </Tooltip>
                    {hasPrivilege('project_workflow.update') && (
                        <Tooltip title="Edit">
                            <IconButton color="primary" onClick={() => handleOpenEditWorkflowDialog(params.row)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    {hasPrivilege('project_workflow.delete') && (
                        <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => handleDeleteWorkflow(params.row.workflowId, params.row.workflowName)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            ),
        },
    ];

    if (loading && !error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading data...</Typography>
            </Box>
        );
    }

    if (error && !hasPrivilege('project_workflow.read')) {
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
                    Workflow Management
                </Typography>
                <Stack direction="row" spacing={2}>
                    {hasPrivilege('project_stage.create') && (
                        <Button
                            variant="outlined"
                            startIcon={<SettingsIcon />}
                            onClick={() => setOpenStageDialog(true)}
                            sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
                        >
                            Manage Stages
                        </Button>
                    )}
                    {hasPrivilege('project_workflow.create') && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreateWorkflowDialog}
                            sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' } }}
                        >
                            Add New Workflow
                        </Button>
                    )}
                </Stack>
            </Box>

            {workflows.length === 0 ? (
                <Alert severity="info">No workflows found. Add a new workflow to get started.</Alert>
            ) : (
                <Box
                    sx={{
                        height: 500, // Fixed height is required for DataGrid to work properly
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
                    <DataGrid
                        rows={workflows}
                        columns={workflowColumns}
                        getRowId={(row) => row.workflowId}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10, page: 0 },
                            },
                        }}
                        pageSizeOptions={[10, 25, 50]}
                    />
                </Box>
            )}

            {/* Workflow CRUD Dialog */}
            <Dialog open={openWorkflowDialog} onClose={handleCloseWorkflowDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
                    {currentWorkflowToEdit ? 'Edit Workflow' : 'Add New Workflow'}
                </DialogTitle>
                <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default }}>
                    <TextField autoFocus margin="dense" name="workflowName" label="Workflow Name" type="text" fullWidth variant="outlined" value={workflowFormData.workflowName} onChange={handleWorkflowFormChange} error={!!workflowFormErrors.workflowName} helperText={workflowFormErrors.workflowName} sx={{ mb: 2 }} />
                    <TextField margin="dense" name="description" label="Description" type="text" fullWidth multiline rows={2} variant="outlined" value={workflowFormData.description} onChange={handleWorkflowFormChange} sx={{ mb: 2 }} />
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button onClick={handleCloseWorkflowDialog} color="primary" variant="outlined">Cancel</Button>
                    <Button onClick={handleWorkflowSubmit} color="primary" variant="contained">{currentWorkflowToEdit ? 'Update Workflow' : 'Create Workflow'}</Button>
                </DialogActions>
            </Dialog>

            {/* Stages CRUD Dialog (Outer Dialog) */}
            <Dialog open={openStageDialog} onClose={handleCloseMainStageDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
                    Manage Project Stages
                </DialogTitle>
                <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Stages</Typography>
                        {hasPrivilege('project_stage.create') && (
                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateStageDialog}>
                                Add Stage
                            </Button>
                        )}
                    </Box>
                    <List>
                        {stages.map(stage => (
                            <ListItem
                                key={stage.stageId}
                                secondaryAction={
                                    <Stack direction="row" spacing={1}>
                                        {hasPrivilege('project_stage.update') && (
                                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditStageDialog(stage)}><EditIcon fontSize="small" /></IconButton>
                                        )}
                                        {hasPrivilege('project_stage.delete') && (
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteStage(stage.stageId, stage.stageName)}><DeleteIcon fontSize="small" /></IconButton>
                                        )}
                                    </Stack>
                                }
                            >
                                <ListItemText primary={stage.stageName} secondary={stage.description} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button onClick={handleCloseMainStageDialog} color="primary" variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Stage Dialog (Nested) */}
            <Dialog open={openAddEditStageDialog} onClose={handleCloseAddEditStageDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
                    {currentStageToEdit ? 'Edit Stage' : 'Add New Stage'}
                </DialogTitle>
                <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default }}>
                    <TextField autoFocus margin="dense" name="stageName" label="Stage Name" type="text" fullWidth variant="outlined" value={stageFormData.stageName} onChange={handleStageFormChange} error={!!stageFormErrors.stageName} helperText={stageFormErrors.stageName} sx={{ mb: 2 }} />
                    <TextField margin="dense" name="description" label="Description" type="text" fullWidth multiline rows={2} variant="outlined" value={stageFormData.description} onChange={handleStageFormChange} sx={{ mb: 2 }} />
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button onClick={handleCloseAddEditStageDialog} color="primary" variant="outlined">Cancel</Button>
                    <Button onClick={handleStageSubmit} color="primary" variant="contained">{currentStageToEdit ? 'Update Stage' : 'Create Stage'}</Button>
                </DialogActions>
            </Dialog>
            
            {/* Workflow Steps Dialog */}
            <Dialog open={openStepsDialog} onClose={handleCloseStepsDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
                    Manage Steps for: {selectedWorkflowForSteps?.workflowName}
                </DialogTitle>
                <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FormControl sx={{ flexGrow: 1, mr: 2, minWidth: 150 }}>
                            <InputLabel id="add-stage-label">Add a Stage</InputLabel>
                            <Select
                                labelId="add-stage-label"
                                label="Add a Stage"
                                onChange={(e) => handleAddStageToWorkflow(e.target.value)}
                                value=""
                            >
                                {stages.map(stage => (
                                    <MenuItem key={stage.stageId} value={stage.stageId}>
                                        {stage.stageName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="workflow-steps">
                            {(provided) => (
                                <List sx={{ width: '100%' }} {...provided.droppableProps} ref={provided.innerRef}>
                                    {currentWorkflowSteps.map((step, index) => (
                                        <Draggable key={step.stepId} draggableId={step.stepId.toString()} index={index}>
                                            {(provided) => (
                                                <Paper
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    elevation={2}
                                                    sx={{ my: 1, p: 2, border: `1px solid ${theme.palette.divider}`, cursor: 'grab' }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                Step {index + 1}: {step.stageName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                (Stage ID: {step.stageId})
                                                            </Typography>
                                                        </Box>
                                                        {hasPrivilege('project_workflow.delete') && (
                                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWorkflowStep(step.stepId)}>
                                                                <DeleteIcon color="error" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </Paper>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </List>
                            )}
                        </Droppable>
                    </DragDropContext>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button onClick={handleCloseStepsDialog} color="primary" variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

WorkflowManagementPage.propTypes = {
    // No props for this page component
};

export default WorkflowManagementPage;