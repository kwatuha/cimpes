import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Grid, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import {
  Close as CloseIcon, Check as CheckIcon, Clear as ClearIcon,
  Visibility as VisibilityIcon, Paid as PaidIcon, PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import apiService from '../api';
import { useAuth } from '../context/AuthContext';

const ProjectManagerReviewPanel = ({ open, onClose, projectId, projectName }) => {
  const { user, hasPrivilege } = useAuth();
  const serverUrl = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';

  const [paymentRequests, setPaymentRequests] = useState([]);
  const [contractorPhotos, setContractorPhotos] = useState([]);
  const [contractors, setContractors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!hasPrivilege('project_manager.review')) {
        setError("You do not have permission to review contractor submissions.");
        return;
      }
      
      const requests = await apiService.paymentRequests.getRequestsForProject(projectId);
      const photos = await apiService.contractorPhotos.getPhotosForProject(projectId);
      const allContractors = await apiService.contractors.getAllContractors();

      const contractorMap = allContractors.reduce((map, contractor) => {
        map[contractor.contractorId] = contractor.companyName;
        return map;
      }, {});

      setPaymentRequests(requests);
      setContractorPhotos(photos);
      setContractors(contractorMap);
    } catch (err) {
      console.error('Error fetching review data:', err);
      setError(err.response?.data?.message || 'Failed to load contractor submissions.');
    } finally {
      setLoading(false);
    }
  }, [projectId, hasPrivilege]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  const handleUpdatePaymentStatus = async (requestId, newStatus) => {
    if (!hasPrivilege('project_payments.update')) return;

    setSubmitting(true);
    try {
      await apiService.paymentRequests.updateStatus(requestId, { status: newStatus });
      setSnackbar({ open: true, message: `Payment request ${newStatus.toLowerCase()} successfully.`, severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update payment status.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePhotoStatus = async (photoId, newStatus) => {
    if (!hasPrivilege('contractor_photos.update_status')) return;

    setSubmitting(true);
    try {
      await apiService.contractorPhotos.updateStatus(photoId, { status: newStatus });
      setSnackbar({ open: true, message: `Photo ${newStatus.toLowerCase()} successfully.`, severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update photo status.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    </Dialog>
    );
  }
  
  if (error) {
    return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        Review Submissions for: {projectName}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="h6" color="primary.main" gutterBottom>Payment Requests</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
          {paymentRequests.length > 0 ? (
            <List>
              {paymentRequests.map((req) => (
                <ListItem key={req.requestId} divider>
                  <ListItemText
                    primary={`KES ${parseFloat(req.amount).toFixed(2)}`}
                    secondary={req.description}
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <Chip label={req.status} color={req.status === 'Approved' ? 'success' : (req.status === 'Rejected' ? 'error' : 'default')} />
                      {req.status === 'Pending Review' && hasPrivilege('project_payments.update') && (
                        <>
                          <IconButton onClick={() => handleUpdatePaymentStatus(req.requestId, 'Approved')} disabled={submitting}>
                            <CheckIcon color="success" />
                          </IconButton>
                          <IconButton onClick={() => handleUpdatePaymentStatus(req.requestId, 'Rejected')} disabled={submitting}>
                            <ClearIcon color="error" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No payment requests for this project.</Alert>
          )}
        </Paper>

        <Typography variant="h6" color="primary.main" gutterBottom>Progress Photos</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          {contractorPhotos.length > 0 ? (
            <Grid container spacing={2}>
              {contractorPhotos.map((photo) => (
                <Grid item key={photo.photoId} xs={12} sm={6} md={4}>
                  <Box sx={{ position: 'relative', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                    {photo.filePath && (
                        <img 
                          src={`${serverUrl}/${photo.filePath}`}
                          alt={photo.caption} 
                          style={{ width: '100%', height: 200, objectFit: 'cover' }} 
                        />
                    )}
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2">{photo.caption}</Typography>
                      <Typography variant="caption" color="text.secondary">By {contractors[photo.contractorId] || 'Unknown'}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Chip label={photo.status} color={photo.status === 'Approved' ? 'success' : (photo.status === 'Rejected' ? 'error' : 'default')} size="small" />
                        {photo.status === 'Pending Review' && hasPrivilege('contractor_photos.update_status') && (
                          <>
                            <IconButton onClick={() => handleUpdatePhotoStatus(photo.photoId, 'Approved')} disabled={submitting}>
                              <CheckIcon color="success" />
                            </IconButton>
                            <IconButton onClick={() => handleUpdatePhotoStatus(photo.photoId, 'Rejected')} disabled={submitting}>
                              <ClearIcon color="error" />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No photos submitted by contractors for this project.</Alert>
          )}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectManagerReviewPanel;