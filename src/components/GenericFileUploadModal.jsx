import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, Button, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
  ListItemIcon
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Add as AddIcon, InsertDriveFile as DocumentIcon } from '@mui/icons-material';

/**
 * A reusable modal component for uploading files.
 * @param {boolean} open - Controls the visibility of the modal.
 * @param {function} onClose - Function to call when the modal is closed.
 * @param {string} title - The title of the upload dialog.
 * @param {object} uploadConfig - Configuration for the upload process.
 * - {array} options - Array of objects for the dropdown selector { value, label }.
 * - {string} optionsLabel - Label for the dropdown selector.
 * - {string} apiCallKey - The key to append to the FormData for the selected option.
 * @param {function} submitFunction - The API service function to call for the upload. It should accept a FormData object.
 * @param {object} additionalFormData - An object of additional key-value pairs to append to the FormData.
 */
function GenericFileUploadModal({ open, onClose, title, uploadConfig, submitFunction, additionalFormData }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = useCallback((event) => {
    setSelectedFiles(Array.from(event.target.files));
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleOptionChange = useCallback((e) => {
    setSelectedOption(e.target.value);
  }, []);

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }
    if (uploadConfig.options && !selectedOption) {
      setError(`Please select a ${uploadConfig.optionsLabel}.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();

      // Append additional data passed from the parent
      for (const key in additionalFormData) {
        if (Object.prototype.hasOwnProperty.call(additionalFormData, key)) {
          formData.append(key, additionalFormData[key]);
        }
      }

      // Append the selected option if configured
      if (uploadConfig.options) {
        // 🐛 FIX: Ensure the key 'documentType' is correctly mapped from uploadConfig.apiCallKey
        formData.append(uploadConfig.apiCallKey, selectedOption);
      }

      // Append the files under the key 'documents'
      // 🐛 FIX: This is the critical part that ensures multer receives the file array
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });

      // 🐛 DEBUGGING: Log the FormData to check its content before sending
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // The submitFunction will handle the API call
      await submitFunction(formData);

      setSuccess(true);
      setSelectedFiles([]);
      setSelectedOption('');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };
  
  const isFormValid = selectedFiles.length > 0 && (!uploadConfig.options || selectedOption);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Upload successful!</Alert>}
        
        <Box sx={{ mt: 2 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            multiple
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleUploadClick}
            fullWidth
          >
            {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Choose File(s)'}
          </Button>
          <List dense sx={{ maxHeight: 150, overflowY: 'auto' }}>
            {selectedFiles.map((file, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <DocumentIcon />
                </ListItemIcon>
                <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
              </ListItem>
            ))}
          </List>
        </Box>

        {uploadConfig.options && (
          <FormControl fullWidth margin="dense" sx={{ mt: 2, minWidth: 120 }}>
            <InputLabel id="document-type-label">{uploadConfig.optionsLabel}</InputLabel>
            <Select
              labelId="document-type-label"
              label={uploadConfig.optionsLabel}
              value={selectedOption}
              onChange={handleOptionChange}
              required
            >
              {uploadConfig.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUploadSubmit} variant="contained" disabled={loading || !isFormValid}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

GenericFileUploadModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  uploadConfig: PropTypes.shape({
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })),
    optionsLabel: PropTypes.string,
    apiCallKey: PropTypes.string,
  }),
  submitFunction: PropTypes.func.isRequired,
  additionalFormData: PropTypes.object,
};

GenericFileUploadModal.defaultProps = {
  additionalFormData: {},
};

export default GenericFileUploadModal;