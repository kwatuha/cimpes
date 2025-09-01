import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    CircularProgress, Alert, Box, Checkbox, FormControlLabel,
    Stack, Typography, Grid, IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../pages/dashboard/theme';
import { Close as CloseIcon, Add as AddIcon, Edit as EditIcon, Flag as FlagIcon } from '@mui/icons-material';
import apiService from '../../api';

const AddEditMilestoneModal = ({ isOpen, onClose, editedMilestone, projectId, onSave }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
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
        <Dialog 
            open={isOpen} 
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
                    <FlagIcon sx={{ fontSize: '1.3rem', color: colors.grey[100] }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {isEditing ? 'Edit Milestone' : 'Add New Milestone'}
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
            <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ 
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : colors.grey[50],
                    p: 3
                }}>
                    {error && <Alert severity="error" sx={{ 
                        mb: 3, 
                        borderRadius: '8px',
                        '& .MuiAlert-icon': {
                            color: theme.palette.mode === 'dark' ? undefined : colors.redAccent[600]
                        }
                    }}>{error}</Alert>}
                    <Stack spacing={3}>
                        <TextField
                            label="Milestone Name"
                            name="milestoneName"
                            fullWidth
                            variant="outlined"
                            value={formData.milestoneName}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                                    }
                                }
                            }}
                        />
                        <TextField
                            label="Description"
                            name="description"
                            multiline
                            rows={3}
                            fullWidth
                            variant="outlined"
                            value={formData.description}
                            onChange={handleChange}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                                    }
                                }
                            }}
                        />
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Due Date"
                          name="dueDate"
                          type="date"
                          fullWidth
                          variant="outlined"
                          value={formData.dueDate}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Sequence Order"
                          name="sequenceOrder"
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={formData.sequenceOrder}
                          onChange={handleChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Weight"
                          name="weight"
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={formData.weight}
                          onChange={handleChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Progress (%)"
                          name="progress"
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={formData.progress}
                          onChange={handleChange}
                          inputProps={{ min: 0, max: 100 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    </Stack>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="completed"
                            checked={formData.completed}
                            onChange={handleChange}
                            sx={{
                              color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[600],
                              '&.Mui-checked': {
                                color: theme.palette.mode === 'dark' ? colors.greenAccent[600] : colors.greenAccent[500]
                              }
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ 
                            color: theme.palette.mode === 'dark' ? 'text.primary' : colors.grey[700],
                            fontWeight: 500
                          }}>
                            Mark as Completed
                          </Typography>
                        }
                      />
                      {formData.completed && (
                        <TextField
                          label="Completion Date"
                          name="completedDate"
                          type="date"
                          fullWidth
                          variant="outlined"
                          value={formData.completedDate}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                              }
                            }
                          }}
                        />
                      )}
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
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
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
                            '&:disabled': {
                                backgroundColor: theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[400],
                                color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]
                            },
                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.greenAccent[100]}40` : 'none',
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
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