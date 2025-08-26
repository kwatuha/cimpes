import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Stack, Grid, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Chip, Snackbar
} from '@mui/material';
import {
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../api';

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
 
  const contractorId = user?.contractorId;
  const serverUrl = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';

  const [projects, setProjects] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
const fetchData = useCallback(async () => {
  console.log("Starting fetchData...");
  setLoading(true);
  setError(null);
  
  // Log the user details here
  console.log("User details before fetching projects:", user);
  console.log("Contractor ID being used:", contractorId);

  if (!contractorId) {
    console.error("fetchData aborted: contractorId is not defined.");
    setLoading(false);
    return;
  }

  try {
    const projectsData = await apiService.contractors.getProjectsByContractor(contractorId); 
    const paymentData = await apiService.contractors.getPaymentRequestsByContractor(contractorId);
    const photosData = await apiService.contractors.getPhotosByContractor(contractorId);
    
    setProjects(projectsData);
    setPaymentRequests(paymentData);
    setPhotos(photosData);

  } catch (err) {
    console.error('An error occurred during API calls:', err);
    setError(err.response?.data?.message || 'Failed to load dashboard data.');
  } finally {
    setLoading(false);
  }
}, [contractorId, user]);

  useEffect(() => {
    // Only fetch data when contractorId is available and not during auth loading
    if (!authLoading && contractorId) {
      console.log("useEffect triggered with valid contractorId. Calling fetchData().");
      fetchData();
    } else if (!authLoading && !contractorId) {
      // If auth is done but no contractorId is present, stop loading.
      console.log("Auth is complete, but no contractorId found. Stopping loader.");
      setLoading(false);
    }
  }, [fetchData, contractorId, authLoading]);
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleViewProjectDetails = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  if (authLoading || (loading && !error)) {
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
                      <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewProjectDetails(proj.id)}
                      >
                        View Details
                      </Button>
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
                  <ListItem key={req.paymentRequestId} divider>
                    <ListItemText primary={`KES ${parseFloat(req.amount).toFixed(2)}`} secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          Project ID: {req.projectId}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          Submitted: {new Date(req.submittedAt).toLocaleDateString()}
                        </Typography>
                      </React.Fragment>
                    } />
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
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContractorDashboard;