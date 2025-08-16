import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import apiService from '../../api'; // Make sure the path is correct

export default function HrModals({
  isFormModalOpen, setIsFormModalOpen,
  isEditModalOpen, setIsEditModalOpen,
  modalType,
  editedItem,
  itemToDelete,
  isDeleteConfirmModalOpen,
  setIsDeleteConfirmModalOpen,
  handleDelete,
  employees,
  leaveTypes,
  jobGroups,
  currentEmployeeInView,
  showNotification,
  refreshData,
  refreshEmployee360View,
  isApprovalModalOpen,
  setIsApprovalModalOpen,
  handleUpdateLeaveStatus,
  selectedApplication,
  approvedDates,
  setApprovedDates,
  isReturnModalOpen,
  setIsReturnModalOpen,
  handleRecordReturn,
  actualReturnDate,
  setActualReturnDate,
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isFormModalOpen) {
      switch (modalType) {
        case 'employee': setFormData({ firstName: '', lastName: '', email: '', phoneNumber: '', department: '', title: '', gender: '', dateOfBirth: '', employmentStatus: 'Active', startDate: '', emergencyContactName: '', emergencyContactPhone: '', nationality: '', maritalStatus: '', employmentType: '', managerId: '' }); break;
        case 'leave.type': setFormData({ name: '', description: '', numberOfDays: '' }); break;
        case 'leave.application': setFormData({ staffId: currentEmployeeInView?.staffId || '', leaveTypeId: '', startDate: '', endDate: '', numberOfDays: '', reason: '', handoverStaffId: '', handoverComments: '' }); break;
        case 'performance.review': setFormData({ staffId: currentEmployeeInView?.staffId || '', reviewDate: '', reviewScore: '', comments: '' }); break;
        case 'job.group': setFormData({ groupName: '', salaryScale: '', description: '' }); break;
        case 'compensation': setFormData({ staffId: currentEmployeeInView?.staffId || '', baseSalary: '', allowances: '', bonuses: '', bankName: '', accountNumber: '', payFrequency: '' }); break;
        case 'training': setFormData({ staffId: currentEmployeeInView?.staffId || '', courseName: '', institution: '', certificationName: '', completionDate: '', expiryDate: '' }); break;
        case 'disciplinary': setFormData({ staffId: currentEmployeeInView?.staffId || '', actionType: '', actionDate: '', reason: '', comments: '' }); break;
        case 'contracts': setFormData({ staffId: currentEmployeeInView?.staffId || '', contractType: '', contractStartDate: '', contractEndDate: '', status: '' }); break;
        case 'retirements': setFormData({ staffId: currentEmployeeInView?.staffId || '', retirementDate: '', retirementType: '', comments: '' }); break;
        case 'loans': setFormData({ staffId: currentEmployeeInView?.staffId || '', loanAmount: '', loanDate: '', repaymentSchedule: '', status: '' }); break;
        case 'payroll': setFormData({ staffId: currentEmployeeInView?.staffId || '', payPeriod: '', grossSalary: '', netSalary: '', allowances: '', deductions: '' }); break;
        case 'dependants': setFormData({ staffId: currentEmployeeInView?.staffId || '', dependantName: '', relationship: '', dateOfBirth: '' }); break;
        case 'terminations': setFormData({ staffId: currentEmployeeInView?.staffId || '', exitDate: '', reason: '', exitInterviewDetails: '' }); break;
        case 'bank.details': setFormData({ staffId: currentEmployeeInView?.staffId || '', bankName: '', accountNumber: '', branchName: '', isPrimary: 0 }); break;
        case 'memberships': setFormData({ staffId: currentEmployeeInView?.staffId || '', organizationName: '', membershipNumber: '', startDate: '', endDate: '' }); break;
        case 'benefits': setFormData({ staffId: currentEmployeeInView?.staffId || '', benefitName: '', enrollmentDate: '', status: '' }); break;
        case 'assigned.assets': setFormData({ staffId: currentEmployeeInView?.staffId || '', assetName: '', serialNumber: '', assignmentDate: '', returnDate: '', condition: '' }); break;
        case 'promotions': setFormData({ staffId: currentEmployeeInView?.staffId || '', oldJobGroupId: '', newJobGroupId: '', promotionDate: '', comments: '' }); break;
        case 'project.assignments': setFormData({ staffId: currentEmployeeInView?.staffId || '', projectId: '', milestoneName: '', role: '', status: '', dueDate: '' }); break;
        default: setFormData({});
      }
    } else if (isEditModalOpen) {
      setFormData(editedItem);
    }
  }, [isFormModalOpen, isEditModalOpen, modalType, editedItem, currentEmployeeInView]);
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditModalOpen ? `update${modalType.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}` : `add${modalType.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`;
    const apiFunction = apiService.hr[`${action.charAt(0).toLowerCase() + action.slice(1)}`];

    if (!apiFunction) {
      showNotification(`API function for ${action} not found.`, 'error');
      return;
    }

    try {
      const payload = { ...formData, userId: 1 };
      await apiFunction(isEditModalOpen ? editedItem.id : payload, isEditModalOpen ? payload : undefined);
      showNotification(`${modalType.split('.')[0]} ${isEditModalOpen ? 'updated' : 'added'} successfully.`, 'success');
      
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
      } else {
        setIsFormModalOpen(false);
      }
      
      if (currentEmployeeInView) {
        refreshEmployee360View();
      } else {
        refreshData();
      }
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditModalOpen ? 'update' : 'add'} ${modalType.split('.')[0]}.`, 'error');
    }
  };

  const renderEmployeeValue = (selectedId) => {
    const employee = employees.find(emp => String(emp.staffId) === String(selectedId));
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };
  const renderLeaveTypeValue = (selectedId) => {
    const type = leaveTypes.find(t => String(t.id) === String(selectedId));
    return type ? type.name : '';
  };
  const renderJobGroupValue = (selectedId) => {
    const group = jobGroups.find(g => String(g.id) === String(selectedId));
    return group ? group.groupName : '';
  };

  const renderModalContent = () => {
    const data = isEditModalOpen ? editedItem : formData;
    const handleChange = isEditModalOpen ? (e) => setFormData({ ...formData, [e.target.name]: e.target.value }) : (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    switch (modalType) {
      case 'employee':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="firstName" label="First Name" type="text" value={data?.firstName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="lastName" label="Last Name" type="text" value={data?.lastName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="email" label="Email" type="email" value={data?.email || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="phoneNumber" label="Phone Number" type="tel" value={data?.phoneNumber || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="department" label="Department" type="text" value={data?.department || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="title" label="Title" type="text" value={data?.title || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Gender</InputLabel><Select name="gender" value={data?.gender || ''} onChange={handleChange} label="Gender"><MenuItem value=""><em>Select gender...</em></MenuItem><MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="dateOfBirth" label="Date of Birth" type="date" value={data?.dateOfBirth?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Employment Status</InputLabel><Select name="employmentStatus" value={data?.employmentStatus || 'Active'} onChange={handleChange} label="Employment Status"><MenuItem value="Active">Active</MenuItem><MenuItem value="On Leave">On Leave</MenuItem><MenuItem value="Terminated">Terminated</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="startDate" label="Start Date" type="date" value={data?.startDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="emergencyContactName" label="Emergency Contact Name" type="text" value={data?.emergencyContactName || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="emergencyContactPhone" label="Emergency Contact Phone" type="tel" value={data?.emergencyContactPhone || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="nationality" label="Nationality" type="text" value={data?.nationality || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}><InputLabel>Marital Status</InputLabel><Select name="maritalStatus" value={data?.maritalStatus || ''} onChange={handleChange} label="Marital Status"><MenuItem value=""><em>Select marital status...</em></MenuItem><MenuItem value="Single">Single</MenuItem><MenuItem value="Married">Married</MenuItem><MenuItem value="Divorced">Divorced</MenuItem><MenuItem value="Widowed">Widowed</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}><InputLabel>Employment Type</InputLabel><Select name="employmentType" value={data?.employmentType || ''} onChange={handleChange} label="Employment Type"><MenuItem value=""><em>Select employment type...</em></MenuItem><MenuItem value="Full-time">Full-time</MenuItem><MenuItem value="Part-time">Part-time</MenuItem><MenuItem value="Contract">Contract</MenuItem><MenuItem value="Internship">Internship</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}><InputLabel>Manager/Supervisor</InputLabel><Select name="managerId" value={data?.managerId || ''} onChange={handleChange} label="Manager/Supervisor" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select a manager...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
          </Grid>
        );
      case 'leave.type':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField autoFocus margin="dense" name="name" label="Leave Type Name" type="text" fullWidth value={data?.name || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12}><TextField margin="dense" name="description" label="Description" type="text" fullWidth value={data?.description || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField margin="dense" name="numberOfDays" label="Number of Days" type="number" fullWidth value={data?.numberOfDays || ''} onChange={handleChange} required /></Grid>
          </Grid>
        );
      case 'leave.application':
          return (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Leave Type</InputLabel><Select name="leaveTypeId" value={data?.leaveTypeId || ''} onChange={handleChange} label="Select Leave Type" renderValue={renderLeaveTypeValue}><MenuItem value=""><em>Select a leave type...</em></MenuItem>{leaveTypes.map((type) => (<MenuItem key={type.id} value={String(type.id)}>{type.name}</MenuItem>))}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="startDate" label="Start Date" type="date" value={data?.startDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="endDate" label="End Date" type="date" value={data?.endDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12}><TextField fullWidth margin="normal" name="numberOfDays" label="Number of Days" type="number" value={data?.numberOfDays || ''} onChange={handleChange} required /></Grid>
              <Grid item xs={12}><FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}><InputLabel>Select Responsibility Handover</InputLabel><Select name="handoverStaffId" value={data?.handoverStaffId || ''} onChange={handleChange} label="Select Responsibility Handover" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
              <Grid item xs={12}><TextField fullWidth margin="normal" name="handoverComments" label="Handover Comments" multiline rows={3} value={data?.handoverComments || ''} onChange={handleChange} /></Grid>
              <Grid item xs={12}><TextField fullWidth margin="normal" name="reason" label="Reason for Leave" multiline rows={3} value={data?.reason || ''} onChange={handleChange} required /></Grid>
            </Grid>
          );
      case 'performance.review':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}><Typography variant="body1" sx={{ mb: 2 }}>Review for: <strong>{currentEmployeeInView?.firstName} {currentEmployeeInView?.lastName}</strong></Typography></Grid>
            <Grid item xs={12}><TextField fullWidth margin="normal" name="reviewDate" label="Review Date" type="date" value={data?.reviewDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField fullWidth margin="normal" name="reviewScore" label="Review Score (1-100)" type="number" inputProps={{ min: 1, max: 100 }} value={data?.reviewScore || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12}><TextField fullWidth margin="normal" name="comments" label="Comments" multiline rows={4} value={data?.comments || ''} onChange={handleChange} /></Grid>
          </Grid>
        );
      case 'job.group':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField autoFocus margin="dense" name="groupName" label="Group Name" type="text" fullWidth value={data?.groupName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12}><TextField margin="dense" name="salaryScale" label="Salary Scale" type="number" fullWidth value={data?.salaryScale || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12}><TextField margin="dense" name="description" label="Description" type="text" fullWidth multiline rows={2} value={data?.description || ''} onChange={handleChange} /></Grid>
          </Grid>
        );
      case 'compensation':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="baseSalary" label="Base Salary" type="number" fullWidth value={data?.baseSalary || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="allowances" label="Allowances" type="number" fullWidth value={data?.allowances || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="bonuses" label="Bonuses" type="number" fullWidth value={data?.bonuses || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="bankName" label="Bank Name" type="text" fullWidth value={data?.bankName || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="accountNumber" label="Account Number" type="text" fullWidth value={data?.accountNumber || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Pay Frequency</InputLabel><Select name="payFrequency" value={data?.payFrequency || ''} onChange={handleChange} label="Pay Frequency"><MenuItem value="Monthly">Monthly</MenuItem><MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem><MenuItem value="Weekly">Weekly</MenuItem></Select></FormControl></Grid>
          </Grid>
        );
        case 'training':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="courseName" label="Course Name" type="text" fullWidth value={data?.courseName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="institution" label="Institution" type="text" fullWidth value={data?.institution || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="certificationName" label="Certification Name" type="text" fullWidth value={data?.certificationName || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="completionDate" label="Completion Date" type="date" fullWidth value={data?.completionDate?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="expiryDate" label="Expiry Date" type="date" fullWidth value={data?.expiryDate?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        );
      case 'disciplinary':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Action Type</InputLabel><Select name="actionType" value={data?.actionType || ''} onChange={handleChange} label="Action Type"><MenuItem value="Warning">Warning</MenuItem><MenuItem value="Suspension">Suspension</MenuItem><MenuItem value="Termination">Termination</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="actionDate" label="Action Date" type="date" fullWidth value={data?.actionDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="reason" label="Reason" type="text" fullWidth multiline rows={2} value={data?.reason || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12}><TextField margin="dense" name="comments" label="Comments" type="text" fullWidth multiline rows={2} value={data?.comments || ''} onChange={handleChange} /></Grid>
          </Grid>
        );
      case 'contracts':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="contractType" label="Contract Type" type="text" fullWidth value={data?.contractType || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="contractStartDate" label="Start Date" type="date" fullWidth value={data?.contractStartDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="contractEndDate" label="End Date" type="date" fullWidth value={data?.contractEndDate?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Status</InputLabel><Select name="status" value={data?.status || ''} onChange={handleChange} label="Status"><MenuItem value="Active">Active</MenuItem><MenuItem value="Expired">Expired</MenuItem></Select></FormControl></Grid>
          </Grid>
        );
      case 'retirements':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="retirementDate" label="Retirement Date" type="date" fullWidth value={data?.retirementDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="retirementType" label="Retirement Type" type="text" fullWidth value={data?.retirementType || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12}><TextField margin="dense" name="comments" label="Comments" type="text" fullWidth multiline rows={2} value={data?.comments || ''} onChange={handleChange} /></Grid>
          </Grid>
        );
      case 'loans':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="loanAmount" label="Loan Amount" type="number" fullWidth value={data?.loanAmount || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="loanDate" label="Loan Date" type="date" fullWidth value={data?.loanDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="repaymentSchedule" label="Repayment Schedule" type="text" fullWidth multiline rows={2} value={data?.repaymentSchedule || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Status</InputLabel><Select name="status" value={data?.status || ''} onChange={handleChange} label="Status"><MenuItem value="Active">Active</MenuItem><MenuItem value="Paid">Paid</MenuItem></Select></FormControl></Grid>
          </Grid>
        );
      case 'payroll':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="payPeriod" label="Pay Period" type="date" fullWidth value={data?.payPeriod?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="grossSalary" label="Gross Salary" type="number" fullWidth value={data?.grossSalary || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="netSalary" label="Net Salary" type="number" fullWidth value={data?.netSalary || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="allowances" label="Allowances" type="number" fullWidth value={data?.allowances || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="deductions" label="Deductions" type="number" fullWidth value={data?.deductions || ''} onChange={handleChange} /></Grid>
          </Grid>
        );
      case 'dependants':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="dependantName" label="Dependant Name" type="text" fullWidth value={data?.dependantName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="relationship" label="Relationship" type="text" fullWidth value={data?.relationship || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="dateOfBirth" label="Date of Birth" type="date" fullWidth value={data?.dateOfBirth?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        );
      case 'terminations':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="exitDate" label="Exit Date" type="date" fullWidth value={data?.exitDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField margin="dense" name="reason" label="Reason for Exit" type="text" fullWidth multiline rows={2} value={data?.reason || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12}><TextField margin="dense" name="exitInterviewDetails" label="Exit Interview Details" type="text" fullWidth multiline rows={2} value={data?.exitInterviewDetails || ''} onChange={handleChange} /></Grid>
          </Grid>
        );
      case 'bank.details':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="bankName" label="Bank Name" type="text" fullWidth value={data?.bankName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="accountNumber" label="Account Number" type="text" fullWidth value={data?.accountNumber || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="branchName" label="Branch Name" type="text" fullWidth value={data?.branchName || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12}><FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}><InputLabel>Is Primary?</InputLabel><Select name="isPrimary" value={data?.isPrimary || 0} onChange={handleChange} label="Is Primary?"><MenuItem value={0}>No</MenuItem><MenuItem value={1}>Yes</MenuItem></Select></FormControl></Grid>
          </Grid>
        );
      case 'memberships':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="organizationName" label="Organization Name" type="text" fullWidth value={data?.organizationName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="membershipNumber" label="Membership Number" type="text" fullWidth value={data?.membershipNumber || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="startDate" label="Start Date" type="date" fullWidth value={data?.startDate?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="endDate" label="End Date" type="date" fullWidth value={data?.endDate?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        );
      case 'benefits':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="benefitName" label="Benefit Name" type="text" fullWidth value={data?.benefitName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="enrollmentDate" label="Enrollment Date" type="date" fullWidth value={data?.enrollmentDate?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Status</InputLabel><Select name="status" value={data?.status || ''} onChange={handleChange} label="Status"><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></Select></FormControl></Grid>
          </Grid>
        );
      case 'assigned.assets':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="assetName" label="Asset Name" type="text" fullWidth value={data?.assetName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="serialNumber" label="Serial Number" type="text" fullWidth value={data?.serialNumber || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="assignmentDate" label="Assignment Date" type="date" fullWidth value={data?.assignmentDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="returnDate" label="Return Date" type="date" fullWidth value={data?.returnDate?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="condition" label="Condition" type="text" fullWidth value={data?.condition || ''} onChange={handleChange} /></Grid>
          </Grid>
        );
      case 'promotions':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}><InputLabel>Previous Job Group</InputLabel><Select name="oldJobGroupId" value={data?.oldJobGroupId || ''} onChange={handleChange} label="Previous Job Group" renderValue={renderJobGroupValue}><MenuItem value=""><em>Select job group...</em></MenuItem>{jobGroups.map((group) => (<MenuItem key={group.id} value={String(group.id)}>{group.groupName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>New Job Group</InputLabel><Select name="newJobGroupId" value={data?.newJobGroupId || ''} onChange={handleChange} label="New Job Group" renderValue={renderJobGroupValue}><MenuItem value=""><em>Select job group...</em></MenuItem>{jobGroups.map((group) => (<MenuItem key={group.id} value={String(group.id)}>{group.groupName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="promotionDate" label="Promotion Date" type="date" fullWidth value={data?.promotionDate?.slice(0, 10) || ''} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField margin="dense" name="comments" label="Comments" type="text" fullWidth multiline rows={2} value={data?.comments || ''} onChange={handleChange} /></Grid>
          </Grid>
        );
      case 'project.assignments':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Select Employee</InputLabel><Select name="staffId" value={data?.staffId || ''} onChange={handleChange} label="Select Employee" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select an employee...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="projectId" label="Project ID" type="text" fullWidth value={data?.projectId || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="milestoneName" label="Milestone Name" type="text" fullWidth value={data?.milestoneName || ''} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="role" label="Role" type="text" fullWidth value={data?.role || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Status</InputLabel><Select name="status" value={data?.status || ''} onChange={handleChange} label="Status"><MenuItem value="Not Started">Not Started</MenuItem><MenuItem value="In Progress">In Progress</MenuItem><MenuItem value="Completed">Completed</MenuItem><MenuItem value="On Hold">On Hold</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField margin="dense" name="dueDate" label="Due Date" type="date" fullWidth value={data?.dueDate?.slice(0, 10) || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const action = isEditModalOpen ? 'Edit' : 'Add New';
    switch (modalType) {
      case 'employee': return `${action} Employee`;
      case 'leave.type': return `${action} Leave Type`;
      case 'leave.application': return `${action} Leave Application`;
      case 'performance.review': return `${action} Performance Review`;
      case 'job.group': return `${action} Job Group`;
      case 'compensation': return `${action} Compensation`;
      case 'training': return `${action} Training`;
      case 'disciplinary': return `${action} Disciplinary Record`;
      case 'contracts': return `${action} Contract`;
      case 'retirements': return `${action} Retirement Record`;
      case 'loans': return `${action} Loan Record`;
      case 'payroll': return `${action} Payroll Record`;
      case 'dependants': return `${action} Dependant`;
      case 'terminations': return `${action} Termination Record`;
      case 'bank.details': return `${action} Bank Details`;
      case 'memberships': return `${action} Membership`;
      case 'benefits': return `${action} Benefit`;
      case 'assigned.assets': return `${action} Asset Assignment`;
      case 'promotions': return `${action} Promotion`;
      case 'project.assignments': return `${action} Project Assignment`;
      default: return '';
    }
  };

  const getButtonText = () => isEditModalOpen ? 'Update' : 'Add';

  const getDeletionMessage = () => {
    if (!itemToDelete) return '';
    const { type, name } = itemToDelete;
    switch (type) {
        case 'performanceReview': return `performance review for ${name}`;
        case 'employee': return `employee: ${name}`;
        case 'leaveType': return `leave type: ${name}`;
        case 'leaveApplication': return `leave application for ${name}`;
        case 'jobGroup': return `job group: ${name}`;
        case 'compensation': return `compensation record for ${name}`;
        case 'training': return `training record for ${name}`;
        case 'disciplinary': return `disciplinary record for ${name}`;
        case 'contract': return `contract for ${name}`;
        case 'retirement': return `retirement record for ${name}`;
        case 'loan': return `loan record for ${name}`;
        case 'payroll': return `payroll record for ${name}`;
        case 'dependant': return `dependant record for ${name}`;
        case 'termination': return `termination record for ${name}`;
        case 'bankDetails': return `bank details for ${name}`;
        case 'membership': return `membership record for ${name}`;
        case 'benefit': return `benefit record for ${name}`;
        case 'assignedAsset': return `asset assignment for ${name}`;
        case 'promotion': return `promotion record`;
        case 'projectAssignment': return `project assignment for ${name}`;
        default: return '';
    }
  };

  return (
    <>
      {/* Generic Add/Edit Modal */}
      <Dialog open={isFormModalOpen || isEditModalOpen} onClose={() => isFormModalOpen ? setIsFormModalOpen(false) : setIsEditModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
          {getModalTitle()}
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit}>
            {renderModalContent()}
            <DialogActions>
              <Button onClick={() => isFormModalOpen ? setIsFormModalOpen(false) : setIsEditModalOpen(false)} color="primary" variant="outlined">Cancel</Button>
              <Button type="submit" variant="contained" color="success">
                {getButtonText()}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal (kept separate for clarity) */}
      <Dialog open={isDeleteConfirmModalOpen && itemToDelete !== null} onClose={() => setIsDeleteConfirmModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: 'error.main', color: 'white' }}>Confirm Deletion</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete this {getDeletionMessage()}? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteConfirmModalOpen(false)} color="primary" variant="outlined">Cancel</Button>
          <Button onClick={() => handleDelete(itemToDelete)} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Approval Modal */}
      <Dialog open={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>Approve Leave Application</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2 }}>Requested Dates: <Typography component="span" sx={{ fontWeight: 'bold' }}>{selectedApplication?.startDate} to {selectedApplication?.endDate}</Typography></Typography>
          <TextField fullWidth margin="dense" name="approvedStartDate" label="Approved Start Date" type="date" value={approvedDates.startDate?.slice(0, 10) || ''} onChange={(e) => setApprovedDates({ ...approvedDates, startDate: e.target.value })} required InputLabelProps={{ shrink: true }} />
          <TextField fullWidth margin="dense" name="approvedEndDate" label="Approved End Date" type="date" value={approvedDates.endDate?.slice(0, 10) || ''} onChange={(e) => setApprovedDates({ ...approvedDates, endDate: e.target.value })} required InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsApprovalModalOpen(false)} color="primary" variant="outlined">Cancel</Button>
          <Button onClick={() => { handleUpdateLeaveStatus('Approved', approvedDates.startDate, approvedDates.endDate); setIsApprovalModalOpen(false); }} color="success" variant="contained">Approve</Button>
        </DialogActions>
      </Dialog>
      
      {/* Return Date Modal */}
      <Dialog open={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>Record Return Date</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2 }}>Approved Dates: <Typography component="span" sx={{ fontWeight: 'bold' }}>{selectedApplication?.approvedStartDate} to {selectedApplication?.approvedEndDate}</Typography></Typography>
          <TextField fullWidth margin="dense" name="actualReturnDate" label="Actual Return Date" type="date" value={actualReturnDate?.slice(0, 10) || ''} onChange={(e) => setActualReturnDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsReturnModalOpen(false)} color="primary" variant="outlined">Cancel</Button>
          <Button onClick={() => handleRecordReturn({ preventDefault: () => {} })} color="success" variant="contained">Record Return</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}