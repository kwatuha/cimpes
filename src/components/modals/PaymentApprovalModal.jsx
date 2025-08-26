import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Stack, Chip,
    List, ListItem, ListItemText, Tab, Tabs, Grid, Paper, IconButton,
    Alert, Select, MenuItem, Snackbar
} from '@mui/material';
import {
    Check as CheckIcon, Clear as ClearIcon, Replay as ReplayIcon,
    Close as CloseIcon, AttachFile as AttachFileIcon,
    InsertDriveFile as DocumentIcon, Photo as PhotoIcon,
    Edit as EditIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import {
    Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';
import apiService from '../../api';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';

const PaymentApprovalModal = ({ open, onClose, requestId }) => {
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
            if (!hasPrivilege('payment_request.read')) {
                setError("You do not have permission to view payment requests.");
                setLoading(false);
                return;
            }

            const [requestData, historyData, levelData, usersData] = await Promise.all([
                apiService.paymentRequests.getRequestById(requestId),
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
    }, [requestId, hasPrivilege]);

    useEffect(() => {
        if (open && requestId) {
            // FIX: Reset state when requestId changes to prevent displaying stale data
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
            const response = await apiService.paymentRequests.recordApprovalAction(requestId, {
                action,
                notes,
                assignedToUserId: assignedTo,
            });
            
            setSnackbar({ open: true, message: `Payment request ${action.toLowerCase()}d successfully!`, severity: 'success' });
            
            // Re-fetch all data to ensure the UI is fully consistent and up-to-date
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

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {request && (
                        <Typography variant="h6" color="inherit">
                            Payment Request for {request.description}: KES {parseFloat(request.amount).toFixed(2)}
                        </Typography>
                    )}
                    {request && <Chip label={request.paymentStatus} color="default" sx={{ ml: 2, backgroundColor: 'white' }} />}
                    <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {request && (
                    <Box>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="request tabs">
                                <Tab label="DETAILS" sx={{ fontWeight: 'bold' }} />
                                <Tab label="DOCUMENTS" sx={{ fontWeight: 'bold' }} />
                                <Tab label="SUPPORTING PHOTOS" sx={{ fontWeight: 'bold' }} />
                                <Tab label="APPROVAL HISTORY" sx={{ fontWeight: 'bold' }} />
                            </Tabs>
                        </Box>
                        <Box sx={{ pt: 2 }}>
                            {tabValue === 0 && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Request Details</Typography>
                                    <Typography variant="body2" color="text.secondary">{request.description}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Submitted on: {new Date(request.submittedAt).toLocaleDateString()}
                                    </Typography>
                                    
                                    {isCurrentUserReviewer ? (
                                        <Alert severity="warning" sx={{ mt: 2 }}>
                                            Your approval is required for this payment request.
                                        </Alert>
                                    ) : request?.paymentStatus === 'Approved for Payment' ? (
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            This request has been fully approved and is ready for payment.
                                        </Alert>
                                    ) : (
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            This request is currently at the {request?.paymentStatus} stage.
                                        </Alert>
                                    )}
                                </Box>
                            )}
                            {tabValue === 1 && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Documents</Typography>
                                    <List dense>
                                        {documents.length > 0 ? (
                                            documents.map((doc) => (
                                                <ListItem key={doc.id}>
                                                    <IconButton><DocumentIcon color="primary" /></IconButton>
                                                    <ListItemText
                                                        primary={doc.documentType.replace(/_/g, ' ').toUpperCase()}
                                                        secondary={doc.description || 'No description provided.'}
                                                    />
                                                    <Stack direction="row" spacing={1}>
                                                        <Button size="small" variant="outlined" href={`${serverUrl}/${doc.documentPath}`} target="_blank">View</Button>
                                                        {hasPrivilege('document.update') && <IconButton size="small"><EditIcon /></IconButton>}
                                                        {hasPrivilege('document.delete') && <IconButton size="small"><DeleteIcon color="error" /></IconButton>}
                                                    </Stack>
                                                </ListItem>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No documents attached.</Typography>
                                        )}
                                    </List>
                                </Box>
                            )}
                            {tabValue === 2 && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Supporting Photos</Typography>
                                    <Grid container spacing={2}>
                                        {photos.length > 0 ? (
                                            photos.map((photo) => (
                                                <Grid item xs={12} sm={6} key={photo.id}>
                                                    <Paper elevation={2}>
                                                        <img src={`${serverUrl}/${photo.documentPath}`} alt={photo.description} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                                        <Typography sx={{ p: 1 }} variant="caption" noWrap>{photo.description || 'No description'}</Typography>
                                                    </Paper>
                                                </Grid>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No photos attached.</Typography>
                                        )}
                                    </Grid>
                                </Box>
                            )}
                            {tabValue === 3 && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Approval History</Typography>
                                    {history.length > 0 ? (
                                        <Timeline>
                                            {history.map((item, index) => {
                                                const actionUser = allUsers[item.actionByUserId];
                                                const assignedUser = item.assignedToUserId ? allUsers[item.assignedToUserId] : null;

                                                return (
                                                    <TimelineItem key={index}>
                                                        <TimelineSeparator>
                                                            <TimelineDot color={item.action === 'Approve' ? 'success' : (item.action === 'Reject' ? 'error' : 'grey')}>
                                                                {item.action === 'Approve' ? <CheckIcon /> : (item.action === 'Reject' ? <ClearIcon /> : <ReplayIcon />)}
                                                            </TimelineDot>
                                                            {index < history.length - 1 && <TimelineConnector />}
                                                        </TimelineSeparator>
                                                        <TimelineContent>
                                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.action}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{item.notes}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                by {actionUser ? `${actionUser.firstName} ${actionUser.lastName}` : `User ID: ${item.actionByUserId}`} on {new Date(item.actionDate).toLocaleDateString()}
                                                            </Typography>
                                                            {assignedUser && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                    Assigned to: {`${assignedUser.firstName} ${assignedUser.lastName}`}
                                                                </Typography>
                                                            )}
                                                        </TimelineContent>
                                                    </TimelineItem>
                                                );
                                            })}
                                        </Timeline>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">No approval history yet.</Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<CheckIcon />}
                        color="success"
                        disabled={submitting || !isCurrentUserReviewer}
                        onClick={() => handleOpenActionDialog('approve')}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<ClearIcon />}
                        color="error"
                        disabled={submitting || !isCurrentUserReviewer}
                        onClick={() => handleOpenActionDialog('reject')}
                    >
                        Reject
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ReplayIcon />}
                        disabled={submitting || !isCurrentUserReviewer}
                        onClick={() => handleOpenActionDialog('return')}
                    >
                        Return
                    </Button>
                </Stack>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>

            <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: null })}>
                <DialogTitle>{actionDialog.type === 'approve' ? 'Approve Request' : actionDialog.type === 'reject' ? 'Reject Request' : 'Return Request'}</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        {actionDialog.type === 'approve' && 'Are you sure you want to approve this payment request?'}
                        {actionDialog.type === 'reject' && 'Please provide a reason for rejecting this request.'}
                        {actionDialog.type === 'return' && 'Please provide a reason for returning this request.'}
                    </Typography>
                    {(actionDialog.type === 'reject' || actionDialog.type === 'return') && (
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Notes"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionDialog({ open: false, type: null })}>Cancel</Button>
                    <Button
                        onClick={() => {
                            if (actionDialog.type === 'approve') {
                                handleAction('Approve', notes || `Approved by ${currentApprovalLevel?.levelName}`);
                            } else if (actionDialog.type === 'reject') {
                                handleAction('Reject', notes || `Rejected by ${currentApprovalLevel?.levelName}`);
                            } else if (actionDialog.type === 'return') {
                                handleAction('Returned for Correction', notes || `Returned for correction by ${currentApprovalLevel?.levelName}`);
                            }
                        }}
                        color={actionDialog.type === 'approve' ? 'success' : 'error'}
                        variant="contained"
                        disabled={submitting}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

PaymentApprovalModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    requestId: PropTypes.number,
};

export default PaymentApprovalModal;