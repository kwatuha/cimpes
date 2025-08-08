// src/components/strategicPlan/AttachmentForm.jsx
import React, { useState } from 'react';
import { Box, TextField, Grid, Button, Typography, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

/**
 * Form component for uploading a Planning Document/Attachment.
 * It uses a file input and a TextField for a description.
 *
 * @param {object} props - The component props.
 * @param {object} props.formData - The current form data.
 * @param {function} props.handleFormChange - The change handler for form inputs.
 */
function AttachmentForm({ formData, handleFormChange }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    // You might need to handle the file data in a parent component's submit handler
    // as file inputs don't work cleanly with a single handleFormChange for all inputs.
  };

  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="description"
            label="File Description"
            fullWidth
            value={formData.description || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <input
            accept="image/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="attachment-file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="attachment-file-upload">
            <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} fullWidth>
              {file ? file.name : 'Upload File'}
            </Button>
          </label>
        </Grid>
        {file && (
            <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>Selected file: {file.name}</Alert>
            </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default AttachmentForm;
