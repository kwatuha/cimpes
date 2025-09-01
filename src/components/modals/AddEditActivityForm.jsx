import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Select, MenuItem, FormControl, InputLabel,
    Stack, Chip, Tooltip, OutlinedInput, Checkbox, ListItemText, FormHelperText,
    Typography, IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../pages/dashboard/theme';
import { Close as CloseIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

const AddEditActivityForm = ({ open, onClose, onSubmit, initialData, milestones, staff, isEditing }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [formData, setFormData] = useState(initialData);
    const [formErrors, setFormErrors] = useState({});

    // Reset form and errors when modal opens or initialData changes
    useEffect(() => {
        setFormData(initialData);
        if (open) {
            setFormErrors({});
        }
    }, [initialData, open]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const handleMilestoneChange = (event) => {
        const { value } = event.target;
        setFormData(prev => ({
            ...prev,
            milestoneIds: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.activityName || formData.activityName.trim() === '') {
            errors.activityName = 'Activity name is required.';
        }
        if (!formData.responsibleOfficer) {
            errors.responsibleOfficer = 'Responsible officer is required.';
        }
        if (!formData.startDate) {
            errors.startDate = 'Start date is required.';
        }
        if (!formData.endDate) {
            errors.endDate = 'End date is required.';
        }
        if (!formData.budgetAllocated) {
            errors.budgetAllocated = 'Budget is required.';
        }
        if (!formData.activityStatus) {
            errors.activityStatus = 'Status is required.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const workplanName = initialData.selectedWorkplanName;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    boxShadow: theme.palette.mode === 'light' 
                        ? `0 8px 32px ${colors.blueAccent[100]}40, 0 4px 16px ${colors.blueAccent[100]}20`
                        : undefined,
                    border: theme.palette.mode === 'light' ? `1px solid ${colors.blueAccent[100]}` : 'none'
                }
            }}
        >
            <DialogTitle sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : colors.blueAccent[600],
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pr: 1,
                boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.blueAccent[100]}40` : 'none'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isEditing ? (
                        <EditIcon sx={{ fontSize: '1.5rem' }} />
                    ) : (
                        <AddIcon sx={{ fontSize: '1.5rem' }} />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {isEditing ? 'Edit Activity' : 'Add New Activity'}
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: 'white',
                        '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : colors.grey[50],
                p: 3
            }}>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    {workplanName && (
                        <Box sx={{ 
                            p: 2.5, 
                            bgcolor: theme.palette.mode === 'dark' ? theme.palette.action.hover : colors.blueAccent[50],
                            borderRadius: '8px',
                            border: theme.palette.mode === 'light' ? `1px solid ${colors.blueAccent[200]}` : 'none',
                            boxShadow: theme.palette.mode === 'light' ? `0 1px 4px ${colors.blueAccent[100]}30` : 'none'
                        }}>
                            <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.blueAccent[700],
                                fontWeight: 500,
                                textAlign: 'center'
                            }}>
                                This activity will be added to the work plan: <strong>{workplanName}</strong>
                            </Typography>
                        </Box>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        name="activityName"
                        label="Activity Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.activityName}
                        onChange={handleChange}
                        error={!!formErrors.activityName}
                        helperText={formErrors.activityName}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="activityDescription"
                        label="Activity Description"
                        multiline
                        rows={3}
                        fullWidth
                        variant="outlined"
                        value={formData.activityDescription}
                        onChange={handleChange}
                    />
                    <FormControl fullWidth margin="dense" variant="outlined" error={!!formErrors.responsibleOfficer}>
                        <InputLabel id="responsible-officer-label">Responsible Officer</InputLabel>
                        <Select
                            labelId="responsible-officer-label"
                            name="responsibleOfficer"
                            value={formData.responsibleOfficer || ''}
                            onChange={handleChange}
                            label="Responsible Officer"
                            required
                        >
                            {staff.map((s) => (
                                <MenuItem key={s.userId} value={s.userId}>
                                    {s.firstName} {s.lastName}
                                </MenuItem>
                            ))}
                        </Select>
                        {formErrors.responsibleOfficer && <FormHelperText>{formErrors.responsibleOfficer}</FormHelperText>}
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            margin="dense"
                            name="startDate"
                            label="Start Date"
                            type="date"
                            fullWidth
                            variant="outlined"
                            value={formData.startDate}
                            onChange={handleChange}
                            error={!!formErrors.startDate}
                            helperText={formErrors.startDate}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="endDate"
                            label="End Date"
                            type="date"
                            fullWidth
                            variant="outlined"
                            value={formData.endDate}
                            onChange={handleChange}
                            error={!!formErrors.endDate}
                            helperText={formErrors.endDate}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Box>
                    <TextField
                        margin="dense"
                        name="budgetAllocated"
                        label="Budget Allocated (KES)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.budgetAllocated || ''}
                        onChange={handleChange}
                        error={!!formErrors.budgetAllocated}
                        helperText={formErrors.budgetAllocated}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="actualCost"
                        label="Actual Cost (KES)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.actualCost || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="percentageComplete"
                        label="Percentage Complete (%)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.percentageComplete || ''}
                        onChange={handleChange}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                    />
                    <FormControl fullWidth margin="dense" variant="outlined" error={!!formErrors.activityStatus}>
                        <InputLabel id="activity-status-label">Status</InputLabel>
                        <Select
                            labelId="activity-status-label"
                            name="activityStatus"
                            value={formData.activityStatus}
                            onChange={handleChange}
                            label="Status"
                            required
                        >
                            <MenuItem value="not_started">Not Started</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="on_hold">On Hold</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                        {formErrors.activityStatus && <FormHelperText>{formErrors.activityStatus}</FormHelperText>}
                    </FormControl>

                    <FormControl fullWidth margin="dense" variant="outlined">
                        <InputLabel id="milestone-multi-select-label">Link Milestones</InputLabel>
                        <Select
                            labelId="milestone-multi-select-label"
                            multiple
                            name="milestoneIds"
                            value={formData.milestoneIds || []}
                            onChange={handleMilestoneChange}
                            input={<OutlinedInput id="select-multiple-chip" label="Link Milestones" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={milestones.find(m => m.milestoneId === value)?.milestoneName || value} />
                                    ))}
                                </Box>
                            )}
                        >
                            {milestones.map((milestone) => (
                                <MenuItem key={milestone.milestoneId} value={milestone.milestoneId}>
                                    <Checkbox checked={formData.milestoneIds.indexOf(milestone.milestoneId) > -1} />
                                    <ListItemText primary={milestone.milestoneName} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ 
                padding: '20px 24px', 
                borderTop: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : colors.grey[200]}`,
                backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : colors.grey[50],
                gap: 2
            }}>
                <Button 
                    onClick={onClose} 
                    variant="outlined"
                    sx={{
                        borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400],
                        color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[600],
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        '&:hover': {
                            borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[500],
                            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[100],
                            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.blueAccent[700]
                        },
                        boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.blueAccent[100]}30` : 'none',
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? colors.greenAccent[600] : colors.greenAccent[500],
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? colors.greenAccent[700] : colors.greenAccent[600],
                            transform: 'translateY(-1px)',
                            boxShadow: theme.palette.mode === 'light' ? `0 4px 12px ${colors.greenAccent[100]}50` : 'none'
                        },
                        boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.greenAccent[100]}40` : 'none',
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    {isEditing ? 'Update Activity' : 'Create Activity'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddEditActivityForm;