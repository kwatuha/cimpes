import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Grid, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, TextField,
  Accordion, AccordionSummary, AccordionDetails,
  ListItemIcon,
  ImageList, ImageListItem, ImageListItemBar,
} from '@mui/material';
import {
  Close as CloseIcon, Check as CheckIcon, Clear as ClearIcon,
  Visibility as VisibilityIcon, Paid as PaidIcon, PhotoCamera as PhotoCameraIcon,
  ExpandMore as ExpandMoreIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as DocumentIcon,
  Photo as PhotoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';
import apiService from '../api';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

const ProjectManagerReviewPanel = ({ open, onClose, projectId, projectName, paymentJustification, handleOpenDocumentUploader }) => {
  const { user, hasPrivilege } = useAuth();
  const serverUrl = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';

  const [paymentRequests, setPaymentRequests] = useState([]);
  const [projectPhotos, setProjectPhotos] = useState([]);
  const [contractors, setContractors] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [paymentRequestDetails, setPaymentRequestDetails] = useState({});

  // NEW: State for edit and delete modals
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState({ open: false, documentId: null });
  const [editDocumentModal, setEditDocumentModal] = useState({ open: false, document: null, newDescription: '' });


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let fetchedRequests = [];
    let fetchedDocuments = [];
    let fetchedContractors = {};
    const detailsMap = {};
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
      
      try {
        // NEW: Fetch all documents for the project
        fetchedDocuments = await apiService.documents.getDocumentsForProject(projectId);
        console.log("Fetched documents for project:", fetchedDocuments);
      } catch (err) {
        console.error('Error fetching project documents:', err);
      }

      await Promise.all(fetchedRequests.map(async (request) => {
        try {
          // Note: We no longer need to fetch specific docs here as they are all in the 'documents' list now
          detailsMap[request.requestId] = {
            documents: fetchedDocuments.filter(doc => doc.requestId === request.requestId)
          };
        } catch (err) {
          console.error(`Error fetching details for request ${request.requestId}:`, err);
          detailsMap[request.requestId] = { documents: [] };
        }
      }));

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
      // NEW: Filter and set project photos based on documentCategory and documentType
      const projectPhotos = fetchedDocuments
        .filter(doc => doc.documentCategory === 'milestone' && doc.documentType.startsWith('photo'))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sort by date
      setProjectPhotos(projectPhotos);
      
      setContractors(fetchedContractors);
      setUsers(fetchedUsers);

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
    // Note: This function will need to be updated to handle the new document schema
    // and the specific API endpoint for updating a document's status.
    // This is a placeholder for now.
    console.warn("Update Photo Status functionality needs to be implemented for the new document schema.");
  };
  
  // NEW: Handlers for edit/delete document functionality
  const handleDeleteDocument = async () => {
    if (!deleteConfirmationModal.documentId) return;

    setSubmitting(true);
    try {
      await apiService.documents.deleteDocument(deleteConfirmationModal.documentId);
      setSnackbar({ open: true, message: `Document deleted successfully.`, severity: 'success' });
      setDeleteConfirmationModal({ open: false, documentId: null });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete document.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDocument = async () => {
    if (!editDocumentModal.document || !editDocumentModal.newDescription) return;

    setSubmitting(true);
    try {
      await apiService.documents.updateDocument(editDocumentModal.document.id, { description: editDocumentModal.newDescription });
      setSnackbar({ open: true, message: `Document updated successfully.`, severity: 'success' });
      setEditDocumentModal({ open: false, document: null, newDescription: '' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update document.', severity: 'error' });
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
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <ListItemText
                        primary={`KES ${parseFloat(req.amount).toFixed(2)}`}
                        secondary={req.description}
                      />
                      <Chip label={req.status} color={req.status === 'Approved' ? 'success' : (req.status === 'Rejected' ? 'error' : 'default')} />
                      {hasPrivilege('payment_requests.upload_document') && (
                        <IconButton onClick={() => handleOpenDocumentUploader(req.requestId)}>
                          <AttachFileIcon color="primary" />
                        </IconButton>
                      )}
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
                    
                    <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Documents</Typography>
                      {paymentRequestDetails[req.requestId]?.documents?.length > 0 ? (
                        <List dense disablePadding>
                          {paymentRequestDetails[req.requestId].documents
                            .filter(doc => doc.documentType !== 'photo_payment')
                            .map((doc) => (
                            <ListItem key={doc.id} disablePadding sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}><DocumentIcon fontSize="small" /></ListItemIcon>
                              <ListItemText
                                primary={doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                secondary={`Uploaded by: ${users[doc.userId] || `User ID: ${doc.userId}`} on ${new Date(doc.createdAt).toLocaleDateString()}`}
                              />
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto' }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  href={`${serverUrl}/${doc.documentPath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </Button>
                                {hasPrivilege('document.update') && (
                                  <IconButton onClick={() => setEditDocumentModal({ open: true, document: doc, newDescription: doc.description || '' })}>
                                    <EditIcon color="action" fontSize="small" />
                                  </IconButton>
                                )}
                                {hasPrivilege('document.delete') && (
                                  <IconButton onClick={() => setDeleteConfirmationModal({ open: true, documentId: doc.id })}>
                                    <DeleteIcon color="error" fontSize="small" />
                                  </IconButton>
                                )}
                              </Stack>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No documents attached.</Typography>
                      )}
                    </Box>
                    
                    {/* NEW: Section for displaying payment photos */}
                    <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Payment Photos</Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {paymentRequestDetails[req.requestId]?.documents
                          .filter(doc => doc.documentType === 'photo_payment')
                          .map((doc) => (
                            <Grid item xs={12} sm={6} md={4} key={doc.id}>
                              <Paper elevation={2} sx={{ position: 'relative', overflow: 'hidden' }}>
                                <img
                                  src={`${serverUrl}/${doc.documentPath}`}
                                  alt={doc.description || 'Payment Photo'}
                                  style={{ width: '100%', height: 200, objectFit: 'cover' }}
                                />
                                <Box sx={{ p: 1 }}>
                                  <Typography variant="body2" noWrap>{doc.description || 'No description'}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Uploaded by: {users[doc.userId] || `User ID: ${doc.userId}`} on {new Date(doc.createdAt).toLocaleDateString()}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      href={`${serverUrl}/${doc.documentPath}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View
                                    </Button>
                                    {hasPrivilege('document.update') && (
                                      <IconButton onClick={() => setEditDocumentModal({ open: true, document: doc, newDescription: doc.description || '' })}>
                                        <EditIcon color="action" fontSize="small" />
                                      </IconButton>
                                    )}
                                    {hasPrivilege('document.delete') && (
                                      <IconButton onClick={() => setDeleteConfirmationModal({ open: true, documentId: doc.id })}>
                                        <DeleteIcon color="error" fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Stack>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                      </Grid>
                      {paymentRequestDetails[req.requestId]?.documents
                        .filter(doc => doc.documentType === 'photo_payment').length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No payment photos attached.</Typography>
                        )}
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No payment requests for this project.</Alert>
          )}
        </Paper>

        <Typography variant="h6" color="primary.main" gutterBottom>Progress Photos</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          {projectPhotos.length > 0 ? (
            <Timeline position="alternate">
              {projectPhotos.map((photo, index) => (
                <TimelineItem key={photo.id}>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <PhotoIcon />
                    </TimelineDot>
                    {index < projectPhotos.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Paper elevation={3} sx={{ p: 2 }}>
                      <Typography variant="h6" component="span">
                        {photo.description || photo.documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </Typography>
                      <img 
                        src={`${serverUrl}/${photo.documentPath}`} 
                        alt={photo.description}
                        style={{ width: '100%', height: 'auto', borderRadius: '8px', marginTop: '8px' }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Uploaded by: {users[photo.userId] || `User ID: ${photo.userId}`} on {new Date(photo.createdAt).toLocaleDateString()}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        {hasPrivilege('document.update') && (
                          <IconButton onClick={() => setEditDocumentModal({ open: true, document: photo, newDescription: photo.description || '' })}>
                            <EditIcon color="action" fontSize="small" />
                          </IconButton>
                        )}
                        {hasPrivilege('document.delete') && (
                          <IconButton onClick={() => setDeleteConfirmationModal({ open: true, documentId: photo.id })}>
                            <DeleteIcon color="error" fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <Alert severity="info">No photos submitted for this project.</Alert>
          )}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>

      {/* NEW: Confirmation Modal for Deleting a Document */}
      <Dialog
        open={deleteConfirmationModal.open}
        onClose={() => setDeleteConfirmationModal({ open: false, documentId: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this document? This action is permanent.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmationModal({ open: false, documentId: null })}>Cancel</Button>
          <Button onClick={handleDeleteDocument} color="error" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* NEW: Modal for Editing a Document's Description */}
      <Dialog
        open={editDocumentModal.open}
        onClose={() => setEditDocumentModal({ open: false, document: null, newDescription: '' })}
      >
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Description"
            multiline
            rows={4}
            value={editDocumentModal.newDescription}
            onChange={(e) => setEditDocumentModal(prev => ({ ...prev, newDescription: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDocumentModal({ open: false, document: null, newDescription: '' })}>Cancel</Button>
          <Button onClick={handleEditDocument} color="primary" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
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
