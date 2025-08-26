import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, TextField, Alert, CircularProgress,
  Stack, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Tooltip
} from '@mui/material';
import {
  Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon,
  Add as AddIcon, Warning as WarningIcon
} from '@mui/icons-material';
import apiService from '../api';
import { useAuth } from '../context/AuthContext';

// --- Reusable utility for warning level colors ---
const getWarningColor = (level) => {
  switch (level) {
    case 'High':
      return 'error';
    case 'Medium':
      return 'warning';
    case 'Low':
      return 'info';
    default:
      return 'success';
  }
};

const ProjectMonitoringComponent = ({ open, onClose, projectId }) => {
  const { user, hasPrivilege } = useAuth();
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState({
    comment: '',
    recommendations: '',
    challenges: '',
    warningLevel: 'None',
    isRoutineObservation: true,
  });
  const [currentRecord, setCurrentRecord] = useState(null);

  const warningLevels = ['None', 'Low', 'Medium', 'High'];

  const fetchRecords = useCallback(async () => {
    if (!projectId || !hasPrivilege('project_monitoring.read')) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.projectMonitoring.getRecordsByProject(projectId);
      setRecords(response);
    } catch (err) {
      console.error('Error fetching monitoring records:', err);
      setError('Failed to load monitoring records.');
    } finally {
      setLoading(false);
    }
  }, [projectId, hasPrivilege]);

  useEffect(() => {
    if (open) {
      fetchRecords();
    }
  }, [open, fetchRecords]);

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
    setCurrentRecord(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!hasPrivilege('project_monitoring.create')) {
      setError("You don't have permission to perform this action.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const dataToSubmit = {
      ...formState,
      isRoutineObservation: formState.isRoutineObservation ? 1 : 0
    };

    try {
      if (currentRecord) {
        if (!hasPrivilege('project_monitoring.update')) {
           setError("You don't have permission to update records.");
           return;
        }
        await apiService.projectMonitoring.updateRecord(projectId, currentRecord.recordId, dataToSubmit);
      } else {
        await apiService.projectMonitoring.createRecord(projectId, dataToSubmit);
      }
      handleClearForm();
      fetchRecords();
    } catch (err) {
      console.error('Submission Error:', err);
      setError(err.response?.data?.message || 'Failed to save record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRecord = (record) => {
    setFormState({
      comment: record.comment,
      recommendations: record.recommendations || '',
      challenges: record.challenges || '',
      warningLevel: record.warningLevel,
      isRoutineObservation: record.isRoutineObservation === 1,
    });
    setCurrentRecord(record);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!hasPrivilege('project_monitoring.delete')) {
      setError("You don't have permission to delete records.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await apiService.projectMonitoring.deleteRecord(projectId, recordId);
        fetchRecords();
      } catch (err) {
        console.error('Deletion Error:', err);
        setError(err.response?.data?.message || 'Failed to delete record.');
      }
    }
  };

  const formattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Project Monitoring & Observations
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Input Form */}
        <Box component="form" onSubmit={handleFormSubmit} sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <TextField
              name="comment"
              label="Observation / Progress Comment"
              multiline
              rows={4}
              fullWidth
              value={formState.comment}
              onChange={handleFormChange}
              required
            />
            <TextField
              name="recommendations"
              label="Recommendations"
              multiline
              rows={2}
              fullWidth
              value={formState.recommendations}
              onChange={handleFormChange}
            />
            <TextField
              name="challenges"
              label="Challenges Encountered"
              multiline
              rows={2}
              fullWidth
              value={formState.challenges}
              onChange={handleFormChange}
            />
            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel id="warning-level-label">Warning Level</InputLabel>
              <Select
                labelId="warning-level-label"
                name="warningLevel"
                value={formState.warningLevel}
                label="Warning Level"
                onChange={handleFormChange}
              >
                {warningLevels.map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : (currentRecord ? 'Update Record' : 'Add Record')}
              </Button>
              {currentRecord && (
                <Button onClick={handleClearForm} sx={{ ml: 2 }}>
                  Cancel Edit
                </Button>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Records Log */}
        <Typography variant="h6" gutterBottom>Observation History</Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <List sx={{ bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            {records.length > 0 ? (
              records.map((record, index) => (
                <ListItem
                  key={record.recordId}
                  divider={index < records.length - 1}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      {hasPrivilege('project_monitoring.update') && (
                        <Tooltip title="Edit Record">
                          <IconButton edge="end" aria-label="edit" onClick={() => handleEditRecord(record)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {hasPrivilege('project_monitoring.delete') && (
                        <Tooltip title="Delete Record">
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteRecord(record.recordId)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {record.warningLevel === 'None' ? 'Routine Observation' : `Warning: ${record.warningLevel}`}
                        </Typography>
                        {record.warningLevel !== 'None' && <WarningIcon color={getWarningColor(record.warningLevel)} />}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <Box component="span" fontWeight="bold">Observation:</Box> {record.comment}
                        </Typography>
                        {record.recommendations && (
                          <Typography variant="body2" color="text.primary">
                            <Box component="span" fontWeight="bold">Recommendations:</Box> {record.recommendations}
                          </Typography>
                        )}
                        {record.challenges && (
                          <Typography variant="body2" color="text.error">
                            <Box component="span" fontWeight="bold">Challenges:</Box> {record.challenges}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.disabled">
                          Recorded on: {formattedDate(record.createdAt)}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Alert severity="info">No monitoring records found for this project.</Alert>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectMonitoringComponent;