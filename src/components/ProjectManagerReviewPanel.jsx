import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Grid, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  Accordion, AccordionSummary, AccordionDetails,
  ListItemIcon // ⬅️ Correctly imported from @mui/material
} from '@mui/material';
import {
  Close as CloseIcon, Check as CheckIcon, Clear as ClearIcon,
  Visibility as VisibilityIcon, Paid as PaidIcon, PhotoCamera as PhotoCameraIcon,
  ExpandMore as ExpandMoreIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as DocumentIcon // ⬅️ Correctly imported from @mui/icons-material
} from '@mui/icons-material';
import apiService from '../api';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

const ProjectManagerReviewPanel = ({ open, onClose, projectId, projectName, paymentJustification, handleOpenDocumentUploader }) => {
  const { user, hasPrivilege } = useAuth();
  const serverUrl = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';

  const [paymentRequests, setPaymentRequests] = useState([]);
  const [contractorPhotos, setContractorPhotos] = useState([]);
  const [contractors, setContractors] = useState({});
  // NEW: State to hold a map of userId to userName
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [paymentRequestDetails, setPaymentRequestDetails] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let fetchedRequests = [];
    let fetchedPhotos = [];
    let fetchedContractors = {};
    const detailsMap = {};
    // NEW: Variable to hold fetched users
    let fetchedUsers = {};

    try {
      if (!hasPrivilege('project_manager.review')) {
        setError("You do not have permission to review contractor submissions.");
        setLoading(false);
        return;
      }

      // Fetch all users to map IDs to names
      try {
        const allUsers = await apiService.users.getUsers();
        // 🐛 DEBUGGING: Log the fetched users array to inspect its structure
        console.log("Fetched users:", allUsers);
        
        fetchedUsers = allUsers.reduce((map, u) => {
          map[u.userId] = `${u.firstName} ${u.lastName}`;
          return map;
        }, {});
      } catch (err) {
        console.error('Error fetching users:', err);
      }

      try {
        fetchedRequests = await apiService.paymentRequests.getRequestsForProject(projectId);
      } catch (err) {
        console.error('Error fetching payment requests:', err);
      }

      await Promise.all(fetchedRequests.map(async (request) => {
        try {
          const detailedRequest = await apiService.paymentRequests.getRequestById(request.requestId);
          detailsMap[request.requestId] = detailedRequest;
        } catch (err) {
          console.error(`Error fetching details for request ${request.requestId}:`, err);
          detailsMap[request.requestId] = { documents: [] };
        }
      }));

      try {
        fetchedPhotos = await apiService.contractorPhotos.getPhotosForProject(projectId);
      } catch (err) {
        console.error('Error fetching contractor photos:', err);
      }

      try {
        const allContractors = await apiService.contractors.getAllContractors();
        fetchedContractors = allContractors.reduce((map, contractor) => {
          map[contractor.contractorId] = contractor.companyName;
          return map;
        }, {});
      } catch (err) {
        console.error('Error fetching contractors:', err);
      }
      
      setPaymentRequests(fetchedRequests);
      setPaymentRequestDetails(detailsMap);
      setContractorPhotos(fetchedPhotos);
      setContractors(fetchedContractors);
      setUsers(fetchedUsers); // NEW: Set the fetched users state

    } catch (err) {
      console.error('Outer catch block - Error fetching review data:', err);
      setError(err.message || 'Failed to load contractor submissions.');
    } finally {
      setLoading(false);
    }
  }, [projectId, hasPrivilege, apiService]);

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

  if (!open) {
    return null;
  }
  
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

        {paymentJustification && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Payment Justification</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Total Accomplished Budget: <Chip label={`KES ${paymentJustification.totalBudget.toFixed(2)}`} color="success" />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                The amount requested for payment should be justified by the following completed activities.
              </Typography>
              
              {paymentJustification.accomplishedMilestones && paymentJustification.accomplishedMilestones.length > 0 ? (
                  <List dense>
                      {paymentJustification.accomplishedMilestones.map(milestone => (
                          <Accordion key={milestone.milestoneId} disableGutters>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography sx={{ fontWeight: 'bold' }}>Milestone: {milestone.milestoneName}</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                  <List dense disablePadding>
                                      {paymentJustification.accomplishedActivities
                                          .filter(a => a.milestoneId === milestone.milestoneId)
                                          .map(activity => (
                                              <ListItem key={activity.activityId} disablePadding>
                                                  <ListItemText
                                                      primary={activity.activityName}
                                                      secondary={`Budget: KES ${parseFloat(activity.budgetAllocated).toFixed(2)}`}
                                                  />
                                              </ListItem>
                                          ))}
                                  </List>
                              </AccordionDetails>
                          </Accordion>
                      ))}
                  </List>
              ) : (
                  <Alert severity="info">No completed milestones with activities found yet.</Alert>
              )}
            </Paper>
          </Box>
        )}
        <hr />
        
        <Typography variant="h6" color="primary.main" gutterBottom>Payment Requests</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
          {paymentRequests.length > 0 ? (
            <List>
              {paymentRequests.map((req) => (
                <ListItem key={req.requestId} divider>
                  <Box sx={{ width: '100%' }}>
                    <ListItemText
                      primary={`KES ${parseFloat(req.amount).toFixed(2)}`}
                      secondary={req.description}
                    />
                    
                    <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Documents</Typography>
                      {paymentRequestDetails[req.requestId]?.documents?.length > 0 ? (
                        <List dense disablePadding>
                          {paymentRequestDetails[req.requestId].documents.map((doc) => (
                            <ListItem key={doc.id} disablePadding sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}><DocumentIcon fontSize="small" /></ListItemIcon>
                              <ListItemText
                                primary={doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                // UPDATED: Display user's name instead of ID
                                secondary={`Uploaded by: ${users[doc.uploadedByUserId] || `User ID: ${doc.uploadedByUserId}`}`}
                              />
                              <Button
                                size="small"
                                variant="outlined"
                                href={`${serverUrl}/${doc.documentPath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </Button>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No documents attached.</Typography>
                      )}
                    </Box>
                  </Box>

                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      {hasPrivilege('payment_requests.upload_document') && (
                          <IconButton onClick={() => handleOpenDocumentUploader(req.requestId)}>
                              <AttachFileIcon color="primary" />
                          </IconButton>
                      )}
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

ProjectManagerReviewPanel.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    projectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    projectName: PropTypes.string,
    paymentJustification: PropTypes.object,
    handleOpenDocumentUploader: PropTypes.func,
};

ProjectManagerReviewPanel.defaultProps = {
    paymentJustification: {
        totalBudget: 0,
        accomplishedActivities: [],
        accomplishedMilestones: [],
    },
    handleOpenDocumentUploader: () => {},
};

export default ProjectManagerReviewPanel;
