import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    CircularProgress, Alert, Box, Checkbox, FormControlLabel,
    Stack, Typography,Grid
} from '@mui/material';
import apiService from '../../api';

const AddEditMilestoneModal = ({ isOpen, onClose, editedMilestone, projectId, onSave }) => {
    const isEditing = !!editedMilestone;
    const [formData, setFormData] = useState({
        milestoneName: '',
        description: '',
        dueDate: '',
        completed: false,
        completedDate: '',
        sequenceOrder: '',
        progress: 0,
        weight: 1,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditing && editedMilestone) {
            setFormData({
                milestoneName: editedMilestone.milestoneName || '',
                description: editedMilestone.description || '',
                dueDate: editedMilestone.dueDate ? editedMilestone.dueDate.split('T')[0] : '',
                completed: editedMilestone.completed || false,
                completedDate: editedMilestone.completedDate ? editedMilestone.completedDate.split('T')[0] : '',
                sequenceOrder: editedMilestone.sequenceOrder || '',
                progress: editedMilestone.progress || 0,
                weight: editedMilestone.weight || 1,
            });
        } else {
            setFormData({
                milestoneName: '',
                description: '',
                dueDate: '',
                completed: false,
                completedDate: '',
                sequenceOrder: '',
                progress: 0,
                weight: 1,
            });
        }
    }, [isEditing, editedMilestone]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const validate = () => {
        if (!formData.milestoneName.trim()) {
            setError('Milestone Name is required.');
            return false;
        }
        if (!formData.dueDate) {
            setError('Due Date is required.');
            return false;
        }
        setError(null);
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const dataToSubmit = {
                ...formData,
                // Add the milestone ID to the data if editing
                ...(isEditing && { milestoneId: editedMilestone.milestoneId }),
                projectId: projectId,
                completedDate: formData.completed ? (formData.completedDate || new Date().toISOString().slice(0, 10)) : null
            };

            // Call onSave with a single argument, the full data object.
            await onSave(dataToSubmit);
            
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save milestone.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEditing ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        label="Milestone Name"
                        name="milestoneName"
                        fullWidth
                        margin="normal"
                        value={formData.milestoneName}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Description"
                        name="description"
                        multiline
                        rows={3}
                        fullWidth
                        margin="normal"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Due Date"
                          name="dueDate"
                          type="date"
                          fullWidth
                          margin="normal"
                          value={formData.dueDate}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Sequence Order"
                          name="sequenceOrder"
                          type="number"
                          fullWidth
                          margin="normal"
                          value={formData.sequenceOrder}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Weight"
                          name="weight"
                          type="number"
                          fullWidth
                          margin="normal"
                          value={formData.weight}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Progress (%)"
                          name="progress"
                          type="number"
                          fullWidth
                          margin="normal"
                          value={formData.progress}
                          onChange={handleChange}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      </Grid>
                    </Grid>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="completed"
                            checked={formData.completed}
                            onChange={handleChange}
                          />
                        }
                        label="Mark as Completed"
                      />
                      {formData.completed && (
                        <TextField
                          label="Completion Date"
                          name="completedDate"
                          type="date"
                          fullWidth
                          margin="normal"
                          value={formData.completedDate}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : (isEditing ? 'Save Changes' : 'Create Milestone')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

AddEditMilestoneModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editedMilestone: PropTypes.object,
  projectId: PropTypes.number,
  onSave: PropTypes.func.isRequired,
};

AddEditMilestoneModal.defaultProps = {
  editedMilestone: null,
  projectId: null,
};

export default AddEditMilestoneModal;