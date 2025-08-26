import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Button, Paper,
    List, ListItem, ListItemText, IconButton,
    Stack, Chip, Snackbar, LinearProgress,
    Tooltip, Accordion, AccordionSummary, AccordionDetails, useTheme, Grid,
    Divider
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon, Add as AddIcon, Edit as EditIcon,
    Delete as DeleteIcon,
    Update as UpdateIcon,
    Attachment as AttachmentIcon,
    PhotoCamera as PhotoCameraIcon,
    Visibility as VisibilityIcon,
    Paid as PaidIcon,
    ExpandMore as ExpandMoreIcon,
    Flag as FlagIcon,
    Assessment as AssessmentIcon,
    AccountTree as AccountTreeIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import apiService from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { getProjectStatusBackgroundColor, getProjectStatusTextColor } from '../utils/projectStatusColors';
import MilestoneAttachments from '../components/MilestoneAttachments.jsx';
import ProjectMonitoringComponent from '../components/ProjectMonitoringComponent.jsx';
import ProjectManagerReviewPanel from '../components/ProjectManagerReviewPanel.jsx';
import AddEditActivityForm from '../components/modals/AddEditActivityForm';
import AddEditMilestoneModal from '../components/modals/AddEditMilestoneModal';
import PaymentRequestForm from '../components/PaymentRequestForm';
import PaymentRequestDocumentUploader from '../components/PaymentRequestDocumentUploader';

const checkUserPrivilege = (user, privilegeName) => {
    return user && user.privileges && Array.isArray(user.privileges) && user.privileges.includes(privilegeName);
};

const snakeToCamelCase = (obj) => {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(v => snakeToCamelCase(v));
    }
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            newObj[camelKey] = snakeToCamelCase(obj[key]);
        }
    }
    return newObj;
};

// Helper function for currency formatting
const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function for date formatting
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-GB');
    } catch (e) {
        console.error('Invalid date string:', dateString);
        return 'Invalid Date';
    }
};

function ProjectDetailsPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const theme = useTheme();

    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [staff, setStaff] = useState([]);
    const [projectCategory, setProjectCategory] = useState(null);
    const [applyingTemplate, setApplyingTemplate] = useState(false);
    const [milestoneActivities, setMilestoneActivities] = useState([]);

    const [projectWorkPlans, setProjectWorkPlans] = useState([]);
    const [loadingWorkPlans, setLoadingWorkPlans] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
    const [currentMilestone, setCurrentMilestone] = useState(null);

    const [openAttachmentsModal, setOpenAttachmentsModal] = useState(false);
    const [milestoneToViewAttachments, setMilestoneToViewAttachments] = useState(null);
    const [openMonitoringModal, setOpenMonitoringModal] = useState(false);
    const [openReviewPanel, setOpenReviewPanel] = useState(false);
    const [openActivityDialog, setOpenActivityDialog] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [activityFormData, setActivityFormData] = useState({
        activityName: '',
        activityDescription: '',
        responsibleOfficer: null,
        startDate: '',
        endDate: '',
        budgetAllocated: null,
        actualCost: null,
        percentageComplete: null,
        activityStatus: '',
        projectId: null,
        workplanId: null,
        milestoneIds: [],
        selectedWorkplanName: ''
    });

    const [expandedWorkPlan, setExpandedWorkPlan] = useState(false);
    const [paymentJustification, setPaymentJustification] = useState({
        totalBudget: 0,
        accomplishedActivities: [],
        accomplishedMilestones: []
    });

    const [openPaymentModal, setOpenPaymentModal] = useState(false);

    const [openDocumentUploader, setOpenDocumentUploader] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedWorkPlan(isExpanded ? panel : false);
    };

    const fetchProjectDetails = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!user || !Array.isArray(user.privileges)) {
            setLoading(false);
            setError("Authentication data loading or missing privileges. Cannot fetch project details.");
            return;
        }

        if (!projectId) {
            setLoading(false);
            setError("No project ID provided.");
            return;
        }

        try {
            if (!checkUserPrivilege(user, 'project.read_all')) {
                setError("You do not have 'project.read_all' privilege to view this project's details.");
                return;
            }

            const projectData = await apiService.projects.getProjectById(projectId);
            setProject(projectData);

            const subProgramId = projectData.subProgramId;
            if (subProgramId) {
                setLoadingWorkPlans(true);
                try {
                    const workPlansData = await apiService.strategy.annualWorkPlans.getWorkPlansBySubprogramId(subProgramId);
                    setProjectWorkPlans(workPlansData);
                } catch (err) {
                    console.error("Error fetching work plans for subprogram:", err);
                    setProjectWorkPlans([]);
                } finally {
                    setLoadingWorkPlans(false);
                }
            }

            if (projectData.categoryId) {
                const categoryData = await apiService.metadata.projectCategories.getCategoryById(projectData.categoryId);
                setProjectCategory(categoryData);
            } else {
                setProjectCategory(null);
            }

            const milestonesData = await apiService.milestones.getMilestonesForProject(projectId);
            setMilestones(milestonesData);

            const milestoneActivitiesPromises = milestonesData.map(m =>
                apiService.strategy.milestoneActivities.getActivitiesByMilestoneId(m.milestoneId)
            );
            const milestoneActivitiesResults = (await Promise.all(milestoneActivitiesPromises)).flat();
            setMilestoneActivities(milestoneActivitiesResults);

            const rawStaffData = await apiService.users.getStaff();
            const camelCaseStaffData = rawStaffData.map(s => snakeToCamelCase(s));
            setStaff(camelCaseStaffData);

        } catch (err) {
            console.error('ProjectDetailsPage: Error fetching project details:', err);
            setError(err.message || 'Failed to load project details.');
            if (err.response && err.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [projectId, logout, user]);

    useEffect(() => {
        fetchProjectDetails();
    }, [fetchProjectDetails]);

    useEffect(() => {
        if (!milestones.length && !milestoneActivities.length) {
            return;
        }

        const accomplishedActivities = milestoneActivities.filter(a => a.activityStatus === 'completed');
        const accomplishedMilestoneIds = new Set(accomplishedActivities.map(a => a.milestoneId));
        const accomplishedMilestones = milestones.filter(m => accomplishedMilestoneIds.has(m.milestoneId));

        const totalAccomplishedBudget = accomplishedActivities.reduce((sum, activity) => sum + (parseFloat(activity.budgetAllocated) || 0), 0);

        setPaymentJustification({
            totalBudget: totalAccomplishedBudget,
            accomplishedActivities: accomplishedActivities,
            accomplishedMilestones: accomplishedMilestones
        });
    }, [milestones, milestoneActivities]);

    const handleApplyMilestoneTemplate = async () => {
        if (!checkUserPrivilege(user, 'project.apply_template')) {
            setSnackbar({ open: true, message: 'Permission denied to apply milestone templates.', severity: 'error' });
            return;
        }
        setApplyingTemplate(true);
        try {
            const response = await apiService.projects.applyMilestoneTemplate(projectId);
            setSnackbar({ open: true, message: response.message, severity: 'success' });
            fetchProjectDetails();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to apply milestone template.', severity: 'error' });
        } finally {
            setApplyingTemplate(false);
        }
    };

    const handleOpenCreateMilestoneDialog = () => {
        if (!checkUserPrivilege(user, 'milestone.create')) {
            setSnackbar({ open: true, message: 'You do not have permission to create milestones.', severity: 'error' });
            return;
        }
        setCurrentMilestone(null);
        setOpenMilestoneDialog(true);
    };

    const handleOpenEditMilestoneDialog = (milestone) => {
        if (!checkUserPrivilege(user, 'milestone.update')) {
            setSnackbar({ open: true, message: 'You do not have permission to update milestones.', severity: 'error' });
            return;
        }
        setCurrentMilestone(milestone);
        setOpenMilestoneDialog(true);
    };

    const handleCloseMilestoneDialog = () => {
        setOpenMilestoneDialog(false);
        setCurrentMilestone(null);
    };

    const handleMilestoneSubmit = async (dataToSubmit) => {
        try {
            if (currentMilestone) {
                if (!checkUserPrivilege(user, 'milestone.update')) {
                    setSnackbar({ open: true, message: 'You do not have permission to update milestones.', severity: 'error' });
                    return;
                }
                await apiService.milestones.updateMilestone(currentMilestone.milestoneId, dataToSubmit);
                setSnackbar({ open: true, message: 'Milestone updated successfully!', severity: 'success' });
            } else {
                if (!checkUserPrivilege(user, 'milestone.create')) {
                    setSnackbar({ open: true, message: 'You do not have permission to create milestones.', severity: 'error' });
                    return;
                }
                await apiService.milestones.createMilestone(dataToSubmit);
                setSnackbar({ open: true, message: 'Milestone created successfully!', severity: 'success' });
            }
            handleCloseMilestoneDialog();
            fetchProjectDetails();
        } catch (err) {
            console.error("Submit milestone error:", err);
            setSnackbar({ open: true, message: err.error || err.message || 'Failed to save milestone.', severity: 'error' });
        }
    };

    const handleDeleteMilestone = async (milestoneId) => {
        if (!checkUserPrivilege(user, 'milestone.delete')) {
            setSnackbar({ open: true, message: 'You do not have permission to delete milestones.', severity: 'error' });
            return;
        }
        if (window.confirm('Are you sure you want to delete this milestone?')) {
            try {
                await apiService.milestones.deleteMilestone(milestoneId);
                setSnackbar({ open: true, message: 'Milestone deleted successfully!', severity: 'success' });
                fetchProjectDetails();
            } catch (err) {
                console.error("Delete milestone error:", err);
                setSnackbar({ open: true, message: err.error || err.message || 'Failed to delete milestone.', severity: 'error' });
            }
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    const handleManagePhotos = () => {
        navigate(`/projects/${projectId}/photos`);
    };

    const handleOpenMonitoringModal = () => {
        setOpenMonitoringModal(true);
    };
    const handleCloseMonitoringModal = () => {
        setOpenMonitoringModal(false);
    };

    const handleOpenReviewPanel = () => {
        setOpenReviewPanel(true);
    };
    const handleCloseReviewPanel = () => {
        setOpenReviewPanel(false);
    };

    const handleOpenPaymentRequest = () => {
        setOpenPaymentModal(true);
    };

    const handlePaymentRequestSubmit = async (projectId, formData) => {
        try {
            const newRequest = await apiService.paymentRequests.createRequest(projectId, formData);

            setSnackbar({ open: true, message: 'Payment request submitted successfully!', severity: 'success' });

            setOpenPaymentModal(false);
            setSelectedRequestId(newRequest.requestId);
            setOpenDocumentUploader(true);

            fetchProjectDetails();
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Failed to submit payment request.', severity: 'error' });
        }
    };

    const handleOpenCreateActivityDialog = (workplanId, workplanName) => {
        setOpenActivityDialog(true);
        setCurrentActivity(null);
        setActivityFormData({
            activityName: '',
            activityDescription: '',
            responsibleOfficer: null,
            startDate: '',
            endDate: '',
            budgetAllocated: null,
            actualCost: null,
            percentageComplete: null,
            activityStatus: '',
            projectId: null,
            workplanId: null,
            milestoneIds: [],
            selectedWorkplanName: ''
        });
    };

    const handleOpenEditActivityDialog = async (activity) => {
        setSnackbar({ open: true, message: 'Loading activity details...', severity: 'info' });

        try {
            const milestoneActivitiesData = await apiService.strategy.milestoneActivities.getActivitiesByActivityId(activity.activityId);
            const currentMilestoneIds = milestoneActivitiesData.map(ma => ma.milestoneId);

            const workplanName = projectWorkPlans.find(wp => wp.workplanId === activity.workplanId)?.workplanName || '';

            setActivityFormData({
                ...activity,
                startDate: activity.startDate ? new Date(activity.startDate).toISOString().split('T')[0] : '',
                endDate: activity.endDate ? new Date(activity.endDate).toISOString().split('T')[0] : '',
                milestoneIds: currentMilestoneIds,
                selectedWorkplanName: workplanName
            });

            setCurrentActivity(activity);
            setOpenActivityDialog(true);
            setSnackbar({ open: false });
        } catch (err) {
            console.error("❌ Error in handleOpenEditActivityDialog:", err);
            setSnackbar({ open: true, message: 'Failed to load activity for editing. Please try again.', severity: 'error' });
            setOpenActivityDialog(false);
        }
    };

    const handleCloseActivityDialog = () => {
        setOpenActivityDialog(false);
        setCurrentActivity(null);
    };

    const handleActivitySubmit = async (formData) => {
        try {
            let activityIdToUse;

            const { selectedWorkplanName, ...payload } = formData;

            if (currentActivity) {
                await apiService.strategy.activities.updateActivity(currentActivity.activityId, payload);
                activityIdToUse = currentActivity.activityId;
                setSnackbar({ open: true, message: 'Activity updated successfully!', severity: 'success' });
            } else {
                const createdActivity = await apiService.strategy.activities.createActivity(payload);
                activityIdToUse = createdActivity.activityId;
                setSnackbar({ open: true, message: 'Activity created successfully!', severity: 'success' });
            }

            if (activityIdToUse) {
                const existingMilestoneLinks = await apiService.strategy.milestoneActivities.getActivitiesByActivityId(activityIdToUse);
                const existingMilestoneIds = new Set(existingMilestoneLinks.map(link => link.milestoneId));
                const newMilestoneIds = new Set(payload.milestoneIds);

                const milestonesToLink = Array.from(newMilestoneIds).filter(id => !existingMilestoneIds.has(id));
                const milestonesToUnlink = Array.from(existingMilestoneIds).filter(id => !newMilestoneIds.has(id));

                await Promise.all(milestonesToLink.map(milestoneId =>
                    apiService.strategy.milestoneActivities.createMilestoneActivity({
                        milestoneId: milestoneId,
                        activityId: activityIdToUse
                    })
                ));

                await Promise.all(milestonesToUnlink.map(milestoneId =>
                    apiService.strategy.milestoneActivities.deleteMilestoneActivity(milestoneId, activityIdToUse)
                ));
            }

            handleCloseActivityDialog();
            fetchProjectDetails();
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Failed to save activity.', severity: 'error' });
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
                await apiService.strategy.activities.deleteActivity(activityId);
                setSnackbar({ open: true, message: 'Activity deleted successfully!', severity: 'success' });
                fetchProjectDetails();
            } catch (err) {
                setSnackbar({ open: true, message: err.message || 'Failed to delete activity.', severity: 'error' });
            }
        }
    };

    const handleOpenDocumentUploader = (requestId) => {
        setSelectedRequestId(requestId);
        setOpenDocumentUploader(true);
    };

    const handleCloseDocumentUploader = () => {
        setOpenDocumentUploader(false);
        setSelectedRequestId(null);
        fetchProjectDetails();
    };

    const canApplyTemplate = !!projectCategory && checkUserPrivilege(user, 'project.apply_template');
    const canReviewSubmissions = checkUserPrivilege(user, 'project_manager.review');

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!project) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Project not found or an unexpected error occurred.</Alert>
            </Box>
        );
    }

    const overallProgress = project?.overallProgress || 0;

    return (
        <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/projects')}
                >
                    Back to Projects
                </Button>
            </Box>

            {/* Consolidated Top Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            component="h1"
                            sx={{
                                fontWeight: 'bold',
                                color: theme.palette.primary.main,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flexShrink: 1,
                            }}
                        >
                            {project?.projectName || 'Project Name Missing'}
                        </Typography>
                        <Chip
                            label={project?.status || 'N/A'}
                            sx={{
                                backgroundColor: getProjectStatusBackgroundColor(project?.status),
                                color: getProjectStatusTextColor(project?.status),
                                fontWeight: 'bold',
                                flexShrink: 0
                            }}
                        />
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        {canReviewSubmissions && (
                            <Tooltip title="Review Contractor Submissions">
                                <IconButton color="success" onClick={handleOpenReviewPanel}>
                                    <PaidIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="View Project Monitoring">
                            <IconButton color="info" onClick={handleOpenMonitoringModal}>
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Manage Project Photos">
                            <IconButton color="secondary" onClick={handleManagePhotos}>
                                <PhotoCameraIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', flexShrink: 0 }}>
                        Overall Progress: {overallProgress.toFixed(2)}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={overallProgress}
                        sx={{ flexGrow: 1, height: 10, borderRadius: 5, bgcolor: theme.palette.grey[300] }}
                        color="primary"
                    />
                </Stack>
            </Paper>

            {/* Combined Overview Section with three columns and description moved */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
                <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InfoIcon sx={{ mr: 1 }} />
                    Project Overview
                </Typography>
                <Grid container spacing={4}>
                    {/* First Column: Key Information */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Key Information</Typography>
                        <Stack spacing={1}>
                            <Typography variant="body1"><strong>Project Category:</strong> {projectCategory?.categoryName || 'N/A'}</Typography>
                            <Typography variant="body1"><strong>Directorate:</strong> {project?.directorate || 'N/A'}</Typography>
                            <Typography variant="body1"><strong>Principal Investigator:</strong> {project?.principalInvestigator || 'N/A'}</Typography>
                            <Typography variant="body1"><strong>Status:</strong>
                                <Chip
                                    label={project?.status || 'N/A'}
                                    sx={{
                                        ml: 1,
                                        backgroundColor: getProjectStatusBackgroundColor(project?.status),
                                        color: getProjectStatusTextColor(project?.status),
                                        fontWeight: 'bold',
                                    }}
                                />
                            </Typography>
                        </Stack>
                    </Grid>
                    {/* Second Column: Financial Details */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Financial Details</Typography>
                        <Stack spacing={1}>
                            <Typography variant="body1"><strong>Start Date:</strong> {formatDate(project?.startDate)}</Typography>
                            <Typography variant="body1"><strong>End Date:</strong> {formatDate(project?.endDate)}</Typography>
                            <Typography variant="body1"><strong>Total Cost:</strong> {formatCurrency(project?.costOfProject)}</Typography>
                            <Typography variant="body1"><strong>Paid Out:</strong> {formatCurrency(project?.paidOut)}</Typography>
                        </Stack>
                    </Grid>
                    {/* Third Column: Accomplished Work */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Accomplished Work</Typography>
                        <Stack spacing={1}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                                {formatCurrency(paymentJustification.totalBudget)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Budget from Completed Activities
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<PaidIcon />}
                                    onClick={handleOpenPaymentRequest}
                                    disabled={paymentJustification.accomplishedActivities.length === 0}
                                    size="small"
                                >
                                    Request Payment
                                </Button>
                            </Box>
                        </Stack>
                    </Grid>
                    {/* Full-width row for Project Description */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Project Description</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}><strong>Objective:</strong> {project?.objective || 'N/A'}</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}><strong>Expected Output:</strong> {project?.expectedOutput || 'N/A'}</Typography>
                        <Typography variant="body1"><strong>Expected Outcome:</strong> {project?.expectedOutcome || 'N/A'}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Work Plans Section */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 'bold' }}>
                    <AccountTreeIcon sx={{ mr: 1 }} />
                    Work Plans
                </Typography>
                {loadingWorkPlans ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : projectWorkPlans.length === 0 ? (
                    <Alert severity="info">No work plans available for this project's subprogram.</Alert>
                ) : (
                    projectWorkPlans.map((workplan) => {
                        const activitiesForWorkplan = milestoneActivities.filter(a => String(a.workplanId) === String(workplan.workplanId));
                        const totalMappedBudget = activitiesForWorkplan.reduce((sum, activity) => sum + (parseFloat(activity.budgetAllocated) || 0), 0);
                        const remainingBudget = (parseFloat(workplan.totalBudget) || 0) - totalMappedBudget;

                        return (
                            <Accordion
                                key={workplan.workplanId}
                                expanded={expandedWorkPlan === workplan.workplanId}
                                onChange={handleAccordionChange(workplan.workplanId)}
                                sx={{ mb: 2, borderRadius: '12px', '&:before': { display: 'none' }, border: '1px solid', borderColor: theme.palette.grey[300] }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={`panel-${workplan.workplanId}-content`}
                                    id={`panel-${workplan.workplanId}-header`}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography variant="h6" sx={{ flexShrink: 0, fontWeight: 'bold' }}>
                                            {workplan.workplanName} ({workplan.financialYear})
                                        </Typography>
                                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            <Chip
                                                label={`Budget: ${formatCurrency(workplan.totalBudget)}`}
                                                color="primary"
                                                size="small"
                                                sx={{ mr: 1, mb: { xs: 1, sm: 0 } }}
                                            />
                                            <Chip
                                                label={`Utilized: ${formatCurrency(totalMappedBudget)}`}
                                                color="secondary"
                                                size="small"
                                                sx={{ mr: 1, mb: { xs: 1, sm: 0 } }}
                                            />
                                            <Chip
                                                label={`Remaining: ${formatCurrency(remainingBudget)}`}
                                                color={remainingBudget >= 0 ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                                        {workplan.workplanDescription || 'No description provided.'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Activities</Typography>
                                        {checkUserPrivilege(user, 'activity.create') && (
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                size="small"
                                                onClick={() => handleOpenCreateActivityDialog(workplan.workplanId, workplan.workplanName)}
                                            >
                                                Add Activity
                                            </Button>
                                        )}
                                    </Box>
                                    {activitiesForWorkplan.length > 0 ? (
                                        <List dense>
                                            {activitiesForWorkplan.map((activity) => (
                                                <ListItem
                                                    key={activity.activityId}
                                                    secondaryAction={
                                                        <Stack direction="row" spacing={1}>
                                                            {checkUserPrivilege(user, 'activity.update') && (
                                                                <Tooltip title="Edit Activity">
                                                                    <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); handleOpenEditActivityDialog(activity); }}><EditIcon /></IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {checkUserPrivilege(user, 'activity.delete') && (
                                                                <Tooltip title="Delete Activity">
                                                                    <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.activityId); }}><DeleteIcon /></IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Stack>
                                                    }
                                                >
                                                    <ListItemText
                                                        primary={activity.activityName}
                                                        secondary={`Budget: ${formatCurrency(activity.budgetAllocated)} | Status: ${activity.activityStatus.replace(/_/g, ' ')}`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">No activities have been added to this work plan yet.</Typography>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })
                )}
            </Box>

            {/* Milestones Section */}
            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" color="primary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                        <FlagIcon sx={{ mr: 1 }} />
                        Milestones
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        {canApplyTemplate && (
                            <Button
                                variant="contained"
                                startIcon={<UpdateIcon />}
                                onClick={handleApplyMilestoneTemplate}
                                disabled={applyingTemplate}
                            >
                                {applyingTemplate ? <CircularProgress size={24} /> : 'Apply Latest Milestones'}
                            </Button>
                        )}
                        {checkUserPrivilege(user, 'milestone.create') && !projectCategory && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenCreateMilestoneDialog}
                                sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' } }}
                            >
                                Add Milestone
                            </Button>
                        )}
                    </Stack>
                </Box>
                {milestones.length === 0 ? (
                    projectCategory?.categoryName ? (
                        <Alert severity="info">Milestones for this project are generated from the '{projectCategory.categoryName}' template. Please apply the template first.</Alert>
                    ) : (
                        <Alert severity="info">No milestones defined for this project.</Alert>
                    )
                ) : (
                    <Grid container spacing={3}>
                        {milestones.map((milestone) => (
                            <Grid item xs={12} md={6} key={milestone.milestoneId}>
                                <Paper elevation={3} sx={{ p: 0, borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            pb: 1.5,
                                            borderLeft: `5px solid ${theme.palette.primary.main}`,
                                            backgroundColor: theme.palette.action.hover,
                                            borderTopLeftRadius: '12px',
                                            borderTopRightRadius: '12px',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <FlagIcon color="primary" sx={{ mr: 1 }} />
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                                    {milestone.milestoneName || 'Unnamed Milestone'}
                                                </Typography>
                                            </Box>
                                            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                                                <Tooltip title="View Attachments">
                                                    <IconButton edge="end" aria-label="attachments" onClick={() => {
                                                        setMilestoneToViewAttachments(milestone);
                                                        setOpenAttachmentsModal(true);
                                                    }}><AttachmentIcon /></IconButton>
                                                </Tooltip>
                                                {checkUserPrivilege(user, 'milestone.update') && (
                                                    <Tooltip title="Edit Milestone">
                                                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditMilestoneDialog(milestone)}><EditIcon /></IconButton>
                                                    </Tooltip>
                                                )}
                                                {checkUserPrivilege(user, 'milestone.delete') && (
                                                    <Tooltip title="Delete Milestone">
                                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMilestone(milestone.milestoneId)}><DeleteIcon /></IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Box>

                                    <Box sx={{ p: 2, flexGrow: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {milestone.description || 'No description.'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Due Date: {formatDate(milestone.dueDate)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Progress: {milestone.progress}% (Weight: {milestone.weight})
                                        </Typography>
                                        <LinearProgress variant="determinate" value={milestone.progress || 0} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />

                                        <Box sx={{ mt: 2, pl: 1, borderLeft: '2px solid', borderColor: theme.palette.secondary.main }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Activities</Typography>
                                            {(milestoneActivities || []).filter(a => a.milestoneId === milestone.milestoneId).length > 0 ? (
                                                <List dense disablePadding>
                                                    {(milestoneActivities || []).filter(a => a.milestoneId === milestone.milestoneId).map(activity => (
                                                        <ListItem key={activity.activityId} disablePadding sx={{ py: 0.5, pr: 1 }}>
                                                            <ListItemText
                                                                primary={activity.activityName}
                                                                secondary={`Budget: ${formatCurrency(activity.budgetAllocated)} | Status: ${activity.activityStatus.replace(/_/g, ' ')}`}
                                                            />
                                                            <Stack direction="row" spacing={1}>
                                                                {checkUserPrivilege(user, 'activity.update') && (
                                                                    <Tooltip title="Edit Activity">
                                                                        <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); handleOpenEditActivityDialog(activity); }} size="small"><EditIcon fontSize="small" /></IconButton>
                                                                </Tooltip>
                                                                )}
                                                                {checkUserPrivilege(user, 'activity.delete') && (
                                                                    <Tooltip title="Delete Activity">
                                                                        <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.activityId); }} size="small"><DeleteIcon fontSize="small" /></IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Stack>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                                                    No activities linked to this milestone.
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Modals for Milestones and Monitoring */}
            <MilestoneAttachments
                open={openAttachmentsModal}
                onClose={() => setOpenAttachmentsModal(false)}
                milestoneId={milestoneToViewAttachments?.milestoneId}
                currentMilestoneName={milestoneToViewAttachments?.milestoneName}
                onUploadSuccess={fetchProjectDetails}
                projectId={projectId}
            />
            <ProjectMonitoringComponent
                open={openMonitoringModal}
                onClose={handleCloseMonitoringModal}
                projectId={projectId}
            />
            <ProjectManagerReviewPanel
                open={openReviewPanel}
                onClose={handleCloseReviewPanel}
                projectId={projectId}
                projectName={project?.projectName}
                paymentJustification={paymentJustification}
                handleOpenDocumentUploader={handleOpenDocumentUploader}
            />
            <AddEditMilestoneModal
                isOpen={openMilestoneDialog}
                onClose={handleCloseMilestoneDialog}
                editedMilestone={currentMilestone}
                projectId={projectId}
                onSave={handleMilestoneSubmit}
            />
            <AddEditActivityForm
                open={openActivityDialog}
                onClose={handleCloseActivityDialog}
                onSubmit={handleActivitySubmit}
                initialData={activityFormData}
                milestones={milestones}
                staff={staff}
                isEditing={!!currentActivity}
            />

            <PaymentRequestForm
                open={openPaymentModal}
                onClose={() => setOpenPaymentModal(false)}
                projectId={project?.projectId}
                projectName={project?.projectName}
                onSubmit={handlePaymentRequestSubmit}
                accomplishedActivities={paymentJustification.accomplishedActivities}
                totalJustifiedAmount={paymentJustification.totalBudget}
            />

            <PaymentRequestDocumentUploader
                open={openDocumentUploader}
                onClose={handleCloseDocumentUploader}
                requestId={selectedRequestId}
                projectId={projectId}
            />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ProjectDetailsPage;