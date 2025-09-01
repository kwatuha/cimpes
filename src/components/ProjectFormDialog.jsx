// src/components/ProjectFormDialog.jsx
import React from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  Stack, useTheme, Paper, Grid, OutlinedInput, Chip,
} from '@mui/material';
import useProjectForm from '../hooks/useProjectForm';
import { getProjectStatusBackgroundColor, getProjectStatusTextColor } from '../utils/projectStatusColors';
import { tokens } from '../pages/dashboard/theme';

const ProjectFormDialog = ({
  open,
  handleClose,
  currentProject,
  onFormSuccess,
  setSnackbar,
  allMetadata, // Now includes projectCategories
  user,
}) => {
  const theme = useTheme();
  // Get the color mode more robustly, defaulting to 'dark' if not available
  const colorMode = theme?.palette?.mode || 'dark';
  const colors = tokens(colorMode);

  const {
    formData,
    formErrors,
    loading,
    handleChange,
    handleMultiSelectChange,
    handleSubmit,
    formSections,
    formSubPrograms,
    formSubcounties,
    formWards,
  } = useProjectForm(currentProject, allMetadata, onFormSuccess, setSnackbar, user);

  const projectStatuses = [
    'Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled',
    'At Risk', 'Stalled', 'Delayed', 'Closed', 'Planning', 'Initiated'
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="lg"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: `linear-gradient(135deg, ${colors.blueAccent[700]}, ${colors.blueAccent[600]})`,
          color: 'white', 
          padding: '16px 24px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.blueAccent[400]}, ${colors.greenAccent[500]})`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            right: '24px',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)`,
            borderRadius: '50%',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box 
            sx={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.greenAccent[500]}, ${colors.blueAccent[400]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '16px'
            }}
          >
            {currentProject ? '✏️' : '🚀'}
          </Box>
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                mb: 0.25,
                lineHeight: 1.2
              }}
            >
              {currentProject ? 'Edit Project' : 'Add New Project'}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9, 
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                fontSize: '0.875rem',
                lineHeight: 1.3
              }}
            >
              {currentProject ? 'Update project information and details' : 'Create a new project with comprehensive details'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
              <DialogContent dividers sx={{ backgroundColor: colors.primary[400], padding: '16px' }}>
        {/* Project Details Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 2.5, 
            borderRadius: '16px',
            background: colorMode === 'dark' 
              ? `linear-gradient(145deg, ${colors.primary[300]}, ${colors.primary[400]})`
              : `linear-gradient(145deg, ${colors.grey[900]}, ${colors.grey[800]})`,
            border: `1px solid ${colors.blueAccent[700]}`,
            boxShadow: `0 6px 24px rgba(0, 0, 0, 0.08)`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.blueAccent[500]})`,
              borderRadius: '16px 16px 0 0',
            }
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              color: colorMode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[300], 
              mb: 2, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📋 Project Details
          </Typography>
          <Grid container spacing={2}>
            {/* Project Category Dropdown */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: 180 }}>
                <InputLabel sx={{ color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200], fontWeight: 'bold' }}>Project Category</InputLabel>
                <Select
                  name="categoryId"
                  label="Project Category"
                  value={formData.categoryId || ''}
                  onChange={handleChange}
                  inputProps={{ 'aria-label': 'Select project category' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: colorMode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[400],
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: colorMode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[300],
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorMode === 'dark' ? colors.greenAccent[500] : colors.greenAccent[400],
                        borderWidth: '2px',
                      },
                    },
                  }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {allMetadata.projectCategories?.map(category => (
                    <MenuItem key={category.categoryId} value={String(category.categoryId)}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                autoFocus 
                name="projectName" 
                label="Project Name" 
                type="text" 
                fullWidth 
                variant="outlined" 
                size="small"
                value={formData.projectName} 
                onChange={handleChange} 
                error={!!formErrors.projectName} 
                helperText={formErrors.projectName}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="directorate" 
                label="Directorate" 
                type="text" 
                fullWidth 
                variant="outlined" 
                size="small"
                value={formData.directorate} 
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="principalInvestigator" 
                label="Principal Investigator" 
                type="text" 
                fullWidth 
                variant="outlined" 
                size="small"
                value={formData.principalInvestigator} 
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="principalInvestigatorStaffId" 
                label="PI Staff ID" 
                type="number" 
                fullWidth 
                variant="outlined" 
                size="small"
                value={formData.principalInvestigatorStaffId} 
                onChange={handleChange} 
                inputProps={{ step: "1", min: "0" }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel sx={{ color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200], fontWeight: 'bold' }}>Status</InputLabel>
                <Select 
                  name="status" 
                  label="Status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  inputProps={{ 'aria-label': 'Select project status' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: colorMode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[400],
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: colorMode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[300],
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorMode === 'dark' ? colors.greenAccent[500] : colors.greenAccent[400],
                        borderWidth: '2px',
                      },
                    },
                  }}
                >
                  {projectStatuses.map(status => (
                    <MenuItem key={status} value={status}>
                      <span style={{ 
                        backgroundColor: getProjectStatusBackgroundColor(status), 
                        color: getProjectStatusTextColor(status), 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        display: 'inline-block', 
                        minWidth: '100px', 
                        textAlign: 'center', 
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {status}
                      </span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="startDate" 
                label="Start Date" 
                type="date" 
                fullWidth 
                variant="outlined" 
                size="small"
                InputLabelProps={{ shrink: true }} 
                value={formData.startDate} 
                onChange={handleChange} 
                error={!!formErrors.startDate} 
                helperText={formErrors.startDate}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="endDate" 
                label="End Date" 
                type="date" 
                fullWidth 
                variant="outlined" 
                size="small"
                InputLabelProps={{ shrink: true }} 
                value={formData.endDate} 
                onChange={handleChange} 
                error={!!formErrors.endDate || !!formErrors.date_range} 
                helperText={formErrors.endDate || formErrors.date_range}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="costOfProject" 
                label="Cost of Project" 
                type="number" 
                fullWidth 
                variant="outlined" 
                size="small"
                value={formData.costOfProject} 
                onChange={handleChange} 
                inputProps={{ step: "0.01", min: "0" }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="paidOut" 
                label="Paid Out" 
                type="number" 
                fullWidth 
                variant="outlined" 
                size="small"
                value={formData.paidOut} 
                onChange={handleChange} 
                inputProps={{ step: "0.01", min: "0" }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="projectDescription" 
                label="Project Description" 
                type="text" 
                fullWidth 
                multiline 
                rows={2} 
                variant="outlined" 
                size="small"
                value={formData.projectDescription} 
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="objective" 
                label="Objective" 
                type="text" 
                fullWidth 
                multiline 
                rows={2} 
                variant="outlined" 
                size="small"
                value={formData.objective} 
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="expectedOutput" 
                label="Expected Output" 
                type="text" 
                fullWidth 
                multiline 
                rows={2} 
                variant="outlined" 
                size="small"
                value={formData.expectedOutput} 
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="expectedOutcome" 
                label="Expected Outcome" 
                type="text" 
                fullWidth 
                multiline 
                rows={2} 
                variant="outlined" 
                size="small"
                value={formData.expectedOutcome} 
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="statusReason" 
                label="Status Reason" 
                type="text" 
                fullWidth 
                multiline 
                rows={2} 
                variant="outlined" 
                size="small"
                value={formData.statusReason} 
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: colors.blueAccent[600],
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.blueAccent[500],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[500],
                      borderWidth: '2px',
                    },
                  },
                                     '& .MuiInputLabel-root': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                     fontWeight: 'bold',
                   },
                   '& .MuiInputBase-input': {
                     color: colorMode === 'dark' ? colors.grey[100] : colors.grey[200],
                   },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Organizational Details Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 2.5, 
            borderRadius: '16px',
            background: colorMode === 'dark' 
              ? `linear-gradient(145deg, ${colors.primary[300]}, ${colors.primary[400]})`
              : `linear-gradient(145deg, ${colors.grey[900]}, ${colors.grey[800]})`,
            border: `1px solid ${colors.blueAccent[700]}`,
            boxShadow: `0 6px 24px rgba(0, 0, 0, 0.08)`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.blueAccent[500]})`,
              borderRadius: '16px 16px 0 0',
            }
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              color: colorMode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[300], 
              mb: 2, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            🏢 Organizational Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Department</InputLabel>
                <Select name="departmentId" label="Department" value={formData.departmentId} onChange={handleChange} inputProps={{ 'aria-label': 'Select department' }} >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {allMetadata.departments.map(dept => (<MenuItem key={dept.departmentId} value={String(dept.departmentId)}>{dept.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" size="small" sx={{ minWidth: 180 }} disabled={!formData.departmentId}>
                <InputLabel>Section</InputLabel>
                <Select name="sectionId" label="Section" value={formData.sectionId} onChange={handleChange} inputProps={{ 'aria-label': 'Select section' }} >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {/* CORRECTED: Use the local state from the hook for dynamic sections */}
                  {formSections?.map(sec => (<MenuItem key={sec.sectionId} value={String(sec.sectionId)}>{sec.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Financial Year</InputLabel>
                <Select name="finYearId" label="Financial Year" value={formData.finYearId} onChange={handleChange} inputProps={{ 'aria-label': 'Select financial year' }} >
                  <MenuItem key='empty-fin-year' value=""><em>None</em></MenuItem>
                  {allMetadata.financialYears.map(fy => (<MenuItem key={fy.finYearId} value={String(fy.finYearId)}>{fy.finYearName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Program</InputLabel>
                <Select name="programId" label="Program" value={formData.programId} onChange={handleChange} inputProps={{ 'aria-label': 'Select program' }} >
                  <MenuItem key='empty-program' value=""><em>None</em></MenuItem>
                  {allMetadata.programs.map(prog => (<MenuItem key={prog.programId} value={String(prog.programId)}>{prog.programme}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" size="small" sx={{ minWidth: 180 }} disabled={!formData.programId}>
                <InputLabel>Sub-Program</InputLabel>
                <Select name="subProgramId" label="Sub-Program" value={formData.subProgramId} onChange={handleChange} inputProps={{ 'aria-label': 'Select sub-program' }} >
                  <MenuItem key='empty-subprogram' value=""><em>None</em></MenuItem>
                  {/* CORRECTED: Use the local state from the hook for dynamic sub-programs */}
                  {formSubPrograms?.map(subProg => (<MenuItem key={subProg.subProgramId} value={String(subProg.subProgramId)}>{subProg.subProgramme}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Geographical Coverage Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            borderRadius: '16px',
            background: colorMode === 'dark' 
              ? `linear-gradient(145deg, ${colors.primary[300]}, ${colors.primary[400]})`
              : `linear-gradient(145deg, ${colors.grey[900]}, ${colors.grey[800]})`,
            border: `1px solid ${colors.blueAccent[700]}`,
            boxShadow: `0 6px 24px rgba(0, 0, 0, 0.08)`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.blueAccent[500]})`,
              borderRadius: '16px 16px 0 0',
            }
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              color: colorMode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[300], 
              mb: 2, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📍 Geographical Coverage
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="county-multi-select-label">Counties</InputLabel>
                <Select labelId="county-multi-select-label" multiple name="countyIds" value={formData.countyIds} onChange={handleMultiSelectChange}
                  input={<OutlinedInput id="select-multiple-chip-county" label="Counties" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={allMetadata.counties.find(c => String(c.countyId) === String(value))?.name || value} />
                      ))}
                    </Box>
                  )}
                  inputProps={{ 'aria-label': 'Select multiple counties' }}
                >
                  {allMetadata.counties.map((county) => (<MenuItem key={county.countyId} value={String(county.countyId)}>{county.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" size="small" sx={{ minWidth: 180 }} disabled={formData.countyIds.length === 0 && (allMetadata.subcounties?.length || 0) === 0}>
                <InputLabel id="subcounty-multi-select-label">Sub-Counties</InputLabel>
                <Select labelId="subcounty-multi-select-label" multiple name="subcountyIds" value={formData.subcountyIds} onChange={handleMultiSelectChange}
                  input={<OutlinedInput id="select-multiple-chip-subcounty" label="Sub-Counties" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={formSubcounties?.find(sc => String(sc.subcountyId) === String(value))?.name || value} />
                      ))}
                    </Box>
                  )}
                  inputProps={{ 'aria-label': 'Select multiple sub-counties' }}
                >
                  {/* CORRECTED: Use the local state from the hook for dynamic sub-counties */}
                  {formSubcounties?.map((subc) => (<MenuItem key={subc.subcountyId} value={String(subc.subcountyId)}>{subc.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" size="small" sx={{ minWidth: 180 }} disabled={formData.subcountyIds.length === 0 && (allMetadata.wards?.length || 0) === 0}>
                <InputLabel id="ward-multi-select-label">Wards</InputLabel>
                <Select labelId="ward-multi-select-label" multiple name="wardIds" value={formData.wardIds} onChange={handleMultiSelectChange}
                  input={<OutlinedInput id="select-multiple-chip-ward" label="Wards" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={formWards?.find(w => String(w.wardId) === String(value))?.name || value} />
                      ))}
                    </Box>
                  )}
                  inputProps={{ 'aria-label': 'Select multiple wards' }}
                >
                  {/* CORRECTED: Use the local state from the hook for dynamic wards */}
                  {formWards?.map((ward) => (<MenuItem key={ward.wardId} value={String(ward.wardId)}>{ward.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>
      <DialogActions 
        sx={{ 
          padding: '20px 24px', 
          borderTop: colorMode === 'dark' 
            ? `1px solid ${colors.blueAccent[700]}`
            : `1px solid ${colors.blueAccent[300]}`,
          background: colorMode === 'dark'
            ? `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`
            : `linear-gradient(135deg, ${colors.grey[800]}, ${colors.grey[700]})`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: colorMode === 'dark'
            ? '0 -4px 20px rgba(0, 0, 0, 0.3)'
            : '0 -2px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Button 
          onClick={handleClose} 
          variant="outlined"
          sx={{
            borderColor: colorMode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[400],
            color: colorMode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[400],
            fontWeight: 'bold',
            px: 3,
            py: 1.2,
            borderRadius: '10px',
            borderWidth: '2px',
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              borderColor: colorMode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[300],
              backgroundColor: colorMode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[300],
              color: 'white',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{
            background: colorMode === 'dark'
              ? `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[500]})`
              : `linear-gradient(135deg, ${colors.greenAccent[500]}, ${colors.greenAccent[400]})`,
            color: 'white',
            fontWeight: 'bold',
            px: 4,
            py: 1.2,
            borderRadius: '10px',
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: colorMode === 'dark'
              ? '0 4px 16px rgba(0, 0, 0, 0.25)'
              : '0 3px 12px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              background: colorMode === 'dark'
                ? `linear-gradient(135deg, ${colors.greenAccent[700]}, ${colors.greenAccent[600]})`
                : `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[500]})`,
              transform: 'translateY(-1px)',
              boxShadow: colorMode === 'dark'
                ? '0 6px 24px rgba(0, 0, 0, 0.35)'
                : '0 5px 18px rgba(0, 0, 0, 0.3)',
            },
            '&:disabled': {
              background: colorMode === 'dark' ? colors.grey[600] : colors.grey[500],
              color: colorMode === 'dark' ? colors.grey[300] : colors.grey[200],
              boxShadow: 'none',
              transform: 'none'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {loading ? 'Processing...' : (currentProject ? 'Update Project' : 'Create Project')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectFormDialog;
