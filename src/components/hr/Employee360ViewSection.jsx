import React, { useState } from 'react';
import {
    Box, Typography, Button, Paper, Grid, Stack, Avatar, Tabs, Tab, IconButton, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, MailOutline as MailIcon, PhoneOutlined as PhoneIcon, WcOutlined as GenderIcon
} from '@mui/icons-material';
import DataCard from './DataCard'; 

// Import all your modals
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
// import AddEditEducationModal from './modals/AddEditEducationModal';

// Helper component for styled list items
const InfoItem = ({ label, value }) => (
    <Grid item xs={12} sm={6}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{value || 'N/A'}</Typography>
    </Grid>
);

// Enhanced InfoCard to support an "Add New" button
const InfoCard = ({ title, onEdit, onAdd, children }) => (
    <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
            <Box>
                {onAdd && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={onAdd}
                    >
                        Add New
                    </Button>
                )}
                {onEdit && (
                    <IconButton onClick={onEdit} size="small" sx={{ ml: onAdd ? 1 : 0 }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
        </Box>
        {children}
    </Paper>
);


export default function Employee360ViewSection({
    employee360View,
    hasPrivilege,
    employees,
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
        jobGroups = [],
        education = []
    } = employee360View;
    
    // Generic modal handlers
    const handleOpenAddModal = (sectionName) => {
        if (!hasPrivilege(`${sectionName}.create`)) {
            showNotification('Permission denied.', 'error');
            return;
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
        if (!managerId) return 'N/A';
        const manager = employees.find(emp => String(emp.staffId) === String(managerId));
        return manager ? `${manager.firstName} ${manager.lastName}` : 'N/A';
    };

    const getJobGroupName = (jobGroupId) => {
        if (!jobGroupId) return 'N/A';
        const group = jobGroups.find(g => String(g.id) === String(jobGroupId));
        return group ? group.groupName : 'N/A';
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderDataSection = (data, modalType, title, fields) => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                {hasPrivilege(`${modalType}.create`) && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenAddModal(modalType)}>
                        Add New
                    </Button>
                )}
            </Box>
            {data && data.length > 0 ? (
                <Stack spacing={1} sx={{mt: 1}}>
                    {data.map((item) => (
                        <DataCard
                            key={item.id}
                            item={item}
                            fields={fields}
                            modalType={modalType}
                            hasPrivilege={hasPrivilege}
                            handleOpenEditModal={() => handleOpenEditModal(item, modalType)}
                            handleOpenDeleteConfirmModal={() => handleOpenDeleteConfirmModal(item.id, item.name || item.title || item.courseName || '', modalType)}
                        />
                    ))}
                </Stack>
            ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic', mt: 2, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                    No {title.toLowerCase().replace(' details', '')} found.
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

            <Grid item xs={12} md={6}>
                <InfoCard title="Education" onAdd={() => handleOpenAddModal('education')}>
                    {education.length > 0 ? (
                        <Stack spacing={1}>
                            {education.map((item) => (
                                <DataCard
                                    key={item.id}
                                    item={item}
                                    fields={[
                                        { key: 'degree', label: 'Degree' },
                                        { key: 'institution', label: 'Institution' },
                                    ]}
                                    modalType="education"
                                    hasPrivilege={hasPrivilege}
                                    handleOpenEditModal={() => handleOpenEditModal(item, 'education')}
                                    handleOpenDeleteConfirmModal={() => handleOpenDeleteConfirmModal(item.id, item.degree, 'education')}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic', p: 3 }}>
                            No education records found.
                        </Typography>
                    )}
                </InfoCard>
            </Grid>
            <Grid item xs={12} md={6}>
                <InfoCard title="Family / Dependants" onAdd={() => handleOpenAddModal('dependants')}>
                    {dependants.length > 0 ? (
                        <Stack spacing={1}>
                             {dependants.map((item) => (
                                <DataCard
                                    key={item.id}
                                    item={item}
                                    fields={[
                                        { key: 'dependantName', label: 'Name' },
                                        { key: 'relationship', label: 'Relationship' },
                                        { key: 'dateOfBirth', label: 'Date of Birth' },
                                    ]}
                                    modalType="dependants"
                                    hasPrivilege={hasPrivilege}
                                    handleOpenEditModal={() => handleOpenEditModal(item, 'dependants')}
                                    handleOpenDeleteConfirmModal={() => handleOpenDeleteConfirmModal(item.id, item.dependantName, 'dependants')}
                                />
                            ))}
                        </Stack>
                    ) : (
                         <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic', p: 3 }}>
                            No dependants found.
                        </Typography>
                    )}
                </InfoCard>
            </Grid>
        </Grid>
    );

    const renderEmployeeDetailsTab = () => {
        const handleSubTabChange = (event, newValue) => {
            setEmployeeSubTab(newValue);
        };

        return (
            <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={employeeSubTab}
                        onChange={handleSubTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label="Promotions" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
                        <Tab label="Training" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
                        <Tab label="Disciplinary" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
                        <Tab label="Assigned Assets" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
                        <Tab label="Project Assignments" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
                    </Tabs>
                </Box>

                {employeeSubTab === 0 && renderDataSection(promotions, 'promotion', 'Promotions', [
                    { key: 'oldJobGroupId', label: 'Previous Job Group', customRenderer: (value) => getJobGroupName(value) },
                    { key: 'newJobGroupId', label: 'New Job Group', customRenderer: (value) => getJobGroupName(value) },
                    { key: 'promotionDate', label: 'Promotion Date' },
                ])}
                {employeeSubTab === 1 && renderDataSection(trainings, 'training', 'Training History', [
                    { key: 'courseName', label: 'Course Name' },
                    { key: 'institution', label: 'Institution' },
                    { key: 'completionDate', label: 'Completion Date' },
                ])}
                {employeeSubTab === 2 && renderDataSection(disciplinaries, 'disciplinary', 'Disciplinary Records', [
                    { key: 'actionType', label: 'Action Type' },
                    { key: 'actionDate', label: 'Action Date' },
                    { key: 'reason', label: 'Reason' },
                ])}
                {employeeSubTab === 3 && renderDataSection(assignedAssets, 'assets', 'Assigned Assets', [
                    { key: 'assetName', label: 'Asset Name' },
                    { key: 'serialNumber', label: 'Serial No.' },
                    { key: 'assignmentDate', label: 'Assignment Date' },
                ])}
                {employeeSubTab === 4 && renderDataSection(projectAssignments, 'project.assignments', 'Project Assignments', [
                    { key: 'projectId', label: 'Project ID' },
                    { key: 'milestoneName', label: 'Milestone' },
                    { key: 'role', label: 'Role' },
                ])}
            </Box>
        );
    };

    const renderPayrollTab = () => {
        const handleSubTabChange = (event, newValue) => {
            setPayrollSubTab(newValue);
        };
    
        return (
            <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs 
                        value={payrollSubTab} 
                        onChange={handleSubTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label="Compensation" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
                        <Tab label="Payroll History" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
                        <Tab label="Bank Details" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
                        <Tab label="Loans" sx={{ textTransform: 'none', fontWeight: 'medium' }} />
                    </Tabs>
                </Box>
    
                {payrollSubTab === 0 && renderDataSection(compensations, 'compensation', 'Compensation Details', [
                    { key: 'baseSalary', label: 'Base Salary' }, { key: 'allowances', label: 'Allowances' }, { key: 'bonuses', label: 'Bonuses' },
                ])}
                {payrollSubTab === 1 && renderDataSection(payrolls, 'payroll', 'Payroll History', [
                     { key: 'payPeriod', label: 'Pay Period' }, { key: 'grossSalary', label: 'Gross Salary' }, { key: 'netSalary', label: 'Net Salary' },
                ])}
                {payrollSubTab === 2 && renderDataSection(bankDetails, 'bank_details', 'Bank Details', [
                     { key: 'bankName', label: 'Bank Name' }, { key: 'accountNumber', label: 'Account Number' },
                ])}
                {payrollSubTab === 3 && renderDataSection(loans, 'loans', 'Loans', [
                    { key: 'loanAmount', label: 'Loan Amount' }, { key: 'loanDate', label: 'Loan Date' }, { key: 'status', label: 'Status' },
                ])}
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
                </Tabs>
            </Box>
            
            <Box sx={{ pt: 3, bgcolor: 'background.paper', p: 3, borderRadius: '0 0 12px 12px' }}>
                {activeTab === 0 && renderPersonalInfoTab()}
                {activeTab === 1 && renderEmployeeDetailsTab()}
                {activeTab === 2 && renderPayrollTab()}
                {activeTab === 3 && renderDataSection(contracts, 'contracts', 'Contracts', [
                     { key: 'contractType', label: 'Contract Type' }, { key: 'contractStartDate', label: 'Start Date' }, { key: 'contractEndDate', label: 'End Date' },
                ])}
                 {activeTab === 4 && renderDataSection(performanceReviews, 'employee.performance', 'Performance History', [
                     { key: 'reviewDate', label: 'Review Date' }, { key: 'reviewScore', label: 'Score' }, { key: 'comments', label: 'Comments' },
                ])}
            </Box>

            {/* --- Full list of Modals --- */}
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
            {/* <AddEditEducationModal isOpen={modalState.education.isOpen} onClose={() => handleCloseModal('education')} ... /> */}
        </Box>
    );
}