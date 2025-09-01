import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, TextField, Alert, CircularProgress,
  Stack, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../pages/dashboard/theme';
import {
  Close as CloseIcon, Add as AddIcon, Monitor as MonitorIcon
} from '@mui/icons-material';
import apiService from '../api';
import { useAuth } from '../context/AuthContext';








const ProjectMonitoringComponent = ({ open, onClose, projectId, editRecord, onEditComplete }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { hasPrivilege } = useAuth();

  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState({
    comment: '',
    recommendations: '',
    challenges: '',
    warningLevel: 'None',
    isRoutineObservation: true,
  });
  const [isEditing, setIsEditing] = useState(false);


  const warningLevels = ['None', 'Low', 'Medium', 'High'];

  // Handle editRecord changes
  useEffect(() => {
    if (editRecord) {
      setFormState({
        comment: editRecord.comment || '',
        recommendations: editRecord.recommendations || '',
        challenges: editRecord.challenges || '',
        warningLevel: editRecord.warningLevel || 'None',
        isRoutineObservation: editRecord.isRoutineObservation === 1 || editRecord.isRoutineObservation === true,
      });
      setIsEditing(true);
    } else {
      handleClearForm();
      setIsEditing(false);
    }
  }, [editRecord]);

  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClearForm = () => {
    setFormState({
      comment: '',
      recommendations: '',
      challenges: '',
      warningLevel: 'None',
      isRoutineObservation: true,
    });
  };

  const handleFormSubmit = async (e) => {
      e.preventDefault();
      if (isEditing) {
        if (!hasPrivilege('project_monitoring.update')) {
          setError("You don't have permission to update records.");
          return;
        }
      } else {
        if (!hasPrivilege('project_monitoring.create')) {
          setError("You don't have permission to create records.");
          return;
        }
      }
      

      
      setSubmitting(true);
      setError(null);

      const dataToSubmit = {
        ...formState,
        isRoutineObservation: formState.isRoutineObservation ? 1 : 0
      };

      try {
        if (isEditing && editRecord) {
          await apiService.projectMonitoring.updateRecord(projectId, editRecord.recordId, dataToSubmit);
          if (onEditComplete) onEditComplete();
        } else {
          await apiService.projectMonitoring.createRecord(projectId, dataToSubmit);
        }
        handleClearForm();
        setIsEditing(false);
        onClose(); // Close the modal after successful submission
      } catch (err) {
        console.error('Submission Error:', err);
        setError(err.response?.data?.message || err.msg || 'Failed to save record. Please try again.');
      } finally {
        setSubmitting(false);
      }
  };







  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
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
          <MonitorIcon sx={{ fontSize: '1.5rem' }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            fontSize: '1.25rem',
            letterSpacing: '0.5px'
          }}>
            Project Monitoring & Observations
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
        {/* Input Form */}
        <Box component="form" onSubmit={handleFormSubmit} sx={{ mb: 4 }}>
          <Stack spacing={3}>
            <TextField
              name="comment"
              label="Observation / Progress Comment"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={formState.comment}
              onChange={handleFormChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
                  fontWeight: 500,
                  fontSize: '0.95rem'
                },
                '& .MuiOutlinedInput-input': {
                  color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800],
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  lineHeight: 1.5
                }
              }}
            />
            <TextField
              name="recommendations"
              label="Recommendations"
              multiline
              rows={2}
              fullWidth
              variant="outlined"
              value={formState.recommendations}
              onChange={handleFormChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
                  fontWeight: 500,
                  fontSize: '0.95rem'
                },
                '& .MuiOutlinedInput-input': {
                  color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800],
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  lineHeight: 1.5
                }
              }}
            />
            <TextField
              name="challenges"
              label="Challenges Encountered"
              multiline
              rows={2}
              fullWidth
              variant="outlined"
              value={formState.challenges}
              onChange={handleFormChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
                  fontWeight: 500,
                  fontSize: '0.95rem'
                },
                '& .MuiOutlinedInput-input': {
                  color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800],
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  lineHeight: 1.5
                }
              }}
            />
            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel id="warning-level-label" sx={{
                color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
                fontWeight: 500,
                fontSize: '0.95rem'
              }}>Warning Level</InputLabel>
              <Select
                labelId="warning-level-label"
                name="warningLevel"
                value={formState.warningLevel}
                label="Warning Level"
                onChange={handleFormChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                    }
                  },
                  '& .MuiSelect-select': {
                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800],
                    fontSize: '0.95rem',
                    fontWeight: 400
                  }
                }}
              >
                {warningLevels.map(level => (
                  <MenuItem key={level} value={level} sx={{
                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800],
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[100]
                    }
                  }}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox
                  name="isRoutineObservation"
                  checked={formState.isRoutineObservation}
                  onChange={handleFormChange}
                  sx={{
                    color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[600],
                    '&.Mui-checked': {
                      color: theme.palette.mode === 'dark' ? colors.blueAccent[400] : colors.blueAccent[500]
                    }
                  }}
                />
              }
              label={
                <Typography sx={{
                  color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}>
                  Mark as Routine Observation
                </Typography>
              }
            />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={<AddIcon />} 
                disabled={submitting}
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
                {submitting ? <CircularProgress size={24} /> : (isEditing ? 'Update Record' : 'Add Record')}
              </Button>
              
              {isEditing && (
                <Button 
                  onClick={() => {
                    handleClearForm();
                    setIsEditing(false);
                  }} 
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
                  Cancel Edit
                </Button>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ 
            borderRadius: '8px',
            mb: 3,
            '& .MuiAlert-icon': {
              color: theme.palette.mode === 'dark' ? undefined : colors.redAccent[600]
            },
            '& .MuiAlert-message': {
              color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800],
              fontSize: '0.95rem',
              fontWeight: 500
            }
          }}>{error}</Alert>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default ProjectMonitoringComponent;