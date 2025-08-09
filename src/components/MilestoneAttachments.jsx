import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, CircularProgress, Stack,
  List, ListItem, ListItemText, ListItemSecondaryAction, Chip, LinearProgress,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
// Ensure this import path is correct for your project structure
import apiService from '../api'; 
import { useAuth } from '../context/AuthContext';

const MilestoneAttachments = ({ open, onClose, milestoneId, onUploadSuccess, currentMilestoneName }) => {
  const { user, hasPrivilege } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fileInputRef = useRef(null);

  const fetchAttachments = useCallback(async () => {
    // Check for a valid milestoneId and the necessary privilege
    if (!milestoneId || !hasPrivilege('milestone_attachments.read_all')) {
      if (!milestoneId) {
        setError('No milestone ID provided.');
      }
      setAttachments([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // CORRECTED: Call the milestoneAttachments service directly
      const response = await apiService.milestoneAttachments.getAttachmentsByMilestone(milestoneId);
      // Assuming the response is an array of attachments
      setAttachments(response);
    } catch (err) {
      console.error('Error fetching milestone attachments:', err);
      setError('Failed to load attachments.');
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [milestoneId, hasPrivilege]);

  useEffect(() => {
    // Only fetch attachments when the modal is opened
    if (open) {
      fetchAttachments();
    }
  }, [open, fetchAttachments]);

  const handleFileSelect = (event) => {
    if (!hasPrivilege('milestone_attachments.create')) {
      setSnackbar({ open: true, message: 'Permission denied to upload attachments.', severity: 'error' });
      return;
    }
    const file = event.target.files[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleUploadFile = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // CORRECTED: Call the milestoneAttachments service directly
      await apiService.milestoneAttachments.createAttachment(milestoneId, formData);
      setSnackbar({ open: true, message: 'File uploaded successfully!', severity: 'success' });
      fetchAttachments();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!hasPrivilege('milestone_attachments.delete')) {
      setSnackbar({ open: true, message: 'Permission denied to delete attachments.', severity: 'error' });
      return;
    }
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        // CORRECTED: Call the milestoneAttachments service directly
        await apiService.milestoneAttachments.deleteAttachment(attachmentId);
        setSnackbar({ open: true, message: 'Attachment deleted successfully!', severity: 'success' });
        fetchAttachments();
      } catch (err) {
        console.error('Error deleting attachment:', err);
        setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete attachment.', severity: 'error' });
      }
    }
  };

  const handleDownloadAttachment = (filePath) => {
    window.open(filePath, '_blank');
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Milestone Attachments
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
            Attachments for: {currentMilestoneName}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {attachments.length > 0 ? (
              attachments.map((att) => (
                <ListItem key={att.attachmentId} divider>
                  <ListItemText primary={att.fileName} secondary={att.description} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="download" onClick={() => handleDownloadAttachment(att.filePath)}>
                      <AttachFileIcon />
                    </IconButton>
                    {hasPrivilege('milestone_attachments.delete') && (
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAttachment(att.attachmentId)}>
                            <DeleteIcon color="error" />
                        </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <Alert severity="info">No attachments found for this milestone.</Alert>
            )}
          </List>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {hasPrivilege('milestone_attachments.create') && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
              >
                Upload File
                <input type="file" hidden onChange={handleFileSelect} ref={fileInputRef} />
              </Button>
              {uploading && <LinearProgress sx={{ mt: 1 }} />}
            </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default MilestoneAttachments;