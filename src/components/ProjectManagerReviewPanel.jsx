import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Grid, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, TextField,
  Accordion, AccordionSummary, AccordionDetails,
  ListItemIcon,
  Menu, MenuItem,
  Snackbar,
  Tabs, Tab, Tooltip, useTheme,
} from '@mui/material';
import { tokens } from '../pages/dashboard/theme';
import {
  Close as CloseIcon, Check as CheckIcon, Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as DocumentIcon,
  Photo as PhotoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AspectRatio as AspectRatioIcon,
  Paid as PaidIcon,
  Launch as LaunchIcon // NEW: Import LaunchIcon for a better user experience
} from '@mui/icons-material';
import {
  DragDropContext, Droppable, Draggable
} from '@hello-pangea/dnd';
import apiService from '../api';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';
import PaymentApprovalModal from './modals/PaymentApprovalModal';

const ProjectManagerReviewPanel = ({ open, onClose, projectId, projectName, paymentJustification, handleOpenDocumentUploader }) => {
  const { user, hasPrivilege } = useAuth();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const serverUrl = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';

  const numericProjectId = parseInt(projectId, 10);

  const [paymentRequests, setPaymentRequests] = useState([]);
  const [projectPhotos, setProjectPhotos] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [contractors, setContractors] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [paymentRequestDetails, setPaymentRequestDetails] = useState({});
  const [tabValues, setTabValues] = useState({});

  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState({ open: false, documentId: null });
  const [editDocumentModal, setEditDocumentModal] = useState({ open: false, document: null, newDescription: '' });
  const [fileToReplace, setFileToReplace] = useState(null);
  const [resizeConfirmationModal, setResizeConfirmationModal] = useState({ open: false, document: null, width: '', height: '' });
  const [contextMenu, setContextMenu] = useState(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const photoRefs = useRef({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let fetchedRequests = [];
    let fetchedDocuments = [];
    let fetchedContractors = {};
    const detailsMap = {};
    let fetchedUsers = {};
    let fetchedMilestones = [];

    try {
      // UPDATED: Check if user is a contractor OR has the manager privilege
      if (!hasPrivilege('project_manager.review') && !user?.contractorId) {
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
        fetchedMilestones = await apiService.milestones.getMilestonesForProject(numericProjectId);
        setMilestones(fetchedMilestones);
      } catch (err) {
        console.error('Error fetching milestones:', err);
        setMilestones([]);
      }

      try {
        fetchedRequests = await apiService.paymentRequests.getRequestsForProject(numericProjectId);
        console.log('🔍 Payment Requests fetched:', fetchedRequests);
        console.log('🔍 Project ID:', numericProjectId);
        console.log('🔍 Number of requests:', fetchedRequests?.length || 0);
      } catch (err) {
        console.error('Error fetching payment requests:', err);
        fetchedRequests = [];
      }
      
      const initialTabValues = {};
      fetchedRequests.forEach(req => {
        initialTabValues[req.requestId] = 0;
      });
      setTabValues(initialTabValues);

      const allDocuments = await apiService.documents.getDocumentsForProject(numericProjectId);
      const finalDetailsMap = fetchedRequests.reduce((acc, request) => {
        const documents = allDocuments.filter(doc => doc.requestId === request.requestId);
        acc[request.requestId] = { documents };
        return acc;
      }, {});
      setPaymentRequestDetails(finalDetailsMap);
      
      const projectPhotos = allDocuments
        .filter(doc => doc.documentCategory === 'milestone' && doc.documentType.startsWith('photo'))
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || new Date(a.createdAt) - new Date(b.createdAt));
      setProjectPhotos(projectPhotos);
      
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
      setContractors(fetchedContractors);
      setUsers(fetchedUsers);
      
      console.log('🔍 State set - paymentRequests:', fetchedRequests);
      console.log('🔍 State set - paymentRequests length:', fetchedRequests?.length || 0);

    } catch (err) {
      console.error('Outer catch block - Error fetching review data:', err);
      setError(err.message || 'Failed to load contractor submissions.');
    } finally {
      setLoading(false);
    }
  }, [numericProjectId, hasPrivilege, user]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  const handleUpdatePaymentStatus = async (requestId, newStatus) => {
    // Retained privilege check
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
    const droppableId = source.droppableId;
    const isPaymentPhotos = droppableId.startsWith('payment-photos-droppable-');
    const isProgressPhotos = droppableId.startsWith('milestone-photos-');

    if (isPaymentPhotos) {
      const requestId = droppableId.split('-')[3];
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
    } else if (isProgressPhotos) {
        const milestoneId = droppableId.split('milestone-photos-')[1];
        const sourcePhotos = projectPhotos.filter(photo => photo.milestoneId === milestoneId);
        const reorderedPhotos = Array.from(sourcePhotos);
        const [removed] = reorderedPhotos.splice(source.index, 1);
        reorderedPhotos.splice(destination.index, 0, removed);
        const nonMilestonePhotos = projectPhotos.filter(photo => photo.milestoneId !== milestoneId);
        const newProjectPhotos = [...nonMilestonePhotos, ...reorderedPhotos];
        setProjectPhotos(newProjectPhotos);
        const newOrder = reorderedPhotos.map((photo, index) => ({ id: photo.id, displayOrder: index }));
        try {
            await apiService.documents.reorderPhotos(newOrder);
            setSnackbar({ open: true, message: 'Progress photo order saved successfully.', severity: 'success' });
        } catch (err) {
            console.error('Error reordering progress photos:', err);
            setSnackbar({ open: true, message: 'Failed to save new progress photo order.', severity: 'error' });
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

  const handleTabChange = (requestId, newValue) => {
    setTabValues(prev => ({ ...prev, [requestId]: newValue }));
  };
  
  const handleOpenApprovalModal = (requestId) => {
    setSelectedRequestId(requestId);
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedRequestId(null);
    fetchData();
  };


  if (!open) {
    return null;
  }

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 3,
          backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50]
        }}>
          <CircularProgress 
            size={60}
            sx={{ color: colors.blueAccent[500] }}
          />
          <Typography variant="h6" sx={{ color: colors.grey[600] }}>
            Loading project review data...
          </Typography>
        </Box>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <Box sx={{ 
          p: 4,
          backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50],
          textAlign: 'center'
        }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              backgroundColor: theme.palette.mode === 'dark' ? colors.redAccent[900] : colors.redAccent[50],
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.redAccent[700] : colors.redAccent[200]}`,
              '& .MuiAlert-icon': {
                color: colors.redAccent[500]
              }
            }}
          >
            {error}
          </Alert>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="lg" 
      sx={{ 
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 20px 40px rgba(0,0,0,0.8)' 
            : '0 20px 40px rgba(0,0,0,0.15)',
          overflow: 'visible',
          // Custom scrollbar for the entire dialog
          '&::-webkit-scrollbar': {
            width: '12px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[100],
            borderRadius: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[300],
            borderRadius: '6px',
            border: `2px solid ${theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[100]}`,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[400]
            }
          },
          '&::-webkit-scrollbar-corner': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[100]
          }
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: `linear-gradient(135deg, ${colors.blueAccent[400]}, ${colors.primary[500]})`,
          color: 'white',
          py: 2.5,
          px: 4,
          position: 'relative',
          borderBottom: `3px solid ${colors.blueAccent[300]}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${colors.greenAccent[400]}, ${colors.blueAccent[400]}, ${colors.primary[400]})`
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            {/* Icon Container */}
            <Box sx={{ 
              width: 42, 
              height: 42, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              border: `2px solid rgba(255,255,255,0.3)`,
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
            }}>
              🔍
            </Box>
            
            {/* Title and Project Info */}
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '0.5px'
                }}
              >
                Review Submissions
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.95, 
                  fontWeight: 500,
                  color: colors.grey[100],
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  maxWidth: '600px',
                  lineHeight: 1.2
                }}
              >
                {projectName}
              </Typography>
            </Box>
          </Box>
          
          {/* Enhanced Close Button */}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.15)',
              width: 40,
              height: 40,
              border: `2px solid rgba(255,255,255,0.2)`,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05) rotate(90deg)',
                borderColor: 'rgba(255,255,255,0.4)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent 
        dividers 
        sx={{ 
          p: 2,
          maxHeight: '75vh',
          overflow: 'auto',
          backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50],
          '& .MuiDivider-root': {
            borderColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[200]
          },
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '12px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100],
            borderRadius: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[300],
            borderRadius: '6px',
            border: `2px solid ${theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100]}`,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[400]
            }
          },
          '&::-webkit-scrollbar-corner': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100]
          },
          // Force scrollbar to show
          overflowY: 'scroll',
          // Force scrollbars to show
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[300]} ${theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100]}`,
          // Ensure content can scroll
          '& > *': {
            minHeight: 'fit-content'
          },
          // Force scrollbars to always be visible
          '&::-webkit-scrollbar': {
            width: '12px',
            display: 'block'
          },
          // Ensure scrollbar is visible even when not scrolling
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[300],
            borderRadius: '6px',
            border: `2px solid ${theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100]}`,
            minHeight: '50px',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[400]
            }
          },
          // Additional CSS to force scrollbar visibility
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100],
            borderRadius: '6px',
            display: 'block'
          },
          // Force scrollbar to show
          overflowY: 'scroll',
          // Ensure scrollbar is always visible
          '&::-webkit-scrollbar-thumb:vertical': {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[300],
            borderRadius: '6px',
            border: `2px solid ${theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100]}`,
            minHeight: '50px'
          }
        }}
      >
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {paymentJustification && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 1.5,
                color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800],
                borderBottom: `2px solid ${colors.blueAccent[400]}`,
                pb: 0.5,
                display: 'inline-block'
              }}
            >
              Payment Justification
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
                boxShadow: theme.palette.mode === 'dark' 
                  ? `0 2px 8px ${colors.primary[400]}20`
                  : `0 2px 8px ${colors.grey[200]}30`
              }}
            >
              {/* Progress Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 2,
                p: 1.5,
                borderRadius: 1,
                background: `linear-gradient(135deg, ${colors.blueAccent[50]}, ${colors.greenAccent[50]})`,
                border: `1px solid ${colors.blueAccent[200]}`
              }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: colors.greenAccent[400],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  ✓
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: colors.grey[900], mb: 0.5 }}>
                    Payment Justification Ready
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.grey[700], fontWeight: 500 }}>
                    All activities have been completed and are ready for payment review
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: colors.grey[800] }}>
                    Total Budget:
                  </Typography>
                  <Chip 
                    label={`KES ${paymentJustification.totalBudget.toFixed(2)}`} 
                    color="success" 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      px: 1.5
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ color: colors.grey[700], fontWeight: 600 }}>
                    Milestones:
                  </Typography>
                  <Chip 
                    label={paymentJustification.accomplishedMilestones?.length || 0} 
                    color="primary" 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      px: 1.5
                    }}
                  />
                </Box>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700],
                  mb: 2,
                  lineHeight: 1.5,
                  fontWeight: 500
                }}
              >
                The amount requested for payment should be justified by the following completed activities.
              </Typography>
              
              {/* Progress Summary */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 2,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[50],
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[200]}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.grey[700], fontWeight: 600 }}>
                    Activities:
                  </Typography>
                  <Chip 
                    label={paymentJustification.accomplishedActivities?.length || 0} 
                    color="info" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.grey[700], fontWeight: 600 }}>
                    Avg. Budget:
                  </Typography>
                  <Chip 
                    label={`KES ${((paymentJustification.totalBudget / (paymentJustification.accomplishedActivities?.length || 1)) || 0).toFixed(2)}`} 
                    color="warning" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.grey[700], fontWeight: 600 }}>
                    Completion:
                  </Typography>
                  <Box sx={{ 
                    width: 60, 
                    height: 24, 
                    borderRadius: 12, 
                    backgroundColor: colors.grey[200],
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: colors.greenAccent[400],
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}>
                        100%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {paymentJustification.accomplishedMilestones && paymentJustification.accomplishedMilestones.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                      {paymentJustification.accomplishedMilestones.map((milestone, index) => (
                          <Accordion 
                            key={milestone.milestoneId} 
                            disableGutters
                            sx={{ 
                              mb: 1.5,
                              borderRadius: 1,
                              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[100],
                              border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[200]}`,
                              '&:before': { display: 'none' },
                              '&.Mui-expanded': {
                                margin: 0,
                                mb: 1.5
                              }
                            }}
                          >
                              <AccordionSummary 
                                expandIcon={<ExpandMoreIcon sx={{ color: colors.blueAccent[400] }} />}
                                sx={{
                                  px: 2,
                                  py: 1.5,
                                  '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[200]
                                  }
                                }}
                              >
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                                    <Typography 
                                      variant="body1"
                                      sx={{ 
                                        fontWeight: 700,
                                        color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
                                        fontSize: '1.05rem'
                                      }}
                                    >
                                      🎯 {milestone.milestoneName}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Chip 
                                        label={`${paymentJustification.accomplishedActivities.filter(a => a.milestoneId === milestone.milestoneId).length} activities`}
                                        size="small"
                                        color="secondary"
                                        sx={{ fontSize: '0.75rem', height: '20px' }}
                                      />
                                      <Chip 
                                        label={`KES ${paymentJustification.accomplishedActivities
                                          .filter(a => a.milestoneId === milestone.milestoneId)
                                          .reduce((sum, a) => sum + parseFloat(a.budgetAllocated), 0)
                                          .toFixed(2)}`}
                                        size="small"
                                        color="success"
                                        sx={{ fontSize: '0.75rem', height: '20px' }}
                                      />
                                    </Box>
                                  </Box>
                              </AccordionSummary>
                              <AccordionDetails sx={{ 
                                px: 2, 
                                pb: 2
                              }}>
                                  <List dense disablePadding>
                                      {paymentJustification.accomplishedActivities
                                          .filter(a => a.milestoneId === milestone.milestoneId)
                                          .map((activity, actIndex) => (
                                              <ListItem 
                                                key={activity.activityId} 
                                                disablePadding
                                                sx={{ 
                                                  mb: 0.5,
                                                  p: 1.5,
                                                  borderRadius: 0.5,
                                                  backgroundColor: theme.palette.mode === 'dark' ? colors.primary[300] : 'white',
                                                  border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[200] : colors.grey[100]}`
                                                }}
                                              >
                                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                    <Box sx={{ flex: 1 }}>
                                                      <Typography sx={{ fontWeight: 600, color: colors.grey[800], mb: 0.5, fontSize: '1rem' }}>
                                                        ✅ {activity.activityName}
                                                      </Typography>
                                                      <Typography sx={{ color: colors.grey[600], fontSize: '0.85rem', fontWeight: 500 }}>
                                                        Activity ID: {activity.activityId}
                                                      </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                      <Chip 
                                                        label={`KES ${parseFloat(activity.budgetAllocated).toFixed(2)}`}
                                                        size="small"
                                                        color="success"
                                                        sx={{ 
                                                          fontWeight: 600,
                                                          fontSize: '0.8rem',
                                                          height: '24px'
                                                        }}
                                                      />
                                                    </Box>
                                                  </Box>
                                              </ListItem>
                                          ))}
                                  </List>
                              </AccordionDetails>
                          </Accordion>
                      ))}
                  </Box>
              ) : (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.blueAccent[50],
                      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.blueAccent[200]}`,
                      '& .MuiAlert-message': {
                        fontWeight: 600,
                        color: colors.grey[700],
                        fontSize: '0.95rem'
                      }
                    }}
                  >
                    No completed milestones with activities found yet.
                  </Alert>
              )}
              
              {/* Summary Footer */}
              <Box sx={{ 
                mt: 2,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.greenAccent[50],
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.greenAccent[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="body2" sx={{ color: colors.grey[700], fontWeight: 600, fontSize: '0.95rem' }}>
                  📊 Payment Justification Summary
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.grey[700], fontWeight: 500 }}>
                    Total Activities:
                  </Typography>
                  <Chip 
                    label={paymentJustification.accomplishedActivities?.length || 0} 
                    color="info" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant="body2" sx={{ color: colors.grey[700], fontWeight: 500, ml: 1 }}>
                    Total Budget:
                  </Typography>
                  <Chip 
                    label={`KES ${paymentJustification.totalBudget.toFixed(2)}`} 
                    color="success" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
        <Box sx={{ 
          my: 3, 
          height: '1px', 
          background: `linear-gradient(90deg, transparent, ${colors.grey[300]}, transparent)` 
        }} />

        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            mb: 2,
            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900],
            borderBottom: `2px solid ${colors.blueAccent[400]}`,
            pb: 0.5,
            display: 'inline-block',
            fontSize: '1.1rem'
          }}
        >
          💳 Payment Requests
        </Typography>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mb: 3,
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
            border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
            boxShadow: theme.palette.mode === 'dark' 
              ? `0 2px 8px ${colors.primary[400]}20`
              : `0 2px 8px ${colors.grey[200]}30`,
            // Custom scrollbar for payment requests list
            '& .MuiList-root::-webkit-scrollbar': {
              width: '8px'
            },
            '& .MuiList-root::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[50],
              borderRadius: '4px'
            },
            '& .MuiList-root::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[200],
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[200] : colors.grey[300]
              }
            }
          }}
        >
          {console.log('🔍 Render - paymentRequests:', paymentRequests, 'length:', paymentRequests?.length)}
          {paymentRequests.length > 0 ? (
            <List>
              {paymentRequests.map((req) => {
                const isDateValid = req.createdAt && !isNaN(new Date(req.createdAt));
                const formattedDate = isDateValid ? new Date(req.createdAt).toLocaleDateString() : 'Date N/A';
                const documentsCount = paymentRequestDetails[req.requestId]?.documents?.filter(doc => doc.documentType !== 'photo_payment')?.length || 0;
                const photosCount = paymentRequestDetails[req.requestId]?.documents?.filter(doc => doc.documentType === 'photo_payment')?.length || 0;

                return (
                  <ListItem 
                    key={req.requestId} 
                    sx={{ 
                      my: 1.5, 
                      p: 2, 
                      border: `1px solid ${isDateValid ? (theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]) : colors.redAccent[400]}`,
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : 'white',
                      '&:hover': {
                        borderColor: colors.blueAccent[400]
                      }
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 800,
                              color: colors.greenAccent[600],
                              mb: 0.5,
                              fontSize: '1.2rem'
                            }}
                          >
                            💰 KES {parseFloat(req.amount).toFixed(2)}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[800],
                              mb: 0.5,
                              fontSize: '1rem'
                            }}
                          >
                            {req.description}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600],
                              fontWeight: 500
                            }}
                          >
                            📅 Requested: {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            }) : 'Date N/A'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={req.status} 
                          color={req.status === 'Approved' ? 'success' : (req.status === 'Rejected' ? 'error' : 'default')} 
                          sx={{ 
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                            fontSize: '0.9rem'
                          }}
                        />
                        <Stack direction="row" spacing={1}>
                          {hasPrivilege('payment_requests.upload_document') && (
                            <Tooltip title="Upload Document">
                              <IconButton 
                                onClick={(e) => { e.stopPropagation(); handleOpenDocumentUploader(req.requestId); }}
                                sx={{
                                  backgroundColor: colors.blueAccent[50],
                                  color: colors.blueAccent[500],
                                  '&:hover': {
                                    backgroundColor: colors.blueAccent[100],
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease-in-out'
                                }}
                              >
                                <AttachFileIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {req.status === 'Pending Review' && hasPrivilege('project_payments.update') && (
                            <>
                              <Tooltip title="Approve Request">
                                <IconButton 
                                  onClick={(e) => { e.stopPropagation(); handleUpdatePaymentStatus(req.requestId, 'Approved'); }} 
                                  disabled={submitting}
                                  sx={{
                                    backgroundColor: colors.greenAccent[50],
                                    color: colors.greenAccent[500],
                                    '&:hover': {
                                      backgroundColor: colors.greenAccent[100],
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                  }}
                                >
                                  <CheckIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Request">
                                <IconButton 
                                  onClick={(e) => { e.stopPropagation(); handleUpdatePaymentStatus(req.requestId, 'Rejected'); }} 
                                  disabled={submitting}
                                  sx={{
                                    backgroundColor: colors.redAccent[50],
                                    color: colors.redAccent[500],
                                    '&:hover': {
                                      backgroundColor: colors.redAccent[100],
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                  }}
                                >
                                  <ClearIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Review Request">
                            <IconButton 
                              onClick={(e) => { e.stopPropagation(); handleOpenApprovalModal(req.requestId); }}
                              sx={{
                                backgroundColor: colors.primary[50],
                                color: colors.primary[500],
                                '&:hover': {
                                  backgroundColor: colors.primary[100],
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <LaunchIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      
                      <Box sx={{ 
                        borderBottom: 2, 
                        borderColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[200], 
                        mt: 2,
                        borderRadius: 1
                      }}>
                          <Tabs 
                            value={tabValues[req.requestId]} 
                            onChange={(event, newValue) => handleTabChange(req.requestId, newValue)} 
                            aria-label="request tabs"
                            sx={{
                              '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '1rem',
                                textTransform: 'none',
                                minHeight: 48,
                                color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
                                '&.Mui-selected': {
                                  color: colors.blueAccent[600],
                                  fontWeight: 700
                                }
                              },
                              '& .MuiTabs-indicator': {
                                backgroundColor: colors.blueAccent[500],
                                height: 3
                              }
                            }}
                          >
                              <Tab label={`📄 Documents (${documentsCount})`} />
                              <Tab label={`📸 Supporting Photos (${photosCount})`} />
                          </Tabs>
                      </Box>
                      <Box sx={{ 
                        mt: 2, 
                        pl: 2, 
                        borderLeft: `2px solid ${colors.blueAccent[400]}`,
                        backgroundColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[50],
                        borderRadius: '0 6px 6px 0',
                        py: 1.5,
                        // Custom scrollbar for document/photo lists
                        '& .MuiList-root::-webkit-scrollbar': {
                          width: '6px'
                        },
                        '& .MuiList-root::-webkit-scrollbar-track': {
                          backgroundColor: theme.palette.mode === 'dark' ? colors.primary[200] : colors.grey[100],
                          borderRadius: '3px'
                        },
                        '& .MuiList-root::-webkit-scrollbar-thumb': {
                          backgroundColor: theme.palette.mode === 'dark' ? colors.primary[100] : colors.grey[300],
                          borderRadius: '3px',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[50] : colors.grey[400]
                          }
                        }
                      }}>
                                                      {tabValues[req.requestId] === 0 && (
                                <Box sx={{
                                  // Custom scrollbar for tab content
                                  '&::-webkit-scrollbar': {
                                    width: '6px'
                                  },
                                  '&::-webkit-scrollbar-track': {
                                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[200] : colors.grey[100],
                                    borderRadius: '3px'
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[100] : colors.grey[300],
                                    borderRadius: '3px',
                                    '&:hover': {
                                      backgroundColor: theme.palette.mode === 'dark' ? colors.primary[50] : colors.grey[400]
                                    }
                                  }
                                }}>
                                  {paymentRequestDetails[req.requestId]?.documents
                                      ?.filter(doc => doc.documentType !== 'photo_payment')
                                      .length > 0 ? (
                                      <List dense disablePadding>
                                          {paymentRequestDetails[req.requestId].documents
                                              .filter(doc => doc.documentType !== 'photo_payment')
                                              .map((doc) => (
                                                  <ListItem 
                                                    key={doc.id} 
                                                    disablePadding 
                                                    sx={{ 
                                                      py: 1,
                                                      px: 1.5,
                                                      mb: 0.5,
                                                      borderRadius: 1,
                                                      backgroundColor: theme.palette.mode === 'dark' ? colors.primary[200] : 'white',
                                                      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[100] : colors.grey[100]}`
                                                    }}
                                                  >
                                                      <ListItemIcon sx={{ minWidth: 40 }}>
                                                        <DocumentIcon 
                                                          fontSize="small" 
                                                          sx={{ color: colors.blueAccent[500] }}
                                                        />
                                                      </ListItemIcon>
                                                      <ListItemText
                                                          primary={
                                                            <Typography sx={{ fontWeight: 700, color: colors.grey[800], fontSize: '1rem' }}>
                                                              {doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                            </Typography>
                                                          }
                                                          secondary={
                                                            <Typography sx={{ color: colors.grey[600], fontSize: '0.9rem', fontWeight: 500 }}>
                                                              👤 Uploaded by: {users[doc.userId] || `User ID: ${doc.userId}`} on {new Date(doc.createdAt).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                              })}
                                                            </Typography>
                                                          }
                                                      />
                                                      <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto' }}>
                                                          <Button
                                                              size="small"
                                                              variant="outlined"
                                                              href={`${serverUrl}/${doc.documentPath}`}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              sx={{
                                                                borderColor: colors.blueAccent[400],
                                                                color: colors.blueAccent[500],
                                                                fontWeight: 600,
                                                                '&:hover': {
                                                                  borderColor: colors.blueAccent[500],
                                                                  backgroundColor: colors.blueAccent[50]
                                                                }
                                                              }}
                                                          >
                                                              👁️ View
                                                          </Button>
                                                          {hasPrivilege('document.update') && (
                                                              <Tooltip title="Edit Document">
                                                                <IconButton 
                                                                  onClick={() => setEditDocumentModal({ open: true, document: doc, newDescription: doc.description || '' })}
                                                                  sx={{
                                                                    backgroundColor: colors.blueAccent[50],
                                                                    color: colors.blueAccent[500],
                                                                    '&:hover': {
                                                                      backgroundColor: colors.blueAccent[100],
                                                                      transform: 'scale(1.1)'
                                                                    },
                                                                    transition: 'all 0.2s ease-in-out'
                                                                  }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                              </Tooltip>
                                                          )}
                                                          {hasPrivilege('document.delete') && (
                                                              <Tooltip title="Delete Document">
                                                                <IconButton 
                                                                  onClick={() => setDeleteConfirmationModal({ open: true, documentId: doc.id })}
                                                                  sx={{
                                                                    backgroundColor: colors.redAccent[50],
                                                                    color: colors.redAccent[500],
                                                                    '&:hover': {
                                                                      backgroundColor: colors.redAccent[100],
                                                                      transform: 'scale(1.1)'
                                                                    },
                                                                    transition: 'all 0.2s ease-in-out'
                                                                  }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                              </Tooltip>
                                                          )}
                                                      </Stack>
                                                  </ListItem>
                                              ))}
                                      </List>
                                  ) : (
                                      <Box sx={{ 
                                        textAlign: 'center', 
                                        py: 3,
                                        color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[500]
                                      }}>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                                          📄 No documents attached to this payment request.
                                        </Typography>
                                      </Box>
                                  )}
                              </Box>
                          )}
                                                      {tabValues[req.requestId] === 1 && (
                                <Box sx={{
                                  // Custom scrollbar for photos tab content
                                  '&::-webkit-scrollbar': {
                                    width: '6px'
                                  },
                                  '&::-webkit-scrollbar-track': {
                                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[200] : colors.grey[100],
                                    borderRadius: '3px'
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[100] : colors.grey[300],
                                    borderRadius: '3px',
                                    '&:hover': {
                                      backgroundColor: theme.palette.mode === 'dark' ? colors.primary[50] : colors.grey[400]
                                    }
                                  }
                                }}>
                                  {paymentRequestDetails[req.requestId]?.documents
                                      .filter(doc => doc.documentType === 'photo_payment').length > 0 ? (
                                          <DragDropContext onDragEnd={handlePhotoReorder}>
                                              <Droppable droppableId={`payment-photos-droppable-${req.requestId}`}>
                                                  {(provided) => (
                                                      <Grid container spacing={2} sx={{ mt: 1 }} {...provided.droppableProps} ref={provided.innerRef}>
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
                                                                              <Paper elevation={2} sx={{ position: 'relative', overflow: 'hidden', border: 'none', height: '100%' }} onContextMenu={(e) => handleContextMenu(e, doc)}>
                                                                                  <Box
                                                                                      ref={el => photoRefs.current[doc.id] = el}
                                                                                      sx={{
                                                                                          position: 'relative',
                                                                                          overflow: 'hidden',
                                                                                          width: '100%',
                                                                                          height: '180px',
                                                                                          cursor: 'grab'
                                                                                      }}
                                                                                  >
                                                                                      <img
                                                                                          src={`${serverUrl}/${doc.documentPath}`}
                                                                                          alt={doc.description || 'Payment Photo'}
                                                                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                                      />
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
                                          ) : (
                                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No supporting photos attached.</Typography>
                                          )}
                              </Box>
                          )}
                      </Box>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              px: 3
            }}>
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 3,
                  backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.blueAccent[50],
                  border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.blueAccent[200]}`,
                  '& .MuiAlert-icon': {
                    color: colors.blueAccent[500]
                  },
                  '& .MuiAlert-message': {
                    fontWeight: 600,
                    color: colors.grey[700],
                    fontSize: '0.95rem'
                  }
                }}
              >
                💳 No payment requests for this project yet.
              </Alert>
            </Box>
          )}
        </Paper>
        <hr />
        <Typography variant="h6" color="primary.main" gutterBottom>Progress Photos</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
            {milestones.length > 0 ? (
                milestones
                    .filter(milestone => projectPhotos.some(photo => photo.milestoneId === milestone.milestoneId))
                    .map((milestone) => {
                    const photosForMilestone = projectPhotos.filter(photo => photo.milestoneId === milestone.milestoneId);
                    return (
                        <Box key={milestone.milestoneId} sx={{ mb: 4 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <PhotoIcon color="primary" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Milestone: {milestone.milestoneName}</Typography>
                            </Stack>
                            {photosForMilestone.length > 0 ? (
                                <DragDropContext onDragEnd={handlePhotoReorder}>
                                    <Droppable droppableId={`milestone-photos-${milestone.milestoneId}`}>
                                        {(provided) => (
                                            <Grid container spacing={2} {...provided.droppableProps} ref={provided.innerRef}>
                                                {photosForMilestone.map((photo, index) => (
                                                    <Draggable key={photo.id} draggableId={photo.id.toString()} index={index} isDragDisabled={submitting}>
                                                        {(provided) => (
                                                            <Grid item xs={12} sm={6} md={4}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <Paper elevation={2} sx={{ position: 'relative', overflow: 'hidden', height: '100%' }} onContextMenu={(e) => handleContextMenu(e, photo)}>
                                                                    <Box
                                                                        ref={el => photoRefs.current[photo.id] = el}
                                                                        sx={{
                                                                            position: 'relative',
                                                                            overflow: 'hidden',
                                                                            width: '100%',
                                                                            height: '180px',
                                                                            cursor: 'grab'
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={`${serverUrl}/${photo.documentPath}`}
                                                                            alt={photo.description || 'Progress Photo'}
                                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                        />
                                                                        {photo.isProjectCover === 1 && (
                                                                            <Chip
                                                                                label="Cover Photo"
                                                                                color="primary"
                                                                                size="small"
                                                                                sx={{ position: 'absolute', top: 8, left: 8 }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                    <Box sx={{ p: 1 }}>
                                                                        <Typography variant="body2" noWrap>{photo.description || 'No description'}</Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Uploaded by: {users[photo.userId] || `User ID: ${doc.userId}`} on {new Date(photo.createdAt).toLocaleDateString()}
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
                            ) : (
                                <Alert severity="info" sx={{ mt: 1 }}>No photos submitted for this milestone.</Alert>
                            )}
                        </Box>
                    );
                })
            ) : (
                <Alert severity="info">No photos submitted for this project.</Alert>
            )}
        </Paper>
        
        {/* Add bottom padding to ensure scrollable content */}
        <Box sx={{ height: '50px', width: '100%' }} />
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 500,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 24px rgba(0,0,0,0.4)' 
              : '0 8px 24px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <PaymentApprovalModal
        open={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        requestId={selectedRequestId}
      />
      
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