import React, { useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, CircularProgress, Alert
} from '@mui/material';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';

const ContractorPhotoUploader = ({ open, onClose, projectId, projectName, onSubmit }) => {
  const fileInputRef = useRef(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };
  
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(projectId, file, caption);
      setCaption('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCaption('');
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Progress Photo for: {projectName}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleFileSubmit}>
          <TextField
            autoFocus
            margin="dense"
            label="Caption (e.g., 'Foundation work complete')"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={caption}
            onChange={handleCaptionChange}
            sx={{ mb: 2 }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSubmit}
            style={{ display: 'none' }}
            id="photo-upload-button"
          />
          <label htmlFor="photo-upload-button">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadFileIcon />}
              disabled={submitting}
            >
              Select Photo to Upload
            </Button>
          </label>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractorPhotoUploader;