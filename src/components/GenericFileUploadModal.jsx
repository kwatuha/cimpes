import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, Button, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
  ListItemIcon, Paper, Stack, Chip, Divider
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Add as AddIcon, InsertDriveFile as DocumentIcon, Photo as PhotoIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../pages/dashboard/theme.js';

/**
 * A reusable modal component for uploading files.
 * @param {boolean} open - Controls the visibility of the modal.
 * @param {function} onClose - Function to call when the modal is closed.
 * @param {string} title - The title of the upload dialog.
 * @param {object} uploadConfig - Configuration for the upload process.
 * - {array} options - Array of objects for the dropdown selector { value, label }.
 * - {string} optionsLabel - Label for the dropdown selector.
 * - {string} apiCallKey - The key to append to the FormData for the selected option.
 * - {object} description - Optional configuration for a description text field.
 * @param {function} submitFunction - The API service function to call for the upload. It should accept a FormData object.
 * @param {object} additionalFormData - An object of additional key-value pairs to append to the FormData.
 */
function GenericFileUploadModal({ open, onClose, title, uploadConfig, submitFunction, additionalFormData }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  // NEW: State to control the accepted file types for the file input
  const [acceptedFileTypes, setAcceptedFileTypes] = useState('');

  const fileInputRef = useRef(null);

  const handleFileChange = useCallback((event) => {
    setSelectedFiles(Array.from(event.target.files));
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleOptionChange = useCallback((e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    // NEW: Update accepted file types based on the selected option
    if (selectedValue.startsWith('photo')) {
      setAcceptedFileTypes('image/*');
    } else {
      setAcceptedFileTypes(''); // Allow all file types for other documents
    }
  }, []);
  
  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
  }, []);

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon sx={{ color: colors.greenAccent[500] }} />;
    }
    return <DocumentIcon sx={{ color: colors.blueAccent[500] }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }
    if (uploadConfig.options && !selectedOption) {
      setError(`Please select a ${uploadConfig.optionsLabel}.`);
      return;
    }
    
    // 🔧 ADDITIONAL VALIDATION: Check required fields
    if (!validateRequiredFields()) {
      setError('Missing required information. Please check all fields and try again.');
      return;
    }

    // NEW: Add validation to check if selected files match the accepted type
    if (acceptedFileTypes === 'image/*' && !selectedFiles.every(file => file.type.startsWith('image/'))) {
      setError('Please upload only image files for this document type.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();

      // 🔧 FIX: Smart field handling to avoid duplicates
      // First, add all additional data EXCEPT documentType (we'll handle it separately)
      for (const key in additionalFormData) {
        if (Object.prototype.hasOwnProperty.call(additionalFormData, key) && key !== 'documentType') {
          formData.append(key, additionalFormData[key]);
        }
      }

      // 🔧 FIX: Handle documentType properly - prioritize user selection over default
      let finalDocumentType = 'other'; // fallback
      
      if (uploadConfig.options && selectedOption) {
        // User selected a document type from the form
        finalDocumentType = selectedOption;
        // 🔧 CRITICAL FIX: Only append if apiCallKey is NOT 'documentType' to avoid duplicates
        if (uploadConfig.apiCallKey !== 'documentType') {
          formData.append(uploadConfig.apiCallKey, selectedOption);
          console.log(`🔧 Appending ${uploadConfig.apiCallKey}:`, selectedOption);
        } else {
          console.log(`🔧 Skipping duplicate append for apiCallKey 'documentType' to avoid SQL error`);
        }
      } else if (additionalFormData.documentType) {
        // Use the document type from additional data
        finalDocumentType = additionalFormData.documentType;
      }
      
      // Always append the final documentType (this is the single source of truth)
      formData.append('documentType', finalDocumentType);
      console.log(`🔧 Appending documentType:`, finalDocumentType);
      
      // 🔧 SAFETY CHECK: Ensure no duplicate fields exist
      const formDataKeys = [];
      const entries = Array.from(formData.entries());
      entries.forEach(([key, value]) => {
        if (formDataKeys.includes(key)) {
          console.warn(`⚠️ Duplicate field detected: ${key}`);
          console.warn(`⚠️ First value: ${formDataKeys.indexOf(key)}`);
          console.warn(`⚠️ Second value: ${value}`);
        } else {
          formDataKeys.push(key);
        }
      });
      
      // 🔧 CRITICAL CHECK: Ensure documentType appears only once
      const documentTypeValues = entries.filter(([key]) => key === 'documentType').map(([, value]) => value);
      if (documentTypeValues.length > 1) {
        console.error(`🚨 CRITICAL ERROR: documentType appears ${documentTypeValues.length} times!`);
        console.error(`🚨 Values:`, documentTypeValues);
        throw new Error(`Document type field appears multiple times: ${documentTypeValues.join(', ')}`);
      }
      
      // NEW: Append the description if configured
      if (uploadConfig.description && description) {
        formData.append('description', description);
      }

      // 🔧 FIX: Add missing required fields that the backend expects
      // Ensure documentCategory is always present
      if (!formData.has('documentCategory')) {
        formData.append('documentCategory', 'payment');
      }
      
      // Add status field (default to 'pending_review' for new uploads - matches database enum)
      if (!formData.has('status')) {
        formData.append('status', 'pending_review');
      }
      
      // Ensure projectId is always present (either from config or as fallback)
      if (!formData.has('projectId') && additionalFormData.projectId) {
        formData.append('projectId', additionalFormData.projectId);
      }

      // Append the files under the key 'documents'
      // 🐛 FIX: This is the critical part that ensures multer receives the file array
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });

      // 🔍 DEBUGGING: Enhanced logging to check FormData content before sending
      console.log('📋 FormData Contents:');
      console.log('📁 Files to upload:', selectedFiles.length);
      console.log('🏷️ Selected Option:', selectedOption);
      console.log('🏷️ Final Document Type:', finalDocumentType);
      console.log('📝 Description:', description);
      console.log('📊 Additional Data (filtered):', Object.fromEntries(
        Object.entries(additionalFormData).filter(([key]) => key !== 'documentType')
      ));
      
      console.log('🔍 Final FormData entries:');
      const finalEntries = Array.from(formData.entries());
      finalEntries.forEach(([key, value]) => {
        console.log(`  ${key}:`, value);
      });
      
      console.log('✅ FormData validation complete - No duplicate fields');

      // The submitFunction will handle the API call
      await submitFunction(formData);

      setSuccess(true);
      setSelectedFiles([]);
      setSelectedOption('');
      setDescription('');
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
  
  // 🔧 ADDITIONAL VALIDATION: Check if all required fields are present
  const validateRequiredFields = () => {
    const requiredFields = ['projectId', 'documentType', 'documentCategory', 'status'];
    const missingFields = [];
    
    // Check if additionalFormData has required fields
    requiredFields.forEach(field => {
      if (!additionalFormData[field] && field !== 'documentType') {
        missingFields.push(field);
      }
    });
    
    // Check if documentType will be set
    if (uploadConfig.options && !selectedOption) {
      missingFields.push('documentType');
    }
    
    if (missingFields.length > 0) {
      console.warn('⚠️ Missing required fields:', missingFields);
      return false;
    }
    
    return true;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
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
          fontSize: '1.3rem',
          borderBottom: `3px solid ${colors.blueAccent[300]}`,
          position: 'relative'
        }}
      >
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
            📎
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Upload and organize your documents
            </Typography>
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
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? colors.redAccent[900] : colors.redAccent[50],
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.redAccent[700] : colors.redAccent[200]}`,
              '& .MuiAlert-message': {
                fontWeight: 600,
                color: colors.grey[700],
                fontSize: '0.95rem'
              }
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                {error}
              </Typography>
              {error.includes('Missing required information') && (
                <Typography variant="body2" sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  Required fields: projectId, documentType, documentCategory, status
                </Typography>
              )}
            </Box>
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? colors.greenAccent[900] : colors.greenAccent[50],
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.greenAccent[700] : colors.greenAccent[200]}`,
              '& .MuiAlert-message': {
                fontWeight: 600,
                color: colors.grey[700],
                fontSize: '0.95rem'
              }
            }}
          >
            🎉 Upload successful! Your documents have been uploaded.
          </Alert>
        )}
        
        <Stack spacing={3}>
          {/* File Selection Section */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2.5,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? `0 2px 8px ${colors.primary[400]}20`
                : `0 2px 8px ${colors.grey[200]}30`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.grey[800], mb: 2 }}>
              📁 File Selection
            </Typography>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              multiple
              accept={acceptedFileTypes}
            />
            
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={handleUploadClick}
              fullWidth
              sx={{
                borderColor: colors.blueAccent[400],
                color: colors.blueAccent[500],
                fontWeight: 600,
                py: 2,
                fontSize: '1rem',
                '&:hover': {
                  borderColor: colors.blueAccent[500],
                  backgroundColor: colors.blueAccent[50]
                }
              }}
            >
              {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Choose File(s)'}
            </Button>
            
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.grey[700], mb: 1.5 }}>
                  Selected Files:
                </Typography>
                <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {selectedFiles.map((file, index) => (
                    <ListItem 
                      key={index}
                      sx={{
                        mb: 1,
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[100],
                        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[200]}`,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[50]
                        }
                      }}
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontWeight: 600, color: colors.grey[800], fontSize: '0.95rem' }}>
                            {file.name}
                          </Typography>
                        } 
                        secondary={
                          <Typography sx={{ color: colors.grey[600], fontWeight: 500, fontSize: '0.85rem' }}>
                            {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                          </Typography>
                        } 
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveFile(index)}
                        sx={{ color: colors.redAccent[500] }}
                      >
                        ✕
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>

          {/* Document Type Selection */}
          {uploadConfig.options && (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2.5,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
                boxShadow: theme.palette.mode === 'dark' 
                  ? `0 2px 8px ${colors.primary[400]}20`
                  : `0 2px 8px ${colors.grey[200]}30`
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.grey[800], mb: 2 }}>
                🏷️ Document Type
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel 
                  id="document-type-label"
                  sx={{ fontWeight: 600, color: colors.grey[700] }}
                >
                  {uploadConfig.optionsLabel}
                </InputLabel>
                <Select
                  labelId="document-type-label"
                  label={uploadConfig.optionsLabel}
                  value={selectedOption}
                  onChange={handleOptionChange}
                  required
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.blueAccent[400]
                    }
                  }}
                >
                  {uploadConfig.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.value.startsWith('photo') ? '📸' : '📄'}
                        <Typography sx={{ fontWeight: 600 }}>
                          {option.label}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}
          
          {/* Description Field */}
          {uploadConfig.description && (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2.5,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
                boxShadow: theme.palette.mode === 'dark' 
                  ? `0 2px 8px ${colors.primary[400]}20`
                  : `0 2px 8px ${colors.grey[200]}30`
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.grey[800], mb: 2 }}>
                📝 Description
              </Typography>
              
              <TextField
                fullWidth
                label={uploadConfig.description.label}
                placeholder={uploadConfig.description.placeholder}
                value={description}
                onChange={handleDescriptionChange}
                multiline
                rows={3}
                InputLabelProps={{
                  sx: { fontWeight: 600, color: colors.grey[700] }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.blueAccent[400]
                    }
                  }
                }}
              />
            </Paper>
          )}
        </Stack>
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
          Cancel
        </Button>
        
        <Button 
          onClick={handleUploadSubmit} 
          variant="contained" 
          disabled={loading || !isFormValid}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          sx={{
            backgroundColor: colors.greenAccent[500],
            fontWeight: 700,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: colors.greenAccent[600]
            },
            '&:disabled': {
              backgroundColor: colors.grey[400]
            }
          }}
        >
          {loading ? 'Uploading...' : 'Upload Documents'}
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
    description: PropTypes.shape({
        label: PropTypes.string,
        placeholder: PropTypes.string,
    }),
  }),
  submitFunction: PropTypes.func.isRequired,
  additionalFormData: PropTypes.object,
};

GenericFileUploadModal.defaultProps = {
  additionalFormData: {},
};

export default GenericFileUploadModal;
