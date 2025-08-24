import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Grid, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, TextField,
  Accordion, AccordionSummary, AccordionDetails,
  ListItemIcon,
  Menu, MenuItem,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon, Check as CheckIcon, Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as DocumentIcon,
  Photo as PhotoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AspectRatio as AspectRatioIcon,
} from '@mui/icons-material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import apiService from '../api';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

const ProjectManagerReviewPanel = ({ open, onClose, projectId, projectName, paymentJustification, handleOpenDocumentUploader }) => {
  const { user, hasPrivilege } = useAuth();
  const serverUrl = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';
  
  const numericProjectId = parseInt(projectId, 10);

  const [paymentRequests, setPaymentRequests] = useState([]);
  const [projectPhotos, setProjectPhotos] = useState([]);
  const [contractors, setContractors] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [paymentRequestDetails, setPaymentRequestDetails] = useState({});

  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState({ open: false, documentId: null });
  const [editDocumentModal, setEditDocumentModal] = useState({ open: false, document: null, newDescription: '' });
  const [fileToReplace, setFileToReplace] = useState(null);
  const [resizeConfirmationModal, setResizeConfirmationModal] = useState({ open: false, document: null, width: '', height: '' });
  const [contextMenu, setContextMenu] = useState(null);
  
  const photoRefs = useRef({});

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
        fetchedRequests = await apiService.paymentRequests.getRequestsForProject(numericProjectId);
      } catch (err) {
        console.error('Error fetching payment requests:', err);
      }
      
      try {
        fetchedDocuments = await apiService.documents.getDocumentsForProject(numericProjectId);
        console.log("Fetched documents for project:", fetchedDocuments);
      } catch (err) {
        console.error('Error fetching project documents:', err);
      }

      await Promise.all(fetchedRequests.map(async (request) => {
        try {
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
      const projectPhotos = fetchedDocuments
        .filter(doc => doc.documentCategory === 'milestone' && doc.documentType.startsWith('photo'))
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || new Date(a.createdAt) - new Date(b.createdAt));
      setProjectPhotos(projectPhotos);
      
      setContractors(fetchedContractors);
      setUsers(fetchedUsers);

    } catch (err) {
      console.error('Outer catch block - Error fetching review data:', err);
      setError(err.message || 'Failed to load contractor submissions.');
    } finally {
      setLoading(false);
    }
  }, [numericProjectId, hasPrivilege]);

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
    if (!editDocumentModal.document) return;

    setSubmitting(true);
    try {
      if (fileToReplace) {
          const formData = new FormData();
          formData.append('document', fileToReplace);
          formData.append('description', editDocumentModal.newDescription);
          await apiService.documents.replaceDocument(editDocumentModal.document.id, formData);
      } else {
          await apiService.documents.updateDocument(editDocumentModal.document.id, { description: editDocumentModal.newDescription });
      }
      setSnackbar({ open: true, message: `Document updated successfully.`, severity: 'success' });
      setEditDocumentModal({ open: false, document: null, newDescription: '' });
      setFileToReplace(null);
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update document.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePhotoReorder = async (result) => {
    if (!result.destination || submitting) return;

    const { source, destination } = result;

    if (source.droppableId === 'progress-photos-droppable') {
      const items = Array.from(projectPhotos);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      const newOrder = items.map((photo, index) => ({ id: photo.id, displayOrder: index }));
      setProjectPhotos(items.map((photo, index) => ({ ...photo, displayOrder: index })));
      
      try {
        await apiService.documents.reorderPhotos(newOrder);
        setSnackbar({ open: true, message: 'Progress photo order saved successfully.', severity: 'success' });
      } catch (err) {
        console.error('Error reordering progress photos:', err);
        setSnackbar({ open: true, message: 'Failed to save new progress photo order.', severity: 'error' });
        fetchData();
      }
    } else if (source.droppableId.startsWith('payment-photos-droppable-')) {
      const requestId = source.droppableId.split('-')[3];
      const requestDocuments = [...paymentRequestDetails[requestId]?.documents || []];
      const paymentPhotos = requestDocuments.filter(doc => doc.documentType === 'photo_payment');
      
      const [reorderedItem] = paymentPhotos.splice(source.index, 1);
      paymentPhotos.splice(destination.index, 0, reorderedItem);

      const newDetails = { ...paymentRequestDetails };
      const nonPaymentDocs = requestDocuments.filter(doc => doc.documentType !== 'photo_payment');
      newDetails[requestId].documents = [...nonPaymentDocs, ...paymentPhotos];
      setPaymentRequestDetails(newDetails);

      const newOrder = paymentPhotos.map((photo, index) => ({ id: photo.id, displayOrder: index }));
      try {
        await apiService.documents.reorderPhotos(newOrder);
        setSnackbar({ open: true, message: 'Payment photo order saved successfully.', severity: 'success' });
      } catch (err) {
        console.error('Error reordering payment photos:', err);
        setSnackbar({ open: true, message: 'Failed to save new payment photo order.', severity: 'error' });
        fetchData();
      }
    }
  };

  const handleFinalizeResize = async () => {
    if (!resizeConfirmationModal.document || !resizeConfirmationModal.width || !resizeConfirmationModal.height) return;

    setSubmitting(true);
    try {
      const sizeData = {
        width: resizeConfirmationModal.width,
        height: resizeConfirmationModal.height,
      };
      await apiService.documents.resizePhoto(resizeConfirmationModal.document.id, sizeData);
      setSnackbar({ open: true, message: 'Photo resized successfully.', severity: 'success' });
      setResizeConfirmationModal({ open: false, document: null, width: '', height: '' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to resize photo.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleContextMenu = (event, photo) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            document: photo,
          }
        : null,
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };
  
  const handleSetCoverPhoto = async (documentId) => {
    handleContextMenuClose();
    setSubmitting(true);
    try {
        await apiService.documents.setProjectCoverPhoto(documentId);
        setSnackbar({ open: true, message: 'Photo set as project cover successfully.', severity: 'success' });
        fetchData();
    } catch (err) {
        setSnackbar({ open: true, message: 'Failed to set photo as project cover.', severity: 'error' });
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" sx={{ '& .MuiDialogContent-root': { overflow: 'visible' } }}>
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
                      {hasPrivilege('document.update') && (
                        <Typography variant="subtitle2" gutterBottom>
                            Right-click a photo to resize or reorder.
                        </Typography>
                      )}
                      <DragDropContext onDragEnd={handlePhotoReorder}>
                        <Droppable droppableId={`payment-photos-droppable-${req.requestId}`}>
                          {(provided) => (
                            <Grid container spacing={2} sx={{ mt: 1, minHeight: '200px' }} {...provided.droppableProps} ref={provided.innerRef}>
                              {paymentRequestDetails[req.requestId]?.documents
                                .filter(doc => doc.documentType === 'photo_payment')
                                .map((doc, index) => (
                                  <Draggable key={doc.id} draggableId={doc.id.toString()} index={index} isDragDisabled={submitting}>
                                    {(provided) => (
                                      <Grid item xs={12} sm={6} md={4} key={doc.id}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <Paper elevation={2} sx={{ position: 'relative', overflow: 'hidden', border: 'none' }} onContextMenu={(e) => handleContextMenu(e, doc)}>
                                            <Box
                                                ref={el => photoRefs.current[doc.id] = el}
                                                sx={{
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    width: '100%',
                                                    height: '200px',
                                                }}
                                            >
                                                <img
                                                    src={`${serverUrl}/${doc.documentPath}`}
                                                    alt={doc.description || 'Payment Photo'}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                {/* FIX: Add conditional chip for cover photo */}
                                                {doc.isProjectCover === 1 && (
                                                    <Chip
                                                        label="Cover Photo"
                                                        color="primary"
                                                        size="small"
                                                        sx={{ position: 'absolute', top: 8, left: 8 }}
                                                    />
                                                )}
                                            </Box>
                                            <Box sx={{ p: 1 }}>
                                                <Typography variant="body2" noWrap>{doc.description || 'No description'}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Uploaded by: {users[doc.userId] || `User ID: ${doc.userId}`} on {new Date(doc.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                      </Grid>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                            </Grid>
                          )}
                        </Droppable>
                      </DragDropContext>
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
        <hr />
        <Typography variant="h6" color="primary.main" gutterBottom>Progress Photos</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
        {hasPrivilege('document.update') && (
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Drag and drop photos below to reorder them.
                </Typography>
            </Box>
        )}
        {projectPhotos.length > 0 ? (
            <DragDropContext onDragEnd={handlePhotoReorder}>
                <Droppable droppableId="progress-photos-droppable">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            <Timeline position="alternate">
                                {projectPhotos.map((photo, index) => (
                                    <Draggable key={photo.id} draggableId={photo.id.toString()} index={index} isDragDisabled={submitting}>
                                        {(provided) => (
                                            <TimelineItem
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <TimelineSeparator>
                                                    <TimelineDot color="primary">
                                                        <PhotoIcon />
                                                    </TimelineDot>
                                                    {index < projectPhotos.length - 1 && <TimelineConnector />}
                                                </TimelineSeparator>
                                                <TimelineContent>
                                                    <Paper elevation={3} sx={{ p: 2, position: 'relative' }} onContextMenu={(e) => handleContextMenu(e, photo)}>
                                                        <Typography variant="h6" component="span">
                                                            {photo.description || photo.documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {new Date(photo.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                        <Box
                                                            ref={el => photoRefs.current[photo.id] = el}
                                                            sx={{
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                width: '100%',
                                                                height: 'auto',
                                                                border: 'none',
                                                            }}
                                                        >
                                                            <img
                                                                src={`${serverUrl}/${photo.documentPath}`}
                                                                alt={photo.description}
                                                                style={{ width: '100%', height: 'auto', borderRadius: '8px', marginTop: '8px' }}
                                                            />
                                                            {/* FIX: Add conditional chip for cover photo */}
                                                            {photo.isProjectCover === 1 && (
                                                                <Chip
                                                                    label="Cover Photo"
                                                                    color="primary"
                                                                    size="small"
                                                                    sx={{ position: 'absolute', top: 8, left: 8 }}
                                                                />
                                                            )}
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                            Uploaded by: {users[photo.userId] || `User ID: ${photo.userId}`} on {new Date(photo.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                    </Paper>
                                                </TimelineContent>
                                            </TimelineItem>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </Timeline>
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
          ) : (
            <Alert severity="info">No photos submitted for this project.</Alert>
          )}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>

      {/* Confirmation Modal for Deleting a Document */}
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
      
      {/* Modal for Editing a Document's Description */}
      <Dialog
        open={editDocumentModal.open}
        onClose={() => setEditDocumentModal({ open: false, document: null, newDescription: '' })}
      >
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Replace Document:</Typography>
            <input
              type="file"
              onChange={(e) => setFileToReplace(e.target.files[0])}
            />
          </Box>
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
          <Button onClick={handleEditDocument} color="primary" variant="contained" disabled={submitting || (!editDocumentModal.newDescription && !fileToReplace)}>
            {submitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal for confirming resize action */}
      <Dialog
        open={resizeConfirmationModal.open}
        onClose={() => setResizeConfirmationModal({ open: false, document: null, width: '', height: '' })}
        maxWidth="xs"
      >
        <DialogTitle>Confirm Resize</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to resize this photo to {resizeConfirmationModal.width}px by {resizeConfirmationModal.height}px?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResizeConfirmationModal({ open: false, document: null, width: '', height: '' })}>Cancel</Button>
          <Button onClick={handleFinalizeResize} color="primary" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Confirm Resize'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Context Menu for Photo Actions */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {hasPrivilege('document.update') && (
          <MenuItem onClick={() => {
            setEditDocumentModal({ open: true, document: contextMenu.document, newDescription: contextMenu.document.description || '' });
            handleContextMenuClose();
          }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            Edit Description
          </MenuItem>
        )}
        {hasPrivilege('project.set_cover_photo') && (
          <MenuItem onClick={() => handleSetCoverPhoto(contextMenu.document.id)}>
            <ListItemIcon><PhotoIcon fontSize="small" /></ListItemIcon>
            Set as Cover Photo
          </MenuItem>
        )}
        {hasPrivilege('document.update') && (
          <MenuItem onClick={() => {
            setResizeConfirmationModal({ open: true, document: contextMenu.document, width: '', height: '' });
            handleContextMenuClose();
          }}>
            <ListItemIcon><AspectRatioIcon fontSize="small" /></ListItemIcon>
            Resize Photo
          </MenuItem>
        )}
        {hasPrivilege('document.delete') && (
          <MenuItem onClick={() => {
            setDeleteConfirmationModal({ open: true, documentId: contextMenu.document.id });
            handleContextMenuClose();
          }}>
            <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
            Delete Photo
          </MenuItem>
        )}
      </Menu>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
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