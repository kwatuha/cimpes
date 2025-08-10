import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Grid, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, MenuItem,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon, PhotoCamera as PhotoCameraIcon, Paid as PaidIcon,
  Visibility as VisibilityIcon, UploadFile as UploadFileIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import apiService from '../api';
// NEW: Import the standalone form components
import PaymentRequestForm from '../components/PaymentRequestForm.jsx';
import ContractorPhotoUploader from '../components/ContractorPhotoUploader.jsx';


const ContractorDashboard = () => {
  const { user } = useAuth();
  const contractorId = user?.contractorId || 1;
  const serverUrl = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';

  const [projects, setProjects] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openPhotoModal, setOpenPhotoModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchData = useCallback(async () => {
    if (!contractorId) return;

    setLoading(true);
    setError(null);
    try {
      const projectsData = await apiService.contractors.getProjectsByContractor(contractorId); 
      const paymentData = await apiService.paymentRequests.getRequestsByContractor(contractorId);
      const photosData = await apiService.contractorPhotos.getPhotosByContractor(contractorId);

      setProjects(projectsData);
      setPaymentRequests(paymentData);
      setPhotos(photosData);
    } catch (err) {
      console.error('Error fetching contractor data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [contractorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleOpenPaymentModal = (project) => {
    setSelectedProject(project);
    setOpenPaymentModal(true);
  };

  const handlePaymentSubmit = async (projectId, formData) => {
    try {
      await apiService.paymentRequests.createRequest({ projectId, ...formData });
      setSnackbar({ open: true, message: 'Payment request submitted!', severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to submit payment request.', severity: 'error' });
    }
  };

  const handleOpenPhotoModal = (project) => {
    setSelectedProject(project);
    setOpenPhotoModal(true);
  };
  
  const handlePhotoSubmit = async (projectId, file, caption) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('caption', caption);
      await apiService.contractorPhotos.uploadPhoto(contractorId, formData);
      setSnackbar({ open: true, message: 'Photo uploaded!', severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to upload photo.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
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
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#0A2342', fontWeight: 'bold' }}>
        Contractor Dashboard
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ color: '#333' }}>
        Welcome, {user?.firstName || 'Contractor'}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Projects Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '8px' }}>
            <Typography variant="h6" color="primary.main">My Assigned Projects</Typography>
            <List>
              {projects.length > 0 ? (
                projects.map(proj => (
                  <ListItem key={proj.id} divider>
                    <ListItemText primary={proj.projectName} secondary={`Status: ${proj.status}`} />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          startIcon={<PaidIcon />}
                          onClick={() => handleOpenPaymentModal(proj)}
                        >
                          Request Payment
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<PhotoCameraIcon />}
                          onClick={() => handleOpenPhotoModal(proj)}
                        >
                          Upload Photo
                        </Button>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <Alert severity="info">No projects currently assigned.</Alert>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Payment History Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '8px' }}>
            <Typography variant="h6" color="primary.main">My Payment Requests</Typography>
            <List>
              {paymentRequests.length > 0 ? (
                paymentRequests.map(req => (
                  <ListItem key={req.id} divider>
                    <ListItemText primary={`KES ${parseFloat(req.amount).toFixed(2)}`} secondary={`Project ID: ${req.projectId}`} />
                    <ListItemSecondaryAction>
                      <Chip label={req.status} color={req.status === 'Approved' ? 'success' : (req.status === 'Rejected' ? 'error' : 'default')} />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <Alert severity="info">No payment requests submitted yet.</Alert>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Photo History Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '8px' }}>
            <Typography variant="h6" color="primary.main">My Progress Photos</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {photos.length > 0 ? (
                photos.map(photo => (
                  <Grid item key={photo.photoId} xs={12} sm={6}>
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
                        <Typography variant="caption" color="text.secondary">Project ID: {photo.projectId}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                          <Chip label={photo.status} color={photo.status === 'Approved' ? 'success' : 'default'} size="small" />
                        </Stack>
                      </Box>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">No photos uploaded yet.</Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Modals */}
      <PaymentRequestForm
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        projectId={selectedProject?.id}
        projectName={selectedProject?.projectName}
        onSubmit={handlePaymentSubmit}
      />
      <ContractorPhotoUploader
        open={openPhotoModal}
        onClose={() => setOpenPhotoModal(false)}
        projectId={selectedProject?.id}
        projectName={selectedProject?.projectName}
        onSubmit={handlePhotoSubmit}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContractorDashboard;