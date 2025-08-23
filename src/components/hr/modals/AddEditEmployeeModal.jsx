import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditEmployeeModal({
  isOpen,
  onClose,
  editedItem,
  employees,
  jobGroups,
  showNotification,
  refreshData
}) {
  const [formData, setFormData] = useState({});
  const [departments, setDepartments] = useState([]);
  const isEditMode = !!editedItem;

  useEffect(() => {
    const fetchDepartments = async () => {
        try {
            const data = await apiService.metadata.departments.getAllDepartments();
            setDepartments(data);
        } catch (error) {
            showNotification('Could not load departments.', 'error');
        }
    };

    if (isOpen) {
        fetchDepartments();
        setFormData(isEditMode ? editedItem : {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            departmentId: '',
            jobGroupId: '',
            gender: '',
            dateOfBirth: '',
            placeOfBirth: '',
            bloodType: '',
            religion: '',
            nationalId: '',
            kraPin: '',
            employmentStatus: 'Active',
            startDate: '',
            emergencyContactName: '',
            emergencyContactRelationship: '',
            emergencyContactPhone: '',
            nationality: '',
            maritalStatus: 'Single',
            employmentType: 'Full-time',
            managerId: '',
            role: ''
        });
    }
  }, [isOpen, isEditMode, editedItem]);

  // NEW useEffect to update formData when editedItem changes
  useEffect(() => {
      if (isEditMode && editedItem) {
          setFormData(editedItem);
      }
  }, [isEditMode, editedItem]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updateEmployee' : 'addEmployee';
    const apiFunction = apiService.hr[action];

    if (!apiFunction) {
      showNotification(`API function for ${action} not found.`, 'error');
      return;
    }
    try {
      const payload = { ...formData, userId: 1 };
      if (isEditMode) {
        await apiFunction(editedItem.staffId, payload);
      } else {
        await apiFunction(payload);
      }
      showNotification(`Employee ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} employee.`, 'error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="employee-form">
          <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Personal Details</Typography>
          {/* UPDATED: Grid component syntax to v2 (item prop removed) */}
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={4}>
              <TextField autoFocus name="firstName" label="First Name" fullWidth value={formData.firstName || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField name="lastName" label="Last Name" fullWidth value={formData.lastName || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
                <FormControl fullWidth required sx={{ minWidth: 200 }}>
                    <InputLabel>Gender</InputLabel>
                    <Select name="gender" value={formData.gender || ''} label="Gender" onChange={handleFormChange}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4}>
                <TextField name="dateOfBirth" label="Date of Birth" type="date" fullWidth value={formData.dateOfBirth?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField name="placeOfBirth" label="Place of Birth" fullWidth value={formData.placeOfBirth || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField name="nationality" label="Nationality" fullWidth value={formData.nationality || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField name="nationalId" label="National ID" fullWidth value={formData.nationalId || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField name="kraPin" label="KRA PIN" fullWidth value={formData.kraPin || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Marital Status</InputLabel>
                <Select name="maritalStatus" value={formData.maritalStatus || ''} label="Marital Status" onChange={handleFormChange}>
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
             <Grid xs={12} sm={6} md={4}>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                    <InputLabel>Blood Type</InputLabel>
                    <Select name="bloodType" value={formData.bloodType || ''} label="Blood Type" onChange={handleFormChange}>
                        <MenuItem value="A+">A+</MenuItem> <MenuItem value="A-">A-</MenuItem>
                        <MenuItem value="B+">B+</MenuItem> <MenuItem value="B-">B-</MenuItem>
                        <MenuItem value="AB+">AB+</MenuItem> <MenuItem value="AB-">AB-</MenuItem>
                        <MenuItem value="O+">O+</MenuItem> <MenuItem value="O-">O-</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField name="religion" label="Religion" fullWidth value={formData.religion || ''} onChange={handleFormChange} />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Contact Information</Typography>
          <Grid container spacing={2}>
             <Grid xs={12} sm={6}>
              <TextField name="email" label="Email" type="email" fullWidth value={formData.email || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField name="phoneNumber" label="Phone Number" fullWidth value={formData.phoneNumber || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField name="emergencyContactName" label="Emergency Contact Name" fullWidth value={formData.emergencyContactName || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Emergency Contact Relationship</InputLabel>
                <Select name="emergencyContactRelationship" value={formData.emergencyContactRelationship || ''} label="Emergency Contact Relationship" onChange={handleFormChange}>
                  <MenuItem value="Spouse">Spouse</MenuItem>
                  <MenuItem value="Parent">Parent</MenuItem>
                  <MenuItem value="Sibling">Sibling</MenuItem>
                  <MenuItem value="Child">Child</MenuItem>
                  <MenuItem value="Friend">Friend</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField name="emergencyContactPhone" label="Emergency Contact Phone" fullWidth value={formData.emergencyContactPhone || ''} onChange={handleFormChange} />
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Employment Details</Typography>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={4}>
              <FormControl fullWidth required sx={{ minWidth: 200 }}>
                <InputLabel>Department</InputLabel>
                <Select name="departmentId" value={formData.departmentId || ''} onChange={handleFormChange} label="Department">
                  {Array.isArray(departments) && departments.map((dept) => (
                    <MenuItem key={dept.departmentId} value={dept.departmentId}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              {Array.isArray(jobGroups) && jobGroups.length > 0 ? (
                <FormControl fullWidth required sx={{ minWidth: 200 }}>
                  <InputLabel>Job Group / Title</InputLabel>
                  <Select name="jobGroupId" value={formData.jobGroupId || ''} onChange={handleFormChange} label="Job Group / Title">
                    {jobGroups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.groupName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  name="jobGroupId"
                  label="Job Group / Title"
                  fullWidth
                  value=""
                  disabled
                  helperText="Loading job groups..."
                />
              )}
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <FormControl fullWidth required sx={{ minWidth: 200 }}>
                  <InputLabel>Employment Type</InputLabel>
                  <Select name="employmentType" value={formData.employmentType || ''} label="Employment Type" onChange={handleFormChange}>
                      <MenuItem value="Full-time">Full-time</MenuItem>
                      <MenuItem value="Part-time">Part-time</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Intern">Intern</MenuItem>
                  </Select>
              </FormControl>
            </Grid>
             <Grid xs={12} sm={6} md={4}>
                <FormControl fullWidth required sx={{ minWidth: 200 }}>
                    <InputLabel>Employment Status</InputLabel>
                    <Select name="employmentStatus" value={formData.employmentStatus || ''} label="Employment Status" onChange={handleFormChange}>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="On Leave">On Leave</MenuItem>
                        <MenuItem value="Terminated">Terminated</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={4}>
                <TextField name="startDate" label="Start Date" type="date" fullWidth value={formData.startDate?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Manager</InputLabel>
                <Select name="managerId" value={formData.managerId || ''} label="Manager" onChange={handleFormChange}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {Array.isArray(employees) && employees.map((emp) => (
                      <MenuItem key={emp.staffId} value={emp.staffId}>{emp.firstName} {emp.lastName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
        <Button type="submit" form="employee-form" variant="contained" color="success">
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}