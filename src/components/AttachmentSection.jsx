// src/components/AttachmentSection.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText, IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress,
  ListItemIcon
} from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon, InsertDriveFile as DocumentIcon } from '@mui/icons-material';
import apiService, { FILE_SERVER_BASE_URL } from '../api'; // Import FILE_SERVER_BASE_URL
import strategicPlanningLabels from '../configs/strategicPlanningLabels'; // Import labels
import { useAuth } from '../context/AuthContext.jsx'; // Import useAuth

/**
 * Helper function to check if the user has a specific privilege.
 * @param {object | null} user - The user object from AuthContext.
 * @param {string} privilegeName - The name of the privilege to check.
 * @returns {boolean} True if the user has the privilege, false otherwise.
 */
const checkUserPrivilege = (user, privilegeName) => {
  return user && user.privileges && Array.isArray(user.privileges) && user.privileges.includes(privilegeName);
};

function AttachmentSection({ entityType, entityId, title, user, reloadTrigger }) {
  const { user: authUser, loading: authLoading } = useAuth(); // Get user from AuthContext
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentDescription, setDocumentDescription] = useState('');

  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  const fetchAttachments = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (authLoading) {
      console.log('AttachmentSection: AuthContext still loading. Skipping fetchAttachments.');
      return;
    }
    // No specific read privilege for attachments, assuming if user can view entity, they can see attachments.
    // If you need a specific privilege like 'document.read_all', add it here.

    try {
      const data = await apiService.strategy.getPlanningDocumentsForEntity(entityType, entityId);
      setAttachments(data);
    } catch (err) {
      console.error(`Error fetching attachments for ${entityType} ${entityId}:`, err);
      setError('Failed to load attachments.');
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, reloadTrigger, authLoading]); // Depend on authLoading

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Function to trigger the hidden file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadSubmit = async () => {
    if (!checkUserPrivilege(authUser, 'document.upload')) {
      setSnackbar({ open: true, message: `You do not have permission to upload documents.`, severity: 'error' });
      return;
    }
    if (!selectedFile) {
      setSnackbar({ open: true, message: 'Please select a file to upload.', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', selectedFile.name);
      formData.append('fileType', selectedFile.type);
      formData.append('fileSize', selectedFile.size);
      formData.append('description', documentDescription);
      formData.append('entityId', entityId);
      formData.append('entityType', entityType);
      // Assuming uploadedBy might come from auth context, if your backend uses it
      // formData.append('uploadedBy', authUser ? authUser.id : null);

      await apiService.strategy.uploadPlanningDocument(formData);

      setSnackbar({ open: true, message: 'Document uploaded successfully!', severity: 'success' });
      setOpenUploadDialog(false);
      setSelectedFile(null);
      setDocumentDescription('');
      fetchAttachments(); // Refresh list
    } catch (err) {
      console.error('Error uploading document:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to upload document.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!checkUserPrivilege(authUser, 'document.delete')) {
      setSnackbar({ open: true, message: `You do not have permission to delete documents.`, severity: 'error' });
      return;
    }
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    setLoading(true);
    try {
      await apiService.strategy.deletePlanningDocument(attachmentId); // Assuming privilege check is done on backend
      setSnackbar({ open: true, message: 'Document deleted successfully!', severity: 'success' });
      fetchAttachments(); // Refresh list
    } catch (err) {
      console.error('Error deleting document:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to delete document.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (authLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '8px', borderLeft: '5px solid #ff9800' }}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100px">
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>Loading user permissions...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '8px', borderLeft: '5px solid #ff9800' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary.main">{title || strategicPlanningLabels.attachments.title}</Typography>
        {checkUserPrivilege(authUser, 'document.upload') && (
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setOpenUploadDialog(true)}
            sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#e68a00' } }}
          >
            {strategicPlanningLabels.attachments.uploadButton}
          </Button>
        )}
      </Box>

      {loading && <CircularProgress size={24} />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && attachments.length === 0 ? (
        <Alert severity="info">{strategicPlanningLabels.attachments.noDocuments.replace('{entityType}', entityType)}</Alert>
      ) : (
        <List>
          {attachments.map((doc) => (
            <ListItem
              key={doc.attachmentId}
              divider
              secondaryAction={
                checkUserPrivilege(authUser, 'document.delete') && (
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAttachment(doc.attachmentId)}>
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <ListItemIcon>
                <DocumentIcon />
              </ListItemIcon>
              <ListItemText
                primary={doc.fileName}
                secondary={doc.description || `Type: ${doc.fileType} | Size: ${(doc.fileSize / 1024).toFixed(2)} KB`}
              />
              <Button size="small" variant="outlined" sx={{ml: 2}} href={`${FILE_SERVER_BASE_URL}${doc.filePath}`} target="_blank" rel="noopener noreferrer">
                  View
              </Button>
            </ListItem>
          ))}
        </List>
      )}

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)}>
        <DialogTitle>{strategicPlanningLabels.attachments.uploadDialogTitle}</DialogTitle>
        <DialogContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }} // Hide the actual input
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleUploadClick}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            {selectedFile ? selectedFile.name : strategicPlanningLabels.attachments.chooseFileButton}
          </Button>
          <TextField
            autoFocus
            margin="dense"
            label={strategicPlanningLabels.attachments.descriptionLabel}
            type="text"
            fullWidth
            multiline
            rows={2}
            value={documentDescription}
            onChange={(e) => setDocumentDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button onClick={handleUploadSubmit} variant="contained" disabled={loading || !selectedFile}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default AttachmentSection;
