// src/components/ProjectFormDialog.jsx
import React from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  Stack, useTheme, Paper, Grid, OutlinedInput, Chip,
} from '@mui/material';
import useProjectForm from '../hooks/useProjectForm';
import { getProjectStatusBackgroundColor, getProjectStatusTextColor } from '../utils/projectStatusColors';

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
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white', padding: '16px 24px' }}>
        {currentProject ? 'Edit Project' : 'Add New Project'}
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default, padding: '24px' }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.dark, mb: 2 }}>
            Project Details
          </Typography>
          <Grid container spacing={2}>
            {/* CORRECTED: Project Category Dropdown now uses allMetadata */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 180 }}>
                <InputLabel>Project Category</InputLabel>
                <Select
                  name="categoryId"
                  label="Project Category"
                  value={formData.categoryId || ''}
                  onChange={handleChange}
                  inputProps={{ 'aria-label': 'Select project category' }}
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
              <TextField autoFocus margin="dense" name="projectName" label="Project Name" type="text" fullWidth variant="outlined" value={formData.projectName} onChange={handleChange} error={!!formErrors.projectName} helperText={formErrors.projectName} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="directorate" label="Directorate" type="text" fullWidth variant="outlined" value={formData.directorate} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="principalInvestigator" label="Principal Investigator (Text Field)" type="text" fullWidth variant="outlined" value={formData.principalInvestigator} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="principalInvestigatorStaffId" label="PI Staff ID (Foreign Key)" type="number" fullWidth variant="outlined" value={formData.principalInvestigatorStaffId} onChange={handleChange} inputProps={{ step: "1", min: "0" }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select name="status" label="Status" value={formData.status} onChange={handleChange} inputProps={{ 'aria-label': 'Select project status' }} >
                  {projectStatuses.map(status => (
                    <MenuItem key={status} value={status}>
                      <span style={{ backgroundColor: getProjectStatusBackgroundColor(status), color: getProjectStatusTextColor(status), padding: '4px 8px', borderRadius: '4px', display: 'inline-block', minWidth: '80px', textAlign: 'center', fontWeight: 'bold' }}>
                        {status}
                      </span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="startDate" label="Start Date" type="date" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={formData.startDate} onChange={handleChange} error={!!formErrors.startDate} helperText={formErrors.startDate} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="endDate" label="End Date" type="date" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={formData.endDate} onChange={handleChange} error={!!formErrors.endDate || !!formErrors.date_range} helperText={formErrors.endDate || formErrors.date_range} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="costOfProject" label="Cost of Project" type="number" fullWidth variant="outlined" value={formData.costOfProject} onChange={handleChange} inputProps={{ step: "0.01", min: "0" }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="paidOut" label="Paid Out" type="number" fullWidth variant="outlined" value={formData.paidOut} onChange={handleChange} inputProps={{ step: "0.01", min: "0" }} />
            </Grid>
            <Grid item xs={12}>
              <TextField margin="dense" name="projectDescription" label="Project Description" type="text" fullWidth multiline rows={3} variant="outlined" value={formData.projectDescription} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField margin="dense" name="objective" label="Objective" type="text" fullWidth multiline rows={3} variant="outlined" value={formData.objective} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField margin="dense" name="expectedOutput" label="Expected Output" type="text" fullWidth multiline rows={3} variant="outlined" value={formData.expectedOutput} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField margin="dense" name="expectedOutcome" label="Expected Outcome" type="text" fullWidth multiline rows={3} variant="outlined" value={formData.expectedOutcome} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField margin="dense" name="statusReason" label="Status Reason" type="text" fullWidth multiline rows={2} variant="outlined" value={formData.statusReason} onChange={handleChange} />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.dark, mb: 2 }}>
            Organizational Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 180 }}>
                <InputLabel>Department</InputLabel>
                <Select name="departmentId" label="Department" value={formData.departmentId} onChange={handleChange} inputProps={{ 'aria-label': 'Select department' }} >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {allMetadata.departments.map(dept => (<MenuItem key={dept.departmentId} value={String(dept.departmentId)}>{dept.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 180 }} disabled={!formData.departmentId}>
                <InputLabel>Section</InputLabel>
                <Select name="sectionId" label="Section" value={formData.sectionId} onChange={handleChange} inputProps={{ 'aria-label': 'Select section' }} >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {/* CORRECTED: Use the local state from the hook for dynamic sections */}
                  {formSections?.map(sec => (<MenuItem key={sec.sectionId} value={String(sec.sectionId)}>{sec.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 180 }}>
                <InputLabel>Financial Year</InputLabel>
                <Select name="finYearId" label="Financial Year" value={formData.finYearId} onChange={handleChange} inputProps={{ 'aria-label': 'Select financial year' }} >
                  <MenuItem key='empty-fin-year' value=""><em>None</em></MenuItem>
                  {allMetadata.financialYears.map(fy => (<MenuItem key={fy.finYearId} value={String(fy.finYearId)}>{fy.finYearName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 180 }}>
                <InputLabel>Program</InputLabel>
                <Select name="programId" label="Program" value={formData.programId} onChange={handleChange} inputProps={{ 'aria-label': 'Select program' }} >
                  <MenuItem key='empty-program' value=""><em>None</em></MenuItem>
                  {allMetadata.programs.map(prog => (<MenuItem key={prog.programId} value={String(prog.programId)}>{prog.programme}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 180 }} disabled={!formData.programId}>
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

        <Paper elevation={3} sx={{ p: 3, borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.dark, mb: 2 }}>
            Geographical Coverage
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 180 }}>
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
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 180 }} disabled={formData.countyIds.length === 0 && (allMetadata.subcounties?.length || 0) === 0}>
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
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 180 }} disabled={formData.subcountyIds.length === 0 && (allMetadata.wards?.length || 0) === 0}>
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
      <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={handleClose} color="primary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {currentProject ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectFormDialog;
