import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Grid, Stack, Avatar, Tabs, Tab, IconButton, List, ListItem, ListItemIcon, ListItemText,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MailOutline as MailIcon, PhoneOutlined as PhoneIcon, WcOutlined as GenderIcon
} from '@mui/icons-material';
import apiService from '../../api';

// Import all modals used by this component
import AddEditEmployeeModal from './modals/AddEditEmployeeModal';
import AddEditPerformanceReviewModal from './modals/AddEditPerformanceReviewModal';
import AddEditCompensationModal from './modals/AddEditCompensationModal';
import AddEditTrainingModal from './modals/AddEditTrainingModal';
import AddEditDisciplinaryModal from './modals/AddEditDisciplinaryModal';
import AddEditContractsModal from './modals/AddEditContractsModal';
import AddEditRetirementsModal from './modals/AddEditRetirementsModal';
import AddEditLoansModal from './modals/AddEditLoansModal';
import AddEditPayrollModal from './modals/AddEditPayrollModal';
import AddEditDependantsModal from './modals/AddEditDependantsModal';
import AddEditTerminationsModal from './modals/AddEditTerminationsModal';
import AddEditBankDetailsModal from './modals/AddEditBankDetailsModal';
import AddEditMembershipsModal from './modals/AddEditMembershipsModal';
import AddEditBenefitsModal from './modals/AddEditBenefitsModal';
import AddEditAssignedAssetsModal from './modals/AddEditAssignedAssetsModal';
import AddEditPromotionsModal from './modals/AddEditPromotionsModal';
import AddEditProjectAssignmentsModal from './modals/AddEditProjectAssignmentsModal';
import AddEditLeaveApplicationModal from './modals/AddEditLeaveApplicationModal';
// import AddEditEducationModal from './modals/AddEditEducationModal';

// Helper component for styled list items
const InfoItem = ({ label, value }) => (
    <Grid xs={12} sm={6}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{value || 'N/A'}</Typography>
    </Grid>
);

// Card component for static info
const InfoCard = ({ title, onEdit, children }) => (
    <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
            {onEdit && (
                <IconButton onClick={onEdit} size="small">
                    <EditIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
        {children}
    </Paper>
);

// Helper function to format data for the table cells
const getDisplayValue = (item, field) => {
    if (field.customRenderer) return field.customRenderer(item);
    
    const value = item[field.key];
    if (value === null || value === undefined || value === '') return 'N/A';

    if (field.key.includes('Date') || field.key.includes('Period')) return value.slice(0, 10);
    if (['baseSalary', 'allowances', 'bonuses', 'grossSalary', 'netSalary', 'loanAmount'].includes(field.key)) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    if (field.key === 'isPrimary') return value === 1 ? 'Yes' : 'No';
    return value;
};

export default function Employee360ViewSection({
    employee360View,
    hasPrivilege,
    employees,
    leaveTypes,
    leaveBalances,
    jobGroups,
    handleOpenDeleteConfirmModal,
    showNotification,
    refreshEmployee360View,
}) {
    const [activeTab, setActiveTab] = useState(0);
    const [payrollSubTab, setPayrollSubTab] = useState(0); 
    const [employeeSubTab, setEmployeeSubTab] = useState(0); 

    const [modalState, setModalState] = useState({
        'employee.performance': { isOpen: false, editedItem: null },
        compensation: { isOpen: false, editedItem: null },
        training: { isOpen: false, editedItem: null },
        disciplinary: { isOpen: false, editedItem: null },
        contracts: { isOpen: false, editedItem: null },
        retirements: { isOpen: false, editedItem: null },
        loans: { isOpen: false, editedItem: null },
        payroll: { isOpen: false, editedItem: null },
        dependants: { isOpen: false, editedItem: null },
        terminations: { isOpen: false, editedItem: null },
        'bank_details': { isOpen: false, editedItem: null },
        memberships: { isOpen: false, editedItem: null },
        benefits: { isOpen: false, editedItem: null },
        'assets': { isOpen: false, editedItem: null },
        'promotion': { isOpen: false, editedItem: null },
        'project.assignments': { isOpen: false, editedItem: null },
        'leave.apply': { isOpen: false, editedItem: null },
        employee: { isOpen: false, editedItem: null },
        education: { isOpen: false, editedItem: null },
    });

    if (!employee360View || !employee360View.profile) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography>No employee selected or data not available.</Typography>
            </Paper>
        );
    }

    const {
        profile,
        performanceReviews = [],
        compensations = [],
        trainings = [],
        disciplinaries = [],
        contracts = [],
        retirements = [],
        loans = [],
        payrolls = [],
        dependants = [],
        terminations = [],
        bankDetails = [],
        memberships = [],
        benefits = [],
        assignedAssets = [],
        promotions = [],
        projectAssignments = [],
        education = [],
        leaveApplications = []
    } = employee360View;
    
    const handleOpenAddModal = (sectionName) => {
        if (!hasPrivilege(`${sectionName}.create`) && sectionName !== 'leave.apply') {
             if (!hasPrivilege(sectionName)) {
                showNotification('Permission denied.', 'error');
                return;
             }
        }
        setModalState(prev => ({ ...prev, [sectionName]: { isOpen: true, editedItem: null } }));
    };

    const handleOpenEditModal = (item, sectionName) => {
        if (!hasPrivilege(`${sectionName}.update`)) {
            showNotification('Permission denied.', 'error');
            return;
        }
        setModalState(prev => ({ ...prev, [sectionName]: { isOpen: true, editedItem: item } }));
    };
    
    const handleCloseModal = (sectionName) => {
        setModalState(prev => ({ ...prev, [sectionName]: { isOpen: false, editedItem: null } }));
    };

    const getManagerName = (managerId) => {
        if (!managerId || !employees) return 'N/A';
        const manager = employees.find(emp => String(emp.staffId) === String(managerId));
        return manager ? `${manager.firstName} ${manager.lastName}` : 'N/A';
    };

    const getJobGroupName = (jobGroupId) => {
        if (!jobGroupId || !jobGroups) return 'N/A';
        const group = jobGroups.find(g => String(g.id) === String(jobGroupId));
        return group ? group.groupName : 'N/A';
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderDataSection = (data, modalType, title, fields) => (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                {hasPrivilege(modalType === 'leave.apply' ? modalType : `${modalType}.create`) && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenAddModal(modalType)}>
                        Add New
                    </Button>
                )}
            </Box>
            
            {data && data.length > 0 ? (
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: '8px' }}>
                    <Table sx={{ minWidth: 650 }} size="small">
                        <TableHead sx={{ backgroundColor: 'grey.100' }}>
                            <TableRow>
                                {fields.map((field) => (
                                    <TableCell key={field.key} sx={{ fontWeight: 'bold' }}>{field.label}</TableCell>
                                ))}
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    {fields.map((field) => (
                                        <TableCell key={`${item.id}-${field.key}`}>
                                            {getDisplayValue(item, field)}
                                        </TableCell>
                                    ))}
                                    <TableCell align="right">
                                        {hasPrivilege(`${modalType}.update`) && (
                                            <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(item, modalType)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        {hasPrivilege(`${modalType}.delete`) && (
                                            <IconButton size="small" color="error" onClick={() => handleOpenDeleteConfirmModal(item.id, 'this record', modalType)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic', mt: 2, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                    No {title.toLowerCase().replace(' details', '').replace(' history', '')} found.
                </Typography>
            )}
        </Box>
    );

    const renderPersonalInfoTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <InfoCard title="Basic information" onEdit={() => handleOpenEditModal(profile, 'employee')}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem' }}>
                                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{profile?.firstName} {profile?.lastName}</Typography>
                            <Typography variant="body2" color="text.secondary">{profile?.staffId}</Typography>
                             <List dense sx={{ width: '100%', maxWidth: 360, mt: 1 }}>
                                <ListItem disablePadding><ListItemIcon sx={{minWidth: 32}}><GenderIcon fontSize="small" /></ListItemIcon><ListItemText primary={profile?.gender} /></ListItem>
                                <ListItem disablePadding><ListItemIcon sx={{minWidth: 32}}><MailIcon fontSize="small" /></ListItemIcon><ListItemText primary={profile?.email} /></ListItem>
                                <ListItem disablePadding><ListItemIcon sx={{minWidth: 32}}><PhoneIcon fontSize="small" /></ListItemIcon><ListItemText primary={profile?.phoneNumber} /></ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={12} md={8} container spacing={2} alignContent="center">
                            <InfoItem label="Place of birth" value={profile?.placeOfBirth} />
                            <InfoItem label="Birth date" value={profile?.dateOfBirth?.slice(0, 10)} />
                            <InfoItem label="Blood type" value={profile?.bloodType} />
                            <InfoItem label="Marital Status" value={profile?.maritalStatus} />
                            <InfoItem label="Religion" value={profile?.religion} />
                            <InfoItem label="Nationality" value={profile?.nationality} />
                        </Grid>
                    </Grid>
                </InfoCard>
            </Grid>
            <Grid item xs={12} md={6}>
                 <InfoCard title="Address" onEdit={() => { /* Open Address Modal */ }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Citizen ID address</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{profile?.citizenIdAddress || 'N/A'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Residential address</Typography>
                    <Typography variant="body2" color="text.secondary">{profile?.residentialAddress || 'N/A'}</Typography>
                 </InfoCard>
            </Grid>
            <Grid item xs={12} md={6}>
                <InfoCard title="Emergency contact" onEdit={() => { /* Open Emergency Contact Modal */ }}>
                     <Grid container spacing={2}>
                        <InfoItem label="Name" value={profile?.emergencyContactName} />
                        <InfoItem label="Relationship" value={profile?.emergencyContactRelationship} />
                        <InfoItem label="Phone number" value={profile?.emergencyContactPhone} />
                    </Grid>
                </InfoCard>
            </Grid>
        </Grid>
    );

    const renderEmployeeDetailsTab = () => {
        const handleSubTabChange = (event, newValue) => { setEmployeeSubTab(newValue); };
        return (
            <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={employeeSubTab} onChange={handleSubTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
                        <Tab label="Promotions" /> <Tab label="Training" /> <Tab label="Disciplinary" /> <Tab label="Assigned Assets" /> <Tab label="Project Assignments" />
                    </Tabs>
                </Box>
                {employeeSubTab === 0 && renderDataSection(promotions, 'promotion', 'Promotions', [ { key: 'oldJobGroupId', label: 'Previous Job Group', customRenderer: (item) => getJobGroupName(item.oldJobGroupId) }, { key: 'newJobGroupId', label: 'New Job Group', customRenderer: (item) => getJobGroupName(item.newJobGroupId) }, { key: 'promotionDate', label: 'Promotion Date' } ])}
                {employeeSubTab === 1 && renderDataSection(trainings, 'training', 'Training History', [ { key: 'courseName', label: 'Course Name' }, { key: 'institution', label: 'Institution' }, { key: 'completionDate', label: 'Completion Date' } ])}
                {employeeSubTab === 2 && renderDataSection(disciplinaries, 'disciplinary', 'Disciplinary Records', [ { key: 'actionType', label: 'Action Type' }, { key: 'actionDate', label: 'Action Date' }, { key: 'reason', label: 'Reason' } ])}
                {employeeSubTab === 3 && renderDataSection(assignedAssets, 'assets', 'Assigned Assets', [ { key: 'assetName', label: 'Asset Name' }, { key: 'serialNumber', label: 'Serial No.' }, { key: 'assignmentDate', label: 'Assignment Date' } ])}
                {employeeSubTab === 4 && renderDataSection(projectAssignments, 'project.assignments', 'Project Assignments', [ { key: 'projectId', label: 'Project ID' }, { key: 'milestoneName', label: 'Milestone' }, { key: 'role', label: 'Role' } ])}
            </Box>
        );
    };

    const renderPayrollTab = () => {
        const handleSubTabChange = (event, newValue) => { setPayrollSubTab(newValue); };
        return (
            <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={payrollSubTab} onChange={handleSubTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
                        <Tab label="Compensation" /> <Tab label="Payroll History" /> <Tab label="Bank Details" /> <Tab label="Loans" />
                    </Tabs>
                </Box>
                {payrollSubTab === 0 && renderDataSection(compensations, 'compensation', 'Compensation Details', [ { key: 'baseSalary', label: 'Base Salary' }, { key: 'allowances', label: 'Allowances' }, { key: 'bonuses', label: 'Bonuses' } ])}
                {payrollSubTab === 1 && renderDataSection(payrolls, 'payroll', 'Payroll History', [ { key: 'payPeriod', label: 'Pay Period' }, { key: 'grossSalary', label: 'Gross Salary' }, { key: 'netSalary', label: 'Net Salary' } ])}
                {payrollSubTab === 2 && renderDataSection(bankDetails, 'bank_details', 'Bank Details', [ { key: 'bankName', label: 'Bank Name' }, { key: 'accountNumber', label: 'Account Number' } ])}
                {payrollSubTab === 3 && renderDataSection(loans, 'loans', 'Loans', [ { key: 'loanAmount', label: 'Loan Amount' }, { key: 'loanDate', label: 'Loan Date' }, { key: 'status', label: 'Status' } ])}
            </Box>
        );
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 3 }, bgcolor: '#F7F8FA', borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '12px 12px 0 0' }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
                    <Tab label="Personal Info" />
                    <Tab label="Employee Details" />
                    <Tab label="Payroll Details" />
                    <Tab label="Documents" />
                    <Tab label="Performance" />
                    <Tab label="Education" />
                    <Tab label="Dependants" />
                    <Tab label="Leave History" />
                </Tabs>
            </Box>
            
            <Box sx={{ pt: 3, bgcolor: 'background.paper', p: 3, borderRadius: '0 0 12px 12px' }}>
                {activeTab === 0 && renderPersonalInfoTab()}
                {activeTab === 1 && renderEmployeeDetailsTab()}
                {activeTab === 2 && renderPayrollTab()}
                {activeTab === 3 && renderDataSection(contracts, 'contracts', 'Contracts', [ { key: 'contractType', label: 'Contract Type' }, { key: 'contractStartDate', label: 'Start Date' }, { key: 'contractEndDate', label: 'End Date' } ])}
                {activeTab === 4 && renderDataSection(performanceReviews, 'employee.performance', 'Performance History', [ { key: 'reviewDate', label: 'Review Date' }, { key: 'reviewScore', label: 'Score' }, { key: 'comments', label: 'Comments' } ])}
                {activeTab === 5 && renderDataSection(education, 'education', 'Education History', [ { key: 'degree', label: 'Degree' }, { key: 'institution', label: 'Institution' }, { key: 'completionDate', label: 'Completion Date' } ])}
                {activeTab === 6 && renderDataSection(dependants, 'dependants', 'Family / Dependants', [ { key: 'dependantName', label: 'Name' }, { key: 'relationship', label: 'Relationship' }, { key: 'dateOfBirth', label: 'Date of Birth' } ])}
                
                {activeTab === 7 && (
                    <>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {Array.isArray(leaveBalances) && leaveBalances.map(balance => (
                                <Grid item xs={12} sm={6} md={3} key={balance.leaveTypeId}>
                                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: '8px' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{balance.leaveTypeName}</Typography>
                                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{balance.balance}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ({balance.taken} taken of {balance.allocated} days)
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                        
                        {/* UPDATED: The 'status' field now has a customRenderer for the badge */}
                        {renderDataSection(leaveApplications, 'leave.apply', 'Leave Application History', [ 
                            { key: 'leaveTypeName', label: 'Leave Type' }, 
                            { key: 'startDate', label: 'Start Date' }, 
                            { key: 'endDate', label: 'End Date' }, 
                            { key: 'numberOfDays', label: 'Days' }, 
                            { 
                              key: 'status', 
                              label: 'Status',
                              customRenderer: (item) => (
                                  <Typography
                                      component="span"
                                      sx={{
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          fontWeight: 'bold',
                                          fontSize: '0.75rem',
                                          color: 'white',
                                          whiteSpace: 'nowrap',
                                          bgcolor: item.status === 'Pending' ? 'warning.main' : 
                                                   item.status === 'Approved' ? 'success.main' : 
                                                   item.status === 'Completed' ? 'info.main' : 'error.main',
                                      }}
                                  >
                                      {item.status}
                                  </Typography>
                              )
                            },
                            { key: 'reason', label: 'Reason' },
                            { 
                              key: 'handoverStaffId', 
                              label: 'Handover To',
                              customRenderer: (item) => {
                                  if (!item.handoverFirstName) return 'N/A';
                                  return `${item.handoverFirstName} ${item.handoverLastName}`;
                              }
                            },
                            { key: 'handoverComments', label: 'Handover Comments' }
                        ])}
                    </>
                )}
            </Box>

            <AddEditEmployeeModal isOpen={modalState.employee.isOpen} onClose={() => handleCloseModal('employee')} editedItem={modalState.employee.editedItem} employees={employees} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditPerformanceReviewModal isOpen={modalState['employee.performance'].isOpen} onClose={() => handleCloseModal('employee.performance')} editedItem={modalState['employee.performance'].editedItem} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} employees={employees} />
            <AddEditCompensationModal isOpen={modalState.compensation.isOpen} onClose={() => handleCloseModal('compensation')} editedItem={modalState.compensation.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditTrainingModal isOpen={modalState.training.isOpen} onClose={() => handleCloseModal('training')} editedItem={modalState.training.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditDisciplinaryModal isOpen={modalState.disciplinary.isOpen} onClose={() => handleCloseModal('disciplinary')} editedItem={modalState.disciplinary.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditContractsModal isOpen={modalState.contracts.isOpen} onClose={() => handleCloseModal('contracts')} editedItem={modalState.contracts.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditRetirementsModal isOpen={modalState.retirements.isOpen} onClose={() => handleCloseModal('retirements')} editedItem={modalState.retirements.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditLoansModal isOpen={modalState.loans.isOpen} onClose={() => handleCloseModal('loans')} editedItem={modalState.loans.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditPayrollModal isOpen={modalState.payroll.isOpen} onClose={() => handleCloseModal('payroll')} editedItem={modalState.payroll.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditDependantsModal isOpen={modalState.dependants.isOpen} onClose={() => handleCloseModal('dependants')} editedItem={modalState.dependants.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditTerminationsModal isOpen={modalState.terminations.isOpen} onClose={() => handleCloseModal('terminations')} editedItem={modalState.terminations.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditBankDetailsModal isOpen={modalState.bank_details.isOpen} onClose={() => handleCloseModal('bank_details')} editedItem={modalState.bank_details.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditMembershipsModal isOpen={modalState.memberships.isOpen} onClose={() => handleCloseModal('memberships')} editedItem={modalState.memberships.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditBenefitsModal isOpen={modalState.benefits.isOpen} onClose={() => handleCloseModal('benefits')} editedItem={modalState.benefits.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditAssignedAssetsModal isOpen={modalState.assets.isOpen} onClose={() => handleCloseModal('assets')} editedItem={modalState.assets.editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditPromotionsModal isOpen={modalState.promotion.isOpen} onClose={() => handleCloseModal('promotion')} editedItem={modalState.promotion.editedItem} employees={employees} jobGroups={jobGroups} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditProjectAssignmentsModal isOpen={modalState['project.assignments'].isOpen} onClose={() => handleCloseModal('project.assignments')} editedItem={modalState['project.assignments'].editedItem} employees={employees} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            <AddEditLeaveApplicationModal isOpen={modalState['leave.apply'].isOpen} onClose={() => handleCloseModal('leave.apply')} editedItem={modalState['leave.apply'].editedItem} employees={employees} leaveTypes={leaveTypes} leaveBalances={leaveBalances} currentEmployeeInView={profile} showNotification={showNotification} refreshData={refreshEmployee360View} />
            {/* <AddEditEducationModal isOpen={modalState.education.isOpen} onClose={() => handleCloseModal('education')} ... /> */}
        </Box>
    );
}