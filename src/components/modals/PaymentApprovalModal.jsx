import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Stack, Chip,
    List, ListItem, ListItemText, Tab, Tabs, Grid, Paper, IconButton,
    Alert, Select, MenuItem, Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../pages/dashboard/theme.js';
import {
    Check as CheckIcon, Clear as ClearIcon, Replay as ReplayIcon,
    Close as CloseIcon, AttachFile as AttachFileIcon,
    InsertDriveFile as DocumentIcon, Photo as PhotoIcon,
    Edit as EditIcon, Delete as DeleteIcon, Paid as PaidIcon
} from '@mui/icons-material';
import {
    Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';
import apiService from '../../api';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';
import PaymentPaidModal from './PaymentPaidModal';

const PaymentApprovalModal = ({ open, onClose, requestId }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const { user, hasPrivilege } = useAuth();
    const serverUrl = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';

    const [request, setRequest] = useState(null);
    const [history, setHistory] = useState([]);
    const [approvalLevels, setApprovalLevels] = useState([]);
    const [allUsers, setAllUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    const [notes, setNotes] = useState('');
    const [actionDialog, setActionDialog] = useState({ open: false, type: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCloseSnackbar = () => {
      setSnackbar({ ...snackbar, open: false });
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // First, fetch the request without a privilege check
            const requestData = await apiService.paymentRequests.getRequestById(requestId);
            
            // Now, perform a granular access check
            const isSubmitter = requestData.userId === user?.id;
            const hasReadPrivilege = hasPrivilege('payment_request.read');
            
            if (!hasReadPrivilege && !isSubmitter) {
                setError("You do not have permission to view this payment request.");
                setLoading(false);
                return;
            }

            // If access is granted, fetch the rest of the data
            const [historyData, levelData, usersData] = await Promise.all([
                apiService.paymentRequests.getPaymentApprovalHistory(requestId),
                apiService.approval.getApprovalLevels(),
                apiService.users.getUsers(),
            ]);
            
            setRequest(requestData);
            setHistory(historyData);
            setApprovalLevels(levelData);

            const usersMap = usersData.reduce((acc, u) => {
                acc[u.userId] = u;
                return acc;
            }, {});
            setAllUsers(usersMap);
            
        } catch (err) {
            console.error('Error fetching payment request data:', err);
            setError(err.response?.data?.message || err.message || "Failed to load payment request details.");
        } finally {
            setLoading(false);
        }
    }, [requestId, user, hasPrivilege]);

    useEffect(() => {
        if (open && requestId) {
            setRequest(null);
            setHistory([]);
            fetchData();
        }
    }, [open, requestId, fetchData]);

    const handleAction = async (action, notes, assignedTo = null) => {
        if (!hasPrivilege('payment_request.update')) {
          setSnackbar({ open: true, message: 'Permission denied to update payment request.', severity: 'error' });
          return;
        }

        setSubmitting(true);
        setActionDialog({ open: false, type: null });

        try {
            await apiService.paymentRequests.recordApprovalAction(requestId, {
                action,
                notes,
                assignedToUserId: assignedTo,
            });
            
            setSnackbar({ open: true, message: `Payment request ${action.toLowerCase()}d successfully!`, severity: 'success' });
            
            await fetchData();

        } catch (err) {
            console.error('Error recording approval action:', err);
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to record approval action.', severity: 'error' });
        } finally {
            setSubmitting(false);
            setNotes('');
        }
    };
    
    // Handlers for the nested action dialog
    const handleOpenActionDialog = (type) => {
        if (!hasPrivilege('payment_request.update')) {
             setSnackbar({ open: true, message: 'Permission denied to update payment request.', severity: 'error' });
             return;
        }
        setActionDialog({ open: true, type });
    };

    const handleConfirmAction = () => {
        if (actionDialog.type !== 'approve' && !notes.trim()) {
            setSnackbar({ open: true, message: 'Notes are required for rejection or return.', severity: 'warning' });
            return;
        }
        
        const actionText = actionDialog.type === 'approve' ? 'Approve' : (actionDialog.type === 'reject' ? 'Reject' : 'Returned for Correction');
        const actionNotes = notes || `Approved by ${currentApprovalLevel?.levelName}`;
        
        handleAction(actionText, actionNotes);
    };
    
    const handleMarkAsPaid = async (paidRequestId, paidFormData) => {
        if (!hasPrivilege('payment_details.create')) {
            setSnackbar({ open: true, message: 'Permission denied to mark as paid.', severity: 'error' });
            return;
        }
        setSubmitting(true);
        try {
            await apiService.paymentRequests.createPaymentDetails(paidRequestId, paidFormData);
            setSnackbar({ open: true, message: 'Payment recorded successfully!', severity: 'success' });
            await fetchData();
            onClose();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to record payment.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) {
        return null;
    }

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <Alert severity="error">{error}</Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    const documents = request.documents?.filter(doc => doc.documentType !== 'photo_payment') || [];
    const photos = request.documents?.filter(doc => doc.documentType === 'photo_payment') || [];
    const currentApprovalLevel = approvalLevels.find(
        (level) => level.levelId === request.currentApprovalLevelId
    );
    const isCurrentUserReviewer = currentApprovalLevel && user?.roleId === currentApprovalLevel.roleId;
    const paidByUser = request?.paymentDetails?.paidByUserId ? allUsers[request.paymentDetails.paidByUserId] : null;

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
                    overflow: 'visible'
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    background: `linear-gradient(135deg, ${colors.blueAccent[400]}, ${colors.primary[500]})`,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    borderBottom: `3px solid ${colors.blueAccent[300]}`,
                    position: 'relative'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {request && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                                width: 40, 
                                height: 40, 
                                borderRadius: '50%', 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                💳
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                                    Payment Request Review
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                                    {request.description}: KES {parseFloat(request.amount).toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {request && (
                            <Chip 
                                label={request.paymentStatus} 
                                color="default" 
                                sx={{ 
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    color: colors.grey[800],
                                    fontWeight: 700,
                                    fontSize: '0.9rem'
                                }} 
                            />
                        )}
                        <IconButton 
                            onClick={onClose} 
                            sx={{ 
                                color: 'white',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            
            <DialogContent 
                dividers 
                sx={{ 
                    p: 3,
                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50],
                    '& .MuiDivider-root': {
                        borderColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[200]
                    }
                }}
            >
                {request && (
                    <Box>
                        <Box sx={{ 
                            borderBottom: 2, 
                            borderColor: colors.blueAccent[400], 
                            mb: 3,
                            borderRadius: 1
                        }}>
                            <Tabs 
                                value={tabValue} 
                                onChange={handleTabChange} 
                                aria-label="request tabs"
                                sx={{
                                    '& .MuiTab-root': {
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        textTransform: 'none',
                                        minHeight: 48,
                                        color: colors.grey[700],
                                        '&.Mui-selected': {
                                            color: colors.blueAccent[600],
                                            fontWeight: 800
                                        }
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: colors.blueAccent[500],
                                        height: 3
                                    }
                                }}
                            >
                                <Tab label="📋 DETAILS" />
                                <Tab label="📄 DOCUMENTS" />
                                <Tab label="📸 SUPPORTING PHOTOS" />
                                <Tab label="⏱️ APPROVAL HISTORY" />
                            </Tabs>
                        </Box>
                        
                        <Box sx={{ pt: 2 }}>
                            {tabValue === 0 && (
                                <Box>
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom 
                                        sx={{ 
                                            fontWeight: 800, 
                                            color: colors.grey[800],
                                            mb: 3,
                                            borderBottom: `2px solid ${colors.blueAccent[400]}`,
                                            pb: 1,
                                            display: 'inline-block'
                                        }}
                                    >
                                        Request Details
                                    </Typography>
                                    
                                    {request.paymentStatus === 'Paid' ? (
                                        <Paper 
                                            variant="outlined" 
                                            sx={{ 
                                                p: 3, 
                                                mb: 3,
                                                borderRadius: 2,
                                                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.greenAccent[50],
                                                border: `2px solid ${colors.greenAccent[400]}`,
                                                boxShadow: `0 4px 12px ${colors.greenAccent[200]}30`
                                            }}
                                        >
                                            <Alert severity="success" sx={{ mb: 2, fontWeight: 600 }}>
                                                ✅ This request has been paid. See details below.
                                            </Alert>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.grey[800], mb: 2 }}>
                                                Payment Information:
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[700] }}>
                                                        Mode: {request.paymentDetails?.paymentMode || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[700] }}>
                                                        Bank: {request.paymentDetails?.bankName || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[700] }}>
                                                        Account: {request.paymentDetails?.accountNumber || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[700] }}>
                                                        Transaction ID: {request.paymentDetails?.transactionId || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[800] }}>
                                                    Notes: {request.paymentDetails?.notes || 'No notes provided.'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                <Typography variant="body2" sx={{ color: colors.grey[600], fontWeight: 500 }}>
                                                    👤 Paid by: {paidByUser ? `${paidByUser.firstName} ${paidByUser.lastName}` : `User ID: ${request.paymentDetails?.paidByUserId}`}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: colors.grey[600], fontWeight: 500 }}>
                                                    📅 Paid on: {new Date(request.paymentDetails?.paidAt).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    }) || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ) : (
                                        <Paper 
                                            variant="outlined" 
                                            sx={{ 
                                                p: 3, 
                                                mb: 3,
                                                borderRadius: 2,
                                                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                                                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
                                                boxShadow: `0 2px 8px ${colors.grey[200]}30`
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[700], mb: 2, lineHeight: 1.6 }}>
                                                {request.description}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: colors.grey[600], fontWeight: 500 }}>
                                                📅 Submitted on: {new Date(request.submittedAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </Typography>
                                        </Paper>
                                    )}

                                    {isCurrentUserReviewer ? (
                                        <Alert 
                                            severity="warning" 
                                            sx={{ 
                                                mt: 2,
                                                fontWeight: 600,
                                                '& .MuiAlert-message': {
                                                    fontWeight: 600,
                                                    color: colors.grey[700]
                                                }
                                            }}
                                        >
                                            ⚠️ Your approval is required for this payment request.
                                        </Alert>
                                    ) : request?.paymentStatus === 'Approved for Payment' ? (
                                        <Alert 
                                            severity="info" 
                                            sx={{ 
                                                mt: 2,
                                                fontWeight: 600,
                                                '& .MuiAlert-message': {
                                                    fontWeight: 600,
                                                    color: colors.grey[700]
                                                }
                                            }}
                                        >
                                            ✅ This request has been fully approved and is ready for payment.
                                        </Alert>
                                    ) : (
                                        <Alert 
                                            severity="info" 
                                            sx={{ 
                                                mt: 2,
                                                fontWeight: 600,
                                                '& .MuiAlert-message': {
                                                    fontWeight: 600,
                                                    color: colors.grey[700]
                                                }
                                            }}
                                        >
                                            ℹ️ This request is currently at the {request?.paymentStatus} stage.
                                        </Alert>
                                    )}
                                </Box>
                            )}
                            
                            {tabValue === 1 && (
                                <Box>
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom 
                                        sx={{ 
                                            fontWeight: 800, 
                                            color: colors.grey[800],
                                            mb: 3,
                                            borderBottom: `2px solid ${colors.blueAccent[400]}`,
                                            pb: 1,
                                            display: 'inline-block'
                                        }}
                                    >
                                        Documents
                                    </Typography>
                                    <List dense>
                                        {documents.length > 0 ? (
                                            documents.map((doc) => (
                                                <ListItem 
                                                    key={doc.id}
                                                    sx={{
                                                        mb: 1,
                                                        p: 2,
                                                        borderRadius: 2,
                                                        backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                                                        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[50]
                                                        }
                                                    }}
                                                >
                                                    <IconButton sx={{ color: colors.blueAccent[500] }}>
                                                        <DocumentIcon />
                                                    </IconButton>
                                                    <ListItemText
                                                        primary={
                                                            <Typography sx={{ fontWeight: 700, color: colors.grey[800], fontSize: '1rem' }}>
                                                                {doc.documentType.replace(/_/g, ' ').toUpperCase()}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography sx={{ color: colors.grey[600], fontWeight: 500, mt: 0.5 }}>
                                                                {doc.description || 'No description provided.'}
                                                            </Typography>
                                                        }
                                                    />
                                                    <Stack direction="row" spacing={1}>
                                                        <Button 
                                                            size="small" 
                                                            variant="outlined" 
                                                            href={`${serverUrl}/${doc.documentPath}`} 
                                                            target="_blank"
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
                                                            View
                                                        </Button>
                                                        {hasPrivilege('document.update') && (
                                                            <IconButton 
                                                                size="small"
                                                                sx={{ color: colors.blueAccent[500] }}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        )}
                                                        {hasPrivilege('document.delete') && (
                                                            <IconButton 
                                                                size="small"
                                                                sx={{ color: colors.redAccent[500] }}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        )}
                                                    </Stack>
                                                </ListItem>
                                            ))
                                        ) : (
                                            <Alert 
                                                severity="info"
                                                sx={{
                                                    borderRadius: 2,
                                                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.blueAccent[50],
                                                    border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.blueAccent[200]}`,
                                                    '& .MuiAlert-message': {
                                                        fontWeight: 600,
                                                        color: colors.grey[700]
                                                    }
                                                }}
                                            >
                                                📄 No documents attached to this payment request.
                                            </Alert>
                                        )}
                                    </List>
                                </Box>
                            )}
                            
                            {tabValue === 2 && (
                                <Box>
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom 
                                        sx={{ 
                                            fontWeight: 800, 
                                            color: colors.grey[800],
                                            mb: 3,
                                            borderBottom: `2px solid ${colors.blueAccent[400]}`,
                                            pb: 1,
                                            display: 'inline-block'
                                        }}
                                    >
                                        Supporting Photos
                                    </Typography>
                                    <List dense>
                                        {photos.length > 0 ? (
                                            photos.map((photo) => (
                                                <ListItem 
                                                    key={photo.id}
                                                    sx={{
                                                        mb: 1,
                                                        p: 2,
                                                        borderRadius: 2,
                                                        backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                                                        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[50]
                                                        }
                                                    }}
                                                >
                                                    <IconButton sx={{ color: colors.greenAccent[500] }}>
                                                        <PhotoIcon />
                                                    </IconButton>
                                                    <ListItemText
                                                        primary={
                                                            <Typography sx={{ fontWeight: 700, color: colors.grey[800], fontSize: '1rem' }}>
                                                                Progress Photo
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography sx={{ color: colors.grey[600], fontWeight: 500, mt: 0.5 }}>
                                                                {photo.description || 'No description provided.'}
                                                            </Typography>
                                                        }
                                                    />
                                                    <Stack direction="row" spacing={1}>
                                                        <Button 
                                                            size="small" 
                                                            variant="outlined" 
                                                            href={`${serverUrl}/${photo.documentPath}`} 
                                                            target="_blank"
                                                            sx={{
                                                                borderColor: colors.greenAccent[400],
                                                                color: colors.greenAccent[500],
                                                                fontWeight: 600,
                                                                '&:hover': {
                                                                    borderColor: colors.greenAccent[500],
                                                                    backgroundColor: colors.greenAccent[50]
                                                                }
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                        {hasPrivilege('document.update') && (
                                                            <IconButton 
                                                                size="small"
                                                                sx={{ color: colors.blueAccent[500] }}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        )}
                                                        {hasPrivilege('document.delete') && (
                                                            <IconButton 
                                                                size="small"
                                                                sx={{ color: colors.redAccent[500] }}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        )}
                                                    </Stack>
                                                </ListItem>
                                            ))
                                        ) : (
                                            <Alert 
                                                severity="info"
                                                sx={{
                                                    borderRadius: 2,
                                                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.blueAccent[50],
                                                    border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.blueAccent[200]}`,
                                                    '& .MuiAlert-message': {
                                                        fontWeight: 600,
                                                        color: colors.grey[700]
                                                    }
                                                }}
                                            >
                                                📸 No supporting photos attached to this payment request.
                                            </Alert>
                                        )}
                                    </List>
                                </Box>
                            )}
                            
                            {tabValue === 3 && (
                                <Box>
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom 
                                        sx={{ 
                                            fontWeight: 800, 
                                            color: colors.grey[800],
                                            mb: 3,
                                            borderBottom: `2px solid ${colors.blueAccent[400]}`,
                                            pb: 1,
                                            display: 'inline-block'
                                        }}
                                    >
                                        Approval History
                                    </Typography>
                                    {history.length > 0 ? (
                                        <Timeline>
                                            {history.map((item, index) => (
                                                <TimelineItem key={index}>
                                                    <TimelineSeparator>
                                                        <TimelineDot 
                                                            sx={{ 
                                                                backgroundColor: colors.blueAccent[500],
                                                                color: 'white'
                                                            }}
                                                        />
                                                        {index < history.length - 1 && (
                                                            <TimelineConnector sx={{ backgroundColor: colors.blueAccent[300] }} />
                                                        )}
                                                    </TimelineSeparator>
                                                    <TimelineContent>
                                                        <Paper 
                                                            variant="outlined" 
                                                            sx={{ 
                                                                p: 2,
                                                                mb: 2,
                                                                borderRadius: 2,
                                                                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                                                                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`
                                                            }}
                                                        >
                                                            <Typography variant="body1" sx={{ fontWeight: 700, color: colors.grey[800], mb: 1 }}>
                                                                {item.action}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: colors.grey[600], fontWeight: 500, mb: 1 }}>
                                                                {item.notes}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: colors.grey[500], fontWeight: 500 }}>
                                                                By: {allUsers[item.actionByUserId] ? 
                                                                    `${allUsers[item.actionByUserId].firstName} ${allUsers[item.actionByUserId].lastName}` : 
                                                                    `User ID: ${item.actionByUserId}`} on {new Date(item.actionDate).toLocaleDateString('en-US', { 
                                                                        year: 'numeric', 
                                                                        month: 'long', 
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                            </Typography>
                                                        </Paper>
                                                    </TimelineContent>
                                                </TimelineItem>
                                            ))}
                                        </Timeline>
                                    ) : (
                                        <Alert 
                                            severity="info"
                                            sx={{
                                                borderRadius: 2,
                                                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.blueAccent[50],
                                                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.blueAccent[200]}`,
                                                '& .MuiAlert-message': {
                                                    fontWeight: 600,
                                                    color: colors.grey[700]
                                                }
                                            }}
                                        >
                                            ⏱️ No approval history available yet.
                                        </Alert>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions 
                sx={{ 
                    p: 3,
                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100],
                    borderTop: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`
                }}
            >
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderColor: colors.grey[400],
                        color: colors.grey[700],
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        '&:hover': {
                            borderColor: colors.grey[600],
                            backgroundColor: colors.grey[100]
                        }
                    }}
                >
                    Close
                </Button>
                
                {request?.paymentStatus === 'Approved for Payment' && hasPrivilege('payment_details.create') && (
                    <Button
                        onClick={() => setIsPaidModalOpen(true)}
                        variant="contained"
                        startIcon={<PaidIcon />}
                        sx={{
                            backgroundColor: colors.greenAccent[500],
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            fontSize: '1rem',
                            '&:hover': {
                                backgroundColor: colors.greenAccent[600]
                            }
                        }}
                    >
                        Mark as Paid
                    </Button>
                )}
                
                {isCurrentUserReviewer && (
                    <Stack direction="row" spacing={2}>
                        <Button
                            onClick={() => handleOpenActionDialog('approve')}
                            variant="contained"
                            startIcon={<CheckIcon />}
                            sx={{
                                backgroundColor: colors.greenAccent[500],
                                fontWeight: 700,
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                '&:hover': {
                                    backgroundColor: colors.greenAccent[600]
                                }
                            }}
                        >
                            Approve
                        </Button>
                        <Button
                            onClick={() => handleOpenActionDialog('reject')}
                            variant="contained"
                            startIcon={<ClearIcon />}
                            sx={{
                                backgroundColor: colors.redAccent[500],
                                fontWeight: 700,
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                '&:hover': {
                                    backgroundColor: colors.redAccent[600]
                                }
                            }}
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={() => handleOpenActionDialog('return')}
                            variant="contained"
                            startIcon={<ReplayIcon />}
                            sx={{
                                backgroundColor: colors.blueAccent[500],
                                fontWeight: 700,
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                '&:hover': {
                                    backgroundColor: colors.blueAccent[600]
                                }
                            }}
                        >
                            Return
                        </Button>
                    </Stack>
                )}
            </DialogActions>

            {/* Action Confirmation Dialog */}
            {actionDialog.open && (
                <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: null })} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700, color: colors.grey[800] }}>
                        Confirm {actionDialog.type === 'approve' ? 'Approval' : actionDialog.type === 'reject' ? 'Rejection' : 'Return'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={actionDialog.type === 'approve' ? 'Optional notes for approval' : 'Required notes for this action'}
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setActionDialog({ open: false, type: null })}>Cancel</Button>
                        <Button 
                            onClick={handleConfirmAction} 
                            variant="contained"
                            disabled={actionDialog.type !== 'approve' && !notes.trim()}
                            sx={{
                                backgroundColor: actionDialog.type === 'approve' ? colors.greenAccent[500] : 
                                               actionDialog.type === 'reject' ? colors.redAccent[500] : colors.blueAccent[500],
                                fontWeight: 700,
                                '&:hover': {
                                    backgroundColor: actionDialog.type === 'approve' ? colors.greenAccent[600] : 
                                                   actionDialog.type === 'reject' ? colors.redAccent[600] : colors.blueAccent[600]
                                }
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Payment Paid Modal */}
            <PaymentPaidModal
                open={isPaidModalOpen}
                onClose={() => setIsPaidModalOpen(false)}
                requestId={requestId}
                onSubmit={handleMarkAsPaid}
                submitting={submitting}
            />

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    sx={{ 
                        width: '100%',
                        fontWeight: 600,
                        '& .MuiAlert-message': {
                            fontWeight: 600
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

PaymentApprovalModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    requestId: PropTypes.number.isRequired,
};

export default PaymentApprovalModal;