import React, { useState } from 'react';
import {
    Box, Typography, Button, Paper, Grid, Stack, Avatar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import DataCard from './DataCard'; 
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

export default function Employee360ViewSection({
    employee360View,
    hasPrivilege,
    employees,
    handleOpenDeleteConfirmModal,
    showNotification,
    refreshEmployee360View,
}) {
    if (!employee360View || !employee360View.profile) {
        return <Typography>No employee selected or data not available.</Typography>;
    }

    const {
        profile,
        performanceReviews,
        compensations,
        trainings,
        disciplinaries,
        contracts,
        retirements,
        loans,
        payrolls,
        dependants,
        terminations,
        bankDetails,
        memberships,
        benefits,
        assignedAssets,
        promotions,
        projectAssignments,
        jobGroups
    } = employee360View;

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

    // State for all section modals
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
    });
    
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

    const handleScrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const renderProfileHeader = () => (
        <Paper elevation={3} sx={{ p: 4, mb: 4, display: 'flex', alignItems: 'center' }}>
            <Avatar 
                sx={{ 
                    width: 100, 
                    height: 100, 
                    mr: 4,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                }}
            >
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
            </Avatar>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{profile?.firstName} {profile?.lastName}</Typography>
                <Typography variant="body1" color="text.secondary">{profile?.title} at {profile?.department}</Typography>
                <Typography variant="body2" color="text.secondary">ID: {profile?.staffId}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {hasPrivilege('employee.update') && (
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenEditModal(profile, 'employee')}
                            size="small"
                        >
                            Edit Profile
                        </Button>
                    )}
                </Stack>
            </Box>
        </Paper>
    );

    const renderSectionHeader = (title, modalType, sectionId) => (
        <Box id={sectionId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
            {hasPrivilege(`${modalType}.create`) && (
                <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => handleOpenAddModal(modalType)}>
                    Add {title.replace(/\s+/g, ' ')}
                </Button>
            )}
        </Box>
    );

    const renderDataSection = (data, modalType, sectionId, title, fields) => (
        <>
            {renderSectionHeader(title, modalType, sectionId)}
            {data && data.length > 0 ? (
                <Stack spacing={2}>
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
                <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic', mt: 2 }}>
                    No {title.toLowerCase()} found.
                </Typography>
            )}
        </>
    );

    return (
        <Box>
            {renderProfileHeader()}
            
            <Paper elevation={2} sx={{ mb: 4, p: 2, display: 'flex', overflowX: 'auto', flexWrap: 'nowrap' }}>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={() => handleScrollToSection('personal-details')}>Personal Details</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('performance-history')}>Performance</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('compensation')}>Compensation</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('training')}>Training</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('disciplinary-records')}>Disciplinary</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('contracts')}>Contracts</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('retirements')}>Retirements</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('loans')}>Loans</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('monthly-payroll')}>Payroll</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('dependants')}>Dependants</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('terminations')}>Terminations</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('bank-details')}>Bank Details</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('memberships')}>Memberships</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('benefits')}>Benefits</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('assigned-assets')}>Assets</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('promotions')}>Promotions</Button>
                    <Button variant="outlined" onClick={() => handleScrollToSection('project-assignments')}>Projects</Button>
                </Stack>
            </Paper>

            <Grid container spacing={4} id="personal-details">
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {profile?.email}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Phone:</strong> {profile?.phoneNumber}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Gender:</strong> {profile?.gender}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Date of Birth:</strong> {profile?.dateOfBirth?.slice(0, 10)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Nationality:</strong> {profile?.nationality}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Marital Status:</strong> {profile?.maritalStatus}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Emergency Contact:</strong> {profile?.emergencyContactName}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Emergency Phone:</strong> {profile?.emergencyContactPhone}</Typography></Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} id="employment-details">
                    <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Employment Details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><Typography><strong>Employment Status:</strong> {profile?.employmentStatus}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Employment Type:</strong> {profile?.employmentType}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Department:</strong> {profile?.department}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Title:</strong> {profile?.title}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Start Date:</strong> {profile?.startDate?.slice(0, 10)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Manager:</strong> {getManagerName(profile?.managerId)}</Typography></Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            
            {renderDataSection(
                performanceReviews,
                'performance',
                'performance-history',
                'Performance History',
                [
                    { key: 'reviewDate', label: 'Review Date' },
                    { key: 'reviewScore', label: 'Score' },
                    { key: 'comments', label: 'Comments' },
                ]
            )}

            {renderDataSection(
                compensations,
                'compensation',
                'compensation',
                'Compensation',
                [
                    { key: 'baseSalary', label: 'Base Salary' },
                    { key: 'allowances', label: 'Allowances' },
                    { key: 'bonuses', label: 'Bonuses' },
                    { key: 'payFrequency', label: 'Pay Frequency' },
                ]
            )}

            {renderDataSection(
                trainings,
                'training',
                'training',
                'Training',
                [
                    { key: 'courseName', label: 'Course Name' },
                    { key: 'institution', label: 'Institution' },
                    { key: 'completionDate', label: 'Completion Date' },
                    { key: 'expiryDate', label: 'Expiry Date' },
                ]
            )}

            {renderDataSection(
                disciplinaries,
                'disciplinary',
                'disciplinary-records',
                'Disciplinary Records',
                [
                    { key: 'actionType', label: 'Action Type' },
                    { key: 'actionDate', label: 'Action Date' },
                    { key: 'reason', label: 'Reason' },
                    { key: 'comments', label: 'Comments' },
                ]
            )}

            {renderDataSection(
                contracts,
                'contracts',
                'contracts',
                'Contracts',
                [
                    { key: 'contractType', label: 'Contract Type' },
                    { key: 'contractStartDate', label: 'Start Date' },
                    { key: 'contractEndDate', label: 'End Date' },
                    { key: 'status', label: 'Status' },
                ]
            )}

            {renderDataSection(
                retirements,
                'retirements',
                'retirements',
                'Retirements',
                [
                    { key: 'retirementDate', label: 'Retirement Date' },
                    { key: 'retirementType', label: 'Retirement Type' },
                    { key: 'comments', label: 'Comments' },
                ]
            )}

            {renderDataSection(
                loans,
                'loans',
                'loans',
                'Loans',
                [
                    { key: 'loanAmount', label: 'Loan Amount' },
                    { key: 'loanDate', label: 'Loan Date' },
                    { key: 'repaymentSchedule', label: 'Repayment Schedule' },
                    { key: 'status', label: 'Status' },
                ]
            )}

            {renderDataSection(
                payrolls,
                'payroll',
                'monthly-payroll',
                'Monthly Payroll',
                [
                    { key: 'payPeriod', label: 'Pay Period' },
                    { key: 'grossSalary', label: 'Gross Salary' },
                    { key: 'netSalary', label: 'Net Salary' },
                    { key: 'deductions', label: 'Deductions' },
                ]
            )}
            
            {renderDataSection(
                dependants,
                'dependants',
                'dependants',
                'Dependants',
                [
                    { key: 'dependantName', label: 'Name' },
                    { key: 'relationship', label: 'Relationship' },
                    { key: 'dateOfBirth', label: 'Date of Birth' },
                ]
            )}

            {renderDataSection(
                terminations,
                'terminations',
                'terminations',
                'Terminations',
                [
                    { key: 'exitDate', label: 'Exit Date' },
                    { key: 'reason', label: 'Reason' },
                    { key: 'exitInterviewDetails', label: 'Exit Interview Details' },
                ]
            )}

            {renderDataSection(
                bankDetails,
                'bankDetails',
                'bank-details',
                'Bank Details',
                [
                    { key: 'bankName', label: 'Bank Name' },
                    { key: 'accountNumber', label: 'Account Number' },
                    { key: 'branchName', label: 'Branch Name' },
                    { key: 'isPrimary', label: 'Primary' },
                ]
            )}
            
            {renderDataSection(
                memberships,
                'memberships',
                'memberships',
                'Memberships',
                [
                    { key: 'organizationName', label: 'Organization' },
                    { key: 'membershipNumber', label: 'Membership No.' },
                    { key: 'startDate', label: 'Start Date' },
                    { key: 'endDate', label: 'End Date' },
                ]
            )}

            {renderDataSection(
                benefits,
                'benefits',
                'benefits',
                'Benefits',
                [
                    { key: 'benefitName', label: 'Benefit Name' },
                    { key: 'enrollmentDate', label: 'Enrollment Date' },
                    { key: 'status', label: 'Status' },
                ]
            )}
            
            {renderDataSection(
                assignedAssets,
                'assignedAssets',
                'assigned-assets',
                'Assigned Assets',
                [
                    { key: 'assetName', label: 'Asset Name' },
                    { key: 'serialNumber', label: 'Serial No.' },
                    { key: 'assignmentDate', label: 'Assignment Date' },
                    { key: 'condition', label: 'Condition' },
                ]
            )}
            
            {renderDataSection(
                promotions,
                'promotions',
                'promotions',
                'Promotions',
                [
                    { key: 'oldJobGroupId', label: 'Previous Job Group', customRenderer: (value) => getJobGroupName(value) },
                    { key: 'newJobGroupId', label: 'New Job Group', customRenderer: (value) => getJobGroupName(value) },
                    { key: 'promotionDate', label: 'Promotion Date' },
                ]
            )}

            {renderDataSection(
                projectAssignments,
                'projectAssignments',
                'project-assignments',
                'Project Assignments',
                [
                    { key: 'projectId', label: 'Project ID' },
                    { key: 'milestoneName', label: 'Milestone' },
                    { key: 'role', label: 'Role' },
                    { key: 'status', label: 'Status' },
                    { key: 'dueDate', label: 'Due Date' },
                ]
            )}

            {/* Modals for this section */}
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
