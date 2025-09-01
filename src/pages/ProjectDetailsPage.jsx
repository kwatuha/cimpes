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

// Helper function to map milestone activity status to project status colors
const getMilestoneStatusColors = (status) => {
    const statusMapping = {
        'completed': 'Completed',
        'in_progress': 'In Progress',
        'not_started': 'Initiated',
        'stalled': 'Stalled',
        'delayed': 'Delayed',
        'cancelled': 'Cancelled'
    };
    
    const mappedStatus = statusMapping[status] || status;
    return {
        backgroundColor: getProjectStatusBackgroundColor(mappedStatus),
        textColor: getProjectStatusTextColor(mappedStatus)
    };
};
import { tokens } from "./dashboard/theme"; // Import tokens for color styling
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
    // Current location is Nairobi, Nairobi County, Kenya.
    // So the currency symbol is KES.
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

// NEW: Helper function for monitoring data formatting
const formatMonitoringDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        });
    } catch (e) {
        console.error('Invalid date string:', dateString);
        return 'Invalid Date';
    }
};

// NEW: Helper function for warning level colors
const getWarningColor = (level) => {
    switch (level) {
        case 'High':
            return 'error';
        case 'Medium':
            return 'warning';
        case 'Low':
            return 'info';
        default:
            return 'success';
    }
};



function ProjectDetailsPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, logout, authLoading } = useAuth();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode); // Initialize colors

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
    
    // NEW: State for Access Control
    const [isAccessAllowed, setIsAccessAllowed] = useState(false);
    const [accessLoading, setAccessLoading] = useState(true);
    const [accessError, setAccessError] = useState(null);

    // NEW: State for Project Monitoring
    const [monitoringRecords, setMonitoringRecords] = useState([]);
    const [loadingMonitoring, setLoadingMonitoring] = useState(false);
    const [monitoringError, setMonitoringError] = useState(null);
    const [editingMonitoringRecord, setEditingMonitoringRecord] = useState(null);

    // NEW: Helper function to get warning level colors from theme
    const getWarningLevelColors = (level) => {
        switch (level) {
            case 'High':
                return {
                    backgroundColor: colors.redAccent[500],
                    textColor: colors.grey[100]
                };
            case 'Medium':
                return {
                    backgroundColor: colors.redAccent[400],
                    textColor: colors.grey[100]
                };
            case 'Low':
                return {
                    backgroundColor: colors.blueAccent[500],
                    textColor: colors.grey[100]
                };
            default:
                return {
                    backgroundColor: colors.greenAccent[500],
                    textColor: colors.grey[100]
                };
        }
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedWorkPlan(isExpanded ? panel : false);
    };

    // NEW: Access Control Function
    const checkAccess = useCallback(async () => {
        setAccessLoading(true);
        setAccessError(null);

        // Wait for auth to finish loading
        if (authLoading) return;
        
        try {
            // Admins and privileged users can view any project
            if (checkUserPrivilege(user, 'project.read_all')) {
                setIsAccessAllowed(true);
            } else {
                // Contractors can only view their assigned projects
                if (user?.contractorId) {
                    const contractors = await apiService.projects.getContractors(projectId);
                    const isAssigned = contractors.some(c => c.contractorId === user.contractorId);
                    setIsAccessAllowed(isAssigned);
                    if (!isAssigned) {
                        setAccessError("You do not have access to this project.");
                    }
                } else {
                    // If not a privileged user or a contractor, deny access
                    setAccessError("You do not have the necessary privileges to view this project.");
                    setIsAccessAllowed(false);
                }
            }
        } catch (err) {
            console.error("Access check failed:", err);
            setAccessError("Failed to verify access to this project.");
            setIsAccessAllowed(false);
        } finally {
            setAccessLoading(false);
        }
    }, [projectId, user, authLoading]);

    // This effect runs the access check when auth state or projectId changes
    useEffect(() => {
        checkAccess();
    }, [checkAccess]);

    const fetchProjectDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // This is the main data fetching logic, which now only runs after access is granted
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

            // NEW: Fetch monitoring records
            await fetchMonitoringRecords();

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

    // NEW: Function to fetch monitoring records
    const fetchMonitoringRecords = useCallback(async () => {
        if (!checkUserPrivilege(user, 'project_monitoring.read')) return;
        
        setLoadingMonitoring(true);
        setMonitoringError(null);
        
        try {
            const response = await apiService.projectMonitoring.getRecordsByProject(projectId);
            setMonitoringRecords(response);
        } catch (err) {
            console.error('Error fetching monitoring records:', err);
            setMonitoringError('Failed to load monitoring records.');
        } finally {
            setLoadingMonitoring(false);
        }
    }, [projectId, user]);

    // This effect now conditionally fetches data based on the access check
    useEffect(() => {
        if (isAccessAllowed) {
            fetchProjectDetails();
        }
    }, [isAccessAllowed, fetchProjectDetails]);

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
        setEditingMonitoringRecord(null);
        // Refresh monitoring data when modal is closed
        fetchMonitoringRecords();
    };

    const handleEditMonitoringRecord = (record) => {
        setEditingMonitoringRecord(record);
        setOpenMonitoringModal(true);
    };

    const handleMonitoringEditComplete = () => {
        setEditingMonitoringRecord(null);
        fetchMonitoringRecords();
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
            workplanId: workplanId,
            milestoneIds: [],
            selectedWorkplanName: workplanName
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
    
    // UPDATED: New logic for canReviewSubmissions
    const canReviewSubmissions = checkUserPrivilege(user, 'project_manager.review') || (user?.contractorId && isAccessAllowed);

    // Manage Loading and Error States for both Access Control and Data Fetching
    if (authLoading || accessLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (accessError) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{accessError}</Alert>
            </Box>
        );
    }
    
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
                    <Box sx={{ 
                p: 2, 
                backgroundColor: colors.primary[400],
                minHeight: '100vh',
                background: theme.palette.mode === 'dark' 
                    ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                    : `linear-gradient(135deg, ${colors.grey[900]} 0%, ${colors.grey[800]} 100%)`,
                position: 'relative',
                '&::before': theme.palette.mode === 'light' ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 20% 80%, ${colors.blueAccent[100]}15 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${colors.greenAccent[100]}15 0%, transparent 50%)`,
                    pointerEvents: 'none'
                } : {}
            }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/projects')}
                    sx={{
                        borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                        color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[600],
                        '&:hover': {
                            borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[600],
                            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[100]
                        },
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.blueAccent[100]}40` : 'none'
                    }}
                >
                    Back to Projects
                </Button>
            </Box>

            {/* Consolidated Top Section */}
            <Paper elevation={8} sx={{ 
                p: 2.5, 
                mb: 3, 
                borderRadius: '12px',
                background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`
                    : `linear-gradient(135deg, ${colors.grey[900]} 0%, ${colors.grey[800]} 100%)`,
                border: `2px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[300]}`,
                boxShadow: theme.palette.mode === 'dark'
                    ? `0 6px 24px rgba(0, 0, 0, 0.25), 0 3px 12px rgba(0, 0, 0, 0.15)`
                    : `0 6px 24px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.04), 0 0 0 1px ${colors.blueAccent[100]}`
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 'bold',
                                color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[300],
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flexShrink: 1,
                                textShadow: theme.palette.mode === 'dark' ? '2px 2px 4px rgba(0, 0, 0, 0.3)' : 'none',
                                letterSpacing: '0.5px'
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
                    <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        flexShrink: 0,
                        color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400],
                        textShadow: theme.palette.mode === 'dark' ? '1px 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
                    }}>
                        Overall Progress: {overallProgress.toFixed(2)}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={overallProgress}
                        sx={{ 
                            flexGrow: 1, 
                            height: 12, 
                            borderRadius: 6, 
                            bgcolor: colors.grey[600],
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 6,
                                background: `linear-gradient(90deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`
                            }
                        }}
                    />
                </Stack>
            </Paper>

            {/* Combined Overview and Description Section */}
            <Paper elevation={6} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: '12px',
                background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                    : `linear-gradient(135deg, ${colors.grey[900]} 0%, ${colors.grey[800]} 100%)`,
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[200]}`,
                boxShadow: theme.palette.mode === 'dark'
                    ? `0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)`
                    : `0 4px 20px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03), 0 0 0 1px ${colors.blueAccent[50]}`
            }}>
                <Typography variant="h5" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                    fontWeight: 'bold',
                    textShadow: theme.palette.mode === 'dark' ? '1px 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                    borderBottom: `2px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                    pb: 1
                }}>
                    <InfoIcon sx={{ mr: 1, color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500] }} />
                    Project Overview
                </Typography>
                <Grid container spacing={4}>
                    {/* First Column: Key Information */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: '8px',
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[900],
                            border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[300]}`,
                            height: '100%',
                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.blueAccent[100]}40` : 'none'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 'bold', 
                                mb: 1.5,
                                color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                                textAlign: 'center',
                                borderBottom: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                                pb: 0.5
                            }}>
                                Key Information
                            </Typography>
                            <Stack spacing={1}>
                                <Typography variant="body1" sx={{ 
                                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400] 
                                }}>
                                    <strong style={{ color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400] }}>Project Category:</strong> {projectCategory?.categoryName || 'N/A'}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400] 
                                }}>
                                    <strong style={{ color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400] }}>Directorate:</strong> {project?.directorate || 'N/A'}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400] 
                                }}>
                                    <strong style={{ color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400] }}>Principal Investigator:</strong> {project?.principalInvestigator || 'N/A'}
                                </Typography>
                            </Stack>
                        </Box>
                    </Grid>
                    {/* Second Column: Financial Details */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: '8px',
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[900],
                            border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[300]}`,
                            height: '100%',
                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.blueAccent[100]}40` : 'none'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 'bold', 
                                mb: 1.5,
                                color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                                textAlign: 'center',
                                borderBottom: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                                pb: 0.5
                            }}>
                                Financial Details
                            </Typography>
                            <Stack spacing={1}>
                                <Typography variant="body1" sx={{ 
                                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400] 
                                }}>
                                    <strong style={{ color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400] }}>Start Date:</strong> {formatDate(project?.startDate)}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400] 
                                }}>
                                    <strong style={{ color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400] }}>End Date:</strong> {formatDate(project?.endDate)}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400] 
                                }}>
                                    <strong style={{ color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400] }}>Total Cost:</strong> {formatCurrency(project?.costOfProject)}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400] 
                                }}>
                                    <strong style={{ color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400] }}>Paid Out:</strong> {formatCurrency(project?.paidOut)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Grid>
                    {/* Third Column: Accomplished Work */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: '8px',
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[900],
                            border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[300]}`,
                            height: '100%',
                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.blueAccent[100]}40` : 'none'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 'bold', 
                                mb: 1.5,
                                color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                                textAlign: 'center',
                                borderBottom: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                                pb: 0.5
                            }}>
                                Accomplished Work
                            </Typography>
                            <Stack spacing={1} alignItems="center">
                                <Typography variant="h4" sx={{ 
                                    fontWeight: 'bold', 
                                    color: colors.greenAccent[500],
                                    textShadow: theme.palette.mode === 'dark' ? '1px 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
                                }}>
                                    {formatCurrency(paymentJustification.totalBudget)}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                    color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600],
                                    textAlign: 'center',
                                    mb: 2
                                }}>
                                    Total Budget from Completed Activities
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<PaidIcon />}
                                    onClick={handleOpenPaymentRequest}
                                    disabled={paymentJustification.accomplishedActivities.length === 0}
                                    size="medium"
                                    sx={{
                                        backgroundColor: colors.greenAccent[600],
                                        color: colors.grey[100],
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        px: 3,
                                        '&:hover': {
                                            backgroundColor: colors.greenAccent[700]
                                        }
                                    }}
                                >
                                    Request Payment
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>
                    {/* Full-width row for Project Description */}
                    <Grid item xs={12}>
                        <Box sx={{
                            p: 2,
                            borderRadius: '8px',
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[900],
                            border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[300]}`,
                            mt: 2,
                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.blueAccent[100]}40` : 'none'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 'bold', 
                                mb: 1.5,
                                color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                                textAlign: 'center',
                                borderBottom: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                                pb: 0.5
                            }}>
                                Project Description
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="body1" sx={{ 
                                        mb: 1,
                                        fontWeight: 'bold',
                                        color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[600]
                                    }}>
                                        Objective:
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                        color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400],
                                        pl: 2,
                                        borderLeft: `3px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                                        py: 1
                                    }}>
                                        {project?.objective || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body1" sx={{ 
                                        mb: 1,
                                        fontWeight: 'bold',
                                        color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                                    }}>
                                        Expected Output:
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                        color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400],
                                        pl: 2,
                                        borderLeft: `3px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                                        py: 1
                                    }}>
                                        {project?.expectedOutput || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body1" sx={{ 
                                        mb: 1,
                                        fontWeight: 'bold',
                                        color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                                    }}>
                                        Expected Outcome:
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                        color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[400],
                                        pl: 2,
                                        borderLeft: `3px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                                        py: 1
                                    }}>
                                        {project?.expectedOutcome || 'N/A'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Work Plans and Milestones Section (Refactored) */}
            <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontWeight: 'bold',
                        color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                        textShadow: theme.palette.mode === 'dark' ? '1px 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                        borderBottom: `2px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                        pb: 1
                    }}>
                        <AccountTreeIcon sx={{ mr: 1, color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500] }} />
                        Work Plans & Milestones
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
                        {checkUserPrivilege(user, 'activity.create') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenCreateActivityDialog(null, null)}
                                sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' } }}
                            >
                                Add Activity
                            </Button>
                        )}
                    </Stack>
                </Box>
                {loadingWorkPlans ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : projectWorkPlans.length === 0 ? (
                    <Alert severity="info">No work plans available for this project's subprogram.</Alert>
                ) : (
                    projectWorkPlans.map((workplan) => {
                        const activitiesForWorkplan = milestoneActivities.filter(a => String(a.workplanId) === String(workplan.workplanId));
                        const milestoneIdsForWorkplan = new Set(activitiesForWorkplan.map(a => a.milestoneId));
                        const milestonesForWorkplan = milestones.filter(m => milestoneIdsForWorkplan.has(m.milestoneId));
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

                                    {/* Milestones and Activities for this Workplan */}
                                    <Box sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 'bold',
                                                color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[600],
                                                display: 'flex',
                                                alignItems: 'center',
                                                '&::before': {
                                                    content: '""',
                                                    width: '4px',
                                                    height: '24px',
                                                    backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                                                    borderRadius: '2px',
                                                    marginRight: '12px'
                                                }
                                            }}>
                                                Milestones
                                            </Typography>
                                            {checkUserPrivilege(user, 'milestone.create') && !projectCategory && (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<AddIcon />}
                                                    onClick={handleOpenCreateMilestoneDialog}
                                                    size="small"
                                                    sx={{ 
                                                        backgroundColor: colors.greenAccent[600],
                                                        color: colors.grey[100],
                                                        fontWeight: 'bold',
                                                        borderRadius: '8px',
                                                        px: 2,
                                                        py: 0.75,
                                                        boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.greenAccent[100]}40` : 'none',
                                                        '&:hover': { 
                                                            backgroundColor: colors.greenAccent[700],
                                                            transform: 'translateY(-1px)',
                                                            boxShadow: theme.palette.mode === 'light' ? `0 4px 12px ${colors.greenAccent[100]}50` : 'none'
                                                        },
                                                        transition: 'all 0.2s ease-in-out'
                                                    }}
                                                >
                                                    Add Milestone
                                                </Button>
                                            )}
                                        </Box>

                                        {milestonesForWorkplan.length === 0 ? (
                                            <Box sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[100],
                                                borderRadius: '12px',
                                                border: `2px dashed ${theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[300]}`,
                                                color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]
                                            }}>
                                                <Typography variant="h6" sx={{ 
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700]
                                                }}>
                                                    No Milestones Yet
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600],
                                                    fontStyle: 'italic'
                                                }}>
                                                    No milestones have been linked to this work plan yet.
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Grid container spacing={3}>
                                                {milestonesForWorkplan.map((milestone) => {
                                                    const activitiesForMilestone = activitiesForWorkplan.filter(a => a.milestoneId === milestone.milestoneId);
                                                    return (
                                                        <Grid item xs={12} md={6} key={milestone.milestoneId}>
                                                            <Paper elevation={3} sx={{ 
                                                                p: 0, 
                                                                borderRadius: '12px', 
                                                                height: '100%', 
                                                                display: 'flex', 
                                                                flexDirection: 'column',
                                                                border: theme.palette.mode === 'light' ? `1px solid ${colors.blueAccent[200]}` : 'none',
                                                                boxShadow: theme.palette.mode === 'light' ? `0 4px 16px ${colors.blueAccent[100]}40, 0 2px 8px ${colors.blueAccent[100]}20` : undefined,
                                                                transition: 'all 0.2s ease-in-out',
                                                                '&:hover': {
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: theme.palette.mode === 'light' ? `0 8px 24px ${colors.blueAccent[100]}50, 0 4px 12px ${colors.blueAccent[100]}30` : undefined
                                                                }
                                                            }}>
                                                                <Box
                                                                    sx={{
                                                                        p: 2,
                                                                        pb: 1.5,
                                                                        borderLeft: `5px solid ${theme.palette.mode === 'dark' ? theme.palette.primary.main : colors.blueAccent[500]}`,
                                                                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.hover : colors.blueAccent[100],
                                                                        borderTopLeftRadius: '12px',
                                                                        borderTopRightRadius: '12px',
                                                                        boxShadow: theme.palette.mode === 'light' ? `inset 0 1px 0 ${colors.blueAccent[200]}` : 'none'
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                            <FlagIcon sx={{ 
                                                                                mr: 1,
                                                                                color: theme.palette.mode === 'dark' ? theme.palette.primary.main : colors.blueAccent[500],
                                                                                fontSize: '1.5rem'
                                                                            }} />
                                                                            <Typography variant="h6" sx={{ 
                                                                                fontWeight: 'bold', 
                                                                                color: theme.palette.mode === 'dark' ? theme.palette.primary.main : colors.blueAccent[600]
                                                                            }}>
                                                                                {milestone.milestoneName || 'Unnamed Milestone'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                                                                            <Tooltip title="View Attachments">
                                                                                <IconButton 
                                                                                    edge="end" 
                                                                                    aria-label="attachments" 
                                                                                    onClick={() => {
                                                                                        setMilestoneToViewAttachments(milestone);
                                                                                        setOpenAttachmentsModal(true);
                                                                                    }}
                                                                                    sx={{
                                                                                        color: theme.palette.mode === 'dark' ? colors.blueAccent[400] : colors.blueAccent[600],
                                                                                        '&:hover': {
                                                                                            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[100],
                                                                                            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.blueAccent[700]
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <AttachmentIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            {checkUserPrivilege(user, 'milestone.update') && (
                                                                                <Tooltip title="Edit Milestone">
                                                                                    <IconButton 
                                                                                        edge="end" 
                                                                                        aria-label="edit" 
                                                                                        onClick={() => handleOpenEditMilestoneDialog(milestone)}
                                                                                        sx={{
                                                                                            color: theme.palette.mode === 'dark' ? colors.greenAccent[400] : colors.greenAccent[600],
                                                                                            '&:hover': {
                                                                                                backgroundColor: theme.palette.mode === 'dark' ? colors.greenAccent[700] : colors.greenAccent[100],
                                                                                                color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.greenAccent[700]
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <EditIcon />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            )}
                                                                            {checkUserPrivilege(user, 'milestone.delete') && (
                                                                                <Tooltip title="Delete Milestone">
                                                                                    <IconButton 
                                                                                        edge="end" 
                                                                                        aria-label="delete" 
                                                                                        onClick={() => handleDeleteMilestone(milestone.milestoneId)}
                                                                                        sx={{
                                                                                            color: theme.palette.mode === 'dark' ? colors.redAccent[400] : colors.redAccent[600],
                                                                                            '&:hover': {
                                                                                                backgroundColor: theme.palette.mode === 'dark' ? colors.redAccent[700] : colors.redAccent[100],
                                                                                                color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.redAccent[700]
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <DeleteIcon />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            )}
                                                                        </Stack>
                                                                    </Box>
                                                                </Box>

                                                                <Box sx={{ p: 2, flexGrow: 1 }}>
                                                                    <Typography variant="body2" sx={{ 
                                                                        mb: 1,
                                                                        color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.grey[600],
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {milestone.description || 'No description.'}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ 
                                                                        color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.grey[600],
                                                                        fontWeight: 500
                                                                    }}>
                                                                        Due Date: {formatDate(milestone.dueDate)}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ 
                                                                        mt: 1,
                                                                        color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.grey[600],
                                                                        fontWeight: 500
                                                                    }}>
                                                                        Progress: {milestone.progress}% (Weight: {milestone.weight})
                                                                    </Typography>
                                                                    <LinearProgress variant="determinate" value={milestone.progress || 0} sx={{ 
                                                                        height: 8, 
                                                                        borderRadius: 4, 
                                                                        mt: 1,
                                                                        bgcolor: theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300],
                                                                        '& .MuiLinearProgress-bar': {
                                                                            borderRadius: 4,
                                                                            background: `linear-gradient(90deg, ${colors.blueAccent[500]} 0%, ${colors.blueAccent[600]} 100%)`
                                                                        }
                                                                    }} />

                                                                    <Box sx={{ 
                                                                        mt: 2.5, 
                                                                        pl: 2, 
                                                                        borderLeft: '4px solid', 
                                                                        borderColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : colors.greenAccent[500],
                                                                        backgroundColor: theme.palette.mode === 'light' ? colors.greenAccent[50] : 'transparent',
                                                                        borderRadius: '0 12px 12px 0',
                                                                        p: 2,
                                                                        boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.greenAccent[100]}30` : 'none',
                                                                        position: 'relative',
                                                                        '&::before': {
                                                                            content: '""',
                                                                            position: 'absolute',
                                                                            top: '50%',
                                                                            left: '-8px',
                                                                            transform: 'translateY(-50%)',
                                                                            width: '12px',
                                                                            height: '12px',
                                                                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : colors.greenAccent[500],
                                                                            borderRadius: '50%',
                                                                            border: `2px solid ${theme.palette.mode === 'light' ? colors.grey[100] : colors.primary[600]}`
                                                                        }
                                                                    }}>
                                                                        <Typography variant="subtitle2" sx={{ 
                                                                            fontWeight: 'bold', 
                                                                            mb: 2,
                                                                            color: theme.palette.mode === 'dark' ? 'inherit' : colors.greenAccent[700],
                                                                            fontSize: '1rem',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            '&::after': {
                                                                                content: '""',
                                                                                flex: 1,
                                                                                height: '1px',
                                                                                backgroundColor: theme.palette.mode === 'dark' ? colors.grey[600] : colors.greenAccent[200],
                                                                                ml: 2
                                                                            }
                                                                        }}>Activities</Typography>
                                                                        {activitiesForMilestone.length > 0 ? (
                                                                            <List dense disablePadding>
                                                                                {activitiesForMilestone.map(activity => (
                                                                                    <ListItem key={activity.activityId} disablePadding sx={{ 
                                                                                        py: 1, 
                                                                                        pr: 1.5,
                                                                                        pl: 1.5,
                                                                                        borderRadius: '8px',
                                                                                        mb: 0.75,
                                                                                        backgroundColor: theme.palette.mode === 'light' ? colors.grey[50] : 'transparent',
                                                                                        border: theme.palette.mode === 'light' ? `1px solid ${colors.grey[200]}` : 'none',
                                                                                        boxShadow: theme.palette.mode === 'light' ? `0 1px 3px ${colors.grey[200]}40` : 'none',
                                                                                        '&:hover': {
                                                                            backgroundColor: theme.palette.mode === 'light' ? colors.grey[100] : colors.grey[800],
                                                                            borderColor: theme.palette.mode === 'light' ? colors.grey[300] : 'transparent',
                                                                            boxShadow: theme.palette.mode === 'light' ? `0 2px 6px ${colors.grey[200]}60` : 'none',
                                                                            transform: 'translateY(-1px)'
                                                                        },
                                                                        transition: 'all 0.2s ease-in-out'
                                                                    }}>
                                                                                        <ListItemText
                                                                                            primary={
                                                                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                                                                    <Typography variant="body2" sx={{ 
                                                                                                        fontWeight: 700,
                                                                                                        color: theme.palette.mode === 'dark' ? 'inherit' : colors.grey[800],
                                                                                                        fontSize: '0.9rem',
                                                                                                        flex: 1
                                                                                                    }}>
                                                                                                        {activity.activityName}
                                                                                                    </Typography>
                                                                                                    <Box sx={{
                                                                                                        width: '8px',
                                                                                                        height: '8px',
                                                                                                        borderRadius: '50%',
                                                                                                        backgroundColor: getMilestoneStatusColors(activity.activityStatus).backgroundColor,
                                                                                                        border: `2px solid ${theme.palette.mode === 'light' ? colors.grey[100] : colors.primary[600]}`,
                                                                                                        ml: 1
                                                                    }} />
                                                                                                </Box>
                                                                                            }
                                                                                            secondary={
                                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                                                    <Typography variant="caption" sx={{ 
                                                                                                        color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600],
                                                                                                        fontWeight: 500,
                                                                                                        fontSize: '0.75rem'
                                                                                                    }}>
                                                                                                        Budget: {formatCurrency(activity.budgetAllocated)}
                                                                                                    </Typography>
                                                                                                    <Typography variant="caption" sx={{ 
                                                                                                        color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[700],
                                                                                                        fontWeight: 600,
                                                                                                        fontSize: '0.75rem',
                                                                                                        textTransform: 'capitalize',
                                                                                                        display: 'flex',
                                                                                                        alignItems: 'center',
                                                                                                        gap: 0.5
                                                                                                    }}>
                                                                                                        Status: 
                                                                                                        <Box component="span" sx={{
                                                                                                            px: 1,
                                                                                                            py: 0.25,
                                                                                                            borderRadius: '4px',
                                                                                                            fontSize: '0.7rem',
                                                                                                            fontWeight: 'bold',
                                                                                                            backgroundColor: getMilestoneStatusColors(activity.activityStatus).backgroundColor,
                                                                                                            color: getMilestoneStatusColors(activity.activityStatus).textColor,
                                                                                                            border: `1px solid ${getMilestoneStatusColors(activity.activityStatus).backgroundColor}`,
                                                                                                            textTransform: 'capitalize'
                                                                                                        }}>
                                                                                                            {activity.activityStatus.replace(/_/g, ' ')}
                                                                                                        </Box>
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            }
                                                                                        />
                                                                                        <Stack direction="row" spacing={1}>
                                                                                            {checkUserPrivilege(user, 'activity.update') && (
                                                                                                <Tooltip title="Edit Activity">
                                                                                                    <IconButton 
                                                                                                        edge="end" 
                                                                                                        aria-label="edit" 
                                                                                                        onClick={(e) => { e.stopPropagation(); handleOpenEditActivityDialog(activity); }} 
                                                                                                        size="small"
                                                                                                        sx={{
                                                                                                            color: theme.palette.mode === 'dark' ? colors.greenAccent[400] : colors.greenAccent[600],
                                                                                                            '&:hover': {
                                                                                                                backgroundColor: theme.palette.mode === 'dark' ? colors.greenAccent[700] : colors.greenAccent[100],
                                                                                                                color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.greenAccent[700]
                                                                                                            }
                                                                                                        }}
                                                                                                    >
                                                                                        <EditIcon fontSize="small" />
                                                                                                    </IconButton>
                                                                                            </Tooltip>
                                                                                            )}
                                                                                            {checkUserPrivilege(user, 'activity.delete') && (
                                                                                                <Tooltip title="Delete Activity">
                                                                                                    <IconButton 
                                                                                                        edge="end" 
                                                                                                        aria-label="delete" 
                                                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.activityId); }} 
                                                                                                        size="small"
                                                                                                        sx={{
                                                                                                            color: theme.palette.mode === 'dark' ? colors.redAccent[400] : colors.redAccent[600],
                                                                                                            '&:hover': {
                                                                                                backgroundColor: theme.palette.mode === 'dark' ? colors.redAccent[700] : colors.redAccent[100],
                                                                                                color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.redAccent[700]
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <DeleteIcon fontSize="small" />
                                                                                                    </IconButton>
                                                                                            </Tooltip>
                                                                                            )}
                                                                                        </Stack>
                                                                                    </ListItem>
                                                                                ))}
                                                                            </List>
                                                                        ) : (
                                                                            <Typography variant="body2" sx={{ 
                                                                                fontStyle: 'italic', 
                                                                                mt: 1,
                                                                                color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.grey[500],
                                                                                textAlign: 'center',
                                                                                py: 1
                                                                            }}>
                                                                                No activities linked to this milestone.
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Paper>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        )}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })
                )}
            </Box>

            {/* NEW: Project Monitoring & Observations Section */}
            <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontWeight: 'bold',
                        color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500],
                        textShadow: theme.palette.mode === 'dark' ? '1px 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                        borderBottom: `2px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[400]}`,
                        pb: 1
                    }}>
                        <AssessmentIcon sx={{ mr: 1, color: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[500] }} />
                        Project Monitoring & Observations
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        {checkUserPrivilege(user, 'project_monitoring.create') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenMonitoringModal(true)}
                                sx={{ 
                                    backgroundColor: colors.greenAccent[600],
                                    color: colors.grey[100],
                                    fontWeight: 'bold',
                                    borderRadius: '8px',
                                    px: 2,
                                    py: 0.75,
                                    boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.greenAccent[100]}40` : 'none',
                                    '&:hover': { 
                                        backgroundColor: colors.greenAccent[700],
                                        transform: 'translateY(-1px)',
                                        boxShadow: theme.palette.mode === 'light' ? `0 4px 12px ${colors.greenAccent[100]}50` : 'none'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                Add Observation
                            </Button>
                        )}
                    </Stack>
                </Box>

                {/* Monitoring Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            borderRadius: '12px',
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50],
                            border: `1px solid ${theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[200]}`,
                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.grey[200]}40` : 'none'
                        }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[600]
                            }}>
                                {monitoringRecords.length}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.grey[600],
                                fontWeight: 500
                            }}>
                                Total Observations
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            borderRadius: '12px',
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50],
                            border: `1px solid ${theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[200]}`,
                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.grey[200]}40` : 'none'
                        }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: theme.palette.mode === 'dark' ? colors.redAccent[500] : colors.redAccent[600]
                            }}>
                                {monitoringRecords.filter(r => r.warningLevel === 'High').length}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.grey[600],
                                fontWeight: 500
                            }}>
                                High Priority
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            borderRadius: '12px',
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50],
                            border: `1px solid ${theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[200]}`,
                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.grey[200]}40` : 'none'
                        }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: theme.palette.mode === 'dark' ? colors.redAccent[400] : colors.redAccent[500]
                            }}>
                                {monitoringRecords.filter(r => r.warningLevel === 'Medium').length}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.grey[600],
                                fontWeight: 500
                            }}>
                                Medium Priority
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            borderRadius: '12px',
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50],
                            border: `1px solid ${theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[200]}`,
                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.grey[200]}40` : 'none'
                        }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                color: theme.palette.mode === 'dark' ? colors.greenAccent[500] : colors.greenAccent[600]
                            }}>
                                {monitoringRecords.filter(r => r.warningLevel === 'None').length}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.grey[600],
                                fontWeight: 500
                            }}>
                                Routine
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Recent Observations List */}
                {loadingMonitoring ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : monitoringError ? (
                    <Alert severity="error" sx={{ 
                        borderRadius: '8px',
                        '& .MuiAlert-icon': {
                            color: theme.palette.mode === 'dark' ? undefined : colors.redAccent[600]
                        }
                    }}>
                        {monitoringError}
                    </Alert>
                ) : monitoringRecords.length === 0 ? (
                    <Paper sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        borderRadius: '12px',
                        backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50],
                        border: `2px dashed ${theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[300]}`,
                        color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]
                    }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 'bold',
                            mb: 1,
                            color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]
                        }}>
                            No Monitoring Records Yet
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[500],
                            mb: 2
                        }}>
                            Start monitoring this project by adding your first observation.
                        </Typography>
                        {checkUserPrivilege(user, 'project_monitoring.create') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenMonitoringModal(true)}
                                sx={{ 
                                    backgroundColor: colors.greenAccent[600],
                                    '&:hover': { backgroundColor: colors.greenAccent[700] }
                                }}
                            >
                                Add First Observation
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <Paper sx={{ 
                        borderRadius: '16px',
                        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : colors.grey[50],
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : colors.grey[200]}`,
                        boxShadow: theme.palette.mode === 'light' ? `0 4px 16px ${colors.grey[200]}30` : 'none',
                        overflow: 'hidden'
                    }}>
                        {/* Enhanced Header */}
                        <Box sx={{ 
                            p: 3, 
                            borderBottom: `2px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[200]}`,
                            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[900] : colors.blueAccent[50],
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400]
                            }
                        }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[400],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.blueAccent[100]}40` : 'none'
                                }}>
                                    <AssessmentIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.mode === 'dark' ? colors.blueAccent[400] : colors.blueAccent[700],
                                        mb: 0.5
                                    }}>
                                        Recent Observations
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600],
                                        fontSize: '0.875rem'
                                    }}>
                                        Latest monitoring records and project insights
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                        <List sx={{ p: 0 }}>
                            {monitoringRecords.slice(0, 5).map((record, index) => (
                                <ListItem
                                    key={record.recordId}
                                    sx={{
                                        p: 3,
                                        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : colors.grey[50],
                                        borderBottom: index < Math.min(5, monitoringRecords.length) - 1 ? 
                                            `1px solid ${theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[200]}` : 'none',
                                        '&:hover': {
                                            backgroundColor: theme.palette.mode === 'dark' ? colors.grey[800] : colors.grey[100],
                                            transform: 'translateY(-1px)',
                                            boxShadow: theme.palette.mode === 'light' ? `0 4px 12px ${colors.grey[200]}30` : 'none',
                                            transition: 'all 0.2s ease-in-out'
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                >
                                    <Box sx={{ flex: 1, mr: 2 }}>
                                        {/* Enhanced Header Row */}
                                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                            <Box sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                backgroundColor: getWarningLevelColors(record.warningLevel).backgroundColor,
                                                border: `2px solid ${theme.palette.mode === 'dark' ? colors.grey[800] : colors.grey[100]}`,
                                                boxShadow: theme.palette.mode === 'light' ? `0 2px 4px ${getWarningLevelColors(record.warningLevel).backgroundColor}40` : 'none'
                                            }} />
                                            <Typography variant="subtitle1" sx={{ 
                                                fontWeight: 'bold',
                                                color: theme.palette.mode === 'dark' ? 'text.primary' : colors.grey[800],
                                                fontSize: '1.1rem'
                                            }}>
                                                {record.warningLevel === 'None' ? 'Routine Observation' : `Warning: ${record.warningLevel}`}
                                            </Typography>
                                            <Chip 
                                                label={record.warningLevel === 'None' ? 'Routine' : record.warningLevel}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getWarningLevelColors(record.warningLevel).backgroundColor,
                                                    color: getWarningLevelColors(record.warningLevel).textColor,
                                                    fontWeight: 'bold',
                                                    fontSize: '0.7rem',
                                                    height: '20px'
                                                }}
                                            />
                                        </Stack>

                                        {/* Enhanced Content */}
                                        <Box sx={{ pl: 2 }}>
                                            <Typography variant="body2" sx={{ 
                                                color: theme.palette.mode === 'dark' ? 'text.secondary' : colors.grey[700],
                                                mb: 2,
                                                lineHeight: 1.6,
                                                fontSize: '0.9rem'
                                            }}>
                                                <Box component="span" sx={{ 
                                                    fontWeight: 'bold',
                                                    color: theme.palette.mode === 'dark' ? colors.blueAccent[400] : colors.blueAccent[600],
                                                    mr: 1
                                                }}>
                                                    Observation:
                                                </Box>
                                                {record.comment}
                                            </Typography>

                                            {record.recommendations && (
                                                <Typography variant="body2" sx={{ 
                                                    color: theme.palette.mode === 'dark' ? 'text.primary' : colors.grey[700],
                                                    mb: 2,
                                                    lineHeight: 1.6,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    <Box component="span" sx={{ 
                                                        fontWeight: 'bold',
                                                        color: theme.palette.mode === 'dark' ? colors.greenAccent[500] : colors.greenAccent[600],
                                                        mr: 1
                                                    }}>
                                                        Recommendations:
                                                    </Box>
                                                    {record.recommendations}
                                                </Typography>
                                            )}

                                            {record.challenges && (
                                                <Typography variant="body2" sx={{ 
                                                    color: theme.palette.mode === 'dark' ? 'text.error' : colors.redAccent[600],
                                                    mb: 2,
                                                    lineHeight: 1.6,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    <Box component="span" sx={{ 
                                                        fontWeight: 'bold',
                                                        color: theme.palette.mode === 'dark' ? colors.redAccent[400] : colors.redAccent[500],
                                                        mr: 1
                                                    }}>
                                                        Challenges:
                                                    </Box>
                                                    {record.challenges}
                                                </Typography>
                                            )}

                                            {/* Enhanced Timestamp */}
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 1,
                                                mt: 2,
                                                pt: 2,
                                                borderTop: `1px solid ${theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[200]}`
                                            }}>
                                                <Typography variant="caption" sx={{ 
                                                    color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[500],
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}>
                                                    📅 Recorded on: {formatMonitoringDate(record.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    {/* Enhanced Action Buttons */}
                                    <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                                        {checkUserPrivilege(user, 'project_monitoring.update') && (
                                            <Tooltip title="Edit Record">
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleEditMonitoringRecord(record)}
                                                    sx={{
                                                        color: theme.palette.mode === 'dark' ? colors.blueAccent[400] : colors.blueAccent[600],
                                                        backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[900] : colors.blueAccent[50],
                                                        border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[200]}`,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[100],
                                                            transform: 'scale(1.05)',
                                                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.blueAccent[100]}40` : 'none'
                                                        },
                                                        transition: 'all 0.2s ease-in-out'
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {checkUserPrivilege(user, 'project_monitoring.delete') && (
                                            <Tooltip title="Delete Record">
                                                <IconButton 
                                                    size="small"
                                                    sx={{
                                                        color: theme.palette.mode === 'dark' ? colors.redAccent[400] : colors.redAccent[600],
                                                        backgroundColor: theme.palette.mode === 'dark' ? colors.redAccent[900] : colors.redAccent[50],
                                                        border: `1px solid ${theme.palette.mode === 'dark' ? colors.redAccent[600] : colors.redAccent[200]}`,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.mode === 'dark' ? colors.redAccent[700] : colors.redAccent[100],
                                                            transform: 'scale(1.05)',
                                                            boxShadow: theme.palette.mode === 'light' ? `0 2px 8px ${colors.redAccent[100]}40` : 'none'
                                                        },
                                                        transition: 'all 0.2s ease-in-out'
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>

                        {/* Enhanced Footer */}
                        {monitoringRecords.length > 5 && (
                            <Box sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                borderTop: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : colors.grey[200]}`,
                                backgroundColor: theme.palette.mode === 'dark' ? colors.grey[800] : colors.grey[100]
                            }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setOpenMonitoringModal(true)}
                                    startIcon={<AssessmentIcon />}
                                    sx={{
                                        borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[400],
                                        color: theme.palette.mode === 'dark' ? colors.blueAccent[500] : colors.blueAccent[600],
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        px: 3,
                                        py: 1,
                                        '&:hover': {
                                            borderColor: theme.palette.mode === 'dark' ? colors.blueAccent[600] : colors.blueAccent[500],
                                            backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[100],
                                            transform: 'translateY(-1px)',
                                            boxShadow: theme.palette.mode === 'light' ? `0 4px 12px ${colors.blueAccent[100]}50` : 'none'
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                >
                                    View All Observations ({monitoringRecords.length})
                                </Button>
                            </Box>
                        )}
                    </Paper>
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
                editRecord={editingMonitoringRecord}
                onEditComplete={handleMonitoringEditComplete}
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