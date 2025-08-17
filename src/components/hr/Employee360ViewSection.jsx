import React, { useState } from 'react';
import {
    Box, Typography, Button, Paper, Grid, Stack, Avatar, Tabs, Tab, IconButton, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, MailOutline as MailIcon, PhoneOutlined as PhoneIcon, WcOutlined as GenderIcon
} from '@mui/icons-material';
import DataCard from './DataCard'; 

// Import all your modals
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

// Helper component for styled list items in the personal info cards
const InfoItem = ({ label, value }) => (
    <Grid item xs={12} sm={6}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{value || 'N/A'}</Typography>
    </Grid>
);

// Card component with a header
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
        performance: { isOpen: false, editedItem: null },
        compensation: { isOpen: false, editedItem: null },
        training: { isOpen: false, editedItem: null },
        disciplinary: { isOpen: false, editedItem: null },
        contracts: { isOpen: false, editedItem: null },
        retirements: { isOpen: false, editedItem: null },
        loans: { isOpen: false, editedItem: null },
        payroll: { isOpen: false, editedItem: null },
        dependants: { isOpen: false, editedItem: null },
        terminations: { isOpen: false, editedItem: null },
        bankDetails: { isOpen: false, editedItem: null },
        memberships: { isOpen: false, editedItem: null },
        benefits: { isOpen: false, editedItem: null },
        assignedAssets: { isOpen: false, editedItem: null },
        promotions: { isOpen: false, editedItem: null },
        projectAssignments: { isOpen: false, editedItem: null },
        employee: { isOpen: false, editedItem: null },
    });

    if (!employee360View || !employee360View.profile) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography>No employee selected or data not available.</Typography>
            </Paper>
        );
    }

    const {
        profile, performanceReviews, compensations, trainings, disciplinaries, contracts, retirements,
        loans, payrolls, dependants, terminations, bankDetails, memberships, benefits, assignedAssets,
        promotions, projectAssignments, jobGroups
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

    const renderSectionHeader = (title, modalType) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
            {hasPrivilege(`${modalType}.create`) && (
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenAddModal(modalType)}>
                    Add New
                </Button>
            )}
        </Box>
    );

    const renderDataSection = (data, modalType, title, fields) => (
        <Box>
            {renderSectionHeader(title, modalType)}
            {data && data.length > 0 ? (
                <Stack spacing={2} sx={{mt: 2}}>
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
    
    const mockEducation = [
        { degree: 'Master Degree - Bina Nusantara', major: 'Business', gpa: '3.5', period: '2016 - 2018' },
        { degree: 'Bachelor Degree - Bina Nusantara', major: 'Business', gpa: '3.9', period: '2012 - 2016' },
    ];

    const mockFamily = [
        { type: 'Father', name: 'Benjamin Williams' },
        { type: 'Mother', name: 'Evelyn Potts' },
        { type: 'Siblings', name: 'James Williams, Emily Williams' },
    ];
    
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
                                <ListItem disablePadding>
                                    <ListItemIcon sx={{minWidth: 32}}><GenderIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={profile?.gender} />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemIcon sx={{minWidth: 32}}><MailIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={profile?.email} />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemIcon sx={{minWidth: 32}}><PhoneIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={profile?.phoneNumber} />
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={2}>
                                <InfoItem label="Place of birth" value={profile?.placeOfBirth} />
                                <InfoItem label="Birth date" value={profile?.dateOfBirth?.slice(0, 10)} />
                                <InfoItem label="Blood type" value={profile?.bloodType} />
                                <InfoItem label="Marital Status" value={profile?.maritalStatus} />
                                <InfoItem label="Religion" value={profile?.religion} />
                                <InfoItem label="Nationality" value={profile?.nationality} />
                            </Grid>
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
                    <InfoItem label="Name" value={profile?.emergencyContactName} />
                    <InfoItem label="Relationship" value={profile?.emergencyContactRelationship} />
                    <InfoItem label="Phone number" value={profile?.emergencyContactPhone} />
                </InfoCard>
            </Grid>
            <Grid item xs={12} md={6}>
                <InfoCard title="Education" onEdit={() => { /* Open Education Modal */ }}>
                    <List disablePadding>
                        {mockEducation.map((edu, index) => (
                            <ListItem key={index} disablePadding sx={{ alignItems: 'flex-start' }}>
                                <ListItemIcon sx={{ mt: '6px', minWidth: '24px' }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={edu.degree}
                                    secondary={`${edu.major} • GPA: ${edu.gpa} • ${edu.period}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </InfoCard>
            </Grid>
            <Grid item xs={12} md={6}>
                <InfoCard title="Family" onEdit={() => handleOpenAddModal('dependants')}>
                    {mockFamily.map((member, index) => (
                        <Grid container key={index} spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary">{member.type}</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{member.name}</Typography>
                            </Grid>
                        </Grid>
                    ))}
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
                {/* Nested Sub-Tabs for Employee Details */}
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

                {/* Content for Employee Details Sub-Tabs */}
                {employeeSubTab === 0 && renderDataSection(promotions, 'promotions', 'Promotions', [
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
                {employeeSubTab === 3 && renderDataSection(assignedAssets, 'assignedAssets', 'Assigned Assets', [
                    { key: 'assetName', label: 'Asset Name' },
                    { key: 'serialNumber', label: 'Serial No.' },
                    { key: 'assignmentDate', label: 'Assignment Date' },
                ])}
                {employeeSubTab === 4 && renderDataSection(projectAssignments, 'projectAssignments', 'Project Assignments', [
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
    
                {payrollSubTab === 0 && (
                    renderDataSection(compensations, 'compensation', 'Compensation Details', [
                        { key: 'baseSalary', label: 'Base Salary' },
                        { key: 'allowances', label: 'Allowances' },
                        { key: 'bonuses', label: 'Bonuses' },
                        { key: 'payFrequency', label: 'Pay Frequency' },
                    ])
                )}
                {payrollSubTab === 1 && (
                    renderDataSection(payrolls, 'payroll', 'Payroll History', [
                         { key: 'payPeriod', label: 'Pay Period' },
                         { key: 'grossSalary', label: 'Gross Salary' },
                         { key: 'netSalary', label: 'Net Salary' },
                    ])
                )}
                {payrollSubTab === 2 && (
                    renderDataSection(bankDetails, 'bankDetails', 'Bank Details', [
                         { key: 'bankName', label: 'Bank Name' },
                         { key: 'accountNumber', label: 'Account Number' },
                         { key: 'branchName', label: 'Branch Name' },
                    ])
                )}
                {payrollSubTab === 3 && (
                     renderDataSection(loans, 'loans', 'Loans', [
                        { key: 'loanAmount', label: 'Loan Amount' },
                        { key: 'loanDate', label: 'Loan Date' },
                        { key: 'status', label: 'Status' },
                    ])
                )}
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
                    <Tab label="Dependants" />
                </Tabs>
            </Box>
            
            <Box sx={{ pt: 3, bgcolor: 'background.paper', p: 3, borderRadius: '0 0 12px 12px' }}>
                {activeTab === 0 && renderPersonalInfoTab()}
                {activeTab === 1 && renderEmployeeDetailsTab()}
                {activeTab === 2 && renderPayrollTab()}
                {activeTab === 3 && renderDataSection(contracts, 'contracts', 'Contracts', [
                     { key: 'contractType', label: 'Contract Type' },
                     { key: 'contractStartDate', label: 'Start Date' },
                     { key: 'contractEndDate', label: 'End Date' },
                ])}
                 {activeTab === 4 && renderDataSection(performanceReviews, 'performance', 'Performance History', [
                     { key: 'reviewDate', label: 'Review Date' },
                     { key: 'reviewScore', label: 'Score' },
                     { key: 'comments', label: 'Comments' },
                ])}
                {activeTab === 5 && renderDataSection(dependants, 'dependants', 'Dependants', [
                     { key: 'dependantName', label: 'Name' },
                     { key: 'relationship', label: 'Relationship' },
                     { key: 'dateOfBirth', label: 'Date of Birth' },
                ])}
            </Box>

            {/* --- Full list of Modals --- */}
            <AddEditPerformanceReviewModal
                isOpen={modalState.performance.isOpen}
                onClose={() => handleCloseModal('performance')}
                editedItem={modalState.performance.editedItem}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditCompensationModal
                isOpen={modalState.compensation.isOpen}
                onClose={() => handleCloseModal('compensation')}
                editedItem={modalState.compensation.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditTrainingModal
                isOpen={modalState.training.isOpen}
                onClose={() => handleCloseModal('training')}
                editedItem={modalState.training.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditDisciplinaryModal
                isOpen={modalState.disciplinary.isOpen}
                onClose={() => handleCloseModal('disciplinary')}
                editedItem={modalState.disciplinary.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditContractsModal
                isOpen={modalState.contracts.isOpen}
                onClose={() => handleCloseModal('contracts')}
                editedItem={modalState.contracts.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditRetirementsModal
                isOpen={modalState.retirements.isOpen}
                onClose={() => handleCloseModal('retirements')}
                editedItem={modalState.retirements.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditLoansModal
                isOpen={modalState.loans.isOpen}
                onClose={() => handleCloseModal('loans')}
                editedItem={modalState.loans.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditPayrollModal
                isOpen={modalState.payroll.isOpen}
                onClose={() => handleCloseModal('payroll')}
                editedItem={modalState.payroll.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditDependantsModal
                isOpen={modalState.dependants.isOpen}
                onClose={() => handleCloseModal('dependants')}
                editedItem={modalState.dependants.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditTerminationsModal
                isOpen={modalState.terminations.isOpen}
                onClose={() => handleCloseModal('terminations')}
                editedItem={modalState.terminations.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditBankDetailsModal
                isOpen={modalState.bankDetails.isOpen}
                onClose={() => handleCloseModal('bankDetails')}
                editedItem={modalState.bankDetails.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditMembershipsModal
                isOpen={modalState.memberships.isOpen}
                onClose={() => handleCloseModal('memberships')}
                editedItem={modalState.memberships.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditBenefitsModal
                isOpen={modalState.benefits.isOpen}
                onClose={() => handleCloseModal('benefits')}
                editedItem={modalState.benefits.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditAssignedAssetsModal
                isOpen={modalState.assignedAssets.isOpen}
                onClose={() => handleCloseModal('assignedAssets')}
                editedItem={modalState.assignedAssets.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditPromotionsModal
                isOpen={modalState.promotions.isOpen}
                onClose={() => handleCloseModal('promotions')}
                editedItem={modalState.promotions.editedItem}
                employees={employees}
                jobGroups={jobGroups}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
            <AddEditProjectAssignmentsModal
                isOpen={modalState.projectAssignments.isOpen}
                onClose={() => handleCloseModal('projectAssignments')}
                editedItem={modalState.projectAssignments.editedItem}
                employees={employees}
                currentEmployeeInView={profile}
                showNotification={showNotification}
                refreshData={refreshEmployee360View}
            />
        </Box>
    );
}