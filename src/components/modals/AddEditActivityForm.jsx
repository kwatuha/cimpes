import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Select, MenuItem, FormControl, InputLabel,
    Stack, Chip, Tooltip, OutlinedInput, Checkbox, ListItemText, FormHelperText,
    Typography // Fix: Added missing import
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AddEditActivityForm = ({ open, onClose, onSubmit, initialData, milestones, staff, isEditing }) => {
    const theme = useTheme();

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
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
                {isEditing ? 'Edit Activity' : 'Add New Activity'}
            </DialogTitle>
            <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default }}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {workplanName && (
                        <Box sx={{ p: 2, bgcolor: theme.palette.action.hover, borderRadius: '4px' }}>
                            <Typography variant="body2" color="text.secondary">
                                This activity will be added to the work plan: **{workplanName}**.
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
            <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">{isEditing ? 'Update Activity' : 'Create Activity'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddEditActivityForm;